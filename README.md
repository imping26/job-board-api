# Job Board API

A full-featured REST API for a job board platform, built with Node.js, Express, and PostgreSQL. Supports three user roles (job seekers, employers, admins) with authentication, job management, applications, file uploads, and email notifications.

**Live Demo:** [job-board-frontend-peach.vercel.app](https://job-board-frontend-peach.vercel.app/)
**Frontend Repo:** [github.com/imping26/job-board-frontend](https://github.com/imping26/job-board-frontend)

---

## Features

- **Authentication & Authorization** — JWT-based auth with role-based access control (Job Seeker / Employer / Admin)
- **Job Management** — Full CRUD for job postings with search, filtering, and pagination
- **Applications** — Apply to jobs, track application status, prevent duplicate applications
- **Saved Jobs** — Bookmark jobs for later
- **Company Profiles** — Employers manage company info with logo uploads
- **File Uploads** — Company logos handled via Cloudinary with validation (type + size)
- **Email Notifications** — Application confirmations and status updates via Resend
- **Database Transactions** — Atomic operations for critical flows (e.g. accepting an applicant closes the job and rejects others)
- **Input Validation** — Server-side validation on all endpoints
- **Centralized Error Handling** — Consistent error responses, no leaked internal details

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| File Storage | Cloudinary |
| Email | Resend |
| Validation | express-validator |
| Deployment | Railway |

---

## Architecture

The API follows a layered architecture, with each layer having a single responsibility:

```
Request
   │
   ▼
Middleware (helmet, cors, json parsing)
   │
   ▼
Routes ──► Auth middleware ──► Role middleware ──► Validation
   │
   ▼
Controllers (business logic)
   │
   ▼
Prisma ──► PostgreSQL
   │
   ▼
Response  (errors routed to centralized error handler)
```

**Security layers** on protected routes run in order: authentication (verify JWT) → authorization (check role) → validation (check input) → controller.

---

## Database Schema

Six core models with relationships:

- **User** — one table for all roles, distinguished by a `role` enum
- **Company** — one-to-one with an employer (User)
- **Job** — belongs to a Company and an employer; has type/status enums
- **Application** — many-to-many join between User and Job, with a composite unique constraint to prevent duplicate applications
- **SavedJob** — many-to-many join for bookmarked jobs
- **Category** — job categories for filtering

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/auth/me` | Get current user profile |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | List jobs (search, filter, paginate) |
| GET | `/api/jobs/:id` | Get a single job |
| POST | `/api/jobs` | Create a job (Employer) |
| PUT | `/api/jobs/:id` | Update a job (owner only) |
| DELETE | `/api/jobs/:id` | Delete a job + related data (owner only) |
| GET | `/api/jobs/saved` | Get saved jobs |
| POST | `/api/jobs/:id/save` | Save a job |
| DELETE | `/api/jobs/:id/save` | Unsave a job |
| POST | `/api/jobs/:id/apply` | Apply to a job (Job Seeker) |
| GET | `/api/jobs/:id/applications` | View applicants (Employer) |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/applications/mine` | View my applications (Job Seeker) |
| PATCH | `/api/applications/:id/status` | Update status (Employer) |
| PATCH | `/api/applications/:id/accept` | Accept applicant, reject others, close job (transaction) |

### Companies
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/companies` | Create company profile (Employer) |
| GET | `/api/companies/me/profile` | Get my company |
| PUT | `/api/companies/me/profile` | Update my company |
| GET | `/api/companies/:id` | Get a company (public) |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List job categories |
| POST | `/api/upload` | Upload an image to Cloudinary |

---

## Running Locally

### Prerequisites
- Node.js
- PostgreSQL
- Accounts for Cloudinary and Resend (for uploads and emails)

### Setup

```bash
# Clone and install
git clone https://github.com/imping26/job-board-api.git
cd job-board-api
npm install

# Create a .env file (see below)

# Set up the database
npx prisma migrate dev
npx prisma generate

# Seed categories (optional)
node prisma/seedCategories.js

# Start the dev server
npm run dev
```

### Environment Variables

Create a `.env` file in the root:

```
DATABASE_URL="postgresql://user@localhost:5432/jobboard"
JWT_SECRET="your-secret-key"
PORT=8000
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
RESEND_API_KEY="your-resend-key"
FRONTEND_URL="http://localhost:5173"
```

The server runs on `http://localhost:8000`.

---

## Key Technical Decisions

- **Single User table with a role enum** instead of separate tables — avoids duplicated fields and simplifies auth.
- **Composite unique constraints** (`[applicantId, jobId]`) enforce business rules at the database level, not just in code.
- **Transactions** wrap multi-step operations so they either fully succeed or fully roll back — e.g. accepting an applicant atomically closes the job and rejects other applicants.
- **Images stored on Cloudinary**, database only stores URLs — keeps the database lightweight and survives redeploys.
- **Emails sent outside the main flow** (non-blocking, errors logged only) — a failed email never breaks a successful application.

---

## Author

Built by [imping26](https://github.com/imping26)