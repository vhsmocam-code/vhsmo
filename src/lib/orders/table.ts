/**
 * The Supabase table that stores website orders. Every route reads and writes
 * through this one constant so the table can be switched in a single place.
 */
export const ORDERS_TABLE = "orders_v2";
