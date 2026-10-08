import JSZip from 'jszip';
import { useStore } from '../store/useStore';
import { captureCanvasPng, waitForCanvasReady } from './exportCanvas';
import { FORMATS, adaptPublishedSlide, buildEventCaption, synchronizeEventContent, validateProjectData } from './publishedEvent';

export async function createPublishedEventPack(node:HTMLDivElement,onProgress:(label:string)=>void) {
  const original=useStore.getState();
  if(original.exportingEventPack)throw new Error('Já está a ser gerado um pack.');
  const slide=original.slides[original.activeSlideIndex];
  if(!slide?.pipelineEvent)throw new Error('Importa primeiro o JSON de um evento publicado.');
  const event=synchronizeEventContent(slide.pipelineEvent,original.elements);
  validateProjectData(event,original.elements);
  const stem=(event.slug||event.id||'evento').replace(/[^a-z0-9-]+/gi,'-').replace(/^-+|-+$/g,'')||'evento';
  useStore.setState({exportingEventPack:true});
  try {
    const zip=new JSZip();
    for(const [index,format] of FORMATS.entries()) {
      onProgress(`${index+1}/4 · ${format.label}`);
      const adapted=adaptPublishedSlide({...slide,elements:original.elements,brandLogo:original.brandLogo},slide.pipelineFormat||original.canvasSettings.aspectRatio,format.ratio);
      useStore.setState({
        slides:original.slides.map((current,i)=>i===original.activeSlideIndex?adapted:current),
        elements:adapted.elements,brandLogo:adapted.brandLogo||original.brandLogo,
        canvasSettings:{...original.canvasSettings,width:format.width,height:format.height,aspectRatio:format.ratio},
        selectedElementId:null,inspectingPhoto:false,
      });
      await waitForCanvasReady(node);
      const image=await captureCanvasPng(node);
      zip.file(`cgl-${stem}-${format.width}x${format.height}.png`,image.replace(/^data:image\/png;base64,/,''),{base64:true});
    }
    zip.file('legenda.txt',buildEventCaption(event));
    zip.file('evento-studio.json',JSON.stringify({event,formats:FORMATS.map(({ratio,width,height})=>({ratio,width,height}))},null,2));
    return {blob:await zip.generateAsync({type:'blob'}),filename:`cgl-${stem}-4-formatos.zip`};
  } finally {
    // Repor também o histórico e o slide ativo, sem consumir passos de Undo.
    useStore.setState(original);
  }
}
