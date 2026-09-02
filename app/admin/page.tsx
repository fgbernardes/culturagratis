import Link from "next/link";
import { cglLogoColor } from "../brand-assets";
import { requireAdminPageUser } from "../admin-auth";
import { listAllEvents } from "../../db/events";
import { listSubmissions } from "../../db/submissions";
import AdminClient from "./admin-client";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { user, allowed } = await requireAdminPageUser("/admin");

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <Link className="subpage-brand" href="/"><img src={cglLogoColor} alt="" width="58" height="58" /><span>Cultura Grátis Lisboa</span></Link>
        <div><span>{user.displayName}</span><Link href="/admin/dashboard">Painel de lançamento</Link><Link href="/admin/logout">Terminar sessão</Link></div>
      </header>
      <section className="admin-hero"><p>GESTÃO EDITORIAL</p><h1>Da fonte à publicação.</h1><span>Regista, confirma e publica sem perder o rasto da informação.</span></section>
      {allowed ? <AdminClient events={await listAllEvents()} submissions={await listSubmissions()} /> : (
        <section className="admin-denied"><h2>Acesso ainda não configurado</h2><p>Esta conta está autenticada, mas não consta da lista de gestão do CGL.</p><strong>{user.email}</strong><p>Indica este endereço ao configurar o acesso editorial.</p></section>
      )}
    </main>
  );
}
