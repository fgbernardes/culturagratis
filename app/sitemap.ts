import type { MetadataRoute } from "next";
import { listPublishedEvents } from "../db/events";
import { editorialPages } from "./site-content";
import { absoluteUrl } from "./site-config";

export const dynamic = "force-dynamic";

const mainPages = [
  { path: "/", priority: 1, changeFrequency: "daily" as const },
  { path: "/agenda", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/categorias", priority: 0.75, changeFrequency: "monthly" as const },
  { path: "/freguesias", priority: 0.75, changeFrequency: "monthly" as const },
  { path: "/acesso-52", priority: 0.8, changeFrequency: "monthly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    ...mainPages.map((page) => ({ url: absoluteUrl(page.path), priority: page.priority, changeFrequency: page.changeFrequency })),
    ...editorialPages.map((page) => ({ url: absoluteUrl(`/${page.slug}`), priority: page.slug === "sobre" ? 0.7 : 0.45, changeFrequency: "monthly" as const })),
  ];

  try {
    const events = await listPublishedEvents();
    return [
      ...staticEntries,
      ...events.map((event) => ({
        url: absoluteUrl(`/eventos/${event.slug}`),
        lastModified: normalizeTimestamp(event.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return staticEntries;
  }
}

function normalizeTimestamp(value: string) {
  return value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
}
