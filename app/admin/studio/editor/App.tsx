import { useEffect, useRef, useState } from 'react';
import { TopBar } from './components/header/TopBar';
import { LeftSidebar } from './components/sidebar/LeftSidebar';
import { CanvasArea } from './components/CanvasArea';
import { RightInspector } from './components/inspector/RightInspector';
import { useStore } from './store/useStore';
import type { WorkspaceId } from './components/sidebar/workspace';

export function App() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId>('start');
  const { selectedElementId, removeElement, undo, redo, copySelectedElement, pasteElement } = useStore();

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
