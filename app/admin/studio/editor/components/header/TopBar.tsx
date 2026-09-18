import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import {
  captureCanvasBlob,
  captureCanvasPng,
  exportErrorMessage,
  packFileName,
  singleFileName,
  slideFileName,
  waitForCanvasReady,
} from '../../utils/exportCanvas';
import { buildCaptionDraft } from '../../utils/captionDraft';
import {
  Undo2,
  Redo2,
  Maximize2,
  Minus,
  Plus,
  Trash2,
  Copy,
  Download,
  FolderArchive,
  Check,
  FileText,
  AlertTriangle,
  X,
} from 'lucide-react';

interface TopBarProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export const TopBar: React.FC<TopBarProps> = ({ canvasRef }) => {
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    resetProject,
    lastSavedAt,
    canvasSettings,
    setCanvasSettings,
    slides,
    activeSlideIndex,
    setActiveSlide,
    saveError,
  } = useStore();

  const [isSaving, setIsSaving] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [copiedCaptionSuccess, setCopiedCaptionSuccess] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const isFirstRender = useRef(true);

  // Efeito para o indicador visual de Auto-Save
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

  // Função para Ajustar ao Ecrã (Fit to Screen)
  const handleFitToScreen = () => {
    if (typeof window === 'undefined') return;

    // Descontar largura das duas barras laterais (Esquerda ~270px + Direita ~290px + paddings ~140px)
    const availableWidth = Math.max(300, window.innerWidth - 270 - 290 - 140);
    // Descontar altura da barra superior (~50px) e slide manager (~120px) + paddings (~120px)
    const availableHeight = Math.max(300, window.innerHeight - 50 - 120 - 120);

    const zoomX = availableWidth / canvasSettings.width;
    const zoomY = availableHeight / canvasSettings.height;

    const idealZoom = Math.min(zoomX, zoomY);
    const clampedZoom = Math.max(0.15, Math.min(1.2, Math.round(idealZoom * 100) / 100));

    setCanvasSettings({ zoom: clampedZoom });
  };

  const handleZoomDelta = (delta: number) => {
    const nextZoom = Math.max(0.15, Math.min(1.5, Math.round((canvasSettings.zoom + delta) * 100) / 100));
    setCanvasSettings({ zoom: nextZoom });
  };

  // Exportar Slide Atual como Imagem PNG
  const handleExportSingle = async () => {
    setExportError(null);
    if (!canvasRef.current) {
      setExportError('Canvas indisponível. Recarrega a página e tenta outra vez.');
      return;
    }
    try {
      const dataUrl = await captureCanvasPng(canvasRef.current);
      saveAs(dataUrl, singleFileName());
    } catch (err) {
      console.error('Erro ao exportar PNG:', err);
      setExportError(exportErrorMessage(err, 'A exportação'));
    }
  };

  // Copiar Imagem para o Clipboard
  const handleCopyImage = async () => {
    setExportError(null);
    if (!canvasRef.current) {
      setExportError('Canvas indisponível. Recarrega a página e tenta outra vez.');
      return;
    }
    try {
      const blob = await captureCanvasBlob(canvasRef.current);
      if (!blob) {
        throw new Error('não foi possível gerar a imagem.');
      }
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar imagem:', err);
      setExportError(
        exportErrorMessage(err, 'A cópia para a área de transferência') +
          ' Verifica as permissões de Clipboard do browser.'
      );
    }
  };

  // Copiar Legenda Formatada & Hashtags do Projeto
  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(buildCaptionDraft(slides));
      setCopiedCaptionSuccess(true);
      setTimeout(() => setCopiedCaptionSuccess(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar legenda:', err);
      alert('Não foi possível copiar a legenda automaticamente.');
    }
  };

  // Exportar Carrossel em Pack (.ZIP)
  const handleExportZip = async () => {
    setExportError(null);
    const node = canvasRef.current;
    if (!node) {
      setExportError('Canvas indisponível. Recarrega a página e tenta outra vez.');
      return;
    }

    setIsExportingZip(true);
    const originalSlideIndex = activeSlideIndex;

    try {
      const zip = new JSZip();

      for (let i = 0; i < slides.length; i++) {
        setActiveSlide(i);
        // Confirmamos que o slide foi mesmo renderizado antes de capturar.
        await waitForCanvasReady(node);

        const dataUrl = await captureCanvasPng(node);
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        zip.file(slideFileName(i), base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, packFileName());
    } catch (err) {
      console.error('Erro ao exportar carrossel ZIP:', err);
      setExportError(exportErrorMessage(err, 'A exportação do pack'));
    } finally {
      // O slide ativo é sempre reposto, mesmo se a exportação falhou a meio.
      setActiveSlide(originalSlideIndex);
      setIsExportingZip(false);
    }
  };

  return (
    <header className="relative h-13 bg-zinc-950 border-b border-zinc-800 px-4 flex items-center justify-between gap-3 shrink-0 z-30 select-none">
      {/* Esquerda: Identidade + Estado de Auto-Save */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-br from-cgl-orange to-cgl-yellow rounded-sm shrink-0"></div>
          <span className="font-display font-bold text-sm tracking-wide text-white whitespace-nowrap">
            Brand OS CGL
          </span>
        </div>

        <div className="h-4 w-px bg-zinc-800 hidden sm:block"></div>

        {/* Micro-indicador de Gravação — reflete o resultado real da escrita */}
        <div
          className={`items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] hidden sm:flex ${
            saveError
              ? 'bg-red-950/70 border-red-500/50 cursor-help'
              : 'bg-zinc-900/60 border-zinc-800/80'
          }`}
          title={saveError ?? undefined}
        >
          {saveError ? (
            <>
              <AlertTriangle size={11} className="text-red-300 shrink-0" />
              <span className="text-red-300 font-semibold whitespace-nowrap">Não guardado</span>
            </>
          ) : isSaving ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-amber-300 font-medium whitespace-nowrap">A guardar...</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-zinc-400 font-medium whitespace-nowrap">Guardado</span>
            </>
          )}
        </div>
      </div>

      {/* Centro: Histórico Undo/Redo + Zoom + Novo Projeto */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Desfazer / Refazer */}
        <div className="flex items-center gap-1 bg-zinc-900/70 p-0.5 rounded-lg border border-zinc-800">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition ${
              canUndo
                ? 'text-zinc-200 hover:text-white hover:bg-zinc-800 cursor-pointer'
                : 'text-zinc-600 cursor-not-allowed'
            }`}
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-1.5 rounded transition ${
              canRedo
                ? 'text-zinc-200 hover:text-white hover:bg-zinc-800 cursor-pointer'
                : 'text-zinc-600 cursor-not-allowed'
            }`}
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 size={14} />
          </button>
        </div>

        {/* Controlos de Zoom */}
        <div className="flex items-center gap-1.5 bg-zinc-900/70 py-1 px-2 rounded-lg border border-zinc-800">
          <button
            onClick={() => handleZoomDelta(-0.05)}
            className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition cursor-pointer"
            title="Diminuir Zoom"
          >
            <Minus size={12} />
          </button>

          <input
            type="range"
            min="0.15"
            max="1.5"
            step="0.05"
            value={canvasSettings.zoom}
            onChange={(e) => setCanvasSettings({ zoom: parseFloat(e.target.value) })}
            className="w-16 sm:w-24 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer hidden md:block"
          />

          <button
            onClick={() => handleZoomDelta(0.05)}
            className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition cursor-pointer"
            title="Aumentar Zoom"
          >
            <Plus size={12} />
          </button>

          <span className="text-xs font-mono font-bold text-zinc-300 w-10 text-center">
            {Math.round(canvasSettings.zoom * 100)}%
          </span>

          <button
            onClick={handleFitToScreen}
            className="p-1 text-zinc-400 hover:text-cgl-orange hover:bg-zinc-800 rounded transition cursor-pointer"
            title="Ajustar ao Ecrã"
          >
            <Maximize2 size={13} />
          </button>
        </div>

        {/* Botão Novo Projeto */}
        <button
          onClick={resetProject}
          className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-red-400 px-2 py-1 bg-zinc-900/60 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/30 rounded-lg transition cursor-pointer"
          title="Limpar e começar um novo projeto"
        >
          <Trash2 size={12} />
          <span className="hidden sm:inline">Novo</span>
        </button>
      </div>

      {/* Direita: Ações de Exportação */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopyCaption}
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-200 rounded-lg transition cursor-pointer shadow-xs"
          title="Copiar Legenda & Hashtags formatadas para o Instagram"
        >
          {copiedCaptionSuccess ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400 hidden sm:inline">Legenda Copiada!</span>
            </>
          ) : (
            <>
              <FileText size={13} className="text-cgl-blue" />
              <span className="hidden sm:inline">Legenda</span>
            </>
          )}
        </button>

        <button
          onClick={handleCopyImage}
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-200 rounded-lg transition cursor-pointer shadow-xs"
          title="Copiar imagem atual para a área de transferência"
        >
          {copiedSuccess ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400 hidden sm:inline">Copiado!</span>
            </>
          ) : (
            <>
              <Copy size={13} className="text-cgl-orange" />
              <span className="hidden sm:inline">Copiar</span>
            </>
          )}
        </button>

        <button
          onClick={handleExportSingle}
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-200 hover:text-white rounded-lg transition cursor-pointer shadow-xs"
          title={`Exportar slide atual (${canvasSettings.aspectRatio})`}
        >
          <Download size={13} />
          <span className="hidden sm:inline">Exportar PNG</span>
        </button>

        <button
          onClick={handleExportZip}
          disabled={isExportingZip}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-gradient-to-r from-cgl-orange to-cgl-yellow hover:opacity-90 text-cgl-black rounded-lg transition cursor-pointer shadow-md disabled:opacity-50"
          title="Exportar todos os slides do carrossel em ficheiro ZIP"
        >
          <FolderArchive size={14} />
          <span>{isExportingZip ? 'A gerar...' : 'Pack ZIP'}</span>
        </button>
      </div>

      {/* Falha de auto-save: sem botão de fechar, porque o trabalho continua em risco
          enquanto a escrita não voltar a resultar. Desaparece sozinho quando resultar. */}
      {saveError && (
        <div
          role="alert"
          className="absolute top-full left-4 right-4 mt-2 flex items-start gap-2 rounded-lg border border-red-500/50 bg-red-950/95 px-3 py-2 text-xs leading-snug text-red-100 shadow-lg backdrop-blur-sm"
        >
          <AlertTriangle size={14} className="mt-px shrink-0" />
          <span className="flex-1">{saveError}</span>
        </div>
      )}

      {exportError && (
        <div
          role="alert"
          className={`absolute top-full right-4 max-w-md flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-950/95 px-3 py-2 text-xs leading-snug text-red-200 shadow-lg backdrop-blur-sm ${
            saveError ? 'mt-14' : 'mt-2'
          }`}
        >
          <AlertTriangle size={14} className="mt-px shrink-0" />
          <span className="flex-1">{exportError}</span>
          <button
            onClick={() => setExportError(null)}
            className="shrink-0 text-red-300 hover:text-white transition cursor-pointer"
            title="Fechar aviso"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </header>
  );
};
