import type { EventRecord } from "../../db/events";

export const STUDIO_HANDOFF_KEY = "cgl-studio-event-handoff-v1";

export type StudioEventPayload = {
  title: string;
  date: string;
  venue: string;
  category: string;
  access: string;
  accessType: string;
  freguesia?: string;
  source?: string;
  sourceUrl?: string;
};

type StudioEventInput = Pick<EventRecord, "status" | "title" | "startDate" | "endDate" | "timeLabel" | "venue" | "area" | "category" | "accessType" | "access" | "condition" | "sourceName" | "sourceUrl">;

const present = (value: string | null | undefined) => (value ?? "").trim();
const pending = (value: string) => !value || /^(por confirmar|a confirmar|horário a confirmar|informação não confirmada\.?|outros)$/i.test(value);
const dateLabel = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const day = Number(match[3]);
  const month = Number(match[2]);
  const year = Number(match[1]);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
};

export function buildStudioEventPayload(event: StudioEventInput): { errors: string[]; payload?: StudioEventPayload } {
  const errors: string[] = [];
  if (event.status !== "verified" && event.status !== "published") errors.push("Evento ainda não verificado ou publicado.");
  const title = present(event.title);
  const start = dateLabel(present(event.startDate));
  const end = event.endDate ? dateLabel(present(event.endDate)) : null;
  const time = present(event.timeLabel);
  const venue = present(event.venue);
  const category = present(event.category);
  const accessType = present(event.accessType);
  if (!title) errors.push("Título em falta.");
  if (!start || (event.endDate && !end) || pending(time)) errors.push("Data e hora confirmadas em falta.");
  if (!venue) errors.push("Local em falta.");
  if (pending(category)) errors.push("Categoria em falta.");
  if (pending(accessType)) errors.push("Condição de acesso verificada em falta.");
  if (errors.length) return { errors };

  const detail = present(event.access);
  const condition = present(event.condition);
  const access = detail && !pending(detail) && (detail === accessType || detail.toLowerCase().includes(accessType.toLowerCase()))
    ? detail
    : condition && !pending(condition) && (condition === accessType || condition.toLowerCase().includes(accessType.toLowerCase()))
      ? condition
      : accessType;
  const freguesia = present(event.area);
  const source = present(event.sourceName);
  return {
    errors,
    payload: {
      title,
      date: `${start}${end && end !== start ? ` a ${end}` : ""} · ${time}`,
      venue,
      category,
      access,
      accessType,
      ...(freguesia ? { freguesia } : {}),
      ...(source && source !== "Fonte oficial" ? { source } : {}),
      ...(present(event.sourceUrl) ? { sourceUrl: present(event.sourceUrl) } : {}),
    },
  };
}
