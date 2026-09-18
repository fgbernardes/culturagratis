/**
 * Ponte entre o estado do editor e o armazém de imagens.
 *
 * Percorre o estado em profundidade em vez de listar campo a campo. As
 * imagens aparecem em sítios diferentes — `slides[].photo.src`,
 * `slides[].backgroundImage`, `elements[].src`, `canvasSettings.backgroundImage`,
 * `brandLogo.src`, e dentro de cada `customPresets[]` — e listá-los à mão
 * garantia que um campo novo passasse despercebido e voltasse a encher a quota.
 */

import { useStore } from '../store/useStore';
import {
  ASSET_PREFIX,
  inlineAsset,
  isAssetRef,
  isDataUrl,
  pruneUnusedAssets,
  storeAsset,
} from './assetStore';

/**
 * Os stickers ficam como estão.
 *
 * São SVG embutidos, minúsculos, e o `getColoredSvgUri` precisa de ler o
 * texto do SVG para o recolorir. Transformá-los em blobs partia essa função
 * sem poupar espaço nenhum.
 */
const shouldMigrate = (value: unknown): value is string =>
  typeof value === 'string' && isDataUrl(value) && !value.startsWith('data:image/svg+xml');

type Json = unknown;

/** Aplica `transform` a todas as strings de imagem encontradas na árvore. */
const deepTransform = async (
  value: Json,
  transform: (dataUrl: string) => Promise<string>
): Promise<Json> => {
  if (shouldMigrate(value)) return await transform(value);
  if (Array.isArray(value)) {
    return await Promise.all(value.map((item) => deepTransform(item, transform)));
  }
  if (value && typeof value === 'object') {
    const entries = await Promise.all(
      Object.entries(value as Record<string, Json>).map(
        async ([key, val]) => [key, await deepTransform(val, transform)] as const
      )
    );
    return Object.fromEntries(entries);
  }
  return value;
};

/** Recolhe todas as referências a assets presentes na árvore. */
const deepCollect = (value: Json, found: Set<string>): void => {
  if (typeof value === 'string') {
    if (isAssetRef(value)) found.add(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => deepCollect(item, found));
    return;
  }
  if (value && typeof value === 'object') {
    Object.values(value as Record<string, Json>).forEach((val) => deepCollect(val, found));
  }
};

/** As fatias do estado que podem conter imagens. */
const imageBearingSlice = () => {
  const { slides, elements, canvasSettings, brandLogo, customPresets } = useStore.getState();
  return { slides, elements, canvasSettings, brandLogo, customPresets };
};

/**
 * Move para IndexedDB qualquer imagem que ainda esteja embutida em base64 no
 * estado — projetos criados antes desta mudança. Corre uma vez no arranque.
 */
export const migrateLegacyDataUrls = async (): Promise<void> => {
  const slice = imageBearingSlice();

  let found = false;
  const detector = async (dataUrl: string) => {
    found = true;
    return dataUrl;
  };
  await deepTransform(slice, detector);
  if (!found) return;

  const migrated = (await deepTransform(slice, (dataUrl) => storeAsset(dataUrl))) as ReturnType<
    typeof imageBearingSlice
  >;

  useStore.setState(migrated);
  console.info('Imagens do projeto movidas do localStorage para IndexedDB.');
};

/**
 * Apaga de IndexedDB as imagens que já nenhum slide, elemento ou preset usa.
 * Sem esta limpeza, cada fotografia substituída ficava lá para sempre.
 */
export const pruneOrphanAssets = async (): Promise<void> => {
  const found = new Set<string>();
  deepCollect(imageBearingSlice(), found);
  await pruneUnusedAssets(found);
};

/** Substitui referências por data URLs, para presets exportados serem portáveis. */
export const inlineAssetsForExport = async (value: Json): Promise<Json> => {
  const walk = async (node: Json): Promise<Json> => {
    if (typeof node === 'string' && node.startsWith(ASSET_PREFIX)) {
      return (await inlineAsset(node)) ?? node;
    }
    if (Array.isArray(node)) return await Promise.all(node.map(walk));
    if (node && typeof node === 'object') {
      const entries = await Promise.all(
        Object.entries(node as Record<string, Json>).map(
          async ([key, val]) => [key, await walk(val)] as const
        )
      );
      return Object.fromEntries(entries);
    }
    return node;
  };

  return await walk(value);
};

/** Move para IndexedDB as imagens de um preset acabado de importar. */
export const storeAssetsFromImport = async (value: Json): Promise<Json> =>
  await deepTransform(value, (dataUrl) => storeAsset(dataUrl));
