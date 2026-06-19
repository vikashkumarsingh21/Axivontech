"use client";

import { motion } from "framer-motion";
import { Mail, MessageCircle, MapPin, Clock3, type LucideIcon } from "lucide-react";
const EASE_CONTACT = [0.22, 1, 0.36, 1] as const;

interface ContactCard {
    icon: LucideIcon;
    title: string;
    value: string;
    description: string;
    href: string;
    ariaLabel: string;
    cta: string;
}

const contactCards: ContactCard[] = [
    {
        icon: Mail,
        title: "Email Us",
        value: "info@axivontech.in",
        description: "Send us your project requirements anytime.",
        href: "mailto:info@axivontech.in",
        ariaLabel: "Send an email to info@axivontech.in",
        cta: "Send Email →",
    },
    {
        icon: MessageCircle,
        title: "WhatsApp",
        value: "+91 94732 63768",
        description: "Quick responses for project discussions.",
        href: "https://wa.me/919473263768",
        ariaLabel: "Chat with us on WhatsApp at +91 9473263768",
        cta: "Chat Now →",
    },
    {
    icon: MapPin,
    title: "Location",
    value: "Muzaffarpur, Bihar, India",
    description: "Serving clients across India and worldwide.",
    href: "https://maps.google.com/?q=Muzaffarpur,Bihar,India",
    ariaLabel: "View our location, Muzaffarpur, Bihar, India, on the map",
    cta: "View Map →",
},
{
    icon: Clock3,
    title: "Response Time",
    value: "Within 24 Hours",
    description: "Fast and professional communication.",
    href: "#contact-form",
    ariaLabel: "Our typical response time is within 24 hours",
    cta: "Contact Us →",
},
];

const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7,  ease: EASE_CONTACT },
    },
};

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.15,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 32, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.6,  ease: EASE_CONTACT },
    },
};

export default function ContactInfo() {
    return (
        <section
            id="contact-info"
            aria-labelledby="contact-info-heading"
            className="relative isolate overflow-hidden bg-[#050816] px-6 py-24 sm:py-32"
        >
            {/* Floating gradient blobs */}
            <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
                <motion.div
                    className="absolute -left-32 top-10 h-[26rem] w-[26rem] rounded-full bg-blue-600/20 blur-[120px]"
                    animate={{
                        y: [0, 30, 0],
                        x: [0, 20, 0],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute right-[-10rem] top-1/3 h-[28rem] w-[28rem] rounded-full bg-purple-600/20 blur-[130px]"
                    animate={{
                        y: [0, -25, 0],
                        x: [0, -15, 0],
                    }}
                    transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-[-8rem] left-1/3 h-[24rem] w-[24rem] rounded-full bg-cyan-500/15 blur-[120px]"
                    animate={{
                        y: [0, 20, 0],
                        x: [0, 25, 0],
                    }}
                    transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <motion.div
                    className="mx-auto max-w-3xl text-center"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={sectionVariants}
                >
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-cyan-300 backdrop-blur-sm">
                        GET IN TOUCH
                    </span>

                    <h2
                        id="contact-info-heading"
                        className="mt-6 text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl"
                    >
                        Let&apos;s Start A{" "}
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
                            Conversation
                        </span>
                    </h2>

                    <p className="mt-6 text-pretty text-base leading-relaxed text-slate-400 sm:text-lg">
                        We&apos;re here to answer your questions, discuss your project, and help you
                        find the right technology solution for your business.
                    </p>
                </motion.div>

                {/* Cards grid */}
                <motion.div
                    className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={containerVariants}
                >
                    {contactCards.map((card) => {
                        const Icon = card.icon;
                        const isExternal = card.href.startsWith("http");

                        return (
                            <motion.a
                                key={card.title}
                                href={card.href}
                                aria-label={card.ariaLabel}
                                target={isExternal ? "_blank" : undefined}
                                rel={isExternal ? "noopener noreferrer" : undefined}
                                variants={cardVariants}
                                whileHover={{ y: -8, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]"
                            >
                                {/* Gradient border glow on hover */}
                                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-cyan-400/0 opacity-0 transition-opacity duration-500 group-hover:from-blue-500/20 group-hover:via-purple-500/10 group-hover:to-cyan-400/20 group-hover:opacity-100" />
                                <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] transition-opacity duration-500 group-hover:opacity-100" />

                                <div className="relative z-10 flex flex-col">
                                    {/* Icon box */}
                                    <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 shadow-lg shadow-purple-500/20 transition-transform duration-500 group-hover:scale-110">
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 opacity-60 blur-md transition-opacity duration-500 group-hover:opacity-90" />
                                        <Icon className="relative h-5 w-5 text-white" strokeWidth={2} aria-hidden="true" />
                                    </div>

                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                                        {card.title}
                                    </h3>

                                    <p className="mt-2 text-lg font-semibold text-white break-words">
                                        {card.value}
                                    </p>

                                    <p className="mt-3 text-sm leading-relaxed text-slate-400">
                                        {card.description}
                                    </p>
                                    <span className="mt-4 inline-flex items-center text-sm font-semibold text-[#00D4FF] transition-all duration-300 group-hover:translate-x-1">
                                        {card.cta}
                                    </span>
                                </div>
                            </motion.a>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}