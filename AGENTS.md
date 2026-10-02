# Marsha Security Workspace — Agent Guidelines & System Context

This document is the single source of truth for AI agents working in this repository. Read this to understand the entire architecture, database, conventions, and operational rules without needing the user to explain context.

---

## 1. Project & Stack Overview
* **Application**: Marsha Security Workspace (`marsha-workspace`)
* **Organization**: `Mqrsha-security` (`https://github.com/Mqrsha-security`)
* **Production Deployment**: Vercel Serverless (`https://marsha-workspace-two.vercel.app`)
* **Backend**: Laravel 11 / 13 (PHP 8.5)
* **Frontend**: Inertia.js React 19, Tailwind CSS, Lucide Icons, Radix UI / shadcn/ui components
* **Bundler**: Vite 8 (`npm run build`)
* **Repository**: `git@github.com:Mqrsha-security/marsha-workspace.git` (branch `main`)

---

## 2. Database & Environments

### Production Database (Neon PostgreSQL Serverless)
* **Provider**: Neon Tech (AWS us-east-2)
* **Host**: `ep-rapid-hat-b4bz5jm0-pooler.c-6.us-east-2.aws.neon.tech`
* **Database**: `neondb` | **Port**: `5432` | **User**: `neondb_owner`
* **Connection Format**:
  `postgresql://neondb_owner:<NEON_PASSWORD>@ep-rapid-hat-b4bz5jm0-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require`
* **Secrets Policy**: Passwords and secrets must NEVER be pushed to Git. Production credentials reside securely in Vercel Environment Variables (`DB_PASSWORD`, `DATABASE_URL`). For local operations needing Neon, use `.env` or local non-committed scratch configuration.
* **Vercel Migration Rule**: Vercel does NOT execute `php artisan migrate` on deployment. When creating or altering database tables, execute the SQL/DDL directly on Neon (e.g. via a Node.js script using `pg` in non-committed scratch) in addition to committing the Laravel migration file.

### Local Database & Testing
* Local environment uses MySQL or SQLite (configured in `.env`).
* Automated tests run via `php artisan test` (49 tests, all must pass).

---

## 3. Core Database Tables & Models
1. `users`: `id`, `name`, `email`, `password`, `identifier`, `role`, `avatar_color`, `last_seen_at`, `timestamps`.
   * System Accounts: `marshaSec@adit.ta` (Aditya Rahman, Security Architect), `marshaSec@risti.ta` (Fahristi Dewi Khadijah, Project Manager).
   * Appends: `photo_url`, `is_active` (`last_seen_at >= now() - 25s`), `last_seen_formatted`.
2. `tasks`: `id`, `title`, `description`, `link`, `descriptions` (jsonb), `links` (jsonb), `tabs` (jsonb), `category`, `status` (`todo`, `in_progress`, `revisi`, `done`), `priority` (`low`, `medium`, `high`, `urgent`), `created_by`, `assigned_to`, `due_at`, `completed_at`, `revision_notes`, `timestamps`.
3. `workspace_apps`: `id`, `title`, `app_name`, `category`, `description`, `links` (jsonb), `icon_key`, `created_by`, `timestamps`.
4. `meetings`: `id`, `title`, `category`, `meeting_date`, `start_time`, `end_time`, `location`, `status`, `attendees` (jsonb), `points` (jsonb), `action_items` (jsonb), `reference_links` (jsonb), `images` (jsonb), `notes`, `created_by`, `timestamps`.
5. `meeting_notes`: `id`, `meeting_id` (foreignId to `meetings` nullable on delete set null), `title`, `content`, `key_takeaways` (jsonb), `action_items` (jsonb), `created_by`, `timestamps`.
   * Notes module (`/notes`) is separated from meetings and explicitly references which meeting session it documents.
6. `app_notifications`: `id`, `user_id`, `sender_id`, `task_id`, `type`, `title`, `message`, `is_read`, `read_at`, `timestamps`.
7. `task_comments`: `id`, `task_id`, `user_id`, `comment`, `timestamps`.

---

## 4. Key Subsystems & Rules

### A. Real-Time Presence (`resources/js/hooks/usePresence.js`)
* Active visible tabs send heartbeat to `POST /presence/ping` every 6 seconds.
* Tab hide, minimize, app switch, or close on mobile/desktop instantly triggers keepalive `fetch` and `sendBeacon` to `POST /presence/offline?user_id=${id}`.
* `/presence/offline` is public and exempted from CSRF and auth middleware to guarantee delivery on mobile app unload.
* Active threshold is 25 seconds (`User::getIsActiveAttribute()`).

### B. Pixel Office Simulation (`resources/js/components/PixelOffice.jsx`)
* Retro 8-bit SVG canvas showing Aditya and Fahristi working or sleeping at their desks.
* Active = typing, monitors on, steaming mugs. Offline = slumped with floating Zzz.
* **CRITICAL RULE**: Adit and Risty **ONLY** chat when **BOTH** are online (`isAditActive && isRistyActive`). If either is offline, no speech bubbles (`currentDialogue = null`) and badge shows `chat:waiting`. When both wake up/online, they chat dynamically from the 100-dialogue pool in `resources/js/lib/officeChatPool.js`.

### C. Themes & Responsiveness
* 3 Themes: Light, Dark, Pastel Pink (`pink` theme in `ThemeToggle.jsx`).
* Mobile: Fully responsive navigation, drawer, task modal, and presence tracking.

---

## 5. Development & Deployment Commands
* Run tests: `php artisan test`
* Build frontend: `npm run build`
* Deploy: `git add -A && git commit -m "..." && git push origin main` (auto-deploys to Vercel)
* Detailed architectural documentation: `docs/ARCHITECTURE.md`
