"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Sparkles, MessageSquare, ChevronDown, Bot, PhoneCall, RefreshCw } from "lucide-react";
import { Message } from "./types";
import { ChatHeader } from "./ChatHeader";
import { ChatWelcome } from "./ChatWelcome";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { MessageInput } from "./MessageInput";
import { isPortalOrStandaloneRoute } from "@/lib/utils";

interface ChatbotConfig {
  enabled: boolean;
  botName: string;
  welcomeHeading: string;
  welcomeSubtitle: string;
  suggestedQuestions: string[];
}

export default function ChatWidget() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");
  const [networkError, setNetworkError] = useState<string | null>(null);

  const [config, setConfig] = useState<ChatbotConfig | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load public chatbot configuration
  useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      try {
        const res = await fetch("/api/chat/config");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setConfig(data);
        }
      } catch {
        // Safe defaults
        if (isMounted) {
          setConfig({
            enabled: true,
            botName: "Axivon AI Assistant",
            welcomeHeading: "How can we assist you with your digital project today?",
            welcomeSubtitle:
              "I can help you explore Axivon's engineering services, examine verified case studies, and discuss your software requirements.",
            suggestedQuestions: [
              "Explore Core Services",
              "Website & SaaS Engineering",
              "Mobile App Development",
              "AI & Workflow Automation",
              "Discuss My Project Requirements",
            ],
          });
        }
      }
    }
    loadConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-scroll to bottom smoothly
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth" });
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen, scrollToBottom]);

  // Lock body scroll on mobile view when widget is expanded
  useEffect(() => {
    if (isOpen && typeof window !== "undefined" && window.innerWidth < 640) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    setNetworkError(null);
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const payload: { message: string; conversationId?: string } = { message: text };
      if (conversationId) payload.conversationId = conversationId;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.conversationId) setConversationId(data.conversationId);

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.reply || "Thank you for reaching out. How else can I assist your business?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isLeadCapture: Boolean(data.showLeadCapture),
      };

      setMessages((prev) => [...prev, botMsg]);
      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    } catch (error) {
      // Create user-friendly error message
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: "bot",
        text: "I was unable to retrieve a response right now due to a network or server connection issue. Please feel free to try again or contact our technical team directly at **info@axivontech.in** or **+91 9473263768**.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isError: true,
        canRetry: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
      setDraftText(text); // preserve message in draft
      setNetworkError("Connection interrupted. You can retry sending.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleRetry = (lastText: string) => {
    // Remove the error message and resend
    setMessages((prev) => prev.filter((m) => !m.isError));
    handleSend(lastText);
  };

  const handleLeadComplete = (name: string) => {
    const confirmationMsg: Message = {
      id: `bot-lead-${Date.now()}`,
      sender: "bot",
      text: `Thank you, **${name}**! Your consultation inquiry has been securely registered in our system. A senior engineer from Axivon Technologies will review your requirements and reach out within 24 hours.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) =>
      prev.map((m) => (m.isLeadCapture ? { ...m, isLeadCapture: false } : m)).concat(confirmationMsg)
    );
  };

  const handleLeadCancel = () => {
    setMessages((prev) =>
      prev.map((m) => (m.isLeadCapture ? { ...m, isLeadCapture: false } : m))
    );
  };

  const handleResetConversation = () => {
    setMessages([]);
    setConversationId(null);
    setNetworkError(null);
    setDraftText("");
  };

  // Do not render floating public chatbot on portals, auth screens, or demo projects
  if (isPortalOrStandaloneRoute(pathname)) {
    return null;
  }

  // Do not render if administratively disabled
  if (config && config.enabled === false) {
    return null;
  }

  return (
    <aside
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end print:hidden"
      aria-label="Customer Support Assistant"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex flex-col bg-[#0B0D10] sm:absolute sm:inset-auto sm:bottom-[76px] sm:right-0 sm:h-[640px] sm:w-[410px] sm:max-h-[calc(100vh-100px)] sm:rounded-2xl sm:border sm:border-[#29313B] sm:bg-[#11151A] sm:shadow-[0_24px_64px_rgba(0,0,0,0.65)] overflow-hidden"
          >
            {/* Header */}
            <ChatHeader
              onClose={() => setIsOpen(false)}
              onReset={handleResetConversation}
              botName={config?.botName}
            />

            {/* Scrollable Conversation Stream */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto bg-[#0B0D10] sm:bg-[#11151A] scrollbar-thin scrollbar-thumb-[#29313B]"
              role="log"
              aria-live="polite"
            >
              {messages.length === 0 ? (
                <ChatWelcome
                  onSelect={handleSend}
                  heading={config?.welcomeHeading}
                  subtitle={config?.welcomeSubtitle}
                  actions={config?.suggestedQuestions}
                />
              ) : (
                <div className="flex flex-col p-4 sm:p-5">
                  {messages.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      msg={msg}
                      conversationId={conversationId}
                      onLeadComplete={handleLeadComplete}
                      onLeadCancel={handleLeadCancel}
                      onRetry={handleRetry}
                    />
                  ))}
                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Network / Error Notice */}
            {networkError && (
              <div className="flex items-center justify-between px-4 py-2 bg-red-500/10 border-t border-red-500/20 text-red-400 text-xs">
                <span>{networkError}</span>
                <button
                  onClick={() => handleSend(draftText)}
                  className="inline-flex items-center gap-1 font-semibold text-[#10B981] hover:underline"
                >
                  <RefreshCw className="h-3 w-3" /> Retry
                </button>
              </div>
            )}

            {/* Input Composer */}
            <MessageInput onSend={handleSend} disabled={isTyping} draftText={draftText} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center"
      >
        <button
          onClick={() => {
            setIsOpen((prev) => !prev);
            if (!isOpen) setUnreadCount(0);
          }}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close Axivon AI Assistant" : "Open Axivon AI Assistant"}
          className="group relative flex items-center gap-3 rounded-full border border-[#29313B] bg-[#11151A] px-4 py-2.5 sm:px-4 sm:py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.5)] transition-all duration-200 hover:border-[#10B981]/50 hover:bg-[#171C23] hover:shadow-[0_16px_36px_rgba(0,0,0,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]/50"
        >
          {/* Logo / Bot Icon Avatar */}
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#1D242D] border border-[#29313B] text-[#10B981] shadow-xs transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/assets/logo/logo-icon.png"
              alt="Axivon"
              width={18}
              height={18}
              className="h-4 w-4 object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <Sparkles className="h-4 w-4 text-[#10B981] hidden only:block" />
            <span
              className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 rounded-full bg-[#10B981] ring-2 ring-[#11151A]"
              title="Online"
            />
          </div>

          {/* Launcher Text */}
          <div className="flex flex-col text-left pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#F3F5F7] tracking-tight group-hover:text-white transition-colors">
                {config?.botName || "Axivon AI"}
              </span>
            </div>
            <span className="text-[10px] font-medium text-[#7D8795]">Virtual Assistant</span>
          </div>

          {/* Unread Message Pill */}
          {unreadCount > 0 && !isOpen && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#10B981] px-1.5 text-[10px] font-bold text-[#04130E] shadow-sm">
              {unreadCount}
            </span>
          )}

          {/* Expand/Collapse Chevron or Message Icon */}
          <div className="ml-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#1D242D] text-[#A7B0BC] transition-colors group-hover:bg-[#29313B] group-hover:text-[#10B981]">
            {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
          </div>
        </button>
      </motion.div>
    </aside>
  );
}
