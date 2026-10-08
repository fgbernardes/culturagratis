import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { ImportEventModal } from './ImportEventModal';

export const AutoFillSection = () => {
  const [isOpen,setIsOpen]=useState(false);
  const [pending,setPending]=useState('');
  useEffect(()=>{
    let active=true;
    Promise.resolve().then(()=>{
      if(!active)return;
      try{const raw=sessionStorage.getItem('cgl-studio-published-event');if(raw){sessionStorage.removeItem('cgl-studio-published-event');setPending(raw);setIsOpen(true);}}catch{/* A importação manual continua disponível. */}
    });
    return()=>{active=false;};
  },[]);
  return <>
    <button type="button" onClick={()=>setIsOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-cgl-orange/60 bg-cgl-orange/10 px-3 py-3 text-sm font-bold text-white hover:bg-cgl-orange/20"><Zap size={16} className="text-cgl-orange"/>Importar evento</button>
    {isOpen&&<ImportEventModal isOpen initialText={pending} onClose={()=>{setIsOpen(false);setPending('');}}/>}
  </>;
};
