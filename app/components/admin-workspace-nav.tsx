import Link from "next/link";

export type AdminWorkspaceId = "biblioteca" | "dashboard" | "gestao" | "studio";

const items: Array<{ id: AdminWorkspaceId; label: string; href: string; description: string }> = [
  { id: "biblioteca", label: "Biblioteca", href: "/admin/biblioteca", description: "Manuais, fontes e referências" },
  { id: "dashboard", label: "Dashboard", href: "/admin/dashboard", description: "Estado operacional e prioridades" },
  { id: "gestao", label: "Gestão editorial", href: "/admin", description: "Eventos, submissões e publicação" },
  { id: "studio", label: "Studio CGL", href: "/admin/studio", description: "Peças visuais e conteúdo social" },
];

export default function AdminWorkspaceNav({ active }: { active: AdminWorkspaceId }) {
  return (
    <nav className="admin-workspace-nav" aria-label="Áreas do Admin CGL">
      {items.map((item) => (
        <Link key={item.id} href={item.href} className={item.id === active ? "is-active" : undefined} aria-current={item.id === active ? "page" : undefined}>
          <strong>{item.label}</strong><small>{item.description}</small>
        </Link>
      ))}
    </nav>
  );
}
