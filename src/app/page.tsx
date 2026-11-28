import { Hero } from "@/components/landing/Hero";
import { Story } from "@/components/landing/Story";
import { Showcase } from "@/components/landing/Showcase";
import { InstantTransfer } from "@/components/landing/InstantTransfer";
import { ShotOn } from "@/components/landing/ShotOn";
import { Reviews } from "@/components/landing/Reviews";
import { LandingFaq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/landing/FinalCta";
import { Gallery } from "@/components/product/Gallery";
import { ColorProvider } from "@/lib/color-context";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { ProductFeatures } from "@/components/product/ProductFeatures";
import { ProductAccordion } from "@/components/product/ProductAccordion";
import AnalyticsTracker from "@/components/layout/AnalyticsTracker";
import { CouponPopup } from "@/components/promo/CouponPopup";
import { getProducts } from "@/lib/get-products";
import { productCopy } from "@/lib/products";
import { SITE_URL } from "@/lib/site";
import { SHOP_HREF } from "@/lib/landing";



export default async function HomePage() {
  // Live price and stock for the search snippet; each finish's own page
  // carries a per-finish Product schema of its own.
  const products = await getProducts();
  const lead = products.find((p) => p.stock > 0) ?? products[0];
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "VHSMO Pocket Camera",
    description:
      "VHSMO is a screen-free pocket retro camera built to keep you in the moment. No screen. No filters. Just real authentic memories -transferred wirelessly to your phone in seconds, completely offline.",
    brand: { "@type": "Brand", name: "VHSMO" },
    ...(lead && {
      offers: {
        "@type": "Offer",
        availability: products.some((p) => p.stock > 0)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        url: `${SITE_URL}${SHOP_HREF}`,
        priceCurrency: productCopy.currency,
        price: String(lead.price),
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <AnalyticsTracker />
      <Hero />
      <Story />
      {/* <Showcase /> */}
      {/* <InstantTransfer /> */}
      <ShotOn />

      {/* Reserve - the object itself (photos or the 3D model, same stage) +
          price, then the feature strip */}
      <div id="reserve" className="paper scroll-mt-20">
        <section className="shell section">
          {/* The swatches live in the panel but drive the gallery's photos,
              so both columns read the finish from one provider */}
          <ColorProvider>
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                {/* Wrapper bounds the gallery's sticky box so it can't slide
                    over the accordion sharing its column */}
                <div className="relative">
                  <Gallery />
                </div>
                {/* The fine print fills the column's dead space on laptops */}
                <div className="mt-14 hidden lg:block">
                  <ProductAccordion />
                </div>
              </div>
              <PurchasePanel />
            </div>
          </ColorProvider>

          {/* On smaller screens the fine print stays below everything */}
          <div className="mt-16 lg:hidden">
            <ProductAccordion />
          </div>
        </section>
        <ProductFeatures />
      </div>
      <Reviews />

      <LandingFaq />
      <FinalCta />

      {/* Promo popup + side tab — landing page only */}
      <CouponPopup />
    </>
  );
}
