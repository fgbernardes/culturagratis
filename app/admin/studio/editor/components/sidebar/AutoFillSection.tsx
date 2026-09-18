import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { parseEventText } from '../../utils/eventParser';
import { Zap } from 'lucide-react';

export const AutoFillSection: React.FC = () => {
  const { autoFillEvent } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [importText, setImportText] = useState('');

  const handleClose = () => {
    setIsOpen(false);
    setImportText('');
  };

  const handleGenerate = () => {
    if (!importText.trim()) return;
    const parsed = parseEventText(importText);
    autoFillEvent(parsed);
    handleClose();
  };

  const exampleConcerto = `FESTIVAL DE JAZZ NO JARDIM\nSexta-feira, 28 de Agosto às 21:30h\nJardim da Estrela, Lisboa\nCategoria: Música ao ar livre com entrada grátis!`;

  const exampleExposicao = `EXPOSIÇÃO DE ARTE CONTEMPORÂNEA\nDe Terça a Domingo, das 10h às 19h\nGaleria Municipal do Chiado, Lisboa\nEstilo: Exposição de Entrada Livre (0€)`;

  const exampleTeatro = `NOITE DE TEATRO & COMÉDIA\nSábado, 29 de Agosto às 21:00\nTeatro São Luiz, Lisboa\nEspetáculo de Teatro com Entrada Gratuita`;

  return (
    <>
      {/* Botão de Destaque na Barra Lateral */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-2.5 px-3 bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 hover:from-zinc-850 hover:to-zinc-800 border border-zinc-700 hover:border-cgl-orange/80 rounded-lg transition-all text-xs font-bold text-white flex items-center justify-center gap-2 shadow-md group shrink-0 cursor-pointer"
      >
        <Zap size={15} className="text-cgl-orange group-hover:scale-125 transition-transform" />
        ⚡ Preenchimento Rápido
      </button>

      {/* Modal de Importação Rápida */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4 shadow-2xl relative text-zinc-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Zap size={16} className="text-cgl-orange animate-pulse" />
                ⚡ Preenchimento Rápido / Importar Evento
              </span>
              <button
                onClick={handleClose}
                className="text-zinc-400 hover:text-white transition text-base font-bold font-mono px-1 rounded hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Cole o texto corrido do evento ou JSON estruturado. O parser identificará automaticamente título, data, local, categoria e gratuidade, preenchendo o slide atual de imediato!
            </p>

            {/* Caixa de Texto */}
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`Cole aqui o texto ou JSON do evento...\n\nExemplo:\nConcerto de Fado Vadio\nSexta-feira, 28 de Agosto às 21h\nTeatro Maria Vitória, Lisboa\nEstilo: Música com Entrada Livre`}
              rows={7}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-cgl-orange focus:ring-1 focus:ring-cgl-orange/40 rounded-lg p-3 text-xs text-white focus:outline-none resize-none font-sans leading-relaxed"
            />

            {/* Três Botões de Exemplo Rápido */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Exemplos Rápidos de Teste:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setImportText(exampleConcerto)}
                  className="py-1.5 px-2 text-[11px] font-semibold bg-zinc-950 border border-zinc-800 hover:border-cgl-orange/60 rounded-md hover:bg-zinc-850 text-zinc-300 transition text-center truncate cursor-pointer"
                  title="Exemplo de Concerto de Música"
                >
                  🎸 Exemplo Concerto
                </button>
                <button
                  onClick={() => setImportText(exampleExposicao)}
                  className="py-1.5 px-2 text-[11px] font-semibold bg-zinc-950 border border-zinc-800 hover:border-cgl-orange/60 rounded-md hover:bg-zinc-850 text-zinc-300 transition text-center truncate cursor-pointer"
                  title="Exemplo de Exposição de Arte"
                >
                  🎨 Exemplo Exposição
                </button>
                <button
                  onClick={() => setImportText(exampleTeatro)}
                  className="py-1.5 px-2 text-[11px] font-semibold bg-zinc-950 border border-zinc-800 hover:border-cgl-orange/60 rounded-md hover:bg-zinc-850 text-zinc-300 transition text-center truncate cursor-pointer"
                  title="Exemplo de Peça de Teatro"
                >
                  🎭 Exemplo Teatro
                </button>
              </div>
            </div>

            {/* Ações do Rodapé */}
            <div className="flex gap-3 pt-3 border-t border-zinc-800 mt-1">
              <button
                onClick={handleClose}
                className="flex-1 py-2 px-3 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerate}
                disabled={!importText.trim()}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg shadow-md transition flex items-center justify-center gap-2 ${
                  importText.trim()
                    ? 'bg-gradient-to-r from-cgl-orange to-cgl-yellow text-cgl-black hover:opacity-90 hover:scale-101 cursor-pointer font-bold'
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-800'
                }`}
              >
                <Zap size={14} />
                Gerar Cartaz Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
