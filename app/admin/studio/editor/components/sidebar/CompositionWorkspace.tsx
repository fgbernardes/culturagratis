import { BackgroundSection } from './BackgroundSection';
import { FormatSection } from './FormatSection';

export function CompositionWorkspace() {
  return (
    <div className="flex flex-col gap-3">
      <div><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Composição</p><p className="mt-1 text-xs text-zinc-300">Define formato, fundo e zonas de segurança.</p></div>
      <FormatSection isOpen onToggle={() => {}} />
      <BackgroundSection isOpen onToggle={() => {}} />
    </div>
  );
}
