import React from 'react';
import { useStore } from '../../store/useStore';
import { Trash2, Palette, Link2 } from 'lucide-react';

interface ImageEditorSectionProps {
  isOpen: boolean;
  onToggle: () => void;
}

const STICKER_PALETTE = [
  { name: 'Amarelo Lisboa', hex: '#FFCC00' },
  { name: 'Laranja CGL', hex: '#FF6B00' },
  { name: 'Branco Puro', hex: '#FFFFFF' },
  { name: 'Preto Carvão', hex: '#1A1A1A' },
  { name: 'Azul Elétrico', hex: '#0088FF' },
  { name: 'Verde Menta', hex: '#00CC88' },
];

export const ImageEditorSection: React.FC<ImageEditorSectionProps> = ({ isOpen, onToggle }) => {
  const {
    elements,
    selectedElementId,
    updateElement,
    removeElement,
    slides,
    activeSlideIndex,
  } = useStore();

  const selectedElement = elements.find((el) => el.id === selectedElementId);
  if (!selectedElement || selectedElement.type !== 'image') return null;

  const currentOpacity = selectedElement.opacity !== undefined ? selectedElement.opacity : 1;

  // Função para combinar com a cor da categoria ativa ou tom vibrante da foto
  const handleMatchCategoryColor = () => {
    const activeSlide = slides[activeSlideIndex];
    // Procura por tag com badgeColor definida
    const categoryEl = elements.find((el) => el.hasBadge && el.badgeColor && el.badgeColor !== '#1A1A1A');
    const matchedColor =
      categoryEl?.badgeColor ||
      activeSlide?.photo?.extractedColors?.vibrant ||
      '#FFCC00';

    updateElement(selectedElement.id, { color: matchedColor });
  };

  return (
    <section className="flex flex-col gap-3 p-3 bg-zinc-800/40 border border-indigo-500/30 rounded">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left py-1"
      >
        <span className="text-[10px] font-bold text-indigo-400 uppercase cursor-pointer">
          Editar Imagem / Sticker
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeElement(selectedElement.id);
            }}
            className="text-red-400 hover:text-red-300 cursor-pointer"
            title="Remover Elemento (Delete / Backspace)"
          >
            <Trash2 size={13} />
          </button>
          <span className="text-zinc-500 text-xs">{isOpen ? '▲' : '▼'}</span>
        </div>
      </button>

      {isOpen && (
        <div className="flex flex-col gap-3 mt-1 animate-fadeIn">
          {/* SECÇÃO: COR DO SELO / STICKER */}
          <div className="flex flex-col gap-2 p-2 bg-zinc-900/60 rounded-lg border border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Palette size={12} className="text-cgl-orange" />
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                  Cor do Selo / Sticker
                </label>
              </div>
              {selectedElement.color && (
                <button
                  onClick={() => updateElement(selectedElement.id, { color: undefined })}
                  className="text-[9px] text-zinc-400 hover:text-white underline cursor-pointer"
                  title="Restaurar cores originais do SVG"
                >
                  Restaurar Original
                </button>
              )}
            </div>

            {/* Botão Rápido: Combinar com a Cor da Categoria */}
            <button
              onClick={handleMatchCategoryColor}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-zinc-800 hover:bg-cgl-orange hover:text-cgl-black text-zinc-200 text-[10px] font-bold rounded border border-zinc-700 transition cursor-pointer shadow-xs"
              title="Aplica a mesma cor da etiqueta de categoria ou da paleta ativa"
            >
              <Link2 size={11} />
              Combinar com a Cor da Categoria
            </button>

            {/* Paleta Rápida CGL + Color Picker */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-800">
              {STICKER_PALETTE.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => updateElement(selectedElement.id, { color: c.hex })}
                  className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                    selectedElement.color === c.hex
                      ? 'border-white scale-110 ring-2 ring-cgl-orange/50 shadow-sm'
                      : 'border-zinc-700 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}

              <div className="w-px h-5 bg-zinc-800 mx-0.5" />

              <input
                type="color"
                value={selectedElement.color || '#FFCC00'}
                onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer border-none bg-transparent p-0 ml-auto"
                title="Cor Personalizada"
              />
            </div>
          </div>

          {/* Slider de Tamanho / Escala */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-zinc-400">Largura / Escala</label>
              <span className="text-xs text-zinc-300 font-mono font-bold">
                {selectedElement.width || 250}px
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="2500"
              step="10"
              value={selectedElement.width || 250}
              onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) })}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Slider de Rotação */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-zinc-400">Rotação</label>
              <span className="text-xs text-zinc-300 font-mono font-bold">
                {selectedElement.rotation || 0}°
              </span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={selectedElement.rotation || 0}
              onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Slider de Opacidade */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-zinc-400">Opacidade</label>
              <span className="text-xs text-zinc-300 font-mono font-bold">
                {Math.round(currentOpacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={currentOpacity}
              onChange={(e) => updateElement(selectedElement.id, { opacity: parseFloat(e.target.value) })}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}
    </section>
  );
};
