import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  Headphones,
  Instagram,
  ShieldCheck,
  ShoppingBag,
  Youtube,
} from "lucide-react";
import { Scribble } from "@/components/brand/Scribble";
import { RazorpayLogo } from "@/components/checkout/PartnerLogos";
import { LEGAL_DOCS } from "@/lib/legal";
import { RESERVE_HREF } from "@/lib/landing";
import { FooterNewsletter } from "./FooterNewsletter";

/** Link columns - only destinations that actually exist on the site. */
const columns = [
  {
    title: "Shop",
    Icon: ShoppingBag,
    links: [
      { label: "Pre-order Now", href: RESERVE_HREF },
      { label: "International Orders", href: "/international-order" },
    ],
  },
  {
    title: "Explore",
    Icon: Camera,
    links: [
      { label: "Our Story", href: "/#story" },
      { label: "Shot on VHSMO", href: "/#photos" },
    ],
  },
  {
    title: "Support",
    Icon: Headphones,
    links: [
      { label: "Set up your camera", href: "/setup" },
      { label: "FAQ", href: "/#faq" },
      { label: "Contact Us", href: "mailto:team@vhsmo.com" },
    ],
  },
];

/** X glyph - not in lucide, so drawn here. */
function XLogo({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 512 512" className={className} fill="currentColor">
      <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8l164.9-188.5L26.8 48h145.6l100.5 132.9L389.2 48zm-24.8 373.8h39.1L151.1 88h-42l255.3 333.8z" />
    </svg>
  );
}

const socials = [
  { label: "Instagram", href: "https://www.instagram.com/vhsmo.cam_/", Icon: Instagram },
  { label: "YouTube", href: "https://www.youtube.com/@vhsmo", Icon: Youtube },
  { label: "X", href: "https://x.com/vhsmo_cam", Icon: XLogo },
];

/** Official card / rail logos for the "We accept" row (public/payments). */
function PaymentMarks() {
  return (
    <span className="flex items-center gap-4">
      <Image
        src="/payments/visa.svg"
        alt="Visa"
        width={49}
        height={16}
        unoptimized
        className="h-4 w-auto"
      />
      <Image
        src="/payments/mastercard.svg"
        alt="Mastercard"
        width={39}
        height={24}
        unoptimized
        className="h-6 w-auto"
      />
      <Image
        src="/payments/rupay.jpg"
        alt="RuPay"
        width={59}
        height={20}
        unoptimized
        className="h-5 w-auto mix-blend-multiply"
      />
      <Image
        src="/payments/upi.svg"
        alt="UPI"
        width={57}
        height={20}
        unoptimized
        className="h-5 w-auto"
      />
    </span>
  );
}

/**
 * The universal closing frame - brand + socials on the left, the site's real
 * destinations in the middle, the waitlist signup on the right, and a trust
 * bar (Razorpay + payment rails + legal) underneath.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="paper relative overflow-hidden border-t border-darkroom/10">
      <div className="shell relative pt-16 pb-10 sm:pt-20">
        {/* Top zone - brand · links · newsletter */}
        <div className="grid gap-12 lg:grid-cols-[1.25fr_2fr_1.25fr] lg:gap-14">
          {/* Brand */}
          <div>
            <Link
              href="/"
              aria-label="VHSMO home"
              className="font-marker inline-block -rotate-2 text-4xl leading-none text-darkroom transition-transform hover:rotate-0"
            >
              VHSMO
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-darkroom/70">
              Retro photography like never before.
              <br />
              Real moments. No filters.
            </p>
            <ul className="mt-6 flex items-center gap-3">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-darkroom/20 text-darkroom transition-colors hover:border-darkroom/60 hover:bg-darkroom hover:text-kodak"
                  >
                    <Icon aria-hidden className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Link columns */}
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3"
          >
            {columns.map(({ title, Icon, links }) => (
              <div key={title}>
                <Icon
                  aria-hidden
                  strokeWidth={1.7}
                  className="h-5 w-5 text-darkroom"
                />
                <h3 className="eyebrow mt-3 text-darkroom">{title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-darkroom/65 transition-colors hover:text-darkroom"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* Newsletter */}
          <div className="lg:border-l lg:border-darkroom/15 lg:pl-10">
            <h3 className="eyebrow relative inline-block text-darkroom">
              Stay in the loop
              <Scribble className="absolute -bottom-1.5 left-0 h-1.5 w-full" />
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-darkroom/70">
              Updates on drops, stories, and more.
            </p>
            <div className="mt-5">
              <FooterNewsletter />
            </div>
          </div>
        </div>

        {/* Rule */}
        <div className="mt-14 h-px bg-darkroom/15" />

        {/* Trust bar */}
        <div className="flex flex-col items-center gap-5 py-7 text-sm text-darkroom/60 lg:flex-row lg:justify-between">
          <p>© {year} VHSMO. All rights reserved.</p>

          <p className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-darkroom/70" />
            Secure payments powered by
            <RazorpayLogo className="h-4 w-auto" />
          </p>

          <p className="flex items-center gap-3">
            <span className="text-darkroom/50">We accept</span>
            <PaymentMarks />
          </p>
        </div>

        {/* Legal row */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-darkroom/10 pt-6 text-sm text-darkroom/55">
          {LEGAL_DOCS.map((doc, i) => (
            <span key={doc.slug} className="flex items-center gap-3">
              {i > 0 && <span className="text-darkroom/25">·</span>}
              <Link
                href={`/legal/${doc.slug}`}
                className="transition-colors hover:text-darkroom"
              >
                {doc.navLabel ?? doc.title}
              </Link>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
