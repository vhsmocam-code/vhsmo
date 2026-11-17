const SRC = "https://checkout.razorpay.com/v1/checkout.js";

let pending: Promise<void> | null = null;

/**
 * Loads Razorpay's checkout script on demand, once. Only the checkout needs
 * it, so other pages no longer download it before they can show anything.
 */
export function loadRazorpay(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as unknown as { Razorpay?: unknown }).Razorpay) return Promise.resolve();
  if (pending) return pending;
  pending = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      pending = null;
      script.remove();
      reject(new Error("Couldn't load Razorpay checkout"));
    };
    document.body.appendChild(script);
  });
  return pending;
}
