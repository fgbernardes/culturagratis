import React from 'react';
import { useStore } from '../../store/useStore';
import { STICKERS } from '../../data/stickers';
import { Flame, Sparkles } from 'lucide-react';

interface StickersSectionProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const StickersSection: React.FC<StickersSectionProps> = ({ isOpen, onToggle }) => {
  const { addImageElement } = useStore();

  const urgencyStickers = STICKERS.filter((s) => s.category === 'urgency');
  const otherStickers = STICKERS.filter((s) => s.category !== 'urgency');

  return (
    <section className="flex flex-col gap-2">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left py-1"
      >
        <div className="flex items-center gap-1.5">
          <Flame size={13} className="text-cgl-orange" />
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 cursor-pointer">
            Stickers & Selos de Urgência
          </label>
        </div>
        <span className="text-zinc-500 text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="flex flex-col gap-3 animate-fadeIn">
          {/* Selos de Urgência / Gancho (Slide 1) */}
          <div className="flex flex-col gap-1.5 p-2 bg-zinc-900/60 rounded-lg border border-zinc-800">
            <div className="flex items-center gap-1">
              <Sparkles size={11} className="text-red-400" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-300">
                Selos de Urgência / Gancho (Slide 1)
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1.5 mt-0.5">
              {urgencyStickers.map((sticker) => (
                <button
                  key={sticker.id}
                  onClick={() => addImageElement(sticker.svgUri)}
                  className="flex items-center gap-2 p-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-cgl-orange rounded transition group cursor-pointer"
                  title={`Inserir selo ${sticker.name}`}
                >
                  <img
                    src={sticker.svgUri}
                    alt={sticker.name}
                    className="h-7 w-auto object-contain shrink-0 transition-transform group-hover:scale-105"
                  />
                  <span className="text-[10px] font-bold text-zinc-300 group-hover:text-white truncate">
                    {sticker.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Grelha de Stickers & Ilustrações CGL */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
              Ilustrações & Vetores
            </span>
            <div className="grid grid-cols-3 gap-2 p-2 bg-zinc-900/40 rounded-lg border border-zinc-800/80">
              {otherStickers.map((sticker) => (
                <button
                  key={sticker.id}
                  onClick={() => addImageElement(sticker.svgUri)}
                  className="flex flex-col items-center gap-1.5 p-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-cgl-orange rounded transition group cursor-pointer"
                  title={sticker.name}
                >
                  <img
                    src={sticker.svgUri}
                    alt={sticker.name}
                    className="w-10 h-10 object-contain transition-transform group-hover:scale-110"
                  />
                  <span className="text-[8px] text-zinc-500 group-hover:text-zinc-300 text-center line-clamp-1 w-full leading-tight font-medium">
                    {sticker.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
