import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { HeaderActions } from './sidebar/HeaderActions';
import { AutoFillSection } from './sidebar/AutoFillSection';
import { PresetsSection } from './sidebar/PresetsSection';
import { FormatSection } from './sidebar/FormatSection';
import { BackgroundSection } from './sidebar/BackgroundSection';
import { PhotoEditorSection } from './sidebar/PhotoEditorSection';
import { LogoSection } from './sidebar/LogoSection';
import { AddElementsSection } from './sidebar/AddElementsSection';
import { StickersSection } from './sidebar/StickersSection';
import { AlignmentSection } from './sidebar/AlignmentSection';
import { TextEditorSection } from './sidebar/TextEditorSection';
import { ImageEditorSection } from './sidebar/ImageEditorSection';
import { ExportSection } from './sidebar/ExportSection';

interface SidebarProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export const Sidebar: React.FC<SidebarProps> = ({ canvasRef }) => {
  const { elements, selectedElementId } = useStore();

  const [isModelosOpen, setIsModelosOpen] = useState(true);
  const [isFormatoOpen, setIsFormatoOpen] = useState(true);
  const [isFundoOpen, setIsFundoOpen] = useState(true);
  const [isFotoOpen, setIsFotoOpen] = useState(true);
  const [isLogoOpen, setIsLogoOpen] = useState(true);
  const [isAdicionarOpen, setIsAdicionarOpen] = useState(true);
  const [isEtiquetasOpen, setIsEtiquetasOpen] = useState(true);
  const [isStickersOpen, setIsStickersOpen] = useState(false);
  const [isAlinhamentoOpen, setIsAlinhamentoOpen] = useState(true);
  const [isEdicaoOpen, setIsEdicaoOpen] = useState(true);

  const expandAll = () => {
    setIsModelosOpen(true);
    setIsFormatoOpen(true);
    setIsFundoOpen(true);
    setIsFotoOpen(true);
    setIsLogoOpen(true);
    setIsAdicionarOpen(true);
    setIsEtiquetasOpen(true);
    setIsStickersOpen(true);
    setIsAlinhamentoOpen(true);
    setIsEdicaoOpen(true);
  };

  const collapseAll = () => {
    setIsModelosOpen(false);
    setIsFormatoOpen(false);
    setIsFundoOpen(false);
    setIsFotoOpen(false);
    setIsLogoOpen(false);
    setIsAdicionarOpen(false);
    setIsEtiquetasOpen(false);
    setIsStickersOpen(false);
    setIsAlinhamentoOpen(false);
    setIsEdicaoOpen(false);
  };

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  return (
    <aside className="w-80 bg-zinc-950 border-r border-zinc-800 flex flex-col p-4 gap-5 overflow-y-auto h-full shrink-0">
      {/* Header com ações Expandir / Recolher */}
      <HeaderActions onExpandAll={expandAll} onCollapseAll={collapseAll} />

      {/* Preenchimento Automático / Importação Rápida */}
      <AutoFillSection />

      {/* Modelos Rápidos */}
      <PresetsSection
        isOpen={isModelosOpen}
        onToggle={() => setIsModelosOpen(!isModelosOpen)}
      />

      {/* Formato & Guias */}
      <FormatSection
        isOpen={isFormatoOpen}
        onToggle={() => setIsFormatoOpen(!isFormatoOpen)}
      />

      {/* Fundo e Textura */}
      <BackgroundSection
        isOpen={isFundoOpen}
        onToggle={() => setIsFundoOpen(!isFundoOpen)}
      />

      {/* 📷 Fotografia Principal Dedicada */}
      <PhotoEditorSection
        isOpen={isFotoOpen}
        onToggle={() => setIsFotoOpen(!isFotoOpen)}
      />

      {/* Logótipo CGL */}
      <LogoSection
        isOpen={isLogoOpen}
        onToggle={() => setIsLogoOpen(!isLogoOpen)}
      />

      {/* Adicionar Elementos & Etiquetas Rápidas */}
      <AddElementsSection
        isAdicionarOpen={isAdicionarOpen}
        onToggleAdicionar={() => setIsAdicionarOpen(!isAdicionarOpen)}
        isEtiquetasOpen={isEtiquetasOpen}
        onToggleEtiquetas={() => setIsEtiquetasOpen(!isEtiquetasOpen)}
      />

      {/* Stickers & Elementos CGL */}
      <StickersSection
        isOpen={isStickersOpen}
        onToggle={() => setIsStickersOpen(!isStickersOpen)}
      />

      {/* Alinhamento Rápido */}
      {selectedElement && (
        <AlignmentSection
          isOpen={isAlinhamentoOpen}
          onToggle={() => setIsAlinhamentoOpen(!isAlinhamentoOpen)}
        />
      )}

      {/* Editor de Texto Selecionado */}
      {selectedElement && selectedElement.type === 'text' && (
        <TextEditorSection
          isOpen={isEdicaoOpen}
          onToggle={() => setIsEdicaoOpen(!isEdicaoOpen)}
        />
      )}

      {/* Editor de Imagem Selecionada */}
      {selectedElement && selectedElement.type === 'image' && (
        <ImageEditorSection
          isOpen={isEdicaoOpen}
          onToggle={() => setIsEdicaoOpen(!isEdicaoOpen)}
        />
      )}

      {/* Secção de Exportação */}
      <ExportSection canvasRef={canvasRef} />
    </aside>
  );
};
