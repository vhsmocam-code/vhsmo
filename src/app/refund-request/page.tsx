import type { Metadata } from "next";
import { RefundRequestForm } from "@/components/refund/RefundRequestForm";

export const metadata: Metadata = {
  title: "Refund request",
  description:
    "Request a refund on your VHSMO pre-order. Submitted requests are final and cannot be reversed.",
  // Linked directly from the emails we send affected customers - it should
  // never surface in search.
  robots: { index: false, follow: false },
};

/**
 * /refund-request - the on-site replacement for the Google Form we were
 * sending pre-order customers during the shipping delay. Same four questions,
 * in our own brand, with rows landing in Supabase instead of a spreadsheet.
 */
export default function Page() {
  return (
    <div className="container-px mx-auto max-w-2xl pt-24 pb-16 sm:pt-28 sm:pb-24">
      <p className="eyebrow text-halide/55">Pre-orders</p>
      <h1 className="display mt-4 text-[clamp(2rem,4.5vw,3.5rem)] text-halide">
        Refund
        <br />
        request
      </h1>

      <div className="mt-6 flex flex-col gap-4 text-halide/70">
        <p>
          We&apos;re genuinely sorry that the delay has brought you to this
          point, and we completely understand if you no longer wish to wait.
        </p>
        <p>
          We&apos;re still doing everything we can from our side to move VHSMO
          through the remaining process and get it into customers&apos; hands as
          soon as possible. But we also made a commitment to give you the
          choice, and we want to honour that.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border-2 border-kodak/40 bg-kodak/10 p-5">
        <p className="text-sm leading-relaxed text-halide/80">
          <span className="font-bold text-kodak">Please note:</span> once this
          form is submitted, the request is treated as{" "}
          <span className="font-bold text-halide">
            final and cannot be reversed
          </span>
          . Your order will be cancelled, and any pre-order benefits attached to
          that order will no longer apply.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-4 text-halide/70">
        <p>
          Once VHSMO is officially live with ready inventory, we&apos;ll send
          you an email to let you know. If you&apos;re still interested at that
          point, you&apos;ll be more than welcome to place a new order then.
        </p>
        <p>
          Whether you choose to wait or request a refund, we genuinely
          appreciate the trust you placed in us by being one of our earliest
          customers. We&apos;re sorry we couldn&apos;t meet the original
          timeline, and we&apos;re grateful you gave VHSMO a chance in the first
          place.
        </p>
        <p className="font-marker text-2xl text-kodak">
          Thank you for being part of the journey.
        </p>
      </div>

      <div className="mt-10">
        <RefundRequestForm />
      </div>
    </div>
  );
}
