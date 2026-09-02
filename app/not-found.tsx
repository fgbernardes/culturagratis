import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter, PublicHeader } from "./components/public-chrome";

export const metadata: Metadata = {
  title: "Página não encontrada — Cultura Grátis Lisboa",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="editorial-shell">
      <a className="skip-link" href="#conteudo">Saltar para o conteúdo</a>
      <PublicHeader />
      <section className="editorial-page-hero" id="conteudo">
        <span>ERRO 404</span>
        <h1>Esta página não está por aqui.</h1>
        <p>A ligação pode ter mudado, mas Lisboa continua a acontecer.</p>
      </section>
      <div className="editorial-page-body">
        <section>
          <span>01</span>
          <div>
            <h2>Volta à cidade.</h2>
            <p>Consulta a agenda completa ou regressa ao início para continuares a explorar cultura gratuita em Lisboa.</p>
            <p><Link className="primary-link" href="/agenda">Ver a agenda</Link> <Link className="quiet-link" href="/">Voltar ao início</Link></p>
          </div>
        </section>
      </div>
      <PublicFooter />
    </main>
  );
}
