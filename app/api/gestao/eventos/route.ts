import { getAdminApiUser } from "../../../admin-auth";
import { createEvent, listAllEvents, type EventRecord, type EventStatus } from "../../../../db/events";
import { isAllowedAccessType, isAllowedCategory, sanitizeEventTags } from "../../../editorial-taxonomy";

export const dynamic = "force-dynamic";
const MAX_BATCH_SIZE = 100;

export async function GET() {
  const user = await getAdminApiUser();
  if (!user) return Response.json({ error: "Acesso não autorizado." }, { status: 403 });
  return Response.json({ events: await listAllEvents() });
}

export async function POST(request: Request) {
  const user = await getAdminApiUser();
  if (!user) return Response.json({ error: "Acesso não autorizado." }, { status: 403 });

  try {
    const payload = await request.json() as Record<string, unknown>;
    const batch = Array.isArray(payload.events) ? payload.events : [payload];
    const isBatch = Array.isArray(payload.events);
    if (!batch.length) return Response.json({ error: "O lote não contém eventos." }, { status: 400 });
    if (batch.length > 100) return Response.json({ error: `O lote não pode ter mais de ${MAX_BATCH_SIZE} eventos.` }, { status: 400 });

    const inputs: Array<Omit<EventRecord, "id" | "createdAt" | "updatedAt">> = [];
    const slugs = new Set<string>();
    for (const [index, item] of batch.entries()) {
      const parsed = parseEvent(item, isBatch ? "review" : undefined);
      if ("error" in parsed) return Response.json({ error: `Evento ${index + 1}: ${parsed.error}` }, { status: 400 });
      if (slugs.has(parsed.event.slug)) return Response.json({ error: `Evento ${index + 1}: há um título e data repetidos no lote.` }, { status: 400 });
      slugs.add(parsed.event.slug);
      inputs.push(parsed.event);
    }

    const events = [];
    for (const input of inputs) events.push(await createEvent(input));
    return Response.json(isBatch ? { events } : { event: events[0] }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("UNIQUE")
      ? "Já existe um evento com este título e esta data."
      : "Não foi possível guardar o evento.";
    return Response.json({ error: message }, { status: 500 });
  }
}

function parseEvent(raw: unknown, forcedStatus?: EventStatus) {
  const payload = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const title = clean(payload.title);
  const venue = clean(payload.venue);
  const area = clean(payload.area);
  const streetAddress = clean(payload.streetAddress);
  const postalCode = clean(payload.postalCode);
  const startDate = clean(payload.startDate);
  const sourceUrl = clean(payload.sourceUrl);
  const sourceName = clean(payload.sourceName);
  const category = clean(payload.category);
  const accessType = clean(payload.accessType);
  const tags = sanitizeEventTags(Array.isArray(payload.tags) ? payload.tags : []);

  if (!title || !venue || !area || !streetAddress || !isPortuguesePostalCode(postalCode) || !isIsoDate(startDate) || !sourceName || !isHttpUrl(sourceUrl)) {
    return { error: "Preenche título, local, morada, código postal, freguesia/zona, data e fonte oficial válida." } as const;
  }
  if (!isAllowedCategory(category)) return { error: "Seleciona uma categoria editorial válida." } as const;
  if (!isAllowedAccessType(accessType)) return { error: "Seleciona uma condição de acesso válida." } as const;

  const status = forcedStatus ?? ((["draft", "review"] as EventStatus[]).includes(clean(payload.status) as EventStatus)
    ? clean(payload.status) as EventStatus : "draft");

  return {
    event: {
      slug: `${slugify(title)}-${startDate}`,
      title, venue, area, streetAddress, postalCode, startDate,
      endDate: isIsoDate(clean(payload.endDate)) ? clean(payload.endDate) : null,
      timeLabel: clean(payload.timeLabel) || "Horário a confirmar",
      category, condition: accessType, accessType, tags, sourceName, sourceUrl,
      description: clean(payload.description),
      access: clean(payload.access) || "Condições de acesso a confirmar.",
      accessibility: clean(payload.accessibility) || "Informação de acessibilidade não confirmada.",
      art: artForCategory(category),
      access52: payload.access52 === "on" || payload.access52 === true,
      status,
      verifiedAt: null,
      verifiedBy: null,
    },
  } as const;
}

function clean(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function isIsoDate(value: string) { return /^\d{4}-\d{2}-\d{2}$/.test(value); }
function isPortuguesePostalCode(value: string) { return /^\d{4}-\d{3}$/.test(value); }
function isHttpUrl(value: string) {
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}
function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-PT")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72);
}
function artForCategory(category: string) {
  const normalized = category.toLocaleLowerCase("pt-PT");
  if (normalized.includes("expos")) return "photo";
  if (normalized.includes("música") || normalized.includes("concerto")) return "jazz";
  return "stage";
}
