# Axivon Technologies — Chatbot Implementation Report

## Date: 2026-09-12

## What Was Audited

- Existing chatbot: `src/components/chatbot/ChatWidget.tsx` (UI)
- Existing API: `src/app/api/chat/route.ts` (keyword-based knowledge matching)
- Existing lead system: `src/app/api/v1/public/leads/route.ts` (full CRM lead capture)
- Existing chatbot sub-components: `ChatHeader`, `ChatMessage`, `MessageInput`, `SuggestedQuestions`, `TypingIndicator`, etc.

## What Was Changed

### 1. Pricing Rule — CRITICAL CHANGE

**Before**: Chatbot exposed specific package pricing (₹25,000 for Starter, ₹60,000 for Web Apps, ₹85,000 for Mobile Apps).

**After**: Chatbot now says:
> "Projects at Axivon Technologies start from ₹5,000. The final cost depends on the project scope, features, design, technology, integrations, and requirements. For an accurate estimate, please connect with our team."

**Files**: `src/app/api/chat/route.ts` (line 37)

### 2. Lead Capture Integration — NEW

**What**: When a visitor expresses project intent (keywords: "project", "build", "create", "need", "hire", "develop"), the chatbot now shows an inline lead capture form.

**How it works**:
1. User says something like "I need a website" or "I want to build an app"
2. API returns `{ reply: "...", showLeadCapture: true }`
3. ChatWidget renders an inline `<LeadCapture>` form
4. Form submits to existing `/api/v1/public/leads` endpoint (no new CRM)
5. On success, confirmation message appears in chat

**Files**:
- `src/components/chatbot/LeadCapture.tsx` (NEW — lead capture form component)
- `src/components/chatbot/ChatWidget.tsx` (MODIFIED — import LeadCapture, render inline form)
- `src/app/api/chat/route.ts` (MODIFIED — intent detection, showLeadCapture flag)

### 3. Intent Detection — NEW

**What**: API now detects project intent keywords and triggers lead capture flow instead of generic fallback.

**Keywords detected**: project, idea, build, create, need, hire, want, develop

**Files**: `src/app/api/chat/route.ts`

## What Was Intentionally Left Unchanged

- **Knowledge Base Structure**: The keyword-matching system was preserved. The existing knowledge entries for web, mobile, AI, cloud, SEO, founders, and contact remain unchanged.
- **ChatWidget UI**: The premium dark-themed UI with animations, typing indicator, suggestions, WhatsApp link, reset, and all visual polish was preserved exactly.
- **No External AI API**: The chatbot does not connect to an external LLM (no OpenAI/Gemini API key configured). It uses the local keyword-based knowledge system. This is clearly documented.

## Chatbot Knowledge Sources

| Topic | Keywords | Source |
|---|---|---|
| Web Development | web, website, react, next.js, frontend, backend | Public services page |
| Mobile Apps | mobile, app, android, ios, react native, flutter | Public services page |
| AI Solutions | ai, machine learning, bot, llm, automation | Public services page |
| Cloud & DevOps | cloud, aws, devops, server, deployment | Public services page |
| SEO & Marketing | seo, digital marketing, ranking, google | Public services page |
| Pricing | price, cost, pricing, quote, budget, estimate | Business policy (₹5,000 minimum) |
| Team | founder, ceo, team, who, vikash, pathan | Public about page |
| Contact | contact, email, phone, whatsapp, location | Public contact page |

## Security Measures

- Rate limiting on `/api/v1/public/leads`: 10 requests per 15 minutes per IP
- Server-side input validation: name required, valid email required, max lengths enforced
- No API keys exposed client-side
- No internal data (CRM, employee, admin) exposed through chatbot
- No prompt injection risk (keyword matching, not LLM)
- Duplicate lead detection (30-day window)

## Remaining Limitations

- **No external AI/LLM backend**: Chatbot uses keyword matching. For true conversational AI, an external API (OpenAI, Gemini, etc.) would need to be configured via environment variables.
- **No conversation persistence**: Chat resets on page refresh. This is by design for a public website widget.

## Tests

- `npm run build` → ✅ Compiled successfully
- `npx vitest run` → ✅ 62 tests passed
