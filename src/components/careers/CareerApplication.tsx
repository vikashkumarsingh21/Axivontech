"use client";
import type { ReactNode } from "react";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Link, GitBranch, Globe, FileText,
  ChevronDown, Send, CheckCircle, Loader2, Briefcase, Sparkles,
  Zap, Globe2, Trophy, ArrowUpRight
} from "lucide-react";
// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  position: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  resumeUrl: string;
  coverLetter: string;
}

type FormStatus = "idle" | "loading" | "success" | "error";

// ─── Constants ────────────────────────────────────────────────────────────────

const POSITIONS = [
  "Frontend Developer Intern",
  "Backend Developer Intern",
  "AI/ML Intern",
  "UI/UX Design Intern",
  "Full Stack Developer Intern",
];

const STATS = [
  { label: "Active Hiring", value: "14", unit: "Open Positions", icon: Briefcase, color: "#2563EB" },
  { label: "Applications Reviewed", value: "2,400+", unit: "This Year", icon: CheckCircle, color: "#7C3AED" },
  { label: "Success Rate", value: "97%", unit: "Placement Rate", icon: Zap, color: "#00D4FF" },
  { label: "Remote Opportunities", value: "100%", unit: "Fully Remote", icon: Globe2, color: "#2563EB" },
];

const BENEFITS = [
  { icon: "🚀", label: "Real Projects", desc: "Ship to production" },
  { icon: "🤖", label: "AI Innovation", desc: "Cutting-edge stack" },
  { icon: "🌍", label: "Remote Friendly", desc: "Work anywhere" },
  { icon: "📚", label: "Learning Culture", desc: "Grow every day" },
  { icon: "💡", label: "Mentorship", desc: "Expert guidance" },
  { icon: "🏆", label: "Career Growth", desc: "Clear path forward" },
];

// ─── Particle ─────────────────────────────────────────────────────────────────

function Particle({ x, y, size, delay, duration }: { x: number; y: number; size: number; delay: number; duration: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: "rgba(37,99,235,0.4)" }}
      animate={{ y: [-20, 20, -20], opacity: [0.2, 0.8, 0.2], scale: [1, 1.3, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

// ─── Floating Label Input ─────────────────────────────────────────────────────

interface InputProps {
  label: string;
  name: keyof FormData;
  type?: string;
  icon: React.ReactNode;
  value: string;
  onChange: (name: keyof FormData, value: string) => void;
  required?: boolean;
}

function FloatingInput({ label, name, type = "text", icon, value, onChange, required }: InputProps) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative group">
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        animate={{ opacity: focused ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{
          background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))",
          boxShadow: focused ? "0 0 0 1px rgba(37,99,235,0.5), 0 0 20px rgba(37,99,235,0.2), 0 0 40px rgba(124,58,237,0.1)" : "none",
        }}
      />
      <div
        className="relative flex items-center rounded-xl border transition-all duration-300"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderColor: focused ? "rgba(37,99,235,0.6)" : "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="pl-4 flex-shrink-0" style={{ color: focused ? "#2563EB" : "rgba(255,255,255,0.3)", transition: "color 0.3s" }}>
          {icon}
        </div>
        <div className="relative flex-1 px-3 py-4">
          <motion.label
            htmlFor={name}
            className="absolute left-0 pointer-events-none font-medium tracking-wide"
            animate={{
              top: active ? "4px" : "50%",
              y: active ? "0%" : "-50%",
              fontSize: active ? "10px" : "13px",
              color: active ? (focused ? "#2563EB" : "rgba(255,255,255,0.4)") : "rgba(255,255,255,0.35)",
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {label}{required && " *"}
          </motion.label>
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full bg-transparent outline-none mt-3 text-white text-sm"
            style={{ caretColor: "#2563EB" }}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Select Input ─────────────────────────────────────────────────────────────

function FloatingSelect({ value, onChange }: { value: string; onChange: (name: keyof FormData, value: string) => void }) {
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const active = value.length > 0;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        animate={{ opacity: focused ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{
          background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))",
          boxShadow: focused ? "0 0 0 1px rgba(37,99,235,0.5), 0 0 20px rgba(37,99,235,0.2)" : "none",
        }}
      />
      <button
        type="button"
        onClick={() => { setOpen(!open); setFocused(!open); }}
        className="relative w-full flex items-center rounded-xl border transition-all duration-300 text-left"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderColor: focused ? "rgba(37,99,235,0.6)" : "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="pl-4 flex-shrink-0" style={{ color: focused ? "#2563EB" : "rgba(255,255,255,0.3)", transition: "color 0.3s" }}>
          <Briefcase size={16} />
        </div>
        <div className="relative flex-1 px-3 py-4">
          <motion.span
            className="absolute left-0 pointer-events-none font-medium tracking-wide"
            animate={{
              top: active ? "4px" : "50%",
              y: active ? "0%" : "-50%",
              fontSize: active ? "10px" : "13px",
              color: active ? (focused ? "#2563EB" : "rgba(255,255,255,0.4)") : "rgba(255,255,255,0.35)",
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            Position Applying For *
          </motion.span>
          <span className="block mt-3 text-sm text-white">{value || ""}</span>
        </div>
        <motion.div className="pr-4" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} style={{ color: "rgba(255,255,255,0.4)" }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute z-50 w-full mt-2 rounded-xl overflow-hidden"
            style={{
              background: "rgba(10,12,30,0.96)",
              border: "1px solid rgba(37,99,235,0.3)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(37,99,235,0.1)",
            }}
          >
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => { onChange("position", pos); setOpen(false); setFocused(false); }}
                className="w-full px-4 py-3 text-left text-sm transition-all duration-150 group flex items-center gap-3"
                style={{ color: value === pos ? "#2563EB" : "rgba(255,255,255,0.7)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.1)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
              >
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: value === pos ? "#2563EB" : "rgba(255,255,255,0.2)" }} />
                {pos}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

function FloatingTextarea({ value, onChange }: { value: string; onChange: (name: keyof FormData, value: string) => void }) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative group">
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        animate={{ opacity: focused ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{
          background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))",
          boxShadow: focused ? "0 0 0 1px rgba(37,99,235,0.5), 0 0 20px rgba(37,99,235,0.2)" : "none",
        }}
      />
      <div
        className="relative rounded-xl border transition-all duration-300"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderColor: focused ? "rgba(37,99,235,0.6)" : "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="relative px-4 pt-4 pb-1">
          <motion.label
            htmlFor="coverLetter"
            className="pointer-events-none font-medium tracking-wide block"
            animate={{
              fontSize: active ? "10px" : "13px",
              color: active ? (focused ? "#2563EB" : "rgba(255,255,255,0.4)") : "rgba(255,255,255,0.35)",
              marginBottom: active ? "4px" : "0px",
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            Cover Letter / Message
          </motion.label>
          <textarea
            id="coverLetter"
            name="coverLetter"
            value={value}
            onChange={(e) => onChange("coverLetter", e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={4}
            className="w-full bg-transparent outline-none text-white text-sm resize-none"
            style={{ caretColor: "#2563EB" }}
            placeholder={focused ? "Tell us about yourself, your passion, and why you want to join Axivon Technologies..." : ""}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Stats Card ───────────────────────────────────────────────────────────────

function StatCard({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const IconComponent = stat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative p-4 rounded-2xl overflow-hidden cursor-default"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(12px)",
      }}
    >
      <motion.div
        className="absolute inset-0 opacity-0 rounded-2xl"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ background: `radial-gradient(ellipse at center, ${stat.color}15 0%, transparent 70%)` }}
      />
      <div className="relative flex items-start gap-3">
        <div className="p-2 rounded-xl flex-shrink-0" style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}>
          <IconComponent size={16} style={{ color: stat.color }} />
        </div>
        <div>
          <div className="text-xs font-medium mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{stat.label}</div>
          <div className="text-xl font-bold text-white tracking-tight">{stat.value}</div>
          <div className="text-xs mt-0.5" style={{ color: stat.color }}>{stat.unit}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Benefit Card ─────────────────────────────────────────────────────────────

function BenefitCard({ benefit, index }: { benefit: typeof BENEFITS[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      viewport={{ once: true }}
      whileHover={{ y: -6, scale: 1.05 }}
      animate={{ y: [0, -4, 0] }}
      // @ts-ignore — framer-motion animate + whileHover both work
      style={{ animationDelay: `${index * 0.3}s` }}
      className="relative p-3 rounded-xl cursor-default group"
    >
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.3 }}
        style={{
          background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.1))",
          border: "1px solid rgba(37,99,235,0.3)",
          boxShadow: "0 0 20px rgba(37,99,235,0.15)",
        }}
      />
      <div
        className="absolute inset-0 rounded-xl"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      />
      <div className="relative text-center">
        <div className="text-2xl mb-1">{benefit.icon}</div>
        <div className="text-xs font-semibold text-white">{benefit.label}</div>
        <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{benefit.desc}</div>
      </div>
    </motion.div>
  );
}

// ─── 3D Tilt Card Wrapper ─────────────────────────────────────────────────────

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 20 });

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Spotlight ────────────────────────────────────────────────────────────────

function Spotlight() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    function move(e: MouseEvent) { x.set(e.clientX); y.set(e.clientY); }
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: useTransform(
          [x, y],
          ([lx, ly]) => `radial-gradient(600px circle at ${lx}px ${ly}px, rgba(37,99,235,0.04), transparent 70%)`
        ),
      }}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CareerApplication() {
  const [form, setForm] = useState<FormData>({
    fullName: "", email: "", phone: "", position: "", location: "",
    linkedin: "", github: "", portfolio: "", resumeUrl: "", coverLetter: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");


  const handleChange = useCallback((name: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.position.trim() ||
      !form.location.trim() ||
      !form.resumeUrl.trim()
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(form.email)) {
  alert("Please enter a valid email address.");
  return;
}

    try {
      setStatus("loading");

      const response = await fetch("/api/careers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to submit application");
      }

      const data = await response.json();

      if (data.success) {
        setStatus("success");

        setForm({
          fullName: "",
          email: "",
          phone: "",
          position: "",
          location: "",
          linkedin: "",
          github: "",
          portfolio: "",
          resumeUrl: "",
          coverLetter: "",
        });
      } else {
        setStatus("error");
      }
    }
    catch (error) {
      console.error("Career Form Error:", error);

      setStatus("error");

      alert("Application submission failed. Please try again.");
    }
  }



  const particles = Array.from({ length: 18 }, (_, i) => ({
    x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 3 + 1.5,
    delay: Math.random() * 4,
    duration: 4 + Math.random() * 4,
  }));

  return (
    <section
      className="relative min-h-screen py-24 overflow-hidden"
      style={{ background: "#050816" }}
    >
      <Spotlight />

      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{ left: "-10%", top: "-10%", background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{ right: "-5%", bottom: "10%", background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)" }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.6, 0.3, 0.6] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full"
          style={{ left: "40%", top: "30%", background: "radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        {particles.map((p, i) => <Particle key={i} {...p} />)}
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-semibold tracking-[0.15em] uppercase"
            style={{
              background: "rgba(37,99,235,0.1)",
              border: "1px solid rgba(37,99,235,0.3)",
              color: "#00D4FF",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Sparkles size={12} />
            Career Application
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight leading-[1.1]">
            Apply For Your{" "}
            <motion.span
              className="inline-block"
              style={{
                backgroundImage: "linear-gradient(135deg, #2563EB, #7C3AED, #00D4FF, #2563EB)",
                backgroundSize: "300% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            >
              Dream Role
            </motion.span>
          </h2>

          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
            Take the next step in your career journey.{" "}
            <span style={{ color: "rgba(255,255,255,0.7)" }}>
              Join Axivon Technologies and build future-ready products, AI solutions, cloud platforms, and digital experiences.
            </span>
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-[1fr_420px] gap-8 xl:gap-12 items-start">

          {/* ── LEFT: Form ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <div
              className="relative rounded-3xl p-6 sm:p-8"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 40px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              {/* Glass reflection */}
              <div className="absolute inset-x-8 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }} />

              {/* Animated border beam */}
              <motion.div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ padding: 1 }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div
                  className="w-full h-full rounded-3xl"
                  style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.2), transparent, rgba(124,58,237,0.2))" }}
                />
              </motion.div>

              <div className="relative">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.2))", border: "1px solid rgba(37,99,235,0.3)" }}>
                    <Send size={18} style={{ color: "#2563EB" }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Your Application</h3>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>All fields marked * are required</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Row 1 */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FloatingInput label="Full Name" name="fullName" icon={<User size={16} />} value={form.fullName} onChange={handleChange} required />
                    <FloatingInput label="Email Address" name="email" type="email" icon={<Mail size={16} />} value={form.email} onChange={handleChange} required />
                  </div>

                  {/* Row 2 */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FloatingInput label="Phone Number" name="phone" type="tel" icon={<Phone size={16} />} value={form.phone} onChange={handleChange} />
                    <FloatingInput label="Current Location" name="location" icon={<MapPin size={16} />} value={form.location} onChange={handleChange} required />
                  </div>

                  {/* Position */}
                  <FloatingSelect value={form.position} onChange={handleChange} />

                  {/* Row 3 */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FloatingInput label="LinkedIn Profile" name="linkedin" type="url" icon={<Link size={16} />} value={form.linkedin} onChange={handleChange} />
                    <FloatingInput label="GitHub Profile" name="github" type="url" icon={<GitBranch size={16} />} value={form.github} onChange={handleChange} />
                  </div>

                  {/* Row 4 */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FloatingInput label="Portfolio Website" name="portfolio" type="url" icon={<Globe size={16} />} value={form.portfolio} onChange={handleChange} />
                    <FloatingInput label="Resume URL" name="resumeUrl" type="url" icon={<FileText size={16} />} value={form.resumeUrl} onChange={handleChange} required />
                  </div>

                  {/* Cover Letter */}
                  <FloatingTextarea value={form.coverLetter} onChange={handleChange} />

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={status === "loading" || status === "success"}
                    className="relative w-full py-4 rounded-2xl font-semibold text-white overflow-hidden mt-2"
                    whileHover={status === "idle" ? { scale: 1.01 } : {}}
                    whileTap={status === "idle" ? { scale: 0.99 } : {}}
                    style={{
                      background: status === "success"
                        ? "linear-gradient(135deg, #059669, #10b981)"
                        : "linear-gradient(135deg, #2563EB, #7C3AED)",
                      boxShadow: status === "success"
                        ? "0 0 40px rgba(16,185,129,0.4)"
                        : "0 0 40px rgba(37,99,235,0.4), 0 0 80px rgba(124,58,237,0.2)",
                      cursor: status === "idle" ? "pointer" : "default",
                    }}
                  >
                    {/* Shine sweep */}
                    {status === "idle" && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)" }}
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                      />
                    )}
                    <span className="relative flex items-center justify-center gap-2 text-sm tracking-wide">
                      {status === "loading" && <Loader2 size={18} className="animate-spin" />}
                      {status === "success" && <CheckCircle size={18} />}
                      {status === "idle" && <Send size={18} />}
                      {status === "idle" && "Submit Application"}
                      {status === "loading" && "Submitting…"}
                      {status === "success" && "Application Submitted!"}
                    </span>
                  </motion.button>

                  <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                    We review every application within 3–5 business days.
                  </p>
                </form>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT: Panel ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col gap-5 lg:sticky lg:top-8"
          >

            {/* 3D Floating Hiring Dashboard */}
            <TiltCard>
              <div
                className="relative rounded-3xl p-6 overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(124,58,237,0.08) 50%, rgba(0,212,255,0.06) 100%)",
                  border: "1px solid rgba(37,99,235,0.25)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 30px 60px rgba(0,0,0,0.4), 0 0 60px rgba(37,99,235,0.08)",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Reflective surface */}
                <div className="absolute inset-x-6 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }} />
                <div className="absolute top-6 right-6 w-20 h-20 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(37,99,235,0.15), transparent)" }} />

                <div className="relative">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#00D4FF" }}>Hiring Dashboard</div>
                      <h3 className="text-lg font-bold text-white">Active Recruitment</h3>
                    </div>
                    <motion.div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                      style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <span className="text-xs text-green-400 font-medium">Live</span>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {STATS.map((stat, i) => <StatCard key={stat.label} stat={stat} index={i} />)}
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* Benefits */}
            <div
              className="rounded-3xl p-5"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={14} style={{ color: "#7C3AED" }} />
                <span className="text-sm font-semibold text-white">Why Axivon?</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {BENEFITS.map((b, i) => <BenefitCard key={b.label} benefit={b} index={i} />)}
              </div>
            </div>

            {/* CTA card */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative rounded-2xl p-5 overflow-hidden cursor-pointer"
              style={{
                background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.15))",
                border: "1px solid rgba(37,99,235,0.3)",
                backdropFilter: "blur(12px)",
              }}
            >
              <motion.div
                className="absolute inset-0 opacity-40"
                animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
                transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
                style={{
                  background: "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(0,212,255,0.05))",
                  backgroundSize: "200% 200%",
                }}
              />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold mb-1" style={{ color: "#00D4FF" }}>Questions?</div>
                  <p className="text-sm font-medium text-white">Chat with our talent team before applying.</p>
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>info@axivontech.in</p>
                </div>
                <ArrowUpRight size={20} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}