"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { categories, parishes } from "../site-content";

type SubmissionFormProps = { kind: "event" | "correction" };

export default function SubmissionForm({ kind }: SubmissionFormProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [submitterRelation, setSubmitterRelation] = useState<"" | "public" | "organizer">("");
  const [dateMode, setDateMode] = useState<"single" | "range">("single");
  const [timeMode, setTimeMode] = useState<"single" | "range">("single");
  const isEvent = kind === "event";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true); setError(""); setReference("");
    const entries = Object.fromEntries(new FormData(form).entries());
    const response = await fetch("/api/submissoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...entries,
        kind,
        privacyAccepted: entries.privacyAccepted === "yes",
      }),
    });
    const result = await response.json() as { error?: string; reference?: string };
    setBusy(false);
    if (!response.ok) { setError(result.error ?? "Não foi possível enviar."); return; }
    form.reset();
    setReference(result.reference ?? "CGL");
  }

  if (reference) {
    return (
      <section className="public-form-success" aria-live="polite">
        <span aria-hidden="true">✓</span>
        <div><p>SUBMISSÃO RECEBIDA</p><h2>Já está na nossa fila editorial.</h2><p>Referência: <strong>{reference}</strong>. Vamos verificar a informação antes de qualquer alteração ou publicação.</p></div>
      </section>
    );
  }

  return (
    <section className="public-form-section" aria-labelledby="form-title">
      <div className="public-form-heading">
        <p>{isEvent ? "FORMULÁRIO DE SUGESTÃO" : "FORMULÁRIO DE CORREÇÃO"}</p>
        <h2 id="form-title">{isEvent ? "Conta-nos o essencial." : "Diz-nos o que mudou."}</h2>
        <span>Os campos assinalados com * são obrigatórios. Não pedimos número de telefone.</span>
      </div>
      <form className="public-form" onSubmit={submit}>
        {isEvent ? (
          <fieldset className="form-path-choice form-span-2">
            <legend>Fazes parte da organização ou produção do evento? *</legend>
            <p>Esta resposta adapta o formulário ao teu caso.</p>
            <div className="form-choice-grid">
              <label className={submitterRelation === "organizer" ? "is-selected" : ""}>
                <input name="submitterRelation" type="radio" value="organizer" checked={submitterRelation === "organizer"} onChange={() => setSubmitterRelation("organizer")} required />
                <span><strong>Sim</strong>Represento a organização ou produção</span>
              </label>
              <label className={submitterRelation === "public" ? "is-selected" : ""}>
                <input name="submitterRelation" type="radio" value="public" checked={submitterRelation === "public"} onChange={() => setSubmitterRelation("public")} required />
                <span><strong>Não</strong>Estou apenas a sugerir o evento</span>
              </label>
            </div>
          </fieldset>
        ) : null}

        {(!isEvent || submitterRelation) ? <>
          <label>Nome *<input name="name" autoComplete="name" maxLength={120} required /></label>
          <label>E-mail *<input name="email" type="email" autoComplete="email" maxLength={180} required /></label>

          {isEvent && submitterRelation === "organizer" ? <>
            <label>Organização / produção *<input name="organization" autoComplete="organization" maxLength={180} required /></label>
            <label>Qual é o teu papel? *<input name="organizationRole" maxLength={180} required placeholder="Ex.: produção, comunicação, artista ou espaço" /></label>
          </> : !isEvent ? (
            <label className="form-span-2">Organização <small>Opcional</small><input name="organization" autoComplete="organization" maxLength={180} /></label>
          ) : null}

          {isEvent ? <>
            <div className="form-divider form-span-2"><span>Sobre o evento</span></div>
            <label className="form-span-2">Nome do evento *<input name="eventTitle" maxLength={220} required /></label>

            <fieldset className="form-mode-group form-span-2">
              <legend>Data *</legend>
              <div className="form-inline-choice">
                <label><input name="dateMode" type="radio" value="single" checked={dateMode === "single"} onChange={() => setDateMode("single")} />Uma data</label>
                <label><input name="dateMode" type="radio" value="range" checked={dateMode === "range"} onChange={() => setDateMode("range")} />Várias datas seguidas</label>
              </div>
            </fieldset>
            <label>{dateMode === "range" ? "De *" : "Data *"}<input name="eventDate" type="date" required /></label>
            {dateMode === "range" ? <label>Até *<input name="endDate" type="date" required /></label> : <div className="form-blank" aria-hidden="true" />}

            <fieldset className="form-mode-group form-span-2">
              <legend>Hora *</legend>
              <div className="form-inline-choice">
                <label><input name="timeMode" type="radio" value="single" checked={timeMode === "single"} onChange={() => setTimeMode("single")} />Uma hora</label>
                <label><input name="timeMode" type="radio" value="range" checked={timeMode === "range"} onChange={() => setTimeMode("range")} />Hora de início e fim</label>
              </div>
            </fieldset>
            <label>{timeMode === "range" ? "Das *" : "Hora *"}<input name="startTime" type="time" required /></label>
            {timeMode === "range" ? <label>Até às *<input name="endTime" type="time" required /></label> : <div className="form-blank" aria-hidden="true" />}

            <label>Local *<input name="venue" maxLength={220} required /></label>
            <label>Freguesia *<select name="area" required defaultValue=""><option value="" disabled>Seleciona</option>{parishes.map(([slug, name]) => <option key={slug}>{name}</option>)}</select></label>
            <label>Categoria *<select name="category" required defaultValue=""><option value="" disabled>Seleciona</option>{categories.map((category) => <option key={category.slug}>{category.name}</option>)}</select></label>
            <label>Condição de acesso *<select name="condition" required defaultValue=""><option value="" disabled>Seleciona</option><option>Entrada livre</option><option>Reserva gratuita</option><option>Levantamento gratuito</option><option>Lista de espera gratuita</option><option>Outra condição gratuita</option></select></label>
            <label className="form-span-2">Fonte oficial {submitterRelation === "organizer" ? "*" : <small>Opcional</small>}<input name="sourceUrl" type="url" inputMode="url" placeholder="https://…" maxLength={1000} required={submitterRelation === "organizer"} /></label>
            <label className="form-span-2">Informação adicional<textarea name="details" rows={4} maxLength={4000} placeholder="Programa, lotação, condições especiais ou outro contexto útil." /></label>
            <label className="form-span-2">Acessibilidade<textarea name="accessibility" rows={3} maxLength={1500} placeholder="Indica apenas recursos confirmados pela organização." /></label>

          </> : <>
            <div className="form-divider form-span-2"><span>Sobre a correção</span></div>
            <label className="form-span-2">Evento ou página *<input name="eventReference" maxLength={500} required placeholder="Título do evento ou ligação para a página" /></label>
            <label className="form-span-2">O que está errado ou mudou? *<textarea name="details" rows={6} maxLength={4000} required placeholder="Explica a alteração de forma objetiva." /></label>
            <label className="form-span-2">Fonte atualizada <small>Opcional</small><input name="sourceUrl" type="url" inputMode="url" placeholder="https://…" maxLength={1000} /></label>
          </>}

          <label className="form-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
          <label className="form-consent form-span-2"><input name="privacyAccepted" type="checkbox" value="yes" required /><span>Li a <Link href="/privacidade" target="_blank">Política de Privacidade</Link> e compreendo que estes dados serão usados apenas para analisar e responder a esta submissão. *</span></label>
          <div className="form-submit form-span-2">
            <button type="submit" disabled={busy}>{busy ? "A enviar…" : isEvent ? "Enviar sugestão" : "Enviar correção"}</button>
            <p className="form-error" role="alert">{error}</p>
          </div>
        </> : <p className="form-path-prompt form-span-2">Escolhe uma das opções para continuar.</p>}
      </form>
    </section>
  );
}
