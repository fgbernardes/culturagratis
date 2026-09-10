import type { MetadataRoute } from "next";
import { absoluteUrl } from "./site-config";

export const dynamic = "force-dynamic";

// Pré-lançamento: listar apenas URLs indexáveis. Alargar após abertura
// autorizada e validação técnica/editorial, nunca apenas pela data ou contagem.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: absoluteUrl("/"), priority: 1, changeFrequency: "daily" }];
}
