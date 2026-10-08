import { useEffect, useRef, useState } from 'react';
import { TopBar } from './components/header/TopBar';
import { LeftSidebar } from './components/sidebar/LeftSidebar';
import { CanvasArea } from './components/CanvasArea';
import { RightInspector } from './components/inspector/RightInspector';
import { useStore } from './store/useStore';
import type { WorkspaceId } from './components/sidebar/workspace';
import { STUDIO_HANDOFF_KEY } from '../../studio-event-payload';
import { parseEventText } from './utils/eventParser';

export function App() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId>('start');
  const [handoffText, setHandoffText] = useState<string | null>(null);
  const [handoffError, setHandoffError] = useState('');
  const { selectedElementId, removeElement, undo, redo, copySelectedElement, pasteElement } = useStore();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const pending = sessionStorage.getItem(STUDIO_HANDOFF_KEY);
      if (pending) {
        const formatted = JSON.stringify(JSON.parse(pending), null, 2);
        timer = setTimeout(() => setHandoffText(formatted), 0);
      }
    } catch {
      timer = setTimeout(() => setHandoffError('Não foi possível ler os dados do evento. Regressa ao /admin e tenta novamente.'), 0);
    }
    return () => clearTimeout(timer);
  }, []);

  const applyHandoff = () => {
    if (!handoffText) return;
    try {
      const value = JSON.parse(handoffText);
      if (!value || typeof value !== 'object' || !value.title || !value.date || !value.venue || !value.category || !value.access) {
        setHandoffError('O evento precisa de título, data, local, categoria e condição de acesso.');
        return;
      }
      const store = useStore.getState();
      store.setAspectRatio('4:5');
      useStore.getState().autoFillEvent(parseEventText(handoffText));
      sessionStorage.removeItem(STUDIO_HANDOFF_KEY);
      setHandoffText(null);
      setHandoffError('');
    } catch {
      setHandoffError('O JSON do evento não é válido. Corrige-o antes de aplicar.');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;

      // Atalhos de Undo / Redo
      if (isCmdOrCtrl && e.key.toLowerCase() === 'z') {
        const activeEl = document.activeElement;
        const isEditingText =
          activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            activeEl.getAttribute('contenteditable') === 'true');

        if (!isEditingText) {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          return;
        }
      }

      if (isCmdOrCtrl && e.key.toLowerCase() === 'y') {
        const activeEl = document.activeElement;
        const isEditingText =
          activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            activeEl.getAttribute('contenteditable') === 'true');

        if (!isEditingText) {
          e.preventDefault();
          redo();
          return;
        }
      }

      const activeEl = document.activeElement;
      const isEditingText =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable') === 'true');

      if (isEditingText) return;

      if (isCmdOrCtrl && e.key.toLowerCase() === 'c' && selectedElementId) {
        e.preventDefault();
        copySelectedElement();
        return;
      }

      if (isCmdOrCtrl && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteElement();
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        removeElement(selectedElementId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElementId, removeElement, undo, redo, copySelectedElement, pasteElement]);

  return (
    <div className="flex flex-col h-full min-h-[720px] w-full overflow-hidden bg-zinc-950 text-white select-none">
      {handoffText && <div role="dialog" aria-modal="true" aria-label="Evento do admin" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
        <div className="w-full max-w-xl rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-xl">
          <h2 className="text-lg font-bold">Preparar peça social</h2>
          <p className="my-2 text-sm text-zinc-300">Confirma os dados antes de alterar o slide ativo. O formato inicial será Feed 4:5; depois podes rever e exportar Story 9:16.</p>
          <textarea aria-label="JSON do evento" className="h-64 w-full rounded border border-zinc-600 bg-zinc-950 p-3 font-mono text-xs text-white" value={handoffText} onChange={(event) => setHandoffText(event.target.value)} />
          {handoffError && <p role="alert" className="mt-2 text-sm text-red-300">{handoffError}</p>}
          <div className="mt-4 flex justify-end gap-3"><button type="button" onClick={() => { sessionStorage.removeItem(STUDIO_HANDOFF_KEY); setHandoffText(null); setHandoffError(''); }} className="rounded bg-zinc-700 px-4 py-2">Cancelar</button><button type="button" onClick={applyHandoff} className="rounded bg-orange-500 px-4 py-2 font-bold text-black">Aplicar ao slide</button></div>
        </div>
      </div>}
      {!handoffText && handoffError && <p role="alert" className="bg-red-900 p-2 text-sm">{handoffError}</p>}
      {/* 1. Barra de Cabeçalho Superior */}
      <TopBar canvasRef={canvasRef} />

      {/* 2. Layout Studio com Duas Barras: Esquerda (Biblioteca) | Centro (Canvas) | Direita (Inspetor Contextual) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Barra Lateral Esquerda: Adicionar Elementos, Modelos & Mídia */}
          <LeftSidebar activeWorkspace={activeWorkspace} onWorkspaceChange={setActiveWorkspace} canvasRef={canvasRef} />

        {/* Canvas Central com Gestor Inferior de Slides */}
        <CanvasArea ref={canvasRef} />

        {/* Barra Lateral Direita: Inspetor Contextual */}
        <RightInspector />
      </div>
    </div>
  );
}

export default App;
