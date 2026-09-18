import React, { useRef } from 'react';
import { useStore } from '../../store/useStore';
import type { TextureType } from '../../types';
import { storeAsset } from '../../utils/assetStore';
import { Upload } from 'lucide-react';
import { CGL_COLORS } from './constants';

interface BackgroundSectionProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const BackgroundSection: React.FC<BackgroundSectionProps> = ({ isOpen, onToggle }) => {
  const { canvasSettings, setCanvasSettings, setBackgroundImage } = useStore();
  const bgInputRef = useRef<HTMLInputElement>(null);

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackgroundImage(await storeAsset(file));
    e.target.value = '';
  };

  return (
    <section className="flex flex-col gap-2 pb-2 border-b border-zinc-900">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left py-1"
      >
        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 cursor-pointer">
          Fundo e Textura
        </label>
        <span className="text-zinc-500 text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="flex flex-col gap-2 animate-fadeIn">
          <select
            value={canvasSettings.textureType}
            onChange={(e) => setCanvasSettings({ textureType: e.target.value as TextureType })}
            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:border-cgl-orange"
          >
            <option value="none">Sem Textura</option>
            <option value="noise">Ruído Urbano</option>
            <option value="calcada">Calçada Portuguesa</option>
          </select>

          {canvasSettings.textureType !== 'none' && (
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-zinc-400">Opacidade</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={canvasSettings.textureOpacity}
                onChange={(e) => setCanvasSettings({ textureOpacity: parseFloat(e.target.value) })}
                className="flex-1"
              />
            </div>
          )}

          <div className="flex gap-1.5 mt-2">
            {CGL_COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => setCanvasSettings({ backgroundColor: c.hex, backgroundImage: null })}
                className="w-6 h-6 rounded-full border border-zinc-600 shadow-sm hover:scale-110 transition-transform"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
            <div className="w-px h-6 bg-zinc-700 mx-1"></div>
            <input
              type="color"
              value={canvasSettings.backgroundColor}
              onChange={(e) => setCanvasSettings({ backgroundColor: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer border-none bg-transparent p-0"
            />
          </div>

          <button
            onClick={() => bgInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition"
          >
            <Upload size={13} /> Upload Foto de Fundo
          </button>
          {canvasSettings.backgroundImage && (
            <button
              onClick={() => setBackgroundImage(null)}
              className="w-full py-1 text-[11px] text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded"
            >
              Remover Imagem de Fundo
            </button>
          )}
          <button
            onClick={() => setCanvasSettings({ backgroundColor: '#1A1A1A' })}
            className="w-full py-1 text-[11px] text-zinc-400 bg-zinc-800 hover:bg-zinc-700 rounded"
          >
            Repor Cor Padrão (#1A1A1A)
          </button>
          <input ref={bgInputRef} type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
        </div>
      )}
    </section>
  );
};
