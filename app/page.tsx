import Link from "next/link";
import { cglLogoColor } from "./brand-assets";
import { ComingSoonForm } from "./components/coming-soon-form";
import { PublicFooter, PublicHeader } from "./components/public-chrome";
import { isPrelaunchMode } from "./launch-state";

const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/CulturaGratisLisboa", icon: "facebook" },
  { label: "Instagram", href: "https://www.instagram.com/culturagratislisboa", icon: "instagram" },
  { label: "Threads", href: "https://www.threads.com/@culturagratislisboa", icon: "threads" },
  { label: "TikTok", href: "https://www.tiktok.com/@cglisboa", icon: "tiktok" },
  { label: "YouTube Shorts", href: "https://www.youtube.com/@culturagratisemlisboa", icon: "youtube" },
  { label: "Canal WhatsApp", href: "https://whatsapp.com/channel/0029VbDrpMDL7UVSxvfzMm2C", icon: "whatsapp" },
] as const;

function SocialIcon({ name }: { name: (typeof socialLinks)[number]["icon"] }) {
  if (name === "facebook") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.7 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.6 1.6-1.6h1.7V3.5c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.3H8v3.1h2.5v8h3.2Z" /></svg>;
  if (name === "instagram") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" className="social-icon-dot" /></svg>;
  if (name === "threads") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.263 11.097c-.03-3.486-1.92-5.586-5.111-5.586-2.13 0-3.922.963-4.863 2.499l2.062 1.438c.535-.843 1.272-1.543 2.628-1.543 1.528 0 2.318.85 2.544 2.431a15 15 0 0 0-2.236-.173c-4.125 0-6.068 1.867-6.068 4.336s1.943 3.99 4.804 3.99c3.139 0 5.013-2.115 5.781-4.735.798.361 1.348 1.204 1.348 2.47 0 3.387-3.907 5.232-7.22 5.232-4.885 0-8.077-3.207-8.077-8.424 0-6.392 4.223-10.487 9.9-10.487 3.808 0 5.69 1.671 6.97 3.914l2.108-1.475C21.44 2.078 18.331 0 13.663 0 6.227 0 1.168 5.277 1.168 12.934c0 7 4.953 11.066 10.856 11.066 4.878 0 9.809-2.846 9.809-7.716 0-2.545-1.46-4.231-3.569-5.187m-6.33 4.855c-1.077 0-2.026-.512-2.026-1.453 0-1.483 1.822-1.934 3.606-1.934.678 0 1.34.045 1.927.173-.422 1.927-1.671 3.215-3.508 3.214Z" /></svg>;
  if (name === "tiktok") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.4 3c.4 2.4 1.8 3.9 4.1 4.1v3.1c-1.5 0-2.9-.5-4.1-1.4v6.5a5.3 5.3 0 1 1-4.6-5.2v3.1a2.2 2.2 0 1 0 1.5 2.1V3h3.1Z" /></svg>;
  if (name === "youtube") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.8 2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.2 11.2 0 0 0 2.8 17l-1.3 4.7 4.8-1.3a11.2 11.2 0 0 0 14.2-16.9ZM12 20a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.7.8-2.7-.2-.3A8 8 0 1 1 12 20Zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1l-.6.8c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7 7 0 0 1-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.5c.1-.1.1-.3.2-.4 0-.2 0-.3-.1-.4l-.8-1.8c-.2-.5-.5-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.6 2.5 3.8 3.5.5.2 1 .4 1.3.5.6.2 1.1.2 1.5.1.5-.1 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.4-.3Z" /></svg>;
}


export const dynamic = "force-dynamic";

function turnstileSiteKey() {
  const runtime = globalThis as typeof globalThis & { __CGL_ENV?: { TURNSTILE_SITE_KEY?: string } };
  return runtime.__CGL_ENV?.TURNSTILE_SITE_KEY ?? "";
}

function PrelaunchHome() {
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
          <nav className="cgl-coming-socials" aria-label="Redes sociais do Cultura Grátis Lisboa">
            <span className="sr-only">Segue o Cultura Grátis Lisboa nas redes sociais</span>
            {socialLinks.map(({ label, href, icon }) => (
              <a key={icon} className={`cgl-social-${icon}`} href={href} target="_blank" rel="noreferrer" aria-label={`Segue o Cultura Grátis Lisboa no ${label}`} title={label}>
                <SocialIcon name={icon} />
              </a>
            ))}
          </nav>
          <a className="cgl-coming-email" href="mailto:ola@culturagratis.com" aria-label="Enviar email para ola@culturagratis.com">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3V5Zm1.8 2 7.2 5.4L19.2 7H4.8Zm14.4 10V9.3L12 14.6 4.8 9.3V17h14.4Z" /></svg>
            <span>ola@culturagratis.com</span>
          </a>
        </section>
      </div>
      <section className="cgl-coming-principles" aria-label="Princípios editoriais"><ul>
        <li><strong>Mais bairro...</strong><span>A cidade não acaba na Baixa.</span></li>
        <li><strong>Mais acesso...</strong><span>Sem letras pequenas nem barreiras escondidas.</span></li>
        <li><strong>Mais critério...</strong><span>Menos cartazes, mais curadoria.</span></li>
      </ul></section>
      <footer className="cgl-coming-footer"><span>Cultura Grátis Lisboa · 2026</span><form action="/privacidade" method="get"><button type="submit">Política de Privacidade</button></form></footer>
    </main>
  );
}

function LaunchHome() {
  return (
    <main className="editorial-shell directory-shell launch-home-shell">
      <a className="skip-link" href="#conteudo">Saltar para o conteúdo</a>
      <PublicHeader />
      <header className="directory-hero launch-home-hero" id="conteudo">
        <p>CULTURA GRATUITA EM LISBOA</p>
        <h1>A cultura de Lisboa vive em toda a cidade</h1>
        <span>Descobre propostas gratuitas, confirma os detalhes na fonte oficial e escolhe o próximo lugar onde a cidade acontece.</span>
        <div className="editorial-actions">
          <Link className="primary" href="/agenda">Explorar a agenda</Link>
          <Link className="secondary" href="/categorias">Ver categorias</Link>
        </div>
      </header>
      <section className="launch-featured" aria-labelledby="launch-featured-title">
        <div className="launch-featured-heading">
          <p>ESCOLHA EDITORIAL</p>
          <h2 id="launch-featured-title">Em destaque</h2>
          <span>Quatro escolhas feitas pela equipa editorial. A seleção será publicada quando os dados estiverem confirmados.</span>
        </div>
        <div className="launch-featured-grid" aria-hidden="true">
          {[1, 2, 3, 4].map((slot) => (
            <div className="launch-featured-slot" key={slot}>
              <small>{String(slot).padStart(2, "0")}</small>
              <strong>Em preparação</strong>
            </div>
          ))}
        </div>
      </section>
      <section className="directory-grid launch-home-grid" aria-label="Quatro caminhos para descobrir Lisboa">
        <Link href="/agenda">
          <small>01</small>
          <h2>Agenda cultural</h2>
          <p>Pesquisa eventos gratuitos por data, categoria ou freguesia.</p>
          <span>Ver a agenda →</span>
        </Link>
        <Link href="/freguesias">
          <small>02</small>
          <h2>Lisboa, freguesia a freguesia</h2>
          <p>Encontra cultura perto de ti nas 24 freguesias do município.</p>
          <span>Explorar freguesias →</span>
        </Link>
        <Link href="/noticias">
          <small>03</small>
          <h2>Notícias</h2>
          <p>Atualizações do projeto e da vida cultural da cidade, com informação confirmada.</p>
          <span>Ver notícias →</span>
        </Link>
        <Link href="/coletividades">
          <small>04</small>
          <h2>Coletividades</h2>
          <p>Associações e espaços comunitários fazem cultura em toda a Lisboa.</p>
          <span>Conhecer a secção →</span>
        </Link>
      </section>
      <PublicFooter />
    </main>
  );
}

export default function Home() {
  return isPrelaunchMode() ? <PrelaunchHome /> : <LaunchHome />;
}
