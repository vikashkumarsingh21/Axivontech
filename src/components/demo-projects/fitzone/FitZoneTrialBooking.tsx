"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Dumbbell,
  Ticket,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface FitZoneTrialBookingProps {
  initialProgramPreference?: string;
}

export default function FitZoneTrialBooking({
  initialProgramPreference = "",
}: FitZoneTrialBookingProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [discipline, setDiscipline] = useState("IronForge™ Hypertrophy");
  const [preferredDate, setPreferredDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("Morning (06:00 AM – 11:00 AM)");
  const [experienceNote, setExperienceNote] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedPass, setConfirmedPass] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync initial preference if passed via props
  useEffect(() => {
    if (initialProgramPreference) {
      setDiscipline(initialProgramPreference);
      setExperienceNote(`Interested in: ${initialProgramPreference}`);
    }
  }, [initialProgramPreference]);

  // Set default tomorrow date
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    setPreferredDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = "Please enter your full legal name.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!phone.trim() || phone.trim().length < 7) {
      errs.phone = "Please enter a valid phone number.";
    }
    if (!preferredDate) {
      errs.preferredDate = "Please choose a preferred trial date.";
    }
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Simulate instant VIP pass generation
    setTimeout(() => {
      const generatedCode = `FIT-VIP-${Math.floor(100000 + Math.random() * 900000)}`;
      setConfirmedPass(generatedCode);
      setIsSubmitting(false);
    }, 700);
  };

  const handleCopyCode = () => {
    if (!confirmedPass) return;
    navigator.clipboard.writeText(confirmedPass);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setConfirmedPass(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setExperienceNote("");
  };

  return (
    <section
      id="trial"
      className="relative w-full border-t border-[#2B3137] bg-[#0B0D0F] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7138]/30 bg-[#FF7138]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#FF7138] mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Complimentary VIP Experience</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F6F4F0] leading-tight">
              EXPERIENCE FITZONE. <br />
              <span className="text-[#FF7138]">CLAIM YOUR 1-DAY PASS.</span>
            </h2>

            <p className="mt-4 text-sm sm:text-base text-[#B5BBC2] max-w-2xl mx-auto leading-relaxed">
              No pushy sales calls. Step onto the Eleiko lifting platforms, join
              a VelocityX™ sprint class, and test the 38°F recovery plunges
              with zero commitment.
            </p>
          </div>

          {/* Card Wrapper */}
          <div className="rounded-3xl border border-[#2B3137] bg-[#171B1F] p-7 sm:p-10 lg:p-12 shadow-2xl">
            {!confirmedPass ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#858D96] mb-2 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-[#FF7138]" />
                      <span>Full Legal Name *</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Liam Henderson"
                      className={`w-full rounded-xl border bg-[#0B0D0F] px-4 py-3 text-sm text-[#F6F4F0] placeholder:text-[#858D96]/50 focus:outline-none focus:ring-1 ${
                        errors.fullName
                          ? "border-[#FF6565] focus:ring-[#FF6565]"
                          : "border-[#2B3137] focus:border-[#FF7138] focus:ring-[#FF7138]"
                      }`}
                    />
                    {errors.fullName && (
                      <p className="mt-1.5 text-xs text-[#FF6565] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.fullName}</span>
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#858D96] mb-2 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-[#FF7138]" />
                      <span>Email Address *</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. liam@example.com"
                      className={`w-full rounded-xl border bg-[#0B0D0F] px-4 py-3 text-sm text-[#F6F4F0] placeholder:text-[#858D96]/50 focus:outline-none focus:ring-1 ${
                        errors.email
                          ? "border-[#FF6565] focus:ring-[#FF6565]"
                          : "border-[#2B3137] focus:border-[#FF7138] focus:ring-[#FF7138]"
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-[#FF6565] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#858D96] mb-2 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-[#FF7138]" />
                      <span>Phone Number *</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. (555) 234-5678"
                      className={`w-full rounded-xl border bg-[#0B0D0F] px-4 py-3 text-sm text-[#F6F4F0] placeholder:text-[#858D96]/50 focus:outline-none focus:ring-1 ${
                        errors.phone
                          ? "border-[#FF6565] focus:ring-[#FF6565]"
                          : "border-[#2B3137] focus:border-[#FF7138] focus:ring-[#FF7138]"
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1.5 text-xs text-[#FF6565] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>

                  {/* Discipline / Program Choice */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#858D96] mb-2 flex items-center gap-1.5">
                      <Dumbbell className="h-3.5 w-3.5 text-[#FF7138]" />
                      <span>Primary Program Focus</span>
                    </label>
                    <select
                      value={discipline}
                      onChange={(e) => setDiscipline(e.target.value)}
                      className="w-full rounded-xl border border-[#2B3137] bg-[#0B0D0F] px-4 py-3 text-sm text-[#F6F4F0] focus:border-[#FF7138] focus:outline-none focus:ring-1 focus:ring-[#FF7138]"
                    >
                      <option value="IronForge™ Hypertrophy">IronForge™ Hypertrophy (Strength)</option>
                      <option value="VelocityX™ Metabolic Burn">VelocityX™ Metabolic Burn (HIIT)</option>
                      <option value="Spartan Rig™ Functional Athletics">Spartan Rig™ Functional Athletics</option>
                      <option value="ZenFlex™ Structural Recovery">ZenFlex™ Structural Recovery (Mobility)</option>
                      <option value="Apex Strike™ Boxing & Kickboxing">Apex Strike™ Boxing & Kickboxing</option>
                      <option value="Precision™ 1-on-1 Coaching">Precision™ 1-on-1 Coaching Consultation</option>
                      <option value="Open Floor / Free Weights">Open Floor & Cardio Pavilion Access</option>
                    </select>
                  </div>

                  {/* Preferred Date */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#858D96] mb-2 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#FF7138]" />
                      <span>Preferred Date *</span>
                    </label>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className={`w-full rounded-xl border bg-[#0B0D0F] px-4 py-3 text-sm text-[#F6F4F0] focus:outline-none focus:ring-1 ${
                        errors.preferredDate
                          ? "border-[#FF6565] focus:ring-[#FF6565]"
                          : "border-[#2B3137] focus:border-[#FF7138] focus:ring-[#FF7138]"
                      }`}
                    />
                    {errors.preferredDate && (
                      <p className="mt-1.5 text-xs text-[#FF6565] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{errors.preferredDate}</span>
                      </p>
                    )}
                  </div>

                  {/* Time Window */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#858D96] mb-2 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#FF7138]" />
                      <span>Arrival Time Window</span>
                    </label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full rounded-xl border border-[#2B3137] bg-[#0B0D0F] px-4 py-3 text-sm text-[#F6F4F0] focus:border-[#FF7138] focus:outline-none focus:ring-1 focus:ring-[#FF7138]"
                    >
                      <option value="Morning (06:00 AM – 11:00 AM)">Morning (06:00 AM – 11:00 AM)</option>
                      <option value="Midday (12:00 PM – 04:00 PM)">Midday (12:00 PM – 04:00 PM)</option>
                      <option value="Evening (05:00 PM – 09:00 PM)">Evening (05:00 PM – 09:00 PM)</option>
                    </select>
                  </div>
                </div>

                {/* Training Goals / Experience Note */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#858D96] mb-2">
                    Lifting Experience & Past Injuries (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={experienceNote}
                    onChange={(e) => setExperienceNote(e.target.value)}
                    placeholder="e.g. 2 years commercial gym experience, looking to improve deadlift form..."
                    className="w-full rounded-xl border border-[#2B3137] bg-[#0B0D0F] px-4 py-3 text-sm text-[#F6F4F0] placeholder:text-[#858D96]/50 focus:border-[#FF7138] focus:outline-none focus:ring-1 focus:ring-[#FF7138]"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-[#858D96]">
                    <ShieldCheck className="h-4 w-4 text-[#48D597]" />
                    <span>Instant digital pass generation &bull; No payment info required</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7138] to-[#FF934D] px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider text-[#0B0D0F] shadow-xl shadow-[#FF7138]/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-[#0B0D0F]" />
                        <span>Generating VIP Pass...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Generate My Free Pass</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Success Pass Display */
              <div className="text-center py-6 space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#48D597]/15 border border-[#48D597]/30 text-[#48D597]">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#F6F4F0]">
                    Your VIP Trial Pass Is Ready!
                  </h3>
                  <p className="mt-2 text-sm text-[#B5BBC2]">
                    Welcome, <span className="text-[#FF7138] font-bold">{fullName}</span>.
                    Present this barcode code at our front desk upon arrival.
                  </p>
                </div>

                {/* VIP Pass Card UI */}
                <div className="max-w-md mx-auto rounded-2xl border-2 border-[#FF7138] bg-[#0B0D0F] p-6 text-left shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4">
                    <span className="inline-block bg-[#FF7138] text-[#0B0D0F] text-[9px] font-black uppercase tracking-widest px-8 py-1 rotate-45 shadow-sm">
                      VIP PASS
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF7138] mb-4">
                    <Ticket className="h-4 w-4" />
                    <span>FitZone 1-Day All-Access Pass</span>
                  </div>

                  <div className="bg-[#171B1F] rounded-xl p-4 border border-[#2B3137] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#858D96]">Passholder:</span>
                      <span className="text-sm font-bold text-[#F6F4F0]">{fullName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#858D96]">Scheduled Date:</span>
                      <span className="text-xs font-semibold text-[#F6F4F0]">{preferredDate}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#858D96]">Discipline:</span>
                      <span className="text-xs font-semibold text-[#FF934D]">{discipline}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#858D96]">Time Slot:</span>
                      <span className="text-xs text-[#B5BBC2]">{timeSlot}</span>
                    </div>

                    {/* Barcode / Code Box */}
                    <div className="mt-4 pt-4 border-t border-[#2B3137] flex items-center justify-between bg-black/40 rounded-lg p-3">
                      <div>
                        <p className="text-[10px] text-[#858D96] uppercase font-bold tracking-wider">
                          Access Code
                        </p>
                        <p className="font-mono text-base font-black text-[#F6F4F0] tracking-wider">
                          {confirmedPass}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#2B3137] bg-[#171B1F] px-3 py-1.5 text-xs text-[#FF7138] hover:text-white transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-[#48D597]" />
                            <span className="text-[#48D597]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Arrival Instructions */}
                  <div className="mt-4 text-[11px] text-[#858D96] space-y-1">
                    <p>&bull; Address: 480 Olympic Way, Performance District</p>
                    <p>&bull; Free locker, chilled towel, and cold plunge access included.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs font-bold uppercase tracking-wider text-[#858D96] hover:text-[#FF7138] transition-colors"
                  >
                    &larr; Book Another Pass or Edit Information
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
