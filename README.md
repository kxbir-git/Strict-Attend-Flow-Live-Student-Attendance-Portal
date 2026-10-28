<p align="center">
  <a href="https://github.com/kxbir-git/Strict-Attend-Flow-Live-Student-Attendance-Portal">
    <img src="public/logo.png" alt="Strict Attend Flow Logo" width="120" height="120" style="border-radius: 24px; box-shadow: 0 10px 25px rgba(234, 88, 12, 0.25);" />
  </a>
</p>

<h1 align="center">Strict Attend Flow — Live Student Attendance Portal</h1>

<p align="center">
  <strong>Production-grade, single web attendance portal featuring THREE strictly isolated role-based portals (Admin, Teacher, Student)</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-Light%20White-06b6d4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-PostgreSQL-3982CE?logo=prisma" alt="Prisma ORM" />
  <img src="https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render" alt="Deploy to Render" />
</p>

---

## 🚀 Key Architectural Pillars

### 1. Three Isolated Role Perimeters
- `/admin/*` → Full institutional governance, timetable overrides, user & period management, leave adjudication, audit trails, and defaulter screening (<75%). (Cannot edit submitted attendance).
- `/teacher/*` → Weekly timetable grid builder (Mon–Sat × Periods 1–8), date+period auto-load session runner, live rotating QR + 4-digit passcode, permanent one-time mark lock, instant CSV/WhatsApp share, and student leave review.
- `/student/*` → Strict read-only own attendance profile, overall & per-subject % (with `<75%` red warnings), calendar heatmap, live lecture banner, self-mark via in-class passcode, AI assistant, absence leaves, signed PDF certificates, and buffer tracking.
- **Server Enforcement**: All student queries strictly append `WHERE studentId = session.user.studentId`. Student ID is derived directly from the NextAuth JWT token and ignores any external request query parameters.

### 2. Core Teacher Flow (Date + Period Auto-Detection)
1. Teacher selects **Date** (today or past up to 7 days, future dates strictly rejected) + **Period** (1–8).
2. System automatically queries `TimetableSlot` to resolve: `Class`, `Subject`, `Room`, and `Time Slot`.
3. Preview generated: `BCA-3A | DBMS | Period 3 | Room 204 | 10:45–11:30`.
4. Teacher clicks **Start Attendance** &rarr; `AttendanceSession` created with status `OPEN`. Grid opens defaulting all students to **ABSENT** until marked.

### 3. Irreversible One-Time Submit Lock (Strict for ALL Roles)
- Status transitions: `OPEN` &rarr; `SUBMITTED` (permanent).
- On submission, `submittedAt = now()` and records become **permanently immutable**.
- Database middleware intercepts and blocks any `UPDATE` or `DELETE` on `AttendanceRecord` where `parent session.status = 'SUBMITTED'` — for **ALL roles including Admin** (`409 Conflict`).
- Attempting to take attendance for the same `(classId, date, periodNo)` is blocked with `409 Already submitted. Cannot re-mark.`
- Background auto-submit safety net (`/api/cron/auto-submit`) finalizes sessions if left open 15 minutes past slot end time.

### 4. Smart Student Features
- **AI Attendance Assistant** (`/student/assistant`): Grounded chatbot answers questions like *"Kitni classes miss kar sakta hu DBMS me?"*, *"Mera attendance kitna hai?"*, and *"Kaun se subjects risky hain?"* using the student's real data. Daily rate limit of 20 queries/day/student enforced server-side.
- **Absence & Medical Leave Workflow** (`/student/leave`): Apply for leaves with reason and medical attachment link. Teachers/Admins review at `/teacher/leave-requests` and `/admin/leave-requests`. Upon approval, matching records auto-transition to `APPROVED_LEAVE` (counted as attended, excluded from absent).
- **Official Attendance Certificate (PDF)** (`/student/certificate`): Generates an HMAC-SHA256 digitally-signed PDF via `@react-pdf/renderer` complete with verification QR link (`/verify/:token`). Watermarked as *"UNOFFICIAL COPY"* if attendance is below 75%.
- **Public Certificate Verification** (`/verify/:token`): Public verification endpoint and page validating HMAC cryptographic integrity.
- **Attendance Buffer Tracking**: Real-time formula calculates spare absences allowed before breaching 75%, and consecutive classes needed to recover if below 75%. Color-coded badges (Green: Safe, Yellow: Caution, Red: Defaulter).
- **Calendar & Schedule** (`/student/calendar`): Full weekly timetable view, "Next Class Today" live countdown, "Add to Google Calendar" button, and `.ics` export for Apple Calendar and Outlook.
- **Gamification & Engagement** (`/student/achievements`): Attendance streaks (current & longest), badges (*Perfect Month*, *Never Late*, *Early Bird*, *Comeback Hero*, *10-Day Streak*), and personal goal progress bar.
- **Anonymized Peer Comparison**: Displays division standing percentile (e.g., *"Top 20% of your class"*) with zero privacy leakage.
- **Multi-Language Support**: English, Hindi (हिंदी), Marathi (मराठी), Tamil (தமிழ்), Telugu (తెలుగు), Bengali (বাংলা) UI strings with instant switching in settings.
- **PWA & Offline Queue Sync**: Service worker caching and offline attendance mark queue. Replays attendance marks to `/api/attendance/mark` automatically when network connectivity is restored.
- **Parent / Guardian Digest** (`/parent/:token`): Opt-in magic link for parents to review attendance % and directly email teachers without requiring an account.

---

## 🔐 Permission Matrix

| Action | Student | Teacher | Admin |
| :--- | :---: | :---: | :---: |
| **View own attendance** | ✓ | — | ✓ |
| **View others' attendance** | ✗ | own classes only | ✓ |
| **Self-mark via in-class code/QR** | ✓ | — | — |
| **Apply for leave** | ✓ | — | ✓ |
| **Approve / Reject leave** | ✗ | ✓ (own subjects) | ✓ (all) |
| **Mark attendance for class** | ✗ | ✓ | ✗ |
| **Start / Submit attendance session**| ✗ | ✓ | ✗ |
| **Edit SUBMITTED records** | ✗ (409) | ✗ (409) | ✗ (409) |
| **Build weekly timetable** | ✗ | ✓ (own) | ✓ (all) |
| **Manage users, classes & subjects**| ✗ | ✗ | ✓ |
| **Download signed PDF certificate** | ✓ | — | ✓ |
| **Export own attendance CSV** | ✓ | — | ✓ |
| **Export class / subject CSV** | ✗ | own sessions only| ✓ (all) |
| **Use AI Attendance Assistant** | ✓ (own data only) | — | — |
| **View mutation audit log** | ✗ | ✗ | ✓ |
| **View analytics & reports** | own only | own classes only | ✓ |
| **Manage period timings & health**| ✗ | ✗ | ✓ |

---

## 🛠️ Complete Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons + System Sans Font
- **Database & ORM**: PostgreSQL + Prisma ORM (with submit lock middleware)
- **Authentication**: NextAuth.js (Credentials Provider + Role-Based JWT)
- **Validation**: Zod (100% of API payloads strictly validated)
- **State & Data Fetching**: Zustand + TanStack React Query v5
- **Visual Analytics**: Recharts
- **PDF Generation**: `@react-pdf/renderer` (official signed certificates)
- **Calendar**: `ical-generator` (RFC 5545 standard `.ics` exports)
- **Realtime**: Socket.io / SSE Realtime polling
- **Structured Logging**: Pino + Pino-Pretty
- **Testing**: Vitest (Unit Tests) + Playwright (E2E Tests)

---

## 🔑 Pre-Configured Demo Credentials

The login portal (`/login`) features **1-click role presets** to instantly populate credentials:

| Role | Name | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Dr. Arvind Mehta (Director) | `admin@portal.edu` | `adminPassword123!` | `/admin/dashboard` |
| **TEACHER** | Prof. Rajesh Sharma | `rajesh.sharma@portal.edu` | `teacherPassword123!` | `/teacher/dashboard` |
| **STUDENT** | Rahul Verma (BCA3A-001) | `student.rahul@portal.edu` | `studentPassword123!` | `/student/dashboard` |

*Additional 4 teachers (`ananya.roy@portal.edu`, `vikram.malhotra@portal.edu`, `sunita.deshmukh@portal.edu`, `amit.verma@portal.edu`) and 49 students seeded in the database.*

---

## ⚙️ Setup & Local Run

### 1. Configure Environment Variables
Create a `.env` file from `.env.example`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/strict_attend_flow?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="strict-attend-flow-super-secure-jwt-secret-key-32chars"
QR_HMAC_SECRET="qr-hmac-rotating-secret-key-999123847"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
DEFAULTER_THRESHOLD_PERCENT="75"
CRON_SECRET="cron-secret-key-123456"
OPENAI_API_KEY="" # Optional: If unset, assistant uses built-in grounded rule-engine
```

### 2. Push Schema & Seed Data
```bash
# Push schema to PostgreSQL (or Neon/Supabase)
npx prisma db push

# Seed 3 classes, 10 subjects, 50 students, 5 teachers, timetable, leaves, notifications, and 1 month history
npm run prisma:seed
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🧪 Testing Suite

### Unit Tests (Vitest)
Executes all 20 unit tests covering attendance %, session lifecycle, QR token validation, submit lock middleware, CSV escaping, slot unique constraints, role guard security, certificate HMAC verification, leave auto-adjustments, and buffer mathematics:
```bash
npm test
```
Result: **20 passed (100% pass rate)** in < 2 seconds.

### End-to-End Tests (Playwright)
Validates cross-portal perimeter isolation, login redirects, student read-only protection, teacher session runners, and admin oversight:
```bash
npm run test:e2e
```

---

## 🌐 Deploy to Vercel + Neon / Supabase

1. Push code to your GitHub repository.
2. Import project in **Vercel**.
3. Supply Environment Variables:
   - `DATABASE_URL`: Connection string to your cloud PostgreSQL database.
   - `NEXTAUTH_URL`: Your production URL (`https://your-domain.vercel.app`).
   - `NEXTAUTH_SECRET`: Random 32+ character key.
   - `QR_HMAC_SECRET`: Random 32+ character key.
4. Set Build Command:
   ```bash
   prisma generate && next build
   ```
5. Deploy! Vercel Cron will trigger `/api/cron/auto-submit` every 15 minutes.
