# 🎓 InternMatch AI — Unified Internship & Placement Platform

> **College Final Year Project | PICT**
> A production-grade, AI-powered platform that connects students, faculty, companies, and administrators into a single, intelligent hiring and placement ecosystem.

---

## 📖 Table of Contents

1. [Project Overview](#-project-overview)
2. [Live Demo Roles](#-live-demo-roles)
3. [Technology Stack](#️-technology-stack)
4. [Google Technologies Used](#-google-technologies-used)
5. [Architecture Overview](#-architecture-overview)
6. [Core Features](#-core-features)
7. [Project Structure](#-project-structure)
8. [Setup & Running Locally](#️-setup--running-locally)
9. [Environment Variables](#-environment-variables)
10. [API Reference](#-api-reference)
11. [Current Project Status](#-current-project-status)
12. [Future Roadmap](#-future-roadmap)
13. [Author](#-author)

---

## 🌟 Project Overview

**InternMatch AI** is a full-stack, multi-role web platform designed to completely digitize the college internship and placement process. It replaces manual, spreadsheet-based workflows with a smart, real-time, AI-driven system.

**The Problem It Solves:**
- Students struggle to discover relevant internships and track applications.
- Companies waste time manually filtering hundreds of resumes.
- Faculty have no centralized tool to post research opportunities or mentor students.
- Admins lack visibility into placement analytics, fairness, and compliance.

**The Solution:**
InternMatch AI provides a role-specific dashboard for every stakeholder, powered by a Google Gemini AI engine that matches candidates, generates interview questions, and provides real-time coaching.

---

## 👤 Live Demo Roles

| Role | Email | Password | Access |
|---|---|---|---|
| **Student** | student@example.com | password123 | Job discovery, applications, mock interview, team formation |
| **Company** | company@example.com | password123 | Campus drives, talent pipeline, hiring analytics |
| **Faculty** | faculty@example.com | password123 | Post research internships, mentor students |
| **Admin** | admin@example.com | password123 | Governance, approvals, fairness analytics |

---

## 🛠️ Technology Stack

### Frontend (`/client`) — React SPA

| Technology | Purpose | Version |
|---|---|---|
| **React** | Core UI framework | 18.3.x |
| **Vite** | Build tool & dev server | 5.2.x |
| **React Router DOM** | Client-side routing (multi-role) | 6.30.x |
| **Tailwind CSS** | Utility-first styling | 3.4.x |
| **Framer Motion** | Page transitions & micro-animations | 11.x |
| **Recharts** | Skill gap charts, hiring funnels, analytics | 3.7.x |
| **Lucide React** | Modern icon library | 0.395.x |
| **Socket.io Client** | Real-time notifications & status updates | 4.7.x |
| **Axios** | HTTP client for API requests | 1.13.x |
| **React Hot Toast** | Toast notifications | 2.6.x |
| **Sentry (Browser)** | Frontend error monitoring & performance | 8.55.x |

### Main Backend API (`/server`) — Node.js + Express

| Technology | Purpose | Version |
|---|---|---|
| **Node.js** | JavaScript runtime | ≥18 |
| **Express.js** | REST API framework | 4.21.x |
| **MongoDB** | Primary NoSQL database | Cloud / Local |
| **Mongoose** | MongoDB ODM (schema & queries) | 8.6.x |
| **JSON Web Token (JWT)** | Stateless authentication | 9.0.x |
| **Bcryptjs** | Password hashing | 2.4.x |
| **Socket.io** | Real-time server (notifications, chat) | 4.7.x |
| **Multer** | File upload handling (resume, images) | 2.0.x |
| **Cloudinary** | Cloud file storage for PDFs & images | 1.41.x |
| **pdf-parse** | Server-side PDF resume extraction | 2.4.x |
| **Mammoth** | Word (.docx) document parsing | 1.11.x |
| **LangChain Core** | AI/LLM abstraction layer | 1.1.x |
| **LangChain Ollama** | Local LLM support (offline models) | 1.2.x |
| **OpenAI SDK** | GPT model integration | 6.21.x |
| **Helmet** | HTTP security headers | 7.1.x |
| **express-rate-limit** | API rate limiting (DDoS protection) | 8.2.x |
| **Joi** | Request payload validation | 18.0.x |
| **Winston** | Structured server logging | 3.19.x |
| **Morgan** | HTTP request logger | 1.10.x |
| **Sentry (Node)** | Backend error tracking & performance | 8.55.x |
| **Jest** | Unit & integration testing | 30.x |
| **Supertest** | API endpoint testing | 7.2.x |
| **mongodb-memory-server** | In-memory MongoDB for tests | 11.0.x |

### AI Microservice (`/ai-backend`) — Python + FastAPI

| Technology | Purpose | Version |
|---|---|---|
| **Python** | Runtime for AI service | ≥3.10 |
| **FastAPI** | High-performance async API framework | 0.110.0 |
| **Uvicorn** | ASGI production server | 0.27.1 |
| **WebSockets** | Real-time bidirectional interview streaming | 12.0 |
| **PyPDF2** | Resume PDF parsing & text extraction | 3.0.1 |
| **python-multipart** | Multipart file upload handling | 0.0.9 |
| **LangChain** | LLM orchestration & prompt management | 0.1.13 |
| **LangChain Groq** | Ultra-fast Groq LPU inference (Llama 3) | 0.0.1 |

---

## ☁️ Google Technologies Used

This project integrates Google technologies as the core AI & hosting layer.

| Google Product | Role in Project | Status |
|---|---|---|
| **Google Gemini 1.5 Flash / Pro** | Powers the AI Assistant chatbot (`callGemini`) embedded in every dashboard for real-time career coaching | ✅ Implemented |
| **Gemini API (REST)** | Direct API calls from the React frontend for instant AI responses — no backend proxy needed | ✅ Implemented |
| **Firebase Hosting** | Deployment target for the React/Vite frontend — provides a global CDN and `.web.app` URL | 🟡 Planned |
| **Google Cloud Run** | Serverless containerized deployment for the Node.js & Python backends | 🟡 Planned |
| **Firebase Authentication** | "Sign in with Google" OAuth flow to complement existing email/password login | 🟡 Planned |
| **Google Cloud Storage** | Future replacement for Cloudinary — store student resumes and profile pictures on GCS | 🔴 Future |
| **Vertex AI** | Advanced AI/ML model deployment for the scoring engine & AI shortlisting logic | 🔴 Future |
| **Google Analytics 4 (GA4)** | User behavior tracking, funnel analysis, and engagement metrics for the admin dashboard | 🔴 Future |

### How Gemini is Integrated Right Now

```javascript
// client/src/main.js (React Frontend)
// The AI Assistant uses the Gemini 2.5 Flash API directly
async function callGemini(prompt, systemInstruction = "") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  // Streams intelligent, role-aware career coaching responses
}
```

Each user role gets a **context-aware Gemini prompt**:
- **Students** → Interview tips, resume advice, skill gap analysis
- **Companies** → Candidate analytics, JD optimization, hiring insights
- **Faculty** → Research opportunity guidance, student progress
- **Admins** → Platform governance, fairness checks

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     INTERNMATCH AI PLATFORM                     │
├──────────────┬──────────────────────┬───────────────────────────┤
│   FRONTEND   │    MAIN BACKEND API  │    AI MICROSERVICE        │
│  React/Vite  │    Node.js/Express   │    Python/FastAPI         │
│  Port: 5173  │    Port: 5000        │    Port: 8000             │
├──────────────┤                      │                           │
│ Tailwind CSS │   MongoDB (Mongoose) │   WebSocket Streaming     │
│ Framer Motion│   JWT Auth           │   LangChain + Groq        │
│ Recharts     │   Socket.io Server   │   PyPDF2 (Resume Parse)   │
│ Gemini API ──┼──▶ LangChain/OpenAI  │   Gemini (AI Interviews)  │
│ Socket.io ◀──┼── Real-time Events  │                           │
└──────────────┴──────────────────────┴───────────────────────────┘
         │                    │                      │
         ▼                    ▼                      ▼
   Firebase Hosting    MongoDB Atlas         Google Cloud Run
   (Frontend CDN)      (Database)           (AI Services)
```

---

## 🚀 Core Features

### 🔐 Multi-Role Authentication (RBAC)
- JWT-based stateless authentication with bcrypt password hashing
- 4 roles: Student, Faculty, Company, Admin
- Role-protected routes — wrong-role users are redirected automatically
- Session persistence with `localStorage`

### 🎯 Student Career Protocol
- **AI-powered job discovery** — Gemini scores every opportunity against the student's skill profile
- **Match Score Ring** — animated circular match score per role (React + SVG animation)
- **Application tracker** — real-time pipeline: Applied → Review → Shortlisted → Interview
- **Interview Readiness Score** — tracks skill completion and practice activity

### 🏢 Company Recruitment Command Center
- **Campus Drive Management** — create, pause, archive drives with eligibility filters (CGPA, branch, year)
- **Talent Pipeline** — candidate cards with Readiness %, Skill Match %, Confidence Score
- **Hiring Funnel Chart** — horizontal bar chart (Applied → Eligible → Shortlisted → Interviewed → Selected)
- **AI Candidate Insights** — Gemini surfaces anomalies like "Metropolitan Tech students score 15% higher in System Design"
- **Assessment Question Bank** — manage and assign interview questions per drive

### 👨‍🏫 Faculty Portal
- Post research internships and academic project opportunities directly to the student feed
- Student Progress Monitor — Readiness scores, mentorship request tracking
- Access the Community Mentorship Hub for async discussions

### 🤝 Team Formation Hub
- Browse open teams looking for specific roles (Frontend, Designer, ML Engineer)
- Compatibility matching based on skill overlap
- Create your own team and open it for invitations
- Designed for Hackathons, college projects, and group internships

### 🧠 AI Mock Interview (Voice-Enabled)
- Resume PDF upload → parsed by FastAPI/PyPDF2 into text context
- Groq Llama 3 generates personalized, resume-aware interview questions
- Real-time WebSocket streaming — answers appear word-by-word like a real interviewer
- Browser Speech Recognition (STT) for hands-free answering
- Browser TTS (Text-to-Speech) reads out AI questions

### 💬 Community Mentorship Hub
- Forum-style discussion board for students, faculty, and alumni
- Shareable interview experiences, research opportunities, career tips
- Trending topic discovery, faculty mentor profiles

### 📊 Admin Governance Center
- **Placement Rate & Fairness Score KPIs** — tracked and displayed prominently
- **Skill Gap Analysis** — bar chart comparing student supply vs industry demand per skill
- **Domain Distribution** — pie chart of placements across Software, Data Science, Product, Design
- **Approval Workflow** — admins review and approve/reject company drives and flagged content
- **Compliance & Audit Log** — every significant system action is logged and exportable

### 🔔 Smart Notifications
- Role-specific notification feed (per user type)
- Triggered by: new high-match jobs, application status changes, drive deadlines, mentorship requests

---

## 📁 Project Structure

```
PICT_PROJECT_2/
├── client/                          # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── MockInterviewer.jsx   # Voice AI interview component
│   │   │   ├── SetupScreen.jsx       # Resume + JD upload for mock interview
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── AIShortlist.jsx       # AI-powered job matching
│   │   │   ├── mock-interview/
│   │   │   │   └── SkillInput.jsx    # Skill selection for targeted prep
│   │   │   └── ...
│   │   ├── routes/
│   │   │   ├── CompanyRoutes.jsx     # Protected company-role routes
│   │   │   ├── FacultyRoutes.jsx     # Protected faculty-role routes
│   │   │   └── ...
│   │   ├── App.jsx                   # Root app with routing logic
│   │   └── main.js                  # Full SPA entry (Gemini AI integrated)
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Node.js/Express REST API
│   ├── controllers/
│   │   ├── opportunityController.js # Internship CRUD & matching logic
│   │   ├── companyController.js     # Company hiring management
│   │   └── ...
│   ├── models/
│   │   ├── Application.js           # Mongoose schema: student applications
│   │   └── ...
│   ├── utils/
│   │   └── scoringEngine.js         # AI-assisted candidate scoring algorithm
│   ├── server.js                    # Express server entry point
│   └── package.json
│
├── ai-backend/                      # Python FastAPI AI Microservice
│   ├── main.py                      # FastAPI app: /setup-interview + /ws/interview
│   ├── requirements.txt
│   └── venv/
│
├── start_servers.bat                # Windows: starts all 3 servers at once
├── PRODUCTION_STRATEGY.md           # Deployment & scaling plan
└── README.md                        # This file
```

---

## ⚙️ Setup & Running Locally

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.10
- MongoDB (local or Atlas connection string)
- A Google Gemini API Key ([Get one free here](https://aistudio.google.com/app/apikey))
- A Groq API Key ([Get one free here](https://console.groq.com))

### Option A: Start Everything at Once (Windows)
```bat
start_servers.bat
```

### Option B: Start Each Service Manually

**1. Main Backend API**
```bash
cd server
npm install
npm run dev          # Starts on http://localhost:5000
```

**2. React Frontend**
```bash
cd client
npm install
npm run dev          # Starts on http://localhost:5173
```

**3. Python AI Microservice**
```bash
cd ai-backend
python -m venv venv
venv\Scripts\activate     # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Starts on http://localhost:8000
```

---

## 🔑 Environment Variables

**`server/.env`**
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/internmatch
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
OPENAI_API_KEY=sk-...
SENTRY_DSN=https://...@sentry.io/...
```

**`ai-backend/.env`** *(create this file)*
```env
GROQ_API_KEY=gsk_...
GOOGLE_API_KEY=AIzaSy...
```

**`client/src/main.js`** *(Gemini — set inline for prototype)*
```javascript
const apiKey = "AIzaSy..."; // Your Google Gemini API Key
```

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | None | Register new user |
| `POST` | `/api/auth/login` | None | Login, returns JWT |
| `GET` | `/api/opportunities` | JWT | List all internships |
| `POST` | `/api/opportunities` | JWT + Company | Post new internship |
| `POST` | `/api/applications` | JWT + Student | Apply to a role |
| `PATCH` | `/api/applications/:id` | JWT + Company | Update application status |
| `GET` | `/api/admin/stats` | JWT + Admin | Platform analytics |
| `POST` | `/api/setup-interview` | None (Python) | Upload resume, get session_id |
| `WS` | `/ws/interview/:session_id` | Session | Live WebSocket interview stream |

---

## 📌 Current Project Status

| Feature | Status |
|---|---|
| ✅ Multi-Role Auth (JWT + RBAC) | **Complete** |
| ✅ Student Dashboard & Job Discovery | **Complete** |
| ✅ Company Drive Management | **Complete** |
| ✅ Faculty Portal & Research Posts | **Complete** |
| ✅ Admin Governance Dashboard | **Complete** |
| ✅ AI Assistant (Google Gemini) | **Complete** |
| ✅ Team Formation Hub | **Complete** |
| ✅ Community Mentorship Forum | **Complete** |
| ✅ Application Status Tracker | **Complete** |
| ✅ Real-time Notifications (Socket.io) | **Complete** |
| ✅ AI Mock Interviewer (FastAPI + WebSocket) | **Complete** |
| 🟡 Candidate Scoring Engine | **In Progress** |
| 🟡 Voice Input (Speech Recognition) | **In Progress** |
| 🔴 Firebase Hosting Deployment | **Planned** |
| 🔴 Google Cloud Run Deployment | **Planned** |

---

## 🔮 Future Roadmap

### Phase 1 — Google Cloud Integration (Next Sprint)
- [ ] **Migrate AI to Google Gemini 1.5 Pro** in the FastAPI backend (replace Groq/Llama with `langchain-google-genai`)
- [ ] **Deploy frontend** to Firebase Hosting (`firebase deploy`)
- [ ] **Add "Sign in with Google"** via Firebase Authentication
- [ ] **Add Gemini API Key** to `.env` and secure it server-side (remove from frontend)

### Phase 2 — Production Hardening
- [ ] **Google Cloud Run** containerization for Node.js and Python services (Dockerfile per service)
- [ ] **Redis** for WebSocket session management (replace in-memory `interview_sessions` dict)
- [ ] **Google Cloud Storage** to replace Cloudinary for resume & image storage
- [ ] **Complete JWT refresh token** rotation strategy

### Phase 3 — Advanced AI Features
- [ ] **Vertex AI** integration for the custom candidate scoring model
- [ ] **Gemini Vision API** for automated resume document parsing (image-based PDFs)
- [ ] **AI Resume Builder** — Gemini generates a tailored resume based on target JD
- [ ] **Predictive Placement Probability** — ML model trained on historical campus data
- [ ] **Automated Interview Feedback Report** — PDF report generated post mock interview

### Phase 4 — Platform Expansion
- [ ] **Mobile App** (React Native) — student portal on iOS/Android
- [ ] **Google Analytics 4** for user behavior and funnel analytics
- [ ] **Alumni Network** — verified alumni can post referrals and mentorship slots
- [ ] **Gamification** — points, leaderboard, and badges for prep activities
- [ ] **Multi-College Support** — admin panel can manage multiple institutions
- [ ] **ATS Integration** — company can export shortlisted candidates to external ATS tools

---

## 👩‍💻 Author

**Shrenika Patil**
*Final Year Computer Engineering Student, PICT Pune*

> Built with ❤️ using React, Node.js, FastAPI, and Google Gemini AI.
