import { createSubmission, type SubmissionKind } from "../../../db/submissions";
import { getRuntimeEnv } from "../../runtime-env";
import { verifyTurnstile } from "../../turnstile";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) {
      return Response.json({ error: "Pedido não autorizado." }, { status: 403 });
    }
    const length = Number(request.headers.get("content-length") ?? 0);
    if (length > 24_000) return Response.json({ error: "A submissão é demasiado extensa." }, { status: 413 });

    const payload = await request.json() as Record<string, unknown>;
    if (clean(payload.website, 120)) return Response.json({ received: true }, { status: 201 });

    const token = typeof payload.turnstileToken === "string" ? payload.turnstileToken : "";
    if (!token) return Response.json({ error: "Confirma a proteção do formulário antes de enviares." }, { status: 400 });
    if (!await verifyTurnstile(token, request, getRuntimeEnv())) {
      return Response.json({ error: "Não foi possível validar a proteção do formulário. Atualiza a página e tenta novamente." }, { status: 400 });
    }

    const kind = clean(payload.kind, 20) as SubmissionKind;
    const name = clean(payload.name, 120);
    const email = clean(payload.email, 180).toLocaleLowerCase("pt-PT");
    const rawOrganization = clean(payload.organization, 180) || null;
    if (!["event", "correction"].includes(kind) || !name || !isEmail(email) || payload.privacyAccepted !== true) {
      return Response.json({ error: "Confirma o nome, o e-mail e a leitura da Política de Privacidade." }, { status: 400 });
    }

    const eventTitle = clean(payload.eventTitle, 220) || null;
    const eventReference = clean(payload.eventReference, 500) || null;
    const eventDate = clean(payload.eventDate, 10) || null;
    const endDate = clean(payload.endDate, 10) || null;
    const dateMode = clean(payload.dateMode, 10) as "single" | "range";
    const startTime = clean(payload.startTime, 5) || null;
    const endTime = clean(payload.endTime, 5) || null;
    const timeMode = clean(payload.timeMode, 10) as "single" | "range";
    const submitterRelation = clean(payload.submitterRelation, 20) as "public" | "organizer";
    const organizationRole = clean(payload.organizationRole, 180) || null;
    const venue = clean(payload.venue, 220) || null;
    const area = clean(payload.area, 120) || null;
    const category = clean(payload.category, 120) || null;
    const condition = clean(payload.condition, 220) || null;
    const sourceUrl = clean(payload.sourceUrl, 1000) || null;
    const accessibility = clean(payload.accessibility, 1500) || null;
    const details = clean(payload.details, 4000) || null;

    if (kind === "event" && !["public", "organizer"].includes(submitterRelation)) {
      return Response.json({ error: "Indica se fazes parte da organização ou se estás apenas a sugerir o evento." }, { status: 400 });
    }
    if (kind === "event" && (!eventTitle || !["single", "range"].includes(dateMode) || !isIsoDate(eventDate) || (dateMode === "range" && (!isIsoDate(endDate) || endDate! < eventDate!)))) {
      return Response.json({ error: "Confirma a data do evento e, quando aplicável, o intervalo indicado." }, { status: 400 });
    }
    if (kind === "event" && (!["single", "range"].includes(timeMode) || !isTime(startTime) || (timeMode === "range" && !isTime(endTime)))) {
      return Response.json({ error: "Confirma a hora do evento e, quando aplicável, a hora de fim." }, { status: 400 });
    }
    if (kind === "event" && (!venue || !area || !category || !condition)) {
      return Response.json({ error: "Preenche os dados essenciais do evento." }, { status: 400 });
    }
    if (kind === "event" && submitterRelation === "organizer" && (!rawOrganization || !organizationRole || !isHttpUrl(sourceUrl))) {
      return Response.json({ error: "Indica a organização, o teu papel e uma fonte oficial válida." }, { status: 400 });
    }
    if (kind === "event" && submitterRelation === "public" && sourceUrl && !isHttpUrl(sourceUrl)) {
      return Response.json({ error: "Confirma a ligação da fonte ou deixa esse campo vazio." }, { status: 400 });
    }
    if (kind === "correction" && (!eventReference || !details || (sourceUrl && !isHttpUrl(sourceUrl)))) {
      return Response.json({ error: "Identifica o evento, descreve a correção e confirma a ligação indicada." }, { status: 400 });
    }

    const organization = kind === "event" && submitterRelation === "public" ? null : rawOrganization;
    const normalizedRelation = kind === "event" ? submitterRelation : null;
    const normalizedRole = kind === "event" && submitterRelation === "organizer" ? organizationRole : null;
    const normalizedEndDate = kind === "event" && dateMode === "range" ? endDate : null;
    const normalizedEndTime = kind === "event" && timeMode === "range" ? endTime : null;
    const timeLabel = kind === "event" ? (normalizedEndTime ? `${startTime}–${normalizedEndTime}` : startTime) : null;

    const submission = await createSubmission({
      kind, name, email, organization, submitterRelation: normalizedRelation, organizationRole: normalizedRole,
      promotionInterest: false, newsletterOptIn: false, eventTitle, eventReference, eventDate,
      endDate: normalizedEndDate, dateMode: kind === "event" ? dateMode : null, timeLabel,
      startTime: kind === "event" ? startTime : null, endTime: normalizedEndTime,
      timeMode: kind === "event" ? timeMode : null, venue, area, category, condition, sourceUrl,
      accessibility, details, privacyNoticeVersion: "2026-08-25-v4",
    });
    return Response.json({ received: true, reference: `CGL-${String(submission.id).padStart(5, "0")}` }, { status: 201 });
  } catch {
    return Response.json({ error: "Não foi possível enviar agora. Tenta novamente dentro de alguns minutos." }, { status: 500 });
  }
}

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().replace(/\r\n/g, "\n").slice(0, max) : "";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function isIsoDate(value: string | null) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function isTime(value: string | null) {
  return Boolean(value && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value));
}

function isHttpUrl(value: string | null) {
  if (!value) return false;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}
