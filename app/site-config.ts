import type { Metadata } from "next";

export const SITE_URL = "https://www.culturagratis.com";
export const SITE_NAME = "Cultura Grátis Lisboa";
export const SITE_DESCRIPTION = "A cultura de Lisboa vive em toda a cidade. Cultura gratuita com mais bairro, mais acesso e mais critério.";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "pt_PT",
      type: "website",
      images: [{ url: "/cgl-logo.png", width: 768, height: 768, alt: "Logótipo do Cultura Grátis Lisboa" }],
    },
    twitter: { card: "summary", title, description, images: ["/cgl-logo.png"] },
  };
}
