import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { Zap, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { parseEventText } from '../../utils/eventParser';
import { readEventEnvelope, mapPublishedEvent, buildStudioProject, validateProjectData, type MappedEvent } from '../../utils/publishedEvent';
import { TEST_EVENTS } from '../../utils/pipelineExamples';

interface ImportEventModalProps { isOpen: boolean; onClose: () => void; initialText?: string; }
const inputStyle='w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-white focus:border-cgl-orange focus:outline-none';

export const ImportEventModal: React.FC<ImportEventModalProps> = ({isOpen,onClose,initialText=''}) => {
  const [mode,setMode]=useState<'json'|'text'>('json');
  const [raw,setRaw]=useState(initialText);
  const [confirmed,setConfirmed]=useState(false);
  const [events,setEvents]=useState<Record<string,unknown>[]>([]);
  const [index,setIndex]=useState(0);
  const [draft,setDraft]=useState<MappedEvent|null>(null);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const hydrated=useSyncExternalStore(listener=>useStore.persist.onFinishHydration(listener),()=>useStore.persist.hasHydrated(),()=>false);
  useEffect(()=>{if(!isOpen)return;const listener=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose();};window.addEventListener('keydown',listener);return()=>window.removeEventListener('keydown',listener);},[isOpen,onClose]);
  if(!isOpen)return null;
  const changeRaw=(value:string)=>{setRaw(value);setDraft(null);setEvents([]);setIndex(0);setError('');};
  const readEvent=(items:Record<string,unknown>[],selected:number)=>{
    setDraft(null);setError('');
    try{setDraft(mapPublishedEvent(items[selected],confirmed));}catch(err){setError(err instanceof Error?err.message:'Não foi possível importar o evento.');}
  };
  const analyse=()=>{
    setError('');setDraft(null);
    try{
      if(mode==='text'){useStore.getState().autoFillEvent(parseEventText(raw));onClose();return;}
      const {events:items}=readEventEnvelope(raw);setEvents(items);setIndex(0);readEvent(items,0);
    }catch(err){setError(err instanceof Error?err.message:'Não foi possível ler os dados.');}
  };
  const apply=()=>{
    if(!draft)return;
    try{validateProjectData(draft,buildStudioProject(draft,useStore.getState().canvasSettings.aspectRatio).elements);useStore.getState().importPublishedEvent(draft);onClose();}
    catch(err){setError(err instanceof Error?err.message:'Revê os campos do evento.');}
  };
  const loadFile=async(file?:File)=>{
    if(!file)return;
    if(file.size>1_000_000){setError('O JSON excede 1 MB.');return;}
    setLoading(true);
    try{changeRaw(await file.text());}catch{setError('Não foi possível ler o ficheiro.');}finally{setLoading(false);}
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/85 p-4 backdrop-blur-sm">
    <section role="dialog" aria-modal="true" aria-labelledby="import-event-heading" className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-4 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl">
      <header className="flex items-center justify-between"><h2 id="import-event-heading" className="flex items-center gap-2 font-bold"><Zap size={18} className="text-cgl-orange"/>Importar evento para o Studio</h2><button type="button" onClick={onClose} aria-label="Fechar importação" className="p-2 text-zinc-400 hover:text-white"><X size={18}/></button></header>
      <p className="text-sm text-zinc-300">Prepara o slide atual. Depois podes editar tudo com as ferramentas do Studio e desfazer a importação.</p>
      <div className="flex gap-2" role="group" aria-label="Tipo de importação">{(['json','text'] as const).map(value=><button key={value} type="button" onClick={()=>{setMode(value);setDraft(null);setError('');}} aria-pressed={mode===value} className={`rounded border px-3 py-2 text-sm ${mode===value?'border-cgl-orange text-cgl-orange':'border-zinc-700 text-zinc-300'}`}>{value==='json'?'JSON de evento publicado':'Texto livre'}</button>)}</div>
      <fieldset disabled={loading||!hydrated} className="flex flex-col gap-3 border-0 p-0">
        <label className="text-sm text-zinc-300">{mode==='json'?'JSON do evento publicado':'Texto do evento'}<textarea value={raw} onChange={e=>changeRaw(e.target.value)} rows={6} className={`${inputStyle} mt-1 resize-y font-mono`} placeholder={mode==='json'?'Cola o JSON da pipeline':'Título, data, horário, local e categoria'}/></label>
        {mode==='json'&&<>
          <label className="flex items-start gap-2 text-sm text-zinc-300"><input type="checkbox" checked={confirmed} onChange={e=>{setConfirmed(e.target.checked);setDraft(null);}} className="mt-1 accent-orange-500"/>Confirmo que o evento está publicado, se o JSON não incluir o estado</label>
          <label className="text-sm text-zinc-300">Carregar ficheiro JSON<input type="file" accept=".json,application/json" onChange={e=>{void loadFile(e.target.files?.[0]);e.target.value='';}} className="mt-1 block w-full rounded border border-zinc-700 p-2 text-sm"/></label>
          <p className="text-xs text-zinc-500">Exemplos fictícios de teste</p><div className="flex flex-wrap gap-2">{TEST_EVENTS.map(example=><button type="button" key={example.label} onClick={()=>changeRaw(JSON.stringify(example.event,null,2))} className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:border-cgl-orange">{example.label}</button>)}</div>
        </>}
        <button type="button" onClick={analyse} disabled={!raw.trim()} className="rounded bg-cgl-orange px-3 py-2 text-sm font-bold text-cgl-black disabled:opacity-50">{mode==='json'?'Ler JSON e rever campos':'Preencher slide com texto'}</button>
        {events.length>1&&<label className="text-sm">Evento do lote<select value={index} onChange={e=>{const selected=Number(e.target.value);setIndex(selected);readEvent(events,selected);}} className={`${inputStyle} mt-1`}>{events.map((item,i)=><option key={i} value={i}>{String(item.title||item.titulo||item.name||`Evento ${i+1}`)}</option>)}</select></label>}
        {draft&&<div className="flex flex-col gap-3 border-t border-zinc-700 pt-3">
          {([['title','Título'],['date','Data e horário'],['venue','Local e freguesia'],['category','Categoria']] as const).map(([key,label])=><label key={key} className="text-sm text-zinc-300">{label}<textarea value={draft.studio[key]||''} maxLength={key==='title'?300:5000} rows={2} onChange={e=>setDraft({...draft,studio:{...draft.studio,[key]:e.target.value}})} className={`${inputStyle} mt-1`}/></label>)}
          <label className="text-sm text-zinc-300">Condições de acesso<textarea value={draft.access} rows={2} maxLength={5000} onChange={e=>setDraft({...draft,access:e.target.value})} className={`${inputStyle} mt-1`}/></label>
          {!!draft.warnings.length&&<p className="text-sm text-amber-300">{draft.warnings.join(' ')}</p>}
          <details className="text-sm text-zinc-400"><summary className="cursor-pointer">{draft.mapping.length} campos reconhecidos</summary><ul className="mt-2 space-y-1">{draft.mapping.map(row=><li key={row.from}>{row.from}: {row.value}</li>)}</ul>{!!draft.ignored.length&&<p className="mt-2">Campos sem uso na peça: {draft.ignored.join(', ')}</p>}</details>
          <button type="button" onClick={apply} className="rounded bg-cgl-orange px-3 py-2 text-sm font-bold text-cgl-black">Preparar no Studio</button>
        </div>}
      </fieldset>
      {error&&<p role="alert" className="rounded border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">{error}</p>}
      {!hydrated&&<p role="status" className="text-sm text-zinc-400">A recuperar o projeto guardado…</p>}
      <p className="text-xs text-zinc-500">As alterações feitas aqui aplicam-se às peças sociais. O evento publicado no site mantém os seus dados.</p>
    </section>
  </div>;
};
