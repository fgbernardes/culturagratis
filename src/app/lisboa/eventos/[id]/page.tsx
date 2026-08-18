import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

type EventDetail = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
  free_entry_type: string;
  requires_booking: boolean;
  free_hours_note: string | null;
  source_url: string;
  category: { label: string } | null;
  venue: {
    name: string;
    address: string;
    parish: { label: string } | null;
  } | null;
  event_tags: { tag: { id: string; label: string } | null }[];
};

const freeEntryLabels: Record<string, string> = {
  "entrada-livre": "Entrada livre",
};

function formatDateRange(startsAt: string | null, endsAt: string | null) {
  if (!startsAt) return null;

  const formatter = new Intl.DateTimeFormat("pt-PT", {
    timeZone: "Europe/Lisbon",
    dateStyle: "long",
    timeStyle: "short",
  });

  const start = formatter.format(new Date(startsAt));
  if (!endsAt) return start;

  const end = formatter.format(new Date(endsAt));
  return `${start} — ${end}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const { data: event } = await supabase
    .from("events")
    .select("title, description")
    .eq("id", id)
    .maybeSingle<{ title: string; description: string | null }>();

  if (!event) return {};

  return {
    title: event.title,
    description: event.description ?? undefined,
  };
}

export default async function EventoDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: event } = await supabase
    .from("events")
    .select(
      `
      id,
      title,
      description,
      starts_at,
      ends_at,
      free_entry_type,
      requires_booking,
      free_hours_note,
      source_url,
      category:categories(label),
      venue:venues(name, address, parish:parishes(label)),
      event_tags(tag:tags(id, label))
    `
    )
    .eq("id", id)
    .maybeSingle()
    .returns<EventDetail>();

  if (!event) {
    notFound();
  }

  const { data: accessibilityResources } = await supabase
    .from("accessibility_resources")
    .select("description, source")
    .eq("event_id", id)
    .eq("confirmed", true);

  const dateRange = formatDateRange(event.starts_at, event.ends_at);
  const tags = event.event_tags
    .map((et) => et.tag)
    .filter((tag): tag is { id: string; label: string } => tag !== null);

  return (
    <main className="flex flex-1 flex-col items-center px-16 py-24">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <Link
          href="/lisboa"
          className="font-sans text-sm text-antracite/70 hover:text-tejo-500"
        >
          ← Todos os eventos
        </Link>

        {event.category && (
          <span className="w-fit rounded-full bg-amarelo px-3 py-1 text-xs font-semibold tracking-wide text-antracite uppercase">
            {event.category.label}
          </span>
        )}

        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {event.title}
        </h1>

        <div className="flex flex-col gap-1 font-sans text-antracite/80">
          {dateRange && <p>{dateRange}</p>}
          {event.venue && (
            <p>
              {event.venue.name}, {event.venue.address}
              {event.venue.parish ? ` · ${event.venue.parish.label}` : ""}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1 rounded-lg border border-antracite/15 p-4 font-sans text-sm">
          <p className="font-semibold">
            {freeEntryLabels[event.free_entry_type] ?? event.free_entry_type}
          </p>
          {event.requires_booking && (
            <p className="text-antracite/70">
              Requer reserva ou levantamento de bilhete antecipado.
            </p>
          )}
          {event.free_hours_note && (
            <p className="text-antracite/70">{event.free_hours_note}</p>
          )}
        </div>

        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li
                key={tag.id}
                className="rounded-full border border-antracite/20 px-3 py-1 font-sans text-xs text-antracite/70"
              >
                {tag.label}
              </li>
            ))}
          </ul>
        )}

        {event.description && (
          <p className="font-sans leading-relaxed">{event.description}</p>
        )}

        <div className="font-sans text-sm">
          <p className="font-semibold">Acessibilidade</p>
          {accessibilityResources && accessibilityResources.length > 0 ? (
            <ul className="mt-1 flex flex-col gap-1 text-antracite/70">
              {accessibilityResources.map((resource, index) => (
                <li key={index}>
                  {resource.description} — {resource.source}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-antracite/70">
              Acessibilidade não confirmada
            </p>
          )}
        </div>

        <a
          href={event.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit font-sans text-sm text-tejo-500 underline underline-offset-4"
        >
          Fonte
        </a>
      </div>
    </main>
  );
}
