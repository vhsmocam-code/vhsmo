import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getProducts } from "@/lib/get-products";
import {
  PRODUCT_SLUG,
  productCopy,
  productHref,
  productSlugs,
  type ProductVariant,
} from "@/lib/products";
import { SITE_URL } from "@/lib/site";
import { ProductPageClient } from "@/components/product/ProductPageClient";

// One page per finish plus the product-level page; anything else is a 404.
// Price and stock revalidate on the same minute as getProducts' cache.
export const dynamicParams = false;
export const revalidate = 60;

export function generateStaticParams() {
  return productSlugs.map((slug) => ({ slug }));
}

type Params = Promise<{ slug: string }>;

/**
 * Which finish a slug opens on. The product-level slug takes the first one
 * still in stock (as the homepage does); a finish slug takes that finish
 * even when it's sold out, so the page can offer Notify me. `null` means the
 * finish exists in the artwork map but isn't an active row any more.
 */
function resolve(
  slug: string,
  products: ProductVariant[],
): ProductVariant | null | undefined {
  if (slug === PRODUCT_SLUG) {
    return products.find((p) => p.stock > 0) ?? products[0];
  }
  return products.find((p) => p.slug === slug) ?? null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const products = await getProducts();
  const variant = resolve(slug, products);
  const title = variant ? `VHSMO Camera — ${variant.color}` : "VHSMO Camera";
  const description = `${variant?.description || productCopy.tagline} Screen-free, no filters, photos on your phone in seconds. Free shipping across India.`;
  const image = variant?.images[0];
  const url = `${SITE_URL}/products/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${title} · VHSMO`,
      description,
      siteName: "VHSMO",
      images: image ? [{ url: image.src, alt: image.alt }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · VHSMO`,
      description,
      images: image ? [image.src] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  if (!productSlugs.includes(slug)) notFound();

  const products = await getProducts();
  const variant = resolve(slug, products);

  // A finish that's been switched off in Supabase sends its old links to
  // the product page rather than to a page that can't sell anything. With
  // nothing active at all, render anyway - the panel shows "orders closed".
  if (variant === null && products.length > 0) redirect(productHref());

  const jsonLd = variant && {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${variant.name} — ${variant.color}`,
    description: variant.description || productCopy.tagline,
    sku: variant.sku,
    color: variant.color,
    image: variant.images.map((i) => `${SITE_URL}${i.src}`),
    brand: { "@type": "Brand", name: "VHSMO" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}${productHref(variant)}`,
      priceCurrency: productCopy.currency,
      price: String(variant.price),
      availability:
        variant.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductPageClient initialId={variant?.id} />
    </>
  );
}
