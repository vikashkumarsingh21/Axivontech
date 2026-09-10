# AXIVON TECHNOLOGIES — DOMAIN, DNS & HTTPS SPECIFICATION

## 1. Domain Architecture
- **Primary Public Site**: `https://axivontech.in`
- **Canonical Alias**: `https://www.axivontech.in`
- **Employee & Admin Portal**: `https://app.axivontech.in`
- **Staging Environment**: `https://staging.axivontech.in`

---

## 2. DNS Record Table

| Host / Subdomain | Type | Target Value | TTL | Purpose |
|---|---|---|---|---|
| `@` | `A` | `76.76.21.21` (or CDN Edge IP) | 300 | Primary apex domain routing |
| `www` | `CNAME` | `cname.vercel-dns.com.` | 300 | WWW subdomain canonical redirect |
| `app` | `CNAME` | `cname.vercel-dns.com.` | 300 | Main Web App & API portal |
| `staging` | `CNAME` | `cname.vercel-dns.com.` | 300 | Isolated staging environment |
| `@` | `TXT` | `v=spf1 include:amazonses.com include:resend.com ~all` | 3600 | SPF email sender authorization |
| `resend._domainkey` | `TXT` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQ...` | 3600 | DKIM email authentication key |
| `_dmarc` | `TXT` | `v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@axivontech.in` | 3600 | DMARC domain protection policy |

---

## 3. HTTPS & TLS Enforcement
1. **TLS Version**: Minimum TLS 1.2, TLS 1.3 preferred.
2. **Automated SSL Renewal**: Managed via Edge Provider (Vercel / Cloudflare Let's Encrypt / AWS Certificate Manager).
3. **HTTP to HTTPS Redirect**: Permanent 301 redirects enforced at Edge layer.
4. **Security Headers Enforced**: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`.
