import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InternationalOrderForm } from "@/components/international/InternationalOrderForm";

export const metadata: Metadata = {
  title: "Order from outside India",
  description:
    "Checkout currently delivers within India. Ordering from anywhere else? Leave your details and we'll arrange your VHSMO Camera directly.",
  alternates: { canonical: "/international-order" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const cameFromCheckout = from === "checkout";

  return (
    <div className="container-px mx-auto max-w-2xl pt-28 pb-16 sm:pt-32 sm:pb-24">
      <Link
        href={cameFromCheckout ? "/checkout" : "/"}
        className="inline-flex items-center gap-2 text-sm font-semibold text-halide/70 transition-colors hover:text-halide"
      >
        <ArrowLeft className="size-4" />
        {cameFromCheckout ? "Back to checkout" : "Back to home"}
      </Link>
      <p className="eyebrow mt-8 text-halide/55">Worldwide</p>
      <h1 className="display mt-4 text-[clamp(2rem,4.5vw,3.5rem)] text-halide">
        Ordering from
        <br />
        outside India?
      </h1>
      <p className="mt-6 max-w-lg text-halide/70">
        We’ll get back to you if shipping is possible to your country - usually
        within 48 hours.
      </p>
      <div className="mt-10">
        <InternationalOrderForm />
      </div>
    </div>
  );
}
