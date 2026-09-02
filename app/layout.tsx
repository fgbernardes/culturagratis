import type { Metadata, Viewport } from "next";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./site-config";
import "@fontsource-variable/inter";
import "@fontsource-variable/bricolage-grotesque";
import "./globals.css";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  category: "Cultura",
  keywords: ["cultura grátis Lisboa", "eventos gratuitos Lisboa", "agenda cultural Lisboa", "entrada livre Lisboa"],
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "pt_PT",
    type: "website",
    images: [{ url: "/api/partilha-cgl-20260902.jpg", width: 1200, height: 630, type: "image/jpeg", alt: "Cultura Grátis Lisboa — A cultura vive em toda a cidade." }, { url: "/cgl-logo.png", width: 768, height: 768, alt: "Logótipo do Cultura Grátis Lisboa" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/api/partilha-cgl-20260902.jpg"],
  },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png", sizes: "128x128" }],
    shortcut: "/favicon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: absoluteUrl("/cgl-logo.png"),
        email: "ola@culturagratis.com",
        areaServed: { "@type": "City", name: "Lisboa" },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "pt-PT",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <html lang="pt-PT">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
        {children}
      </body>
    </html>
  );
}
