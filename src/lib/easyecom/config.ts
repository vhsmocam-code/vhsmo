/** Env-driven switches. Everything defaults to OFF / dry-run. */

const flag = (v: string | undefined, fallback: boolean) =>
  v == null || v.trim() === "" ? fallback : /^(1|true|yes|on)$/i.test(v.trim());

export const easyEcomConfig = () => ({
  /** Master switch: when false the checkout never touches EasyEcom. */
  enabled: flag(process.env.EASYECOM_ENABLED, false),
  /** When true, rows are validated but nothing is sent or written. Safe default. */
  dryRun: flag(process.env.EASYECOM_DRY_RUN, true),
  /** Send the coupon discount as itemDiscount. Off = the exact shape of the 206 orders already accepted. */
  sendDiscount: flag(process.env.EASYECOM_SEND_DISCOUNT, false),
  endpoint:
    process.env.EASYECOM_CREATE_ORDER_URL?.trim() ||
    "https://api.easyecom.io/webhook/v2/createOrder",
  authUrl:
    process.env.EASYECOM_AUTH_URL?.trim() ||
    "https://api.easyecom.io/access/token",
  apiKey: process.env.EASYECOM_API_KEY?.trim() || "",
  email: process.env.EASYECOM_EMAIL?.trim() || "",
  password: process.env.EASYECOM_PASSWORD?.trim() || "",
  locationKey: process.env.EASYECOM_LOCATION_KEY?.trim() || "",
  staticJwt: process.env.EASYECOM_JWT_TOKEN?.trim() || "",
  timeoutMs: Number(process.env.EASYECOM_REQUEST_TIMEOUT_MS) || 15_000,
  alertEmail: process.env.EASYECOM_ALERT_EMAIL?.trim() || "",
});
