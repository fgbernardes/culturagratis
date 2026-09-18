import React, { useRef } from 'react';
import { useStore } from '../../store/useStore';
import { resolveAsset, storeAsset } from '../../utils/assetStore';
import {
  Camera,
  Trash2,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Crosshair,
  Plus,
  Minus,
  SunMedium,
  Sparkles,
  Wand2,
  Palette,
} from 'lucide-react';

interface PhotoEditorSectionProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const PhotoEditorSection: React.FC<PhotoEditorSectionProps> = ({ isOpen, onToggle }) => {
  const {
    slides,
    activeSlideIndex,
    setSlidePhoto,
    updateSlidePhoto,
    removeSlidePhoto,
    resetSlidePhotoPosition,
    harmonizeColorsWithPhoto,
  } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePhoto = slides[activeSlideIndex]?.photo;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // A fotografia vai para IndexedDB; no estado fica só a referência.
    setSlidePhoto(await storeAsset(file));
    e.target.value = '';
  };

  const scale = activePhoto?.scale ?? 1;
  const x = activePhoto?.x ?? 0;
  const y = activePhoto?.y ?? 0;
  const opacity = activePhoto?.opacity ?? 1;
  const topGradient = activePhoto?.topGradient ?? 0.6;
  const bottomGradient = activePhoto?.bottomGradient ?? 0.8;
  const vignette = activePhoto?.vignette ?? 0;
  const activeFilter = activePhoto?.filter ?? 'none';

  const handleZoom = (delta: number) => {
    const newScale = Math.min(3, Math.max(0.5, parseFloat((scale + delta).toFixed(2))));
    updateSlidePhoto({ scale: newScale });
  };

  const handleMove = (dx: number, dy: number) => {
    updateSlidePhoto({
      x: x + dx,
      y: y + dy,
    });
  };

  return (
    <>
      <hr className="border-zinc-800" />
      <section className="flex flex-col gap-2">
        <button
          onClick={onToggle}
          className="flex items-center justify-between w-full text-left py-1"
        >
          <div className="flex items-center gap-1.5">
            <Camera size={13} className="text-cgl-orange" />
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 cursor-pointer">
              Fotografia Principal
            </label>
          </div>
          <div className="flex items-center gap-2">
            {activePhoto && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSlidePhoto();
                }}
                className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer"
                title="Remover Fotografia"
              >
                <Trash2 size={13} />
              </button>
            )}
            <span className="text-zinc-500 text-xs">{isOpen ? '▲' : '▼'}</span>
          </div>
        </button>

        {isOpen && (
          <div className="flex flex-col gap-3 mt-1 animate-fadeIn">
            {/* Input oculto de ficheiro */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {!activePhoto ? (
              /* Botão de Upload quando não há foto */
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3 px-3 border-2 border-dashed border-zinc-700 hover:border-cgl-orange/60 bg-zinc-900/50 hover:bg-zinc-900 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer"
              >
                <Camera size={16} className="text-cgl-orange" />
                + Carregar Fotografia
              </button>
            ) : (
              /* Controlos completos quando existe fotografia */
              <div className="flex flex-col gap-3">
                {/* Mini Thumbnail com Botão de Substituição */}
                <div className="flex items-center gap-3 p-2 bg-zinc-900/70 rounded-lg border border-zinc-800">
                  <img
                    src={resolveAsset(activePhoto.src)}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded border border-zinc-700 shrink-0"
                  />
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <span className="text-[11px] font-bold text-zinc-200 truncate">Foto Carregada</span>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] text-cgl-orange hover:underline text-left font-medium cursor-pointer"
                    >
                      Trocar Fotografia
                    </button>
                  </div>
                </div>

                {/* Botão de Harmonização de Cores com a Foto */}
                <button
                  onClick={harmonizeColorsWithPhoto}
                  className="w-full flex items-center justify-between py-2 px-3 bg-gradient-to-r from-cgl-orange/20 via-cgl-yellow/20 to-cgl-blue/20 hover:from-cgl-orange/30 hover:to-cgl-blue/30 border border-cgl-orange/40 hover:border-cgl-orange rounded-lg text-xs font-bold text-white transition shadow-sm cursor-pointer"
                  title="Deteta a cor vibrante da fotografia e aplica automaticamente às etiquetas e destaques"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Palette size={14} className="text-cgl-orange shrink-0" />
                    <span className="truncate">Harmonizar Cores com a Foto</span>
                  </div>
                  {activePhoto.extractedColors?.vibrant && (
                    <div
                      className="w-4 h-4 rounded-full border border-white/60 shadow-xs shrink-0"
                      style={{ backgroundColor: activePhoto.extractedColors.vibrant }}
                      title={`Cor Detetada: ${activePhoto.extractedColors.vibrant}`}
                    />
                  )}
                </button>

                {/* Filtros Rápidos de Imagem */}
                <div className="flex flex-col gap-2 p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <Wand2 size={12} className="text-cgl-orange" />
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                      Filtros Rápidos de Imagem
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                    <button
                      onClick={() => updateSlidePhoto({ filter: 'none' })}
                      className={`py-1.5 px-2 text-[11px] font-bold rounded border transition text-center cursor-pointer ${
                        activeFilter === 'none'
                          ? 'bg-cgl-orange/20 border-cgl-orange text-cgl-orange'
                          : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      Original
                    </button>
                    <button
                      onClick={() => updateSlidePhoto({ filter: 'bw' })}
                      className={`py-1.5 px-2 text-[11px] font-bold rounded border transition text-center cursor-pointer ${
                        activeFilter === 'bw'
                          ? 'bg-white/20 border-white text-white'
                          : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      P&B Contraste
                    </button>
                    <button
                      onClick={() => updateSlidePhoto({ filter: 'vintage' })}
                      className={`py-1.5 px-2 text-[11px] font-bold rounded border transition text-center cursor-pointer ${
                        activeFilter === 'vintage'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      Lisboa Dourada
                    </button>
                    <button
                      onClick={() => updateSlidePhoto({ filter: 'night' })}
                      className={`py-1.5 px-2 text-[11px] font-bold rounded border transition text-center cursor-pointer ${
                        activeFilter === 'night'
                          ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300'
                          : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      Modo Noite
                    </button>
                  </div>
                </div>

                {/* Controlo de Zoom / Escala */}
                <div className="flex flex-col gap-1.5 p-2 bg-zinc-900/50 rounded-lg border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Zoom / Escala
                    </label>
                    <span className="text-xs font-mono font-bold text-cgl-orange">
                      {Math.round(scale * 100)}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleZoom(-0.1)}
                      className="w-6 h-6 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-bold border border-zinc-700 cursor-pointer"
                      title="Diminuir Zoom"
                    >
                      <Minus size={11} />
                    </button>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.05"
                      value={scale}
                      onChange={(e) => updateSlidePhoto({ scale: parseFloat(e.target.value) })}
                      className="flex-1 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <button
                      onClick={() => handleZoom(0.1)}
                      className="w-6 h-6 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-bold border border-zinc-700 cursor-pointer"
                      title="Aumentar Zoom"
                    >
                      <Plus size={11} />
                    </button>
                  </div>

                  <div className="flex justify-center gap-1.5 mt-0.5">
                    {[1, 1.25, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateSlidePhoto({ scale: s })}
                        className={`text-[9px] px-2 py-0.5 rounded border transition cursor-pointer ${
                          scale === s
                            ? 'bg-cgl-orange/20 border-cgl-orange text-white font-bold'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {Math.round(s * 100)}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Painel Direcional (D-Pad) */}
                <div className="flex flex-col gap-2 p-2 bg-zinc-900/50 rounded-lg border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Posicionamento
                    </label>
                    <span className="text-[9px] font-mono text-zinc-500">
                      X: {x}px | Y: {y}px
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1 my-1">
                    {/* Linha Superior: Cima */}
                    <button
                      onClick={() => handleMove(0, -20)}
                      className="w-9 h-7 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 active:bg-cgl-orange/40 text-zinc-300 rounded border border-zinc-700 cursor-pointer transition shadow-sm"
                      title="Mover para Cima (-20px)"
                    >
                      <ArrowUp size={13} />
                    </button>

                    {/* Linha Central: Esquerda | Centrar | Direita */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMove(-20, 0)}
                        className="w-9 h-7 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 active:bg-cgl-orange/40 text-zinc-300 rounded border border-zinc-700 cursor-pointer transition shadow-sm"
                        title="Mover para a Esquerda (-20px)"
                      >
                        <ArrowLeft size={13} />
                      </button>
                      <button
                        onClick={() => updateSlidePhoto({ x: 0, y: 0 })}
                        className="h-7 px-2.5 flex items-center justify-center gap-1 bg-zinc-800 hover:bg-zinc-700 active:bg-cgl-orange/40 text-zinc-200 rounded border border-zinc-700 text-[10px] font-bold cursor-pointer transition shadow-sm"
                        title="Centrar Foto"
                      >
                        <Crosshair size={12} className="text-cgl-orange" />
                        <span>Centrar</span>
                      </button>
                      <button
                        onClick={() => handleMove(20, 0)}
                        className="w-9 h-7 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 active:bg-cgl-orange/40 text-zinc-300 rounded border border-zinc-700 cursor-pointer transition shadow-sm"
                        title="Mover para a Direita (+20px)"
                      >
                        <ArrowRight size={13} />
                      </button>
                    </div>

                    {/* Linha Inferior: Baixo */}
                    <button
                      onClick={() => handleMove(0, 20)}
                      className="w-9 h-7 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 active:bg-cgl-orange/40 text-zinc-300 rounded border border-zinc-700 cursor-pointer transition shadow-sm"
                      title="Mover para Baixo (+20px)"
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>
                </div>

                {/* Bloco Sombras & Legibilidade */}
                <div className="flex flex-col gap-2.5 p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <SunMedium size={12} className="text-cgl-orange" />
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                        Sombras & Legibilidade
                      </label>
                    </div>
                    <button
                      onClick={() =>
                        updateSlidePhoto({
                          topGradient: 0.6,
                          bottomGradient: 0.85,
                        })
                      }
                      className="text-[9px] font-bold px-2 py-0.5 bg-cgl-orange/20 hover:bg-cgl-orange hover:text-cgl-black text-cgl-orange rounded border border-cgl-orange/40 transition cursor-pointer flex items-center gap-1"
                      title="Aplicar degradé ideal para leitura do cartaz"
                    >
                      <Sparkles size={10} />
                      Legibilidade Ótima
                    </button>
                  </div>

                  {/* Slider Sombra Superior (Topo) */}
                  <div className="flex flex-col gap-1 mt-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400">Sombra Superior (Topo)</span>
                      <span className="text-[10px] font-mono text-zinc-300 font-bold">
                        {Math.round(topGradient * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={topGradient}
                      onChange={(e) =>
                        updateSlidePhoto({ topGradient: parseFloat(e.target.value) })
                      }
                      className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Slider Sombra Inferior (Base) */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400">Sombra Inferior (Base)</span>
                      <span className="text-[10px] font-mono text-zinc-300 font-bold">
                        {Math.round(bottomGradient * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={bottomGradient}
                      onChange={(e) =>
                        updateSlidePhoto({ bottomGradient: parseFloat(e.target.value) })
                      }
                      className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Slider Escurecimento Geral */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400">Escurecimento Geral</span>
                      <span className="text-[10px] font-mono text-zinc-300 font-bold">
                        {Math.round(vignette * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={vignette}
                      onChange={(e) =>
                        updateSlidePhoto({ vignette: parseFloat(e.target.value) })
                      }
                      className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Slider de Opacidade Geral */}
                <div className="flex flex-col gap-1 p-2 bg-zinc-900/50 rounded-lg border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Opacidade da Imagem
                    </label>
                    <span className="text-xs font-mono font-bold text-zinc-300">
                      {Math.round(opacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => updateSlidePhoto({ opacity: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Botão Repor Posição Original */}
                <button
                  onClick={resetSlidePhotoPosition}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 rounded text-xs text-zinc-300 hover:text-white transition cursor-pointer font-medium"
                >
                  <RotateCcw size={12} className="text-zinc-400" />
                  Repor Posição Original
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
};
