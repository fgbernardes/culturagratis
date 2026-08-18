import { supabase } from "@/lib/supabase";

export default async function SupabaseTest() {
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, label")
    .order("id");

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id, title, venue:venues(name, parish_id)");

  const error = categoriesError ?? eventsError;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-16 py-32 text-center">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Teste de query real ao Supabase
      </h1>
      {error ? (
        <p className="font-sans text-lg text-red-600">Falha na query: {error.message}</p>
      ) : (
        <div className="flex flex-col items-center gap-4 font-sans text-lg">
          <p>
            {categories?.length ?? 0} categorias carregadas de <code>categories</code>.
          </p>
          <ul className="flex flex-wrap justify-center gap-2 text-sm">
            {categories?.map((c) => (
              <li
                key={c.id}
                className="rounded-full border border-antracite/20 px-3 py-1"
              >
                {c.label}
              </li>
            ))}
          </ul>
          <p>
            {events?.length ?? 0} eventos em <code>events</code> — join com{" "}
            <code>venues</code> sem erros.
          </p>
        </div>
      )}
    </main>
  );
}
