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
        <Link href="/sobre">Sobre</Link>
      </nav>
      <div className="public-topbar-actions">
        <PublicSearchLink />
        <Link className="public-topbar-action" href="/submeter-evento">Sugerir evento</Link>
        <details className="public-mobile-menu">
          <summary aria-label="Abrir menu"><span /><span /><span /></summary>
          <nav aria-label="Navegação móvel">
            <Link href="/agenda">Agenda</Link>
            <Link href="/categorias">Categorias</Link>
            <Link href="/freguesias">Freguesias</Link>
            <Link href="/sobre">Sobre</Link>
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
      <div>
        <strong>Cultura gratuita em Lisboa, todos os dias.</strong>
        <span>Informação independente, verificada e sem barreira económica.</span>
      </div>
      <nav aria-label="Informação do projeto">
        <Link href="/sobre">Sobre</Link>
        <Link href="/politica-0-euros">Política dos 0 €</Link>
        <Link href="/contactos">Contactos</Link>
        <Link href="/acesso-52">Acesso 52</Link>
        <Link href="/verificacao">Verificação CGL</Link>
        <Link href="/acessibilidade">Acessibilidade</Link>
        <Link href="/privacidade">Privacidade</Link>
        <Link href="/cookies">Cookies</Link>
        <Link href="/termos">Termos</Link>
      </nav>
    </footer>
  );
}
