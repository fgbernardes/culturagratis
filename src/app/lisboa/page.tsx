import Link from "next/link";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Agenda de eventos culturais gratuitos em Lisboa.",
};

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string | null;
  category: { label: string } | null;
  venue: { name: string; parish: { label: string } | null } | null;
};

type Option = { id: string; label: string };

export default async function Lisboa({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; freguesia?: string }>;
}) {
  const { categoria, freguesia } = await searchParams;

  const [{ data: categories }, { data: parishes }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, label")
      .order("label")
      .returns<Option[]>(),
    supabase
      .from("parishes")
      .select("id, label")
      .order("label")
      .returns<Option[]>(),
  ]);

  let query = supabase
    .from("events")
    .select(
      `
      id,
      title,
      description,
      starts_at,
      category:categories(label),
      venue:venues!inner(name, parish_id, parish:parishes(label))
    `
    )
    .order("starts_at", { ascending: true });

  if (categoria) query = query.eq("category_id", categoria);
  if (freguesia) query = query.eq("venue.parish_id", freguesia);

  const { data: events, error } = await query.returns<EventRow[]>();

  const hasFilters = Boolean(categoria || freguesia);

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex flex-col items-center gap-3 px-16 pt-24 pb-10 text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Cultura Grátis Lisboa
        </h1>
        <span className="h-1 w-12 rounded-full bg-laranja" aria-hidden="true" />
        <p className="font-sans text-antracite/70">
          Eventos culturais gratuitos na cidade.
        </p>
      </header>

      <div className="pattern-calcada" aria-hidden="true" />

      <main className="flex flex-1 flex-col items-center px-16 py-16">
        <form
          method="get"
          className="mb-10 flex flex-wrap items-end justify-center gap-4 font-sans text-sm"
        >
          <label className="flex flex-col gap-1">
            <span className="text-antracite/70">Categoria</span>
            <select
              name="categoria"
              defaultValue={categoria ?? ""}
              className="rounded-md border border-antracite/20 bg-branco px-3 py-2"
            >
              <option value="">Todas as categorias</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-antracite/70">Freguesia</span>
            <select
              name="freguesia"
              defaultValue={freguesia ?? ""}
              className="rounded-md border border-antracite/20 bg-branco px-3 py-2"
            >
              <option value="">Todas as freguesias</option>
              {parishes?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="rounded-md bg-laranja px-4 py-2 font-semibold text-branco transition-colors hover:bg-amarelo hover:text-antracite"
          >
            Filtrar
          </button>

          {hasFilters && (
            <Link
              href="/lisboa"
              className="text-antracite/70 underline underline-offset-4 hover:text-tejo-500"
            >
              Limpar filtros
            </Link>
          )}
        </form>

        {error ? (
          <p className="font-sans text-lg text-red-600">
            Falha a carregar eventos: {error.message}
          </p>
        ) : events && events.length > 0 ? (
          <ul className="grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/lisboa/eventos/${event.id}`}
                  className="flex flex-col gap-3 rounded-xl border border-antracite/15 bg-branco p-5 transition-colors hover:border-tejo-500"
                >
                  {event.category && (
                    <span className="w-fit rounded-full bg-amarelo px-3 py-1 text-xs font-semibold tracking-wide text-antracite uppercase">
                      {event.category.label}
                    </span>
                  )}
                  <p className="font-display text-lg font-semibold">
                    {event.title}
                  </p>
                  {event.venue && (
                    <p className="font-sans text-sm text-antracite/70">
                      {event.venue.name}
                      {event.venue.parish
                        ? ` · ${event.venue.parish.label}`
                        : ""}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="max-w-md text-center font-sans text-lg text-antracite/70">
            {hasFilters
              ? "Sem eventos para estes filtros."
              : "Ainda não há eventos publicados."}
          </p>
        )}
      </main>
    </div>
  );
}
