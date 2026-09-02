import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redirecionamento — Cultura Grátis Lisboa",
  robots: { index: false, follow: false, noarchive: true },
};

export default function GestaoLegacyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
