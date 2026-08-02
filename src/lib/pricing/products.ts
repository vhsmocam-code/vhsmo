import { supabase } from "@/lib/supabase";

/** The authoritative, backend-owned price for a single product. */
export interface ProductPrice {
  id: string;
  name: string;
  variant: string;
  price: number;
  stock: number | null;
}

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Loads the real selling price for each product id straight from Supabase.
 * The frontend never gets a say in price - this is the single source of truth
 * the order total is built from. Unknown or malformed ids are simply absent
 * from the returned map, so callers can reject them.
 *
 * Structured to price a whole cart in one query: today there is one product,
 * but adding more needs no change here.
 */
export async function loadProductPrices(
  ids: string[],
): Promise<Map<string, ProductPrice>> {
  const validIds = [...new Set(ids.filter((id) => UUID.test(id ?? "")))];
  if (validIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, color, selling_price, stock")
    .in("id", validIds);

  if (error) {
    throw new Error(`Failed to load product pricing: ${error.message}`);
  }

  return new Map(
    (data ?? []).map((row) => [
      row.id as string,
      {
        id: row.id as string,
        name: (row.name ?? "").trim(),
        variant: row.color ?? "",
        price: row.selling_price as number,
        stock: row.stock ?? null,
      },
    ]),
  );
}
