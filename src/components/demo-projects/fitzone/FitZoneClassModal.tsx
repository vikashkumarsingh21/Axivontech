"use client";

import React, { useState } from "react";
import { ScheduleClassSession } from "./types";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  Sparkles,
  Ticket,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FitZoneClassModalProps {
  session: ScheduleClassSession | null;
  onClose: () => void;
}

export default function FitZoneClassModal({
  session,
  onClose,
}: FitZoneClassModalProps) {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!session) return null;

  const passCode = `FIT-RES-${session.id.toUpperCase()}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      setErrorMsg("Please provide your name and email to reserve your spot.");
      return;
    }
    setErrorMsg("");
    setIsConfirmed(true);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(passCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-[#2B3137] bg-[#111417] shadow-2xl shadow-black/80 my-8"
        >
          {/* Header */}
          <div className="relative border-b border-[#2B3137] bg-[#171B1F] p-6">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-lg border border-[#2B3137] bg-[#0B0D0F] text-[#B5BBC2] hover:text-white hover:border-[#FF7138] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-[#FF7138]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#FF7138] border border-[#FF7138]/30">
                {session.dayOfWeek} Session
              </span>
              <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#B5BBC2] border border-white/10">
                {session.category}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#F6F4F0]">
              {session.className}
            </h3>
          </div>

          {/* Body */}
          <div className="p-6">
            {!isConfirmed ? (
              <form onSubmit={handleConfirmReservation} className="space-y-5">
                {/* Session Details Summary */}
                <div className="rounded-xl border border-[#2B3137] bg-[#171B1F] p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-[#858D96]">
                      <Clock className="h-3.5 w-3.5 text-[#FF7138]" />
                      <span>Time & Duration:</span>
                    </span>
                    <span className="font-bold text-[#F6F4F0]">
                      {session.timeSlot} ({session.durationMinutes} Min)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-[#858D96]">
                      <MapPin className="h-3.5 w-3.5 text-[#FF7138]" />
                      <span>Facility Zone:</span>
                    </span>
                    <span className="font-bold text-[#F6F4F0]">
                      {session.zone}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-[#858D96]">
                      <User className="h-3.5 w-3.5 text-[#FF7138]" />
                      <span>Master Instructor:</span>
                    </span>
                    <span className="font-bold text-[#FF934D]">
                      {session.trainer}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#2B3137]">
                    <span className="text-[#858D96]">Capacity Status:</span>
                    <span
                      className={`font-bold ${
                        session.spotsRemaining <= 2
                          ? "text-[#FF7138]"
                          : "text-[#48D597]"
                      }`}
                    >
                      {session.spotsRemaining > 0
                        ? `${session.spotsRemaining} Spots Available`
                        : "Waitlist Only"}
                    </span>
                  </div>
                </div>

                {errorMsg && (
                  <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs font-semibold text-[#FF6565]">
                    {errorMsg}
                  </p>
                )}

                {/* Form Inputs */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#858D96] mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full rounded-xl border border-[#2B3137] bg-[#0B0D0F] px-4 py-2.5 text-sm text-[#F6F4F0] placeholder:text-[#858D96]/50 focus:border-[#FF7138] focus:outline-none focus:ring-1 focus:ring-[#FF7138]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#858D96] mb-1.5">
                      Email Address (For Confirmation)
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="e.g. alex@example.com"
                      className="w-full rounded-xl border border-[#2B3137] bg-[#0B0D0F] px-4 py-2.5 text-sm text-[#F6F4F0] placeholder:text-[#858D96]/50 focus:border-[#FF7138] focus:outline-none focus:ring-1 focus:ring-[#FF7138]"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-[#858D96]">
                  * This is an interactive demo reservation. A simulated guest
                  access barcode will be generated for your spot.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/3 rounded-xl border border-[#2B3137] bg-transparent py-2.5 text-xs font-bold uppercase tracking-wider text-[#B5BBC2] hover:text-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7138] to-[#FF934D] py-2.5 text-xs font-extrabold uppercase tracking-wider text-[#0B0D0F] shadow-lg shadow-[#FF7138]/25 hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Confirm Spot Reservation</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Success Confirmation View */
              <div className="text-center py-4 space-y-5">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#48D597]/15 border border-[#48D597]/30 text-[#48D597]">
                  <CheckCircle2 className="h-7 w-7" />
                </div>

                <div>
                  <h4 className="text-xl font-black uppercase tracking-tight text-[#F6F4F0]">
                    Spot Confirmed, {userName}!
                  </h4>
                  <p className="mt-1 text-xs text-[#B5BBC2]">
                    Your reservation for{" "}
                    <span className="font-bold text-[#FF7138]">
                      {session.className}
                    </span>{" "}
                    on {session.dayOfWeek} at {session.timeSlot} is locked.
                  </p>
                </div>

                {/* VIP Pass Card */}
                <div className="rounded-xl border border-[#FF7138]/40 bg-[#171B1F] p-4 text-left shadow-lg">
                  <div className="flex items-center justify-between text-xs border-b border-[#2B3137] pb-2 mb-3">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#FF7138]">
                      <Ticket className="h-3.5 w-3.5" />
                      <span>FitZone Guest Pass Code</span>
                    </span>
                    <span className="text-[10px] text-[#48D597] font-semibold uppercase">
                      Active / Verified
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-[#0B0D0F] rounded-lg p-3 border border-[#2B3137]">
                    <span className="font-mono text-sm font-black text-[#F6F4F0] tracking-wider">
                      {passCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1 text-xs text-[#FF7138] hover:text-[#FF934D] transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[#48D597]" />
                          <span className="text-[#48D597]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-3 text-[11px] text-[#858D96] space-y-1">
                    <p>&bull; Location: {session.zone} &bull; Coach: {session.trainer}</p>
                    <p>&bull; Arrive 10 minutes prior for locker key and orientation.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-xl bg-gradient-to-r from-[#FF7138] to-[#FF934D] py-3 text-xs font-bold uppercase tracking-wider text-[#0B0D0F] shadow-lg shadow-[#FF7138]/20"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
