import type { Metadata } from "next";
import { RefundRequestForm } from "@/components/refund/RefundRequestForm";
import { REFUND_REQUESTS_OPEN } from "@/lib/refund-status";

export const metadata: Metadata = {
  title: "Refund request",
  description: "The VHSMO pre-order refund request window is now closed.",
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
      {REFUND_REQUESTS_OPEN ? (
        <div className="mt-8">
          <RefundRequestForm />
        </div>
      ) : (
        <div className="mt-8 rounded-2xl bg-halide p-6 sm:p-8">
          <h2 className="font-marker text-3xl text-darkroom">
            Refund requests are closed
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-darkroom/65">
            We&apos;re no longer accepting new refund requests through this
            form. If you need help with an existing order or refund, please
            contact us at{" "}
            <a
              href="mailto:team@vhsmo.com"
              className="font-semibold text-bluehour underline underline-offset-2"
            >
              team@vhsmo.com
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}
