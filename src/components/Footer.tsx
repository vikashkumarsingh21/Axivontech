"use client";

import {
    FaLinkedin,
    FaInstagram,
    FaFacebook,
    FaYoutube,
    FaWhatsapp
} from "react-icons/fa";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Mail, Globe } from "lucide-react";


interface FooterLink {
    label: string;
    href: string;
}

interface SocialLink {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
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
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function Footer() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <footer className="relative overflow-hidden border-t border-white/10 bg-[#050816]">
            {/* Gradient top border glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#2563EB]/10 via-transparent to-transparent blur-2xl" />

            {/* Floating gradient background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <motion.div
                    aria-hidden
                    className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-[#2563EB]/10 blur-[110px]"
                    animate={shouldReduceMotion ? undefined : { x: [0, 25, 0], y: [0, 20, 0] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    aria-hidden
                    className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#7C3AED]/10 blur-[110px]"
                    animate={shouldReduceMotion ? undefined : { x: [0, -20, 0], y: [0, -15, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={containerVariants}
                    className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-10"
                >
                    {/* Column 1: Brand */}
                    <motion.div variants={itemVariants} className="sm:col-span-2 lg:col-span-1">
                        <a href="/" className="group inline-flex items-center gap-2.5">
                            <span className="relative flex h-8 w-8 items-center justify-center transition-transform duration-300 group-hover:scale-105">
                                <svg viewBox="0 0 32 32" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <linearGradient id="axivon-mark-footer" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                                            <stop offset="0%" stopColor="#2563EB" />
                                            <stop offset="100%" stopColor="#7C3AED" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M16 2L29 9V23L16 30L3 23V9L16 2Z" stroke="url(#axivon-mark-footer)" strokeWidth="1.6" />
                                    <path d="M16 9L22.5 12.7V20.1L16 23.8L9.5 20.1V12.7L16 9Z" fill="url(#axivon-mark-footer)" fillOpacity="0.85" />
                                </svg>
                            </span>
                            <span className="flex flex-col leading-none">
                                <span className="text-[1.05rem] font-semibold tracking-tight text-white">Axivon</span>
                                <span className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-slate-400">
                                    Technologies
                                </span>
                            </span>
                        </a>

                        <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
                            We craft future-ready digital products — websites, apps, and
                            intelligent systems — built to help modern businesses scale
                            with confidence.
                        </p>

                        <p className="mt-4 text-sm font-medium text-[#00D4FF]">
                            Future-Ready Technology For Modern Businesses
                        </p>

                        <div className="mt-6 flex items-center gap-3">
                            {SOCIAL_LINKS.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <motion.a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.label}
                                        whileHover={shouldReduceMotion ? undefined : { scale: 1.1, y: -2 }}
                                        whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-colors duration-300 hover:border-[#00D4FF]/40 hover:bg-white/10 hover:text-[#00D4FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]"
                                    >
                                        <Icon className="h-4.5 w-4.5" />
                                    </motion.a>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Column 2: Company */}
                    <motion.div variants={itemVariants}>
                        <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-white">
                            Company
                        </h3>
                        <ul className="flex flex-col gap-3">
                            {COMPANY_LINKS.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="group inline-flex items-center text-sm text-slate-400 transition-colors duration-300 hover:text-white"
                                    >
                                        <span className="relative">
                                            {link.label}
                                            <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-[#2563EB] to-[#00D4FF] transition-all duration-300 group-hover:w-full" />
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Column 3: Services */}
                    <motion.div variants={itemVariants}>
                        <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-white">
                            Services
                        </h3>
                        <ul className="flex flex-col gap-3">
                            {SERVICE_LINKS.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="group inline-flex items-center text-sm text-slate-400 transition-colors duration-300 hover:text-white"
                                    >
                                        <span className="relative">
                                            {link.label}
                                            <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-[#2563EB] to-[#00D4FF] transition-all duration-300 group-hover:w-full" />
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Column 4: Contact */}
                    <motion.div variants={itemVariants}>
                        <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-white">
                            Contact
                        </h3>

                        <ul className="flex flex-col gap-3">
                            <li>
                                <a
                                    href="mailto:info@axivontech.in"
                                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
                                >
                                    <Mail className="h-4 w-4 text-[#00D4FF]" />
                                    info@axivontech.in
                                </a>
                            </li>

                            <li>
                                <a
                                    href="https://wa.me/919473263768"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
                                >
                                    <FaWhatsapp className="h-4 w-4 text-green-500" />
                                    +91 9473263768
                                </a>
                            </li>

                            <li>
                                <a
                                    href="https://axivontech.in"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
                                >
                                    <Globe className="h-4 w-4 text-[#00D4FF]" />
                                    axivontech.in
                                </a>
                            </li>
                        </ul>
                    </motion.div>
                </motion.div >

                {/* Bottom bar */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-center lg:flex-row lg:text-left"
                >
                    <p className="text-sm text-slate-500">
                        © 2026 Axivon Technologies. All Rights Reserved.
                    </p>

                    <nav
                        aria-label="Legal"
                        className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1"
                    >
                        {LEGAL_LINKS.map((link, index) => (
                            <span key={link.label} className="flex items-center gap-x-2">
                                <a
                                    href={link.href}
                                    className="text-sm text-slate-500 transition-colors duration-300 hover:text-white"
                                >
                                    {link.label}
                                </a>

                                {index < LEGAL_LINKS.length - 1 && (
                                    <span className="text-slate-600">•</span>
                                )}
                            </span>
                        ))}
                    </nav>

                    <p className="text-sm text-slate-500">
                        Built with Innovation, Technology and Vision.
                    </p>
                </motion.div>
            </div >
        </footer >
    );
}