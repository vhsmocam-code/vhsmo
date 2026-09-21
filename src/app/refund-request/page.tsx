import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund requests closed",
  description: "Refund requests for VHSMO pre-orders are currently closed.",
  // Linked directly from the emails we send affected customers - it should
  // never surface in search.
  robots: { index: false, follow: false },
};

/**
 * /refund-request - the former refund request page. Refund submissions are
 * intentionally closed here; the API route is closed separately as well so a
 * direct request cannot bypass this notice.
 */
export default function Page() {
  return (
    <div className="container-px mx-auto max-w-2xl pt-24 pb-16 sm:pt-28 sm:pb-24">
      <p className="eyebrow text-halide/55">Pre-orders</p>
      <h1 className="display mt-4 text-[clamp(2rem,4.5vw,3.5rem)] text-halide">
        Refund requests
        <br />
        closed
      </h1>

      <div
        role="status"
        className="mt-8 rounded-2xl border-2 border-kodak/40 bg-kodak/10 p-6 sm:p-8"
      >
        <p className="eyebrow text-kodak">Form closed</p>
        <h2 className="font-marker mt-3 text-3xl text-halide">
          We&apos;re no longer accepting refund requests.
        </h2>
        <p className="mt-4 text-halide/75">
          This refund form is currently closed and can&apos;t accept new
          submissions. Please keep an eye on your email for any updates about
          your order.
        </p>
      </div>
    </div>
  );
}
