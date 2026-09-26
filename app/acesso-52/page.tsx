import type { Metadata } from "next";
import Link from "next/link";
import { Access52Badge } from "../components/access52-badge";
import { cglLogoColor } from "../brand-assets";
import { pageMetadata } from "../site-config";

export const metadata: Metadata = pageMetadata(
  "Acesso 52 em Lisboa: o que podes visitar agora",
  "Guia para residentes: como usar os 52 dias gratuitos nos locais da Museus e Monumentos de Portugal em Lisboa, com moradas e encerramentos.",
  "/acesso-52",
);

const visitablePlaces = [
  { name: "Mosteiro dos Jerónimos", address: "Praça do Império, 1400-206 Lisboa" },
  { name: "Torre de Belém", address: "Avenida Brasília, 1400-038 Lisboa" },
  { name: "Museu Nacional dos Coches", address: "Avenida da Índia 136, 1300-300 Lisboa", note: "Museu novo; o Picadeiro Real está encerrado." },
  { name: "Museu de Arte Popular", address: "Avenida Brasília 202, 1400-038 Lisboa" },
  { name: "Museu Nacional de Etnologia", address: "Avenida Ilha da Madeira, 1400-203 Lisboa" },
  { name: "Palácio Nacional da Ajuda", address: "Largo da Ajuda, 1349-021 Lisboa" },
  { name: "Casa-Museu Dr. Anastácio Gonçalves", address: "Avenida 5 de Outubro 6/8, 1050-055 Lisboa" },
  { name: "Museu Nacional de Arte Contemporânea (Museu do Chiado)", address: "Rua Serpa Pinto 4 / Rua Capelo 13, 1200-444 Lisboa" },
  { name: "Panteão Nacional", address: "Campo de Santa Clara, 1100-471 Lisboa" },
];

const closedPlaces = [
  "Museu Nacional de Arqueologia",
  "Museu Nacional de Arte Antiga",
  "Museu Nacional do Azulejo",
  "Museu Nacional do Teatro e da Dança",
  "Museu Nacional do Traje (o Parque Botânico do Monteiro-Mor tem bilhete próprio)",
];

export default function Access52Page() {
  return (
    <main className="subpage-shell access52-lab" id="conteudo">
      <a className="skip-link" href="#como-funciona">Saltar para as condições</a>
      <header className="subpage-header">
        <Link className="subpage-brand" href="/" aria-label="Cultura Grátis Lisboa, início">
          <img src={cglLogoColor} alt="" width="58" height="58" />
          <span>Cultura Grátis Lisboa</span>
        </Link>
        <Link className="quiet-link" href="/">← Voltar ao início</Link>
      </header>

      <section className="access52-lab-hero">
        <div>
          <p className="section-index">GUIA CGL · ATUALIZADO EM 26 DE SETEMBRO DE 2026</p>
          <h1>Acesso 52 em Lisboa: o que podes visitar agora</h1>
          <p>Se resides em Portugal e tens NIF, podes usar 52 dias de entrada gratuita por ano civil nos equipamentos abrangidos da Museus e Monumentos de Portugal (MMP). Em Lisboa, a lista oficial inclui 14 locais, mas vários estão encerrados. Vê abaixo os que podes planear visitar e confirma a abertura antes de sair.</p>
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
          <p>Os 52 dias renovam-se em cada ano civil. Podes visitar vários locais abrangidos no mesmo dia: conta um dia, não uma entrada por museu. Crianças até aos 12 anos têm uma isenção própria.</p>
        </div>
        <div className="access52-fact-grid">
          <article><strong>52</strong><span>dias gratuitos por ano civil</span></article>
          <article><strong>7/7</strong><span>qualquer dia da semana, se o local estiver aberto</span></article>
          <article><strong>+1</strong><span>vários locais no mesmo dia</span></article>
          <article><strong>NIF</strong><span>para residentes em Portugal</span></article>
        </div>
        <aside className="access52-badge-key">
          <Access52Badge variant="compact" size={56} />
          <p><strong>O selo é nosso, a política não.</strong> Acesso 52 é uma medida pública. Esta assinatura apenas identifica a informação editorial do CGL; não é um símbolo oficial da MMP.</p>
        </aside>
      </section>

      <section className="access52-steps" aria-labelledby="steps-title">
        <div className="access52-section-heading">
          <p className="section-index">02 · ANTES DA VISITA</p>
          <h2 id="steps-title">Leva identificação e NIF</h2>
          <p>Leva sempre o documento de identificação e o NIF. Na primeira utilização, o registo é feito com esses dados; nas visitas seguintes, apresenta a identificação e tem o NIF disponível se te for pedido. Confirma as instruções de bilhética do local: os Jerónimos e a Torre de Belém também anunciaram a opção de Acesso 52 online.</p>
        </div>
        <ol>
          <li><strong>Escolhe o local e o dia.</strong><span>Consulta a página oficial para confirmar abertura, horários e eventuais reservas.</span></li>
          <li><strong>Confirma a bilhética.</strong><span>Leva identificação e NIF; verifica se o local permite tratar o Acesso 52 online.</span></li>
          <li><strong>Aproveita o mesmo dia.</strong><span>Podes visitar mais do que um equipamento MMP abrangido sem gastar outro dia.</span></li>
          <li><strong>Conta com alterações.</strong><span>Obras, eventos e lotação podem limitar a visita mesmo quando tens direito à gratuitidade.</span></li>
        </ol>
      </section>

      <section className="access52-places" aria-labelledby="places-title">
        <div className="access52-section-heading">
          <p className="section-index">03 · LISBOA, CONCELHO</p>
          <h2 id="places-title">Locais com visita indicada</h2>
          <p>Estes nove equipamentos constam da lista oficial e têm visita indicada à data desta atualização. A Torre de Belém pode ter interrupções pontuais. Confirma sempre no próprio dia.</p>
        </div>
        <ul>
          {visitablePlaces.map((place, index) => <li key={place.name}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{place.name}</strong><br />{place.address}{place.note && <><br /><small>{place.note}</small></>}</div></li>)}
        </ul>
      </section>

      <section className="access52-places access52-places--closed" aria-labelledby="closed-title">
        <div className="access52-section-heading">
          <p className="section-index">04 · ABRANGIDOS, MAS ENCERRADOS</p>
          <h2 id="closed-title">Não planeies uma visita a estes museus sem confirmar a reabertura</h2>
          <p>Fazem parte da lista de Lisboa, mas os espaços museológicos não têm visita regular neste momento. As datas de reabertura podem mudar.</p>
        </div>
        <ul>
          {closedPlaces.map((place) => <li key={place}>{place}</li>)}
        </ul>
      </section>

      <section className="access52-sources" aria-labelledby="sources-title">
        <div>
          <p className="section-index">05 · FONTES E LIMITES</p>
          <h2 id="sources-title">Não são 52 museus grátis em Lisboa</h2>
          <p>A medida abrange apenas equipamentos da MMP. Não inclui os museus municipais, fundações, museus privados ou outros monumentos fora desta rede. Mafra e Sintra não pertencem ao município de Lisboa.</p>
          <p>Esta página foi revista em 26 de setembro de 2026. A lista legal e o estado de abertura são coisas diferentes: consulta a bilhética da MMP e a página do local antes de cada visita. O selo Acesso 52 é uma classificação editorial do CGL, sem afiliação com o Estado ou a MMP.</p>
        </div>
        <div className="access52-source-links">
          <a href="https://www.gov.pt/noticias/museus-monumentos-e-palacios-com-entrada-gratis-52-dias-por-ano" target="_blank" rel="noopener noreferrer">Regras e lista oficial no gov.pt ↗</a>
          <a href="https://www.museusemonumentos.pt/pt/pagina/bilhetes" target="_blank" rel="noopener noreferrer">Bilhética e informação atual da MMP ↗</a>
          <a href="https://mosteirojeronimos.torrebelem.gov.pt/" target="_blank" rel="noopener noreferrer">Jerónimos e Torre de Belém ↗</a>
        </div>
      </section>
    </main>
  );
}
