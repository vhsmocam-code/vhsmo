"use client";

import Link from "next/link";
import { ColorProvider, useColor } from "@/lib/color-context";
import { productHref, PRODUCT_SLUG } from "@/lib/products";
import { Gallery } from "@/components/product/Gallery";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { ProductAccordion } from "@/components/product/ProductAccordion";
import { ProductFeatures } from "@/components/product/ProductFeatures";
import { HowItWorks } from "@/components/product/HowItWorks";
import { Specifications } from "@/components/product/Specifications";
import { WhatsInBox } from "@/components/product/WhatsInBox";
import { StickyBuyBar } from "@/components/product/StickyBuyBar";
import { LandingFaq } from "@/components/landing/Faq";

/** Analytics source for everything bought from this page. */
const SOURCE = "pdp";

/** The product page leaves specs and the box to their own sections, so
 *  the accordion under the gallery only carries the policies. */
const ACCORDION_ITEMS = ["Shipping Policy", "Warranty & Replacements"];

function Breadcrumb() {
  const { variant } = useColor();
  return (
    <nav aria-label="Breadcrumb" className="eyebrow text-darkroom/55">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <li>
          <Link href="/" className="hover:text-bluehour">
            Home
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li>
          <Link href={`/products/${PRODUCT_SLUG}`} className="hover:text-bluehour">
            Shop
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li aria-current="page" className="text-darkroom">
          VHSMO Camera{variant ? ` · ${variant.color}` : ""}
        </li>
      </ol>
    </nav>
  );
}

/**
 * The client half of /products/[slug]: one ColorProvider around the whole
 * page, so the swatches, gallery, box photo and sticky bar all follow the
 * same finish. Picking a swatch rewrites the URL to that finish's page in
 * place - shareable, refresh-safe, and no server round trip.
 */
export function ProductPageClient({ initialId }: { initialId?: string }) {
  return (
    <ColorProvider
      initialId={initialId}
      onChange={(v) => {
        window.history.replaceState(null, "", productHref(v));
        // Keep the tab title in step with the URL (matches generateMetadata)
        document.title = `VHSMO Camera — ${v.color} · VHSMO`;
      }}
    >
      <div className="paper">
        {/* Top padding clears the fixed header, as on the other inner pages */}
        <section className="shell pt-24 pb-16 sm:pt-28 lg:pb-24">
          <Breadcrumb />
          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              {/* Bounds the gallery's sticky box so it can't slide over the
                  accordion sharing its column */}
              <div className="relative">
                <Gallery />
              </div>
              <div className="mt-14 hidden lg:block">
                <ProductAccordion only={ACCORDION_ITEMS} />
              </div>
            </div>
            <PurchasePanel source={SOURCE} specsHref="#specs" />
          </div>
          <div className="mt-16 lg:hidden">
            <ProductAccordion only={ACCORDION_ITEMS} />
          </div>
        </section>
      </div>

      <ProductFeatures />
      <HowItWorks />
      <Specifications />
      <WhatsInBox />
      <LandingFaq />

      <StickyBuyBar source={SOURCE} />
    </ColorProvider>
  );
}
