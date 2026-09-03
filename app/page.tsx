import Link from "next/link";
import { cglLogoColor } from "./brand-assets";
import { ComingSoonForm } from "./components/coming-soon-form";

export const dynamic = "force-dynamic";

function turnstileSiteKey() {
  const runtime = globalThis as typeof globalThis & { __CGL_ENV?: { TURNSTILE_SITE_KEY?: string } };
  return runtime.__CGL_ENV?.TURNSTILE_SITE_KEY ?? "";
}

export default function Home() {
  return (
    <main className="cgl-coming" id="inicio">
      <a className="skip-link" href="#conteudo">Saltar para o conteúdo</a>
      <header className="cgl-coming-header" aria-label="Cultura Grátis Lisboa">
        <Link href="/" aria-label="Cultura Grátis Lisboa — início"><img src={cglLogoColor} alt="Cultura Grátis Lisboa" /></Link>
        <div className="cgl-coming-status"><p>Brevemente<span>...</span></p></div>
      </header>
      <div className="cgl-coming-stage">
        <section className="cgl-coming-manifesto" id="conteudo" aria-labelledby="manifesto-title">
          <p className="cgl-coming-eyebrow">Desde 2010 · Lisboa</p>
          <h1 id="manifesto-title">A cultura de Lisboa vive em toda a cidade</h1>
          <div className="cgl-coming-prose">
            <p>Na vida de bairro, na associação local, no teatro de garagem e na pluralidade de vozes que constroem a cidade fora dos grandes circuitos comerciais.</p>
            <p>Durante anos fomos um mural de cartazes. Agora criámos uma casa própria: uma agenda onde selecionamos, confirmamos e explicamos o que há para ver, ouvir e fazer na cidade sem gastar um cêntimo. <strong>Com menos ruído<span className="cgl-orange-ellipsis">...</span></strong></p>
          </div>
        </section>
        <section className="cgl-coming-signup" aria-labelledby="agenda-title">
          <div className="cgl-coming-signup-intro"><p className="cgl-coming-eyebrow">Primeira fila</p><h2 id="agenda-title">Recebe a newsletter de lançamento</h2><p>O primeiro email anuncia a abertura. Depois, a agenda chega-te por email.</p></div>
          <ComingSoonForm siteKey={turnstileSiteKey()} />
        </section>
      </div>
      <section className="cgl-coming-principles" aria-label="Princípios editoriais"><ul>
        <li><strong>Mais bairro.</strong><span>A cidade não acaba na Baixa.</span></li>
        <li><strong>Mais acesso.</strong><span>Sem letras pequenas nem barreiras escondidas.</span></li>
        <li><strong>Mais critério.</strong><span>Menos cartazes, mais curadoria.</span></li>
      </ul></section>
      <footer className="cgl-coming-footer"><span>Cultura Grátis Lisboa · 2026</span><form action="/privacidade" method="get"><button type="submit">Política de Privacidade</button></form></footer>
    </main>
  );
}
