import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestão editorial — Cultura Grátis Lisboa",
  robots: { index: false, follow: false, noarchive: true },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
