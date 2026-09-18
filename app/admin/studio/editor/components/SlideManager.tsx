import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { resolveAsset } from '../utils/assetStore';
import { Plus, Copy, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export const SlideManager: React.FC = () => {
  const {
    slides,
    activeSlideIndex,
    addSlide,
    duplicateSlide,
    deleteSlide,
    setActiveSlide,
  } = useStore();

  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <div 
        onClick={() => setIsOpen(true)}
        className="bg-zinc-950 border-t border-zinc-800 p-2.5 flex items-center justify-between w-full select-none cursor-pointer shrink-0 z-40 hover:bg-zinc-900 transition-colors"
      >
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <ChevronUp size={13} className="text-cgl-orange" /> Mostrar Carrossel de Slides ({slides.length} {slides.length === 1 ? 'slide' : 'slides'})
        </span>
        <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase">
          Slide {activeSlideIndex + 1} de {slides.length} ativo • Expandir ▲
        </span>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 border-t border-zinc-800 p-3 flex flex-col gap-2 w-full select-none shrink-0 z-40">
      <div className="flex items-center justify-between px-2">
        <button
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider hover:text-white transition text-left"
        >
          <ChevronDown size={13} className="text-cgl-orange" />
          Carrossel Multi-Slide ({slides.length} {slides.length === 1 ? 'slide' : 'slides'})
        </button>
        <button
          onClick={addSlide}
          className="flex items-center gap-1.5 py-1 px-3 bg-gradient-to-r from-cgl-orange to-cgl-yellow text-cgl-black text-xs font-bold rounded shadow hover:scale-105 transition"
        >
          <Plus size={14} /> + Novo Slide
        </button>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto py-1 px-2 no-scrollbar scroll-smooth">
        {slides.map((slide, idx) => {
          const isActive = idx === activeSlideIndex;
          return (
            <div
              key={slide.id}
              onClick={() => setActiveSlide(idx)}
              className={`flex-shrink-0 w-32 bg-zinc-900 border-2 rounded p-2 flex flex-col gap-2 relative transition cursor-pointer ${
                isActive
                  ? 'border-cgl-orange shadow-lg shadow-cgl-orange/15 scale-102 bg-zinc-850'
                  : 'border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {/* Miniatura do Slide */}
              <div
                className="w-full h-16 rounded flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: slide.backgroundColor }}
              >
                {slide.backgroundImage && (
                  <img
                    src={resolveAsset(slide.backgroundImage)}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                )}
                {/* Indicador Numérico */}
                <span className={`text-xl font-display font-black leading-none ${isActive ? 'text-cgl-orange' : 'text-zinc-500'}`}>
                  {idx + 1}
                </span>

                {/* Contador de Elementos */}
                <span className="absolute bottom-1 right-1.5 text-[8px] font-mono text-zinc-400 bg-zinc-950/80 px-1 py-0.5 rounded leading-none">
                  {slide.elements.length} el
                </span>
              </div>

              {/* Controles de Cartão */}
              <div className="flex items-center justify-between gap-1.5">
                <span className={`text-[10px] font-bold uppercase truncate ${isActive ? 'text-zinc-200' : 'text-zinc-500'}`}>
                  Slide {idx + 1}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateSlide(idx);
                    }}
                    className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition"
                    title="Duplicar Slide"
                  >
                    <Copy size={11} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSlide(idx);
                    }}
                    disabled={slides.length <= 1}
                    className={`p-1 rounded transition ${
                      slides.length <= 1
                        ? 'text-zinc-600 cursor-not-allowed'
                        : 'text-zinc-400 hover:text-red-400 hover:bg-zinc-800'
                    }`}
                    title="Eliminar Slide"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
