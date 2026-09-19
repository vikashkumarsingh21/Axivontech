"use client";

import { motion } from "framer-motion";
import {
  School,
  GraduationCap,
  Landmark,
  Hospital,
  HeartPulse,
  Hotel,
  UtensilsCrossed,
  BookOpenCheck,
  Store,
  ShoppingBag,
  Building2,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const INDUSTRIES = [
  {
    icon: School,
    title: "K-12 Education",
    desc: "Digital learning platforms, parent portals, and school management systems.",
    tags: ["LMS", "Portals", "ERP"],
    slug: "education"
  },
  {
    icon: Landmark,
    title: "Higher Education",
    desc: "Enterprise university infrastructure, course management, and campus automation.",
    tags: ["Campus Tech", "Scale", "Security"],
    slug: "education"
  },
  {
    icon: Hospital,
    title: "Healthcare",
    desc: "HIPAA-compliant patient portals, telemedicine tools, and hospital management.",
    tags: ["Telemed", "Compliance", "EMR"],
    slug: "healthcare"
  },
  {
    icon: Store,
    title: "Retail & E-Commerce",
    desc: "High-conversion online stores, inventory systems, and omnichannel platforms.",
    tags: ["Shopify", "Custom E-Com", "Inventory"],
    slug: "retail"
  },
  {
    icon: Building2,
    title: "Real Estate",
    desc: "Property listing platforms, virtual tours, and broker CRM systems.",
    tags: ["Listings", "CRM", "Portals"],
    slug: "real-estate"
  },
  {
    icon: Hotel,
    title: "Hospitality",
    desc: "Direct booking engines, digital menus, and hotel management systems.",
    tags: ["Booking", "Operations", "Menus"],
    slug: "hospitality"
  },
  {
    icon: Lightbulb,
    title: "SaaS & Startups",
    desc: "Scalable MVP development, cloud infrastructure, and AI integrations.",
    tags: ["MVP", "Cloud Native", "AI Integration"],
    slug: "startups"
  },
  {
    icon: BookOpenCheck,
    title: "Coaching & Training",
    desc: "Batch management, test engines, and student analytics for coaching centers.",
    tags: ["Analytics", "Tests", "Video"],
    slug: "education"
  }
];

export default function IndustriesGrid() {
  return (
    <section id="industries" className="py-24 bg-[#0a0a0c] relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INDUSTRIES.map((ind, i) => (
            <motion.div
              key={ind.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative bg-[#141414] border border-[#262626] rounded-2xl p-8 hover:border-[#e8a064]/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1c1c1e] flex items-center justify-center mb-6 group-hover:bg-[#e8a064]/10 transition-colors">
                <ind.icon className="w-6 h-6 text-[#71717a] group-hover:text-[#e8a064] transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{ind.title}</h3>
              <p className="text-[#a1a1aa] mb-6 text-sm leading-relaxed">{ind.desc}</p>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {ind.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-medium text-[#a1a1aa]">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="pt-6 border-t border-[#262626] mt-auto">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#f4f4f5] group-hover:text-[#e8a064] transition-colors"
                >
                  Discuss your project <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
