"use client";

import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, Calendar, CheckCircle2, Navigation } from "lucide-react";

export default function OakfieldContact() {
  const [tourDate, setTourDate] = useState("2026-11-15");
  const [tourTime, setTourTime] = useState("10:00 AM");
  const [visitors, setVisitors] = useState("2");
  const [booked, setBooked] = useState(false);

  const handleBookTour = (e: React.FormEvent) => {
    e.preventDefault();
    setBooked(true);
  };

  return (
    <section id="contact" className="py-20 bg-[#f4efe4] text-[#18231d] border-b border-[#e2d9c8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#c8a24d]">
            Connect &amp; Visit
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#143d30]">
            Experience the Oakfield Campus Firsthand
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#4f5e55]">
            We warmly invite prospective families to take a guided walk through our academic studios, libraries, and sports pavilions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 6 cols: Contact Details & Campus Directions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-2xl border border-[#dfd4c0] bg-[#faf8f4] p-8 shadow-sm">
              <h3 className="font-serif text-xl font-bold text-[#143d30] mb-6">
                Campus Directory &amp; Enquiries
              </h3>

              <div className="space-y-5 text-xs sm:text-sm text-[#4f5e55]">
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#143d30] text-[#c8a24d]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <strong className="block text-[#143d30]">Campus Location:</strong>
                    <span>Oakfield International School Campus</span>
                    <br />
                    <span>Green Hills Knowledge Corridor, Off Sarjapur Road</span>
                    <br />
                    <span>Bengaluru, Karnataka 560035, India</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#143d30] text-[#c8a24d]">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <strong className="block text-[#143d30]">Direct Phone Lines:</strong>
                    <span>Admissions Central: +91 80 4912 8800 / 8801</span>
                    <br />
                    <span>Principal&apos;s Secretariat: +91 80 4912 8815</span>
                    <br />
                    <span>24/7 Medical Infirmary Helpline: +91 80 4912 8899</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#143d30] text-[#c8a24d]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <strong className="block text-[#143d30]">Electronic Correspondence:</strong>
                    <span>Admissions: admissions@oakfieldschool.edu.in</span>
                    <br />
                    <span>General Desk: info@oakfieldschool.edu.in</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#143d30] text-[#c8a24d]">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <strong className="block text-[#143d30]">Administrative Office Hours:</strong>
                    <span>Monday to Friday: 8:00 AM – 4:00 PM</span>
                    <br />
                    <span>Saturday: 8:30 AM – 1:30 PM (Admissions Open)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 6 cols: Book a Campus Tour Widget */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-[#dfd4c0] bg-[#faf8f4] p-8 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#c8a24d]">
                Personalized Visit
              </span>
              <h3 className="font-serif text-xl font-bold text-[#143d30] mt-1 mb-2">
                Schedule a Guided Campus Walk
              </h3>
              <p className="text-xs text-[#4f5e55] mb-6">
                Select your preferred morning slot to meet an academic coordinator and tour our laboratories and sports facilities.
              </p>

              {booked ? (
                <div className="rounded-xl border border-[#c8a24d]/40 bg-[#f4efe4] p-6 text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-[#143d30] mx-auto" />
                  <h4 className="font-serif text-lg font-bold text-[#143d30]">
                    Campus Tour Reservation Simulated!
                  </h4>
                  <p className="text-xs text-[#4f5e55]">
                    Your guided tour for <strong>{visitors} visitors</strong> on <strong>{tourDate}</strong> at <strong>{tourTime}</strong> has been logged in this interactive demo.
                  </p>
                  <button
                    onClick={() => setBooked(false)}
                    className="mt-2 rounded-full bg-[#143d30] px-5 py-2 text-xs font-bold text-[#faf8f4]"
                  >
                    Reschedule or Modify
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookTour} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#18231d] mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={tourDate}
                      onChange={(e) => setTourDate(e.target.value)}
                      className="w-full rounded-xl border border-[#dfd4c0] bg-[#f4efe4] px-3.5 py-2 text-xs text-[#18231d] focus:outline-none focus:ring-1 focus:ring-[#143d30]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#18231d] mb-1">
                        Time Slot
                      </label>
                      <select
                        value={tourTime}
                        onChange={(e) => setTourTime(e.target.value)}
                        className="w-full rounded-xl border border-[#dfd4c0] bg-[#f4efe4] px-3.5 py-2 text-xs text-[#18231d] focus:outline-none focus:ring-1 focus:ring-[#143d30]"
                      >
                        <option value="9:30 AM">9:30 AM (Morning Tour)</option>
                        <option value="11:00 AM">11:00 AM (Classroom Tour)</option>
                        <option value="2:00 PM">2:00 PM (Afternoon Tour)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#18231d] mb-1">
                        Number of Visitors
                      </label>
                      <select
                        value={visitors}
                        onChange={(e) => setVisitors(e.target.value)}
                        className="w-full rounded-xl border border-[#dfd4c0] bg-[#f4efe4] px-3.5 py-2 text-xs text-[#18231d] focus:outline-none focus:ring-1 focus:ring-[#143d30]"
                      >
                        <option value="1">1 Person</option>
                        <option value="2">2 People (Parents)</option>
                        <option value="3">3 People (Parents + Student)</option>
                        <option value="4+">Family (4+ People)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#143d30] py-3 text-xs font-bold text-[#faf8f4] hover:bg-[#1a4e3e] transition-colors"
                    >
                      <Calendar className="h-4 w-4 text-[#c8a24d]" />
                      <span>Confirm Guided Campus Tour (Demo)</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
