import { AutoFillSection } from './AutoFillSection';
import { PresetsSection } from './PresetsSection';

export function StartWorkspace() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Começar</p>
        <p className="mt-1 text-xs text-zinc-300">Importa os dados do evento ou parte de um modelo.</p>
      </div>
      <AutoFillSection />
      <PresetsSection isOpen onToggle={() => {}} />
    </div>
  );
}
