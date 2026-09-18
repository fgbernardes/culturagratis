export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:5';

export type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

export type LogoBackgroundHighlight =
  | 'none'
  | 'white-circle'
  | 'orange-circle'
  | 'yellow-circle'
  | 'tejo-circle'
  | 'charcoal-circle'
  | 'dark-pill';

export type LogoColorMode = 'original' | 'white' | 'black';

export type LogoShape = 'circle' | 'original';

export type TagShape = 'rounded' | 'pill' | 'ticket' | 'stamp' | 'glass';

export type PhotoFilter = 'none' | 'bw' | 'vintage' | 'night';

export interface BrandLogo {
  src: string | null;
  visible: boolean;
  position: LogoPosition;
  size: number;
  opacity: number;
  margin: number;
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay';
  backgroundHighlight?: LogoBackgroundHighlight;
  logoColorMode?: LogoColorMode;
  logoShape?: LogoShape;
  removeWhiteBg?: boolean;
}

export interface ImageElement {
  id: string;
  type: 'text' | 'image';
  content?: string;
  src?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  rotation?: number;
  opacity?: number;
  textAlign?: 'left' | 'center' | 'right';
  hasShadow?: boolean;
  hasBadge?: boolean;
  badgeColor?: string;
  tagShape?: TagShape;
  isGlass?: boolean;
  fontWeight?: string | number;
  fontStyle?: 'normal' | 'italic';
  textTransform?: 'none' | 'uppercase' | 'lowercase';
  borderRadius?: string;
  backgroundStyle?: 'none' | 'glass' | 'solid';
  isCalendarBadge?: boolean;
  calendarMonth?: string;
  calendarDay?: string;
}

export type CanvasElement = ImageElement;

export interface ExtractedColors {
  dominant: string;
  vibrant: string;
  palette: string[];
}

export interface SlidePhoto {
  src: string;
  scale: number;    // Zoom (ex: 1 = 100%, 0.5 a 3)
  x: number;        // Deslocamento horizontal
  y: number;        // Deslocamento vertical
  opacity: number;  // 0 a 1
  topGradient?: number;    // Opacidade do degradé superior (0 a 1, padrão: 0.6)
  bottomGradient?: number; // Opacidade do degradé inferior (0 a 1, padrão: 0.8)
  vignette?: number;       // Escurecimento geral/vinheta (0 a 1, padrão: 0)
  filter?: PhotoFilter;    // Filtro de fotografia ('none' | 'bw' | 'vintage' | 'night')
  extractedColors?: ExtractedColors; // Cores extraídas da fotografia
}

export interface BackgroundSettings {
  backgroundColor: string;
  backgroundImage: string | null;
  textureType: TextureType;
  textureOpacity: number;
}

export interface Slide {
  id: string;
  elements: ImageElement[];
  /** Definições de marca próprias deste slide. */
  brandLogo?: BrandLogo;
  backgroundColor: string;
  backgroundImage: string | null;
  photo?: SlidePhoto;
  textureType: TextureType;
  textureOpacity: number;
}

export interface CustomPreset {
  id: string;
  name: string;
  createdAt: string;
  format: AspectRatio;
  background: BackgroundSettings;
  elements: ImageElement[];
  photo?: SlidePhoto;
}

export interface ParsedEvent {
  title: string;
  date?: string;
  venue?: string;
  category?: string;
  categoryColor?: string;
  isFree?: boolean;
}

export type ParsedEventData = ParsedEvent;

export type TextureType = 'none' | 'noise' | 'calcada';

export interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage: string | null;
  aspectRatio: AspectRatio;
  showSafeZones: boolean;
  showProgressBar?: boolean;
  textureType: TextureType;
  textureOpacity: number;
  zoom: number;
}

export interface HistorySnapshot {
  slides: Slide[];
  activeSlideIndex: number;
  elements: ImageElement[];
  canvasSettings: CanvasSettings;
  brandLogo: BrandLogo;
}
