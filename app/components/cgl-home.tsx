"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { cglLogoColor } from "../brand-assets";
import type { EventItem } from "../data/events";
import { categories } from "../site-content";

const quickCategories = categories;
const categorySymbols = ["♪", "◎", "▧", "⌂", "▶", "✦"];
const parishPins = ["Alvalade", "Arroios", "Misericórdia", "Olivais"];

function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function weekDays() {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return {
      date: isoDate(date),
      day: String(date.getDate()).padStart(2, "0"),
      label: index === 0 ? "HOJE" : index === 1 ? "AMANHÃ" : new Intl.DateTimeFormat("pt-PT", { weekday: "short" }).format(date).replace(".", "").toLocaleUpperCase("pt-PT"),
      detail: index === 0 ? "Agenda" : new Intl.DateTimeFormat("pt-PT", { month: "short" }).format(date).replace(".", "").toLocaleUpperCase("pt-PT"),
    };
  });
}

function categoryQuery(category: string) {
  return `/agenda?categoria=${encodeURIComponent(category)}`;
}

const footerSocialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/CulturaGratisLisboa", icon: "facebook" },
  { label: "Instagram", href: "https://www.instagram.com/culturagratislisboa", icon: "instagram" },
  { label: "Threads", href: "https://www.threads.com/@culturagratislisboa", icon: "threads" },
  { label: "TikTok", href: "https://www.tiktok.com/@cglisboa", icon: "tiktok" },
  { label: "YouTube", href: "https://www.youtube.com/@culturagratisemlisboa", icon: "youtube" },
  { label: "Canal WhatsApp", href: "https://whatsapp.com/channel/0029VbDrpMDL7UVSxvfzMm2C", icon: "whatsapp" },
] as const;

function FooterSocialIcon({ name }: { name: (typeof footerSocialLinks)[number]["icon"] }) {
  if (name === "facebook") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.7 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.6 1.6-1.6h1.7V3.5c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.3H8v3.1h2.5v8h3.2Z" /></svg>;
  if (name === "instagram") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" className="social-dot" /></svg>;
  if (name === "threads") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.26 11.1c-.03-3.49-1.92-5.59-5.11-5.59-2.13 0-3.92.96-4.86 2.5l2.06 1.44c.54-.84 1.27-1.54 2.63-1.54 1.53 0 2.32.85 2.54 2.43a15 15 0 0 0-2.24-.17c-4.12 0-6.07 1.87-6.07 4.34s1.95 3.99 4.81 3.99c3.14 0 5.01-2.12 5.78-4.74.8.36 1.35 1.2 1.35 2.47 0 3.39-3.91 5.23-7.22 5.23-4.89 0-8.08-3.21-8.08-8.42C3.86 6.54 8.08 1.45 13.76 1.45c3.81 0 5.69 1.67 6.97 3.91l2.11-1.47C21.44 2.08 18.33 0 13.66 0 6.23 0 1.17 5.28 1.17 12.93 1.17 19.93 6.12 24 12.02 24c4.88 0 9.81-2.85 9.81-7.72 0-2.54-1.46-4.23-3.57-5.18m-6.33 4.85c-1.08 0-2.03-.51-2.03-1.45 0-1.48 1.82-1.93 3.61-1.93.68 0 1.34.04 1.93.17-.42 1.93-1.67 3.22-3.51 3.21Z" /></svg>;
  if (name === "tiktok") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.4 3c.4 2.4 1.8 3.9 4.1 4.1v3.1c-1.5 0-2.9-.5-4.1-1.4v6.5a5.3 5.3 0 1 1-4.6-5.2v3.1a2.2 2.2 0 1 0 1.5 2.1V3h3.1Z" /></svg>;
  if (name === "youtube") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.8 2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.2 11.2 0 0 0 2.8 17l-1.3 4.7 4.8-1.3a11.2 11.2 0 0 0 14.2-16.9ZM12 20a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.7.8-2.7-.2-.3A8 8 0 1 1 12 20Zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1l-.6.8c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7 7 0 0 1-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.5c.1-.1.1-.3.2-.4 0-.2 0-.3-.1-.4l-.8-1.8c-.2-.5-.5-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.6 2.5 3.8 3.5.5.2 1 .4 1.3.5.6.2 1.1.2 1.5.1.5-.1 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.4-.3Z" /></svg>;
}
export function CglHome() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const days = useMemo(() => weekDays(), []);

  useEffect(() => {
    let active = true;
    fetch("/api/eventos")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("agenda indisponível")))
      .then((data: { events: EventItem[] }) => { if (active) setEvents(data.events); })
      .catch(() => { if (active) setLoadError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const updateHeader = () => setIsHeaderCompact(window.scrollY > 24);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  const featuredEvents = useMemo(() => events.slice(0, 4), [events]);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    window.location.assign(value ? `/agenda?pesquisa=${encodeURIComponent(value)}` : "/agenda");
  }

  return (
    <main className="cgl-home" id="topo">
      <a className="skip-link" href="#conteudo">Saltar para o conteúdo</a>

      <header className={`cgl-home-header${isHeaderCompact ? " is-compact" : ""}`}>
        <Link className="cgl-home-brand" href="/" aria-label="Cultura Grátis Lisboa, início">
          <img src={cglLogoColor} alt="" width="94" height="94" />
          <span><strong>Cultura Grátis</strong><small>Lisboa, sem barreira económica.</small></span>
        </Link>
        <nav className="cgl-home-nav" aria-label="Navegação principal">
          <Link href="/agenda">Agenda</Link><Link href="/categorias">Categorias</Link><Link href="/freguesias">Freguesias</Link><Link href="/noticias">Notícias</Link><Link href="/coletividades">Coletividades</Link><Link href="/acesso-52">Acesso 52</Link><Link href="/sobre">Sobre</Link>
        </nav>
        <div className="cgl-home-actions">
          <Link className="cgl-home-submit" href="/submeter-evento">Sugerir evento</Link>
          <Link className="cgl-home-support-link" href="/apoia">Dá-nos uma mãozinha</Link>
        </div>
        <details className="public-mobile-menu cgl-home-mobile-menu">
          <summary aria-label="Abrir menu"><span /><span /><span /></summary>
          <nav aria-label="Navegação móvel">
            <Link href="/agenda">Agenda</Link>
            <Link href="/categorias">Categorias</Link>
            <Link href="/freguesias">Freguesias</Link>
            <Link href="/noticias">Notícias</Link>
            <Link href="/coletividades">Coletividades</Link>
            
            <Link href="/acesso-52">Acesso 52</Link>
            <Link href="/sobre">Sobre</Link>
            <Link href="/submeter-evento">Sugerir evento</Link>
            <Link href="/apoia">Dá-nos uma mãozinha</Link>
          </nav>
        </details>
      </header>

      <section className="cgl-home-hero" id="conteudo">
        <div className="cgl-home-hero-copy">
          <p className="cgl-home-kicker">Agenda cultural independente · Lisboa</p>
          <h1>A cultura de Lisboa vive em toda a cidade</h1>
          <p>Concertos, exposições, teatro e lugares da cidade, selecionados, confirmados e explicados sem rodeios.</p>
          <form className="cgl-home-search" role="search" onSubmit={search}>
            <label className="sr-only" htmlFor="cgl-home-search">Pesquisar eventos, locais ou bairros</label>
            <span aria-hidden="true">⌕</span>
            <input id="cgl-home-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar eventos, locais ou bairros…" />
            <button type="submit">Pesquisar</button>
          </form>
          <div className="cgl-home-quick-filters" aria-label="Filtros de agenda">
            <Link className="active" href="/agenda">Tudo</Link>
            {quickCategories.map((category) => <Link href={categoryQuery(category.name)} key={category.slug}>{category.name}</Link>)}
          </div>
        </div>
        <div className="cgl-home-mark" aria-hidden="true"><span /><span /><div><img src={cglLogoColor} alt="" width="180" height="180" /></div><p>CULTURA · CIDADE · ACESSO</p></div>
      </section>

      <section className="cgl-home-events" id="destaques" aria-labelledby="destaques-title">
        <div className="cgl-home-heading"><div><p>01 · AGORA EM LISBOA</p><h2 id="destaques-title">Escolhas com entrada livre</h2></div><span>Condições confirmadas nas fontes oficiais indicadas em cada evento.</span></div>
        {loading ? <p className="cgl-home-loading">A abrir as escolhas editoriais…</p> : null}
        {loadError ? <p className="cgl-home-loading">A agenda está temporariamente indisponível. <Link href="/agenda">Tentar na Agenda</Link></p> : null}
        {!loading && !loadError ? <div className="cgl-home-event-grid">
          {featuredEvents.map((event) => <article className="cgl-home-event-card" key={event.id}>
            <div className={`cgl-home-event-art ${event.art}`}><span>{event.category}</span><b>GRÁTIS</b><i /></div>
            <div className="cgl-home-event-body"><div><strong>{event.day}</strong><span>{event.month}</span></div><section><p>{event.eyebrow}</p><h3>{event.title}</h3><span>{event.venue}</span><small>{event.area} · {event.condition}</small></section></div>
            <footer><span>{event.condition}</span><Link href={`/eventos/${event.slug}`}>Ver detalhes →</Link></footer>
          </article>)}
          {featuredEvents.length === 0 ? <p className="cgl-home-loading">Ainda não há escolhas editoriais publicadas.</p> : null}
        </div> : null}
      </section>

      <section className="cgl-home-week" id="agenda" aria-labelledby="agenda-title">
        <div className="cgl-home-heading"><div><p>02 · PRÓXIMOS 7 DIAS</p><h2 id="agenda-title">A tua semana cultural</h2></div><Link href="/agenda">Ver agenda completa →</Link></div>
        <div className="cgl-home-week-strip">{days.map((day, index) => <Link className={index === 0 ? "today" : ""} href={`/agenda?data=${day.date}`} key={day.date}><span>{day.label}</span><strong>{day.day}</strong><small>{day.detail}</small></Link>)}</div>
        <p>Escolhe um dia para ver as propostas publicadas. Confirma as condições na fonte indicada em cada evento.</p>
      </section>

      <section className="cgl-home-discovery">
        <div className="cgl-home-categories" id="categorias"><div className="cgl-home-heading"><div><p>03 · ESCOLHE O TEU PLANO</p><h2>Explora por categoria</h2></div></div><div>
          {categories.slice(0, 6).map((category, index) => <Link href={categoryQuery(category.name)} key={category.slug}><span>{categorySymbols[index]}</span><strong>{category.name}</strong><small>{category.description}</small></Link>)}
        </div></div>
        <div className="cgl-home-map" id="mapa"><div className="cgl-home-heading"><div><p>04 · LISBOA É O PALCO</p><h2>Começa por uma freguesia</h2></div><span>Mapa editorial</span></div><div className="cgl-home-map-canvas"><i /><b>TEJO</b>{parishPins.map((parish, index) => <Link href={`/agenda?freguesia=${encodeURIComponent(parish)}`} key={parish} className={`pin pin-${index + 1}`}><strong>{index + 1}</strong><span>{parish}</span></Link>)}</div><Link className="cgl-home-map-link" href="/freguesias">Explorar as 24 freguesias →</Link></div>
      </section>

      <section className="cgl-home-access" aria-labelledby="access-title"><div><p>05 · GRÁTIS, MAS EXPLICADO</p><h2 id="access-title">Sabe como entrar</h2><span>Entrada livre, reserva ou levantamento de bilhete não são a mesma coisa. Nós dizemos-te o que conta antes de chegares à porta.</span><Link href="/corrigir-informacao">Detetaste um erro? Avisa-nos →</Link></div><div className="cgl-home-access-grid">
        <article><span>01</span><h3>Entrada livre</h3><p>Sem qualquer pagamento, nem donativo. Pode haver lotação limitada.</p></article>
        <article><span>02</span><h3>Reserva gratuita</h3><p>É preciso reservar ou inscrever, mas não pagar. Indicamos sempre o passo.</p></article>
        <article><span>03</span><h3>Bilhete gratuito</h3><p>Pode exigir levantamento no próprio dia e ter limite por pessoa.</p></article>
        <article className="accent"><span>04</span><h3>Acesso 52</h3><p>Conhece os 52 dias anuais de entrada gratuita para residentes em Portugal com NIF nos locais abrangidos.</p><Link href="/acesso-52">Ver como funciona →</Link></article>
      </div></section>

      <section className="cgl-home-community" id="sobre"><div><p>06 · O QUE SOMOS</p><blockquote>“Lisboa tem cultura à porta. Procuramos propostas gratuitas, confirmamos as condições e damos-te a informação para escolheres.”</blockquote><span>Uma agenda cultural independente, feita com olhar de bairro. A cultura gratuita abre caminhos para conhecer Lisboa por inteiro.</span></div><aside><article><p>NEWSLETTER</p><h2>Lisboa na tua caixa de entrada</h2><span>Subscreve e confirma o teu endereço por email. O primeiro email anuncia a abertura; depois, enviamos novidades sobre a cultura gratuita em Lisboa.</span><a href="https://www.culturagratis.com/#agenda-title">Subscrever a newsletter →</a></article><article><p>COMUNIDADE</p><h2>Conheces um evento grátis?</h2><span>Envia a fonte oficial, data, local e condições de acesso. Nós fazemos a verificação.</span><Link href="/submeter-evento">Sugerir um evento →</Link></article></aside></section>

      <footer className="cgl-home-footer">
  <div><img src="/cgl-emblem.png" alt="Cultura Grátis Lisboa" width="112" height="112" /><span><strong>Cultura Grátis Lisboa</strong><small>Cultura para todos. Lisboa para todos. Todos os dias.</small></span></div>
  <nav className="cgl-home-footer-links" aria-label="Links institucionais"><Link href="/agenda">Agenda</Link><Link href="/categorias">Categorias</Link><Link href="/freguesias">Freguesias</Link><Link href="/noticias">Notícias</Link><Link href="/coletividades">Coletividades</Link><Link href="/sobre">Sobre</Link><Link href="/privacidade">Privacidade</Link></nav>
  <div className="cgl-home-footer-meta">
    <a className="cgl-home-footer-email" href="mailto:ola@culturagratis.com">ola@culturagratis.com</a>
    <nav className="cgl-home-socials" aria-label="Redes sociais do Cultura Grátis Lisboa">
      {footerSocialLinks.map(({ label, href, icon }) => <a key={label} className={`cgl-home-social cgl-home-social-${label.toLowerCase().replace("canal ", "")}`} href={href} target="_blank" rel="noreferrer" aria-label={`Segue o Cultura Grátis Lisboa no ${label}`} title={label}><FooterSocialIcon name={icon} /></a>)}
    </nav>
    <small>© 2026 Cultura Grátis Lisboa</small>
  </div>
</footer>
    </main>
  );
}