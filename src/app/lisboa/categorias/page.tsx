import Link from "next/link";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Categorias",
  description: "Eventos culturais gratuitos em Lisboa por categoria.",
};

type Category = { id: string; label: string };

export default async function Categorias() {
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, label")
    .order("label")
    .returns<Category[]>();

  return (
    <main className="flex flex-1 flex-col items-center px-16 py-24">
      <div className="flex w-full max-w-3xl flex-col gap-8">
        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Categorias
          </h1>
          <p className="font-sans text-antracite/70">
            Explora os eventos gratuitos por categoria.
          </p>
        </header>

        {error ? (
          <p className="text-center font-sans text-lg text-red-600">
            Falha a carregar categorias: {error.message}
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {categories?.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/lisboa?categoria=${category.id}`}
                  className="flex items-center justify-between rounded-xl border border-antracite/15 bg-branco px-5 py-4 font-sans transition-colors hover:border-tejo-500"
                >
                  <span>{category.label}</span>
                  <span aria-hidden="true" className="text-antracite/40">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
