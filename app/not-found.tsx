import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página não encontrada — Cultura Grátis Lisboa",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="editorial-shell editorial-page-body">
      <section className="editorial-page-hero" id="conteudo">
        <span>ERRO 404</span>
        <h1>Esta página não está disponível.</h1>
        <p>O Cultura Grátis Lisboa está em pré-lançamento.</p>
        <p><Link className="primary-link" href="/">Voltar ao início</Link></p>
      </section>
    </main>
  );
}
