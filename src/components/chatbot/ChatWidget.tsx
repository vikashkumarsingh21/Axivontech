"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ExternalLink,
  PhoneCall,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome-1",
    sender: "bot",
    text: "👋 Hi! Welcome to Axivon Technologies. I am your AI project assistant.\n\nHow can I help you move your business forward today?",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
];

const SUGGESTIONS = [
  { label: "🚀 What services do you offer?", query: "What services do you offer?" },
  { label: "💰 Get project price estimate", query: "What is your project pricing?" },
  { label: "👨‍💻 Who are the founders & team?", query: "Who are the founders and team?" },
  { label: "📞 Speak with an expert", query: "How can I contact you directly?" },
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const handleSend = async (customQuery?: string) => {
    const textToSend = customQuery || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customQuery) setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      const data = await res.json();
      setIsTyping(false);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: data.reply || "Thank you for reaching out! Please contact us at contact@axivontech.in.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setIsTyping(false);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "You can message us directly on WhatsApp at **+91 94732 63768** or email contact@axivontech.in.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setInput("");
  };

  return (
    <aside className="fixed bottom-5 right-5 z-50 flex flex-col items-end" aria-label="Axivon AI Chat Assistant">
      {/* ── CHAT WINDOW ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 flex h-[580px] max-h-[85vh] w-[90vw] max-w-[420px] flex-col overflow-hidden rounded-3xl border border-[#2a2a2a] bg-[#141414] shadow-[0_24px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#262626] bg-[#0f0f0f]/95 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e8a064] to-[#c9922a] p-[1.5px]">
                  <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#141414]">
                    <Bot className="h-5 w-5 text-[#e8a064]" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4ade80] opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-[#4ade80]" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-semibold text-[#f4f4f5]">Axivon AI</h3>
                    <span className="rounded-full bg-[#e8a064]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#e8a064] border border-[#e8a064]/20">
                      Assistant
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4ade80] flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" /> Online • Instant Response
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  title="Reset Chat"
                  className="rounded-xl p-2 text-[#71717a] transition-colors hover:bg-[#1c1c1e] hover:text-[#f4f4f5]"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close Assistant"
                  className="rounded-xl p-2 text-[#71717a] transition-colors hover:bg-[#1c1c1e] hover:text-[#f4f4f5]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Quick Action Bar */}
            <div className="flex items-center justify-between border-b border-[#262626] bg-[#1c1c1e]/60 px-4 py-2 text-[11px] text-[#a1a1aa]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#e8a064]" />
                <span>Verified Axivon Assistant</span>
              </div>
              <a
                href="https://wa.me/919473263768"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 font-medium text-[#e8a064] hover:underline"
              >
                <span>WhatsApp Us</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#262626]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "bot" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#2a1f14] border border-[#e8a064]/20 text-[#e8a064]">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`group relative max-w-[82%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#e8a064] text-[#0f0f0f] font-medium rounded-br-xs"
                        : "bg-[#1c1c1e] text-[#f4f4f5] border border-[#262626] rounded-bl-xs"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <div
                      className={`mt-1.5 text-[9px] ${
                        msg.sender === "user" ? "text-[#0f0f0f]/70 text-right" : "text-[#71717a]"
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.sender === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#e8a064]/20 border border-[#e8a064]/40 text-[#e8a064]">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#2a1f14] border border-[#e8a064]/20 text-[#e8a064]">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1 rounded-full border border-[#262626] bg-[#1c1c1e] px-3 py-2">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#e8a064]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#e8a064] [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#e8a064] [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Chips */}
            <div className="border-t border-[#262626] bg-[#0f0f0f]/80 p-2.5">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => handleSend(s.query)}
                    className="whitespace-nowrap rounded-full border border-[#262626] bg-[#1c1c1e] px-3 py-1.5 text-[11px] font-medium text-[#a1a1aa] transition-colors hover:border-[#e8a064]/40 hover:bg-[#2a1f14] hover:text-[#f4f4f5]"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="mt-2 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Axivon AI anything..."
                  className="flex-1 rounded-xl border border-[#2a2a2a] bg-[#141414] px-4 py-2.5 text-xs text-[#f4f4f5] placeholder-[#71717a] outline-none transition-colors focus:border-[#e8a064]/50 focus:ring-1 focus:ring-[#e8a064]/50"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8a064] text-[#0f0f0f] transition-all hover:bg-[#d4915c] disabled:opacity-40 disabled:hover:bg-[#e8a064]"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FLOATING DOCK BAR TRIGGER ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="flex items-center gap-2"
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-3 rounded-full border border-[#2a2a2a] bg-[#141414]/95 px-4 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 hover:border-[#e8a064]/50 hover:bg-[#1c1c1e]"
        >
          {/* Glowing aura */}
          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#e8a064]/20 to-[#c9922a]/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />

          {/* AI Avatar */}
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#e8a064] to-[#c9922a] p-[1.5px]">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0f0f0f]">
              <Sparkles className="h-4 w-4 text-[#e8a064]" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4ade80] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#4ade80]" />
            </span>
          </div>

          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-[#f4f4f5] group-hover:text-[#e8a064] transition-colors">
              Axivon AI
            </span>
            <span className="text-[10px] font-medium text-[#71717a]">Chat with Assistant</span>
          </div>

          {unreadCount > 0 && !isOpen && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#e8a064] text-[10px] font-bold text-[#0f0f0f]">
              {unreadCount}
            </span>
          )}

          <div className="ml-1 text-[#71717a] group-hover:text-[#f4f4f5]">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
          </div>
        </button>
      </motion.div>
    </aside>
  );
}
