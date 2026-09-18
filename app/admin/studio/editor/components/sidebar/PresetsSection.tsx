import React, { useState, useRef } from 'react';
import { useStore } from '../../store/useStore';
import {
  Bookmark,
  Download,
  Upload,
  Trash2,
  FolderCheck,
  Sparkles,
  Share2,
  Smartphone,
  MessageCircle,
  Users,
} from 'lucide-react';

interface PresetsSectionProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const PresetsSection: React.FC<PresetsSectionProps> = ({ isOpen, onToggle }) => {
  const {
    applyTemplate,
    applyAgendaPreset,
    applyFinalSlidePreset,
    applyPlatformPreset,
    customPresets,
    saveCurrentAsPreset,
    loadPreset,
    deletePreset,
    exportPresetsToJson,
    importPresetsFromJson,
  } = useStore();

  const [newPresetName, setNewPresetName] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleSave = () => {
    if (!newPresetName.trim()) {
      saveCurrentAsPreset('');
    } else {
      saveCurrentAsPreset(newPresetName);
    }
    setNewPresetName('');
    showFeedback('Modelo guardado com sucesso!');
  };

  const handleExportBackup = async () => {
    // Assíncrono porque as imagens são lidas do IndexedDB e voltam a ser
    // embutidas no ficheiro, para o backup funcionar noutro computador.
    const jsonStr = await exportPresetsToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modelos-cgl-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback('Backup exportado com sucesso!');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = await importPresetsFromJson(content);
        if (success) {
          showFeedback('Modelos importados com sucesso!');
        } else {
          showFeedback('Erro: Formato de ficheiro JSON inválido.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <section className="flex flex-col gap-2 pb-2 border-b border-zinc-900">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left py-1"
      >
        <div className="flex items-center gap-1.5">
          <Bookmark size={13} className="text-cgl-orange" />
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 cursor-pointer">
            Modelos & Formatos
          </label>
        </div>
        <span className="text-zinc-500 text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="flex flex-col gap-3 animate-fadeIn">
          {/* Mensagem de Feedback Temporária */}
          {feedbackMsg && (
            <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded text-emerald-300 text-xs flex items-center gap-1.5 animate-fadeIn">
              <FolderCheck size={14} className="shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Secção: Os Meus Modelos Guardados */}
          <div className="flex flex-col gap-2 p-2 bg-zinc-900/60 rounded-lg border border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">
              Os Meus Modelos
            </span>

            {/* Input para Guardar Novo Modelo */}
            <div className="flex items-center gap-2 w-full">
              <input
                type="text"
                placeholder="Nome do modelo..."
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                }}
                className="flex-1 min-w-0 px-2 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-amber-500"
              />
              <button
                onClick={handleSave}
                className="shrink-0 px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black rounded whitespace-nowrap transition cursor-pointer"
                title="Guardar composição atual como modelo"
              >
                + Guardar
              </button>
            </div>

            {/* Lista de Modelos Guardados */}
            {customPresets.length === 0 ? (
              <div className="text-center py-2 text-[11px] text-zinc-500 italic">
                Nenhum modelo personalizado guardado.
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                {customPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between p-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded transition group"
                  >
                    <button
                      onClick={() => {
                        loadPreset(preset.id);
                        showFeedback(`Modelo "${preset.name}" carregado!`);
                      }}
                      className="flex-1 text-left flex flex-col min-w-0 cursor-pointer"
                      title="Carregar este modelo"
                    >
                      <span className="text-xs font-semibold text-zinc-200 group-hover:text-cgl-orange truncate">
                        {preset.name}
                      </span>
                      <div className="flex items-center gap-2 text-[9px] text-zinc-500">
                        <span>Formato: {preset.format}</span>
                        <span>•</span>
                        <span>{preset.elements.length} elementos</span>
                      </div>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePreset(preset.id);
                        showFeedback('Modelo apagado.');
                      }}
                      className="text-zinc-600 hover:text-red-400 p-1 transition cursor-pointer"
                      title="Apagar Modelo"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Botões de Backup: Exportar / Importar JSON */}
            <div className="flex items-center justify-between pt-1.5 border-t border-zinc-800/80">
              <button
                onClick={handleExportBackup}
                disabled={customPresets.length === 0}
                className={`flex items-center gap-1 text-[10px] font-medium transition cursor-pointer ${
                  customPresets.length === 0
                    ? 'text-zinc-600 cursor-not-allowed'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Exportar todos os modelos guardados num ficheiro .json"
              >
                <Download size={11} />
                Exportar Backup
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-[10px] font-medium text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                title="Importar modelos a partir de ficheiro .json"
              >
                <Upload size={11} />
                Importar Backup
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>
          </div>

          {/* Modelos por Plataforma */}
          <div className="flex flex-col gap-1.5 p-2 bg-zinc-900/60 rounded-lg border border-zinc-800">
            <div className="flex items-center gap-1">
              <Share2 size={11} className="text-cgl-blue" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-300">
                Modelos por Plataforma
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                onClick={() => {
                  applyPlatformPreset('tiktok');
                  showFeedback('Modelo TikTok / Reels (9:16) aplicado!');
                }}
                className="text-xs bg-zinc-950 border border-zinc-800 hover:border-cgl-orange hover:bg-zinc-900 text-zinc-200 py-1.5 px-2.5 rounded transition font-semibold cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <Smartphone size={13} className="text-cgl-orange group-hover:scale-110 transition-transform" />
                  <span>📱 TikTok / Reels</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">9:16</span>
              </button>
              <button
                onClick={() => {
                  applyPlatformPreset('whatsapp');
                  showFeedback('Modelo WhatsApp / Telegram (1:1) aplicado!');
                }}
                className="text-xs bg-zinc-950 border border-zinc-800 hover:border-cgl-orange hover:bg-zinc-900 text-zinc-200 py-1.5 px-2.5 rounded transition font-semibold cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle size={13} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>💬 WhatsApp / Telegram</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">1:1</span>
              </button>
              <button
                onClick={() => {
                  applyPlatformPreset('facebook');
                  showFeedback('Modelo Facebook / Eventos (16:9) aplicado!');
                }}
                className="text-xs bg-zinc-950 border border-zinc-800 hover:border-cgl-orange hover:bg-zinc-900 text-zinc-200 py-1.5 px-2.5 rounded transition font-semibold cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <Users size={13} className="text-blue-400 group-hover:scale-110 transition-transform" />
                  <span>👥 Facebook / Eventos</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">16:9</span>
              </button>
            </div>
          </div>

          {/* Modelos CGL Rápidos */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1">
              <Sparkles size={11} className="text-cgl-orange" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                Modelos CGL Rápidos
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                onClick={() => {
                  applyAgendaPreset();
                  showFeedback('Modelo "Foto + Barra de Agenda" aplicado!');
                }}
                className="text-xs bg-cgl-orange/20 border border-cgl-orange/50 hover:bg-cgl-orange hover:text-cgl-black text-cgl-orange hover:border-cgl-orange py-2 px-3 rounded transition font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                📅 Foto + Barra de Agenda
              </button>
              <button
                onClick={() => {
                  applyFinalSlidePreset();
                  showFeedback('Modelo "Slide Final (CTA)" aplicado!');
                }}
                className="text-xs bg-cgl-blue/20 border border-cgl-blue/50 hover:bg-cgl-blue hover:text-white text-cgl-blue hover:border-cgl-blue py-2 px-3 rounded transition font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                ➕ Inserir Slide Final (CTA)
              </button>
              <button
                onClick={() => applyTemplate('destaque')}
                className="text-xs bg-zinc-800 hover:bg-cgl-orange hover:text-cgl-black py-1.5 rounded transition font-bold cursor-pointer"
              >
                + Destaque
              </button>
              <button
                onClick={() => applyTemplate('agenda')}
                className="text-xs bg-zinc-800 hover:bg-cgl-orange hover:text-cgl-black py-1.5 rounded transition font-bold cursor-pointer"
              >
                + Agenda
              </button>
              <button
                onClick={() => applyTemplate('livre')}
                className="text-xs bg-zinc-800 hover:bg-cgl-orange hover:text-cgl-black py-1.5 rounded transition font-bold cursor-pointer"
              >
                + Entrada Livre
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
