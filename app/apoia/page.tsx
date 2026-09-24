import Link from "next/link";
import { cglLogoColor } from "../brand-assets";

export default function ApoiaPage() {
  return (
    <main className="cgl-support-page">
      <header className="cgl-support-page-header">
        <Link className="cgl-support-page-brand" href="/" aria-label="Cultura Grátis Lisboa — início">
          <img src={cglLogoColor} alt="" width="82" height="82" />
          <span><strong>Cultura Grátis Lisboa</strong><small>Cultura para todos. Lisboa para todos.</small></span>
        </Link>
        <Link className="cgl-support-page-back" href="/">Voltar à Home</Link>
      </header>

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

        <article className="cgl-support-page-pending">
          <small>EM BREVE</small><strong>Stripe</strong>
          <p>Cartão, Apple Pay e Google Pay.</p>
        </article>

        <article className="cgl-support-page-pending">
          <small>EM BREVE</small><strong>MB WAY</strong>
          <p>QR de apoio em preparação.</p>
        </article>
      </section>

      <section className="cgl-support-page-collaborate">
        <p>QUERES PARTICIPAR DE OUTRA FORMA?</p>
        <h2>Conhecimento, tempo, ideias ou parcerias também contam</h2>
        <a href="mailto:ola@culturagratis.com?subject=Quero%20colaborar%20com%20o%20CGL">Falar connosco →</a>
      </section>
    </main>
  );
}