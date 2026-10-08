import { useState } from 'react';
import { FolderArchive } from 'lucide-react';
import { saveAs } from 'file-saver';
import { useStore } from '../../store/useStore';
import { createPublishedEventPack } from '../../utils/publishedEventExport';

export function PublishedEventExport({canvasRef}:{canvasRef:React.RefObject<HTMLDivElement|null>}) {
  const {slides,activeSlideIndex,exportingEventPack}=useStore();
  const [progress,setProgress]=useState('');
  const [error,setError]=useState('');
  if(!slides[activeSlideIndex]?.pipelineEvent)return null;
  const generate=async()=>{
    if(useStore.getState().exportingEventPack)return;
    setError('');
    if(!canvasRef.current){setError('A tela ainda não está pronta.');return;}
    try{const result=await createPublishedEventPack(canvasRef.current,setProgress);saveAs(result.blob,result.filename);setProgress('');}
    catch(err){setError(err instanceof Error?err.message:'Não foi possível gerar o pack.');setProgress('');}
  };
  return <div className="relative">
    <button type="button" onClick={()=>void generate()} disabled={exportingEventPack} title="Gerar quatro PNG, legenda e JSON do evento" className="flex items-center gap-1.5 rounded-lg border border-cgl-orange bg-cgl-orange/10 px-3 py-1.5 text-xs font-bold text-cgl-orange disabled:opacity-50"><FolderArchive size={14}/>{exportingEventPack?progress||'A gerar…':'4 formatos'}</button>
    {error&&<p role="alert" className="absolute right-0 top-full z-50 mt-2 w-80 rounded border border-red-500/40 bg-red-950 p-3 text-xs text-red-200">{error}</p>}
  </div>;
}
