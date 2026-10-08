import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { Download, Copy, FolderArchive, AlertTriangle, Check, FileText } from 'lucide-react';
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
import { PublishedEventExport } from '../header/PublishedEventExport';

interface ExportSectionProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export const ExportSection: React.FC<ExportSectionProps> = ({ canvasRef }) => {
  const { canvasSettings, slides, activeSlideIndex, setActiveSlide } = useStore();
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const handleExportSingle = async () => {
    setError(null);
    if (!canvasRef.current) {
      setError('Canvas indisponível. Recarrega a página e tenta outra vez.');
      return;
    }
    try {
      const dataUrl = await captureCanvasPng(canvasRef.current);
      saveAs(dataUrl, singleFileName());
    } catch (err) {
      console.error('Erro ao exportar:', err);
      setError(exportErrorMessage(err, 'A exportação'));
    }
  };

  const handleExportZip = async () => {
    setError(null);
    const node = canvasRef.current;
    if (!node) {
      setError('Canvas indisponível. Recarrega a página e tenta outra vez.');
      return;
    }

    setIsExportingZip(true);
    const originalSlideIndex = activeSlideIndex;

    try {
      const zip = new JSZip();

      for (let i = 0; i < slides.length; i++) {
        setActiveSlide(i);
        // Confirmamos que o slide foi mesmo renderizado antes de capturar,
        // em vez de esperar um intervalo fixo e torcer para que chegue.
        await waitForCanvasReady(node);

        const dataUrl = await captureCanvasPng(node);
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        zip.file(slideFileName(i), base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, packFileName());
    } catch (err) {
      console.error('Erro na exportação em lote do carrossel:', err);
      setError(exportErrorMessage(err, 'A exportação do pack'));
    } finally {
      // O slide ativo é sempre reposto, mesmo se a exportação falhou a meio.
      setActiveSlide(originalSlideIndex);
      setIsExportingZip(false);
    }
  };

  const handleCopyImage = async () => {
    setError(null);
    if (!canvasRef.current) {
      setError('Canvas indisponível. Recarrega a página e tenta outra vez.');
      return;
    }
    try {
      const blob = await captureCanvasBlob(canvasRef.current);
      if (!blob) {
        throw new Error('não foi possível gerar a imagem.');
      }
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    } catch (err) {
      console.error('Erro ao copiar imagem:', err);
      setError(
        exportErrorMessage(err, 'A cópia para a área de transferência') +
          ' Verifica as permissões de Clipboard do browser.'
      );
    }
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(buildCaptionDraft(slides[activeSlideIndex]?.pipelineEvent ? [slides[activeSlideIndex]] : slides));
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar legenda:', err);
      setError('Não foi possível copiar a legenda automaticamente.');
    }
  };

  return (
    <div className="mt-auto flex flex-col gap-2 pt-4">
      <PublishedEventExport canvasRef={canvasRef} />
      <button
        onClick={handleCopyCaption}
        className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 font-bold py-2.5 px-3 rounded text-xs transition"
      >
        {copiedCaption ? <Check size={14} className="text-emerald-400" /> : <FileText size={14} className="text-cgl-blue" />}
        {copiedCaption ? 'Legenda copiada' : 'Copiar rascunho de legenda'}
      </button>
      <button
        onClick={handleExportSingle}
        className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 font-bold py-2.5 px-3 rounded text-xs transition"
      >
        <Download size={14} /> Exportar {canvasSettings.aspectRatio}
      </button>
      <button
        onClick={handleCopyImage}
        className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 font-bold py-2.5 px-3 rounded text-xs transition"
      >
        <Copy size={13} className="text-cgl-orange" /> Copiar para a Área de Transferência
      </button>
      <button
        onClick={handleExportZip}
        disabled={isExportingZip}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cgl-orange to-cgl-yellow text-cgl-black font-bold py-3 px-3 rounded shadow transition disabled:opacity-60"
      >
        <FolderArchive size={16} /> {isExportingZip ? 'A gerar...' : 'Exportar Pack (.ZIP)'}
      </button>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded border border-red-500/40 bg-red-950/60 px-2.5 py-2 text-[11px] leading-snug text-red-200"
        >
          <AlertTriangle size={13} className="mt-px shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
