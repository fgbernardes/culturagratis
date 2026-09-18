/**
 * Armazém de imagens em IndexedDB.
 *
 * O estado do editor guarda apenas referências curtas (`cgl-asset:<id>`);
 * os bytes das fotografias vivem em IndexedDB, que não tem a quota apertada
 * de ~5 MB do localStorage. Em cada arranque os blobs são convertidos em
 * object URLs e guardados num Map em memória, o que torna a resolução
 * síncrona — essencial, porque o React precisa do `src` no primeiro render,
 * sem esperar por uma promessa.
 */

const DB_NAME = 'cgl-studio-assets';
const DB_VERSION = 1;
const STORE = 'assets';

export const ASSET_PREFIX = 'cgl-asset:';

/** Referência -> object URL válido nesta sessão do browser. */
const urlCache = new Map<string, string>();

/** Verdadeiro se a string é uma referência a um asset guardado. */
export const isAssetRef = (value?: string | null): value is string =>
  typeof value === 'string' && value.startsWith(ASSET_PREFIX);

/** Verdadeiro se a string é uma imagem embutida em base64 (formato antigo). */
export const isDataUrl = (value?: string | null): value is string =>
  typeof value === 'string' && value.startsWith('data:image/');

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB indisponível'));
  });

const runTransaction = <T>(
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> =>
  openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = work(tx.objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('Falha no IndexedDB'));
        tx.oncomplete = () => db.close();
      })
  );

/**
 * Guardamos os bytes crus e o tipo MIME, não o `Blob`.
 *
 * Guardar `Blob` diretamente parece mais simples, mas o suporte a Blobs em
 * IndexedDB foi historicamente instável (o Safari teve anos de problemas com
 * isso). `ArrayBuffer` atravessa a clonagem estruturada de forma fiável em
 * qualquer implementação, e reconstruir o Blob à saída custa nada.
 */
interface AssetRecord {
  id: string;
  data: ArrayBuffer;
  type: string;
  createdAt: number;
}

/** Reconstrói o Blob a partir dos bytes guardados. */
const recordToBlob = (record: AssetRecord): Blob =>
  new Blob([record.data], { type: record.type || 'image/png' });

const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Converte um data URL base64 num Blob, sem passar pela rede. */
export const dataUrlToBlob = (dataUrl: string): Blob => {
  const [header, encoded] = dataUrl.split(',');
  const mime = header.match(/data:([^;]+)/)?.[1] ?? 'image/png';
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
};

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Falha ao ler o ficheiro'));
    reader.readAsDataURL(blob);
  });

/**
 * Guarda uma imagem e devolve a referência a colocar no estado.
 *
 * Se o IndexedDB não estiver disponível (navegação privada em certos
 * browsers), devolve o data URL original: o editor continua a funcionar,
 * apenas sem o benefício de armazenamento.
 */
export const storeAsset = async (source: Blob | string): Promise<string> => {
  const blob = typeof source === 'string' ? dataUrlToBlob(source) : source;
  const id = newId();
  const ref = `${ASSET_PREFIX}${id}`;

  try {
    const data = await blob.arrayBuffer();
    await runTransaction('readwrite', (store) =>
      store.put({ id, data, type: blob.type, createdAt: Date.now() } satisfies AssetRecord)
    );
  } catch (err) {
    console.warn('IndexedDB indisponível; a imagem fica embutida no estado:', err);
    return typeof source === 'string' ? source : await blobToDataUrl(blob);
  }

  urlCache.set(ref, URL.createObjectURL(blob));
  return ref;
};

/**
 * Resolve um valor para algo que o browser saiba desenhar. Síncrono de
 * propósito. Caminhos normais (`/brand/logo.svg`), data URLs antigos e
 * `null` atravessam sem alteração.
 */
export const resolveAsset = (value?: string | null): string => {
  if (!value) return '';
  if (!isAssetRef(value)) return value;
  return urlCache.get(value) ?? '';
};

/** Carrega todos os assets guardados para memória. Chamar antes do primeiro render. */
export const hydrateAssets = async (): Promise<void> => {
  let records: AssetRecord[];
  try {
    records = await runTransaction<AssetRecord[]>('readonly', (store) => store.getAll());
  } catch (err) {
    console.warn('Não foi possível carregar as imagens guardadas:', err);
    return;
  }

  for (const record of records) {
    const ref = `${ASSET_PREFIX}${record.id}`;
    if (!urlCache.has(ref)) {
      urlCache.set(ref, URL.createObjectURL(recordToBlob(record)));
    }
  }
};

/** Devolve o data URL de uma referência — usado para exportar presets portáveis. */
export const inlineAsset = async (ref: string): Promise<string | null> => {
  if (!isAssetRef(ref)) return ref;
  try {
    const record = await runTransaction<AssetRecord | undefined>('readonly', (store) =>
      store.get(ref.slice(ASSET_PREFIX.length))
    );
    return record ? await blobToDataUrl(recordToBlob(record)) : null;
  } catch {
    return null;
  }
};

/**
 * Apaga os assets que já não são referidos por nada.
 *
 * Sem isto, cada fotografia substituída ficava para sempre em IndexedDB —
 * o problema da quota voltava, só que mais devagar.
 */
export const pruneUnusedAssets = async (usedRefs: Set<string>): Promise<void> => {
  try {
    const records = await runTransaction<AssetRecord[]>('readonly', (store) => store.getAll());
    const orphans = records.filter((r) => !usedRefs.has(`${ASSET_PREFIX}${r.id}`));
    if (orphans.length === 0) return;

    await Promise.all(
      orphans.map((r) =>
        runTransaction('readwrite', (store) => store.delete(r.id)).catch(() => undefined)
      )
    );

    for (const orphan of orphans) {
      const ref = `${ASSET_PREFIX}${orphan.id}`;
      const url = urlCache.get(ref);
      if (url) {
        URL.revokeObjectURL(url);
        urlCache.delete(ref);
      }
    }
  } catch (err) {
    console.warn('Não foi possível limpar imagens órfãs:', err);
  }
};
