/**
 * Validation rules for the /refund-request form, shared by the client form and
 * the API route so the two can never drift apart. Mirrors the shape of
 * `checkout-validation.ts`: one function per field, returning an error string
 * or undefined.
 *
 * A refund request is irreversible and processed by hand, so the rules lean
 * towards catching typos (a payment id pasted instead of an order id, a
 * mistyped domain) rather than towards being clever. Anything that would reject
 * a plausible real customer is deliberately left out.
 */

export type RefundField = "orderId" | "name" | "email";

export type RefundValues = {
  orderId: string;
  name: string;
  email: string;
};

/** Partial map of field → error message. Absent key = valid. */
export type RefundErrors = Partial<Record<RefundField, string>>;

/**
 * Razorpay order ids are `order_` + 14 alphanumerics. We accept 10-20 so a
 * future id-length change doesn't lock anyone out, but the prefix is exact -
 * it's what separates an order id from the payment id (`pay_`) and the invoice
 * number, which is the single most common mistake on this form.
 */
const ORDER_ID_RE = /^order_[A-Za-z0-9]{10,20}$/;

/** Prefixes people paste by mistake, mapped to what they actually pasted. */
const WRONG_PREFIXES: Record<string, string> = {
  pay_: "That's your Payment ID",
  rfnd_: "That's a Refund ID",
  inv_: "That's your Invoice Number",
  plink_: "That's a Payment Link ID",
};

/**
 * Deliberately stricter than the loose `x@y.z` check used elsewhere: the refund
 * confirmation is the only way a customer hears back, so a bad address means a
 * silent failure. Requires a sane local part, a dotted domain and a 2+ letter
 * TLD, and rejects the leading/trailing/doubled dots that typos produce.
 */
const EMAIL_RE =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

/** A name has to contain at least one letter - "123" and "..." are not names. */
const NAME_RE = /^[\p{L}][\p{L}\p{M} .'-]*$/u;

export function validateOrderId(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Order ID is required.";

  const lower = v.toLowerCase();
  for (const [prefix, what] of Object.entries(WRONG_PREFIXES)) {
    if (lower.startsWith(prefix)) {
      return `${what}, not your Order ID. Look for the ID starting with "order_".`;
    }
  }

  if (!lower.startsWith("order_")) {
    return 'Order IDs start with "order_" - check your confirmation email.';
  }

  if (/\s/.test(v)) return "Order ID shouldn't contain spaces.";

  if (!ORDER_ID_RE.test(v)) {
    return "That doesn't look like a complete Order ID - copy the whole thing.";
  }

  return undefined;
}

export function validateName(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Name is required.";
  if (v.length < 2) return "Name looks too short.";
  if (v.length > 80) return "Name looks too long - use the name on the order.";
  if (!NAME_RE.test(v)) return "Name has invalid characters.";
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Email is required.";
  // 254 is the RFC 5321 ceiling for a whole address.
  if (v.length > 254) return "Email is too long.";
  if (v.includes("..")) return "Email has a double dot.";
  if (!EMAIL_RE.test(v)) return "Enter a valid email address.";
  return undefined;
}

/** Validate a single field. Returns an error string, or undefined when valid. */
export function validateRefundField(
  field: RefundField,
  values: RefundValues,
): string | undefined {
  switch (field) {
    case "orderId":
      return validateOrderId(values.orderId);
    case "name":
      return validateName(values.name);
    case "email":
      return validateEmail(values.email);
    default:
      return undefined;
  }
}

/** Every field the form requires, in display order. */
export const REFUND_FIELDS: RefundField[] = ["orderId", "name", "email"];

/** Validate the whole form. Returns a map of only the fields with errors. */
export function validateRefundRequest(values: RefundValues): RefundErrors {
  const errors: RefundErrors = {};
  for (const field of REFUND_FIELDS) {
    const err = validateRefundField(field, values);
    if (err) errors[field] = err;
  }
  return errors;
}

/** Longest note we'll store - matches the textarea's maxLength. */
export const NOTES_MAX = 600;
