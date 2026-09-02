"use client";

import {
  FaLinkedin,
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Mail, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface FooterLink {
  label: string;
  href: string;
}

const COMPANY_LINKS: FooterLink[] = [
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

const LEGAL_LINKS: FooterLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Cookies Policy", href: "/cookie-policy" },
];

const SERVICE_LINKS: FooterLink[] = [
  { label: "Web Development", href: "/services/web-development" },
  { label: "Mobile App Development", href: "/services/mobile-app-development" },
  { label: "AI Solutions", href: "/services/ai-solutions" },
  { label: "Digital Marketing", href: "/services/digital-marketing" },
  { label: "SEO & SEM", href: "/services/seo-services" },
];

const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://linkedin.com", icon: FaLinkedin },
  { label: "Instagram", href: "https://instagram.com", icon: FaInstagram },
  { label: "Facebook", href: "https://facebook.com", icon: FaFacebook },
  { label: "YouTube", href: "https://youtube.com", icon: FaYoutube },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function Footer() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <footer className="border-t border-[#262626] bg-[#0c0c0d] py-16 text-[#a1a1aa]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
          className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr] lg:gap-10"
        >
          <motion.div variants={itemVariants} className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src="/assets/logo/logo-full.png"
                alt="Axivon Technologies Logo"
                width={220}
                height={60}
                className="h-12 w-auto object-contain brightness-0 invert"
              />
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-[#71717a]">
              We craft digital products that help modern businesses look credible, operate efficiently, and grow with confidence.
            </p>

            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e8a064]">
              Future-ready technology for modern businesses
            </p>

            <div className="mt-6 flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-[#a1a1aa] transition-colors hover:border-[#e8a064] hover:text-[#f4f4f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/40"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="mb-4 text-base font-semibold text-[#f4f4f5]">Company</h3>
            <ul className="flex flex-col gap-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-[#71717a] transition-colors hover:text-[#f4f4f5]">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="mb-4 text-base font-semibold text-[#f4f4f5]">Services</h3>
            <ul className="flex flex-col gap-2.5">
              {SERVICE_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-[#71717a] transition-colors hover:text-[#f4f4f5]">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="mb-4 text-base font-semibold text-[#f4f4f5]">Contact</h3>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a href="mailto:info@axivontech.in" className="inline-flex items-center gap-2 text-sm text-[#71717a] transition-colors hover:text-[#f4f4f5]">
                  <Mail className="h-4 w-4 text-[#e8a064]" />
                  info@axivontech.in
                </a>
              </li>

              <li>
                <a href="https://wa.me/919473263768" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[#71717a] transition-colors hover:text-[#f4f4f5]">
                  <FaWhatsapp className="h-4 w-4 text-[#4ade80]" />
                  +91 9473263768
                </a>
              </li>

              <li>
                <a href="https://axivontech.in" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[#71717a] transition-colors hover:text-[#f4f4f5]">
                  <Globe className="h-4 w-4 text-[#e8a064]" />
                  axivontech.in
                </a>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#262626] pt-8 text-center text-sm text-[#52525b] lg:flex-row lg:text-left"
        >
          <p>© 2026 Axivon Technologies. All Rights Reserved.</p>

          <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            {LEGAL_LINKS.map((link, index) => (
              <span key={link.label} className="flex items-center gap-x-2">
                <a href={link.href} className="text-sm text-[#71717a] transition-colors hover:text-[#f4f4f5]">
                  {link.label}
                </a>
                {index < LEGAL_LINKS.length - 1 && <span className="text-[#303030]">•</span>}
              </span>
            ))}
          </nav>

          <p>Built with innovation, technology, and vision.</p>
        </motion.div>
      </div>
    </footer>
  );
}