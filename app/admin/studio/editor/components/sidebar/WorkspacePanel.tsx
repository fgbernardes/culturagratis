import { BrandWorkspace } from './BrandWorkspace';
import { CompositionWorkspace } from './CompositionWorkspace';
import { ContentWorkspace } from './ContentWorkspace';
import { StartWorkspace } from './StartWorkspace';
import type { WorkspaceId } from './workspace';
import { ExportSection } from './ExportSection';
import type React from 'react';

interface WorkspacePanelProps {
  workspace: WorkspaceId;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export function WorkspacePanel({ workspace, canvasRef }: WorkspacePanelProps) {
  if (workspace === 'start') return <StartWorkspace />;
  if (workspace === 'content') return <ContentWorkspace />;
  if (workspace === 'brand') return <BrandWorkspace />;
  if (workspace === 'composition') return <CompositionWorkspace />;
  return <div><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Exportar</p><p className="mt-1 text-xs text-zinc-300">Prepara o ficheiro final ou copia o rascunho de legenda.</p><ExportSection canvasRef={canvasRef} /></div>;
}
