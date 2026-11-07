"use client";

import React from "react";
import Image from "next/image";
import { Quote, Award, CheckCircle2 } from "lucide-react";

export default function OakfieldPrincipal() {
  return (
    <section id="principal" className="py-20 bg-[#f4efe4] text-[#18231d] border-b border-[#e2d9c8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Portrait & Credentials */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full aspect-[4/3] max-w-md overflow-hidden rounded-2xl border-4 border-[#faf8f4] shadow-xl bg-[#143d30]">
              <Image
                src="/demo-assets/education/oakfield/principal-desk.webp"
                alt="Dr. Gayatri Sundaram, Principal of Oakfield International School"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>

            {/* Credential Card */}
            <div className="mt-6 w-full max-w-md rounded-xl border border-[#e2d9c8] bg-[#faf8f4] p-5 shadow-sm text-center">
              <h3 className="font-serif text-lg font-bold text-[#143d30]">
                Dr. Gayatri Sundaram
              </h3>
              <p className="text-xs text-[#c8a24d] font-semibold mt-0.5">
                Principal &amp; Senior Academic Director
              </p>
              <p className="text-xs text-[#4f5e55] mt-2">
                Ph.D. in Child Psychology &amp; Pedagogy (Univ. of Delhi) · M.Sc. · B.Ed.
              </p>
              <div className="mt-4 pt-3 border-t border-[#ece4d5] flex items-center justify-center gap-6 text-[11px] text-[#4f5e55]">
                <span>24 Years Leadership</span>
                <span>•</span>
                <span>National Educator Award 2023</span>
              </div>
            </div>
          </div>

          {/* Right Column: Principal's Letter */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#143d30]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#143d30] mb-4">
              <Quote className="h-3.5 w-3.5 text-[#c8a24d]" />
              <span>From the Principal&apos;s Desk</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#143d30] leading-tight">
              &ldquo;We Do Not Merely Prepare Children for Exams; We Prepare Them for Life.&rdquo;
            </h2>

            <div className="mt-6 space-y-4 text-sm sm:text-base leading-relaxed text-[#4f5e55] font-light">
              <p>
                Dear Parents, Educators, and Esteemed Visitors,
              </p>
              <p>
                When parents walk through the gates of Oakfield International School, they entrust us with their child’s most formative years. We accept that sacred responsibility with profound dedication. In an era dominated by rapid technological disruption and superficial benchmarks, true education must anchor children in unshakeable ethical principles while equipping them with fierce intellectual rigor.
              </p>
              <p>
                At Oakfield, our CBSE curriculum is delivered not as isolated textbook memory, but through experiential inquiry. When our students study physics, they design aerodynamic prototypes in our STEM pavilion. When they study literature, they debate ethics and humanity with empathy. When they step onto our sports fields, they learn grace in victory and resilience in defeat.
              </p>
              <p>
                Every child carries a distinct spark. Our role as mentors is to provide the wind that turns that spark into a lifelong blaze of curiosity, leadership, and service. I warmly invite you to walk our campus, speak to our faculty, and witness the joyful scholarship that defines Oakfield.
              </p>
            </div>

            {/* Signature Block */}
            <div className="mt-8 pt-6 border-t border-[#e2d9c8] flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-serif text-lg font-bold text-[#143d30]">
                  Dr. Gayatri Sundaram
                </p>
                <p className="text-xs text-[#718278]">
                  Principal, Oakfield International School
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-[#143d30] bg-[#faf8f4] px-4 py-2 rounded-full border border-[#e2d9c8]">
                <CheckCircle2 className="h-4 w-4 text-[#c8a24d]" />
                <span>Open for 2026–27 Campus Interactions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
