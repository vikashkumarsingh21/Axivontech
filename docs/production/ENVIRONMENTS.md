# AXIVON TECHNOLOGIES — ENVIRONMENT SEPARATION SPECIFICATION

## 1. Environment Isolation Policy
Axivon Technologies enforces strict isolation across Local Development, Staging, and Production environments.

> [!IMPORTANT]
> Production MUST NEVER connect to local developer machines, localhost databases, or development email accounts. Production credentials must be stored exclusively in hosting environment variable secret managers.

---

## 2. Environment Configuration Matrix

| Variable | Local Development | Staging Environment | Production Environment |
|---|---|---|---|
| `NODE_ENV` | `development` | `staging` | `production` |
| `DATABASE_URL` | Neon dev branch / local pg | Neon staging branch | Managed Neon production pooler |
| `DIRECT_URL` | Direct dev pg URL | Direct staging pg URL | Direct production pg URL |
| `SESSION_SECRET` | Dev placeholder secret | Staging random secret | Minimum 64-char random hex secret |
| `RESEND_API_KEY` | Development key / console | Staging test key | Verified Production API key |
| `RESEND_FROM` | `dev@axivon.dev` | `staging-notifications@axivontech.in` | `notifications@axivontech.in` |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | `https://staging.axivontech.in` | `https://axivontech.in,https://app.axivontech.in` |

---

## 3. Environment Variable Enforcement Checklist
1. `.env` is listed in `.gitignore` and must never be committed.
2. `.env.example` provides non-sensitive variable keys for onboarding.
3. Production deployment pipelines read secrets directly from hosting environment variables.
