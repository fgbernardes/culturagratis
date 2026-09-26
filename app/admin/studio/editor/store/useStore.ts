import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { editorStorage, onStorageStatus } from '../utils/editorStorage';
import { resolveAsset } from '../utils/assetStore';
import { inlineAssetsForExport, storeAssetsFromImport } from '../utils/assetMigration';
import { STICKERS } from '../data/stickers';
import { extractColorsFromImage } from '../utils/colorExtractor';
import type {
  AspectRatio,
  CanvasSettings,
  ImageElement,
  BrandLogo,
  LogoPosition,
  Slide,
  ParsedEvent,
  TagShape,
  SlidePhoto,
  CustomPreset,
  TextureType,
  HistorySnapshot,
} from '../types';

export const ASPECT_RATIO_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  '1:1': { width: 1080, height: 1080 },
  '16:9': { width: 1920, height: 1080 },
  '9:16': { width: 1080, height: 1920 },
  '4:5': { width: 1080, height: 1350 },
};

const BROKEN_OFFICIAL_LOGO_SOURCES = new Set([
  '/cgl-logos/sem-lettering-cores.png',
  '/cgl-logos/com-lettering-cores.png',
]);
const OFFICIAL_LOGO_SRC = '/cgl-emblem.png';

const normalizeOfficialBrandLogo = (logo: BrandLogo): BrandLogo =>
  BROKEN_OFFICIAL_LOGO_SOURCES.has(logo.src)
    ? { ...logo, src: OFFICIAL_LOGO_SRC, size: logo.src === '/cgl-logos/com-lettering-cores.png' && logo.size === 210 ? 140 : logo.size }
    : logo;

const createDefaultBrandLogo = (): BrandLogo => ({
  src: OFFICIAL_LOGO_SRC,
  visible: true,
  position: 'bottom-right',
  size: 140,
  opacity: 1,
  margin: 40,
  backgroundHighlight: 'none',
  logoColorMode: 'original',
  logoShape: 'original',
  removeWhiteBg: false,
  blendMode: 'normal',
});

interface AppState {
  canvasSettings: CanvasSettings;
  brandLogo: BrandLogo;
  elements: ImageElement[];
  selectedElementId: string | null;
  clipboardElement: ImageElement | null;
  inspectingPhoto: boolean;
  setInspectingPhoto: (inspecting: boolean) => void;

  // Gestão de Histórico Global (Undo / Redo)
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  setCanvasSettings: (settings: Partial<CanvasSettings>) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  toggleSafeZones: () => void;
  toggleProgressBar: () => void;
  setBackgroundImage: (src: string | null) => void;
  harmonizeColorsWithPhoto: () => void;

  setBrandLogo: (logo: Partial<BrandLogo>) => void;
  setLogoPosition: (position: LogoPosition) => void;
  resetBrandLogo: () => void;

  applyTemplate: (templateKey: string) => void;
  applyAgendaPreset: () => void;
  applyFinalSlidePreset: () => void;
  applyPlatformPreset: (platform: 'tiktok' | 'whatsapp' | 'facebook') => void;
  addElement: (element: Omit<ImageElement, 'id'>) => string;
  addImageElement: (src: string) => string;
  updateElement: (id: string, updates: Partial<ImageElement>) => void;
  removeElement: (id: string) => void;
  setSelectedElementId: (id: string | null) => void;
  copySelectedElement: () => void;
  pasteElement: () => void;
  clearCanvas: () => void;
  toggleTextShadow: () => void;
  toggleTextBadge: () => void;
  setTextBadgeColor: (color: string) => void;
  updateTagShape: (elementId: string, shape: TagShape | string) => void;
  alignCenterHorizontal: () => void;
  alignCenterVertical: () => void;
  alignLeftMargin: () => void;
  alignRightMargin: () => void;
  addTagElement: (categoryText: string, colorHex: string) => string;
  setSlidePhoto: (src: string) => void;
  updateSlidePhoto: (partial: Partial<SlidePhoto>) => void;
  removeSlidePhoto: () => void;
  resetSlidePhotoPosition: () => void;
  customPresets: CustomPreset[];
  saveCurrentAsPreset: (name: string) => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
  exportPresetsToJson: () => Promise<string>;
  importPresetsFromJson: (jsonData: string) => Promise<boolean>;
  slides: Slide[];
  activeSlideIndex: number;
  lastSavedAt: number;
  /** Mensagem de falha do auto-save. `null` significa que a última escrita resultou. */
  saveError: string | null;
  addSlide: () => void;
  duplicateSlide: (index: number) => void;
  deleteSlide: (index: number) => void;
  setActiveSlide: (index: number) => void;
  resetProject: () => void;
  autoFillEvent: (parsedData: ParsedEvent) => void;
}

// Migração segura caso o utilizador já tivesse dados guardados na chave anterior
if (typeof window !== 'undefined') {
  try {
    const oldState = localStorage.getItem('cgl-canvas-state');
    if (oldState && !localStorage.getItem('cgl_editor_state')) {
      localStorage.setItem('cgl_editor_state', oldState);
    }
  } catch {
    // Ignorar erros em ambientes sem localStorage
  }
}

const takeSnapshot = (state: {
  slides: Slide[];
  activeSlideIndex: number;
  elements: ImageElement[];
  canvasSettings: CanvasSettings;
  brandLogo: BrandLogo;
}): HistorySnapshot => ({
  slides: JSON.parse(JSON.stringify(state.slides)),
  activeSlideIndex: state.activeSlideIndex,
  elements: JSON.parse(JSON.stringify(state.elements)),
  canvasSettings: { ...state.canvasSettings },
  brandLogo: { ...state.brandLogo },
});

const recordHistory = (state: {
  slides: Slide[];
  activeSlideIndex: number;
  elements: ImageElement[];
  canvasSettings: CanvasSettings;
  brandLogo: BrandLogo;
  past?: HistorySnapshot[];
}) => {
  const currentSnapshot = takeSnapshot(state);
  const newPast = [...(state.past || []), currentSnapshot].slice(-30);
  return {
    past: newPast,
    future: [],
    canUndo: true,
    canRedo: false,
    lastSavedAt: Date.now(),
  };
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      canvasSettings: {
        width: 1080,
        height: 1080,
        backgroundColor: '#1A1A1A', // Preto Carvão CGL por defeito
        backgroundImage: null as string | null,
        aspectRatio: '1:1' as AspectRatio,
        showSafeZones: false,
        textureType: 'none' as TextureType,
        textureOpacity: 0.5,
        zoom: 0.42,
      },
      brandLogo: createDefaultBrandLogo(),
      elements: [
        {
          id: 'default-title',
          type: 'text',
          content: 'A cultura\nvive na cidade.',
          x: 80,
          y: 100,
          fontSize: 84,
          fontFamily: '"Bricolage Grotesque", sans-serif',
          color: '#FE7D02', // Laranja Pôr-do-Sol
          textAlign: 'left',
          fontWeight: 700,
          fontStyle: 'normal',
          textTransform: 'none',
        },
      ],
      selectedElementId: null,
      clipboardElement: null,
      inspectingPhoto: false,
      setInspectingPhoto: (inspecting) =>
        set({ inspectingPhoto: inspecting, ...(inspecting ? { selectedElementId: null } : {}) }),
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
      lastSavedAt: Date.now(),
      saveError: null,
      customPresets: [],
      slides: [
        {
          id: 'default-slide',
          elements: [
            {
              id: 'default-title',
              type: 'text',
              content: 'A cultura\nvive na cidade.',
              x: 80,
              y: 100,
              fontSize: 84,
              fontFamily: '"Bricolage Grotesque", sans-serif',
              color: '#FE7D02',
              textAlign: 'left',
              fontWeight: 700,
              fontStyle: 'normal',
              textTransform: 'none',
            },
          ],
          brandLogo: createDefaultBrandLogo(),
          backgroundColor: '#1A1A1A',
          backgroundImage: null,
          textureType: 'none',
          textureOpacity: 0.5,
        },
      ],
      activeSlideIndex: 0,

      undo: () => {
        set((state) => {
          const past = state.past || [];
          if (past.length === 0) return {};

          const previous = past[past.length - 1];
          const newPast = past.slice(0, past.length - 1);
          const currentSnapshot = takeSnapshot(state);
          const newFuture = [currentSnapshot, ...(state.future || [])].slice(0, 30);

          return {
            slides: previous.slides,
            activeSlideIndex: previous.activeSlideIndex,
            elements: previous.elements,
            canvasSettings: previous.canvasSettings,
            brandLogo: previous.brandLogo,
            selectedElementId: null,
            past: newPast,
            future: newFuture,
            canUndo: newPast.length > 0,
            canRedo: true,
          };
        });
      },

      redo: () => {
        set((state) => {
          const future = state.future || [];
          if (future.length === 0) return {};

          const next = future[0];
          const newFuture = future.slice(1);
          const currentSnapshot = takeSnapshot(state);
          const newPast = [...(state.past || []), currentSnapshot].slice(-30);

          return {
            slides: next.slides,
            activeSlideIndex: next.activeSlideIndex,
            elements: next.elements,
            canvasSettings: next.canvasSettings,
            brandLogo: next.brandLogo,
            selectedElementId: null,
            past: newPast,
            future: newFuture,
            canUndo: true,
            canRedo: newFuture.length > 0,
          };
        });
      },

      setCanvasSettings: (settings) =>
        set((state) => {
          const history = recordHistory(state);
          const updatedSettings = { ...state.canvasSettings, ...settings };
          const updatedSlides = state.slides.map((s, idx) => {
            if (idx !== state.activeSlideIndex) return s;
            return {
              ...s,
              backgroundColor: updatedSettings.backgroundColor,
              backgroundImage: updatedSettings.backgroundImage,
              textureType: updatedSettings.textureType,
              textureOpacity: updatedSettings.textureOpacity,
            };
          });
          return {
            ...history,
            canvasSettings: updatedSettings,
            slides: updatedSlides,
          };
        }),

      setAspectRatio: (ratio) =>
        set((state) => {
          const history = recordHistory(state);
          const dimensions = ASPECT_RATIO_DIMENSIONS[ratio] || { width: 1080, height: 1080 };
          return {
            ...history,
            canvasSettings: {
              ...state.canvasSettings,
              aspectRatio: ratio,
              width: dimensions.width,
              height: dimensions.height,
            },
          };
        }),

      toggleSafeZones: () =>
        set((state) => ({
          canvasSettings: {
            ...state.canvasSettings,
            showSafeZones: !state.canvasSettings.showSafeZones,
          },
        })),

      toggleProgressBar: () =>
        set((state) => ({
          canvasSettings: {
            ...state.canvasSettings,
            showProgressBar: !state.canvasSettings.showProgressBar,
          },
        })),

      setBackgroundImage: (src) =>
        set((state) => {
          const history = recordHistory(state);
          const updatedSlides = state.slides.map((s, idx) =>
            idx === state.activeSlideIndex ? { ...s, backgroundImage: src } : s
          );
          return {
            ...history,
            canvasSettings: { ...state.canvasSettings, backgroundImage: src },
            slides: updatedSlides,
          };
        }),

      setBrandLogo: (logoUpdates) =>
        set((state) => {
          const history = recordHistory(state);
          const currentLogo = state.brandLogo || {};
          const nextLogo: BrandLogo = {
            src: logoUpdates.src !== undefined ? logoUpdates.src : (currentLogo.src || OFFICIAL_LOGO_SRC),
            visible: logoUpdates.visible !== undefined ? logoUpdates.visible : (currentLogo.visible !== undefined ? currentLogo.visible : true),
            position: logoUpdates.position || currentLogo.position || 'bottom-right',
            size: logoUpdates.size || currentLogo.size || 140,
            opacity: logoUpdates.opacity !== undefined ? logoUpdates.opacity : (currentLogo.opacity !== undefined ? currentLogo.opacity : 1),
            margin: logoUpdates.margin !== undefined ? logoUpdates.margin : (currentLogo.margin !== undefined ? currentLogo.margin : 40),
            backgroundHighlight: logoUpdates.backgroundHighlight || currentLogo.backgroundHighlight || 'none',
            logoColorMode: logoUpdates.logoColorMode || currentLogo.logoColorMode || 'original',
            logoShape: logoUpdates.logoShape || currentLogo.logoShape || 'original',
            removeWhiteBg: logoUpdates.removeWhiteBg !== undefined ? logoUpdates.removeWhiteBg : (currentLogo.removeWhiteBg !== undefined ? currentLogo.removeWhiteBg : false),
            blendMode: logoUpdates.blendMode || currentLogo.blendMode || 'normal',
          };
          return {
            ...history,
            brandLogo: nextLogo,
            slides: state.slides.map((slide, index) =>
              index === state.activeSlideIndex ? { ...slide, brandLogo: { ...nextLogo } } : slide
            ),
          };
        }),

      resetBrandLogo: () =>
        set((state) => {
          const history = recordHistory(state);
          const nextLogo = createDefaultBrandLogo();
          return {
            ...history,
            brandLogo: nextLogo,
            slides: state.slides.map((slide, index) =>
              index === state.activeSlideIndex ? { ...slide, brandLogo: { ...nextLogo } } : slide
            ),
          };
        }),

      setLogoPosition: (position) =>
        set((state) => {
          const history = recordHistory(state);
          const nextLogo = { ...state.brandLogo, position };
          return {
            ...history,
            brandLogo: nextLogo,
            slides: state.slides.map((slide, index) =>
              index === state.activeSlideIndex ? { ...slide, brandLogo: { ...nextLogo } } : slide
            ),
          };
        }),

      applyTemplate: (templateKey) => {
        let newState: Partial<Pick<AppState, 'canvasSettings' | 'brandLogo' | 'elements'>> = {};

        switch (templateKey) {
          case 'destaque':
            newState = {
              canvasSettings: {
                ...get().canvasSettings,
                backgroundColor: '#1A1A1A',
                textureType: 'calcada',
                textureOpacity: 0.35,
              },
              brandLogo: { ...get().brandLogo, position: 'bottom-right' },
              elements: [
                {
                  id: '1',
                  type: 'text',
                  content: 'FESTIVAL DE TEATRO',
                  x: 100,
                  y: 160,
                  fontSize: 82,
                  fontFamily: '"Bricolage Grotesque", sans-serif',
                  color: '#FE7D02',
                  textAlign: 'left',
                },
                {
                  id: '2',
                  type: 'text',
                  content: 'Sexta a Domingo • Entrada Grátis',
                  x: 100,
                  y: 320,
                  fontSize: 34,
                  fontFamily: '"Inter", sans-serif',
                  color: '#FFFFFF',
                  textAlign: 'left',
                },
              ],
            };
            break;
          case 'agenda':
            newState = {
              canvasSettings: {
                ...get().canvasSettings,
                backgroundColor: '#FE7D02',
                textureType: 'noise',
                textureOpacity: 0.5,
              },
              brandLogo: { ...get().brandLogo, position: 'bottom-left' },
              elements: [
                {
                  id: '1',
                  type: 'text',
                  content: 'AGENDA DA SEMANA',
                  x: 100,
                  y: 160,
                  fontSize: 86,
                  fontFamily: '"Bricolage Grotesque", sans-serif',
                  color: '#1A1A1A',
                  textAlign: 'left',
                },
                {
                  id: '2',
                  type: 'text',
                  content: 'Os melhores planos culturais em Lisboa',
                  x: 100,
                  y: 320,
                  fontSize: 34,
                  fontFamily: '"Inter", sans-serif',
                  color: '#FFFFFF',
                  textAlign: 'left',
                },
              ],
            };
            break;
          case 'livre':
            newState = {
              canvasSettings: {
                ...get().canvasSettings,
                backgroundColor: '#00838F',
                textureType: 'calcada',
                textureOpacity: 0.25,
              },
              brandLogo: { ...get().brandLogo, position: 'top-right' },
              elements: [
                {
                  id: '1',
                  type: 'text',
                  content: 'ENTRADA LIVRE',
                  x: 100,
                  y: 180,
                  fontSize: 92,
                  fontFamily: '"Bricolage Grotesque", sans-serif',
                  color: '#FFC107',
                  textAlign: 'left',
                },
                {
                  id: '2',
                  type: 'text',
                  content: 'Acesso gratuito limitado à lotação',
                  x: 100,
                  y: 340,
                  fontSize: 32,
                  fontFamily: '"Inter", sans-serif',
                  color: '#FFFFFF',
                  textAlign: 'left',
                },
              ],
            };
            break;
        }

        set((state) => {
          const history = recordHistory(state);
          const mergedElements = newState.elements || [];
          const mergedSettings = { ...state.canvasSettings, ...newState.canvasSettings };
          const updatedSlides = state.slides.map((s, idx) => {
            if (idx !== state.activeSlideIndex) return s;
            return {
              ...s,
              elements: mergedElements,
              backgroundColor: mergedSettings.backgroundColor,
              backgroundImage: mergedSettings.backgroundImage,
              textureType: mergedSettings.textureType,
              textureOpacity: mergedSettings.textureOpacity,
            };
          });
          return {
            ...state,
            ...history,
            ...newState,
            slides: updatedSlides,
            selectedElementId: null,
          };
        });
      },

      applyAgendaPreset: () => {
        const state = get();
        const currentPhoto = state.slides[state.activeSlideIndex]?.photo;
        const seloLivreUri = STICKERS.find((s) => s.id === 'selo-livre')?.svgUri || '';

        const agendaElements: ImageElement[] = [
          // 1. Tag de Categoria no topo esquerdo (x: 40, y: 50)
          {
            id: crypto.randomUUID(),
            type: 'text',
            content: 'CONCERTO / FESTIVAL',
            x: 40,
            y: 50,
            fontSize: 22,
            fontFamily: '"Inter", sans-serif',
            color: '#FFFFFF',
            fontWeight: 700,
            fontStyle: 'normal',
            textTransform: 'none',
            hasBadge: true,
            badgeColor: '#FE7D02',
            tagShape: 'pill',
          },
          // 2. Selo 'ENTRADA LIVRE' no topo direito (x: 750, y: 50, rotação -5°)
          {
            id: crypto.randomUUID(),
            type: 'image',
            src: seloLivreUri,
            x: 750,
            y: 50,
            width: 260,
            rotation: -5,
            opacity: 1,
          },
          // 3. Título Principal centrado na metade superior (Bricolage Grotesque, 68px, bold, branco com sombra)
          {
            id: crypto.randomUUID(),
            type: 'text',
            content: 'NOITES DE VERÃO NO CHIADO',
            x: 40,
            y: 230,
            width: 1000,
            fontSize: 68,
            fontFamily: '"Bricolage Grotesque", sans-serif',
            color: '#FFFFFF',
            textAlign: 'center',
            fontWeight: 800,
            fontStyle: 'normal',
            textTransform: 'uppercase',
            hasShadow: true,
          },
          // 4. Subtítulo/Local logo abaixo do título (Inter, 28px, uppercase)
          {
            id: crypto.randomUUID(),
            type: 'text',
            content: 'JARDIM DO PRINCÍPE REAL • LISBOA',
            x: 40,
            y: 390,
            width: 1000,
            fontSize: 28,
            fontFamily: '"Inter", sans-serif',
            color: '#FFC107',
            textAlign: 'center',
            fontWeight: 700,
            fontStyle: 'normal',
            textTransform: 'uppercase',
            hasShadow: true,
          },
          // 5. Barra/Cartão Inferior escuro (fundo #1A1A1A, 90% opacidade, borda superior sutil) para data, horário e detalhes
          {
            id: crypto.randomUUID(),
            type: 'text',
            content: '📅  15 a 18 de Agosto • 21h30\n📍  Largo do Picadeiro | Entrada pelo Jardim\nℹ️  Acesso livre por ordem de chegada',
            x: 40,
            y: 830,
            width: 980,
            fontSize: 28,
            fontFamily: '"Inter", sans-serif',
            color: '#FFFFFF',
            textAlign: 'left',
            fontWeight: 600,
            fontStyle: 'normal',
            textTransform: 'none',
            hasBadge: true,
            badgeColor: '#1A1A1A',
            tagShape: 'rounded',
            borderRadius: '16px',
            opacity: 0.92,
            hasShadow: true,
          },
        ];

        set((prevState) => {
          const history = recordHistory(prevState);
          const updatedSlides = prevState.slides.map((s, idx) => {
            if (idx !== prevState.activeSlideIndex) return s;
            return {
              ...s,
              elements: agendaElements,
              photo: currentPhoto,
              backgroundColor: '#1A1A1A',
            };
          });

          return {
            ...history,
            elements: agendaElements,
            slides: updatedSlides,
            selectedElementId: null,
            brandLogo: {
              ...prevState.brandLogo,
              visible: true,
              position: 'bottom-right',
              size: 200,
              opacity: 1,
              margin: 60,
            },
            canvasSettings: {
              ...prevState.canvasSettings,
              backgroundColor: '#1A1A1A',
            },
          };
        });
      },

      applyFinalSlidePreset: () => {
        const ctaElements: ImageElement[] = [
          // Título CTA
          {
            id: crypto.randomUUID(),
            type: 'text',
            content: 'GOSTASTE DESTE PLANO?',
            x: 60,
            y: 280,
            width: 960,
            fontSize: 64,
            fontFamily: '"Bricolage Grotesque", sans-serif',
            color: '#FE7D02',
            textAlign: 'center',
            fontWeight: 800,
            fontStyle: 'normal',
            textTransform: 'uppercase',
            hasShadow: true,
          },
          // Caixa / Cartão Glassmorphism com os 3 CTAs
          {
            id: crypto.randomUUID(),
            type: 'text',
            content: '📌  Guarda este post para não perderes o evento\n\n✈️  Partilha com quem vai contigo\n\n🔔  Segue @culturagratis para os melhores planos a custo zero',
            x: 70,
            y: 420,
            width: 940,
            fontSize: 30,
            fontFamily: '"Inter", sans-serif',
            color: '#FFFFFF',
            textAlign: 'left',
            fontWeight: 600,
            fontStyle: 'normal',
            textTransform: 'none',
            hasBadge: true,
            badgeColor: 'rgba(26, 26, 26, 0.85)',
            tagShape: 'glass',
            isGlass: true,
            borderRadius: '16px',
            hasShadow: true,
          },
          // Tag inferior
          {
            id: crypto.randomUUID(),
            type: 'text',
            content: 'LISBOA • CULTURA A CUSTO ZERO',
            x: 280,
            y: 890,
            fontSize: 22,
            fontFamily: '"Inter", sans-serif',
            color: '#FFC107',
            textAlign: 'center',
            fontWeight: 700,
            fontStyle: 'normal',
            textTransform: 'uppercase',
            hasBadge: true,
            badgeColor: '#1A1A1A',
            tagShape: 'pill',
            hasShadow: true,
          },
        ];

        set((state) => {
          const history = recordHistory(state);

          // Salvar estado dos elementos do slide atual antes de criar o novo
          const updatedCurrentSlides = state.slides.map((s, idx) =>
            idx === state.activeSlideIndex ? { ...s, elements: state.elements } : s
          );

          // Criar NOVO slide dedicado ao CTA no final do carrossel
          const newSlideId = crypto.randomUUID();
          const newSlide: Slide = {
            id: newSlideId,
            elements: ctaElements,
            backgroundColor: '#1A1A1A',
            backgroundImage: null,
            textureType: 'calcada' as TextureType,
            textureOpacity: 0.25,
          };

          const allSlides = [...updatedCurrentSlides, newSlide];
          const newIndex = allSlides.length - 1;

          return {
            ...history,
            elements: ctaElements,
            slides: allSlides,
            activeSlideIndex: newIndex,
            selectedElementId: null,
            brandLogo: {
              ...state.brandLogo,
              visible: true,
              position: 'center',
              size: 260,
              opacity: 1,
              margin: 40,
            },
            canvasSettings: {
              ...state.canvasSettings,
              backgroundColor: '#1A1A1A',
              backgroundImage: null,
              textureType: 'calcada' as TextureType,
              textureOpacity: 0.25,
            },
          };
        });
      },

      applyPlatformPreset: (platform: 'tiktok' | 'whatsapp' | 'facebook') => {
        if (platform === 'tiktok') {
          // Formato 9:16 (1080x1920)
          const tiktokElements: ImageElement[] = [
            {
              id: crypto.randomUUID(),
              type: 'text',
              content: '🚨  PLANO SECRETO EM LISBOA',
              x: 140,
              y: 290,
              fontSize: 26,
              fontFamily: '"Inter", sans-serif',
              color: '#FFFFFF',
              fontWeight: 800,
              fontStyle: 'normal',
              textTransform: 'uppercase',
              hasBadge: true,
              badgeColor: '#FE7D02',
              tagShape: 'pill',
              hasShadow: true,
            },
            {
              id: crypto.randomUUID(),
              type: 'text',
              content: 'FESTIVAL COM ENTRADA LIVRE ESTE FIM DE SEMANA',
              x: 80,
              y: 390,
              width: 920,
              fontSize: 68,
              fontFamily: '"Bricolage Grotesque", sans-serif',
              color: '#FFFFFF',
              textAlign: 'center',
              fontWeight: 800,
              textTransform: 'uppercase',
              hasShadow: true,
            },
            {
              id: crypto.randomUUID(),
              type: 'text',
              content: '📍 PARQUE DAS NAÇÕES • LISBOA',
              x: 80,
              y: 680,
              width: 920,
              fontSize: 32,
              fontFamily: '"Inter", sans-serif',
              color: '#FFC107',
              textAlign: 'center',
              fontWeight: 700,
              textTransform: 'uppercase',
              hasShadow: true,
            },
            {
              id: crypto.randomUUID(),
              type: 'text',
              content: '📅  Sábado e Domingo • A partir das 16h\n🎵  Concertos ao vivo, Street Food & Arte\n💸  100% Gratuito',
              x: 80,
              y: 780,
              width: 920,
              fontSize: 30,
              fontFamily: '"Inter", sans-serif',
              color: '#FFFFFF',
              textAlign: 'left',
              fontWeight: 600,
              hasBadge: true,
              badgeColor: 'rgba(0, 0, 0, 0.55)',
              tagShape: 'glass',
              isGlass: true,
              hasShadow: true,
            },
            {
              id: crypto.randomUUID(),
              type: 'text',
              content: '❤️  PÕE NOS FAVORITOS & PARTILHA COM QUEM VAI CONTIGO',
              x: 90,
              y: 1460,
              width: 900,
              fontSize: 24,
              fontFamily: '"Inter", sans-serif',
              color: '#FFFFFF',
              textAlign: 'center',
              fontWeight: 800,
              textTransform: 'uppercase',
              hasBadge: true,
              badgeColor: '#FE7D02',
              tagShape: 'pill',
              hasShadow: true,
            },
          ];

          set((state) => {
            const history = recordHistory(state);
            const dims = ASPECT_RATIO_DIMENSIONS['9:16'];
            const updatedSlides = state.slides.map((s, idx) => {
              if (idx !== state.activeSlideIndex) return s;
              return {
                ...s,
                elements: tiktokElements,
              };
            });

            return {
              ...history,
              elements: tiktokElements,
              slides: updatedSlides,
              selectedElementId: null,
              brandLogo: {
                ...state.brandLogo,
                visible: true,
                position: 'top-right',
                size: 180,
                opacity: 1,
                margin: 50,
              },
              canvasSettings: {
                ...state.canvasSettings,
                aspectRatio: '9:16',
                width: dims.width,
                height: dims.height,
                showSafeZones: true,
              },
            };
          });
        } else if (platform === 'whatsapp') {
          // Formato 1:1 (1080x1080)
          const whatsappElements: ImageElement[] = [
            {
              id: crypto.randomUUID(),
              type: 'text',
              content: '📢  EVENTO DESTACADO • CULTURA GRÁTIS',
              x: 60,
              y: 60,
              fontSize: 22,
              fontFamily: '"Inter", sans-serif',
              color: '#FFFFFF',
              fontWeight: 700,
              hasBadge: true,
              badgeColor: '#00838F',
              tagShape: 'pill',
            },
            {
              id: crypto.randomUUID(),
              type: 'text',
              content: 'CINEMA AO AR LIVRE NO CASTELO',
              x: 60,
              y: 140,
              width: 960,
              fontSize: 58,
              fontFamily: '"Bricolage Grotesque", sans-serif',
              color: '#FE7D02',
              fontWeight: 800,
              textTransform: 'uppercase',
              hasShadow: true,
            },
            {
              id: crypto.randomUUID(),
              type: 'text',
              content: '📅  Sexta e Sábado • 21h00\n📍  Castelo de S. Jorge | Lisboa\nⓂ️  Metro Rossio / Martim Moniz\n💸  Entrada 100% Gratuita (0€)',
              x: 60,
              y: 350,
              width: 960,
              fontSize: 32,
              fontFamily: '"Inter", sans-serif',
              color: '#FFFFFF',
              textAlign: 'left',
              fontWeight: 600,
              hasBadge: true,
              badgeColor: 'rgba(26, 26, 26, 0.85)',
              tagShape: 'glass',
              isGlass: true,
              hasShadow: true,
            },
            {
              id: crypto.randomUUID(),
              type: 'text',
              content: '📲  ENCAMINHA PARA O GRUPO DE AMIGOS  ➜',
              x: 140,
              y: 890,
              fontSize: 24,
              fontFamily: '"Inter", sans-serif',
              color: '#1A1A1A',
              fontWeight: 800,
              textAlign: 'center',
              hasBadge: true,
              badgeColor: '#FFC107',
              tagShape: 'pill',
              hasShadow: true,
            },
          ];

          set((state) => {
            const history = recordHistory(state);
            const dims = ASPECT_RATIO_DIMENSIONS['1:1'];
            const updatedSlides = state.slides.map((s, idx) => {
              if (idx !== state.activeSlideIndex) return s;
              return {
                ...s,
                elements: whatsappElements,
                backgroundColor: '#1A1A1A',
              };
            });

            return {
              ...history,
              elements: whatsappElements,
              slides: updatedSlides,
              selectedElementId: null,
              brandLogo: {
                ...state.brandLogo,
                visible: true,
                position: 'top-right',
                size: 200,
                opacity: 1,
                margin: 50,
              },
              canvasSettings: {
                ...state.canvasSettings,
                aspectRatio: '1:1',
                width: dims.width,
                height: dims.height,
                backgroundColor: '#1A1A1A',
              },
            };
          });
        } else if (platform === 'facebook') {
          // Formato 16:9 (1920x1080)
          const facebookElements: ImageElement[] = [
            {
              id: crypto.randomUUID(),
              type: 'text',
              content: 'AGENDA CULTURAL DE LISBOA',
              x: 80,
              y: 70,
              fontSize: 24,
              fontFamily: '"Inter", sans-serif',
              color: '#FFFFFF',
              fontWeight: 700,
              hasBadge: true,
              badgeColor: '#FE7D02',
              tagShape: 'pill',
            },
            {
              id: crypto.randomUUID(),
              type: 'text',
              content: 'CONCERTOS DE JAZZ AO PÔR DO SOL',
              x: 80,
              y: 160,
              width: 1100,
              fontSize: 66,
              fontFamily: '"Bricolage Grotesque", sans-serif',
              color: '#FFFFFF',
              fontWeight: 800,
              textTransform: 'uppercase',
              hasShadow: true,
            },
            {
              id: crypto.randomUUID(),
              type: 'text',
              content: '📅  Todos os Domingos de Agosto • 18h30\n📍  Jardim da Estrela | Lisboa\nℹ️  Acesso livre e gratuito',
              x: 80,
              y: 420,
              width: 1050,
              fontSize: 32,
              fontFamily: '"Inter", sans-serif',
              color: '#FFFFFF',
              textAlign: 'left',
              fontWeight: 600,
              hasBadge: true,
              badgeColor: 'rgba(26, 26, 26, 0.75)',
              tagShape: 'glass',
              isGlass: true,
              hasShadow: true,
            },
            {
              id: crypto.randomUUID(),
              type: 'text',
              content: '👥  IDENTIFICA OS TEUS AMIGOS NOS COMENTÁRIOS  💬',
              x: 80,
              y: 860,
              fontSize: 26,
              fontFamily: '"Inter", sans-serif',
              color: '#1A1A1A',
              fontWeight: 800,
              textAlign: 'center',
              hasBadge: true,
              badgeColor: '#FFC107',
              tagShape: 'pill',
              hasShadow: true,
            },
          ];

          set((state) => {
            const history = recordHistory(state);
            const dims = ASPECT_RATIO_DIMENSIONS['16:9'];
            const updatedSlides = state.slides.map((s, idx) => {
              if (idx !== state.activeSlideIndex) return s;
              return {
                ...s,
                elements: facebookElements,
                backgroundColor: '#1A1A1A',
              };
            });

            return {
              ...history,
              elements: facebookElements,
              slides: updatedSlides,
              selectedElementId: null,
              brandLogo: {
                ...state.brandLogo,
                visible: true,
                position: 'top-right',
                size: 240,
                opacity: 1,
                margin: 60,
              },
              canvasSettings: {
                ...state.canvasSettings,
                aspectRatio: '16:9',
                width: dims.width,
                height: dims.height,
                backgroundColor: '#1A1A1A',
              },
            };
          });
        }
      },

      addElement: (element) => {
        const id = crypto.randomUUID();
        const newElement: ImageElement = { ...element, id };
        set((state) => {
          const history = recordHistory(state);
          const updatedElements = [...state.elements, newElement];
          const updatedSlides = state.slides.map((s, idx) =>
            idx === state.activeSlideIndex ? { ...s, elements: updatedElements } : s
          );
          return {
            ...history,
            elements: updatedElements,
            slides: updatedSlides,
            selectedElementId: id,
          };
        });
        return id;
      },

      addImageElement: (src) => {
        const id = crypto.randomUUID();
        const newElement: ImageElement = {
          id,
          type: 'image',
          src,
          x: 100,
          y: 100,
          width: 250,
          height: 250,
          rotation: 0,
          opacity: 1,
        };
        set((state) => {
          const history = recordHistory(state);
          const updatedElements = [...state.elements, newElement];
          const updatedSlides = state.slides.map((s, idx) =>
            idx === state.activeSlideIndex ? { ...s, elements: updatedElements } : s
          );
          return {
            ...history,
            elements: updatedElements,
            slides: updatedSlides,
            selectedElementId: id,
          };
        });
        return id;
      },

      updateElement: (id, updates) =>
        set((state) => {
          const history = recordHistory(state);
          const updatedElements = state.elements.map((el) =>
            el.id === id ? { ...el, ...updates } : el
          );
          const updatedSlides = state.slides.map((s, idx) =>
            idx === state.activeSlideIndex ? { ...s, elements: updatedElements } : s
          );
          return {
            ...history,
            elements: updatedElements,
            slides: updatedSlides,
          };
        }),

      removeElement: (id) =>
        set((state) => {
          const history = recordHistory(state);
          const updatedElements = state.elements.filter((el) => el.id !== id);
          const updatedSlides = state.slides.map((s, idx) =>
            idx === state.activeSlideIndex ? { ...s, elements: updatedElements } : s
          );
          return {
            ...history,
            elements: updatedElements,
            slides: updatedSlides,
            selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
          };
        }),

      setSelectedElementId: (id) =>
        set({
          selectedElementId: id,
          ...(id ? { inspectingPhoto: false } : {}),
        }),

      copySelectedElement: () =>
        set((state) => {
          const selected = state.elements.find((element) => element.id === state.selectedElementId);
          return selected ? { clipboardElement: { ...selected } } : {};
        }),

      pasteElement: () =>
        set((state) => {
          if (!state.clipboardElement) return {};
          const history = recordHistory(state);
          const pastedElement: ImageElement = {
            ...state.clipboardElement,
            id: crypto.randomUUID(),
            x: state.clipboardElement.x,
            y: state.clipboardElement.y,
          };
          const updatedElements = [...state.elements, pastedElement];
          const updatedSlides = state.slides.map((slide, index) =>
            index === state.activeSlideIndex ? { ...slide, elements: updatedElements } : slide
          );
          return {
            ...history,
            elements: updatedElements,
            slides: updatedSlides,
            selectedElementId: pastedElement.id,
            inspectingPhoto: false,
          };
        }),

      clearCanvas: () =>
        set((state) => {
          const history = recordHistory(state);
          const updatedSlides = state.slides.map((s, idx) =>
            idx === state.activeSlideIndex ? { ...s, elements: [] } : s
          );
          return {
            ...history,
            elements: [],
            slides: updatedSlides,
            selectedElementId: null,
          };
        }),

      toggleTextShadow: () =>
        set((state) => {
          if (!state.selectedElementId) return {};
          const history = recordHistory(state);
          const updatedElements = state.elements.map((el) =>
            el.id === state.selectedElementId ? { ...el, hasShadow: !el.hasShadow } : el
          );
          const updatedSlides = state.slides.map((s, idx) =>
            idx === state.activeSlideIndex ? { ...s, elements: updatedElements } : s
          );
          return {
            ...history,
            elements: updatedElements,
            slides: updatedSlides,
          };
        }),

      toggleTextBadge: () =>
        set((state) => {
          if (!state.selectedElementId) return {};
          const history = recordHistory(state);
          const updatedElements = state.elements.map((el) =>
            el.id === state.selectedElementId ? { ...el, hasBadge: !el.hasBadge } : el
          );
          const updatedSlides = state.slides.map((s, idx) =>
            idx === state.activeSlideIndex ? { ...s, elements: updatedElements } : s
          );
          return {
            ...history,
            elements: updatedElements,
            slides: updatedSlides,
          };
        }),

      setTextBadgeColor: (color) =>
        set((state) => {
          if (!state.selectedElementId) return {};
          const history = recordHistory(state);
          const updatedElements = state.elements.map((el) =>
            el.id === state.selectedElementId ? { ...el, badgeColor: color } : el
          );
          const updatedSlides = state.slides.map((s, idx) =>
            idx === state.activeSlideIndex ? { ...s, elements: updatedElements } : s
          );
          return {
            ...history,
            elements: updatedElements,
            slides: updatedSlides,
          };
        }),

      updateTagShape: (elementId, shape) =>
        set((state) => {
          const history = recordHistory(state);
          const updatedElements = state.elements.map((el) =>
            el.id === elementId ? { ...el, tagShape: shape as TagShape } : el
          );
          const updatedSlides = state.slides.map((s, idx) =>
            idx === state.activeSlideIndex ? { ...s, elements: updatedElements } : s
          );
          return {
            ...history,
            elements: updatedElements,
            slides: updatedSlides,
          };
        }),

      alignCenterHorizontal: () =>
        set((state) => {
          if (!state.selectedElementId) return {};
          const history = recordHistory(state);
          const updatedElements = state.elements.map((el) => {
            if (el.id !== state.selectedElementId) return el;
            const elementWidth = el.width || (el.type === 'image' ? 250 : 500);
            return { ...el, x: Math.round((state.canvasSettings.width - elementWidth) / 2) };
          });
          const updatedSlides = state.slides.map((s, idx) =>
            idx === state.activeSlideIndex ? { ...s, elements: updatedElements } : s
          );
          return {
            ...history,
            elements: updatedElements,
            slides: updatedSlides,
          };
        }),

      alignCenterVertical: () =>
        set((state) => {
          if (!state.selectedElementId) return {};
          const history = recordHistory(state);
          const updatedElements = state.elements.map((el) => {
            if (el.id !== state.selectedElementId) return el;
            const elementHeight =
              el.height || (el.type === 'image' ? 250 : el.fontSize ? el.fontSize * 1.3 : 100);
            return { ...el, y: Math.round((state.canvasSettings.height - elementHeight) / 2) };
          });
          const updatedSlides = state.slides.map((s, idx) =>
            idx === state.activeSlideIndex ? { ...s, elements: updatedElements } : s
          );
          return {
            ...history,
            elements: updatedElements,
            slides: updatedSlides,
          };
        }),

      alignLeftMargin: () =>
        set((state) => {
          if (!state.selectedElementId) return {};
          const history = recordHistory(state);
          const updatedElements = state.elements.map((el) =>
            el.id === state.selectedElementId ? { ...el, x: 80 } : el
          );
          const updatedSlides = state.slides.map((s, idx) =>
            idx === state.activeSlideIndex ? { ...s, elements: updatedElements } : s
          );
          return {
            ...history,
            elements: updatedElements,
            slides: updatedSlides,
          };
        }),

      alignRightMargin: () =>
        set((state) => {
          if (!state.selectedElementId) return {};
          const history = recordHistory(state);
          const updatedElements = state.elements.map((el) => {
            if (el.id !== state.selectedElementId) return el;
            const elementWidth = el.width || (el.type === 'image' ? 250 : 500);
            return { ...el, x: state.canvasSettings.width - 80 - elementWidth };
          });
          const updatedSlides = state.slides.map((s, idx) =>
            idx === state.activeSlideIndex ? { ...s, elements: updatedElements } : s
          );
          return {
            ...history,
            elements: updatedElements,
            slides: updatedSlides,
          };
        }),

      addTagElement: (categoryText, colorHex) => {
        const id = crypto.randomUUID();
        const newElement: ImageElement = {
          id,
          type: 'text',
          content: categoryText.toUpperCase(),
          x: 80,
          y: 80,
          fontSize: 22,
          fontFamily: '"Inter", sans-serif',
          color: colorHex === '#FFFFFF' ? '#1A1A1A' : '#FFFFFF',
          fontWeight: 700,
          fontStyle: 'normal',
          textTransform: 'none',
          hasBadge: true,
          badgeColor: colorHex,
          tagShape: 'pill',
          borderRadius: '9999px',
        };
        set((state) => {
          const history = recordHistory(state);
          const updatedElements = [...state.elements, newElement];
          const updatedSlides = state.slides.map((s, idx) =>
            idx === state.activeSlideIndex ? { ...s, elements: updatedElements } : s
          );
          return {
            ...history,
            elements: updatedElements,
            slides: updatedSlides,
            selectedElementId: id,
          };
        });
        return id;
      },

      setSlidePhoto: (src) => {
        const targetIndex = get().activeSlideIndex;
        set((state) => {
          const history = recordHistory(state);
          const newPhoto: SlidePhoto = {
            src,
            scale: 1,
            x: 0,
            y: 0,
            opacity: 1,
            topGradient: 0.6,
            bottomGradient: 0.8,
            vignette: 0,
          };
          const updatedSlides = state.slides.map((s, idx) =>
            idx === state.activeSlideIndex ? { ...s, photo: newPhoto } : s
          );
          return {
            ...history,
            slides: updatedSlides,
            inspectingPhoto: true,
            selectedElementId: null,
          };
        });

        // Extrai as cores da imagem em background.
        // `src` pode ser uma referência `cgl-asset:`, que o <img> interno do
        // extractor não sabe carregar — resolvemos para o object URL real.
        extractColorsFromImage(resolveAsset(src)).then((colors) => {
          set((state) => {
            const currentSlide = state.slides[targetIndex];
            if (!currentSlide || !currentSlide.photo || currentSlide.photo.src !== src) return {};
            const updatedPhoto: SlidePhoto = {
              ...currentSlide.photo,
              extractedColors: colors,
            };
            const updatedSlides = state.slides.map((s, idx) =>
              idx === targetIndex ? { ...s, photo: updatedPhoto } : s
            );
            return { slides: updatedSlides };
          });
        });
      },

      harmonizeColorsWithPhoto: () => {
        const state = get();
        const currentSlide = state.slides[state.activeSlideIndex];
        if (!currentSlide || !currentSlide.photo) return;

        const applyColor = (vibrantColor: string) => {
          set((s) => {
            const history = recordHistory(s);
            const updatedElements = s.elements.map((el) => {
              // Atualizar cor de tags / categorias / badges
              if (el.hasBadge && el.badgeColor !== '#1A1A1A' && el.badgeColor !== 'rgba(0, 0, 0, 0.45)') {
                return { ...el, badgeColor: vibrantColor };
              }
              if (el.hasBadge && (el.tagShape === 'pill' || el.tagShape === 'ticket' || el.tagShape === 'stamp')) {
                return { ...el, badgeColor: vibrantColor };
              }
              // Se for um título com cor de destaque laranja/amarela CGL, harmonizar
              if (el.type === 'text' && (el.color === '#FE7D02' || el.color === '#FFC107' || el.color === '#00838F')) {
                return { ...el, color: vibrantColor };
              }
              return el;
            });

            const updatedSlides = s.slides.map((slide, idx) =>
              idx === s.activeSlideIndex ? { ...slide, elements: updatedElements } : slide
            );

            return {
              ...history,
              elements: updatedElements,
              slides: updatedSlides,
            };
          });
        };

        if (currentSlide.photo.extractedColors?.vibrant) {
          applyColor(currentSlide.photo.extractedColors.vibrant);
        } else {
          extractColorsFromImage(currentSlide.photo.src).then((colors) => {
            set((s) => {
              const slide = s.slides[s.activeSlideIndex];
              if (!slide || !slide.photo) return {};
              const updatedPhoto: SlidePhoto = {
                ...slide.photo,
                extractedColors: colors,
              };
              const updatedSlides = s.slides.map((sl, idx) =>
                idx === s.activeSlideIndex ? { ...sl, photo: updatedPhoto } : sl
              );
              return { slides: updatedSlides };
            });
            applyColor(colors.vibrant);
          });
        }
      },

      updateSlidePhoto: (partial) =>
        set((state) => {
          const currentSlide = state.slides[state.activeSlideIndex];
          if (!currentSlide || !currentSlide.photo) return {};
          const history = recordHistory(state);
          const updatedPhoto: SlidePhoto = { ...currentSlide.photo, ...partial };
          const updatedSlides = state.slides.map((s, idx) =>
            idx === state.activeSlideIndex ? { ...s, photo: updatedPhoto } : s
          );
          return { ...history, slides: updatedSlides };
        }),

      removeSlidePhoto: () =>
        set((state) => {
          const history = recordHistory(state);
          const updatedSlides = state.slides.map((s, idx) => {
            if (idx !== state.activeSlideIndex) return s;
            const updated = { ...s };
            delete updated.photo;
            return updated;
          });
          return {
            ...history,
            slides: updatedSlides,
            inspectingPhoto: false,
          };
        }),

      resetSlidePhotoPosition: () =>
        set((state) => {
          const currentSlide = state.slides[state.activeSlideIndex];
          if (!currentSlide || !currentSlide.photo) return {};
          const history = recordHistory(state);
          const updatedPhoto: SlidePhoto = {
            ...currentSlide.photo,
            scale: 1,
            x: 0,
            y: 0,
            opacity: 1,
            topGradient: 0.6,
            bottomGradient: 0.8,
            vignette: 0,
          };
          const updatedSlides = state.slides.map((s, idx) =>
            idx === state.activeSlideIndex ? { ...s, photo: updatedPhoto } : s
          );
          return { ...history, slides: updatedSlides };
        }),

      saveCurrentAsPreset: (name: string) =>
        set((state) => {
          const activePhoto = state.slides[state.activeSlideIndex]?.photo;
          const newPreset: CustomPreset = {
            id: crypto.randomUUID(),
            name:
              name.trim() ||
              `Modelo ${new Date().toLocaleDateString('pt-PT')} ${new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`,
            createdAt: new Date().toISOString(),
            format: state.canvasSettings.aspectRatio,
            background: {
              backgroundColor: state.canvasSettings.backgroundColor,
              backgroundImage: state.canvasSettings.backgroundImage,
              textureType: state.canvasSettings.textureType,
              textureOpacity: state.canvasSettings.textureOpacity,
            },
            elements: state.elements.map((el) => ({ ...el })),
            photo: activePhoto ? { ...activePhoto } : undefined,
          };

          return {
            customPresets: [newPreset, ...(state.customPresets || [])],
          };
        }),

      loadPreset: (presetId: string) =>
        set((state) => {
          const preset = (state.customPresets || []).find((p) => p.id === presetId);
          if (!preset) return {};

          const history = recordHistory(state);
          const dimensions = ASPECT_RATIO_DIMENSIONS[preset.format] || { width: 1080, height: 1080 };
          const clonedElements = preset.elements.map((el) => ({
            ...el,
            id: crypto.randomUUID(),
          }));

          const clonedPhoto = preset.photo ? { ...preset.photo } : undefined;

          const updatedSlides = state.slides.map((s, idx) => {
            if (idx !== state.activeSlideIndex) return s;
            return {
              ...s,
              elements: clonedElements,
              backgroundColor: preset.background.backgroundColor,
              backgroundImage: preset.background.backgroundImage,
              textureType: preset.background.textureType,
              textureOpacity: preset.background.textureOpacity,
              photo: clonedPhoto,
            };
          });

          return {
            ...history,
            elements: clonedElements,
            slides: updatedSlides,
            selectedElementId: null,
            canvasSettings: {
              ...state.canvasSettings,
              width: dimensions.width,
              height: dimensions.height,
              aspectRatio: preset.format,
              backgroundColor: preset.background.backgroundColor,
              backgroundImage: preset.background.backgroundImage,
              textureType: preset.background.textureType,
              textureOpacity: preset.background.textureOpacity,
            },
          };
        }),

      deletePreset: (presetId: string) =>
        set((state) => ({
          customPresets: (state.customPresets || []).filter((p) => p.id !== presetId),
        })),

      /**
         * Os presets exportados têm de ser portáveis.
         *
         * No estado, as imagens são referências `cgl-asset:` ao IndexedDB
         * deste browser. Num ficheiro `.json` levado para outra máquina essas
         * referências não apontam para nada, por isso as imagens voltam a ser
         * embutidas em base64 na exportação. Assíncrono por causa disso.
         */
      exportPresetsToJson: async () => {
        const inlined = await inlineAssetsForExport(get().customPresets || []);
        return JSON.stringify(inlined, null, 2);
      },

      importPresetsFromJson: async (jsonData: string) => {
        try {
          const raw = JSON.parse(jsonData);
          if (!Array.isArray(raw)) return false;
          // As imagens embutidas do ficheiro vão para IndexedDB; no estado
          // ficam referências, como em qualquer outra imagem.
          const parsed = (await storeAssetsFromImport(raw)) as unknown[];
          if (!Array.isArray(parsed)) return false;

          const isValidPreset = (p: unknown): p is CustomPreset => {
            if (!p || typeof p !== 'object') return false;
            const candidate = p as Partial<CustomPreset>;
            return Boolean(
              candidate.id &&
                candidate.name &&
                candidate.format &&
                candidate.background &&
                Array.isArray(candidate.elements)
            );
          };

          const validPresets: CustomPreset[] = parsed.filter(isValidPreset);
          if (validPresets.length === 0) return false;

          set((state) => {
            const existingIds = new Set((state.customPresets || []).map((p) => p.id));
            const newOnes = validPresets.filter((p) => !existingIds.has(p.id));
            return {
              customPresets: [...newOnes, ...(state.customPresets || [])],
            };
          });
          return true;
        } catch {
          return false;
        }
      },

      addSlide: () => {
        set((state) => {
          const history = recordHistory(state);
          const currentSlide: Slide = {
            id: state.slides[state.activeSlideIndex]?.id || crypto.randomUUID(),
            elements: state.elements,
            backgroundColor: state.canvasSettings.backgroundColor,
            backgroundImage: state.canvasSettings.backgroundImage,
            photo: state.slides[state.activeSlideIndex]?.photo,
            textureType: state.canvasSettings.textureType,
            textureOpacity: state.canvasSettings.textureOpacity,
            brandLogo: { ...state.brandLogo },
          };

          const newSlide: Slide = {
            id: crypto.randomUUID(),
            elements: [],
            backgroundColor: '#1A1A1A',
            backgroundImage: null,
            textureType: 'none',
            textureOpacity: 0.5,
            brandLogo: { ...state.brandLogo },
          };

          const tempSlides = state.slides.map((s, idx) =>
            idx === state.activeSlideIndex ? currentSlide : s
          );
          const updatedSlides = [...tempSlides, newSlide];
          const newIndex = updatedSlides.length - 1;

          return {
            ...history,
            slides: updatedSlides,
            activeSlideIndex: newIndex,
            elements: [],
            selectedElementId: null,
            brandLogo: { ...newSlide.brandLogo! },
            canvasSettings: {
              ...state.canvasSettings,
              backgroundColor: '#1A1A1A',
              backgroundImage: null,
              textureType: 'none',
              textureOpacity: 0.5,
            },
          };
        });
      },

      duplicateSlide: (index: number) => {
        set((state) => {
          const history = recordHistory(state);
          const currentSlide: Slide = {
            id: state.slides[state.activeSlideIndex]?.id || crypto.randomUUID(),
            elements: state.elements,
            backgroundColor: state.canvasSettings.backgroundColor,
            backgroundImage: state.canvasSettings.backgroundImage,
            photo: state.slides[state.activeSlideIndex]?.photo,
            textureType: state.canvasSettings.textureType,
            textureOpacity: state.canvasSettings.textureOpacity,
            brandLogo: { ...state.brandLogo },
          };
          const tempSlides = state.slides.map((s, idx) =>
            idx === state.activeSlideIndex ? currentSlide : s
          );

          const targetSlide = tempSlides[index];
          if (!targetSlide) return {};

          const duplicatedSlide: Slide = {
            id: crypto.randomUUID(),
            elements: targetSlide.elements.map((el) => ({ ...el, id: crypto.randomUUID() })),
            backgroundColor: targetSlide.backgroundColor,
            backgroundImage: targetSlide.backgroundImage,
            photo: targetSlide.photo ? { ...targetSlide.photo } : undefined,
            textureType: targetSlide.textureType,
            textureOpacity: targetSlide.textureOpacity,
            brandLogo: { ...(targetSlide.brandLogo || state.brandLogo) },
          };

          const updatedSlides = [...tempSlides];
          updatedSlides.splice(index + 1, 0, duplicatedSlide);

          return {
            ...history,
            slides: updatedSlides,
            activeSlideIndex: index + 1,
            elements: duplicatedSlide.elements,
            selectedElementId: null,
            brandLogo: { ...duplicatedSlide.brandLogo! },
            canvasSettings: {
              ...state.canvasSettings,
              backgroundColor: duplicatedSlide.backgroundColor,
              backgroundImage: duplicatedSlide.backgroundImage,
              textureType: duplicatedSlide.textureType,
              textureOpacity: duplicatedSlide.textureOpacity,
            },
          };
        });
      },

      deleteSlide: (index: number) => {
        set((state) => {
          if (state.slides.length <= 1) return {};

          const history = recordHistory(state);
          const updatedSlides = state.slides.filter((_, idx) => idx !== index);

          let newActiveIndex = state.activeSlideIndex;
          if (index === state.activeSlideIndex) {
            newActiveIndex = Math.max(0, index - 1);
          } else if (index < state.activeSlideIndex) {
            newActiveIndex = state.activeSlideIndex - 1;
          }

          const nextSlide = updatedSlides[newActiveIndex];

          return {
            ...history,
            slides: updatedSlides,
            activeSlideIndex: newActiveIndex,
            elements: nextSlide ? nextSlide.elements : [],
            selectedElementId: null,
            canvasSettings: {
              ...state.canvasSettings,
              backgroundColor: nextSlide ? nextSlide.backgroundColor : '#1A1A1A',
              backgroundImage: nextSlide ? nextSlide.backgroundImage : null,
              textureType: nextSlide ? nextSlide.textureType : 'none',
              textureOpacity: nextSlide ? nextSlide.textureOpacity : 0.5,
            },
            brandLogo: { ...(nextSlide?.brandLogo || state.brandLogo) },
          };
        });
      },

      setActiveSlide: (index: number) => {
        set((state) => {
          if (index < 0 || index >= state.slides.length || index === state.activeSlideIndex) {
            return {};
          }

          // Guardar estado do slide atual antes de alternar
          const currentSlide: Slide = {
            id: state.slides[state.activeSlideIndex]?.id || crypto.randomUUID(),
            elements: state.elements,
            backgroundColor: state.canvasSettings.backgroundColor,
            backgroundImage: state.canvasSettings.backgroundImage,
            photo: state.slides[state.activeSlideIndex]?.photo,
            textureType: state.canvasSettings.textureType,
            textureOpacity: state.canvasSettings.textureOpacity,
            brandLogo: { ...state.brandLogo },
          };

          const tempSlides = state.slides.map((s, idx) =>
            idx === state.activeSlideIndex ? currentSlide : s
          );
          const targetSlide = tempSlides[index];

          return {
            slides: tempSlides,
            activeSlideIndex: index,
            elements: targetSlide.elements,
            selectedElementId: null,
            canvasSettings: {
              ...state.canvasSettings,
              backgroundColor: targetSlide.backgroundColor,
              backgroundImage: targetSlide.backgroundImage,
              textureType: targetSlide.textureType,
              textureOpacity: targetSlide.textureOpacity,
            },
            brandLogo: { ...(targetSlide.brandLogo || state.brandLogo) },
          };
        });
      },

      autoFillEvent: (parsedData: ParsedEvent) => {
        set((state) => {
          const history = recordHistory(state);
          const isLight = (hex: string) => {
            const clean = hex.replace('#', '');
            const r = parseInt(clean.substring(0, 2), 16) || 0;
            const g = parseInt(clean.substring(2, 4), 16) || 0;
            const b = parseInt(clean.substring(4, 6), 16) || 0;
            return (r * 299 + g * 587 + b * 114) / 1000 > 128;
          };

          const isBgLight = isLight(state.canvasSettings.backgroundColor);
          const textColor = isBgLight ? '#1A1A1A' : '#FFFFFF';

          const remainingElements = state.elements.filter((el) => {
            if (el.type === 'text') {
              const lower = (el.content || '').toLowerCase();
              if (
                lower.includes('música') ||
                lower.includes('teatro') ||
                lower.includes('exposição') ||
                lower.includes('cinema') ||
                lower.includes('famílias') ||
                lower.includes('ar livre') ||
                lower.includes('entrada livre') ||
                lower.includes('categoria')
              )
                return false;
              if (
                el.fontSize &&
                el.fontSize >= 50 &&
                (el.y < 350 || el.content === 'Novo Título')
              )
                return false;
              if (lower.includes('data') || lower.includes('local') || lower.includes('chiado'))
                return false;
            }
            return true;
          });

          const newElements: ImageElement[] = [];

          // 1. Tag de Categoria
          if (parsedData.category) {
            const badgeColor = parsedData.categoryColor || '#FE7D02';
            newElements.push({
              id: crypto.randomUUID(),
              type: 'text',
              content: parsedData.category.toUpperCase(),
              x: 80,
              y: 80,
              fontSize: 22,
              fontFamily: '"Inter", sans-serif',
              color: badgeColor === '#FFFFFF' ? '#1A1A1A' : '#FFFFFF',
              fontWeight: 700,
              fontStyle: 'normal',
              textTransform: 'none',
              hasBadge: true,
              badgeColor,
              tagShape: 'pill',
              borderRadius: '9999px',
            });
          }

          // 2. Título Principal
          if (parsedData.title) {
            newElements.push({
              id: crypto.randomUUID(),
              type: 'text',
              content: parsedData.title,
              x: 80,
              y: 180,
              fontSize: 76,
              fontFamily: '"Bricolage Grotesque", sans-serif',
              color: isBgLight ? '#FE7D02' : '#FFFFFF',
              fontWeight: 700,
              fontStyle: 'normal',
              textTransform: 'none',
            });
          }

          // 3. Informações de Data / Horário / Local
          const infoLines: string[] = [];
          if (parsedData.date) infoLines.push(`📅  ${parsedData.date}`);
          if (parsedData.venue) infoLines.push(`📍  ${parsedData.venue}`);

          if (infoLines.length > 0) {
            newElements.push({
              id: crypto.randomUUID(),
              type: 'text',
              content: infoLines.join('\n'),
              x: 80,
              y: 440,
              fontSize: 32,
              fontFamily: '"Inter", sans-serif',
              color: textColor,
              fontWeight: 400,
              fontStyle: 'normal',
              textTransform: 'none',
            });
          }

          // 4. Se isFree for verdadeiro, injetar sticker 'ENTRADA LIVRE' no canto inferior esquerdo
          if (parsedData.isFree) {
            const freeSticker = STICKERS.find((s) => s.id === 'selo-livre') || STICKERS[3];
            if (freeSticker) {
              newElements.push({
                id: crypto.randomUUID(),
                type: 'image',
                src: freeSticker.svgUri,
                x: 80,
                y: Math.max(760, state.canvasSettings.height - 220),
                width: 250,
                height: 100,
                rotation: -3,
              });
            }
          }

          const combinedElements = [...remainingElements, ...newElements];

          const updatedSlides = state.slides.map((s, idx) =>
            idx === state.activeSlideIndex ? { ...s, elements: combinedElements } : s
          );

          return {
            ...history,
            elements: combinedElements,
            slides: updatedSlides,
            selectedElementId: null,
          };
        });
      },

      resetProject: () => {
        if (
          typeof window !== 'undefined' &&
          !window.confirm('Tens a certeza de que desejas limpar o projeto atual e começar um novo?')
        ) {
          return;
        }

        const defaultSlide: Slide = {
          id: crypto.randomUUID(),
          elements: [
            {
              id: crypto.randomUUID(),
              type: 'text',
              content: 'A cultura\nvive na cidade.',
              x: 80,
              y: 100,
              fontSize: 84,
              fontFamily: '"Bricolage Grotesque", sans-serif',
              color: '#FE7D02',
              textAlign: 'left',
              fontWeight: 700,
              fontStyle: 'normal',
              textTransform: 'none',
            },
          ],
          backgroundColor: '#1A1A1A',
          backgroundImage: null,
          textureType: 'none',
          textureOpacity: 0.5,
          brandLogo: createDefaultBrandLogo(),
        };

        set({
          slides: [defaultSlide],
          activeSlideIndex: 0,
          elements: defaultSlide.elements,
          selectedElementId: null,
          inspectingPhoto: false,
          past: [],
          future: [],
          canUndo: false,
          canRedo: false,
          lastSavedAt: Date.now(),
          canvasSettings: {
            width: 1080,
            height: 1080,
            backgroundColor: '#1A1A1A',
            backgroundImage: null,
            aspectRatio: '1:1',
            showSafeZones: false,
            textureType: 'none',
            textureOpacity: 0.5,
            zoom: 0.42,
          },
          brandLogo: createDefaultBrandLogo(),
        });
      },
    }),
    {
      name: 'cgl_editor_state',
      version: 5,
      storage: createJSONStorage(() => editorStorage),
      /**
       * O histórico NÃO é persistido.
       *
       * Cada snapshot de `past` guarda uma cópia completa dos slides, e as
       * fotografias vivem no estado como data URLs base64. Persistir 15
       * snapshots multiplicava por 16 o volume escrito — uma única foto de
       * 2 MB passava a ~43 MB, muito acima da quota de ~5 MB do localStorage.
       * O Undo/Redo continua a funcionar durante a sessão; só não atravessa
       * um recarregamento da página, o que ninguém espera que aconteça.
       */
      partialize: (state) => ({
        canvasSettings: state.canvasSettings,
        brandLogo: state.brandLogo,
        elements: state.elements,
        selectedElementId: state.selectedElementId,
        customPresets: state.customPresets,
        slides: state.slides,
        activeSlideIndex: state.activeSlideIndex,
      }),
      /** Descarta o histórico gigante deixado pelas versões anteriores. */
      migrate: (persisted) => {
        const legacy = persisted as Partial<AppState>;
        const fallbackLogo = normalizeOfficialBrandLogo(legacy.brandLogo || createDefaultBrandLogo());
        return {
          ...legacy,
          brandLogo: fallbackLogo,
          slides: (legacy.slides || []).map((slide) => ({
            ...slide,
            brandLogo: normalizeOfficialBrandLogo(slide.brandLogo || { ...fallbackLogo }),
          })),
          past: [],
          future: [],
          canUndo: false,
          canRedo: false,
        };
      },
    }
  )
);

/**
 * Liga o resultado real das escritas ao estado, para o indicador de auto-save
 * poder dizer a verdade em vez de assumir sucesso.
 *
 * A guarda de igualdade é essencial: escrever no estado desencadeia uma nova
 * escrita no storage, que volta a notificar. Só atualizamos quando a mensagem
 * muda, o que faz o ciclo parar ao fim de uma iteração.
 */
onStorageStatus((status) => {
  const current = useStore.getState().saveError;
  if (status.ok) {
    if (current !== null) useStore.setState({ saveError: null });
    return;
  }
  if (current !== status.message) {
    useStore.setState({ saveError: status.message });
  }
});
