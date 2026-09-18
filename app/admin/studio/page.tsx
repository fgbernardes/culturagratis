import Link from "next/link";
import { cglLogoColor } from "../../brand-assets";
import { requireAdminPageUser } from "../../admin-auth";
import AdminWorkspaceNav from "../../components/admin-workspace-nav";
import StudioEmbedded from "./studio-embedded";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const { user, allowed } = await requireAdminPageUser("/admin/studio");
  return (
    <main className="admin-shell admin-studio-shell">
      <header className="admin-header"><Link className="subpage-brand" href="/"><img src={cglLogoColor} alt="" width="58" height="58" /><span>Cultura Grátis Lisboa</span></Link><div><span>{user.displayName}</span><Link href="/admin/logout">Terminar sessão</Link></div></header>
      <AdminWorkspaceNav active="studio" />
      {allowed ? <StudioEmbedded /> : <section className="admin-denied"><h2>Acesso reservado</h2><p>O Studio CGL só está disponível para contas administrativas autorizadas.</p><strong>{user.email}</strong></section>}
    </main>
  );
}
