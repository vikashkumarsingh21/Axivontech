"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, MessageSquare, ChevronDown } from "lucide-react";
import { Message } from "./types";
import { ChatHeader } from "./ChatHeader";
import { ChatWelcome } from "./ChatWelcome";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { MessageInput } from "./MessageInput";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (isOpen && window.innerWidth < 640) {
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

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: data.reply || "I'm having trouble connecting to the server.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isLeadCapture: data.requireLeadCapture || false,
      };

      setMessages((prev) => [...prev, botMsg]);
      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "Something went wrong while processing your message. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLeadComplete = (name: string) => {
    const botMsg: Message = {
      id: Date.now().toString(),
      sender: "bot",
      text: `Thank you, ${name}! Your project requirements have been securely sent to our team. An expert will be in touch with you shortly.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => 
      prev.map(m => m.isLeadCapture ? { ...m, isLeadCapture: false } : m).concat(botMsg)
    );
  };

  const handleLeadCancel = () => {
    setMessages((prev) => 
      prev.map(m => m.isLeadCapture ? { ...m, isLeadCapture: false } : m)
    );
  };

  return (
    <aside className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex flex-col bg-[#0f0f0f] sm:absolute sm:inset-auto sm:bottom-[72px] sm:right-0 sm:h-[640px] sm:w-[380px] sm:max-h-[calc(100vh-120px)] sm:rounded-2xl sm:border sm:border-[#262626] sm:bg-[#0c0c0d] sm:shadow-[0_24px_64px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Header */}
            <ChatHeader onClose={() => setIsOpen(false)} />

            {/* Scrollable Conversation Area */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto bg-[#0a0a0a] scrollbar-thin scrollbar-thumb-[#262626]"
            >
              {messages.length === 0 ? (
                <ChatWelcome onSelect={handleSend} />
              ) : (
                <div className="flex flex-col p-4 sm:p-5">
                  {messages.map((msg) => (
                    <ChatMessage 
                      key={msg.id} 
                      msg={msg} 
                      onLeadComplete={handleLeadComplete}
                      onLeadCancel={handleLeadCancel}
                    />
                  ))}
                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <MessageInput onSend={handleSend} disabled={isTyping} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center mt-2 sm:mt-0"
      >
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setUnreadCount(0);
          }}
          aria-label={isOpen ? "Close AI Assistant" : "Open Axivon AI Assistant"}
          className="group relative flex items-center gap-3 rounded-[20px] sm:rounded-full border border-[#262626] bg-[#141414] px-4 py-3 sm:px-4 sm:py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-300 hover:border-[#e8a064]/40 hover:bg-[#1a1a1c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/50"
        >
          {/* Subtle glow effect behind avatar */}
          <div className="absolute left-[14px] top-[14px] sm:left-4 sm:top-3 h-8 w-8 rounded-full bg-[#e8a064]/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />

          {/* AI Avatar */}
          <div className="relative flex h-8 w-8 items-center justify-center rounded-[10px] sm:rounded-full bg-gradient-to-br from-[#2a1f14] to-[#141414] border border-[#e8a064]/20 text-[#e8a064] shadow-sm transition-transform duration-300 group-hover:scale-105">
            <Sparkles className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4ade80] opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#4ade80] border border-[#141414]" />
            </span>
          </div>

          <div className="flex flex-col text-left pr-2">
            <span className="text-[13px] sm:text-xs font-bold text-[#f4f4f5] tracking-tight group-hover:text-[#e8a064] transition-colors">
              Axivon AI
            </span>
            <span className="text-[11px] sm:text-[10px] font-medium text-[#71717a]">Business Assistant</span>
          </div>

          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#e8a064] text-[10px] font-bold text-[#0f0f0f] shadow-sm">
              {unreadCount}
            </span>
          )}

          <div className="ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#1c1c1e] text-[#a1a1aa] transition-colors group-hover:bg-[#2a1f14] group-hover:text-[#e8a064]">
            {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
          </div>
        </button>
      </motion.div>
    </aside>
  );
}
