import { toPng, toBlob } from 'html-to-image';
import { useStore } from '../store/useStore';

/**
 * Módulo único de exportação do CGL Studio.
 *
 * Garante, para TODAS as exportações (PNG, clipboard e pack .ZIP):
 *  - dimensões finais exatas (1080×1080, 1080×1350, 1080×1920, 1920×1080);
 *  - guias de Zona Segura, seleção e controlos do editor nunca capturados;
 *  - espera determinística pelo render, sem `setTimeout` arbitrário;
 *  - estado visual sempre reposto, mesmo quando ocorre um erro.
 */

/** Marca um nó como puramente de edição: nunca entra na imagem exportada. */
export const EXPORT_IGNORE_ATTR = 'data-export-ignore';

/** Tempo máximo por captura. Generoso: fotografias grandes demoram mesmo. */
const CAPTURE_TIMEOUT_MS = 30_000;

/** Descarta qualquer nó marcado com `data-export-ignore`. */
const exportFilter = (node: Node): boolean => {
  if (node instanceof HTMLElement && node.hasAttribute(EXPORT_IGNORE_ATTR)) {
    return false;
  }
  return true;
};

/** Resolve a promessa, ou desiste ao fim de `limite` ms. Nunca rejeita. */
const comLimite = <T>(promessa: Promise<T>, limite: number): Promise<void> =>
  new Promise((resolve) => {
    let terminado = false;
    const concluir = () => {
      if (!terminado) {
        terminado = true;
        resolve();
      }
    };
    promessa.then(concluir, concluir);
    setTimeout(concluir, limite);
  });

/**
 * Espera que o separador volte a estar visível.
 *
 * O `html-to-image` resolve a imagem dentro de um `requestAnimationFrame`
 * (ver `createImage` na biblioteca), e o rAF não dispara em separadores
 * ocultos. Uma exportação começada e depois deixada noutro separador — o
 * caso normal ao exportar um pack de dez slides — nunca terminava.
 *
 * Esperar é melhor do que falhar: o utilizador volta ao separador e a
 * exportação continua sozinha.
 */
const esperarVisibilidade = (limite = 120_000): Promise<void> =>
  new Promise((resolve) => {
    if (typeof document === 'undefined' || !document.hidden) {
      resolve();
      return;
    }

    let terminado = false;
    const concluir = () => {
      if (terminado) return;
      terminado = true;
      document.removeEventListener('visibilitychange', aoMudar);
      resolve();
    };
    const aoMudar = () => {
      if (!document.hidden) concluir();
    };

    document.addEventListener('visibilitychange', aoMudar);
    setTimeout(concluir, limite);
  });

/**
 * Espera pelo próximo frame pintado — com rede de segurança.
 *
 * Dois `requestAnimationFrame` encadeados garantem que o React fez commit e
 * que o browser pintou. MAS o `requestAnimationFrame` NÃO dispara em
 * separadores em segundo plano. Sem o `setTimeout` de reserva, uma exportação
 * iniciada e depois deixada noutro separador ficava pendurada para sempre:
 * a promessa nunca resolvia, o `finally` nunca repunha o estado, e o editor
 * ficava com as guias desligadas e o zoom por repor.
 *
 * Com separador visível ganhamos o determinismo do rAF; escondido, seguimos
 * ao fim do limite. É o melhor dos dois, e nunca pior do que o atraso fixo
 * que isto veio substituir.
 */
const esperarFrame = (limite = 250): Promise<void> =>
  new Promise((resolve) => {
    let terminado = false;
    const concluir = () => {
      if (!terminado) {
        terminado = true;
        resolve();
      }
    };

    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => requestAnimationFrame(concluir));
    }
    setTimeout(concluir, limite);
  });

/**
 * Espera que o browser tenha efetivamente pintado o estado atual e que as
 * fontes da marca e as imagens da tela estejam prontas.
 *
 * Cada etapa tem limite próprio: nenhuma delas pode prender a exportação.
 */
export const waitForCanvasReady = async (node: HTMLElement): Promise<void> => {
  await esperarFrame();

  if (typeof document !== 'undefined' && document.fonts?.ready) {
    // Se o carregamento das fontes encravar, exportamos à mesma: um cartaz
    // com a fonte de reserva é melhor do que nenhum cartaz.
    await comLimite(document.fonts.ready, 3000);
  }

  const images = Array.from(node.querySelectorAll('img'));
  await Promise.all(
    images.map(async (img) => {
      if (img.complete && img.naturalWidth > 0) return;
      // `decode()` pode nunca assentar numa imagem partida.
      await comLimite(img.decode(), 5000);
    })
  );
};

/**
 * Coloca o canvas em "estado limpo", corre `capture`, e repõe SEMPRE o estado
 * original — incluindo quando `capture` rebenta.
 *
 * Estado limpo significa: sem zoom (`transform: none`), sem guias de Zona
 * Segura, sem elemento selecionado e sem o modo de inspeção de fotografia.
 * Usamos `toggleSafeZones` e `setSelectedElementId` porque, ao contrário de
 * `setCanvasSettings`, não escrevem no histórico de Undo/Redo — exportar não
 * deve consumir passos do `Ctrl + Z`.
 */
export const withCleanCanvas = async <T>(
  node: HTMLDivElement,
  capture: (node: HTMLDivElement) => Promise<T>
): Promise<T> => {
  const store = useStore.getState();
  const hadSafeZones = store.canvasSettings.showSafeZones;
  const previousSelection = store.selectedElementId;
  const wasInspectingPhoto = store.inspectingPhoto;
  const originalTransform = node.style.transform;

  // Antes de mexer em seja o que for: se o separador está oculto, a captura
  // não conseguiria terminar. Esperamos aqui, com o editor ainda intacto.
  await esperarVisibilidade();

  try {
    if (hadSafeZones) store.toggleSafeZones();
    if (previousSelection) store.setSelectedElementId(null);
    if (wasInspectingPhoto) store.setInspectingPhoto(false);

    node.style.transform = 'none';
    await waitForCanvasReady(node);

    // Rede de segurança final: se a captura encravar, queremos um erro
    // visível e o estado reposto, nunca um editor partido em silêncio.
    return await Promise.race([
      capture(node),
      new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                'a captura demorou demasiado tempo. Mantém este separador à frente durante a exportação, ou tenta com uma fotografia mais leve.'
              )
            ),
          CAPTURE_TIMEOUT_MS
        )
      ),
    ]);
  } finally {
    node.style.transform = originalTransform;

    const after = useStore.getState();
    if (hadSafeZones && !after.canvasSettings.showSafeZones) {
      after.toggleSafeZones();
    }
    // `inspectingPhoto` e `selectedElementId` são mutuamente exclusivos por
    // desenho da store, por isso repomos apenas o que estava ativo.
    if (wasInspectingPhoto) {
      after.setInspectingPhoto(true);
    } else if (previousSelection) {
      after.setSelectedElementId(previousSelection);
    }
  }
};

/**
 * Opções de captura fixadas às dimensões reais do formato.
 *
 * `pixelRatio: 1` combinado com `width`/`height` explícitos entrega o tamanho
 * exato do formato, independentemente do zoom do editor ou do devicePixelRatio
 * do monitor do utilizador.
 */
const captureOptions = () => {
  const { canvasSettings } = useStore.getState();
  return {
    /**
     * `cacheBust` TEM de ficar desligado.
     *
     * Ele acrescenta `?t=<timestamp>` ao URL de cada imagem, e um object URL
     * com query string deixa de resolver — `blob:http://…/uuid?t=1` dá
     * "Failed to fetch". Como as fotografias passaram a viver em IndexedDB e
     * são servidas como object URLs, ligar isto parte a exportação sempre
     * que houver uma fotografia na tela. Não perdemos nada: os object URLs
     * são únicos por sessão e os restantes ativos são locais.
     */
    cacheBust: false,
    pixelRatio: 1,
    width: canvasSettings.width,
    height: canvasSettings.height,
    filter: exportFilter,
  };
};

/** Captura o canvas atual como data URL PNG, nas dimensões exatas do formato. */
export const captureCanvasPng = (node: HTMLDivElement): Promise<string> =>
  withCleanCanvas(node, (clean) => toPng(clean, captureOptions()));

/** Captura o canvas atual como Blob PNG, nas dimensões exatas do formato. */
export const captureCanvasBlob = (node: HTMLDivElement): Promise<Blob | null> =>
  withCleanCanvas(node, (clean) => toBlob(clean, captureOptions()));

/** Sufixo legível com as dimensões reais, ex.: "45-1080x1350". */
export const formatSuffix = (): string => {
  const { canvasSettings } = useStore.getState();
  const ratio = canvasSettings.aspectRatio.replace(':', '');
  return `${ratio}-${canvasSettings.width}x${canvasSettings.height}`;
};

/** Nome de ficheiro previsível para uma exportação individual. */
export const singleFileName = (): string => `cgl-${formatSuffix()}.png`;

/** Nome de ficheiro previsível para um slide dentro do pack. */
export const slideFileName = (index: number): string =>
  `cgl-carrossel-${String(index + 1).padStart(2, '0')}-${formatSuffix()}.png`;

/** Nome do pack .ZIP, com o formato incluído. */
export const packFileName = (): string => `cgl-carrossel-${formatSuffix()}.zip`;

/**
 * Converte um erro desconhecido numa mensagem legível.
 *
 * O `html-to-image` rejeita com um `Event` quando uma imagem não carrega, e
 * `String(event)` dá "[object Event]" — que não diz nada a quem está a tentar
 * publicar um cartaz. Traduzimos os casos que sabemos reconhecer para algo
 * acionável.
 */
export const exportErrorMessage = (err: unknown, action: string): string => {
  if (err instanceof Error) return `${action} falhou: ${err.message}`;

  // Evento de erro de carregamento: quase sempre uma imagem que não abriu.
  if (typeof Event !== 'undefined' && err instanceof Event) {
    const alvo = err.target as HTMLImageElement | null;
    const origem = alvo?.src ? ` (${alvo.src.slice(0, 80)})` : '';
    return `${action} falhou: não foi possível carregar uma das imagens da tela${origem}. Tenta remover e voltar a colocar a fotografia.`;
  }

  return `${action} falhou: ${String(err)}`;
};
