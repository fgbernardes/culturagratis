import type { Metadata } from "next";
import Link from "next/link";
import { cglLogoColor } from "../../brand-assets";
import { requireAdminPageUser } from "../../admin-auth";
import { listAllEvents } from "../../../db/events";
import { listSubmissions } from "../../../db/submissions";
import AdminWorkspaceNav from "../../components/admin-workspace-nav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — Cultura Grátis Lisboa",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function AdminDashboardPage() {
  const { user, allowed } = await requireAdminPageUser("/admin/dashboard");

  if (!allowed) {
    return (
      <main className="admin-shell">
        <section className="admin-denied">
          <h2>Acesso reservado</h2>
          <p>Este painel contém informação da operação interna do CGL.</p>
          <strong>{user.email}</strong>
        </section>
      </main>
    );
  }

  const [events, submissions] = await Promise.all([listAllEvents(), listSubmissions()]);
  const published = events.filter((event) => event.status === "published").length;
  const awaitingReview = events.filter((event) => event.status === "draft" || event.status === "review").length;
  const verified = events.filter((event) => event.status === "verified").length;
  const openSubmissions = submissions.filter((item) => item.status === "received" || item.status === "review").length;

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <Link className="subpage-brand" href="/">
          <img src={cglLogoColor} alt="" width="58" height="58" />
          <span>Cultura Grátis Lisboa</span>
        </Link>
        <div><span>{user.displayName}</span><Link href="/admin/logout">Terminar sessão</Link></div>
      </header>
      <AdminWorkspaceNav active="dashboard" />

      <section className="admin-hero">
        <p>DASHBOARD</p>
        <h1>O estado do CGL.</h1>
        <span>Contagens dos registos editoriais neste momento. A decisão de lançamento é feita por pessoas, depois da verificação das fontes e dos critérios.</span>
      </section>

      <div className="admin-workspace">
        <section className="admin-metrics" aria-label="Estado dos registos editoriais">
          <article><span>Marcados como publicados</span><strong>{published}</strong></article>
          <article><span>Por verificar</span><strong>{awaitingReview}</strong></article>
          <article><span>Verificados, por publicar</span><strong>{verified}</strong></article>
          <article><span>Submissões abertas</span><strong>{openSubmissions}</strong></article>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p>OPERAÇÃO EDITORIAL</p><h2>Trabalho em curso</h2></div></div>
          <p>As contagens refletem os estados guardados no sistema. Um registo marcado como publicado não substitui a confirmação de gratuitidade, data, local, condições de acesso e fonte.</p>
          <p><Link href="/admin">Abrir Gestão editorial e rever registos →</Link></p>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p>ÁREAS DE TRABALHO</p><h2>Acesso rápido</h2></div></div>
          <ul>
            <li><Link href="/admin/biblioteca">Biblioteca: decisões, documentação e Ecossistema IA</Link></li>
            <li><Link href="/admin/studio">Studio CGL: peças visuais</Link></li>
          </ul>
        </section>
      </div>
    </main>
  );
}
