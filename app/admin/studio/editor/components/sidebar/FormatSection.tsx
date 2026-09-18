import React from 'react';
import { useStore } from '../../store/useStore';
import type { AspectRatio } from '../../types';
import { ShieldCheck, Instagram, Smartphone, Square, Monitor, Maximize2, Layers } from 'lucide-react';

interface FormatSectionProps {
  isOpen: boolean;
  onToggle: () => void;
}

const PLATFORMS: {
  ratio: AspectRatio;
  label: string;
  sub: string;
  res: string;
  isRecommended?: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  {
    ratio: '4:5',
    label: 'Instagram Feed Vertical',
    sub: 'Feed Vertical',
    res: '1080×1350',
    isRecommended: true,
    icon: Instagram,
  },
  {
    ratio: '1:1',
    label: 'Instagram Feed Quadrado',
    sub: 'Feed / WhatsApp',
    res: '1080×1080',
    icon: Square,
  },
  {
    ratio: '9:16',
    label: 'Stories / Reels / TikTok',
    sub: 'Vertical 9:16',
    res: '1080×1920',
    icon: Smartphone,
  },
  {
    ratio: '16:9',
    label: 'Paisagem / X / Facebook',
    sub: 'Capa / Banner',
    res: '1920×1080',
    icon: Monitor,
  },
];

export const FormatSection: React.FC<FormatSectionProps> = ({ isOpen, onToggle }) => {
  const { canvasSettings, setAspectRatio, setCanvasSettings, toggleSafeZones, toggleProgressBar } = useStore();

  const handleFitToScreen = () => {
    if (typeof window === 'undefined') return;

    // Dimensões úteis do viewport (descontando barra lateral ~320px, slide manager inferior ~120px e margens generosas)
    const availableWidth = Math.max(300, window.innerWidth - 320 - 160);
    const availableHeight = Math.max(300, window.innerHeight - 130 - 160);

    const zoomX = availableWidth / canvasSettings.width;
    const zoomY = availableHeight / canvasSettings.height;

    // Usa a menor escala para garantir que nada é cortado
    const idealZoom = Math.min(zoomX, zoomY);
    const clampedZoom = Math.max(0.15, Math.min(1.2, Math.round(idealZoom * 100) / 100));

    setCanvasSettings({ zoom: clampedZoom });
  };

  return (
    <section className="flex flex-col gap-2 pb-2 border-b border-zinc-900">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left py-1"
      >
        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 cursor-pointer">
          Formato & Plataforma
        </label>
        <span className="text-zinc-500 text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="flex flex-col gap-2.5 animate-fadeIn">
          {/* Header com Toggle de Zonas Seguras e Barra de Progresso */}
          <div className="flex items-center justify-between gap-1.5">
            <button
              onClick={toggleSafeZones}
              className={`flex-1 text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 px-2 py-1 rounded transition cursor-pointer ${
                canvasSettings.showSafeZones
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/30'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
              title="Mostrar / Ocultar Guias de Zonas Seguras das Redes"
            >
              <ShieldCheck size={12} className={canvasSettings.showSafeZones ? 'text-emerald-400' : 'text-zinc-400'} />
              Zonas Seguras
            </button>

            <button
              onClick={toggleProgressBar}
              className={`flex-1 text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 px-2 py-1 rounded transition cursor-pointer ${
                canvasSettings.showProgressBar
                  ? 'bg-cgl-orange/20 text-cgl-orange border border-cgl-orange/50 shadow-sm ring-1 ring-cgl-orange/30'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
              title="Mostrar / Ocultar Barra de Progresso no topo do Carrossel"
            >
              <Layers size={12} className={canvasSettings.showProgressBar ? 'text-cgl-orange' : 'text-zinc-400'} />
              Progresso
            </button>
          </div>

          {/* Grelha 2x2 com Seletor Rápido de Plataforma */}
          <div className="grid grid-cols-2 gap-2">
            {PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              const isSelected = canvasSettings.aspectRatio === platform.ratio;

              return (
                <button
                  key={platform.ratio}
                  onClick={() => setAspectRatio(platform.ratio)}
                  className={`flex flex-col p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cgl-orange/20 border-cgl-orange text-white ring-1 ring-cgl-orange/40 shadow-sm'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Icon size={15} className={isSelected ? 'text-cgl-orange' : 'text-zinc-400'} />
                      {platform.isRecommended && (
                        <span className="text-[8px] font-bold px-1 py-0.2 bg-cgl-orange/20 text-cgl-orange border border-cgl-orange/40 rounded uppercase">
                          Top
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono font-bold text-zinc-400">
                      {platform.ratio}
                    </span>
                  </div>
                  <span className="text-xs font-bold leading-tight truncate text-zinc-200">
                    {platform.label}
                  </span>
                  <div className="flex items-center justify-between mt-1 text-[9px] text-zinc-500 font-mono">
                    <span>{platform.sub}</span>
                    <span>{platform.res}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Slider de Zoom do Canvas com Botão Ajustar ao Ecrã */}
          <div className="flex flex-col gap-2 p-2 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase text-zinc-400">Zoom do Canvas</span>
                <span className="text-xs text-cgl-orange font-mono font-bold">
                  {Math.round(canvasSettings.zoom * 100)}%
                </span>
              </div>

              {/* Botão Ajustar ao Ecrã */}
              <button
                onClick={handleFitToScreen}
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-zinc-800 hover:bg-cgl-orange hover:text-cgl-black text-zinc-300 rounded border border-zinc-700 transition cursor-pointer shadow-xs"
                title="Ajustar automaticamente o zoom para caber 100% no ecrã"
              >
                <Maximize2 size={11} />
                <span>Ajustar ao Ecrã</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.15"
                max="1.5"
                step="0.05"
                value={canvasSettings.zoom}
                onChange={(e) => setCanvasSettings({ zoom: parseFloat(e.target.value) })}
                className="flex-1 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Presets rápidos de zoom */}
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              {[0.35, 0.5, 0.75, 1].map((z) => (
                <button
                  key={z}
                  onClick={() => setCanvasSettings({ zoom: z })}
                  className={`text-[9px] px-2 py-0.5 rounded border transition cursor-pointer ${
                    Math.abs(canvasSettings.zoom - z) < 0.02
                      ? 'bg-cgl-orange/20 border-cgl-orange text-cgl-orange font-bold'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {Math.round(z * 100)}%
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
