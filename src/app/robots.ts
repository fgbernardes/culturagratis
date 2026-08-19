import type { MetadataRoute } from "next";

// O site ainda não foi anunciado publicamente (Teaser 3 por publicar —
// ver CLAUDE.md, secção 2). Bloquear indexação até ao lançamento.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
