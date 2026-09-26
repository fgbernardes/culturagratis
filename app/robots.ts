import type { MetadataRoute } from "next";
import { isPrelaunchMode, isPreviewHost } from "./launch-state";
import { SITE_URL } from "./site-config";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  if (await isPreviewHost()) return { rules: { userAgent: "*", allow: "/" } };
  return (await isPrelaunchMode())
    ? { rules: { userAgent: "*", disallow: "/" }, host: SITE_URL }
    : { rules: { userAgent: "*", allow: "/" }, sitemap: `${SITE_URL}/sitemap.xml`, host: SITE_URL };
}
