import type { Metadata } from "next";
import { PublicFooter, PublicHeader } from "../components/public-chrome";
import { pageMetadata } from "../site-config";

export const metadata: Metadata = pageMetadata(
  "Dá-nos uma mãozinha | Cultura Grátis Lisboa",
  "Ajuda a manter uma agenda cultural independente e gratuita em Lisboa.",
  "/apoia",
);

export default function ApoiaPage() {
  return (
    <main className="cgl-support-page">
      <PublicHeader />

      <section className="cgl-support-page-hero" aria-labelledby="apoia-title">
        <p>Dá-nos uma mãozinha</p>
        <h1 id="apoia-title">Uma agenda independente também se faz em comunidade</h1>
        <span>O Cultura Grátis Lisboa é gratuito para quem o consulta. Se puderes, ajuda-nos a manter a pesquisa, a verificação e a curadoria em movimento.</span>
      </section>

      <section className="cgl-support-page-options" aria-label="Formas de apoiar o Cultura Grátis Lisboa">
        <a className="cgl-support-page-coffee" href="https://buymeacoffee.com/culturagratislisboa" target="_blank" rel="noreferrer">
          <span aria-hidden="true">☕</span>
          <div><small>APOIO IMEDIATO</small><strong>Oferece-nos um café</strong><p>Buy Me a Coffee →</p></div>
        </a>

      </section>

      <section className="cgl-support-page-collaborate">
        <p>QUERES PARTICIPAR DE OUTRA FORMA?</p>
        <h2>Conhecimento, tempo, ideias ou parcerias também contam</h2>
        <a href="mailto:ola@culturagratis.com?subject=Quero%20colaborar%20com%20o%20CGL">Falar connosco →</a>
      </section>
      <PublicFooter />
    </main>
  );
}
