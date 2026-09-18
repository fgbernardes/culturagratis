import React from 'react';
import { useStore } from '../../store/useStore';
import type { TagShape } from '../../types';
import { Trash2 } from 'lucide-react';
import { FONT_OPTIONS, CGL_COLORS } from './constants';

interface TextEditorSectionProps {
  isOpen: boolean;
  onToggle: () => void;
}

const TAG_SHAPES: { shape: TagShape; label: string; icon: string; desc: string }[] = [
  { shape: 'rounded', label: 'Arredondada', icon: '▢', desc: 'Cantos suaves' },
  { shape: 'pill', label: 'Pílula', icon: '⬭', desc: 'Formato oval' },
  { shape: 'ticket', label: 'Bilhete Rústico', icon: '🎟', desc: 'Recortes de bilhete' },
  { shape: 'stamp', label: 'Selo Postal', icon: '📯', desc: 'Bordas serrilhadas' },
  { shape: 'glass', label: 'Vidro Fosco', icon: '✨', desc: 'Glassmorphism blur' },
];

export const TextEditorSection: React.FC<TextEditorSectionProps> = ({ isOpen, onToggle }) => {
  const {
    elements,
    selectedElementId,
    updateElement,
    removeElement,
    toggleTextShadow,
    setTextBadgeColor,
    updateTagShape,
  } = useStore();

  const selectedElement = elements.find((el) => el.id === selectedElementId);
  if (!selectedElement || selectedElement.type !== 'text') return null;

  const currentTagShape: TagShape = selectedElement.tagShape || 'rounded';

  return (
    <section className="flex flex-col gap-2 p-3 bg-zinc-800/40 border border-cgl-orange/30 rounded">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left py-1"
      >
        <span className="text-[10px] font-bold text-cgl-orange uppercase cursor-pointer">
          Editar Texto
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeElement(selectedElement.id);
            }}
            className="text-red-400 hover:text-red-300"
            title="Remover Elemento"
          >
            <Trash2 size={13} />
          </button>
          <span className="text-zinc-500 text-xs">{isOpen ? '▲' : '▼'}</span>
        </div>
      </button>

      {isOpen && (
        <div className="flex flex-col gap-2 mt-1 animate-fadeIn">
          <textarea
            value={selectedElement.content || ''}
            onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white resize-none focus:border-cgl-orange focus:outline-none"
            rows={3}
          />

          <select
            value={selectedElement.fontFamily || FONT_OPTIONS[0].value}
            onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-xs text-white focus:border-cgl-orange"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={selectedElement.fontSize || 36}
              onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-xs text-white"
              title="Tamanho da Letra"
            />
            <div className="flex gap-1 bg-zinc-900 border border-zinc-700 rounded p-1">
              {['left', 'center', 'right'].map((align) => (
                <button
                  key={align}
                  onClick={() => updateElement(selectedElement.id, { textAlign: align as 'left' | 'center' | 'right' })}
                  className={`flex-1 text-[10px] uppercase font-bold rounded ${
                    selectedElement.textAlign === align ? 'bg-zinc-700' : ''
                  }`}
                >
                  {align[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Estilos Tipográficos */}
          <div className="flex gap-2 mt-1">
            <select
              value={selectedElement.fontWeight || 700}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  fontWeight: isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value),
                })
              }
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded p-1.5 text-xs text-white focus:border-cgl-orange"
              title="Peso da Fonte"
            >
              <option value={400}>Regular (400)</option>
              <option value={500}>Medium (500)</option>
              <option value={600}>SemiBold (600)</option>
              <option value={700}>Bold (700)</option>
              <option value={800}>ExtraBold (800)</option>
            </select>

            <button
              onClick={() =>
                updateElement(selectedElement.id, {
                  fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic',
                })
              }
              className={`w-8 h-8 flex items-center justify-center font-serif italic text-sm font-bold border rounded transition ${
                selectedElement.fontStyle === 'italic'
                  ? 'bg-cgl-blue border-cgl-blue text-white font-bold'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}
              title="Itálico"
            >
              I
            </button>

            <button
              onClick={() =>
                updateElement(selectedElement.id, {
                  textTransform: selectedElement.textTransform === 'uppercase' ? 'none' : 'uppercase',
                })
              }
              className={`w-8 h-8 flex items-center justify-center font-sans font-bold text-xs border rounded transition ${
                selectedElement.textTransform === 'uppercase'
                  ? 'bg-cgl-blue border-cgl-blue text-white font-bold'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}
              title="Maiúsculas"
            >
              TT
            </button>
          </div>

          {/* Largura da Caixa / Auto-Ajuste ao Texto */}
          <div className="flex flex-col gap-1.5 p-2 bg-zinc-900/60 rounded-lg border border-zinc-800 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-zinc-400">Largura da Caixa</span>
              <span className="text-xs font-mono font-bold text-cgl-orange">
                {selectedElement.width ? `${selectedElement.width}px` : 'Auto (Ajustado)'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min="250"
                max="1000"
                step="10"
                value={selectedElement.width || 600}
                onChange={(e) => updateElement(selectedElement.id, { width: parseFloat(e.target.value) })}
                className="flex-1 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between gap-1.5 mt-0.5">
              <button
                onClick={() => updateElement(selectedElement.id, { width: undefined })}
                className={`flex-1 text-[10px] font-bold py-1 px-2 rounded border transition cursor-pointer text-center ${
                  selectedElement.width === undefined
                    ? 'bg-cgl-orange/20 border-cgl-orange text-cgl-orange shadow-xs'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                }`}
                title="Ajusta o tamanho da caixa rigorosamente ao texto interno sem áreas vazias"
              >
                Auto-Ajustar ao Texto
              </button>

              {[500, 750, 950].map((w) => (
                <button
                  key={w}
                  onClick={() => updateElement(selectedElement.id, { width: w })}
                  className={`text-[9px] px-2 py-1 rounded border transition cursor-pointer ${
                    selectedElement.width === w
                      ? 'bg-cgl-orange/20 border-cgl-orange text-white font-bold'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {w}px
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-1.5 mt-1">
            {CGL_COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => updateElement(selectedElement.id, { color: c.hex })}
                className="w-5 h-5 rounded-full border border-zinc-600 shadow-sm"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
            <input
              type="color"
              value={selectedElement.color || '#ffffff'}
              onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
              className="w-5 h-5 rounded cursor-pointer border-none bg-transparent p-0 ml-auto"
            />
          </div>

          {/* Sombra de Texto */}
          <div className="flex items-center justify-between mt-1 pt-2 border-t border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Sombra do Texto</span>
            <button
              onClick={toggleTextShadow}
              className={`py-1 px-3 text-xs font-semibold rounded border transition cursor-pointer ${
                selectedElement.hasShadow
                  ? 'bg-cgl-blue border-cgl-blue text-white font-bold'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              {selectedElement.hasShadow ? 'Ativa' : 'Desativada'}
            </button>
          </div>

          {/* Seletor Visual de Estilo de Fundo (Sem Fundo / Vidro Fosco / Sólido) */}
          <div className="flex flex-col gap-1.5 p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                Fundo da Caixa de Texto
              </span>
              <span className="text-[9px] font-mono text-cgl-orange font-bold uppercase">
                {selectedElement.backgroundStyle === 'none' || (!selectedElement.hasBadge && !selectedElement.isGlass)
                  ? 'Sem Fundo'
                  : selectedElement.backgroundStyle === 'glass' || selectedElement.isGlass
                  ? 'Vidro Fosco'
                  : 'Sólido'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() =>
                  updateElement(selectedElement.id, {
                    backgroundStyle: 'none',
                    hasBadge: false,
                    isGlass: false,
                  })
                }
                className={`py-1.5 px-1 rounded border text-center transition cursor-pointer flex flex-col items-center gap-0.5 ${
                  selectedElement.backgroundStyle === 'none' || (!selectedElement.hasBadge && !selectedElement.isGlass)
                    ? 'bg-cgl-orange/20 border-cgl-orange text-cgl-orange ring-1 ring-cgl-orange/30 font-bold shadow-xs'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
                title="Sem fundo / texto transparente"
              >
                <span className="text-xs">🚫</span>
                <span className="text-[9px] truncate">Sem Fundo</span>
              </button>

              <button
                onClick={() =>
                  updateElement(selectedElement.id, {
                    backgroundStyle: 'glass',
                    hasBadge: true,
                    isGlass: true,
                    tagShape: 'glass',
                    badgeColor: 'rgba(0, 0, 0, 0.45)',
                  })
                }
                className={`py-1.5 px-1 rounded border text-center transition cursor-pointer flex flex-col items-center gap-0.5 ${
                  selectedElement.backgroundStyle === 'glass' || selectedElement.isGlass || selectedElement.tagShape === 'glass'
                    ? 'bg-cgl-blue/20 border-cgl-blue text-white ring-1 ring-cgl-blue/30 font-bold shadow-xs'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
                title="Efeito Vidro Fosco (Glassmorphism)"
              >
                <span className="text-xs">✨</span>
                <span className="text-[9px] truncate">Vidro Fosco</span>
              </button>

              <button
                onClick={() =>
                  updateElement(selectedElement.id, {
                    backgroundStyle: 'solid',
                    hasBadge: true,
                    isGlass: false,
                    tagShape: selectedElement.tagShape === 'glass' ? 'rounded' : selectedElement.tagShape || 'rounded',
                    badgeColor:
                      selectedElement.badgeColor && selectedElement.badgeColor !== 'rgba(0, 0, 0, 0.45)'
                        ? selectedElement.badgeColor
                        : '#1A1A1A',
                  })
                }
                className={`py-1.5 px-1 rounded border text-center transition cursor-pointer flex flex-col items-center gap-0.5 ${
                  selectedElement.backgroundStyle === 'solid' || (selectedElement.hasBadge && !selectedElement.isGlass && selectedElement.tagShape !== 'glass')
                    ? 'bg-zinc-700/60 border-zinc-500 text-white ring-1 ring-zinc-400/30 font-bold shadow-xs'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
                title="Fundo sólido escuro personalizável"
              >
                <span className="text-xs">⬛</span>
                <span className="text-[9px] truncate">Sólido</span>
              </button>
            </div>
          </div>

          {/* Painel Completo de Tags e Formas quando o fundo não for 'none' */}
          {(selectedElement.hasBadge || selectedElement.isGlass || selectedElement.backgroundStyle === 'solid' || selectedElement.backgroundStyle === 'glass') && (
            <div className="flex flex-col gap-2.5 mt-1 p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800 animate-fadeIn">
              {/* Formato da Tag */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                    Formato da Tag
                  </span>
                  <span className="text-[9px] text-cgl-orange font-mono uppercase font-bold">
                    {TAG_SHAPES.find((s) => s.shape === currentTagShape)?.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {TAG_SHAPES.map((item) => {
                    const isCurrent = currentTagShape === item.shape;
                    return (
                      <button
                        key={item.shape}
                        onClick={() => updateTagShape(selectedElement.id, item.shape)}
                        className={`py-1.5 px-2 text-left rounded border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isCurrent
                            ? 'bg-cgl-orange/20 border-cgl-orange text-white ring-1 ring-cgl-orange/40 shadow-sm'
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                        }`}
                        title={item.desc}
                      >
                        <span className="text-xs shrink-0 opacity-80">{item.icon}</span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-bold leading-tight truncate">{item.label}</span>
                          <span className="text-[8px] text-zinc-500 truncate">{item.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seletor de Cores da Tag */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-zinc-800/80">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                  Cor da Tag
                </span>
                <div className="flex items-center gap-1.5">
                  {['#1A1A1A', '#FE7D02', '#FFC107', '#00838F', '#FFFFFF'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setTextBadgeColor(color)}
                      className={`w-6 h-6 rounded border transition-all cursor-pointer ${
                        (selectedElement.badgeColor || '#1A1A1A') === color
                          ? 'border-cgl-orange scale-110 ring-2 ring-cgl-orange/40'
                          : 'border-zinc-700 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                  <div className="w-px h-6 bg-zinc-800 mx-0.5"></div>
                  <input
                    type="color"
                    value={selectedElement.badgeColor || '#1A1A1A'}
                    onChange={(e) => setTextBadgeColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-none bg-transparent p-0"
                    title="Cor personalizada"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
