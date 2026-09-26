import React, { useRef } from 'react';
import { useStore } from '../../store/useStore';
import type { LogoPosition, LogoBackgroundHighlight, LogoColorMode } from '../../types';
import { storeAsset } from '../../utils/assetStore';
import { Upload, Eye, EyeOff, Sparkles, Palette, RotateCcw, Wand2 } from 'lucide-react';

interface LogoSectionProps {
  isOpen: boolean;
  onToggle: () => void;
}

const POSITIONS: { pos: LogoPosition; label: string; short: string }[] = [
  { pos: 'top-left', label: 'Superior Esquerdo', short: 'TL' },
  { pos: 'top-right', label: 'Superior Direito', short: 'TR' },
  { pos: 'center', label: 'Centro', short: 'CTR' },
  { pos: 'bottom-left', label: 'Inferior Esquerdo', short: 'BL' },
  { pos: 'bottom-right', label: 'Inferior Direito', short: 'BR' },
];

const OFFICIAL_LOGOS = [
  { src: '/cgl-logos/com-lettering-cores.png', label: 'Cores + lettering', size: 210, tone: 'bg-cgl-orange/20 border-cgl-orange text-cgl-orange' },
  { src: '/cgl-logos/com-lettering-preto-branco.png', label: 'P&B + lettering', size: 210, tone: 'bg-zinc-700/60 border-zinc-400 text-white' },
  { src: '/cgl-logos/com-lettering-negativo.png', label: 'Negativo + lettering', size: 210, tone: 'bg-white/20 border-white text-white' },
  { src: '/cgl-emblem.png', label: 'Cores sem lettering', size: 140, tone: 'bg-cgl-orange/20 border-cgl-orange text-cgl-orange' },
  { src: '/cgl-logos/sem-lettering-preto-branco.png', label: 'P&B sem lettering', size: 140, tone: 'bg-zinc-700/60 border-zinc-400 text-white' },
  { src: '/cgl-logos/sem-lettering-negativo.png', label: 'Negativo sem lettering', size: 140, tone: 'bg-white/20 border-white text-white' },
] as const;

const HIGHLIGHTS: { value: LogoBackgroundHighlight; label: string; swatch: string }[] = [
  { value: 'none', label: 'Transparente', swatch: 'bg-zinc-700' },
  { value: 'white-circle', label: 'Branco', swatch: 'bg-white' },
  { value: 'orange-circle', label: 'Laranja', swatch: 'bg-cgl-orange' },
  { value: 'yellow-circle', label: 'Amarelo', swatch: 'bg-cgl-yellow' },
  { value: 'tejo-circle', label: 'Azul Tejo', swatch: 'bg-[#00838F]' },
  { value: 'charcoal-circle', label: 'Carvão', swatch: 'bg-zinc-950 border border-zinc-500' },
  { value: 'dark-pill', label: 'Pílula escura', swatch: 'bg-zinc-900 border border-zinc-600' },
];

export const LogoSection: React.FC<LogoSectionProps> = ({ isOpen, onToggle }) => {
  const { brandLogo, setBrandLogo, setLogoPosition, resetBrandLogo } = useStore();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBrandLogo({ src: await storeAsset(file), visible: true, removeWhiteBg: true });
    e.target.value = '';
  };

  const currentHighlight: LogoBackgroundHighlight = brandLogo.backgroundHighlight || 'none';
  const currentColorMode: LogoColorMode = brandLogo.logoColorMode || 'original';
  const currentSize = brandLogo.size || 140;
  const currentOpacity = brandLogo.opacity !== undefined ? brandLogo.opacity : 1;

  return (
    <section className="flex flex-col gap-2 pb-2 border-b border-zinc-900 animate-fadeIn">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left py-1"
      >
        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 cursor-pointer">
          Logótipo CGL
        </label>
        <span className="text-zinc-500 text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="flex flex-col gap-2.5 animate-fadeIn">
          {/* Seleção de Logos Oficiais CGL */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
              Modelos Oficiais CGL
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {OFFICIAL_LOGOS.map((logo) => (
                <button
                  key={logo.src}
                  onClick={() => setBrandLogo({ src: logo.src, visible: true, logoShape: 'original', size: logo.size, removeWhiteBg: false, logoColorMode: 'original' })}
                  className={`py-1.5 px-2 text-[10px] font-bold rounded border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    brandLogo.src === logo.src && brandLogo.visible
                      ? `${logo.tone} ring-1 ring-current/30`
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  {logo.label}
                </button>
              ))}
            </div>
          </div>

          {/* Upload e Visibilidade */}
          <div className="flex gap-2">
            <button
              onClick={() => logoInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 rounded-lg transition cursor-pointer text-zinc-200"
            >
              <Upload size={13} /> {brandLogo.src ? 'Substituir Ficheiro' : 'Upload Logo'}
            </button>
            {brandLogo.src && (
              <button
                onClick={() => setBrandLogo({ visible: !brandLogo.visible })}
                className={`px-3 rounded-lg border transition cursor-pointer flex items-center justify-center ${
                  brandLogo.visible
                    ? 'bg-zinc-900 border-zinc-750 text-emerald-400 hover:bg-zinc-800'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
                title={brandLogo.visible ? 'Ocultar Logótipo' : 'Mostrar Logótipo'}
              >
                {brandLogo.visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            )}
          </div>

          {/* Interruptor: Remover Fundo Branco Automaticamente */}
          {brandLogo.src && (
            <label className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer group">
              <div className="flex items-center gap-2">
                <Wand2 size={13} className="text-cgl-yellow group-hover:scale-110 transition-transform" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-zinc-200">
                    Remover Fundo Branco
                  </span>
                  <span className="text-[9px] text-zinc-500">
                    Transparência automática em tempo real
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={brandLogo.removeWhiteBg || false}
                onChange={(e) => setBrandLogo({ removeWhiteBg: e.target.checked })}
                className="w-4 h-4 rounded bg-zinc-950 border-zinc-700 text-cgl-orange focus:ring-cgl-orange cursor-pointer accent-cgl-orange"
              />
            </label>
          )}

          {brandLogo.src && brandLogo.visible && (
            <div className="flex flex-col gap-2.5 pt-2 border-t border-zinc-855">
              {/* Variante de Cor do Logótipo (Original / Monocromático Branco / Monocromático Preto) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Palette size={11} className="text-cgl-yellow" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                      Modo de Cor do Logo
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase">
                    {currentColorMode === 'white'
                      ? 'Branco'
                      : currentColorMode === 'black'
                      ? 'Preto'
                      : 'Original'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => setBrandLogo({ logoColorMode: 'original' })}
                    className={`py-1.5 px-1 rounded border text-center transition cursor-pointer flex flex-col items-center gap-0.5 ${
                      currentColorMode === 'original'
                        ? 'bg-cgl-orange/20 border-cgl-orange text-cgl-orange font-bold ring-1 ring-cgl-orange/30'
                        : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Cores originais da marca"
                  >
                    <span className="text-xs">🎨</span>
                    <span className="text-[9px] truncate">Original</span>
                  </button>

                  <button
                    onClick={() => setBrandLogo({ logoColorMode: 'white' })}
                    className={`py-1.5 px-1 rounded border text-center transition cursor-pointer flex flex-col items-center gap-0.5 ${
                      currentColorMode === 'white'
                        ? 'bg-white/20 border-white text-white font-bold ring-1 ring-white/30'
                        : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Monocromático Branco Puro"
                  >
                    <span className="text-xs">⚪</span>
                    <span className="text-[9px] truncate">Branco</span>
                  </button>

                  <button
                    onClick={() => setBrandLogo({ logoColorMode: 'black' })}
                    className={`py-1.5 px-1 rounded border text-center transition cursor-pointer flex flex-col items-center gap-0.5 ${
                      currentColorMode === 'black'
                        ? 'bg-zinc-700/60 border-zinc-500 text-white font-bold ring-1 ring-zinc-400/30'
                        : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Monocromático Preto Puro"
                  >
                    <span className="text-xs">⚫</span>
                    <span className="text-[9px] truncate">Preto</span>
                  </button>
                </div>
              </div>

              {/* Formato do Logo (Círculo Perfeito / Quadrado Original) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                    Recorte / Formato do Logo
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase">
                    {brandLogo.logoShape === 'original' ? 'Quadrado' : 'Círculo'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setBrandLogo({ logoShape: 'circle' })}
                    className={`py-1.5 px-2 rounded border text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      brandLogo.logoShape !== 'original'
                        ? 'bg-cgl-orange/20 border-cgl-orange text-cgl-orange font-bold ring-1 ring-cgl-orange/30'
                        : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Recorte circular perfeito para eliminar o quadrado branco"
                  >
                    <span className="text-xs">⚪</span>
                    <span className="text-[10px] font-bold truncate">Círculo Perfeito</span>
                  </button>

                  <button
                    onClick={() => setBrandLogo({ logoShape: 'original' })}
                    className={`py-1.5 px-2 rounded border text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      brandLogo.logoShape === 'original'
                        ? 'bg-white/20 border-white text-white font-bold ring-1 ring-white/30'
                        : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Formato original sem corte circular"
                  >
                    <span className="text-xs">⬛</span>
                    <span className="text-[10px] font-bold truncate">Quadrado Original</span>
                  </button>
                </div>
              </div>

              {/* Fundo de Realce do Logótipo (Garante visibilidade sobre fotos escuras/claras) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Sparkles size={11} className="text-cgl-orange" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                      Realce & Fundo do Logo
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase">
                    {HIGHLIGHTS.find((highlight) => highlight.value === currentHighlight)?.label || 'Transparente'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1">
                  {HIGHLIGHTS.map((highlight) => (
                    <button
                      key={highlight.value}
                      onClick={() => setBrandLogo({ backgroundHighlight: highlight.value })}
                      className={`py-1.5 px-1 rounded border text-center transition cursor-pointer flex flex-col items-center gap-0.5 ${
                        currentHighlight === highlight.value
                          ? 'border-cgl-orange text-white font-bold ring-1 ring-cgl-orange/30 bg-zinc-800'
                          : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200'
                      }`}
                      title={`Fundo ${highlight.label}`}
                    >
                      <span className={`w-3 h-3 rounded-full ${highlight.swatch}`}></span>
                      <span className="text-[9px] truncate">{highlight.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider de Tamanho do Logo (60px a 480px) */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                    Tamanho do Logo
                  </span>
                  <span className="text-xs font-mono text-zinc-300 font-bold">
                    {currentSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="480"
                  step="5"
                  value={currentSize}
                  onChange={(e) => setBrandLogo({ size: parseInt(e.target.value) })}
                  className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Slider de Opacidade (0% a 100%) */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                    Opacidade
                  </span>
                  <span className="text-xs font-mono text-zinc-300 font-bold">
                    {Math.round(currentOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={currentOpacity}
                  onChange={(e) => setBrandLogo({ opacity: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Posição no Canvas */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                  Posicionamento
                </span>
                <div className="grid grid-cols-5 gap-1">
                  {POSITIONS.map((item) => (
                    <button
                      key={item.pos}
                      onClick={() => setLogoPosition(item.pos)}
                      className={`py-1 text-[10px] font-mono rounded border transition cursor-pointer ${
                        brandLogo.position === item.pos
                          ? 'bg-cgl-orange border-cgl-orange text-cgl-black font-bold shadow-xs'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                      title={item.label}
                    >
                      {item.short}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botão Repor Logótipo Original */}
              <button
                onClick={resetBrandLogo}
                className="w-full mt-1 py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded text-[10px] font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
                title="Reiniciar logótipo oficial no canto inferior direito"
              >
                <RotateCcw size={11} />
                ⟳ Repor Logótipo Original
              </button>
            </div>
          )}

          <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
        </div>
      )}
    </section>
  );
};
