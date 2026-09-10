# AXIVON TECHNOLOGIES — SECRET ROTATION RUNBOOK

## 1. Scope of Secrets
- `SESSION_SECRET`: JWT session cookie signature key.
- `DATABASE_URL`: Neon PostgreSQL connection string & password.
- `RESEND_API_KEY`: Email delivery API key.
- `STORAGE_SECRET_ACCESS_KEY`: S3 / R2 object storage access key.

---

## 2. Rotation Procedures

### Rotating `SESSION_SECRET`
1. Generate new 64-char random key:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Update `SESSION_SECRET` in hosting environment variable settings.
3. Deploy application. All active users will be prompted to log in again cleanly.

### Rotating `DATABASE_URL` Password
1. Reset database password via Neon Cloud Console.
2. Update `DATABASE_URL` and `DIRECT_URL` in production environment settings.
3. Restart application process. Verify database readiness via `/api/ready`.

### Rotating `RESEND_API_KEY`
1. Create new API key in Resend Dashboard.
2. Update `RESEND_API_KEY` in environment settings.
3. Test email delivery via test email dispatch.
4. Revoke old API key in Resend Dashboard.
