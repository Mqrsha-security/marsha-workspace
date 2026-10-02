# Marsha Security Workspace — Architectural & Engineering Handover

## 1. System Overview & Purpose
Marsha Security Workspace (`marsha-workspace`) is a mission-critical project coordination and security engineering platform built for Aditya Rahman (Security Architect) and Fahristi Dewi Khadijah (Project Manager).
* Organization: `Mqrsha-security` (`https://github.com/Mqrsha-security`)
* Git Repository: `git@github.com:Mqrsha-security/marsha-workspace.git` (branch `main`)
* Production URL: `https://marsha-workspace-two.vercel.app`

---

## 2. Technology Stack & Frameworks
* **Backend**: Laravel 11 / 13 (PHP 8.5)
* **Frontend**: Inertia.js React 19, Tailwind CSS, Lucide Icons, Custom SVG Pixel Engine
* **UI Components**: Radix UI / shadcn/ui components (`components/ui/*`), custom `GithubIcon.jsx`
* **Vite Bundler**: Vite 8 with `@vitejs/plugin-react`
* **Hosting / Runtime**: Vercel Serverless Function (`vercel-php@0.9.0`), configured via `vercel.json` and entrypoint `api/index.php`
* **Automated CI/CD**: Pushing to `main` branch automatically triggers Vercel production build and deployment

---

## 3. Database Architecture & Environments

### A. Production Database (Neon PostgreSQL Serverless)
* **Provider**: Neon Tech (AWS us-east-2)
* **Host**: `ep-rapid-hat-b4bz5jm0-pooler.c-6.us-east-2.aws.neon.tech`
* **Database**: `neondb`
* **Port**: `5432`
* **User**: `neondb_owner`
* **Connection Format**:
  `postgresql://neondb_owner:<NEON_PASSWORD>@ep-rapid-hat-b4bz5jm0-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require`
* **Secrets Policy**:
  Production database passwords, tokens, and secrets must NEVER be committed to Git. The connection string is provisioned directly in Vercel Environment Variables (`DB_PASSWORD`, `DATABASE_URL`). For local administrative scripts requiring Neon access, load the secret from `.env` or temporary non-tracked environment variables.
* **Special Driver Configuration**:
  Located in `config/database.php`. Automatically detects `neon.tech` endpoints and passes `require;options='endpoint=...'` with `PDO::ATTR_EMULATE_PREPARES => true`.

### B. Local Development Database
* Configured in `.env` (MySQL / SQLite).
* Test suite runs in-memory SQLite / MySQL via `phpunit.xml` (`php artisan test`).

### C. Critical Vercel Migration Note
> **IMPORTANT FOR AGENTS**: Vercel Serverless deployments do NOT run database migrations automatically on deployment. When creating new migrations or modifying schemas:
> Always execute the schema changes directly against Neon PostgreSQL (using Node.js `pg` driver or an artisan command) in addition to committing Laravel migration files.

---

## 4. Database Schema & Core Tables

### `users`
* `id` (BIGINT, Primary Key)
* `name` (VARCHAR 255)
* `email` (VARCHAR 255, Unique):
  * `marshaSec@adit.ta` (Aditya Rahman, Security Architect)
  * `marshaSec@risti.ta` (Fahristi Dewi Khadijah, Project Manager)
* `password` (VARCHAR 255, Hashed)
* `identifier` (VARCHAR 255, NIM/NIP)
* `role` (VARCHAR 255)
* `avatar_color` (VARCHAR 255)
* `last_seen_at` (TIMESTAMP NULL) — Tracks real-time presence heartbeat
* `timestamps`
* **Model Appends (`User.php`)**:
  * `photo_url`: Maps dynamically to `/images/team/aditya.jpg` and `/images/team/fahristi.jpg`
  * `is_active`: `true` if `last_seen_at >= now() - 25 seconds`
  * `last_seen_formatted`: Formatted relative time (`Online now`, `5 minutes ago`, etc.)

### `tasks`
* `id` (BIGINT, Primary Key)
* `title` (VARCHAR 255)
* `description` (TEXT NULL)
* `link` (VARCHAR 500 NULL)
* `descriptions` (JSONB NULL) — Multi-item structured descriptions
* `links` (JSONB NULL) — Array of external reference links `{ title, url }`
* `tabs` (JSONB NULL) — Modular workstream tabs (`UI`, `Code`, `Assets`, etc.)
* `category` (VARCHAR 255, default: `'Umum'`)
* `status` (VARCHAR 50: `'todo'`, `'in_progress'`, `'revisi'`, `'done'`)
* `priority` (VARCHAR 50: `'low'`, `'medium'`, `'high'`, `'urgent'`)
* `created_by` (BIGINT, Foreign Key -> `users.id`)
* `assigned_to` (BIGINT, Foreign Key -> `users.id`)
* `due_at` (TIMESTAMP)
* `completed_at` (TIMESTAMP NULL) — Automatically stamped when status transitions to `done`
* `revision_notes` (TEXT NULL)
* `timestamps`

### `workspace_apps`
* `id` (BIGINT, Primary Key)
* `title` (VARCHAR 255)
* `app_name` (VARCHAR 255) — e.g., Google Docs, Google Drive, Figma, Academic Journals, Overleaf, GitHub
* `category` (VARCHAR 255) — Documentation, Cloud Storage, Design System, Research, Development
* `description` (TEXT NULL)
* `links` (JSONB NULL) — Array of tool URLs `{ title, url }`
* `icon_key` (VARCHAR 50) — Used by `AppBrandIcon` component for brand logos
* `created_by` (BIGINT, Foreign Key -> `users.id` NULL ON DELETE)
* `timestamps`

### `meetings`
* `id` (BIGINT, Primary Key)
* `title` (VARCHAR 255) — Topik pertemuan / judul bimbingan
* `category` (VARCHAR 100) — Bimbingan Skripsi, Security Architecture, Progress Review, Sidang / Seminar, Code Review
* `meeting_date` (DATE) — Tanggal pelaksanaan
* `start_time` (VARCHAR 10 NULL) — Jam mulai
* `end_time` (VARCHAR 10 NULL) — Jam selesai
* `location` (VARCHAR 255) — Lokasi ruangan atau tautan platform meeting
* `status` (VARCHAR 50) — scheduled, ongoing, completed, cancelled
* `attendees` (JSONB NULL) — Array nama peserta pertemuan
* `points` (JSONB NULL) — Array poin pembahasan notulensi
* `action_items` (JSONB NULL) — Array tugas tindak lanjut `{ task, assignee, completed }`
* `reference_links` (JSONB NULL) — Array tautan dokumen `{ title, url }`
* `images` (JSONB NULL) — Array foto whiteboard / diagram `{ url, caption }`
* `notes` (TEXT NULL) — Catatan umum evaluasi
* `created_by` (BIGINT, Foreign Key -> `users.id` NULL ON DELETE)
* `timestamps`

### `app_notifications`
* `id` (BIGINT, Primary Key)
* `user_id` (BIGINT, Foreign Key -> `users.id`)
* `sender_id` (BIGINT, Foreign Key -> `users.id` NULL ON DELETE)
* `task_id` (BIGINT, Foreign Key -> `tasks.id`)
* `type` (VARCHAR 255)
* `title` (VARCHAR 255)
* `message` (TEXT)
* `is_read` (BOOLEAN, default: `false`)
* `read_at` (TIMESTAMP NULL)
* `timestamps`

### `task_comments`
* `id` (BIGINT, Primary Key)
* `task_id` (BIGINT, Foreign Key -> `tasks.id`)
* `user_id` (BIGINT, Foreign Key -> `users.id`)
* `comment` (TEXT)
* `timestamps`

---

## 5. Key Subsystems & Business Logic

### A. Real-Time Presence System
* **Client Hook**: `resources/js/hooks/usePresence.js`
* **Heartbeat Ping**: Active tabs POST to `/presence/ping` every 6 seconds to update `last_seen_at = now()`.
* **Instant Offline Trigger**: On mobile tab switch, minimize, screen lock, or tab close, `visibilitychange` (`document.visibilityState === 'hidden'`), `freeze`, and `pagehide` fire a keepalive `fetch` and `navigator.sendBeacon` to `/presence/offline?user_id=${id}`.
* **Server Controller**: `app/Http/Controllers/PresenceController.php` sets `last_seen_at = now() - 5 minutes`.
* **CSRF & Auth Bypass**: `/presence/offline` is exempted from CSRF and auth middleware so beacon requests during mobile browser teardown never fail.
* **Active Window**: 25 seconds threshold (`User::getIsActiveAttribute()`).

### B. Pixel Office Simulation (`PixelOffice.jsx`)
* Retro 8-bit SVG canvas simulating the project HQ with Adit and Risty at dual workstations, server racks, parquet floor, coffee mugs, and animated screens.
* **Animation States**:
  * **Awake**: Typing hands, matrix green code or kanban board screens, steaming coffee cups.
  * **Sleeping**: Slumped forward on desk, closed eyes, dark monitors, floating retro Zzz particles.
* **Chat Rules**:
  * **CRITICAL CONSTRAINT**: The characters **ONLY** chat when **BOTH** Adit and Risty are online (`isAditActive && isRistyActive`).
  * If either one is offline/sleeping, speech bubbles are completely suppressed (`currentDialogue = null`), and status displays `chat:waiting`.
  * When the sleeping partner wakes up, dialogs resume automatically with contextual discussions on active tasks (from 100 conversation pool in `officeChatPool.js`).

### C. Theme Engine
* Supports three modes:
  1. `light`
  2. `dark`
  3. `pink` (pastel, eye-friendly pink for partner preference)
* Controlled via `resources/js/components/ThemeToggle.jsx` and Tailwind classes with `.pink` stylesheet definitions.

### D. Mobile Responsiveness
* Full Android and iOS responsive layouts in `AppLayout.jsx`, `Index.jsx`, `PixelOffice.jsx`, and `Teams/Index.jsx`.
* Top navigation bar, touch-friendly task modals, responsive grids, and drawer menus.

---

## 6. Development & Verification Workflow

```sh
# 1. Run all automated tests (38 tests)
php artisan test

# 2. Compile frontend assets
npm run build

# 3. Commit and deploy to production
git add -A
git commit -m "Your descriptive message"
git push origin main
```
