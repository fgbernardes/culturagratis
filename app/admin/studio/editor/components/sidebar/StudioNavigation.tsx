import { WORKSPACES, type WorkspaceId } from './workspace';

interface StudioNavigationProps {
  activeWorkspace: WorkspaceId;
  onWorkspaceChange: (workspace: WorkspaceId) => void;
}

export function StudioNavigation({
  activeWorkspace,
  onWorkspaceChange,
}: StudioNavigationProps) {
  return (
    <nav aria-label="Percurso de criação" className="flex flex-col gap-1">
      {WORKSPACES.map((workspace) => {
        const isActive = workspace.id === activeWorkspace;

        return (
          <button
            key={workspace.id}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onWorkspaceChange(workspace.id)}
            className={`min-h-9 w-full rounded-lg px-2.5 py-2 text-left text-xs font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cgl-orange ${
              isActive
                ? 'border-l-2 border-cgl-orange bg-cgl-orange/15 text-white'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
            }`}
          >
            <span aria-hidden="true" className="mr-2 font-mono text-[10px] text-cgl-orange">
              {workspace.order}
            </span>
            {workspace.label}
          </button>
        );
      })}
    </nav>
  );
}
