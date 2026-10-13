"use client";

import React, { useState } from "react";
import { CAMPUS_EVENTS, CampusEvent } from "@/data/edusmart-data";
import { Sparkles, Calendar, ArrowRight, X } from "lucide-react";

export default function EduSmartEvents() {
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);

  return (
    <section
      id="events"
      aria-labelledby="events-heading"
      className="relative border-t border-[#E8E1EB] bg-white py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#B89557]">
            <Sparkles className="h-3.5 w-3.5 text-[#33243B]" />
            <span>Academic Calendar & Gatherings</span>
          </div>

          <h2
            id="events-heading"
            className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#27232A]"
          >
            News & Events
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#27232A]/80 leading-relaxed">
            Illustrative academic conferences, open workshops, and campus lectures designed to
            showcase community activity across terms.
          </p>
        </div>

        {/* 4 Events Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CAMPUS_EVENTS.map((evt) => (
            <article
              key={evt.id}
              className="group flex flex-col justify-between rounded-3xl border border-[#E8E1EB] bg-[#F7F3EB]/50 p-6 shadow-sm transition-all hover:border-[#33243B]/40 hover:bg-[#F7F3EB]"
            >
              <div>
                <span className="inline-block rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#33243B] border border-[#E8E1EB]">
                  {evt.category}
                </span>

                <h3 className="mt-4 font-serif text-lg sm:text-xl font-bold text-[#27232A]">
                  {evt.title}
                </h3>

                <p className="mt-2 text-xs text-[#27232A]/70 leading-relaxed">
                  {evt.description}
                </p>

                <p className="mt-4 text-[11px] font-medium text-[#B89557]">
                  {evt.dateFormatted}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-[#E8E1EB]">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(evt)}
                  className="inline-flex w-full items-center justify-between text-xs font-semibold text-[#33243B] hover:text-[#523A5E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33243B]"
                >
                  <span>Event Brief</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#B89557]" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-evt-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-sm"
        >
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#D9D1DE] bg-white p-6 sm:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              aria-label="Close modal"
              className="absolute top-5 right-5 rounded-full p-2 text-[#27232A]/70 hover:bg-[#E8E1EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33243B]"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="text-xs font-bold uppercase tracking-wider text-[#B89557]">
              {selectedEvent.category} · {selectedEvent.dateFormatted}
            </span>

            <h3 id="modal-evt-title" className="mt-2 font-serif text-2xl font-bold text-[#33243B]">
              {selectedEvent.title}
            </h3>

            <p className="mt-4 text-sm text-[#27232A]/80 leading-relaxed">
              {selectedEvent.description}
            </p>

            <div className="mt-6 rounded-2xl bg-[#F7F3EB] p-4 text-xs text-[#27232A]/80 border border-[#E8E1EB]">
              <p><strong>Venue Location:</strong> {selectedEvent.location}</p>
              <p className="mt-1"><strong>Registration Status:</strong> Illustrative demonstration event schedule.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
