"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { EventRecord, EventStatus } from "../../db/events";
import type { SubmissionRecord, SubmissionStatus } from "../../db/submissions";
import { formatVerificationDate } from "../components/verification-badge";
import { categories } from "../site-content";

const statusLabels: Record<EventStatus, string> = {
  draft: "Candidato", review: "Em verificação", verified: "Verificado", published: "Publicado", archived: "Arquivado", rejected: "Não elegível",
};

const submissionStatusLabels: Record<SubmissionStatus, string> = {
  received: "Recebida", review: "Em verificação", resolved: "Resolvida", archived: "Arquivada",
};

export default function AdminClient({ events, submissions }: { events: EventRecord[]; submissions: SubmissionRecord[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [batchText, setBatchText] = useState("");

  async function submitEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const data = { ...Object.fromEntries(formData.entries()), tags: formData.getAll("tags") };
    const response = await fetch("/api/gestao/eventos", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    const result = await response.json() as { error?: string };
    setBusy(false);
    if (!response.ok) { setMessage(result.error ?? "Não foi possível guardar."); return; }
    form.reset(); setMessage("Evento guardado como rascunho."); router.refresh();
  }

  async function importBatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    let parsed: unknown;
    try {
      parsed = JSON.parse(batchText);
    } catch {
      setMessage("O lote tem de ser JSON válido.");
      return;
    }
    if (!Array.isArray(parsed) || !parsed.length) {
      setMessage("Cola uma lista JSON com pelo menos um evento.");
      return;
    }
    setBusy(true);
    const response = await fetch("/api/gestao/eventos", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ events: parsed }),
    });
    const result = await response.json() as { events?: EventRecord[]; error?: string };
    setBusy(false);
    if (!response.ok) { setMessage(result.error ?? "Não foi possível importar o lote."); return; }
    setBatchText("");
    setMessage(`${result.events?.length ?? 0} eventos criados em Em verificação.`);
    router.refresh();
  }

  async function changeStatus(id: string, status: EventStatus) {
    setBusy(true); setMessage("");
    const response = await fetch(`/api/gestao/eventos/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    });
    const result = await response.json() as { error?: string };
    setBusy(false);
    if (!response.ok) { setMessage(result.error ?? "Não foi possível atualizar."); return; }
    setMessage(status === "published" ? "Evento verificado e publicado." : "Estado atualizado.");
    router.refresh();
  }

  async function changeAccess52(id: string, access52: boolean) {
    setBusy(true); setMessage("");
    const response = await fetch(`/api/gestao/eventos/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ access52 }),
    });
    const result = await response.json() as { error?: string };
    setBusy(false);
    if (!response.ok) { setMessage(result.error ?? "Não foi possível atualizar a classificação."); return; }
    setMessage(access52 ? "Classificação Acesso 52 aplicada." : "Classificação Acesso 52 retirada.");
    router.refresh();
  }

  async function changeSubmissionStatus(id: number, status: SubmissionStatus) {
    setBusy(true); setMessage("");
    const response = await fetch(`/api/gestao/submissoes/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    });
    const result = await response.json() as { error?: string };
    setBusy(false);
    if (!response.ok) { setMessage(result.error ?? "Não foi possível atualizar."); return; }
    setMessage(status === "resolved" ? "Submissão dada como resolvida." : "Estado da submissão atualizado.");
    router.refresh();
  }

  const counts = events.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1; return acc;
  }, {});

  return (
    <div className="admin-workspace">
      <section className="admin-metrics" aria-label="Resumo editorial">
        <article><span>Publicados</span><strong>{counts.published ?? 0}</strong></article>
        <article><span>Por verificar</span><strong>{(counts.draft ?? 0) + (counts.review ?? 0)}</strong></article>
        <article><span>Prontos a publicar</span><strong>{counts.verified ?? 0}</strong></article>
        <article><span>Não elegíveis</span><strong>{counts.rejected ?? 0}</strong></article>
        <article><span>Submissões abertas</span><strong>{submissions.filter((item) => item.status === "received" || item.status === "review").length}</strong></article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading"><div><p>ENTRADAS DO PÚBLICO</p><h2>Submissões</h2></div><span>{submissions.length} registos</span></div>
        <div className="admin-submission-list">
          {submissions.length ? submissions.map((submission) => <SubmissionRow key={submission.id} submission={submission} busy={busy} onChange={changeSubmissionStatus} />) : <div className="admin-list-empty">Ainda não há sugestões ou correções recebidas.</div>}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading"><div><p>IMPORTAÇÃO EDITORIAL</p><h2>Importar lote</h2></div><span>Até 100 candidatos</span></div>
        <form className="admin-form" onSubmit={importBatch}>
          <label className="admin-span-2">Lista JSON de eventos
            <textarea value={batchText} onChange={(event) => setBatchText(event.target.value)} rows={10} required placeholder={'[\n  {\n    "title": "…",\n    "venue": "…",\n    "area": "…",\n    "streetAddress": "…",\n    "postalCode": "0000-000",\n    "startDate": "2026-09-30",\n    "category": "Música",\n    "accessType": "Entrada livre",\n    "sourceName": "Entidade oficial",\n    "sourceUrl": "https://…"\n  }\n]'} />
          </label>
          <div className="admin-form-actions admin-span-2">
            <button type="submit" disabled={busy}>{busy ? "A importar…" : "Validar e importar lote"}</button>
            <span>Todos os registos entram em <strong>Em verificação</strong>.</span>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading"><div><p>NOVO REGISTO</p><h2>Adicionar evento</h2></div><span>Começa sempre em rascunho</span></div>
        <form className="admin-form" onSubmit={submitEvent}>
          <label className="admin-span-2">Título<input name="title" required /></label>
          <label>Local<input name="venue" required /></label>
          <label>Freguesia ou zona<input name="area" required /></label>
          <label>Morada<input name="streetAddress" required placeholder="Ex.: Rua das Gaivotas, 8" /></label>
          <label>Código postal<input name="postalCode" required inputMode="numeric" pattern="[0-9]{4}-[0-9]{3}" placeholder="0000-000" /></label>
          <label>Data inicial<input name="startDate" type="date" required /></label>
          <label>Data final<input name="endDate" type="date" /></label>
          <label>Horário<input name="timeLabel" placeholder="Ex.: 19h30" /></label>
          <label>Categoria<select name="category" defaultValue="Exposições e artes visuais">{categories.map((category) => <option key={category.slug}>{category.name}</option>)}</select></label>
          <label>Condição de acesso<select name="accessType" defaultValue="Por confirmar"><option>Entrada livre</option><option>Reserva gratuita</option><option>Levantamento gratuito</option><option>Entrada gratuita em horário específico</option><option>Por confirmar</option></select></label>
          <label>Nome da fonte<input name="sourceName" required placeholder="Entidade organizadora" /></label>
          <label className="admin-span-2">Ligação oficial<input name="sourceUrl" type="url" required placeholder="https://…" /></label>
          <fieldset className="admin-span-2"><legend>Etiquetas</legend><div className="admin-tag-options">{["Ao ar livre", "Para famílias", "Cultura de bairro", "Lotação limitada", "Língua Gestual Portuguesa", "Acessível por cadeira de rodas"].map((tag) => <label key={tag} className="admin-checkbox"><input name="tags" type="checkbox" value={tag} /> <span>{tag}</span></label>)}</div></fieldset>
          <label className="admin-span-2">Descrição<textarea name="description" rows={3} /></label>
          <label className="admin-span-2">Como entrar<textarea name="access" rows={2} /></label>
          <label className="admin-span-2">Acessibilidade<textarea name="accessibility" rows={2} /></label>
          <label className="admin-checkbox admin-span-2"><input name="access52" type="checkbox" /> <span><strong>Acesso 52</strong><small>Assinalar apenas equipamentos abrangidos pela lista oficial.</small></span></label>
          <div className="admin-form-actions admin-span-2">
            <button type="submit" disabled={busy}>{busy ? "A guardar…" : "Guardar rascunho"}</button>
            <span role="status">{message}</span>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading"><div><p>PIPELINE</p><h2>Eventos</h2></div><span>{events.length} registos</span></div>
        <div className="admin-event-list">
          {events.map((event) => <EventRow key={event.id} event={event} busy={busy} onChange={changeStatus} onAccess52Change={changeAccess52} />)}
        </div>
      </section>
    </div>
  );
}

function SubmissionRow({ submission, busy, onChange }: { submission: SubmissionRecord; busy: boolean; onChange: (id: number, status: SubmissionStatus) => void }) {
  const [status, setStatus] = useState<SubmissionStatus>(submission.status);
  const title = submission.kind === "event" ? submission.eventTitle : submission.eventReference;
  const submitterLabel = submission.submitterRelation === "organizer" ? "ORGANIZAÇÃO / PRODUÇÃO" : submission.submitterRelation === "public" ? "SUGESTÃO DO PÚBLICO" : "SUGESTÃO DE EVENTO";
  const dateLabel = submission.endDate ? `${submission.eventDate} — ${submission.endDate}` : submission.eventDate;
  const timeLabel = submission.endTime ? `${submission.startTime} — ${submission.endTime}` : submission.startTime ?? submission.timeLabel;
  return (
    <article className="admin-submission-row">
      <div className={`admin-status admin-submission-status-${submission.status}`}>{submissionStatusLabels[submission.status]}</div>
      <div className="admin-submission-copy">
        <small>{submission.kind === "event" ? submitterLabel : "CORREÇÃO"} · CGL-{String(submission.id).padStart(5, "0")}</small>
        <h3>{title}</h3>
        <p>{submission.name} · <a href={`mailto:${submission.email}`}>{submission.email}</a>{submission.organization ? ` · ${submission.organization}` : ""}{submission.organizationRole ? ` · ${submission.organizationRole}` : ""}</p>
        {submission.kind === "event" ? <p>{dateLabel}{timeLabel ? ` · ${timeLabel}` : ""} · {submission.venue} · {submission.area} · {submission.condition}</p> : null}
        {submission.promotionInterest ? <p className="admin-commercial-lead">INTERESSE EM DIVULGAÇÃO PAGA</p> : null}
        {submission.newsletterOptIn ? <p className="admin-newsletter-lead">NEWSLETTER · CONSENTIMENTO RECOLHIDO</p> : null}
        {submission.details ? <details><summary>Ver informação enviada</summary><p>{submission.details}</p>{submission.accessibility ? <p><strong>Acessibilidade:</strong> {submission.accessibility}</p> : null}</details> : null}
        {submission.sourceUrl ? <a href={submission.sourceUrl} target="_blank" rel="noreferrer">Abrir fonte indicada ↗</a> : null}
      </div>
      <div className="admin-status-control"><label>Estado<select value={status} onChange={(e) => setStatus(e.target.value as SubmissionStatus)}><option value="received">Recebida</option><option value="review">Em verificação</option><option value="resolved">Resolvida</option><option value="archived">Arquivada</option></select></label><button type="button" disabled={busy || status === submission.status} onClick={() => onChange(submission.id, status)}>Atualizar</button></div>
    </article>
  );
}

function EventRow({ event, busy, onChange, onAccess52Change }: { event: EventRecord; busy: boolean; onChange: (id: string, status: EventStatus) => void; onAccess52Change: (id: string, access52: boolean) => void }) {
  const [status, setStatus] = useState<EventStatus>(event.status);
  const [access52, setAccess52] = useState(event.access52);
  const isReverification = event.status === "published" && status === "published";
  return (
    <article className="admin-event-row">
      <div className={`admin-status admin-status-${event.status}`}>{statusLabels[event.status]}</div>
      <div><small>{event.startDate}{event.endDate ? ` — ${event.endDate}` : ""} · {event.category}</small><h3>{event.title}</h3><p>{event.venue} · {event.streetAddress}, {event.postalCode} Lisboa · {event.area}</p>{event.verifiedAt ? <p className="admin-verification-date">✓ Verificado em {formatVerificationDate(event.verifiedAt)}</p> : null}{event.access52 ? <p className="admin-access52-date">Acesso 52 · classificação ativa</p> : null}<a href={event.sourceUrl} target="_blank" rel="noreferrer">Abrir fonte oficial ↗</a></div>
      <div className="admin-status-control"><label>Estado<select value={status} onChange={(e) => setStatus(e.target.value as EventStatus)}><option value="draft">Candidato</option><option value="review">Em verificação</option><option value="verified">Verificado</option><option value="published">Publicado</option><option value="archived">Arquivado</option><option value="rejected">Não elegível</option></select></label><button type="button" disabled={busy || (status === event.status && !isReverification)} onClick={() => onChange(event.id, status)}>{isReverification ? "Renovar verificação" : "Atualizar"}</button><label className="admin-access52-toggle"><input type="checkbox" checked={access52} onChange={(event) => setAccess52(event.target.checked)} /> Acesso 52</label><button type="button" disabled={busy || access52 === event.access52} onClick={() => onAccess52Change(event.id, access52)}>Guardar classificação</button></div>
    </article>
  );
}
