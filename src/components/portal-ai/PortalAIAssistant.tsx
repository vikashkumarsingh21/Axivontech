"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles,
  Bot,
  X,
  Send,
  Loader2,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { PortalAIMessage, PortalAssistantConfig, SuggestedAction } from "@/lib/portal-ai/types";

interface PortalAIAssistantProps {
  portalRole?: string;
  initialOpen?: boolean;
}

export function PortalAIAssistant({ portalRole, initialOpen = false }: PortalAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [config, setConfig] = useState<PortalAssistantConfig | null>(null);
  const [messages, setMessages] = useState<PortalAIMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch role-specific assistant configuration
  useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      try {
        const res = await fetch("/api/v1/portal-ai/config");
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json?.data) {
            setConfig(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to load portal AI config:", err);
      }
    }
    loadConfig();
    return () => {
      isMounted = false;
    };
  }, [portalRole]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, scrollToBottom]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSend = async (overridePrompt?: string) => {
    const textToSend = (overridePrompt || inputValue).trim();
    if (!textToSend || loading) return;

    setError(null);
    const userMsg: PortalAIMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!overridePrompt) setInputValue("");
    setLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/v1/portal-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, history }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      const json = await res.json();
      const aiData = json.data;

      const botMsg: PortalAIMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: aiData.reply || "I have retrieved your requested records.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        toolsExecuted: aiData.toolsExecuted,
        suggestedActions: aiData.suggestedActions,
        isDraft: Boolean(aiData.draftData),
        draftData: aiData.draftData,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setError(err.message || "Failed to communicate with assistant.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  const isGold = config?.accentColor === "gold";
  const accentClass = isGold
    ? "text-[#D6B779] bg-[#D6B779]/10 border-[#D6B779]/20"
    : "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20";
  const accentButton = isGold
    ? "bg-[#D6B779] hover:bg-[#c4a466] text-[#1c1404]"
    : "bg-[#10B981] hover:bg-[#059669] text-[#04130E]";

  return (
    <aside aria-label="Portal AI Copilot" className="fixed bottom-6 right-6 z-50">
      {/* Floating Panel (when expanded) */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="portal-ai-title"
          className="mb-3 flex h-[580px] max-h-[85vh] w-[92vw] sm:w-[420px] flex-col overflow-hidden rounded-2xl border border-[#29313B] bg-[#101318] shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1E2530] bg-[#151A21] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg border ${accentClass}`}
              >
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3
                    id="portal-ai-title"
                    className="text-xs font-bold uppercase tracking-wider text-[#F3F5F7]"
                  >
                    {config?.botName || "Axivon Copilot"}
                  </h3>
                  <span
                    className={`rounded-full border px-1.5 py-0.2 text-[9px] font-semibold ${accentClass}`}
                  >
                    {config?.role || "PORTAL"}
                  </span>
                </div>
                <p className="text-[10px] text-[#7E8997]">
                  {config?.tagline || "Role-Aware Intelligence Layer"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                title="Clear conversation"
                className="rounded-lg p-1.5 text-[#7E8997] hover:bg-[#202833] hover:text-[#F3F5F7] transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="rounded-lg p-1.5 text-[#7E8997] hover:bg-[#202833] hover:text-[#F3F5F7] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-[#F3F5F7]">
            {/* Welcome Banner */}
            {messages.length === 0 && (
              <div className="rounded-xl border border-[#29313B] bg-[#151A21]/60 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#10B981]" />
                  <span className="font-semibold text-[#F3F5F7] text-xs">
                    {config?.portalName || "Authenticated Workspace"}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#A7B0BC]">
                  {config?.welcomeMessage ||
                    "I am your role-aware copilot. Ask questions regarding your assigned tasks, project deliverables, or business intelligence."}
                </p>

                {/* Suggested Questions */}
                {config?.suggestedQuestions && config.suggestedQuestions.length > 0 && (
                  <div className="pt-2 border-t border-[#1E2530] space-y-1.5">
                    <span className="text-[10px] font-mono text-[#7E8997] uppercase">
                      Suggested Inquiries
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {config.suggestedQuestions.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(s.prompt)}
                          className="rounded-lg border border-[#29313B] bg-[#1B222B] px-2.5 py-1 text-[11px] text-[#A7B0BC] hover:border-[#10B981]/40 hover:bg-[#202833] hover:text-[#F3F5F7] transition-all"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                } space-y-1`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#10B981] text-[#04130E] font-medium rounded-tr-xs"
                      : "bg-[#151A21] border border-[#29313B] text-[#F3F5F7] rounded-tl-xs"
                  }`}
                >
                  {/* Tool execution badge */}
                  {msg.toolsExecuted && msg.toolsExecuted.length > 0 && (
                    <div className="mb-2 flex flex-wrap items-center gap-1 pb-1.5 border-b border-[#29313B]/60 text-[10px] font-mono text-[#7E8997]">
                      <Layers className="h-3 w-3 text-[#10B981]" />
                      <span>Executed: {msg.toolsExecuted.join(", ")}</span>
                    </div>
                  )}

                  {/* Message body (whitespace pre-wrap for formatted markdown) */}
                  <div className="whitespace-pre-wrap text-[11px] leading-relaxed break-words">
                    {msg.content}
                  </div>
                </div>

                <span className="text-[9px] text-[#566171] px-1 font-mono">{msg.timestamp}</span>

                {/* Follow-up suggested actions */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 pl-1">
                    {msg.suggestedActions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(act.prompt)}
                        className="rounded-md border border-[#29313B] bg-[#151A21] px-2 py-0.5 text-[10px] text-[#A7B0BC] hover:bg-[#202833] hover:text-[#F3F5F7] transition-colors"
                      >
                        {act.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading typing indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-[#7E8997] p-2 bg-[#151A21]/40 rounded-xl border border-[#1E2530]">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#10B981]" />
                <span className="text-[11px]">Synthesizing authorized records...</span>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                <p className="font-semibold">Request Notice</p>
                <p className="text-[11px] mt-0.5">{error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="border-t border-[#1E2530] bg-[#151A21] p-3 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask copilot about your records or tasks..."
              disabled={loading}
              className="flex-1 bg-[#101318] border border-[#29313B] rounded-xl px-3 py-2 text-xs text-[#F3F5F7] placeholder-[#566171] focus:outline-none focus:border-[#10B981]/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed ${accentButton}`}
              aria-label="Send message"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            </button>
          </form>
        </div>
      )}

      {/* Floating Pill Launcher */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close Portal Copilot" : "Open Portal Copilot"}
        className="group flex items-center gap-2.5 rounded-full border border-[#29313B] bg-[#101318] px-3.5 py-2 shadow-2xl transition-all hover:border-[#10B981]/50 hover:bg-[#151A21] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]/50"
      >
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full border ${accentClass}`}
        >
          <Bot className="h-3.5 w-3.5" />
        </div>
        <div className="flex flex-col text-left pr-1">
          <span className="text-xs font-bold text-[#F3F5F7] tracking-tight group-hover:text-white">
            {config?.botName || "Axivon Copilot"}
          </span>
          <span className="text-[9px] font-mono text-[#7E8997]">
            {config?.role || "PORTAL AI"}
          </span>
        </div>
        <div className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1B222B] text-[#7E8997] group-hover:text-[#F3F5F7]">
          {isOpen ? <ChevronDown className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
        </div>
      </button>
    </aside>
  );
}
