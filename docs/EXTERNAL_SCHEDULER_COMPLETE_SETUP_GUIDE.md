# AxivonTech — External Scheduler Setup Guide for Administrators
## Step-by-Step Guide for cron-job.org and Vercel Configuration

**Document Reference:** `docs/EXTERNAL_SCHEDULER_COMPLETE_SETUP_GUIDE.md`  
**Target Audience:** Platform Administrators, Operations Leads, Non-Technical Managers  
**Date:** November 5, 2026  
**Status:** ✅ Production Ready  

---

## Overview

This guide explains how to set up an automated, recurring schedule on **cron-job.org** to trigger all of AxivonTech’s background business operations—including attendance alerts, daily work report reminders, task deadlines, pending approvals, and email delivery.

Because our Vercel account is on the **Hobby plan** (which only permits jobs once per day), an external scheduler like **cron-job.org** is used to trigger our backend securely every 15 minutes during company operating hours.

---

## Part 1: Vercel Environment Variables Configuration

Before activating the external scheduler on cron-job.org, you must configure two environment variables in your Vercel project dashboard.

### Step 1.1: Log in to Vercel
1. Go to [https://vercel.com](https://vercel.com) and log in.
2. Select the **AxivonTech** project.
3. Click on **Settings** in the top navigation bar.
4. Click on **Environment Variables** in the left sidebar.

### Step 1.2: Add `CRON_SECRET`
This is the private password that protects your scheduler endpoint.

- **Key:** `CRON_SECRET`
- **Value:** Generate a secure 32-character random string (e.g. `axivon_cron_prod_9f8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d`)
- **Environments:** Check **Production**, **Preview**, and **Development**.
- Click **Save**.

> [!IMPORTANT]
> Keep this secret private. Never share it publicly or commit it to GitHub. You will need to enter this exact value into cron-job.org in Part 2.

### Step 1.3: Add `CRON_DRY_RUN`
This variable controls whether the scheduler runs in **Safe Testing Mode** (calculating who is due without sending real emails/push alerts) or **Live Mode** (sending actual notifications).

- **For Initial Testing (Safe Mode):**
  - **Key:** `CRON_DRY_RUN`
  - **Value:** `true`
  - **Environments:** Check **Production**, **Preview**, and **Development**.
  - Click **Save**.

- **For Live Production Mode (After Testing):**
  - Change the value to: `false`
  - Click **Save**.

### Step 1.4: Redeploy Vercel
After saving environment variables in Vercel, go to the **Deployments** tab, click the three dots (`...`) on your latest deployment, and click **Redeploy** to ensure the new environment variables take effect.

---

## Part 2: cron-job.org Setup Instructions

Follow these exact steps to configure your free account on **cron-job.org**:

### Step 2.1: Create a Free Account
1. Open [https://cron-job.org](https://cron-job.org) in your browser.
2. Sign up for a free account or log in to your existing account.

### Step 2.2: Create a New Cronjob
1. In the top navigation, click on **Cronjobs**.
2. Click the green button labeled **Create Cronjob**.

### Step 2.3: Fill in Basic Details
- **Title:** `AxivonTech Central Scheduler`
- **URL:** `https://axivontech.in/api/internal/cron/process-due-jobs`
  *(If testing on a Vercel preview deployment, use `https://your-preview-url.vercel.app/api/internal/cron/process-due-jobs`)*

### Step 2.4: Set the Schedule
- **Schedule Type:** Select **Every X minutes** or **User-defined**.
- **Execution Interval:** Choose **Every 15 minutes**.
- **Timezone:** Select **Asia/Kolkata (IST, UTC+05:30)**.
- **Days:** Select **Monday through Saturday** (Mon, Tue, Wed, Thu, Fri, Sat). Leave Sunday unchecked (weekly off).
- **Time Window (Optional):** You can set it to run between **09:30 AM and 09:15 PM IST**, or let it run continuously (the backend automatically knows when business hours start and end).

### Step 2.5: Configure Request Method & Security Headers
Scroll down to the **Advanced** or **HTTP Details** section:

1. **Request Method:** Change from `GET` to **`POST`**.
2. Under **Request Headers**, click **Add Header**:
   - **Header Name:** `Authorization`
   - **Header Value:** `Bearer YOUR_CRON_SECRET_VALUE_HERE`  
     *(Replace `YOUR_CRON_SECRET_VALUE_HERE` with the exact `CRON_SECRET` you set in Vercel Step 1.2)*
3. Click **Add Header** again to add a second header:
   - **Header Name:** `Content-Type`
   - **Header Value:** `application/json`

### Step 2.6: Configure Timeout & Failure Alerts
- **Request Timeout:** Set to `30 seconds`.
- **Redirects:** Select `Follow redirects`.
- **Failure Notifications:** Check `Send email on failure` and enter your email address so you are notified immediately if the server ever encounters an issue.

### Step 2.7: Save the Cronjob
Click the **Create** button at the bottom of the page.

---

## Part 3: Testing and Verification Procedure

### Step 3.1: Trigger a Safe Test Run
1. In the cron-job.org dashboard list, locate **AxivonTech Central Scheduler**.
2. Click the **Test Run** icon (the green play arrow `▶`).
3. View the response log popup.

### Step 3.2: Verify Successful Response
You should see **HTTP Status: 200 OK** and a JSON response body similar to:
```json
{
  "success": true,
  "dryRun": true,
  "processed": 8,
  "sent": 6,
  "skipped": 2,
  "failed": 0,
  "durationMs": 320,
  "executionId": "cron_1762319000123_abcde"
}
```

- `"dryRun": true` confirms the system is in safe mode—it checked attendance, work reports, and tasks, counted eligible users, but **did not send real messages**.
- `"durationMs": 320` confirms the execution finished in less than 1 second, well within cron-job.org's 30-second limit.

### Step 3.3: Verify Security Protection
To prove that unauthorized users cannot trigger your scheduler:
1. Temporarily change one character in the `Authorization` header in cron-job.org.
2. Click **Test Run**.
3. Verify that the server returns **HTTP Status: 401 Unauthorized**:
   ```json
   {
     "success": false,
     "error": {
       "code": "API_ERROR",
       "message": "Unauthorized: Invalid cron authentication credentials."
     }
   }
   ```
4. Restore the correct `Authorization` header.

---

## Part 4: Activating Live Production Mode

Once you have verified that the test run succeeds with `HTTP 200`:

1. Open your **Vercel Dashboard > Settings > Environment Variables**.
2. Edit `CRON_DRY_RUN`:
   - Change value from `true` to `false`.
3. Save and redeploy the latest commit in Vercel.
4. From that point on, cron-job.org will automatically trigger real In-App notifications, mobile push alerts, and emails at the scheduled business times.

---

## Part 5: Troubleshooting & FAQ

### What happens if cron-job.org is temporarily down?
AxivonTech reminders are completely date-stamped and idempotent. The moment cron-job.org comes back online and makes its next call, the backend automatically evaluates who is currently due and delivers the appropriate notifications.

### Will employees get spammed if the scheduler runs every 15 minutes?
**No.** Every alert (attendance, 5:00 PM report reminder, 7:00 PM overdue alert) enforces a **24-hour deduplication key**. Once an employee receives their 10:00 AM check-in reminder, subsequent scheduler runs throughout that day will automatically skip them.

### What if an employee already checked in before 10:00 AM?
The backend checks `db.attendance` first. If the employee has already marked attendance, they are completely exempted and no reminder is generated.

### What if an employee submits their work report early at 4:30 PM?
The backend checks `db.workReport` first. If today's report has already been submitted, the 5:00 PM reminder and 7:00 PM overdue alert are automatically stopped.

### How do I rotate the `CRON_SECRET`?
1. Generate a new secret.
2. Update `CRON_SECRET` in Vercel and redeploy.
3. Update the `Authorization` header in cron-job.org to match the new secret.
