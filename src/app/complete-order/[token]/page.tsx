import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { RecoveryForm } from "@/components/recovery/RecoveryForm";

/**
 * /complete-order/[token] - the one-time order-recovery page (see
 * src/lib/recovery.ts). A server component: it looks the token up in
 * `incomplete_orders`, 404s on an unknown token, shows a used-up message when
 * the link has already been redeemed, and otherwise renders the form. Only the
 * token and email ever reach the client - the Razorpay ids and amount stay on
 * the server.
 */

export const metadata: Metadata = {
  title: "Complete your order",
  robots: { index: false, follow: false },
};

// Always hit the DB - a stale cached "not yet completed" state must never let a
// link be redeemed twice.
export const dynamic = "force-dynamic";

export default async function CompleteOrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const { data: recovery, error } = await supabase
    .from("incomplete_orders")
    .select("recovery_token, email, completed, razorpay_order_id")
    .eq("recovery_token", token)
    .maybeSingle();

  // Unknown or invalid token -> 404.
  if (error || !recovery) {
    notFound();
  }

  return (
    <div className="container-px mx-auto max-w-2xl pt-28 pb-16 sm:pt-32 sm:pb-24">
      <p className="eyebrow text-halide/55">Order recovery</p>
      <h1 className="display mt-4 text-[clamp(2rem,4.5vw,3.25rem)] text-halide">
        {recovery.completed ? "All done here" : "Complete your order"}
      </h1>

      {recovery.completed ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl bg-halide p-8 text-center sm:p-10">
          <p className="text-lg font-bold text-darkroom">
            This recovery link has already been used.
          </p>
          <p className="mt-2 max-w-md text-sm text-darkroom/60">
            We&apos;ve already got your shipping details — there&apos;s nothing
            more to do. If that doesn&apos;t sound right, reply to your payment
            email and we&apos;ll help.
          </p>
          <Link
            href={`/checkout/success?order=${encodeURIComponent(
              recovery.razorpay_order_id,
            )}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-bluehour px-6 py-3 text-sm font-bold text-halide transition-colors hover:bg-kodak hover:text-darkroom"
          >
            View order
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-6 max-w-lg text-halide/70">
            Your payment came through, but we&apos;re missing your shipping
            details. Fill these in and your order&apos;s on its way.
          </p>
          <div className="mt-10">
            <RecoveryForm
              data={{ token: recovery.recovery_token, email: recovery.email }}
            />
          </div>
        </>
      )}
    </div>
  );
}
