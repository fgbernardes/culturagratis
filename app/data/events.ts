import type { EventRecord } from "../../db/events";

export type EventItem = {
  id: string;
  slug: string;
  day: string;
  month: string;
  eyebrow: string;
  title: string;
  venue: string;
  area: string;
  streetAddress: string;
  postalCode: string;
  time: string;
  startDate: string;
  endDate: string | null;
  category: string;
  condition: string;
  source: string;
  sourceUrl: string;
  art: string;
  description: string;
  access: string;
  accessibility: string;
  verifiedAt: string | null;
  access52: boolean;
};

const monthFormatter = new Intl.DateTimeFormat("pt-PT", { month: "short", timeZone: "Europe/Lisbon" });

export function toEventItem(event: EventRecord): EventItem {
  const start = parseDate(event.startDate);
  const end = event.endDate ? parseDate(event.endDate) : null;
  const displayDate = end ?? start;
  const month = monthFormatter.format(displayDate).replace(".", "").toLocaleUpperCase("pt-PT");
  const day = String(displayDate.getUTCDate()).padStart(2, "0");
  const eyebrow = end
    ? `ATÉ ${day} ${month}`
    : `${String(start.getUTCDate()).padStart(2, "0")} ${monthFormatter.format(start).replace(".", "").toLocaleUpperCase("pt-PT")}`;

  return {
    id: String(event.id), slug: event.slug, day, month, eyebrow, title: event.title, venue: event.venue,
    area: event.area, streetAddress: event.streetAddress, postalCode: event.postalCode,
    time: event.timeLabel, startDate: event.startDate, endDate: event.endDate,
    category: event.category, condition: event.condition,
    source: event.sourceName, sourceUrl: event.sourceUrl, art: event.art, description: event.description,
    access: event.access, accessibility: event.accessibility, verifiedAt: event.verifiedAt, access52: event.access52,
  };
}

function parseDate(value: string) {
  return new Date(`${value}T12:00:00Z`);
}
