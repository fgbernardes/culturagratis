import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { parseEventText } from '../../utils/eventParser';
import { Zap } from 'lucide-react';

interface ImportEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportEventModal: React.FC<ImportEventModalProps> = ({ isOpen, onClose }) => {
  const { autoFillEvent } = useStore();
  const [importText, setImportText] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    setImportText('');
  };

  const handleGenerate = () => {
    if (!importText.trim()) return;
    const parsed = parseEventText(importText);
    autoFillEvent(parsed);
    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col gap-4 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Zap size={14} className="text-cgl-orange animate-pulse" /> Importação Rápida de Evento
          </span>
          <button
            onClick={handleClose}
            className="text-zinc-500 hover:text-white transition text-sm font-bold font-mono"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Cole o texto corrido do evento ou JSON estruturado. O parser identificará automaticamente título, data, local e categoria e preencherá o slide atual!
        </p>

        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Cole aqui o texto ou JSON do evento...&#10;Exemplo:&#10;Concerto de Fado Vadio&#10;Sexta-feira, 28 de Agosto às 21h&#10;Teatro Maria Vitória, Lisboa&#10;Estilo: Música Grátis"
          rows={6}
          className="w-full bg-zinc-950 border border-zinc-800 focus:border-cgl-orange rounded p-3 text-xs text-white focus:outline-none resize-none font-sans"
        />

        {/* Exemplos de Teste */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-zinc-500 uppercase">Exemplos Rápidos de Teste:</span>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setImportText(
                  `CONCERTO DE JAZZ NO JARDIM\nDomingo, 30 de Agosto às 18:30h\nJardim da Estrela, Lisboa\nCategoria: Música ao ar livre, entrada grátis!`
                )
              }
              className="flex-1 py-1 px-2 text-[10px] font-semibold bg-zinc-950 border border-zinc-800 rounded hover:border-zinc-500 text-zinc-300 transition text-left"
            >
              🎸 Exemplo Concerto
            </button>
            <button
              onClick={() =>
                setImportText(
                  `EXPOSIÇÃO DE ARTE MODERNA\nDe Terça a Domingo, das 10h às 19h\nGaleria Municipal do Chiado, Lisboa\nEstilo: Exposição de Entrada Livre`
                )
              }
              className="flex-1 py-1 px-2 text-[10px] font-semibold bg-zinc-950 border border-zinc-800 rounded hover:border-zinc-500 text-zinc-300 transition text-left"
            >
              🎨 Exemplo Exposição
            </button>
          </div>
        </div>

        {/* Ações do Modal */}
        <div className="flex gap-2 pt-2 border-t border-zinc-800">
          <button
            onClick={handleClose}
            className="flex-1 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerate}
            disabled={!importText.trim()}
            className={`flex-1 py-2 text-xs font-bold rounded shadow transition flex items-center justify-center gap-1.5 ${
              importText.trim()
                ? 'bg-gradient-to-r from-cgl-orange to-cgl-yellow text-cgl-black hover:scale-102 cursor-pointer'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-800'
            }`}
          >
            <Zap size={13} /> Gerar Cartaz
          </button>
        </div>
      </div>
    </div>
  );
};
