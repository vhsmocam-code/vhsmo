/**
 * The order ID customers see: the full stored ID with only the leading `order_`
 * removed - no trimming, no case change. Storage, URLs and EasyEcom keep using
 * the full `order_…` form (EasyEcom shows it as `VHSMO-<same id>`).
 * Browser-safe: no Node imports.
 */
export function displayOrderId(id: unknown): string {
  return String(id ?? "")
    .trim()
    .replace(/^order_/i, "");
}
