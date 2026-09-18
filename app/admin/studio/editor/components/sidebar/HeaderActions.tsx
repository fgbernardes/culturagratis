import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { Undo2, Redo2, Trash2 } from 'lucide-react';

interface HeaderActionsProps {
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({ onExpandAll, onCollapseAll }) => {
  const { undo, redo, canUndo, canRedo, resetProject, lastSavedAt } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setIsSaving(true);
    const timer = setTimeout(() => {
      setIsSaving(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [lastSavedAt]);

  return (
    <div className="pb-3 border-b border-zinc-800 flex flex-col gap-2.5">
      {/* Linha Superior: Título + Undo / Redo */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold tracking-wide flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-cgl-orange to-cgl-yellow rounded-sm"></div>
          Brand OS CGL
        </h1>

        {/* Botões Globais de Desfazer / Refazer */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition flex items-center gap-1 text-[11px] font-semibold ${
              canUndo
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 cursor-pointer shadow-xs'
                : 'bg-zinc-900/50 text-zinc-600 border border-zinc-900 cursor-not-allowed'
            }`}
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 size={13} />
          </button>

          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-1.5 rounded transition flex items-center gap-1 text-[11px] font-semibold ${
              canRedo
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 cursor-pointer shadow-xs'
                : 'bg-zinc-900/50 text-zinc-600 border border-zinc-900 cursor-not-allowed'
            }`}
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 size={13} />
          </button>
        </div>
      </div>

      {/* Linha de Estado: Indicador de Auto-Save + Botão Novo Projeto */}
      <div className="flex items-center justify-between px-2 py-1 bg-zinc-900/40 rounded border border-zinc-800/60 text-[10px]">
        {/* Micro-indicador de estado de gravação */}
        <div className="flex items-center gap-1.5">
          {isSaving ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-amber-300 font-medium">A guardar...</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-zinc-400 font-medium">Guardado automaticamente</span>
            </>
          )}
        </div>

        {/* Botão de Limpar / Novo Projeto */}
        <button
          onClick={resetProject}
          className="flex items-center gap-1 text-zinc-500 hover:text-red-400 transition cursor-pointer font-medium"
          title="Limpar projeto atual e começar um novo"
        >
          <Trash2 size={11} />
          <span>Novo Projeto</span>
        </button>
      </div>

      {/* Linha Inferior: Subtítulo + Expandir / Recolher */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-zinc-400 truncate">Cultura Grátis Lisboa • Gerador</p>
        <div className="flex gap-1 shrink-0 text-[10px] font-medium">
          <button
            onClick={onExpandAll}
            className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-cgl-orange/50 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            Expandir
          </button>
          <button
            onClick={onCollapseAll}
            className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-cgl-orange/50 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            Recolher
          </button>
        </div>
      </div>
    </div>
  );
};
