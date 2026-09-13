export const categories = [
  { slug: "musica", name: "Música", description: "Concertos, recitais, festivais e música no espaço público." },
  { slug: "teatro-e-performance", name: "Teatro e performance", description: "Teatro, circo contemporâneo, monólogos e artes performativas." },
  { slug: "danca", name: "Dança", description: "Dança contemporânea, clássica, tradicional e urbana." },
  { slug: "cinema", name: "Cinema", description: "Sessões ao ar livre, cineclubes, ciclos e mostras." },
  { slug: "exposicoes-e-artes-visuais", name: "Exposições e artes visuais", description: "Galerias, fotografia, instalações, pintura, escultura e arte urbana." },
  { slug: "literatura-e-conversas", name: "Literatura e conversas", description: "Livros, debates, poesia, mesas-redondas e tertúlias." },
  { slug: "museus-e-patrimonio", name: "Museus e património", description: "Museus, monumentos, palácios e dias de entrada livre." },
  { slug: "visitas-guiadas", name: "Visitas guiadas", description: "Percursos comentados, visitas orientadas e descoberta acompanhada de espaços, exposições e património." },
  { slug: "ateliers-e-workshops", name: "Ateliers / Workshops", description: "Oficinas práticas, laboratórios criativos e experiências de aprendizagem participada." },
  { slug: "cultura-comunitaria-e-festivais", name: "Cultura comunitária e festivais", description: "Festas de bairro, celebrações de comunidades, festivais interculturais, feiras culturais e iniciativas locais." },
] as const;

export const accessTypes = [
  "Entrada livre", "Reserva gratuita", "Levantamento gratuito",
  "Entrada gratuita em horário específico", "Por confirmar",
] as const;

export const eventTags = [
  "Ao ar livre", "Para famílias", "Cultura de bairro", "Lotação limitada",
  "Língua Gestual Portuguesa", "Acessível por cadeira de rodas",
] as const;

const categoryNames = new Set<string>(categories.map((item) => item.name));
const accessTypeNames = new Set<string>(accessTypes);
const eventTagNames = new Set<string>(eventTags);

export function isAllowedCategory(value: string) { return categoryNames.has(value); }
export function isAllowedAccessType(value: string) { return accessTypeNames.has(value); }
export function sanitizeEventTags(values: unknown[]) {
  return [...new Set(values.filter((value): value is string => typeof value === "string").map((value) => value.trim()))]
    .filter((value) => eventTagNames.has(value));
}
