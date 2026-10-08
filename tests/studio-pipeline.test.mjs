import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSync } from 'esbuild';
import { createRequire } from 'node:module';

const compiled = buildSync({entryPoints:['app/admin/studio/editor/utils/eventParser.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {parseEventText} = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const captionCode=buildSync({entryPoints:['app/admin/studio/editor/utils/captionDraft.ts'],bundle:true,write:false,format:'esm',platform:'node'}).outputFiles[0].text;
const {buildCaptionDraft}=await import('data:text/javascript;base64,'+Buffer.from(captionCode).toString('base64'));
const event = {id:'test-1',slug:'jazz-teste',status:'published',title:'Jazz no jardim',startDate:'2026-10-10',timeLabel:'18h30',venue:'Jardim de teste',area:'Estrela',category:'Música',condition:'Entrada gratuita com reserva',access:'Reserva prévia obrigatória',sourceUrl:'https://example.org/evento',description:'Evento fictício de teste',free:false};
// Só a fronteira de armazenamento do navegador é substituída neste teste Node.
const browserStorage=new Map();
globalThis.localStorage={getItem:key=>browserStorage.get(key)??null,setItem:(key,value)=>browserStorage.set(key,String(value)),removeItem:key=>browserStorage.delete(key),clear:()=>browserStorage.clear(),key:index=>[...browserStorage.keys()][index]??null,get length(){return browserStorage.size;}};
const storeCode=buildSync({entryPoints:['app/admin/studio/editor/store/useStore.ts'],bundle:true,write:false,format:'cjs',platform:'node',packages:'external'}).outputFiles[0].text;
const storeModule={exports:{}};
new Function('module','exports','require',storeCode)(storeModule,storeModule.exports,createRequire(import.meta.url));
const {useStore}=storeModule.exports;
const baseline=useStore.getState();
test.afterEach(()=>useStore.setState(baseline));

test('a importação JSON mantém data, horário, freguesia e acesso condicional',()=>{
  const parsed=parseEventText(JSON.stringify(event));
  assert.equal(parsed.date,'10 out. 2026 · 18h30');
  assert.equal(parsed.venue,'Jardim de teste · Estrela');
  assert.equal(parsed.access,'Entrada gratuita com reserva · Reserva prévia obrigatória');
  assert.equal(parsed.isFree,false);
});
test('o Studio rejeita rascunhos e JSON inválido sem os transformar em texto livre',()=>{
  assert.throws(()=>parseEventText(JSON.stringify({...event,status:'draft'})),/publicado/);
  assert.throws(()=>parseEventText('{ quebrado'),/JSON inválido/);
});
test('a importação de texto livre continua disponível',()=>{
  assert.equal(parseEventText('Concerto de teste\nSábado às 18h\nJardim da Estrela, Lisboa').title,'Concerto de teste');
});
test('o JSON prepara elementos editáveis no Studio e conserva o evento ao mudar de slide',()=>{
  useStore.getState().autoFillEvent(parseEventText(JSON.stringify(event)));
  const imported=useStore.getState();
  assert.equal(imported.elements.find(el=>el.id==='pipeline-access')?.content,'Entrada gratuita com reserva · Reserva prévia obrigatória');
  assert.equal(imported.slides[0].pipelineEvent?.id,'test-1');
  useStore.getState().addSlide();
  useStore.getState().setActiveSlide(0);
  assert.equal(useStore.getState().slides[0].pipelineEvent?.id,'test-1');
});
test('mudar de formato mantém texto, cor e posição ajustados pelo utilizador',()=>{
  useStore.getState().setAspectRatio('4:5');
  useStore.getState().autoFillEvent(parseEventText(JSON.stringify(event)));
  useStore.getState().updateElement('pipeline-title',{content:'Jazz ao pôr do sol',color:'#00838F'});
  useStore.getState().updateElement('pipeline-date',{x:120,y:800,fontSize:40});
  useStore.getState().setAspectRatio('1:1');
  const state=useStore.getState();
  const title=state.elements.find(el=>el.id==='pipeline-title');
  assert.equal(title?.content,'Jazz ao pôr do sol');
  assert.equal(title?.color,'#00838F');
  const date=state.elements.find(el=>el.id==='pipeline-date');
  assert.equal(date?.x,120);
  assert.equal(date?.y,562);
  assert.equal(date?.fontSize,40);
  assert.equal(state.canvasSettings.width,1080);
  assert.equal(state.canvasSettings.height,1080);
});
test('a legenda reflete os textos editados e mantém acesso e fonte oficial',()=>{
  useStore.getState().autoFillEvent(parseEventText(JSON.stringify(event)));
  useStore.getState().updateElement('pipeline-title',{content:'Jazz ao pôr do sol'});
  useStore.getState().updateElement('pipeline-date',{content:'12 out. 2026 · 20h'});
  const caption=buildCaptionDraft(useStore.getState().slides);
  assert.ok(caption.includes('Jazz ao pôr do sol'));
  assert.ok(caption.includes('12 out. 2026 · 20h'));
  assert.ok(caption.includes('Reserva prévia obrigatória'));
  assert.ok(caption.includes('Fonte oficial: https://example.org/evento'));
});
test('desfazer e refazer a importação também repõe a informação do evento',()=>{
  useStore.getState().autoFillEvent(parseEventText(JSON.stringify(event)));
  useStore.getState().undo();
  assert.equal(useStore.getState().slides[0].pipelineEvent,undefined);
  useStore.getState().redo();
  assert.equal(useStore.getState().slides[0].pipelineEvent?.id,'test-1');
  assert.equal(useStore.getState().elements.find(el=>el.id==='pipeline-title')?.content,'Jazz no jardim');
});
test('duplicar uma peça conserva o evento e permite editar a cópia isoladamente',()=>{
  useStore.getState().autoFillEvent(parseEventText(JSON.stringify(event)));
  useStore.getState().duplicateSlide(0);
  const copied=useStore.getState().slides[1];
  assert.equal(copied.pipelineEvent?.id,'test-1');
  assert.notEqual(copied.id,useStore.getState().slides[0].id);
  assert.ok(copied.elements.find(el=>el.id==='pipeline-access'));
  useStore.getState().updateElement('pipeline-title',{content:'Título da cópia'});
  useStore.getState().setAspectRatio('9:16');
  assert.equal(useStore.getState().slides[1].pipelineEvent?.studio.title,'Título da cópia');
  assert.equal(useStore.getState().slides[0].pipelineEvent?.studio.title,'Jazz no jardim');
});
test('guardar e carregar um modelo de evento conserva campos editados e logo',()=>{
  useStore.getState().autoFillEvent(parseEventText(JSON.stringify(event)));
  useStore.getState().updateElement('pipeline-title',{content:'Título guardado'});
  useStore.getState().saveCurrentAsPreset('Evento guardado');
  const presetId=useStore.getState().customPresets[0].id;
  useStore.getState().addSlide();
  useStore.getState().loadPreset(presetId);
  const loaded=useStore.getState();
  assert.equal(loaded.slides[1].pipelineEvent?.id,'test-1');
  assert.equal(loaded.elements.find(el=>el.id==='pipeline-title')?.content,'Título guardado');
  assert.equal(loaded.brandLogo.size,200);
  useStore.getState().setAspectRatio('1:1');
  assert.equal(useStore.getState().slides[1].pipelineEvent?.studio.title,'Título guardado');
});
test('modelos independentes e limpar a tela removem o vínculo ao evento substituído',()=>{
  const replacements=[()=>useStore.getState().applyTemplate('destaque'),()=>useStore.getState().applyAgendaPreset(),...['tiktok','whatsapp','facebook'].map(platform=>()=>useStore.getState().applyPlatformPreset(platform)),()=>useStore.getState().clearCanvas(),()=>useStore.getState().autoFillEvent(parseEventText('Concerto livre\nSábado às 18h\nJardim da Estrela, Lisboa'))];
  for(const replace of replacements){
    useStore.setState(baseline);
    useStore.getState().autoFillEvent(parseEventText(JSON.stringify(event)));
    replace();
    assert.equal(useStore.getState().slides[0].pipelineEvent,undefined);
  }
  useStore.setState(baseline);
  useStore.getState().saveCurrentAsPreset('Modelo livre');
  const presetId=useStore.getState().customPresets[0].id;
  useStore.getState().autoFillEvent(parseEventText(JSON.stringify(event)));
  useStore.getState().loadPreset(presetId);
  assert.equal(useStore.getState().slides[0].pipelineEvent,undefined);
});
