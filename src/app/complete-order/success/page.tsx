import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Home } from "lucide-react";

/**
 * /complete-order/success - shown after a recovery submission succeeds. Static
 * sibling of the [token] route (Next.js matches the literal "success" segment
 * before the dynamic one, so there's no collision).
 *
 * The recovery form redirects here with `?order=<razorpay_order_id>` so we can
 * offer a "View order" link into the normal order-view page. It's optional -
 * the page still renders fine without it.
 */

export const metadata: Metadata = {
  title: "Order details received",
  robots: { index: false, follow: false },
};

export default async function RecoverySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="container-px mx-auto flex max-w-2xl flex-col items-center pt-32 pb-24 text-center sm:pt-40">
      <span className="flex size-16 items-center justify-center rounded-full bg-bluehour text-halide">
        <Check className="size-8" aria-hidden />
      </span>

      <h1 className="display mt-8 text-[clamp(2rem,4.5vw,3.25rem)] text-halide">
        Thank you!
      </h1>

      <p className="mt-6 max-w-md text-halide/75">
        We&apos;ve received your shipping details successfully. Your order is now
        ready for processing.
      </p>

      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        {order && (
          <Link
            href={`/checkout/success?order=${encodeURIComponent(order)}`}
            className="inline-flex items-center gap-2 rounded-full bg-bluehour px-6 py-3 text-sm font-bold text-halide transition-colors hover:bg-kodak hover:text-darkroom"
          >
            View order
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-kodak px-6 py-3 text-sm font-bold text-darkroom transition-colors hover:bg-bluehour hover:text-halide"
        >
          <Home className="size-4" aria-hidden />
          Back to home
        </Link>
      </div>
    </div>
  );
}
