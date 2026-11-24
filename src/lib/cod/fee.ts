/**
 * Browser-safe COD constants for the checkout UI. The server's source of truth
 * is `COD_FEE` in ./core.ts (which uses node:crypto); a unit test keeps the two
 * equal. Display only - the charged amount is always computed server-side.
 */
export const COD_FEE_DISPLAY = 100;
export const COD_MAX_UNITS_DISPLAY = 3;
