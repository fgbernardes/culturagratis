import type { Metadata } from "next";
import Link from "next/link";
import { cglLogoColor } from "../../brand-assets";
import { requireAdminPageUser } from "../../admin-auth";
import { listAllEvents } from "../../../db/events";
import AdminWorkspaceNav from "../../components/admin-workspace-nav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Painel de lançamento — Cultura Grátis Lisboa",
  robots: { index: false, follow: false, noarchive: true },
};

const EVENT_TARGET = 10;
const DAYS_LEFT_AT_SNAPSHOT = 10;
const EXAMPLE_EVENT_SLUGS = new Set(["gaivotas-no-patio-2026", "fotografias-1956-2005"]);

const fixedWorkstreams = [
  { name: "Site e produto", progress: 82, note: "MVP funcional; correções de pré-lançamento aplicadas.", weight: 22 },
  { name: "Marca e campanha", progress: 82, note: "Sistema visual fechado; SVG final em preparação.", weight: 12 },
  { name: "SEO e domínio", progress: 62, note: "Metadados internos fechados; faltam domínio, HTTPS e redirects.", weight: 10 },
  { name: "QA essencial", progress: 48, note: "Acessibilidade, formulários, segurança e rollback.", weight: 15 },
  { name: "Operação", progress: 45, note: "Go/no-go, runbook e vigilância das primeiras 72 h.", weight: 10 },
  { name: "Pacote de lançamento", progress: 35, note: "Copy, newsletter e peças finais ainda por fechar.", weight: 6 },
];

const tasks = [
  { id: "AGENDA", title: "Estabilizar Agenda em produção", owner: "Codex", due: "26 ago", progress: 85, state: "Pronta para teste", critical: true },
  { id: "CONTENT", title: "Verificar e publicar 10 eventos", owner: "Filipe + Duarte", due: "3 set", progress: 0, state: "Em curso", critical: true, live: true },
  { id: "PROD", title: "Fechar domínio, SEO técnico e redirects", owner: "Codex + Filipe", due: "30 ago", progress: 45, state: "Próxima", critical: true },
  { id: "MAIL", title: "Fechar newsletter e página PT-PT", owner: "Filipe", due: "30 ago", progress: 35, state: "Próxima", critical: true },
  { id: "QA", title: "Smoke test: móvel, formulários e acessibilidade", owner: "Codex + Filipe", due: "2 set", progress: 30, state: "Pendente", critical: true },
  { id: "OPS", title: "Runbook, backup, rollback e go/no-go", owner: "Codex", due: "3 set", progress: 20, state: "Pendente", critical: true },
  { id: "A52", title: "Polimento Acesso 52 e documentação extensa", owner: "Duarte + Codex", due: "11 set", progress: 60, state: "Pós-lançamento", critical: false },
  { id: "SCALE", title: "Automação editorial e escala de conteúdo", owner: "Codex", due: "18 set", progress: 25, state: "Pós-lançamento", critical: false },
];

const calendar = [
  { date: "25 ago", phase: "Decisão", title: "Congelar o MVP", detail: "Só entram tarefas que desbloqueiam confiança, publicação ou receita.", tone: "orange" },
  { date: "26–28 ago", phase: "Sprint 1", title: "Agenda + candidatura de portefólio", detail: "Agenda estável, navegação sólida e versão partilhável até 29 ago.", tone: "teal" },
  { date: "26 ago", phase: "Teasers", title: "Campanha comprimida começa", detail: "Exceção consciente à regra das 3 semanas: 9 dias, sem fingir que são 21.", tone: "yellow" },
  { date: "29 ago–1 set", phase: "Sprint 2", title: "Conteúdo + produção", detail: "Eventos verificados, domínio, newsletter e SEO técnico.", tone: "teal" },
  { date: "2–3 set", phase: "Gate", title: "QA e go/no-go", detail: "Zero bloqueadores críticos; 10 eventos publicados; rollback pronto.", tone: "charcoal" },
  { date: "4 set · 18:30", phase: "Lançamento", title: "CGL 2.0 público", detail: "Abrir, comunicar e vigiar métricas e erros durante 72 horas.", tone: "orange" },
];

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  const progress = clamp(value);
  return (
    <div className="launch-progress" aria-label={`${label}: ${progress}%`}>
      <span style={{ width: `${progress}%` }} />
    </div>
  );
}

export default async function AdminLaunchDashboardPage() {
  const { user, allowed } = await requireAdminPageUser("/admin/dashboard");

  if (!allowed) {
    return (
      <main className="admin-shell">
        <section className="admin-denied"><h2>Acesso reservado</h2><p>Este painel contém estratégia e operação interna do CGL.</p><strong>{user.email}</strong></section>
      </main>
    );
  }

  const events = await listAllEvents();
  const publishedEvents = events.filter((event) => event.status === "published" && !EXAMPLE_EVENT_SLUGS.has(event.slug)).length;
  const agendaProgress = clamp((publishedEvents / EVENT_TARGET) * 100);
  const workstreams = [
    { name: "Agenda e conteúdo", progress: agendaProgress, note: `${publishedEvents} de ${EVENT_TARGET} eventos de lançamento publicados.`, weight: 25 },
    ...fixedWorkstreams,
  ];
  const readiness = clamp(workstreams.reduce((sum, item) => sum + item.progress * item.weight, 0) / 100);
  const taskRows = tasks.map((task) => task.live ? { ...task, progress: agendaProgress } : task);
  const daysLeft = DAYS_LEFT_AT_SNAPSHOT;

  return (
    <main className="admin-shell launch-dashboard">
      <header className="admin-header">
        <Link className="subpage-brand" href="/"><img src={cglLogoColor} alt="" width="58" height="58" /><span>Cultura Grátis Lisboa</span></Link>
        <div><span>{user.displayName}</span><Link href="/admin">Gestão editorial</Link><Link href="/admin/logout">Terminar sessão</Link></div>
      </header>
      <AdminWorkspaceNav active="dashboard" />

      <section className="launch-hero">
        <div>
          <p>PAINEL DE LANÇAMENTO · ATUALIZADO A 25 AGO 2026</p>
          <h1>Bora pôr isto na rua.</h1>
          <span>MVP público a <strong>4 de setembro, 18:30</strong>. A campanha começa já.</span>
        </div>
        <div className="launch-countdown" aria-label={`${daysLeft} dias até ao lançamento`}>
          <strong>{daysLeft}</strong><span>dias</span><small>até abrir</small>
        </div>
      </section>

      <div className="launch-workspace">
        <section className="launch-summary" aria-label="Resumo do lançamento">
          <article className="launch-score"><span>Prontidão do MVP</span><strong>{readiness}%</strong><ProgressBar value={readiness} label="Prontidão do MVP" /><small>Calculada por peso das frentes abaixo.</small></article>
          <article><span>Esforço crítico</span><strong>38 h</strong><small>Escopo acelerado; não inclui melhorias pós-lançamento.</small></article>
          <article><span>Eventos publicados</span><strong>{publishedEvents}/{EVENT_TARGET}</strong><small>Gate editorial mínimo para abrir a Agenda.</small></article>
          <article><span>Versão partilhável</span><strong>29 ago</strong><small>Primeiro candidato para portefólio e entrevistas.</small></article>
        </section>

        <section className="launch-alert">
          <div><span>DECISÃO DE RITMO</span><strong>O plano de 6 de outubro foi abatido.</strong></div>
          <p>Para lançar antes de 6 de setembro, as três semanas de teasers deixam de ser possíveis. A campanha é comprimida para 9 dias e tudo o que não bloqueia o MVP passa para depois de 4 de setembro.</p>
        </section>

        <section className="launch-section">
          <div className="launch-section-heading"><div><p>01 · VISÃO GERAL</p><h2>Evolução por frente</h2></div><span>{readiness}% do MVP pronto</span></div>
          <div className="launch-stream-grid">
            {workstreams.map((item) => (
              <article key={item.name}>
                <div><strong>{item.name}</strong><b>{item.progress}%</b></div>
                <ProgressBar value={item.progress} label={item.name} />
                <p>{item.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="launch-section">
          <div className="launch-section-heading"><div><p>02 · CAMINHO CRÍTICO</p><h2>O que falta fazer</h2></div><span>6 tarefas bloqueiam a abertura</span></div>
          <div className="launch-task-list">
            {taskRows.map((task) => (
              <article className={task.critical ? "critical" : "later"} key={task.id}>
                <div className="launch-task-id"><span>{task.id}</span><small>{task.state}</small></div>
                <div className="launch-task-copy"><h3>{task.title}</h3><p>{task.owner} · até {task.due}</p><ProgressBar value={task.progress} label={task.title} /></div>
                <strong>{task.progress}%</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="launch-section">
          <div className="launch-section-heading"><div><p>03 · CALENDÁRIO REGRESSIVO</p><h2>De hoje ao lançamento</h2></div><span>Teasers: 26 ago → 4 set</span></div>
          <div className="launch-calendar">
            {calendar.map((item) => (
              <article className={`tone-${item.tone}`} key={`${item.date}-${item.title}`}>
                <time>{item.date}</time><span>{item.phase}</span><h3>{item.title}</h3><p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="launch-gate">
          <div><p>GO / NO-GO · 3 SETEMBRO</p><h2>Abre se — e só se — estes quatro sinais estiverem verdes.</h2></div>
          <ol>
            <li><strong>Agenda</strong><span>10 eventos reais, gratuitos, verificados e publicados.</span></li>
            <li><strong>Confiança</strong><span>Domínio, HTTPS, canonicals e formulários sem falhas críticas.</span></li>
            <li><strong>Acesso</strong><span>Fluxos principais utilizáveis por teclado e em telemóvel.</span></li>
            <li><strong>Controlo</strong><span>Backup, rollback e responsável pelas primeiras 72 horas definidos.</span></li>
          </ol>
        </section>

        <footer className="launch-source-note">Snapshot operacional estimado. As contagens de eventos são lidas da gestão editorial; as restantes percentagens são marcos de planeamento e devem ser atualizadas após cada sprint.</footer>
      </div>
    </main>
  );
}
