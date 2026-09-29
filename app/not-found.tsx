import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter, PublicHeader } from "./components/public-chrome";
import { isPrelaunchMode } from "./launch-state";

export const metadata: Metadata = {
  title: "Página não encontrada: Cultura Grátis Lisboa",
  robots: { index: false, follow: false },
};

export default async function NotFound() {
  const prelaunch = await isPrelaunchMode();
  return (
    <main className="editorial-shell">
      {prelaunch ? null : <PublicHeader />}
      <section className="editorial-page-hero" id="conteudo">
        <span>ERRO 404</span>
        <h1>Esta página não está disponível.</h1>
        <p>{prelaunch ? "O Cultura Grátis Lisboa está em pré-lançamento." : "Não encontrámos o endereço que procuras."}</p>
        <p><Link className="primary-link" href="/">Voltar ao início</Link></p>
      </section>
      {prelaunch ? null : <PublicFooter />}
    </main>
  );
}
