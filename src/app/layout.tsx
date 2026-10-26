import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const TITLE = "NOVA Colombia | Tu supertienda online con envíos a todo el país";
const DESCRIPTION =
  "Compra tecnología, hogar, moda y más en NOVA Colombia: 10% de descuento pagando anticipado o contraentrega, envíos a toda Colombia. Descubre, compra, disfruta.";

export const metadata: Metadata = {
  metadataBase: new URL("https://novacolombia.pages.dev"),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "tienda online",
    "Colombia",
    "e-commerce",
    "contraentrega",
    "ofertas",
    "envíos nacionales",
    "descuento pago anticipado",
  ],
  applicationName: "NOVA Colombia",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    siteName: "NOVA Colombia",
    locale: "es_CO",
    type: "website",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NOVA Colombia — supertienda online con envíos a todo el país",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#d93c0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CO" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
