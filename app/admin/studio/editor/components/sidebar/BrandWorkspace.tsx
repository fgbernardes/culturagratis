import { LogoSection } from './LogoSection';

export function BrandWorkspace() {
  return (
    <div className="flex flex-col gap-3">
      <div><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Marca</p><p className="mt-1 text-xs text-zinc-300">Aplica o logótipo e as opções de identidade.</p></div>
      <LogoSection isOpen onToggle={() => {}} />
    </div>
  );
}
