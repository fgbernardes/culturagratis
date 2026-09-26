import type { Metadata } from "next";
import Link from "next/link";
import { cglLogoColor } from "../../brand-assets";
import { requireAdminPageUser } from "../../admin-auth";
import { listAllEvents } from "../../../db/events";
import { listSubmissions } from "../../../db/submissions";
import AdminWorkspaceNav from "../../components/admin-workspace-nav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Painel de lançamento — Cultura Grátis Lisboa",
  robots: { index: false, follow: false, noarchive: true },
};

const workstreams = [
  { name: "Agenda e conteúdo", state: "29–30 set", note: "Seleção e verificação dos eventos na janela editorial acordada." },
  { name: "Site e produto", state: "Em revisão", note: "Rever os percursos públicos e corrigir problemas concretos." },
  { name: "Marca e campanha", state: "Em preparação", note: "Usar os PNG oficiais e fechar as peças de lançamento." },
  { name: "SEO e domínio", state: "A confirmar", note: "Conferir domínio, canonicals, robots e redirecionamento." },
  { name: "QA essencial", state: "A confirmar", note: "Testar formulários, teclado, telemóvel e recuperação." },
  { name: "Operação", state: "A confirmar", note: "Fechar responsáveis, backup e procedimento de reversão." },
];

const tasks = [
  { id: "CONTEÚDO", title: "Verificar as propostas antes de publicar", detail: "Fontes, gratuitidade, data, local e condições de acesso.", when: "29–30 set" },
  { id: "QA", title: "Testar os percursos de lançamento", detail: "Site, formulários, navegação móvel e acessibilidade.", when: "Antes de abrir" },
  { id: "DOMÍNIO", title: "Confirmar o estado dos dois hosts", detail: "Pré-visualização, landing oficial, robots e redirecionamentos.", when: "Antes de abrir" },
  { id: "OPERAÇÃO", title: "Fechar o go/no-go e a reversão", detail: "Decisão humana com evidência e responsável identificado.", when: "1 out" },
];

const calendar = [
  { date: "26–28 set", phase: "Preparação", title: "Site e campanha", detail: "Fechar correções, peças e verificações sem publicar eventos antecipadamente.", tone: "teal" },
  { date: "29–30 set", phase: "Editorial", title: "Agenda e eventos", detail: "Selecionar, verificar e preparar os eventos reais.", tone: "yellow" },
  { date: "1 out", phase: "Decisão", title: "Lançamento, se estiver pronto", detail: "Confirmar o gate e só depois abrir o site ao público.", tone: "orange" },
];

export default async function AdminLaunchDashboardPage() {
  const { user, allowed } = await requireAdminPageUser("/admin/dashboard");
  if (!allowed) {
    return (
      <main className="admin-shell">
        <section className="admin-denied"><h2>Acesso reservado</h2><p>Este painel contém estratégia e operação interna do CGL.</p><strong>{user.email}</strong></section>
      </main>
    );
  }

  const [events, submissions] = await Promise.all([listAllEvents(), listSubmissions()]);
  const published = events.filter((event) => event.status === "published").length;
  const awaitingReview = events.filter((event) => event.status === "draft" || event.status === "review").length;
  const verified = events.filter((event) => event.status === "verified").length;
  const openSubmissions = submissions.filter((item) => item.status === "received" || item.status === "review").length;

  return (
    <main className="admin-shell launch-dashboard">
      <header className="admin-header">
        <Link className="subpage-brand" href="/"><img src={cglLogoColor} alt="" width="58" height="58" /><span>Cultura Grátis Lisboa</span></Link>
        <div><span>{user.displayName}</span><Link href="/admin">Gestão editorial</Link><Link href="/admin/logout">Terminar sessão</Link></div>
      </header>
      <AdminWorkspaceNav active="dashboard" />

      <section className="launch-hero">
        <div>
          <p>PAINEL DE LANÇAMENTO · PLANO PARA 1 DE OUTUBRO</p>
          <h1>Bora pôr isto na rua.</h1>
          <span>Objetivo: <strong>1 de outubro</strong>, sujeito à verificação final e à tua decisão.</span>
        </div>
        <div className="launch-countdown" aria-label="Data-alvo de lançamento: 1 de outubro">
          <strong>01</strong><span>OUT</span><small>data-alvo</small>
        </div>
      </section>

      <div className="launch-workspace">
        <section className="launch-summary" aria-label="Resumo dos registos editoriais">
          <article className="launch-score"><span>Data-alvo</span><strong>1 out</strong><small>A abertura depende do go/no-go.</small></article>
          <article><span>Marcados como publicados</span><strong>{published}</strong><small>Estado guardado no sistema; exige revisão editorial.</small></article>
          <article><span>Por verificar</span><strong>{awaitingReview}</strong><small>Rascunhos e registos em verificação.</small></article>
          <article><span>Submissões abertas</span><strong>{openSubmissions}</strong><small>{verified} eventos verificados, por publicar.</small></article>
        </section>

        <section className="launch-alert">
          <div><span>PRÓXIMA DECISÃO</span><strong>Conferir o conteúdo antes da abertura.</strong></div>
          <p>As contagens são lidas do sistema. O estado «Publicado» indica o estado do registo; a seleção dos eventos reais e a confirmação das fontes são feitas na Gestão editorial.</p>
        </section>

        <section className="launch-section">
          <div className="launch-section-heading"><div><p>01 · VISÃO GERAL</p><h2>Frentes de trabalho</h2></div><span>Estado de planeamento, sem percentagens estimadas</span></div>
          <div className="launch-stream-grid">
            {workstreams.map((item) => (
              <article key={item.name}>
                <div><strong>{item.name}</strong><b>{item.state}</b></div>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="launch-section">
          <div className="launch-section-heading"><div><p>02 · CAMINHO CRÍTICO</p><h2>O que falta fechar</h2></div></div>
          <div className="launch-task-list">
            {tasks.map((task) => (
              <article className="critical" key={task.id}>
                <div className="launch-task-id"><span>{task.id}</span></div>
                <div className="launch-task-copy"><h3>{task.title}</h3><p>{task.detail}</p></div>
                <strong>{task.when}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="launch-section">
          <div className="launch-section-heading"><div><p>03 · CALENDÁRIO</p><h2>Até à decisão de abertura</h2></div></div>
          <div className="launch-calendar">
            {calendar.map((item) => (
              <article className={"tone-" + item.tone} key={item.date}>
                <time>{item.date}</time><span>{item.phase}</span><h3>{item.title}</h3><p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="launch-gate">
          <div><p>GO / NO-GO · 1 OUTUBRO</p><h2>Quatro sinais para decidir.</h2></div>
          <ol>
            <li><strong>Agenda</strong><span>Eventos reais e gratuitos, com fonte e condições verificadas.</span></li>
            <li><strong>Confiança</strong><span>Domínio, robots, páginas institucionais e formulários conferidos.</span></li>
            <li><strong>Acesso</strong><span>Fluxos principais utilizáveis em telemóvel e por teclado.</span></li>
            <li><strong>Controlo</strong><span>Procedimentos de backup, reversão e acompanhamento definidos.</span></li>
          </ol>
        </section>

        <footer className="launch-source-note">Contagens dos estados guardados na Gestão editorial. Planeamento e gate dependem de confirmação humana; o painel não certifica a elegibilidade dos eventos.</footer>
      </div>
    </main>
  );
}
