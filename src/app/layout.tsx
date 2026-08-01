import type { Metadata, Viewport } from "next";
import { Inter_Tight } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { FilmGrain } from "@/components/brand/FilmGrain";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { CartDrawer } from "@/components/cart/CartDrawer";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

import { getProducts } from "@/lib/get-products";
import { ProductsProvider } from "@/lib/products-context";
import { SITE_URL } from "@/lib/site";
/*
 * Brand faces are Sequel Sans (display/body) and Kids Word (marker).
 * Sequel is commercial - Inter Tight is the closest free stand-in. Kids
 * Word is the licensed brand marker face, loaded locally.
 */
const sequel = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sequel",
  display: "swap",
});

const kids = localFont({
  src: "./fonts/KidsWord.otf",
  variable: "--font-kids",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VHSMO - Point. Shoot. Share.",
    template: "%s · VHSMO",
  },
  description:
    "VHSMO is a screen-free pocket retro camera built to keep you in the moment. No screen. No filters. Just real authentic memories -transferred wirelessly to your phone in seconds, completely offline.",
  keywords: [
    "VHSMO",
    "retro digital camera",
    "pocket camera",
    "y2k camera",
    "digicam",
    "point and shoot",
  ],
  authors: [{ name: "VHSMO" }],
  // favicon.ico is auto-emitted from app/favicon.ico (file convention); we
  // add the hi-res PNG for contexts that prefer it. apple-icon.png is likewise
  // auto-detected, declared here for clarity.
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }],
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "VHSMO - Point. Shoot. Share.",
    description:
      "VHSMO is a screen-free pocket retro camera built to keep you in the moment. No screen. No filters. Just real authentic memories -transferred wirelessly to your phone in seconds, completely offline.",
    siteName: "VHSMO",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 900,
        alt: "The VHSMO pocket camera",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VHSMO - Point. Shoot. Share.",
    description:
      "VHSMO is a screen-free pocket retro camera built to keep you in the moment. No screen. No filters. Just real authentic memories -transferred wirelessly to your phone in seconds, completely offline.",
    images: ["/og-image.jpg"],
  },
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#2A2422",
  colorScheme: "light",
};

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "VHSMO Pocket Camera",
  description:
    "VHSMO is a screen-free pocket retro camera built to keep you in the moment. No screen. No filters. Just real authentic memories -transferred wirelessly to your phone in seconds, completely offline.",
  brand: { "@type": "Brand", name: "VHSMO" },
  offers: {
    "@type": "Offer",
    availability: "https://schema.org/PreOrder",
    url: `${SITE_URL}/product`,
    priceCurrency: "INR",
    price: "4999",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Name, colour, price and stock all come from Supabase - fetched once here
  // and handed to every client component that sells the camera.
  const products = await getProducts();

  return (
    <html lang="en" className={`${sequel.variable} ${kids.variable}`}>
      <body className="min-h-dvh antialiased">
    
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
        <ProductsProvider products={products}>
        <CartProvider>
          {/* <SmoothScroll /> */}
          <Analytics />

          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-kodak focus:px-5 focus:py-2 focus:text-sm focus:font-semibold focus:text-darkroom"
          >
            Skip to content
          </a>
          <SiteChrome>{children}</SiteChrome>
          <CartDrawer />
          <FilmGrain />
        </CartProvider>
        </ProductsProvider>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
