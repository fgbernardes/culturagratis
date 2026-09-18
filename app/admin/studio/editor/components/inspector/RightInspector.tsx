import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { TextEditorSection } from '../sidebar/TextEditorSection';
import { ImageEditorSection } from '../sidebar/ImageEditorSection';
import { PhotoEditorSection } from '../sidebar/PhotoEditorSection';
import { AlignmentSection } from '../sidebar/AlignmentSection';
import {
  Camera,
  Type,
  Image as ImageIcon,
  X,
  Trash2,
  Copy,
  ClipboardPaste,
} from 'lucide-react';

export const RightInspector: React.FC = () => {
  const {
    elements,
    selectedElementId,
    setSelectedElementId,
    removeElement,
    inspectingPhoto,
    setInspectingPhoto,
    clipboardElement,
    copySelectedElement,
    pasteElement,
  } = useStore();

  const selectedElement = elements.find((el) => el.id === selectedElementId);
  // Determinar o modo ativo do inspetor
  const isTextMode = !!selectedElement && selectedElement.type === 'text';
  const isImageMode = !!selectedElement && selectedElement.type === 'image';
  const isPhotoMode = !selectedElement && (inspectingPhoto || false);
  const isCanvasMode = !selectedElement && !inspectingPhoto;

  // Estado dos acordeões para cada secção
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    text: true,
    image: true,
    photo: true,
    alignText: true,
    alignImage: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className="w-[290px] bg-zinc-950 border-l border-zinc-800 flex flex-col p-3 gap-3 overflow-y-auto h-full shrink-0 select-none">
      {/* CABEÇALHO DO INSPETOR COM TÍTULO CONTEXTUAL */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
        <div className="flex items-center gap-1.5 min-w-0">
          {isTextMode && (
            <>
              <Type size={13} className="text-cgl-orange shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-200 truncate">
                Inspetor: Texto
              </span>
            </>
          )}
          {isImageMode && (
            <>
              <ImageIcon size={13} className="text-cgl-yellow shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-200 truncate">
                Inspetor: Selo / Sticker
              </span>
            </>
          )}
          {isPhotoMode && (
            <>
              <Camera size={13} className="text-cgl-orange shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-200 truncate">
                Inspetor: Fotografia
              </span>
            </>
          )}
          {isCanvasMode && <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-200 truncate">Inspetor</span>}
        </div>

        <div className="flex items-center gap-1">
          {selectedElement && (
            <button
              onClick={copySelectedElement}
              className="p-1 text-zinc-300 hover:text-white hover:bg-zinc-850 rounded transition cursor-pointer"
              title="Copiar elemento selecionado (Ctrl/Cmd+C)"
            >
              <Copy size={13} />
            </button>
          )}

          {clipboardElement && (
            <button
              onClick={pasteElement}
              className="p-1 text-cgl-orange hover:text-cgl-yellow hover:bg-cgl-orange/10 rounded transition cursor-pointer"
              title="Colar neste slide (Ctrl/Cmd+V)"
            >
              <ClipboardPaste size={13} />
            </button>
          )}

          {/* Botão Eliminar Elemento Selecionado */}
          {selectedElement && (
            <button
              onClick={() => removeElement(selectedElement.id)}
              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition cursor-pointer"
              title="Eliminar Elemento Selecionado (Delete / Backspace)"
            >
              <Trash2 size={13} />
            </button>
          )}

          {/* Botão de Fechar / Desmarcar seleção se algo estiver ativo */}
          {(selectedElement || inspectingPhoto) && (
            <button
              onClick={() => {
                setSelectedElementId(null);
                setInspectingPhoto(false);
              }}
              className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-850 rounded transition cursor-pointer"
              title="Voltar à Tela / Desmarcar"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* 1. MODO TEXTO ATIVO */}
      {isTextMode && (
        <div className="flex flex-col gap-3 animate-fadeIn">
          <TextEditorSection
            isOpen={openSections.text ?? true}
            onToggle={() => toggleSection('text')}
          />
          <AlignmentSection
            isOpen={openSections.alignText ?? true}
            onToggle={() => toggleSection('alignText')}
          />
        </div>
      )}

      {/* 2. MODO IMAGEM / STICKER ATIVO */}
      {isImageMode && (
        <div className="flex flex-col gap-3 animate-fadeIn">
          <ImageEditorSection
            isOpen={openSections.image ?? true}
            onToggle={() => toggleSection('image')}
          />
          <AlignmentSection
            isOpen={openSections.alignImage ?? true}
            onToggle={() => toggleSection('alignImage')}
          />
        </div>
      )}

      {/* 3. MODO FOTOGRAFIA ATIVA */}
      {isPhotoMode && (
        <div className="flex flex-col gap-3 animate-fadeIn">
          <PhotoEditorSection
            isOpen={openSections.photo ?? true}
            onToggle={() => toggleSection('photo')}
          />
        </div>
      )}

      {/* 4. MODO PADRÃO: apenas orientação; as definições globais vivem na coluna da esquerda. */}
      {isCanvasMode && (
        <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900/40 p-3 text-center animate-fadeIn">
          <p className="text-xs font-bold text-zinc-200">Seleciona um elemento no canvas</p>
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">Aqui verás apenas as propriedades desse texto, imagem ou fotografia. Formato, fundo e logótipo estão nos respetivos passos da coluna esquerda.</p>
        </div>
      )}
    </aside>
  );
};
