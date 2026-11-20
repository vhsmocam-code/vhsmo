import type { Metadata } from "next";
import { TrackOrderForm } from "@/components/track/TrackOrderForm";

export const metadata: Metadata = {
  title: "Track your order",
  description:
    "Track your VHSMO order with your order ID or the phone number you ordered with.",
};

/**
 * /track-order - customers enter an order ID or phone number, we look up the
 * AWB in `order_tracking` and open WareIQ's live tracking page.
 */
export default function Page() {
  return (
    <div className="container-px mx-auto max-w-4xl pt-24 pb-16 sm:pt-28 sm:pb-24">
      <p className="eyebrow text-halide/55">Orders</p>
      <h1 className="display mt-4 text-[clamp(2rem,4.5vw,3.5rem)] text-halide">
        Track your
        <br />
        order
      </h1>
      <p className="mt-6 text-halide/70">
        Enter your order ID or the phone number on your order to see where
        your VHSMO is right now. Orders ship within 48-72 hours and usually arrive in
        2-7 business days.
      </p>

      <div className="mt-10">
        <TrackOrderForm />
      </div>

      <p className="mt-8 text-sm text-halide/55">
        Can&apos;t find your order?{" "}
        <a
          href="mailto:team@vhsmo.com"
          className="font-semibold text-halide underline underline-offset-4 hover:text-kodak"
        >
          team@vhsmo.com
        </a>
      </p>
    </div>
  );
}
