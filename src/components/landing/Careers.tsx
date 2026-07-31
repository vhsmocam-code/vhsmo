"use client";

import Image from "next/image";
import { useState } from "react";
import { User, Mail, Phone, Briefcase, MessageSquare, ChevronDown } from "lucide-react";
import { Reveal } from "@/components/brand/Reveal";
import { Sticker } from "@/components/brand/Sticker";
import { careers } from "@/lib/landing";

const cardClass =
  "group rounded-xl border-2 border-darkroom/12 bg-overexpose px-4 py-2.5 shadow-[0_1px_2px_rgba(31,26,24,0.05)] transition-all duration-200 hover:border-darkroom/25 focus-within:border-bluehour focus-within:shadow-[0_8px_24px_-10px_rgba(16,147,255,0.5)]";
const labelClass =
  "block text-[0.62rem] font-bold uppercase tracking-[0.15em] text-darkroom/45 transition-colors group-focus-within:text-bluehour";
const controlClass =
  // text-base on mobile (16px) stops iOS Safari from auto-zooming on focus;
  // md:text-sm restores the 14px desktop look.
  "w-full bg-transparent text-base md:text-sm text-darkroom outline-none placeholder:text-darkroom/30";
const iconClass =
  "h-4 w-4 shrink-0 text-darkroom/35 transition-colors group-focus-within:text-bluehour";

type FieldProps = {
  name: string;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  type?: string;
  required?: boolean;
};

function Field({ name, label, placeholder, icon, type = "text", required }: FieldProps) {
  return (
    <label className={cardClass + " block cursor-text"}>
      <div className="flex items-center gap-3">
        <span aria-hidden>{icon}</span>
        <span className="min-w-0 flex-1">
          <span className={labelClass}>
            {label}
            {required && <span className="text-bluehour"> *</span>}
          </span>
          <input
            name={name}
            type={type}
            required={required}
            placeholder={placeholder}
            className={controlClass}
          />
        </span>
      </div>
    </label>
  );
}

/**
 * The careers desk - a taped print of the crew on one side, a
 * scrapbook-styled application form on the other, stickers bleeding
 * off every edge. Each field is a card that lights up blue-hour when
 * you land in it: icon, tracked label, and room to type.
 */
export function Careers() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="careers" aria-label="Careers" className="paper relative overflow-hidden py-28 sm:py-40">
      <Sticker
        rotate={-8}
        variant="kodak"
        size="lg"
        className="absolute -left-8 top-8 z-10 hidden sm:inline-block"
      >
        {careers.stickers[0]}
      </Sticker>
      <Sticker
        rotate={6}
        variant="bluehour"
        size="lg"
        className="absolute -right-10 top-24 z-10 hidden sm:inline-block"
      >
        {careers.stickers[1]}
      </Sticker>
      <Sticker
        rotate={5}
        variant="bluehour"
        size="lg"
        className="absolute -left-12 bottom-16 z-10 hidden sm:inline-block"
      >
        {careers.stickers[2]}
      </Sticker>
      <Sticker
        rotate={-4}
        variant="kodak"
        size="lg"
        className="absolute -right-8 bottom-8 z-10 hidden sm:inline-block"
      >
        {careers.stickers[3]}
      </Sticker>

      <div className="container-px relative mx-auto max-w-[80rem]">
        <Reveal className="mx-auto max-w-xl text-center">
          <h2 className="display text-[clamp(2.2rem,5vw,3.5rem)] text-darkroom">
            {careers.headline}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-darkroom/60">
            {careers.body}
          </p>
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-14">
          <Reveal fromRotate={-3} className="mx-auto w-full max-w-sm lg:mx-0">
            <figure className="relative rotate-[-2deg] bg-overexpose p-2 pb-3 shadow-[0.4rem_0.7rem_1.4rem_rgba(31,26,24,0.25)] sm:p-2.5 sm:pb-4">
              <Image
                src={careers.image.src}
                alt={careers.image.alt}
                width={careers.image.width}
                height={careers.image.height}
                sizes="(min-width: 1024px) 32vw, 80vw"
                className="block h-auto w-full"
              />
              <span aria-hidden className="tape -top-3 left-1/2 -translate-x-1/2 -rotate-3" />
            </figure>
          </Reveal>

          <Reveal delay={0.1}>
            {submitted ? (
              <div className="edge-torn flex min-h-[22rem] flex-col items-center justify-center gap-3 bg-overexpose px-8 text-center shadow-[0.3rem_0.5rem_1rem_rgba(31,26,24,0.15)]">
                <p className="font-marker text-2xl text-darkroom">got it :)</p>
                <p className="max-w-xs text-sm text-darkroom/60">
                  Thanks for reaching out - we&apos;ll be in touch if it&apos;s a fit.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="grid gap-3.5">
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <Field
                    name="name"
                    label="Full name"
                    placeholder="Jane Doe"
                    required
                    icon={<User className={iconClass} />}
                  />
                  <Field
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="you@gmail.com"
                    required
                    icon={<Mail className={iconClass} />}
                  />
                </div>

                <Field
                  name="phone"
                  label="Phone number"
                  type="tel"
                  placeholder="Optional"
                  icon={<Phone className={iconClass} />}
                />

                {/* Area of interest - same card, native select */}
                <label className={cardClass + " block cursor-pointer"}>
                  <div className="flex items-center gap-3">
                    <Briefcase className={iconClass} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className={labelClass}>
                        Area of interest<span className="text-bluehour"> *</span>
                      </span>
                      <div className="relative">
                        <select
                          required
                          name="area"
                          defaultValue=""
                          className={controlClass + " cursor-pointer appearance-none pr-6"}
                        >
                          <option value="" disabled>
                            Choose one…
                          </option>
                          {careers.areas.map((area) => (
                            <option key={area} value={area}>
                              {area}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          aria-hidden
                          className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-darkroom/35 transition-colors group-focus-within:text-bluehour"
                        />
                      </div>
                    </span>
                  </div>
                </label>

                {/* Message - taller card, icon pinned to the top line */}
                <label className={cardClass + " block cursor-text"}>
                  <div className="flex items-start gap-3">
                    <MessageSquare className={iconClass + " mt-0.5"} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className={labelClass}>Message</span>
                      <textarea
                        name="message"
                        rows={5}
                        placeholder="Tell us why you want to work with us, any ideas you have, or what you're into…"
                        className={controlClass + " resize-none"}
                      />
                    </span>
                  </div>
                </label>

                <div className="mt-1 flex items-center justify-between gap-4">
                  <p className="text-xs text-darkroom/40">
                    <span className="text-bluehour">*</span> required
                  </p>
                  <button
                    type="submit"
                    className="hover-wiggle inline-flex items-center gap-2 bg-kodak px-6 py-3 text-sm font-bold tracking-tight text-darkroom shadow-[0.15rem_0.25rem_0_rgba(31,26,24,0.3)] transition-transform hover:scale-[1.02]"
                  >
                    {careers.cta}
                    <span aria-hidden>→</span>
                  </button>
                </div>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
