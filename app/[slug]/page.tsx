import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicFooter, PublicHeader } from "../components/public-chrome";
import SubmissionForm from "../components/submission-form";
import { editorialPages, getEditorialPage } from "../site-content";
import { pageMetadata } from "../site-config";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return editorialPages.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = getEditorialPage((await params).slug);
  if (!page) return {};
  return pageMetadata(`${page.title} | Cultura Grátis Lisboa`, page.intro, `/${page.slug}`);
}

export default async function EditorialPageRoute({ params }: PageProps) {
  const page = getEditorialPage((await params).slug);
  if (!page) notFound();
  const isLaunchPrivacyPage = page.slug === "privacidade";

  return (
    <main className="editorial-shell">
      <a className="skip-link" href="#conteudo">Saltar para o conteúdo</a>
      {isLaunchPrivacyPage ? (
        <header className="privacy-launch-header">
          <Link className="public-brand" href="/" aria-label="Cultura Grátis Lisboa, início">
            <img src="/cgl-emblem.png" alt="" width="58" height="58" />
            <span><strong>Cultura Grátis</strong><small>Lisboa</small></span>
          </Link>
        </header>
      ) : <PublicHeader />}
      <article id="conteudo">
        <header className="editorial-page-hero">
          <p>{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <span>{page.intro}</span>
          {page.updated ? <small>{page.updated}</small> : null}
        </header>
        <div className="editorial-page-body">
          {page.sections.map((section, index) => (
            <section key={section.title}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2>{section.title}</h2>
                {section.body?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.bullets ? <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul> : null}
              </div>
            </section>
          ))}
          {page.actions?.length ? (
            <div className="editorial-actions">
              {page.actions.map((action) => (
                <Link className={action.primary ? "primary" : "secondary"} href={action.href} key={action.label}>{action.label}</Link>
              ))}
            </div>
          ) : null}
          {page.slug === "submeter-evento" ? <SubmissionForm kind="event" /> : null}
          {page.slug === "corrigir-informacao" ? <SubmissionForm kind="correction" /> : null}
        </div>
      </article>
      {isLaunchPrivacyPage ? null : <PublicFooter />}
    </main>
  );
}
