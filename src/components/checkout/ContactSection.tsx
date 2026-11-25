import { useRef } from "react";
import { AlertCircle, CheckCircle2, Loader2, Mail, XCircle } from "lucide-react";
import type { CheckoutErrors, CheckoutField } from "@/lib/checkout-validation";
import { EmailVerifyPanel } from "./EmailVerifyPanel";
import type { EmailVerification } from "./useEmailVerification";
import { PhoneField } from "./PhoneField";
import { SectionHeader } from "./SectionHeader";
import { cardClass, controlClass, iconClass, labelClass } from "./styles";

type ContactSectionProps = {
  email: string;
  onEmailChange: (value: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  errors: CheckoutErrors;
  onBlurField: (field: CheckoutField) => void;
  /** Email ownership state - the same step for online and COD orders. */
  verification: EmailVerification;
};

export function ContactSection({
  email,
  onEmailChange,
  phone,
  onPhoneChange,
  errors,
  onBlurField,
  verification,
}: ContactSectionProps) {
  const emailError = errors.email;
  const emailInvalid = Boolean(emailError);
  const emailInput = useRef<HTMLInputElement>(null);

  const { status, formatOk, isVerified } = verification;
  const inCodeFlow = status === "sending" || status === "sent" || status === "verifying";
  const canAsk = formatOk && !isVerified && !inCodeFlow && !emailInvalid;

  return (
    <section>
      <SectionHeader
        title="Contact information"
        subtitle="We'll verify your email, then send your order confirmation here."
      />
      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] items-start gap-3.5 sm:grid-cols-2">
        <div>
          <label
            className={
              cardClass +
              " block cursor-text " +
              (emailInvalid
                ? "!border-red-400/70 focus-within:!border-red-500 focus-within:!shadow-[0_8px_24px_-10px_rgba(239,68,68,0.45)]"
                : "")
            }
          >
            <div className="flex items-center gap-3">
              <span aria-hidden>
                <Mail className={iconClass} />
              </span>
              <span className="min-w-0 flex-1">
                <span className={labelClass}>
                  Email
                  <span className="text-bluehour"> *</span>
                </span>
                <input
                  ref={emailInput}
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  onBlur={() => onBlurField("email")}
                  placeholder="you@gmail.com"
                  autoComplete="email"
                  inputMode="email"
                  maxLength={254}
                  aria-invalid={emailInvalid}
                  className={controlClass}
                />
              </span>
              <span className="flex shrink-0 items-center justify-center">
                {isVerified ? (
                  <span className="status-pop flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="size-4" />
                    <span className="hidden sm:inline">Verified</span>
                  </span>
                ) : status === "sending" ? (
                  <Loader2 className="size-4 animate-spin text-bluehour" />
                ) : canAsk ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      void verification.send();
                    }}
                    className="rounded-full bg-bluehour px-3 py-1 text-xs font-bold text-overexpose transition-shadow hover:shadow-[0_0_0_4px_rgba(16,147,255,0.22)]"
                  >
                    Verify
                  </button>
                ) : emailInvalid ? (
                  <XCircle key="no" className="status-pop h-4 w-4 text-red-500" />
                ) : null}
              </span>
            </div>
          </label>

          {emailError ? (
            <p className="status-rise mt-1.5 flex items-center gap-1 pl-1 text-xs font-semibold text-red-500">
              <AlertCircle className="size-3.5 shrink-0" />
              {emailError}
            </p>
          ) : isVerified ? (
            <p className="status-rise mt-1.5 flex items-center gap-1 pl-1 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="size-3.5 shrink-0" />
              Email verified. Your confirmation will arrive here.
            </p>
          ) : verification.notice && !inCodeFlow ? (
            <p role="status" className="status-rise mt-1.5 flex items-center gap-1 pl-1 text-xs font-semibold text-amber-700">
              <AlertCircle className="size-3.5 shrink-0" />
              {verification.notice}
            </p>
          ) : canAsk ? (
            <p className="mt-1.5 pl-1 text-xs text-darkroom/55">
              We&apos;ll email a 6-digit code to confirm it&apos;s yours.
            </p>
          ) : null}
          {!emailError && !isVerified && !inCodeFlow && verification.error && (
            <p role="alert" className="status-rise mt-1.5 pl-1 text-xs font-semibold text-red-600">
              {verification.error}
            </p>
          )}
        </div>

        <PhoneField
          phone={phone}
          onPhoneChange={onPhoneChange}
          error={errors.phone}
          onBlur={() => onBlurField("phone")}
        />

        {inCodeFlow && (
          <div className="sm:col-span-2">
            <EmailVerifyPanel
              email={email}
              status={status}
              error={verification.error}
              notice={verification.notice}
              resendIn={verification.resendIn}
              onSubmit={verification.verify}
              onResend={() => void verification.send()}
              onEdit={() => {
                verification.cancel();
                emailInput.current?.focus();
                emailInput.current?.select();
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
