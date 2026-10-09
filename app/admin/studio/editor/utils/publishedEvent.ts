import type { AspectRatio, BrandLogo, CanvasSettings, ImageElement, Slide, PublishedEventMetadata } from '../types';
export const FORMATS = [
  {ratio:'4:5',label:'Feed',width:1080,height:1350},
  {ratio:'9:16',label:'Story / Reel',width:1080,height:1920},
  {ratio:'1:1',label:'Quadrado',width:1080,height:1080},
  {ratio:'16:9',label:'Horizontal',width:1920,height:1080},
] as const;
export type MappingRow = {label:string;from:string;to:string;value:string};
export type MappedEvent = PublishedEventMetadata & {mapping:MappingRow[];ignored:string[];warnings:string[]};
type JsonEvent = Record<string,unknown>;
function object(value:unknown):JsonEvent {
  if(!value || typeof value!=='object' || Array.isArray(value)) throw new Error('O JSON deve conter um objeto de evento.');
  return value as JsonEvent;
}
export function readEventEnvelope(raw:string):{events:JsonEvent[]} {
  if(raw.length>1_000_000)throw new Error('O JSON excede 1 MB. Importa apenas o evento necessário.');
  let parsed:unknown;
  try {parsed=JSON.parse(raw);}catch {throw new Error('JSON inválido. Verifica as aspas, vírgulas e chavetas.');}
  const root=object(parsed);
  if(root.error)throw new Error('A resposta contém um erro da pipeline.');
  const events=root.events!==undefined?root.events:[root.event!==undefined?root.event:root];
  if(!Array.isArray(events)||events.length===0||events.length>100)throw new Error('O JSON deve conter entre 1 e 100 eventos.');
  return {events:events.map(object)};
}
function civilDate(value:string,label:string):string {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new Error(`${label}: usa AAAA-MM-DD.`);
  const date=new Date(`${value}T12:00:00Z`);
  if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==value)throw new Error(`${label}: a data não existe.`);
  const months=['jan.','fev.','mar.','abr.','mai.','jun.','jul.','ago.','set.','out.','nov.','dez.'];
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}
function compactDateRange(start:string,end:string):string {
  if(!end||start===end)return civilDate(start,'Data de início');
  const first=civilDate(start,'Data de início'),last=civilDate(end,'Data de fim');
  if(end<start)throw new Error('A data de fim é anterior ao início.');
  if(start.slice(0,7)===end.slice(0,7))return `${Number(start.slice(8))} a ${last}`;
  return `${first} a ${last}`;
}
function suggestHook(category:string,area:string,start:string,end:string,access:string):string {
  const location=area?` · ${area.toLocaleUpperCase('pt-PT')}`:'';
  const free=/gr[aá]tis|gratuit[ao]|entrada livre/i.test(access);
  const arts=/^exposi[cç]/i.test(category);
  if(start&&end&&arts&&free){
    const days=Math.round((Date.parse(`${end}T12:00:00Z`)-Date.parse(`${start}T12:00:00Z`))/86_400_000)+1;
    if(days>=2&&days<=7)return `${days} DIAS DE ARTE GRÁTIS${location}`;
  }
  return `CULTURA GRÁTIS${location}`;
}
export function mapPublishedEvent(input:unknown,confirmedPublished=false):MappedEvent {
  const data=object(input),used=new Set<string>(),mapping:MappingRow[]=[],warnings:string[]=[];
  function pick(label:string,to:string,keys:string[],required=false):string {
    const key=keys.find(k=>data[k]!==undefined&&data[k]!==null&&data[k]!=='');
    if(!key){if(required)throw new Error(`Falta ${label.toLocaleLowerCase('pt-PT')} no evento.`);return '';}
    used.add(key);
    if(typeof data[key]!=='string')throw new Error(`${label}: o valor deve ser texto.`);
    const value=(data[key] as string).trim();
    if(required&&!value)throw new Error(`Falta ${label.toLocaleLowerCase('pt-PT')} no evento.`);
    if(value.length>5000)throw new Error(`${label}: o texto é demasiado longo.`);
    mapping.push({label,from:key,to,value});return value;
  }
  const status=pick('Estado','validação',['status','estado']).toLowerCase();
  if(status&&!['published','publicado','publicada'].includes(status))throw new Error('O evento ainda não está publicado. Só entram eventos publicados.');
  if(!status&&!confirmedPublished)throw new Error('O JSON não indica o estado. Confirma que o evento está publicado antes de importar.');
  if(data.access52===true||data.access_52===true)throw new Error('Acesso 52 não é um evento e não entra nesta pipeline.');
  const title=pick('Título','title',['title','titulo','name'],true);
  if(title.length>300)throw new Error('O título excede 300 caracteres. Prepara um título social mais curto.');
  const start=pick('Data','date',['startDate','start_date','data_inicio']);
  const end=pick('Data de fim','date',['endDate','end_date','data_fim']);
  const plainDate=pick('Data descritiva','date',['date','data','datetime']);
  const time=pick('Horário','date',['time','timeLabel','time_label','hora','horario']);
  if(!start&&!plainDate)throw new Error('Falta a data do evento. O horário sozinho não substitui uma data.');
  let date=start?compactDateRange(start,end):plainDate;
  if(!start&&end)date+=` a ${civilDate(end,'Data de fim')}`;
  // A data é curta na peça; o horário mantém-se num campo editável próprio.
  if(!start&&time)date+=` · ${time}`;
  const venue=pick('Local','venue',['venue','location','local','localizacao','place'],true);
  const area=pick('Freguesia / bairro','venue',['area','freguesia','bairro']);
  const category=pick('Categoria','category',['category','categoria']);
  const condition=pick('Condição de acesso','texto de acesso',['condition','condicao']);
  const access=pick('Acesso','texto de acesso',['access','acesso']);
  const accessLabel=[...new Set([condition,access].filter(Boolean))].join(' · ');
  if(!accessLabel)warnings.push('Faltam as condições de acesso. Revê o evento antes de usar as peças.');
  const description=pick('Descrição','legenda',['description','descricao']);
  const sourceUrl=pick('Fonte oficial','legenda',['sourceUrl','source_url','fonte_url']);
  const sourceName=pick('Nome da fonte','rodapé',['sourceName','source_name','fonte']);
  const hook=pick('Chamada social','chamada',['socialHeadline','social_headline','hook']);
  if(sourceUrl&&!/^https?:\/\//i.test(sourceUrl))throw new Error('A ligação da fonte deve começar por https:// ou http://.');
  const id=typeof data.id==='number'?String(data.id):pick('ID','rastreabilidade',['id']);
  if(typeof data.id==='number')used.add('id');
  const slug=pick('Slug','rastreabilidade',['slug']);
  const colors:Record<string,string>={'teatro':'#FFC107','dança':'#FFC107','exposição':'#00838F','exposições':'#00838F','ar livre':'#00838F','cinema':'#FFC107'};
  // Sem selo genérico: as condições de acesso são desenhadas por extenso.
  return {studio:{title,date,venue:[venue,area].filter(Boolean).join(' · '),category,categoryColor:colors[category.toLowerCase()]||'#FE7D02',isFree:false},id,slug,access:accessLabel||'Acesso a confirmar',description,sourceUrl,sourceName,hook:hook||suggestHook(category,area,start,end,accessLabel),schedule:start?time:'',mapping,ignored:Object.keys(data).filter(k=>!used.has(k)),warnings};
}
export function buildStudioProject(event:PublishedEventMetadata,ratio:AspectRatio) {
  const format=FORMATS.find(f=>f.ratio===ratio);if(!format)throw new Error('Formato desconhecido.');
  const {width,height}=format,tall=ratio==='9:16',wide=ratio==='16:9',square=ratio==='1:1';
  const left=wide?120:80,contentWidth=width-2*left-(tall?40:0);
  const text=(id:string,content:string,y:number,size:number,color='#FFFFFF',display=false):ImageElement=>({id,type:'text',content,x:left,y,width:contentWidth,fontSize:size,fontFamily:display?'"Bricolage Grotesque", sans-serif':'"Inter", sans-serif',color,fontWeight:display?700:500,textAlign:'left'});
  const titleSize=event.studio.title.length>110?(wide?65:square?38:48):event.studio.title.length>65?(wide?82:square?52:60):(wide?104:82);
  const positions=tall?{category:235,hook:355,title:495,date:1080,schedule:1170,venue:1320,access:1440,source:1550,link:1620}
    :wide?{category:100,hook:205,title:300,date:585,schedule:670,venue:765,access:850,source:935,link:970}
    :square?{category:85,hook:180,title:275,date:555,schedule:625,venue:730,access:820,source:905,link:955}
    :{category:95,hook:190,title:285,date:700,schedule:790,venue:910,access:1030,source:1160,link:1220};
  const elements:ImageElement[]=[
    {...text('pipeline-category',event.studio.category||'Cultura em Lisboa',positions.category,25,'#1A1A1A'),width:undefined,hasBadge:true,badgeColor:'#FFC107',tagShape:'pill'},
    text('pipeline-hook',event.hook||'CULTURA GRÁTIS EM LISBOA',positions.hook,wide?36:30,'#1A1A1A',true),
    text('pipeline-title',event.studio.title,positions.title,titleSize,'#1A1A1A',true),
    text('pipeline-date',event.studio.date||'',positions.date,wide?46:42,'#FFC107',true),
    ...(event.schedule?[text('pipeline-schedule',event.schedule,positions.schedule,wide?28:26)]:[]),
    text('pipeline-venue',event.studio.venue||'',positions.venue,wide?32:30),
    text('pipeline-access',event.access,positions.access,event.access.length>100?21:wide?26:25,'#FFFFFF'),
    ...(event.sourceName?[text('pipeline-source',`Fonte: ${event.sourceName}`,positions.source,19,'#D1D5DB')]:[]),
    {...text('pipeline-link','culturagratis.com',positions.link,25,'#FFFFFF',true),width:width-left-280},
  ];
  const brandLogo:BrandLogo={src:'/cgl-emblem.png',visible:true,position:tall?'top-right':'bottom-right',size:tall?135:wide?145:130,opacity:1,margin:tall?80:50,backgroundHighlight:'none',logoColorMode:'original',logoShape:'original',removeWhiteBg:false,blendMode:'normal'};
  const canvasSettings:CanvasSettings={width,height,aspectRatio:ratio,backgroundColor:'#1A1A1A',backgroundImage:null,showSafeZones:false,textureType:'none',textureOpacity:0,zoom:tall?0.25:wide?0.32:0.4};
  const slide:Slide={id:'pipeline-event',elements,brandLogo,backgroundColor:'#1A1A1A',backgroundImage:null,textureType:'none',textureOpacity:0};
  return {canvasSettings,elements,brandLogo,slides:[slide],activeSlideIndex:0,selectedElementId:null,inspectingPhoto:false,past:[],future:[],canUndo:false,canRedo:false,lastSavedAt:Date.now()};
}
export function buildEventCaption(event:PublishedEventMetadata):string {
  const link=event.slug?`https://www.culturagratis.com/eventos/${encodeURIComponent(event.slug)}`:'https://www.culturagratis.com/';
  return [event.studio.title,`📅 ${event.studio.date}${event.schedule?` · ${event.schedule}`:''}`,`📍 ${event.studio.venue}`,event.description,`🎟️ ${event.access}`,event.sourceUrl?`Fonte oficial: ${event.sourceName?`${event.sourceName} · `:''}${event.sourceUrl}`:'',`Mais informação: ${link}`].filter(Boolean).join('\n\n');
}
const SOCIAL_FIELDS = { 'pipeline-title':'title', 'pipeline-date':'date', 'pipeline-venue':'venue', 'pipeline-category':'category', 'pipeline-access':'access' } as const;
export function synchronizeEventContent<T extends PublishedEventMetadata>(event:T,elements:ImageElement[]):T {
  const next={...event,studio:{...event.studio}};
  for(const [id,key] of Object.entries(SOCIAL_FIELDS)) {
    const element=elements.find(el=>el.id===id);
    if(!element||typeof element.content!=='string')continue;
    if(key==='access')next.access=element.content;else next.studio[key]=element.content;
  }
  const hook=elements.find(el=>el.id==='pipeline-hook');if(hook?.content)next.hook=hook.content;
  const schedule=elements.find(el=>el.id==='pipeline-schedule');if(schedule?.content!==undefined)next.schedule=schedule.content;
  return next;
}
export function validateProjectData(event:PublishedEventMetadata,elements:ImageElement[]):void {
  for(const [id,key] of Object.entries(SOCIAL_FIELDS)) {
    if(key==='category')continue;
    const element=elements.find(el=>el.id===id);
    const expected=key==='access'?event.access:event.studio[key];
    if(!element?.content?.trim())throw new Error('A peça perdeu um campo obrigatório. Repõe a composição antes de exportar.');
    if(element.content!==expected)throw new Error('A peça e os dados do evento não coincidem. Repõe a composição antes de exportar.');
  }
}

/** Adapta os campos do evento sem descartar alterações de texto, estilo ou fotografia. */
export function adaptPublishedSlide(slide:Slide,from:AspectRatio,to:AspectRatio):Slide {
  if(!slide.pipelineEvent||from===to)return slide;
  const event=synchronizeEventContent(slide.pipelineEvent,slide.elements);
  const before=buildStudioProject(slide.pipelineEvent,from),after=buildStudioProject(event,to);
  const sx=after.canvasSettings.width/before.canvasSettings.width,sy=after.canvasSettings.height/before.canvasSettings.height;
  const elements=slide.elements.map(el=>{
    const old=before.elements.find(item=>item.id===el.id),next=after.elements.find(item=>item.id===el.id);
    if(!old||!next)return {...el,x:el.x*sx,y:el.y*sy,width:el.width===undefined?undefined:el.width*sx,height:el.height===undefined?undefined:el.height*sy};
    return {...el,x:next.x+(el.x-old.x)*sx,y:next.y+(el.y-old.y)*sy,
      width:el.width===undefined?undefined:old.width&&next.width?next.width*el.width/old.width:el.width*sx,
      fontSize:el.fontSize&&old.fontSize&&next.fontSize?next.fontSize*el.fontSize/old.fontSize:el.fontSize};
  });
  return {...slide,elements,pipelineEvent:event,pipelineFormat:to,photo:slide.photo?{...slide.photo,x:slide.photo.x*sx,y:slide.photo.y*sy}:undefined};
}
