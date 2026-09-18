import React, { useRef, useState } from 'react';
import { Camera, ImagePlus, Plus, Sparkles, Type } from 'lucide-react';
import { STICKERS } from '../../data/stickers';
import { useStore } from '../../store/useStore';
import { resolveAsset, storeAsset } from '../../utils/assetStore';
import { VectorShapesSection } from './VectorShapesSection';

type ContentArea = 'text' | 'photo' | 'graphics' | 'more';

const quickCategories = [
  { label: 'Música', color: '#FE7D02' },
  { label: 'Teatro', color: '#E53935' },
  { label: 'Exposição', color: '#00838F' },
  { label: 'Cinema', color: '#8E24AA' },
  { label: 'Famílias', color: '#43A047' },
  { label: 'Ar Livre', color: '#1E88E5' },
];

const logisticBadges = [
  { label: 'Ⓜ️ Metro próximo', color: '#1E88E5' },
  { label: '♿ Acessibilidade', color: '#00838F' },
  { label: '🐕 Pet friendly', color: '#43A047' },
  { label: '👶 Para famílias', color: '#FB8C00' },
];

export function ContentWorkspace() {
  const { slides, activeSlideIndex, setSlidePhoto, updateSlidePhoto, removeSlidePhoto, setInspectingPhoto, addElement, addImageElement, addTagElement } = useStore();
  const [activeArea, setActiveArea] = useState<ContentArea>('text');
  const photoInputRef = useRef<HTMLInputElement>(null);
  const stickerInputRef = useRef<HTMLInputElement>(null);
  const activePhoto = slides[activeSlideIndex]?.photo;

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSlidePhoto(await storeAsset(file));
    event.target.value = '';
  };

  const handleStickerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    addImageElement(await storeAsset(file));
    event.target.value = '';
  };

  const addTitle = () => addElement({ type: 'text', content: 'NOVO TÍTULO PRINCIPAL', x: 80, y: 200, fontSize: 72, fontFamily: '"Bricolage Grotesque", sans-serif', color: '#FE7D02', textAlign: 'left', fontWeight: 700, textTransform: 'uppercase', hasShadow: true });
  const addSubtitle = () => addElement({ type: 'text', content: 'Subtítulo / local do evento', x: 80, y: 350, fontSize: 32, fontFamily: '"Inter", sans-serif', color: '#FFFFFF', textAlign: 'left', fontWeight: 600, hasShadow: true });
  const addEventInfo = () => addElement({ type: 'text', content: '📅  Data e hora\n📍  Local\nℹ️  Confirma as condições de acesso', x: 80, y: 500, fontSize: 26, fontFamily: '"Inter", sans-serif', color: '#FFFFFF', textAlign: 'left', fontWeight: 500, hasBadge: true, badgeColor: '#1A1A1A', tagShape: 'rounded', borderRadius: '12px', hasShadow: true });
  const addCalendar = () => addElement({ type: 'text', content: 'MÊS\nDIA', x: 80, y: 120, fontSize: 36, fontFamily: '"Bricolage Grotesque", sans-serif', color: '#1A1A1A', textAlign: 'center', fontWeight: 900, hasBadge: true, badgeColor: '#FE7D02', isCalendarBadge: true, hasShadow: true });
  const addSwipe = () => addElement({ type: 'text', content: 'DESLIZA PARA VER MAIS  ➜', x: 320, y: 980, fontSize: 20, fontFamily: '"Inter", sans-serif', color: '#1A1A1A', textAlign: 'center', fontWeight: 800, textTransform: 'uppercase', hasBadge: true, badgeColor: '#FFC107', tagShape: 'pill', borderRadius: '9999px', hasShadow: true });

  const areaButton = (area: ContentArea, title: string, description: string, icon: React.ReactNode) => <button type="button" onClick={() => setActiveArea(area)} aria-expanded={activeArea === area} className={`w-full rounded-lg border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cgl-orange ${activeArea === area ? 'border-cgl-orange bg-cgl-orange/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-600'}`}><span className="flex items-center gap-2 text-[10px] font-black tracking-wider text-zinc-100">{icon}{title}</span><span className="mt-1 block text-[11px] leading-snug text-zinc-500">{description}</span></button>;

  return <div className="flex flex-col gap-3">
    <div><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Adicionar ao slide</p><p className="mt-1 text-xs text-zinc-300">Escolhe um tipo de conteúdo para ver apenas as opções relevantes.</p></div>
    <div className="flex flex-col gap-2">
      {areaButton('text', 'TEXTO', 'Título, dados do evento e categorias.', <Type size={14} className="text-cgl-orange" />)}
      {areaButton('photo', 'FOTOGRAFIA', 'Imagem de fundo e respetivo ajuste.', <Camera size={14} className="text-cgl-orange" />)}
      {areaButton('graphics', 'ELEMENTOS GRÁFICOS', 'Selos, ícones e ficheiros PNG.', <Sparkles size={14} className="text-cgl-yellow" />)}
      {areaButton('more', 'MAIS ELEMENTOS', 'Calendário, carrossel e logística.', <Plus size={14} className="text-cgl-blue" />)}
    </div>

    {activeArea === 'text' && <section aria-label="Opções de texto" className="flex flex-col gap-2 border-t border-zinc-800 pt-3">
      <button type="button" onClick={addTitle} className="rounded-lg border border-cgl-orange/40 bg-cgl-orange/10 px-3 py-2 text-left text-xs font-bold text-cgl-orange hover:bg-cgl-orange hover:text-cgl-black">+ Título principal</button>
      <button type="button" onClick={addSubtitle} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-left text-xs font-semibold text-zinc-200 hover:border-zinc-600">+ Subtítulo / local</button>
      <button type="button" onClick={addEventInfo} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-left text-xs font-semibold text-zinc-200 hover:border-zinc-600">+ Dados do evento</button>
      <button type="button" onClick={() => addTagElement('CATEGORIA', '#FE7D02')} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-left text-xs font-semibold text-zinc-200 hover:border-zinc-600">+ Etiqueta de categoria</button>
      <div className="grid grid-cols-2 gap-1.5 pt-1">{quickCategories.map((category) => <button type="button" key={category.label} onClick={() => addTagElement(category.label, category.color)} className="rounded-full border border-zinc-800 px-2 py-1 text-left text-[10px] font-bold" style={{ backgroundColor: `${category.color}20`, color: category.color }}>{category.label}</button>)}</div>
    </section>}

    {activeArea === 'photo' && <section aria-label="Opções de fotografia" className="flex flex-col gap-2 border-t border-zinc-800 pt-3">
      <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
      {!activePhoto ? <button type="button" onClick={() => photoInputRef.current?.click()} className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-3 text-xs font-bold text-zinc-200 hover:border-cgl-orange"><Camera size={14} className="mr-2 inline text-cgl-orange" />Carregar fotografia</button> : <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-2"><div className="flex items-center gap-2"><img src={resolveAsset(activePhoto.src)} alt="Fotografia carregada" className="h-10 w-10 rounded object-cover" /><span className="flex-1 text-xs font-semibold text-zinc-200">Fotografia carregada</span><button type="button" onClick={removeSlidePhoto} className="text-[10px] font-bold text-red-300 hover:text-red-200">Remover</button></div><div className="mt-2 grid grid-cols-2 gap-2"><button type="button" onClick={() => photoInputRef.current?.click()} className="rounded border border-zinc-700 py-1.5 text-[10px] font-bold text-zinc-200">Trocar</button><button type="button" onClick={() => setInspectingPhoto(true)} className="rounded border border-cgl-orange/50 py-1.5 text-[10px] font-bold text-cgl-orange">Ajustar</button></div><label className="mt-3 block rounded border border-zinc-800 bg-zinc-950/50 p-2"><span className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400"><span>Opacidade da Fotografia</span><span className="font-mono text-zinc-200">{Math.round((activePhoto.opacity ?? 1) * 100)}%</span></span><input aria-label="Opacidade da fotografia" type="range" min="0" max="1" step="0.05" value={activePhoto.opacity ?? 1} onChange={(event) => updateSlidePhoto({ opacity: parseFloat(event.target.value) })} className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-orange-500" /></label></div>}
    </section>}

    {activeArea === 'graphics' && <section aria-label="Elementos gráficos" className="flex flex-col gap-3 border-t border-zinc-800 pt-3">
      <VectorShapesSection />
      <input ref={stickerInputRef} type="file" accept="image/*" onChange={handleStickerUpload} className="hidden" />
      <button type="button" onClick={() => stickerInputRef.current?.click()} className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-200 hover:border-cgl-yellow"><ImagePlus size={14} className="mr-2 inline text-cgl-yellow" />Carregar PNG / sticker</button>
      <div className="grid grid-cols-2 gap-2">{STICKERS.map((sticker) => <button type="button" key={sticker.id} onClick={() => addImageElement(sticker.svgUri)} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2 hover:border-cgl-orange"><img src={sticker.svgUri} alt="" className="mx-auto h-8 w-auto" /><span className="mt-1 block truncate text-[9px] text-zinc-400">{sticker.name}</span></button>)}</div>
    </section>}

    {activeArea === 'more' && <section aria-label="Mais elementos" className="flex flex-col gap-2 border-t border-zinc-800 pt-3"><button type="button" onClick={addCalendar} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-left text-xs font-semibold text-zinc-200 hover:border-zinc-600">+ Crachá de calendário</button><button type="button" onClick={addSwipe} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-left text-xs font-semibold text-zinc-200 hover:border-zinc-600">+ Indicador de carrossel</button><div className="flex flex-wrap gap-1.5">{logisticBadges.map((badge) => <button type="button" key={badge.label} onClick={() => addTagElement(badge.label, badge.color)} className="rounded-full border border-zinc-800 bg-zinc-900 px-2 py-1 text-[10px] font-bold text-zinc-200">{badge.label}</button>)}</div></section>}
  </div>;
}
