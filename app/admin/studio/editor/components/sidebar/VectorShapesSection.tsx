import { useMemo, useState } from 'react';
import { Plus, RefreshCw, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';
import {
  CGL_VECTOR_PALETTES,
  generateVectorShapeSvg,
  svgToDataUri,
  VECTOR_SHAPE_PRESETS,
  type VectorPaletteId,
  type VectorShapeId,
} from '../../utils/vectorShapes';

const paletteLabels: Record<VectorPaletteId, string> = {
  sunset: 'Pôr do sol',
  tejo: 'Tejo',
  charcoal: 'Carvão',
  full: 'CGL completo',
};

const previewIds: VectorShapeId[] = ['urban-lines', 'skyline', 'garden', 'bicycle', 'tram', 'map'];

export function VectorShapesSection() {
  const { addImageElement, updateElement } = useStore();
  const [paletteId, setPaletteId] = useState<VectorPaletteId>('full');
  const [variation, setVariation] = useState(1);
  const [density, setDensity] = useState(3);
  const [strokeWidth, setStrokeWidth] = useState(6);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'estrutura' | 'natureza' | 'mobilidade' | 'sinalética'>('all');

  const previews = useMemo(() => {
    return new Map(previewIds.map((id) => [
      id,
      svgToDataUri(generateVectorShapeSvg(id, {
        palette: CGL_VECTOR_PALETTES[paletteId],
        variation,
        density,
        strokeWidth,
      })),
    ]));
  }, [density, paletteId, strokeWidth, variation]);

  const filteredPresets = VECTOR_SHAPE_PRESETS.filter((preset) => selectedCategory === 'all' || preset.category === selectedCategory);

  const insertShape = (shapeId: VectorShapeId) => {
    const src = svgToDataUri(generateVectorShapeSvg(shapeId, {
      palette: CGL_VECTOR_PALETTES[paletteId],
      variation,
      density,
      strokeWidth,
    }));
    const id = addImageElement(src);
    updateElement(id, {
      x: 110,
      y: 130,
      width: 360,
      rotation: 0,
      opacity: 0.95,
    });
  };

  const regenerate = () => setVariation((current) => (current + 1) % 100);

  return (
    <section aria-label="Formas CGL de urbanismo" className="flex flex-col gap-2 border-t border-zinc-800 pt-3">
      <div className="flex items-center gap-1.5">
        <Sparkles size={14} className="text-cgl-orange" />
        <span className="text-[10px] font-black uppercase tracking-wider text-zinc-100">Formas CGL · Urbanismo</span>
      </div>
      <p className="text-[11px] leading-snug text-zinc-500">Desenhos transparentes para preencher o slide com cidade, natureza e mobilidade.</p>

      <div className="grid grid-cols-2 gap-1.5">
        {(['all', 'estrutura', 'natureza', 'mobilidade', 'sinalética'] as const).map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`rounded-md border px-2 py-1.5 text-[9px] font-bold uppercase tracking-wide transition ${selectedCategory === category ? 'border-cgl-orange bg-cgl-orange/15 text-cgl-orange' : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-600 hover:text-zinc-200'}`}
          >
            {category === 'all' ? 'Todas' : category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 p-2">
        {filteredPresets.map((preset) => {
          const preview = previews.get(preset.id) || svgToDataUri(generateVectorShapeSvg(preset.id, {
            palette: CGL_VECTOR_PALETTES[paletteId], variation, density, strokeWidth,
          }));
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => insertShape(preset.id)}
              title={`${preset.name}: ${preset.description}`}
              className="group flex min-h-[88px] flex-col items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 p-1.5 transition hover:border-cgl-orange hover:bg-zinc-900 focus-visible:outline-2 focus-visible:outline-cgl-orange"
            >
              <img src={preview} alt="" className="h-14 w-full object-contain transition-transform group-hover:scale-105" />
              <span className="mt-1 line-clamp-1 w-full text-center text-[8px] font-semibold text-zinc-400 group-hover:text-zinc-100">{preset.name}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-2">
        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-zinc-400"><SlidersHorizontal size={11} className="text-cgl-blue" /> Ajustes da forma</div>
        <label className="flex items-center justify-between gap-2 text-[10px] text-zinc-400">
          Paleta
          <select value={paletteId} onChange={(event) => setPaletteId(event.target.value as VectorPaletteId)} className="w-28 rounded border border-zinc-700 bg-zinc-950 px-1.5 py-1 text-[10px] text-zinc-200">
            {(Object.keys(paletteLabels) as VectorPaletteId[]).map((id) => <option key={id} value={id}>{paletteLabels[id]}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-[10px] text-zinc-400">Densidade <input aria-label="Densidade" type="range" min="1" max="5" value={density} onChange={(event) => setDensity(Number(event.target.value))} className="min-w-0 flex-1 accent-orange-500" /><span className="w-3 text-right text-zinc-200">{density}</span></label>
        <label className="flex items-center gap-2 text-[10px] text-zinc-400">Traço <input aria-label="Espessura do traço" type="range" min="2" max="14" value={strokeWidth} onChange={(event) => setStrokeWidth(Number(event.target.value))} className="min-w-0 flex-1 accent-orange-500" /><span className="w-4 text-right text-zinc-200">{strokeWidth}</span></label>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={regenerate} className="flex flex-1 items-center justify-center gap-1 rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-[10px] font-bold text-zinc-300 hover:border-cgl-orange hover:text-cgl-orange"><RefreshCw size={11} /> Nova variação <span className="text-zinc-600">#{variation}</span></button>
          <button type="button" onClick={() => insertShape('urban-lines')} className="flex items-center justify-center gap-1 rounded border border-cgl-orange/50 bg-cgl-orange/10 px-2 py-1.5 text-[10px] font-bold text-cgl-orange hover:bg-cgl-orange hover:text-cgl-black"><Plus size={11} /> Linhas</button>
        </div>
      </div>
      <p className="text-[9px] leading-snug text-zinc-600">Clica numa forma para a inserir. Depois podes movê-la, ampliá-la, rodá-la e copiá-la como qualquer outro elemento.</p>
    </section>
  );
}

