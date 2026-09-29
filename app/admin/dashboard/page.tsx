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
  { name: "Site e navegação", state: "29 set", note: "Oficina: corrigir 404, largura móvel dos eventos, links, títulos e cabeçalho de todas as páginas no estado lançado. Preservar o gate na Privacidade." },
  { name: "Acessibilidade e formulários", state: "29 set", note: "Oficina: verificar teclado, salto para conteúdo, contraste, zonas de toque, newsletter, submissão e correção." },
  { name: "QA independente", state: "29–30 set", note: "Grok revê o visual; Claude confirma bloqueadores e evidência; Gemini verifica links e textos. A Oficina incorpora as correções." },
  { name: "Agenda e conteúdo", state: "30 set", note: "Preparar a pipeline, confirmar fontes oficiais e carregar pelo menos dez eventos atuais, gratuitos e diversos." },
  { name: "SEO e domínio", state: "30 set", note: "Verificar noindex do preview, robots, canonicals, dois hosts e redirecionamento antes de qualquer abertura." },
  { name: "Operação e campanha", state: "30 set", note: "Guardar build, testes, commit, versão, plano de reversão e peças condicionais para a decisão de Filipe." },
];

const tasks = [
  { id: "P0 · 29", title: "Fechar as quebras de navegação e leitura", detail: "404, títulos de eventos a 390 px, ligação da newsletter e textos sobrepostos. Barra superior em todas as páginas após lançamento; Privacidade continua fechada no pré-lançamento.", owner: "Oficina", when: "Hoje" },
  { id: "P0 · 29", title: "Testar os percursos públicos", detail: "Formulários, teclado, foco, contraste, menu móvel, links e estados vazios. Guardar resultados e corrigir regressões.", owner: "Oficina + Grok", when: "Hoje" },
  { id: "P0 · 30", title: "Montar a pipeline de eventos", detail: "Gemini prepara a matriz; confirmar título, data, local, freguesia, categoria, entrada a 0 € e fonte oficial antes de cada inserção.", owner: "Gemini + Oficina", when: "Amanhã" },
  { id: "P0 · 30", title: "Carregar e rever a agenda de lançamento", detail: "Pelo menos dez eventos futuros e diversos; excluir terminados, ordenar por data e rever cartões e detalhes em telemóvel.", owner: "Oficina + Claude", when: "Amanhã" },
  { id: "GATE", title: "Fechar a verificação e a reversão", detail: "Build, testes, domínios, SEO, newsletter, formulários e rollback com evidência. Filipe decide se abre ou adia.", owner: "Claude + Filipe", when: "30 set · fim do dia" },
];

const calendar = [
  { date: "29 set", phase: "Técnica", title: "Site sem bloqueadores", detail: "Corrigir os problemas confirmados e passar por revisão em computador, telemóvel e teclado.", tone: "teal" },
  { date: "30 set", phase: "Editorial + gate", title: "Eventos e prova final", detail: "Carregar e verificar a agenda; fechar os gates técnicos, legais e operacionais até ao fim do dia.", tone: "yellow" },
  { date: "1 out", phase: "Condicional", title: "Decisão de lançamento", detail: "Abrir apenas se todos os bloqueadores estiverem resolvidos e Filipe autorizar o cutover.", tone: "orange" },
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
          <h1>Fechar o site. Confirmar cada passo.</h1>
          <span>Meta técnica: <strong>30 de setembro, fim do dia</strong>. A abertura em 1 de outubro depende do gate e da tua decisão.</span>
        </div>
        <div className="launch-countdown" aria-label="Data-alvo de lançamento: 1 de outubro">
          <strong>01</strong><span>OUT</span><small>data-alvo</small>
        </div>
      </section>

      <div className="launch-workspace">
        <section className="launch-summary" aria-label="Resumo dos registos editoriais">
          <article className="launch-score"><span>Site pronto para decisão</span><strong>30 set</strong><small>Fim do dia; abertura sujeita ao go/no-go.</small></article>
          <article><span>Marcados como publicados</span><strong>{published}</strong><small>Estado guardado no sistema; exige revisão editorial.</small></article>
          <article><span>Por verificar</span><strong>{awaitingReview}</strong><small>Rascunhos e registos em verificação.</small></article>
          <article><span>Submissões abertas</span><strong>{openSubmissions}</strong><small>{verified} eventos verificados, por publicar.</small></article>
        </section>

        <section className="launch-alert">
          <div><span>PRIORIDADE DE HOJE · 29 SET</span><strong>Fechar as correções do site.</strong></div>
          <p>Amanhã é o dia da pipeline e dos eventos. As contagens são lidas do sistema: «Publicado» é um estado do registo, não prova de que o evento ainda decorre ou cumpre o gate editorial.</p>
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
          <div className="launch-section-heading"><div><p>02 · CAMINHO CRÍTICO</p><h2>Lista de 29 e 30 de setembro</h2></div><span>Plano, não estado de conclusão</span></div>
          <div className="launch-task-list">
            {tasks.map((task) => (
              <article className="critical" key={task.id}>
                <div className="launch-task-id"><span>{task.id}</span></div>
                <div className="launch-task-copy"><h3>{task.title}</h3><p>{task.detail}</p><small>Responsável: {task.owner}</small></div>
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
          <div><p>GATE · 30 SETEMBRO, FIM DO DIA</p><h2>Quatro provas para decidir.</h2></div>
          <ol>
            <li><strong>Agenda</strong><span>Pelo menos dez eventos atuais e a 0 €, cada um com fonte e condições verificadas.</span></li>
            <li><strong>Confiança</strong><span>Domínio, indexação, páginas legais, newsletter e formulários conferidos.</span></li>
            <li><strong>Acesso</strong><span>Barra em todas as páginas lançadas; percursos utilizáveis em telemóvel e por teclado, sem fuga do pré-lançamento.</span></li>
            <li><strong>Controlo</strong><span>Testes, commit, versão publicada, reversão e decisão expressa de Filipe registados.</span></li>
          </ol>
        </section>

        <footer className="launch-source-note">Plano atualizado a 29/09/2026. As tarefas não mudam automaticamente de estado; as contagens vêm da Gestão editorial e não certificam a elegibilidade dos eventos. Nenhuma publicação ou abertura resulta deste painel.</footer>
      </div>
    </main>
  );
}
