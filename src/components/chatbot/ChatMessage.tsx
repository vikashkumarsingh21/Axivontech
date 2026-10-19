"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  User,
  ThumbsUp,
  ThumbsDown,
  Check,
  Copy,
  ExternalLink,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Message } from "./types";
import { LeadCapture } from "./LeadCapture";

/**
 * Safe markdown parser for assistant text formatting:
 * Supports:
 * - Paragraphs & Line Breaks
 * - Links: [label](url)
 * - Bold: **text**
 * - Inline Code: `code`
 * - Bullet Lists: - or *
 * - Numbered Lists: 1.
 */
function renderFormattedMessage(text: string): React.ReactNode {
  // Split into lines first to preserve bullet points and paragraphs
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let currentList: { type: "bullet" | "numbered"; items: React.ReactNode[] } | null = null;

  const flushList = () => {
    if (!currentList) return;
    if (currentList.type === "bullet") {
      nodes.push(
        <ul key={`list-${nodes.length}`} className="my-2 space-y-1.5 pl-4 list-disc marker:text-[#10B981]">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="text-xs sm:text-[13px] leading-relaxed text-[#F3F5F7]">
              {item}
            </li>
          ))}
        </ul>
      );
    } else {
      nodes.push(
        <ol key={`list-${nodes.length}`} className="my-2 space-y-1.5 pl-5 list-decimal marker:text-[#10B981]">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="text-xs sm:text-[13px] leading-relaxed text-[#F3F5F7]">
              {item}
            </li>
          ))}
        </ol>
      );
    }
    currentList = null;
  };

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();

    // Check for bullet list item
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== "bullet") {
        flushList();
        currentList = { type: "bullet", items: [] };
      }
      currentList.items.push(parseInlineFormatting(bulletMatch[1]));
      return;
    }

    // Check for numbered list item
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      if (!currentList || currentList.type !== "numbered") {
        flushList();
        currentList = { type: "numbered", items: [] };
      }
      currentList.items.push(parseInlineFormatting(numberedMatch[2]));
      return;
    }

    // Normal line - flush any active list
    flushList();

    if (!trimmed) {
      // Empty line -> spacing
      nodes.push(<div key={`spacer-${lineIndex}`} className="h-2" aria-hidden />);
      return;
    }

    // Normal paragraph line
    nodes.push(
      <p key={`p-${lineIndex}`} className="my-1 leading-relaxed">
        {parseInlineFormatting(line)}
      </p>
    );
  });

  flushList();
  return nodes;
}

/**
 * Parses inline elements: links, bold text, inline code
 */
function parseInlineFormatting(str: string): React.ReactNode {
  // Regex to match markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(str)) !== null) {
    if (match.index > lastIdx) {
      parts.push(parseBoldAndCode(str.slice(lastIdx, match.index)));
    }
    const label = match[1];
    const href = match[2];
    const isExternal = href.startsWith("http");

    parts.push(
      <a
        key={`link-${match.index}`}
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="inline-flex items-center gap-1 font-medium text-[#10B981] hover:text-[#34D399] underline underline-offset-2 transition-colors"
      >
        <span>{label}</span>
        {isExternal && <ExternalLink className="h-3 w-3 inline-block opacity-75" />}
      </a>
    );
    lastIdx = linkRegex.lastIndex;
  }

  if (lastIdx < str.length) {
    parts.push(parseBoldAndCode(str.slice(lastIdx)));
  }

  return parts;
}

/**
 * Parses bold (**text**) and code (`code`)
 */
function parseBoldAndCode(text: string): React.ReactNode {
  const tokenRegex = /(\*\*([^*]+)\*\*|`([^`]+)`)/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let tokenMatch: RegExpExecArray | null;

  while ((tokenMatch = tokenRegex.exec(text)) !== null) {
    if (tokenMatch.index > lastIndex) {
      elements.push(text.slice(lastIndex, tokenMatch.index));
    }

    if (tokenMatch[2]) {
      // Bold
      elements.push(
        <strong key={`bold-${tokenMatch.index}`} className="font-semibold text-[#F3F5F7]">
          {tokenMatch[2]}
        </strong>
      );
    } else if (tokenMatch[3]) {
      // Code
      elements.push(
        <code
          key={`code-${tokenMatch.index}`}
          className="rounded bg-[#1D242D] border border-[#29313B] px-1.5 py-0.5 font-mono text-[11px] text-[#D6B779]"
        >
          {tokenMatch[3]}
        </code>
      );
    }
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements;
}

export function ChatMessage({
  msg,
  conversationId,
  onLeadComplete,
  onLeadCancel,
  onRetry,
}: {
  msg: Message;
  conversationId?: string | null;
  onLeadComplete: (name: string) => void;
  onLeadCancel: () => void;
  onRetry?: (text: string) => void;
}) {
  const isUser = msg.sender === "user";
  const [feedbackGiven, setFeedbackGiven] = useState<"HELPFUL" | "NOT_HELPFUL" | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFeedback = async (rating: "HELPFUL" | "NOT_HELPFUL") => {
    if (feedbackGiven || !conversationId) return;
    setFeedbackGiven(rating);
    try {
      await fetch("/api/chat/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          rating,
          messageContent: msg.text.slice(0, 300),
        }),
      });
    } catch {
      // Quiet fail on feedback submission failure
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex gap-2.5 w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-250 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Bot Avatar */}
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 mt-1 items-center justify-center rounded-lg bg-[#1D242D] border border-[#29313B] text-[#10B981] shadow-xs">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <div className={`flex flex-col gap-1.5 max-w-[86%] sm:max-w-[82%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Message Bubble */}
        <div
          className={`relative px-4 py-3 text-[13.5px] sm:text-xs leading-relaxed transition-all shadow-xs ${
            isUser
              ? "bg-[#10B981] text-[#04130E] font-medium rounded-2xl rounded-tr-xs"
              : msg.isError
              ? "bg-red-500/10 text-[#F3F5F7] border border-red-500/30 rounded-2xl rounded-tl-xs"
              : "bg-[#171C23] text-[#F3F5F7] border border-[#29313B] rounded-2xl rounded-tl-xs"
          }`}
        >
          {msg.isError && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400 mb-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>Connection Notice</span>
            </div>
          )}

          <div className="whitespace-normal break-words text-pretty">
            {isUser ? msg.text : renderFormattedMessage(msg.text)}
          </div>

          {/* Sources Badge If Available */}
          {msg.sources && msg.sources.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-[#29313B] flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono text-[#7D8795] uppercase tracking-wider">Sources:</span>
              {msg.sources.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1D242D] border border-[#29313B] text-[10.5px] text-[#A7B0BC]"
                >
                  <FileText className="h-3 w-3 text-[#10B981]" />
                  {s.title}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Message Metadata & Assistant Actions */}
        <div className="flex items-center justify-between w-full px-1 text-[11px] text-[#7D8795]">
          <span className="font-mono text-[10px]">{msg.timestamp}</span>

          {!isUser && !msg.isError && (
            <div className="flex items-center gap-2">
              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="p-1 rounded text-[#7D8795] hover:text-[#F3F5F7] hover:bg-[#1D242D] transition-colors"
                title={copied ? "Copied to clipboard" : "Copy response"}
                aria-label="Copy response"
              >
                {copied ? <Check className="h-3 w-3 text-[#10B981]" /> : <Copy className="h-3 w-3" />}
              </button>

              {/* Feedback buttons */}
              {feedbackGiven ? (
                <span className="inline-flex items-center gap-1 text-[10.5px] text-[#10B981] font-medium">
                  <Check className="h-3 w-3" /> Recorded
                </span>
              ) : (
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => handleFeedback("HELPFUL")}
                    className="p-1 rounded text-[#7D8795] hover:text-[#10B981] hover:bg-[#1D242D] transition-colors"
                    title="Helpful response"
                    aria-label="Helpful response"
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleFeedback("NOT_HELPFUL")}
                    className="p-1 rounded text-[#7D8795] hover:text-red-400 hover:bg-[#1D242D] transition-colors"
                    title="Needs improvement"
                    aria-label="Needs improvement"
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Retry Action if error */}
          {msg.isError && msg.canRetry && onRetry && (
            <button
              onClick={() => onRetry(msg.text)}
              className="text-[11px] font-medium text-[#10B981] hover:underline underline-offset-2"
            >
              Retry
            </button>
          )}
        </div>

        {/* Lead Capture Embed */}
        {msg.isLeadCapture && (
          <div className="mt-2.5 w-full animate-in fade-in slide-in-from-top-2 duration-300">
            <LeadCapture onComplete={onLeadComplete} onCancel={onLeadCancel} />
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex h-7 w-7 shrink-0 mt-1 items-center justify-center rounded-lg bg-[#1D242D] border border-[#29313B] text-[#A7B0BC] shadow-xs">
          <User className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  );
}
