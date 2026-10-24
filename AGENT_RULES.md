GLOBAL RULES FOR ALL PHASES — AXIVON TECHNOLOGIES WEBSITE (axivontech.in)

Project: Next.js + TypeScript + Tailwind website. Production site is live and has real users and real data. Stability matters more than speed.

ABSOLUTE DON'Ts
1. Never delete, rename, or move existing files/routes/components unless the phase explicitly says so. Prefer additive changes.
2. Never change existing API routes, form submission endpoints, Google Apps Script / Google Sheets integration, Firebase/DB config, authentication/login logic, partner/business-partner flows, or the AI chatbot logic, unless the phase explicitly says so.
3. Never run destructive database commands: no migrations, db push, reset, seed, drop, truncate, or deleting rows. Never modify or print .env values or secrets. Never commit secrets.
4. Never invent facts: no fake testimonials, fake reviews, fake client names, fake prices, fake addresses, fake GST/registration numbers, fake statistics. If a real value is needed and unknown, add a clearly marked TODO placeholder in one config file and tell me.
5. Never upgrade major dependency versions or add heavy new dependencies without asking first.
6. Never refactor unrelated code. Touch only what the phase needs. Keep the existing design language, colors, fonts and layout.
7. Never work on more than the current phase.

ALWAYS DO
1. Work on a new git branch named after the phase (e.g. phase-2-demo-cleanup). Never commit to main directly.
2. Before editing, read the relevant files fully. Before changing any shared component, search the whole project for every place it is used.
3. Show a short plan (files to touch + why) BEFORE making changes.
4. After changes, run: install check, lint, typecheck (tsc --noEmit), and production build (npm run build). All must pass. If a script doesn't exist, say so.
5. Smoke-test these routes after each phase (they must render without errors): / , /about , /services , /industries , /portfolio , /blog , /contact , /reviews , /demo-projects , /business-partner , /login , /privacy-policy , plus 2 service pages and 2 blog posts.
6. Confirm that the contact form, review form and partner-apply form still submit exactly as before (same endpoint, same payload fields). Do not submit fake data to production; verify by code reading and local dev only.
7. End every phase with a REPORT: (a) files changed, (b) what was done, (c) what was intentionally NOT touched, (d) verification results (pass/fail per check), (e) risks or open questions, (f) exact rollback command (git revert/ checkout).
8. After the report, STOP and wait for me to reply "APPROVED". Do not start the next phase on your own.

If anything is ambiguous or risky, STOP and ask me instead of guessing.