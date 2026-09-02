import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cglLogoColor } from "../../brand-assets";
import { Access52Badge } from "../../components/access52-badge";
import { PublicSearchLink } from "../../components/public-chrome";
import { VerificationSeal, formatVerificationDate } from "../../components/verification-badge";
import { toEventItem } from "../../data/events";
import { absoluteUrl, SITE_NAME } from "../../site-config";
import { getPublishedEventBySlug } from "../../../db/events";

type EventPageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const slug = (await params).slug;
  const record = await getPublishedEventBySlug(slug);
  if (!record) return {};
  const event = toEventItem(record);
  const title = `${event.title} — Cultura Grátis Lisboa`;
  const description = `${event.condition} em ${event.venue}, Lisboa. Consulta horários, acesso e fonte oficial.`;
  return {
    title,
    description,
    alternates: { canonical: `/eventos/${slug}` },
    openGraph: { title, description, url: `/eventos/${slug}`, siteName: SITE_NAME, locale: "pt_PT", type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const record = await getPublishedEventBySlug((await params).slug);
  if (!record) notFound();
  const event = toEventItem(record);
  const canonicalUrl = absoluteUrl(`/eventos/${event.slug}`);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    url: canonicalUrl,
    startDate: record.startDate,
    ...(record.endDate ? { endDate: record.endDate } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    isAccessibleForFree: true,
    location: {
      "@type": "Place",
      name: event.venue,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.streetAddress,
        postalCode: event.postalCode,
        addressLocality: "Lisboa",
        addressRegion: "Lisboa",
        addressCountry: "PT",
      },
    },
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "EUR",
      url: event.sourceUrl,
      availability: "https://schema.org/InStock",
    },
    organizer: { "@type": "Organization", name: event.source, url: event.sourceUrl },
  };

  return (
    <main className="subpage-shell" id="conteudo">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <a className="skip-link" href="#evento">Saltar para o evento</a>
      <header className="subpage-header">
        <Link className="subpage-brand" href="/" aria-label="Cultura Grátis Lisboa — início">
          <img src={cglLogoColor} alt="" width="58" height="58" />
          <span>Cultura Grátis Lisboa</span>
        </Link>
        <div className="subpage-header-actions">
          <PublicSearchLink compact />
          <Link className="quiet-link" href="/agenda">← Voltar à agenda</Link>
        </div>
      </header>

      <article className="event-detail" id="evento">
        <div className={`event-detail-intro ${event.art}`}>
          <div className="event-detail-date"><strong>{event.day}</strong><span>{event.month}</span></div>
          <div>
            <p className="section-index">{event.category} · {event.condition}</p>
            <h1>{event.title}</h1>
            <p className="event-lead">{event.description}</p>
          </div>
        </div>

        <div className="event-detail-grid">
          <section className="event-facts" aria-label="Informação do evento">
            <div><b aria-hidden="true">⌖</b><span><strong>Onde</strong>{event.venue}<small>{event.streetAddress}, {event.postalCode} Lisboa · {event.area}</small></span></div>
            <div><b aria-hidden="true">◷</b><span><strong>Quando</strong>{formatEventDates(record.startDate, record.endDate)} · {event.time}</span></div>
            <div><b aria-hidden="true">€</b><span><strong>Preço</strong>{event.condition}</span></div>
          </section>
          <section className="event-confidence">
            <div><b aria-hidden="true">✓</b><span><strong>Como entrar</strong>{event.access}</span></div>
            <div><b aria-hidden="true">◎</b><span><strong>Acessibilidade</strong>{event.accessibility}</span></div>
          </section>
        </div>

        {event.verifiedAt ? (
          <aside className="event-verification-panel" aria-labelledby="verification-title">
            <VerificationSeal verifiedAt={event.verifiedAt} size={112} />
            <div>
              <p className="section-index">CGL VERIFICA</p>
              <h2 id="verification-title">Informação verificada</h2>
              <p>Confirmámos data, horário, local, gratuitidade e condições de acesso na fonte identificada.</p>
              <small>Última verificação: {formatVerificationDate(event.verifiedAt)} · Fonte: {event.source}</small>
              <Link href="/verificacao">Conhecer o método de verificação →</Link>
            </div>
          </aside>
        ) : null}

        {event.access52 ? (
          <aside className="event-access52-panel" aria-labelledby="access52-title">
            <Access52Badge variant="full" size={132} />
            <div>
              <p className="section-index">CLASSIFICAÇÃO EDITORIAL CGL · ACESSO 52</p>
              <h2 id="access52-title">52 dias gratuitos, à tua escolha</h2>
              <p>Este equipamento integra o regime que dá a residentes em Portugal 52 dias de entrada gratuita por ano civil, em qualquer dia da semana.</p>
              <p>Apresenta um documento de identificação e o NIF na bilheteira. No mesmo dia podes visitar mais do que um equipamento abrangido.</p>
              <Link href="/acesso-52">Ver condições e equipamentos em Lisboa →</Link>
            </div>
          </aside>
        ) : null}

        <aside className="source-callout">
          <div>
            <strong>Antes de sair</strong>
            <p>A programação pode mudar. Confirma data, hora e condições de acesso na fonte oficial.</p>
          </div>
          <a className="primary-link" href={event.sourceUrl} target="_blank" rel="noopener noreferrer">
            Ver fonte oficial <span aria-hidden="true">↗</span>
          </a>
        </aside>
      </article>
    </main>
  );
}

function formatEventDates(startDate: string, endDate: string | null) {
  const formatter = new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Lisbon" });
  const start = formatter.format(new Date(`${startDate}T12:00:00Z`));
  if (!endDate || endDate === startDate) return start;
  return `${start} — ${formatter.format(new Date(`${endDate}T12:00:00Z`))}`;
}
