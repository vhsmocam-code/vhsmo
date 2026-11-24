/** Browser-safe display helpers (no Node imports, so the checkout UI can use them). */

/** `john.doe@gmail.com` → `j•••@gmail.com` */
export function maskEmail(value: string): string {
  const e = String(value ?? "").trim().toLowerCase();
  const at = e.lastIndexOf("@");
  if (at < 1) return e;
  return `${e[0]}•••${e.slice(at)}`;
}
