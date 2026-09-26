"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { cglLogoColor } from "../brand-assets";
import { Access52Badge } from "../components/access52-badge";
import { VerificationChip } from "../components/verification-badge";
import type { EventItem } from "../data/events";
import { categories as editorialCategories, parishes } from "../site-content";

const categories = ["Tudo", ...editorialCategories.map((item) => item.name)];
const parishNames = parishes.map(([, name]) => name);
const presetDates = new Set(["todas", "hoje", "amanha", "fim-de-semana", "7-dias"]);

function matchesCategory(eventCategory: string, selected: string) {
  if (selected === "Tudo") return true;
  const eventValue = eventCategory.toLocaleLowerCase("pt-PT");
  const selectedValue = selected.toLocaleLowerCase("pt-PT");
  if (selectedValue === "música") return eventValue.includes("música") || eventValue.includes("concerto");
  if (selectedValue.startsWith("exposições")) return eventValue.includes("expos");
  if (selectedValue.startsWith("teatro")) return eventValue.includes("teatro") || eventValue.includes("performance");
  return eventValue === selectedValue;
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function dateRange(filter: string): [string, string] | null {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  if (isIsoDate(filter)) return [filter, filter];
  if (filter === "hoje") return [toIsoDate(today), toIsoDate(today)];
  if (filter === "amanha") {
    const tomorrow = addDays(today, 1);
    return [toIsoDate(tomorrow), toIsoDate(tomorrow)];
  }
  if (filter === "7-dias") return [toIsoDate(today), toIsoDate(addDays(today, 6))];
  if (filter === "fim-de-semana") {
    const weekday = today.getDay();
    const daysUntilSaturday = weekday === 0 ? -1 : weekday === 6 ? 0 : 6 - weekday;
    const saturday = addDays(today, daysUntilSaturday);
    return [toIsoDate(weekday === 0 ? today : saturday), toIsoDate(addDays(saturday, 1))];
  }
  return null;
}

function matchesDate(event: EventItem, filter: string) {
  const range = dateRange(filter);
  if (!range) return true;
  const [start, end] = range;
  return event.startDate <= end && (event.endDate ?? event.startDate) >= start;
}

export default function AgendaPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tudo");
  const [parish, setParish] = useState("Todas");
  const [dateFilter, setDateFilter] = useState("todas");
  const [filtersReady, setFiltersReady] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/eventos")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("agenda indisponível")))
      .then((data: { events: EventItem[] }) => { if (active) setEvents(data.events); })
      .catch(() => { if (active) { setEvents([]); setLoadError(true); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const requestedQuery = params.get("pesquisa")?.trim();
      const requestedCategory = params.get("categoria");
      const requestedParish = params.get("freguesia");
      const requestedDate = params.get("data");
      if (requestedQuery) setQuery(requestedQuery);
      if (requestedCategory && categories.includes(requestedCategory)) setCategory(requestedCategory);
      if (requestedParish && parishNames.includes(requestedParish)) setParish(requestedParish);
      if (requestedDate && (presetDates.has(requestedDate) || isIsoDate(requestedDate))) setDateFilter(requestedDate);
      setFiltersReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!filtersReady) return;
    const params = new URLSearchParams();
    if (query.trim()) params.set("pesquisa", query.trim());
    if (category !== "Tudo") params.set("categoria", category);
    if (parish !== "Todas") params.set("freguesia", parish);
    if (dateFilter !== "todas") params.set("data", dateFilter);
    const search = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
  }, [category, dateFilter, filtersReady, parish, query]);

  const visibleEvents = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("pt-PT");
    return events.filter((event) => {
      const categoryMatches = matchesCategory(event.category, category);
      const parishMatches = parish === "Todas" || event.area === parish;
      const haystack = `${event.title} ${event.venue} ${event.area} ${event.category}`.toLocaleLowerCase("pt-PT");
      return categoryMatches && parishMatches && matchesDate(event, dateFilter) && (!needle || haystack.includes(needle));
    });
  }, [category, dateFilter, events, parish, query]);

  const hasFilters = Boolean(query.trim() || category !== "Tudo" || parish !== "Todas" || dateFilter !== "todas");
  const selectedCategory = category === "Tudo" ? null : editorialCategories.find((item) => item.name === category);

  function clearFilters() {
    setQuery("");
    setCategory("Tudo");
    setParish("Todas");
    setDateFilter("todas");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyFeedback("Ligação copiada");
    } catch {
      setCopyFeedback("Não foi possível copiar. Usa a ligação da barra do navegador.");
    }
    window.setTimeout(() => setCopyFeedback(""), 2600);
  }

  return (
    <main className="subpage-shell">
      <a className="skip-link" href="#agenda-list">Saltar para a agenda</a>
      <header className="subpage-header">
        <Link className="subpage-brand" href="/" aria-label="Cultura Grátis Lisboa — início">
          <img src={cglLogoColor} alt="" width="58" height="58" />
          <span>Cultura Grátis Lisboa</span>
        </Link>
        <Link className="quiet-link" href="/">← Voltar ao início</Link>
      </header>

      <section className="agenda-hero">
        <p className="section-index">LISBOA · SEMPRE GRÁTIS</p>
        <h1>Agenda cultural</h1>
        <p>Pesquisa propostas gratuitas e confirma os detalhes na fonte oficial antes de sair.</p>
      </section>

      <section className="agenda-browser" id="pesquisar" aria-label="Pesquisar agenda">
        <label className="agenda-search">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">Pesquisar por evento, local ou freguesia</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Evento, local ou freguesia"
          />
        </label>

        <div className="filter-chips" aria-label="Filtrar por categoria">
          {categories.map((item) => (
            <button
              className={category === item ? "filter-chip active" : "filter-chip"}
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
            >
              {item}
            </button>
          ))}
        </div>

        {selectedCategory ? <p className="agenda-category-description"><strong>{selectedCategory.name}.</strong> {selectedCategory.description}</p> : null}

        <div className="agenda-filter-row">
          <label className="agenda-select">
            <span>Freguesia</span>
            <select value={parish} onChange={(event) => setParish(event.target.value)}>
              <option>Todas</option>
              {parishes.map(([slug, name]) => <option value={name} key={slug}>{name}</option>)}
            </select>
          </label>

          <label className="agenda-select">
            <span>Data</span>
            <select
              value={isIsoDate(dateFilter) ? "personalizada" : dateFilter}
              onChange={(event) => setDateFilter(event.target.value === "personalizada" ? toIsoDate(new Date()) : event.target.value)}
            >
              <option value="todas">Todas as datas</option>
              <option value="hoje">Hoje</option>
              <option value="amanha">Amanhã</option>
              <option value="fim-de-semana">Este fim de semana</option>
              <option value="7-dias">Próximos 7 dias</option>
              <option value="personalizada">Escolher uma data</option>
            </select>
          </label>

          {isIsoDate(dateFilter) ? <label className="agenda-select agenda-custom-date"><span>Escolher data</span><input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value || "todas")} /></label> : null}
        </div>

        <div className="agenda-filter-actions">
          <button type="button" onClick={clearFilters} disabled={!hasFilters}>Limpar filtros</button>
          <button type="button" onClick={copyLink}>Copiar ligação desta pesquisa</button>
          <span role="status" aria-live="polite">{copyFeedback}</span>
        </div>

        {!loading && !loadError ? (
          <p className="results-count" aria-live="polite">
            {visibleEvents.length} {visibleEvents.length === 1 ? "proposta encontrada" : "propostas encontradas"}
          </p>
        ) : null}

        <div className="agenda-list" id="agenda-list">
          {visibleEvents.map((event) => (
            <article className={`agenda-row ${event.art}`} key={event.id}>
              <div className="agenda-row-date" aria-label={`${event.day} de ${event.month}`}>
                <strong>{event.day}</strong><span>{event.month}</span>
              </div>
              <div className="agenda-row-copy">
                <p className="event-eyebrow">{event.category} · {event.condition}</p>
                <h2>{event.title}</h2>
                <p>{event.venue} · {event.area}</p>
                <small>{event.time}</small>
                {event.verifiedAt || event.access52 ? (
                  <div className="agenda-editorial-badges">
                    {event.verifiedAt ? <VerificationChip verifiedAt={event.verifiedAt} className="agenda-verification" /> : null}
                    {event.access52 ? <Access52Badge variant="compact" size={48} /> : null}
                  </div>
                ) : null}
              </div>
              <Link className="agenda-row-link" href={`/eventos/${event.slug}`}>
                Ver detalhes <span aria-hidden="true">↗</span>
              </Link>
            </article>
          ))}
          {loading ? (
            <div className="empty-state" role="status">
              <strong>A abrir a agenda…</strong>
              <p>Só um instante.</p>
            </div>
          ) : null}
          {!loading && loadError ? (
            <div className="empty-state" role="alert">
              <strong>A agenda está temporariamente indisponível.</strong>
              <p>Tenta novamente dentro de alguns minutos.</p>
            </div>
          ) : null}
          {!loading && !loadError && visibleEvents.length === 0 ? (
            <div className="empty-state" role="status">
              <strong>{hasFilters ? "Não encontrámos propostas com estes filtros." : "A agenda está a ser preparada."}</strong>
              <p>{hasFilters ? "Experimenta outra palavra, data ou freguesia." : "Estamos a reunir as primeiras propostas para publicação."}</p>
              {hasFilters ? <button className="empty-state-action" type="button" onClick={clearFilters}>Mostrar toda a agenda</button> : null}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
