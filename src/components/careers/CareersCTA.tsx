import Link from "next/link";
import { ArrowRight, Mail, Sparkles } from "lucide-react";

interface CareersCTAProps {
  settings?: any;
}

export default function CareersCTA({ settings }: CareersCTAProps = {}) {
  const heading = settings?.ctaHeading || "We're Always Looking for Exceptional Builders";
  const description =
    settings?.ctaDescription ||
    "If you're passionate about engineering modern software, designing intuitive products, or developing intelligent systems, we want to hear from you even if a specific vacancy isn't open.";
  const buttonText = settings?.ctaButtonText || "Submit an Application";
  const email = settings?.ctaEmail || "careers@axivontech.in";

  return (
    <section className="py-16 sm:py-20 bg-[#0B0D10] border-b border-[#1E2530]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#151A21] via-[#10151B] to-[#151A21] border border-[#29313B] p-8 sm:p-14 text-center relative overflow-hidden">
          {/* Subtle accent glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[radial-gradient(circle,rgba(16,185,129,0.06),transparent_70%)]"
          />

          <div className="relative max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Don&apos;t See Your Role?</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold text-[#F3F5F7] tracking-tight">
              {heading}
            </h2>

            <p className="text-sm sm:text-base text-[#A7B0BC] leading-relaxed font-light">
              {description}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <a
                href="#apply-form"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#04130E] font-semibold text-sm transition-colors shadow-lg shadow-[#10B981]/15"
              >
                <span>{buttonText}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={`mailto:${email}?subject=Speculative%20Application%20-%20Axivon%20Careers`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#151A21] hover:bg-[#1B222B] text-[#F3F5F7] font-medium text-sm border border-[#29313B] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#D6B779]" />
                <span>Email Your Resume Directly</span>
              </a>
            </div>

            <p className="text-xs text-[#7E8997] pt-2">
              Reach our recruitment desk directly at{" "}
              <a href={`mailto:${email}`} className="text-[#10B981] hover:underline">
                {email}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
