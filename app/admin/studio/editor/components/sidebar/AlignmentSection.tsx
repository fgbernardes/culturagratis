import React from 'react';
import { useStore } from '../../store/useStore';
import {
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  AlignLeft,
  AlignRight,
} from 'lucide-react';

interface AlignmentSectionProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const AlignmentSection: React.FC<AlignmentSectionProps> = ({ isOpen, onToggle }) => {
  const {
    elements,
    selectedElementId,
    alignCenterHorizontal,
    alignCenterVertical,
    alignLeftMargin,
    alignRightMargin,
  } = useStore();

  const selectedElement = elements.find((el) => el.id === selectedElementId);
  if (!selectedElement) return null;

  return (
    <section className="flex flex-col gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left py-1"
      >
        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 cursor-pointer">
          Alinhamento Rápido
        </label>
        <span className="text-zinc-500 text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="grid grid-cols-4 gap-1.5 animate-fadeIn">
          <button
            onClick={alignCenterHorizontal}
            className="py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 transition flex items-center justify-center"
            title="Centrar Horizontalmente"
          >
            <AlignHorizontalJustifyCenter size={15} />
          </button>
          <button
            onClick={alignCenterVertical}
            className="py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 transition flex items-center justify-center"
            title="Centrar Verticalmente"
          >
            <AlignVerticalJustifyCenter size={15} />
          </button>
          <button
            onClick={alignLeftMargin}
            className="py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 transition flex items-center justify-center"
            title="Alinhar à Margem Esquerda"
          >
            <AlignLeft size={15} />
          </button>
          <button
            onClick={alignRightMargin}
            className="py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 transition flex items-center justify-center"
            title="Alinhar à Margem Direita"
          >
            <AlignRight size={15} />
          </button>
        </div>
      )}
    </section>
  );
};
