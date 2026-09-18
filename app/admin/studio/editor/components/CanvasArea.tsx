import { forwardRef } from 'react';
import { Canvas } from './Canvas';
import { SlideManager } from './SlideManager';

export const CanvasArea = forwardRef<HTMLDivElement>((_props, ref) => {
  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-zinc-950 select-none">
      {/* Área Central do Canvas com Scroll Livre */}
      <div className="flex-1 overflow-hidden relative flex">
        <Canvas ref={ref} />
      </div>

      {/* Gestor Inferior de Slides do Carrossel */}
      <SlideManager />
    </main>
  );
});

CanvasArea.displayName = 'CanvasArea';
