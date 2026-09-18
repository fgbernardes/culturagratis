import { StudioNavigation } from './StudioNavigation';
import { WorkspacePanel } from './WorkspacePanel';
import type { WorkspaceId } from './workspace';
import type React from 'react';

interface LeftSidebarProps {
  activeWorkspace: WorkspaceId;
  onWorkspaceChange: (workspace: WorkspaceId) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export function LeftSidebar({ activeWorkspace, onWorkspaceChange, canvasRef }: LeftSidebarProps) {
  return (
    <aside className="w-[280px] shrink-0 select-none overflow-y-auto border-r border-zinc-800 bg-zinc-950 p-3">
      <div className="border-b border-zinc-800 pb-3">
        <p className="text-[11px] font-black uppercase tracking-wider text-zinc-200">Gerador CGL</p>
        <p className="mt-1 text-[10px] text-zinc-500">Percurso de criação</p>
      </div>
      <div className="py-3"><StudioNavigation activeWorkspace={activeWorkspace} onWorkspaceChange={onWorkspaceChange} /></div>
      <div className="border-t border-zinc-800 pt-3"><WorkspacePanel workspace={activeWorkspace} canvasRef={canvasRef} /></div>
    </aside>
  );
}
