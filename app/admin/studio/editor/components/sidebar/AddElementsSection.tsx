import React, { useRef } from 'react';
import { useStore } from '../../store/useStore';
import { storeAsset } from '../../utils/assetStore';
import { Heading1, Heading2, Upload, Sparkles, ArrowRight, Layers, Compass, Calendar } from 'lucide-react';

interface AddElementsSectionProps {
  isAdicionarOpen: boolean;
  onToggleAdicionar: () => void;
  isEtiquetasOpen: boolean;
  onToggleEtiquetas: () => void;
}

const CATEGORY_TAGS = [
  { label: 'Música', category: 'MÚSICA', color: '#FE7D02' },
  { label: 'Teatro', category: 'TEATRO', color: '#FFC107' },
  { label: 'Exposição', category: 'EXPOSIÇÃO', color: '#00838F' },
  { label: 'Cinema', category: 'CINEMA', color: '#1A1A1A' },
  { label: 'Famílias', category: 'FAMÍLIAS', color: '#FE7D02' },
  { label: 'Ar Livre', category: 'AR LIVRE', color: '#00838F' },
  { label: 'Entrada Livre', category: 'ENTRADA LIVRE', color: '#FFC107' },
];

const LOGISTICS_BADGES = [
  { label: 'Ⓜ️ Metro Próximo', text: 'Ⓜ️ METRO PRÓXIMO', color: '#00838F', textColor: '#FFFFFF' },
  { label: '♿ Acessibilidade', text: '♿ ACESSIBILIDADE', color: '#1A1A1A', textColor: '#FFFFFF' },
  { label: '🐕 Pet Friendly', text: '🐕 PET FRIENDLY', color: '#FE7D02', textColor: '#FFFFFF' },
  { label: '👶 Para Famílias', text: '👶 PARA FAMÍLIAS', color: '#FE7D02', textColor: '#FFFFFF' },
  { label: '🍻 Comida & Bebida', text: '🍻 COMIDA & BEBIDA', color: '#FFC107', textColor: '#1A1A1A' },
];

export const AddElementsSection: React.FC<AddElementsSectionProps> = ({
  isAdicionarOpen,
  onToggleAdicionar,
  isEtiquetasOpen,
  onToggleEtiquetas,
}) => {
  const { addElement, addImageElement, addTagElement } = useStore();
  const imgElementInputRef = useRef<HTMLInputElement>(null);

  const handleImgElementUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addImageElement(await storeAsset(file));
    e.target.value = '';
  };

  return (
    <>
      <hr className="border-zinc-800" />

      {/* Adicionar Elementos */}
      <section className="flex flex-col gap-2 pb-2 border-b border-zinc-900">
        <button
          onClick={onToggleAdicionar}
          className="flex items-center justify-between w-full text-left py-1"
        >
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 cursor-pointer">
            Adicionar Elementos
          </label>
          <span className="text-zinc-500 text-xs">{isAdicionarOpen ? '▲' : '▼'}</span>
        </button>
        {isAdicionarOpen && (
          <div className="flex flex-col gap-2 animate-fadeIn">
            {/* Título & Subtítulo */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  addElement({
                    type: 'text',
                    content: 'Novo Título',
                    x: 80,
                    y: 140,
                    fontSize: 84,
                    fontFamily: '"Bricolage Grotesque", sans-serif',
                    color: '#FE7D02',
                  })
                }
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-display font-bold bg-zinc-800 hover:bg-zinc-700 rounded transition border border-zinc-700 cursor-pointer"
              >
                <Heading1 size={14} className="text-cgl-orange" /> Título
              </button>
              <button
                onClick={() =>
                  addElement({
                    type: 'text',
                    content: 'Texto corrido...',
                    x: 80,
                    y: 300,
                    fontSize: 32,
                    fontFamily: '"Inter", sans-serif',
                    color: '#FFFFFF',
                  })
                }
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs bg-zinc-800 hover:bg-zinc-700 rounded transition border border-zinc-700 cursor-pointer"
              >
                <Heading2 size={14} className="text-cgl-blue" /> Subtítulo
              </button>
            </div>

            {/* Cartão de Informação em Vidro Fosco (Glassmorphism) */}
            <button
              onClick={() =>
                addElement({
                  type: 'text',
                  content: '📅  15 a 18 de Agosto • 21h30\n📍  Largo do Picadeiro | Chiado\nℹ️  Acesso livre por ordem de chegada',
                  x: 60,
                  y: 780,
                  fontSize: 28,
                  fontFamily: '"Inter", sans-serif',
                  color: '#FFFFFF',
                  textAlign: 'left',
                  fontWeight: 600,
                  hasBadge: true,
                  badgeColor: 'rgba(0, 0, 0, 0.45)',
                  tagShape: 'glass',
                  isGlass: true,
                  hasShadow: true,
                })
              }
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-white/20 rounded transition shadow-sm cursor-pointer"
            >
              <Sparkles size={13} className="text-cgl-blue" /> + Cartão Glassmorphism (Vidro)
            </button>

            {/* Crachá de Calendário */}
            <button
              onClick={() =>
                addElement({
                  type: 'text',
                  content: 'AGO\n19',
                  x: 80,
                  y: 120,
                  fontSize: 36,
                  fontFamily: '"Bricolage Grotesque", sans-serif',
                  color: '#1A1A1A',
                  textAlign: 'center',
                  fontWeight: 900,
                  hasBadge: true,
                  badgeColor: '#FE7D02',
                  isCalendarBadge: true,
                  hasShadow: true,
                })
              }
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-cgl-orange/30 hover:border-cgl-orange rounded transition shadow-sm cursor-pointer"
            >
              <Calendar size={13} className="text-cgl-orange" /> + 📅 Crachá de Calendário (AGO / 19)
            </button>

            {/* Indicadores de Carrossel / Swipe */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() =>
                  addElement({
                    type: 'text',
                    content: 'DESLIZA  ➜',
                    x: 820,
                    y: 980,
                    fontSize: 14,
                    fontFamily: '"Inter", sans-serif',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    textAlign: 'center',
                    hasBadge: true,
                    badgeColor: '#FE7D02',
                    tagShape: 'pill',
                    hasShadow: true,
                  })
                }
                className="flex items-center justify-center gap-1 py-1.5 px-2 text-[10px] font-bold bg-zinc-800 hover:bg-cgl-orange hover:text-cgl-black text-zinc-300 rounded border border-zinc-700 transition cursor-pointer"
              >
                <ArrowRight size={12} className="text-cgl-orange shrink-0" /> Desliza ➜
              </button>
              <button
                onClick={() =>
                  addElement({
                    type: 'text',
                    content: 'SLIDE 1/4 ➜',
                    x: 800,
                    y: 980,
                    fontSize: 14,
                    fontFamily: '"Inter", sans-serif',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    textAlign: 'center',
                    hasBadge: true,
                    badgeColor: '#1A1A1A',
                    tagShape: 'pill',
                    hasShadow: true,
                  })
                }
                className="flex items-center justify-center gap-1 py-1.5 px-2 text-[10px] font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 transition cursor-pointer"
              >
                <Layers size={12} className="text-cgl-blue shrink-0" /> Slide 1/4 ➜
              </button>
            </div>

            {/* Adicionar Sticker / Recorte PNG */}
            <button
              onClick={() => imgElementInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition cursor-pointer mt-0.5"
            >
              <Upload size={13} className="text-cgl-orange" /> + Adicionar Sticker / Recorte PNG
            </button>
            <input
              ref={imgElementInputRef}
              type="file"
              accept="image/*"
              onChange={handleImgElementUpload}
              className="hidden"
            />
          </div>
        )}
      </section>

      {/* Etiquetas e Badges de Logística */}
      <section className="flex flex-col gap-2 pb-2 border-b border-zinc-900">
        <button
          onClick={onToggleEtiquetas}
          className="flex items-center justify-between w-full text-left py-1"
        >
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 cursor-pointer">
            Etiquetas & Badges
          </label>
          <span className="text-zinc-500 text-xs">{isEtiquetasOpen ? '▲' : '▼'}</span>
        </button>
        {isEtiquetasOpen && (
          <div className="flex flex-col gap-3 animate-fadeIn">
            {/* Categorias Culturais */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                Categorias
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORY_TAGS.map((tag) => (
                  <button
                    key={tag.label}
                    onClick={() => addTagElement(tag.category, tag.color)}
                    className="flex items-center gap-1.5 py-1.5 px-2 text-[11px] font-bold bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded transition text-left text-zinc-200 cursor-pointer"
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Badges de Logística Rápida */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center gap-1">
                <Compass size={11} className="text-cgl-blue" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                  Badges de Logística
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {LOGISTICS_BADGES.map((badge) => (
                  <button
                    key={badge.label}
                    onClick={() =>
                      addElement({
                        type: 'text',
                        content: badge.text,
                        x: 80,
                        y: 720,
                        fontSize: 20,
                        fontFamily: '"Inter", sans-serif',
                        color: badge.textColor,
                        fontWeight: 700,
                        fontStyle: 'normal',
                        textTransform: 'uppercase',
                        hasBadge: true,
                        badgeColor: badge.color,
                        tagShape: 'pill',
                        hasShadow: true,
                      })
                    }
                    className="flex items-center gap-1.5 py-1.5 px-2 text-[10px] font-bold bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded transition text-left text-zinc-200 cursor-pointer"
                  >
                    {badge.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};
