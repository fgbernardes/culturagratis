import type { Metadata } from "next";
import { pageMetadata } from "../site-config";

export const metadata: Metadata = pageMetadata(
  "Agenda cultural gratuita em Lisboa — Cultura Grátis Lisboa",
  "Pesquisa eventos culturais gratuitos em Lisboa por data, categoria e freguesia.",
  "/agenda",
);

export default function AgendaLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
