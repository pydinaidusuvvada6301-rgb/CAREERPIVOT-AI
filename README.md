# CareerPivot AI 🚀
> *"From Your Current Skills to Your Dream Career."*

CareerPivot AI is a full-stack, GenAI-powered career transition platform designed to help students, fresh graduates, and career switchers pivot into high-growth technology roles.

Built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, **Node.js/Express**, **Supabase PostgreSQL & Auth**, and the **Google Gemini API**.

---

## 🌟 Core Architecture & The 7 Functional Modules

| # | Module | Capability & Value Proposition | Status |
|---|---|---|---|
| **1** | **Resume Analyzer** | Multi-format file ingestion (PDF, DOCX, TXT) with 5 MB buffer limits. Surfaces verifiable technical evidence and detects missing keywords without hallucination. | ✅ Operational |
| **2** | **Skill Gap Analyzer** | Evidence-based comparison against verified job descriptions. Classifies competencies into **Matching**, **Missing**, and **Needs Evidence** with explainable weights. | ✅ Operational |
| **3** | **Personalized Learning Roadmap** | Tailored 4-week sprint breaking down weekly objectives into daily tasks, hands-on coding exercises, and tangible deliverables. | ✅ Operational |
| **4** | **Portfolio Project Recommender** | Generates 3 production-grade project blueprints explicitly mapped to bridge identified skill gaps with milestone deliverables. | ✅ Operational |
| **5** | **AI Mock Interview Simulator** | Realistic technical & HR interview drills evaluated on a strict **100-point rubric** (Technical 30, Problem-solving 25, Communication 20, Practical 15, Structure 10) with model benchmark answers. | ✅ Operational |
| **6** | **Progress Analytics** | Interactive dashboard calculating actual milestone completion, daily streaks, assessment scores, and AI schedule calibration. | ✅ Operational |
| **7** | **Job Application Tracker** | Full candidate pipeline tracking response velocity, interview invitations, offers, and conversion rates across job categories. | ✅ Operational |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Recharts, React Router v6.
- **Backend**: Node.js, Express, TypeScript, Zod schema validation, Helmet security headers, CORS, express-rate-limit.
- **AI Engine**: Google Gemini API (`@google/generative-ai`), structured JSON generation, system instruction constraints, and deterministic fallbacks.
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS), OAuth 2.0 (Google & GitHub), Email/Password, and dev sandbox mode.
- **Deployment**: Vercel (Frontend SPA) + Render (Backend Web Service).

---

## 🚀 Quick Start Guide (For Beginner Developers)

### 1. Prerequisites
- **Node.js**: v18 or higher (Node v24 tested)
- **Git**

### 2. Running Locally in 2 Steps

#### Terminal 1 — Start Backend Server (Port 5000)
```bash
cd server
npm install
npm run dev
```
*The backend will automatically start at `http://localhost:5000` with the `/api/health` check endpoint ready.*

#### Terminal 2 — Start Frontend Client (Port 5173)
```bash
cd client
npm install
npm run dev
```
*Open your browser at `http://localhost:5173` to experience the application.*

---

## 🧪 Testing the 7 Modules in 3 Minutes

1. **Instant Demo Mode**: On the landing page or login page, click **"Sign In as Alex Rivera (Pre-loaded Demo)"** to enter immediately without manual signup.
2. **Resume Analyzer (`/resume-analyzer`)**:
   - Switch to **"Paste Plain Text"**, enter sample resume text, and click **"Execute Resume Analysis"**.
   - Notice the extraction of **Verified Strong Skills** and **Skills Requiring Evidence**.
3. **Skill Gap Analyzer (`/skill-gap`)**:
   - Click **"Proceed to Skill Gap Analysis"**. Select one of the verified sample job listings (e.g. *Junior Full-Stack Engineer* at *Acme Cloud Innovations*).
   - Click **"Execute Skill Gap Analysis"** to see your visual coverage chart and missing skill priorities.
4. **Learning Roadmap (`/roadmap`)**:
   - Explore the 4-week interactive timeline. Check off Day 1 and Day 2 tasks; notice the progress bar update automatically.
5. **Portfolio Projects (`/projects`)**:
   - Inspect the 3 tailored project blueprints. Click **"Full Architecture & Milestones"** to see GitHub deliverables.
6. **AI Mock Interview (`/mock-interview`)**:
   - Click **"Launch Interview Simulator"**. Type your candidate answer in the response box and click **"Submit for Evaluation"**.
   - Review your exact **100-point rubric breakdown** and model benchmark answer.
7. **Job Application Tracker (`/applications`)**:
   - Click **"Log Application"** to add a new company (e.g. *Microsoft*). Observe the response rate and interview conversion rate update in real time.

---

## 🔑 Environment Configuration

### Frontend (`client/.env`)
```ini
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend (`server/.env`)
```ini
PORT=5000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173

# Google Gemini API Key (Get free key from https://aistudio.google.com/)
GEMINI_API_KEY=your-gemini-api-key

# Supabase Server Credentials
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

> **Note on Sandbox Fallbacks**: If you run the project without setting `GEMINI_API_KEY` or `SUPABASE_URL`, the application automatically enters **Local Dev Sandbox Mode**. It produces verified, realistic responses and displays a banner rather than crashing or faking live operations!

---

## 🔒 Security Architecture

For detailed security specifications, refer to [SECURITY.md](file:///c:/Users/pydin/OneDrive/Desktop/CAREERPIVOT%20AI/SECURITY.md). Key protections include:
- Row Level Security (RLS) on all 11 PostgreSQL user tables.
- JWT session verification on all protected endpoints.
- 5 MB file size limit and MIME-type validation for resume uploads.
- Strict Helmet headers, CORS restrictions, and API rate limiting.
- Prompt injection defense by delimiting untrusted user resume text.

---

## 📦 Deployment Guide

### Deploying Frontend to Vercel
1. Push this repository to GitHub.
2. In Vercel, select **Import Project** and choose the `client` directory as the Root Directory.
3. Add Environment Variables:
   - `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase Anon Key
4. Deploy! The included [`client/vercel.json`](file:///c:/Users/pydin/OneDrive/Desktop/CAREERPIVOT%20AI/client/vercel.json) handles client-side routing.

### Deploying Backend to Render
1. In Render, create a new **Web Service** pointing to the repository.
2. Set Root Directory to `server`.
3. Set Build Command: `npm install && npm run build`
4. Set Start Command: `npm start`
5. Add Environment Variables (`GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `FRONTEND_ORIGIN`).
