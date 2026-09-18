export type WorkspaceId = 'start' | 'content' | 'brand' | 'composition' | 'export';

export interface WorkspaceDefinition {
  id: WorkspaceId;
  order: string;
  label: string;
}

export const WORKSPACES: readonly WorkspaceDefinition[] = [
  { id: 'start', order: '01', label: 'Começar' },
  { id: 'content', order: '02', label: 'Conteúdo' },
  { id: 'brand', order: '03', label: 'Marca' },
  { id: 'composition', order: '04', label: 'Composição' },
  { id: 'export', order: '05', label: 'Exportar' },
];
