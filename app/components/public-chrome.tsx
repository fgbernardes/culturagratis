import Link from "next/link";
import { cglEmblemColor } from "../brand-assets";

export function PublicHeader() {
  return (
    <header className="public-topbar">
      <Link className="public-brand" href="/" aria-label="Cultura Grátis Lisboa, início">
        <img src={cglEmblemColor} alt="" width="58" height="58" />
        <span><strong>Cultura Grátis</strong><small>Lisboa</small></span>
      </Link>
      <nav aria-label="Navegação principal">
        <Link href="/agenda">Agenda</Link>
        <Link href="/categorias">Categorias</Link>
        <Link href="/freguesias">Freguesias</Link>
        <Link href="/noticias">Notícias</Link>
        <Link href="/coletividades">Coletividades</Link>
        <Link href="/sobre">Sobre</Link>
      </nav>
      <div className="public-topbar-actions">
        <PublicSearchLink />
        <Link className="public-topbar-action" href="/submeter-evento">Sugerir evento</Link>
        <Link className="public-support-action" href="/apoia">Dá-nos uma mãozinha</Link>
        <details className="public-mobile-menu">
          <summary aria-label="Abrir menu"><span /><span /><span /></summary>
          <nav aria-label="Navegação móvel">
            <Link href="/agenda">Agenda</Link>
            <Link href="/categorias">Categorias</Link>
            <Link href="/freguesias">Freguesias</Link>
            <Link href="/noticias">Notícias</Link>
            <Link href="/coletividades">Coletividades</Link>
            <Link href="/sobre">Sobre</Link>
            <Link href="/apoia">Dá-nos uma mãozinha</Link>
            <Link href="/submeter-evento">Sugerir evento</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}

export function PublicSearchLink({ compact = false }: { compact?: boolean }) {
  return (
    <Link className={compact ? "public-search-link compact" : "public-search-link"} href="/agenda#pesquisar">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </svg>
      <span>Pesquisar</span>
    </Link>
  );
}

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer-brand">
        <Link href="/" aria-label="Cultura Grátis Lisboa, início">
          <img src={cglEmblemColor} alt="" width="58" height="58" />
          <strong>Cultura Grátis<br />Lisboa</strong>
        </Link>
        <span>Informação independente, verificada e sem barreira económica.</span>
      </div>
      <nav aria-label="Informação do projeto">
        <Link href="/sobre">Sobre</Link>
        <Link href="/noticias">Notícias</Link>
        <Link href="/coletividades">Coletividades</Link>
        <Link href="/apoia">Dá-nos uma mãozinha</Link>
        <Link href="/politica-0-euros">Política dos 0 €</Link>
        <Link href="/contactos">Contactos</Link>
        <Link href="/acesso-52">Acesso 52</Link>
        <Link href="/verificacao">Verificação CGL</Link>
        <Link href="/acessibilidade">Acessibilidade</Link>
        <Link href="/privacidade">Privacidade</Link>
        <Link href="/cookies">Cookies</Link>
        <Link href="/termos">Termos</Link>
      </nav>
      <div className="public-footer-contact">
        <a href="mailto:ola@culturagratis.com">ola@culturagratis.com</a>
        <nav aria-label="Redes sociais">
          <a href="https://www.facebook.com/CulturaGratisLisboa" target="_blank" rel="noreferrer">Facebook</a>
          <a href="https://www.instagram.com/culturagratislisboa" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://www.threads.com/@culturagratislisboa" target="_blank" rel="noreferrer">Threads</a>
          <a href="https://www.tiktok.com/@cglisboa" target="_blank" rel="noreferrer">TikTok</a>
          <a href="https://www.youtube.com/@culturagratisemlisboa" target="_blank" rel="noreferrer">YouTube</a>
          <a href="https://whatsapp.com/channel/0029VbDrpMDL7UVSxvfzMm2C" target="_blank" rel="noreferrer">WhatsApp</a>
        </nav>
      </div>
    </footer>
  );
}
