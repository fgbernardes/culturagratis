import { createSupabaseAdminClient, unwrapSupabase } from "./supabase";

export type EventStatus = "draft" | "review" | "verified" | "published" | "archived" | "rejected";

export type EventRecord = {
  id: string; slug: string; title: string; venue: string; area: string;
  streetAddress: string; postalCode: string; startDate: string; endDate: string | null;
  timeLabel: string; category: string; condition: string; sourceName: string;
  sourceUrl: string; description: string; access: string; accessibility: string;
  art: string; access52: boolean; status: EventStatus; verifiedAt: string | null;
  verifiedBy: string | null; createdAt: string; updatedAt: string;
};

type EventRow = Record<string, unknown> & {
  category?: { label?: string } | null;
  venue?: { name?: string; address?: string; parish?: { label?: string } | null } | null;
};

const EVENT_SELECT = "*,category:categories(label),venue:venues(name,address,parish:parishes(label))";

export async function listPublishedEvents(): Promise<EventRecord[]> {
  const result = await createSupabaseAdminClient().from("events").select(EVENT_SELECT)
    .eq("status", "published").order("starts_at").order("id");
  if (result.error) throw new Error(result.error.message);
  return (result.data ?? []).map((row) => mapEvent(row as EventRow));
}

export async function listAllEvents(): Promise<EventRecord[]> {
  const result = await createSupabaseAdminClient().from("events").select(EVENT_SELECT)
    .order("updated_at", { ascending: false }).order("id", { ascending: false });
  if (result.error) throw new Error(result.error.message);
  return (result.data ?? []).map((row) => mapEvent(row as EventRow));
}

export async function getPublishedEventBySlug(slug: string): Promise<EventRecord | null> {
  const result = await createSupabaseAdminClient().from("events").select(EVENT_SELECT)
    .eq("slug", slug).eq("status", "published").maybeSingle();
  if (result.error) throw new Error(result.error.message);
  return result.data ? mapEvent(result.data as EventRow) : null;
}

export async function createEvent(input: Omit<EventRecord, "id" | "createdAt" | "updatedAt">) {
  const client = createSupabaseAdminClient();
  const categoryId = slugify(input.category);
  const parishId = slugify(input.area);
  const address = [input.streetAddress, input.postalCode].filter(Boolean).join(", ");

  const categoryResult = await client.from("categories").upsert({ id: categoryId, label: input.category }).select("id").single();
  if (categoryResult.error) throw new Error(categoryResult.error.message);
  const parishResult = await client.from("parishes").upsert({ id: parishId, label: input.area }).select("id").single();
  if (parishResult.error) throw new Error(parishResult.error.message);

  let venueResult = await client.from("venues").select("id")
    .eq("name", input.venue).eq("address", address).eq("parish_id", parishId).maybeSingle();
  if (venueResult.error) throw new Error(venueResult.error.message);
  if (!venueResult.data) {
    venueResult = await client.from("venues").insert({ name: input.venue, address, parish_id: parishId }).select("id").single();
  }
  const venue = unwrapSupabase(venueResult) as { id: string };

  const result = await client.from("events").insert({
    edition: "lisboa", slug: input.slug, title: input.title, description: input.description,
    category_id: categoryId, venue_id: venue.id, free_entry_type: "entrada-livre",
    requires_booking: /reserva|inscri/i.test(input.condition), free_hours_note: input.condition,
    source_url: input.sourceUrl, starts_at: isoDate(input.startDate), ends_at: input.endDate ? isoDate(input.endDate) : null,
    time_label: input.timeLabel, status: input.status, source_name: input.sourceName,
    access: input.access, accessibility: input.accessibility, art: input.art,
    access_52: input.access52, verified_at: input.verifiedAt, verified_by: input.verifiedBy,
  }).select(EVENT_SELECT).single();
  return mapEvent(unwrapSupabase(result) as EventRow);
}

export async function updateEventStatus(id: string, status: EventStatus, verifiedBy: string) {
  const verifiedAt = ["verified", "published", "rejected"].includes(status) ? new Date().toISOString() : null;
  const result = await createSupabaseAdminClient().from("events").update({
    status, verified_at: verifiedAt, verified_by: verifiedAt ? verifiedBy : null,
    updated_at: new Date().toISOString(),
  }).eq("id", id).select(EVENT_SELECT).single();
  return mapEvent(unwrapSupabase(result) as EventRow);
}

export async function updateEventAccess52(id: string, access52: boolean) {
  const result = await createSupabaseAdminClient().from("events").update({
    access_52: access52, updated_at: new Date().toISOString(),
  }).eq("id", id).select(EVENT_SELECT).single();
  return mapEvent(unwrapSupabase(result) as EventRow);
}

function mapEvent(row: EventRow): EventRecord {
  const address = String(row.venue?.address ?? "");
  const postalCode = address.match(/\b\d{4}-\d{3}\b/)?.[0] ?? "";
  const streetAddress = postalCode ? address.replace(new RegExp(`,?\\s*${postalCode}.*$`), "") : address;
  const condition = String(row.free_hours_note ?? (row.requires_booking ? "Reserva gratuita" : "Entrada livre"));
  return {
    id: String(row.id), slug: String(row.slug ?? ""), title: String(row.title), venue: String(row.venue?.name ?? ""),
    area: String(row.venue?.parish?.label ?? ""), streetAddress, postalCode,
    startDate: datePart(row.starts_at), endDate: row.ends_at ? datePart(row.ends_at) : null,
    timeLabel: String(row.time_label ?? "Horário a confirmar"), category: String(row.category?.label ?? "Outros"),
    condition, sourceName: String(row.source_name ?? "Fonte oficial"), sourceUrl: String(row.source_url),
    description: String(row.description ?? ""), access: String(row.access ?? condition),
    accessibility: String(row.accessibility ?? "Informação não confirmada."), art: String(row.art ?? "stage"),
    access52: Boolean(row.access_52), status: String(row.status ?? "draft") as EventStatus,
    verifiedAt: nullable(row.verified_at), verifiedBy: nullable(row.verified_by),
    createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  };
}

function datePart(value: unknown) { return String(value ?? "").slice(0, 10); }
function isoDate(value: string) { return `${value}T12:00:00+01:00`; }
function nullable(value: unknown) { return value === null || value === undefined || value === "" ? null : String(value); }
function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-PT")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72);
}
