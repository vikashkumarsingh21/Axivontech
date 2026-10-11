# Environment Variable Checklist — Axivon Technologies

**Document Version:** 1.0.0  
**Audit Date:** October 11, 2026  

---

## Variable Audit Table

| Variable | Required For | Status | Scope / Security Notes |
|----------|--------------|--------|------------------------|
| `DATABASE_URL` | Neon PostgreSQL connection string (pooler) | Required for runtime & migrations | Server-side only. Must contain `sslmode=require`. |
| `DIRECT_URL` | Neon direct connection string (unpooled) | Required for Prisma migrations | Server-side only. |
| `SESSION_SECRET` | Jose JWT authentication & session verification | Required for runtime | Server-side only (minimum 32 random characters). |
| `NEXT_PUBLIC_APP_URL` | Canonical links, email activation links, verification URLs | Recommended for runtime | Publicly exposed to client bundle. (e.g. `https://axivontech.in`) |
| `COMPANY_CONTACT_EMAIL` | Default inbox for notifications and leads | Optional | Server-side only. Default: `info@axivontech.in`. |
| `RESEND_API_KEY` | Resend email dispatch integration | Optional / Conditional | Server-side only. If absent, fallback console/logging service is used. |
| `RESEND_FROM` | Sender address for transactional emails | Optional / Conditional | Server-side only. Default: `notifications@axivontech.in`. |
| `EMAIL_WEBHOOK_URL` | External email dispatcher webhook | Optional | Server-side only. |
| `EMAIL_WEBHOOK_SECRET` | Bearer token for email dispatcher webhook | Optional | Server-side only. |
| `GEMINI_API_KEY` | AI Chatbot / Knowledge Engine (Google Gemini) | Optional / Conditional | Server-side only. If absent, chatbot falls back to keyword rule matching. |
| `CRON_SECRET` | Secret protecting `/api/v1/jobs/process` background worker | Required for cron jobs | Server-side only. |
| `ALLOWED_ORIGINS` | CORS configuration for API endpoints | Recommended | Server-side only. |
| `STORAGE_PROVIDER` | Document storage provider selection (`S3` or `LOCAL`) | Recommended | Server-side only. |
| `STORAGE_BUCKET` | AWS S3 or Cloudflare R2 bucket name | Conditional (if S3) | Server-side only. |
| `STORAGE_REGION` | AWS / R2 region | Conditional (if S3) | Server-side only. |
| `STORAGE_ACCESS_KEY_ID` | Storage access key | Conditional (if S3) | Server-side only. |
| `STORAGE_SECRET_ACCESS_KEY` | Storage secret access key | Conditional (if S3) | Server-side only. |
| `NODE_ENV` | Runtime environment identifier (`production`) | Required for runtime | Standard Node.js environment variable. |
