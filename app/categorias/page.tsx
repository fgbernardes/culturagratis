import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter, PublicHeader } from "../components/public-chrome";
import { categories } from "../site-content";
import { pageMetadata } from "../site-config";

export const metadata: Metadata = pageMetadata(
  "Categorias — Cultura Grátis Lisboa",
  "Explora a agenda cultural gratuita de Lisboa por dez categorias editoriais.",
  "/categorias",
);

export default function CategoriesPage() {
  return (
    <main className="editorial-shell directory-shell">
      <a className="skip-link" href="#conteudo">Saltar para o conteúdo</a>
      <PublicHeader />
      <header className="directory-hero" id="conteudo">
        <p>EXPLORAR</p><h1>Dez maneiras de entrar na cultura.</h1>
        <span>Categorias editoriais claras, sem gavetas inventadas a meio do caminho.</span>
      </header>
      <section className="directory-grid" aria-label="Categorias culturais">
        {categories.map((category, index) => (
          <Link href={`/agenda?categoria=${encodeURIComponent(category.name)}`} key={category.slug}>
            <small>{String(index + 1).padStart(2, "0")}</small>
            <h2>{category.name}</h2><p>{category.description}</p><span>Ver na agenda →</span>
          </Link>
        ))}
      </section>
      <PublicFooter />
    </main>
  );
}
