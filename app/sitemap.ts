import type { MetadataRoute } from "next";
import { isPrelaunchMode } from "./launch-state";
import { absoluteUrl } from "./site-config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (await isPrelaunchMode()) return [{ url: absoluteUrl("/"), priority: 1, changeFrequency: "weekly" }];
  return [
    { url: absoluteUrl("/"), priority: 1, changeFrequency: "daily" },
    { url: absoluteUrl("/agenda"), priority: 0.9, changeFrequency: "daily" },
    { url: absoluteUrl("/categorias"), priority: 0.7, changeFrequency: "weekly" },
    { url: absoluteUrl("/freguesias"), priority: 0.7, changeFrequency: "weekly" },
    { url: absoluteUrl("/sobre"), priority: 0.6, changeFrequency: "monthly" },
    { url: absoluteUrl("/noticias"), priority: 0.5, changeFrequency: "weekly" },
    { url: absoluteUrl("/coletividades"), priority: 0.5, changeFrequency: "monthly" },
    { url: absoluteUrl("/apoia"), priority: 0.4, changeFrequency: "monthly" },
    { url: absoluteUrl("/acesso-52"), priority: 0.6, changeFrequency: "monthly" },
    { url: absoluteUrl("/privacidade"), priority: 0.3, changeFrequency: "yearly" },
  ];
}
