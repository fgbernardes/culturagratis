import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter, PublicHeader } from "../components/public-chrome";
import { parishes } from "../site-content";
import { pageMetadata } from "../site-config";

export const metadata: Metadata = pageMetadata(
  "Freguesias — Cultura Grátis Lisboa",
  "Explora cultura gratuita nas 24 freguesias oficiais do município de Lisboa.",
  "/freguesias",
);

export default function ParishesPage() {
  return (
    <main className="editorial-shell directory-shell">
      <a className="skip-link" href="#conteudo">Saltar para o conteúdo</a>
      <PublicHeader />
      <header className="directory-hero parish-directory-hero" id="conteudo">
        <p>LISBOA · 24 FREGUESIAS</p><h1>A cidade, freguesia a freguesia.</h1>
        <span>No MVP, a freguesia oficial é o único filtro geográfico público.</span>
      </header>
      <section className="parish-directory" aria-label="Freguesias de Lisboa">
        {parishes.map(([slug, name], index) => (
          <Link href={`/agenda?freguesia=${encodeURIComponent(name)}`} key={slug}>
            <small>{String(index + 1).padStart(2, "0")}</small><strong>{name}</strong><span aria-hidden="true">↗</span>
          </Link>
        ))}
      </section>
      <PublicFooter />
    </main>
  );
}
