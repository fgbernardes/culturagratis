import { getAdminApiUser } from "../../../admin-auth";
import { createEvent, listAllEvents, type EventStatus } from "../../../../db/events";

export const dynamic = "force-dynamic";

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
    const title = clean(payload.title);
    const venue = clean(payload.venue);
    const area = clean(payload.area);
    const streetAddress = clean(payload.streetAddress);
    const postalCode = clean(payload.postalCode);
    const startDate = clean(payload.startDate);
    const sourceUrl = clean(payload.sourceUrl);
    const sourceName = clean(payload.sourceName);
    if (!title || !venue || !area || !streetAddress || !isPortuguesePostalCode(postalCode) || !isIsoDate(startDate) || !sourceName || !isHttpUrl(sourceUrl)) {
      return Response.json({ error: "Preenche título, local, morada, código postal, freguesia/zona, data e fonte oficial válida." }, { status: 400 });
    }

    const status = (["draft", "review"] as EventStatus[]).includes(clean(payload.status) as EventStatus)
      ? clean(payload.status) as EventStatus : "draft";
    const category = clean(payload.category) || "Outros";
    const event = await createEvent({
      slug: `${slugify(title)}-${startDate}`,
      title, venue, area, streetAddress, postalCode, startDate,
      endDate: isIsoDate(clean(payload.endDate)) ? clean(payload.endDate) : null,
      timeLabel: clean(payload.timeLabel) || "Horário a confirmar",
      category,
      condition: clean(payload.condition) || "Gratuitidade a confirmar",
      sourceName,
      sourceUrl,
      description: clean(payload.description),
      access: clean(payload.access) || "Condições de acesso a confirmar.",
      accessibility: clean(payload.accessibility) || "Informação de acessibilidade não confirmada.",
      art: artForCategory(category),
      access52: payload.access52 === "on",
      status,
      verifiedAt: null,
      verifiedBy: null,
    });
    return Response.json({ event }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("UNIQUE")
      ? "Já existe um evento com este título e esta data."
      : "Não foi possível guardar o evento.";
    return Response.json({ error: message }, { status: 500 });
  }
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isPortuguesePostalCode(value: string) {
  return /^\d{4}-\d{3}$/.test(value);
}

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
