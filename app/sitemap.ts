import type { MetadataRoute } from "next";
import { absoluteUrl } from "./site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: absoluteUrl("/"), priority: 1, changeFrequency: "weekly" }];
}
