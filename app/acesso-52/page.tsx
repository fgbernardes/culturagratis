import type { Metadata } from "next";
import Link from "next/link";
import { Access52Badge } from "../components/access52-badge";
import { cglLogoColor } from "../brand-assets";
import { pageMetadata } from "../site-config";

export const metadata: Metadata = pageMetadata(
  "Acesso 52: 52 dias gratuitos em museus e monumentos de Lisboa",
  "Guia CGL para residentes em Portugal usarem os 52 dias anuais de entrada gratuita em museus, monumentos e palácios abrangidos.",
  "/acesso-52",
);

const lisbonPlaces = [
  "Casa-Museu Dr. Anastácio Gonçalves",
  "Mosteiro dos Jerónimos",
  "Museu de Arte Popular",
  "Museu Nacional de Arqueologia",
  "Museu Nacional de Arte Antiga",
  "Museu Nacional de Arte Contemporânea (Museu do Chiado)",
  "Museu Nacional de Etnologia",
  "Museu Nacional do Azulejo",
  "Museu Nacional do Teatro e da Dança",
  "Museu Nacional do Traje",
  "Museu Nacional dos Coches e Picadeiro Real",
  "Palácio Nacional da Ajuda",
  "Panteão Nacional",
  "Torre de Belém",
];

export default function Access52Page() {
  return (
    <main className="subpage-shell access52-lab" id="conteudo">
      <a className="skip-link" href="#como-funciona">Saltar para as condições</a>
      <header className="subpage-header">
        <Link className="subpage-brand" href="/" aria-label="Cultura Grátis Lisboa: início">
          <img src={cglLogoColor} alt="" width="58" height="58" />
          <span>Cultura Grátis Lisboa</span>
        </Link>
        <Link className="quiet-link" href="/">← Voltar ao início</Link>
      </header>

      <section className="access52-lab-hero">
        <div>
          <p className="section-index">GUIA CGL · RESIDENTES EM PORTUGAL</p>
          <h1>Acesso 52</h1>
          <p>Escolhe 52 dias por ano para entrar gratuitamente nos museus, monumentos e palácios nacionais abrangidos, em qualquer dia da semana.</p>
        </div>
        <div className="access52-hero-badge">
          <Access52Badge variant="full" size={220} />
          <small>Classificação editorial do Cultura Grátis Lisboa</small>
        </div>
      </section>

      <section className="access52-facts" id="como-funciona" aria-labelledby="facts-title">
        <div className="access52-section-heading">
          <p className="section-index">01 · O ESSENCIAL</p>
          <h2 id="facts-title">Como funciona</h2>
          <p>O benefício é pessoal, destina-se a residentes em Portugal e renova-se em cada ano civil.</p>
        </div>
        <div className="access52-fact-grid">
          <article><strong>52</strong><span>dias gratuitos por ano civil</span></article>
          <article><strong>7/7</strong><span>qualquer dia da semana</span></article>
          <article><strong>+1</strong><span>vários equipamentos no mesmo dia</span></article>
          <article><strong>PT</strong><span>para residentes em Portugal</span></article>
        </div>
        <aside className="access52-badge-key">
          <Access52Badge variant="compact" size={56} />
          <p><strong>Procura esta assinatura na agenda.</strong> Nos cartões usamos a versão reduzida; na página de detalhe, o selo completo explica a classificação.</p>
        </aside>
      </section>

      <section className="access52-steps" aria-labelledby="steps-title">
        <div className="access52-section-heading">
          <p className="section-index">02 · NA BILHETEIRA</p>
          <h2 id="steps-title">Leva identificação e NIF.</h2>
          <p>A adesão é feita na bilheteira. Confirma sempre horários, reservas e eventuais limitações diretamente com o equipamento.</p>
        </div>
        <ol>
          <li><strong>Escolhe o dia.</strong><span>Podes usar o benefício em qualquer dia da semana.</span></li>
          <li><strong>Vai à bilheteira.</strong><span>Apresenta um documento de identificação e o NIF.</span></li>
          <li><strong>Usa o mesmo dia.</strong><span>Podes entrar em mais do que um local abrangido e repetir visitas nesse dia.</span></li>
          <li><strong>Confirma antes de sair.</strong><span>Aberturas, lotações e reservas podem mudar.</span></li>
        </ol>
      </section>

      <section className="access52-places" aria-labelledby="places-title">
        <div className="access52-section-heading">
          <p className="section-index">03 · EM LISBOA</p>
          <h2 id="places-title">14 lugares abrangidos</h2>
          <p>Esta é a lista de equipamentos em Lisboa publicada no portal oficial do Governo.</p>
        </div>
        <ul>
          {lisbonPlaces.map((place, index) => <li key={place}><span>{String(index + 1).padStart(2, "0")}</span>{place}</li>)}
        </ul>
      </section>

      <section className="access52-sources" aria-labelledby="sources-title">
        <div>
          <p className="section-index">04 · TRANSPARÊNCIA</p>
          <h2 id="sources-title">O selo é nosso. O regime não.</h2>
          <p>O Acesso 52 é uma classificação editorial do CGL para tornar este benefício mais fácil de reconhecer. Não é um selo oficial do Estado, do Património Cultural, I.P. ou da Museus e Monumentos de Portugal, E.P.E.</p>
          <p>Aplicamos o selo apenas quando o equipamento está na lista oficial. A informação operacional pode mudar, por isso a página oficial do local continua a ser a última confirmação antes da visita.</p>
        </div>
        <div className="access52-source-links">
          <a href="https://www.gov.pt/noticias/museus-monumentos-e-palacios-com-entrada-gratis-52-dias-por-ano" target="_blank" rel="noopener noreferrer">Consultar regras e lista no gov.pt ↗</a>
          <a href="https://www.museusemonumentos.pt/pt/noticia-com/novo-regime-de-gratuitidade-em-museus-e-monumentos" target="_blank" rel="noopener noreferrer">Consultar a explicação da Museus e Monumentos de Portugal ↗</a>
        </div>
      </section>
    </main>
  );
}
