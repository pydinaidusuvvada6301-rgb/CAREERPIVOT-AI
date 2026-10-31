# CareerPivot AI — Security Architecture & Guidelines

## 1. Overview
CareerPivot AI adheres to the principle of defense-in-depth across frontend, backend, and database tiers. The application treats all user-supplied resumes, job descriptions, and AI responses as untrusted data.

## 2. Authentication & Authorization
- **Supabase Auth Integration**: Authentication is managed exclusively by Supabase Auth (OAuth 2.0 with Google & GitHub, plus Email/Password).
- **No Plaintext or Custom Password Storage**: Passwords are never handled or stored directly by our application servers.
- **Backend Session Verification**: Every private backend API endpoint validates the incoming Bearer JWT against Supabase Auth.
- **User ID Derivation**: The backend never trusts a `user_id` provided in request bodies or query parameters. The authenticated user ID is derived directly from the verified Supabase JWT (`req.user.id`).
- **Row Level Security (RLS)**: PostgreSQL tables are protected with granular RLS policies ensuring users can only read, insert, update, or delete records where `auth.uid() = user_id`.

## 3. Secret Management & Environment Security
- **Strict Separation of Secrets**:
  - `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` are kept exclusively in backend environment variables (`server/.env`).
  - Frontend only accesses public `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
  - Service-role credentials are never leaked or exposed to frontend code.
- **Git Hygiene**: All `.env` and credential files are added to `.gitignore`. An illustrative `.env.example` is provided with dummy placeholders only.

## 4. API Security & Hardening
- **Helmet**: Comprehensive HTTP security headers enabled (X-Content-Type-Options, Frameguard, Referrer-Policy, Strict-Transport-Security).
- **CORS Protection**: Restricted strictly to authorized frontend origins (e.g. `http://localhost:5173` in development and designated production domains).
- **Rate Limiting**: `express-rate-limit` prevents brute-force abuse and API quota exhaustion on AI-heavy endpoints (e.g. max 50 requests per 15 minutes per IP).
- **Request Validation**: All payload bodies are strictly validated with Zod schemas before processing. Invalid formats are rejected with descriptive 400 Bad Request responses.
- **Input Sanitization & Injection Prevention**: SQL injection is prevented through Supabase parameterized queries; XSS is mitigated via React's JSX escaping and sanitized text handling. Raw HTML from AI is never executed.

## 5. File Upload & Resume Security
- **Size Limits**: Resume file uploads are constrained to a strict 5 MB limit.
- **MIME & Extension Whitelisting**: Only genuine PDF (`application/pdf`), DOCX (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`), and plain text (`text/plain`) are permitted.
- **Prompt Injection Defense**: Text extracted from resumes and job descriptions is treated as untrusted data inputs and framed within delimited quotes in Gemini prompts to prevent system prompt override.

## 6. Error Handling & Privacy
- **Safe Stack Traces**: In production (`NODE_ENV=production`), detailed stack traces and database internal errors are suppressed from API responses.
- **Data Minimization**: AI prompts only receive the extracted professional sections of resumes. Sensitive information such as passwords, SSNs, or payment credentials are never collected or processed.
