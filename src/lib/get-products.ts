import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";
import {
  variantAssets,
  DEFAULT_PRODUCT_IMAGE,
  slugForColor,
  type ProductVariant,
} from "@/lib/products";

/** The columns of `products` the storefront reads. */
interface ProductRow {
  id: string;
  sku: string;
  name: string;
  color: string;
  description: string | null;
  mrp: number | null;
  selling_price: number;
  stock: number | null;
  is_active: boolean;
}

/** Swatch order is the order the SKUs are written in `variantAssets`; rows
 *  with no artwork sort last, alphabetically, rather than disappearing. */
const skuOrder = Object.keys(variantAssets);

function joinAssets(row: ProductRow): ProductVariant {
  const assets = variantAssets[row.sku];
  return {
    id: row.id,
    sku: row.sku,
    // Trimmed: the live rows carry a stray trailing newline in `name`, which
    // leaked into titles and the Product schema.
    name: row.name.trim(),
    color: row.color.trim(),
    description: row.description ?? "",
    price: row.selling_price,
    mrp: row.mrp ?? 0,
    stock: row.stock ?? 0,
    slug: assets?.slug ?? slugForColor(row.color),
    swatch: assets?.swatch ?? "#d9d5d0",
    body: assets?.body ?? "#d9d5d0",
    lightScale: assets?.lightScale ?? 1,
    images: assets?.images ?? [DEFAULT_PRODUCT_IMAGE],
  };
}

/**
 * Every buyable finish, straight from Supabase. Cached for a minute so a
 * page view doesn't cost a round trip - a stock or price edit shows up on
 * the next revalidation.
 */
export const getProducts = unstable_cache(
  async (): Promise<ProductVariant[]> => {
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, sku, name, color, description, mrp, selling_price, stock, is_active",
      )
      .eq("is_active", true);

    if (error) {
      // Never take the page down over this - the panel renders its
      // unavailable state and the rest of the site is unaffected.
      console.error("Failed to load products:", error.message);
      return [];
    }

    return (data as ProductRow[])
      .map(joinAssets)
      .sort((a, b) => {
        const ai = skuOrder.indexOf(a.sku);
        const bi = skuOrder.indexOf(b.sku);
        if (ai !== bi) return (ai < 0 ? Infinity : ai) - (bi < 0 ? Infinity : bi);
        return a.color.localeCompare(b.color);
      });
  },
  ["products"],
  { revalidate: 60, tags: ["products"] },
);
