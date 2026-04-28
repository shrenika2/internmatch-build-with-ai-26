# 🎓 InternMatch AI — Unified Internship & Placement Platform

**InternMatch AI React Gemini AI Status**

🌐 Live Demo → [my-react-app-beryl-mu.vercel.app](https://my-react-app-beryl-mu.vercel.app)  
**Team**: Last Second Squad | Google Solution Challenge 2026

An AI-powered platform that connects students, faculty, companies, and administrators into a single, intelligent hiring and placement ecosystem.

> **🎯 Targeted UN SDGs:** 📚 Quality Education (4) | 💼 Decent Work & Economic Growth (8) | 🤝 Reduced Inequalities (10)

---

## 🌟 The Problem We Solve

Traditional college placement processes are heavily manual, biased, and inefficient.

| Stakeholder | Current Pain | Our Solution |
| :--- | :--- | :--- |
| 🎓 **Students** | Discover internships blindly, no skill-fit scoring | AI match scores every opportunity against their profile |
| 🏢 **Companies** | Manually filter hundreds of unqualified resumes | AI shortlisting, readiness scores, talent pipeline |
| 👨‍🏫 **Faculty** | No tool to post research internships or track students | Unified faculty portal with mentorship & posting tools |
| 🛡️ **Admins** | Zero visibility into placement fairness & compliance | Governance center with analytics, audit logs, AI fairness scores |

---

## 🚀 Live Prototype Demo

⚡ This repository is the working prototype submitted for GSC 2026. The full production system is under active development.

### 🔑 Demo Login Credentials

| Role | Email | Password | What You Can Explore |
| :--- | :--- | :--- | :--- |
| 🎓 **Student** | `student@example.com` | `password123` | Dashboard, job discovery, AI prep hub, team formation, community |
| 🏢 **Employer & Faculty** | `employer@example.com` | `password123` | Campus drives, talent pipeline, question bank, hiring analytics |
| 🛡️ **Admin** | `admin@example.com` | `password123` | Governance, user management, approvals, radar charts, system health |

💡 *Tip: Click "Sign in with Google" for instant 1.5s simulated login into any role.*

---

## ☁️ Google Technologies Used

| Google Product | How We Use It | Status |
| :--- | :--- | :--- |
| **Google Gemini 2.5 Flash** | Powers the AI Assistant chatbot in every dashboard — career coaching, interview tips, JD analysis, governance insights | ✅ Live in Prototype |
| **Gemini REST API** | Direct frontend integration — role-aware system prompts per user type (Student / Employer / Admin) | ✅ Live in Prototype |
| **Firebase Authentication** | "Sign in with Google" OAuth flow — simulated in prototype, real integration planned | 🟡 Next Sprint |
| **Firebase Hosting** | Deployment target for the React/Vite frontend — global CDN, `.web.app` URL | 🟡 Next Sprint |
| **Google Cloud Run** | Serverless containers for Node.js API & Python FastAPI AI microservice | 🟡 Planned |
| **Google Cloud Storage** | Secure resume & document storage (replacing Cloudinary) | 🔴 Future |
| **Vertex AI** | Custom candidate scoring model training & deployment | 🔴 Future |
| **Google Analytics 4** | User behavior, funnel analysis, admin engagement tracking | 🔴 Future |

### How Gemini AI is Integrated Right Now

```javascript
// src/main.jsx — Every dashboard has a context-aware Gemini assistant
async function callGemini(prompt, systemInstruction = "") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  // Role-aware coaching: Students → interview tips, Companies → candidate insights, Admins → governance
}
```

Each role gets a tailored AI persona:
* 🎓 **Students** → Resume advice, skill gap analysis, mock interview coaching
* 🏢 **Employers** → JD optimization, candidate analytics, hiring insights
* 🛡️ **Admins** → Platform fairness checks, anomaly detection, governance suggestions

---

## 🛠️ Technology Stack & Architecture

### Full Production Stack (In Development)
```text
Frontend (React/Vite) ─── Node.js/Express API ─── Python FastAPI AI
     Firebase Hosting          MongoDB Atlas          Google Cloud Run
                     ↕                    ↕
              Socket.io (Real-time)   Google Gemini Pro
```

### Stack Details
- **Frontend (`/client`)**: React 18, Vite, Tailwind CSS 3, Framer Motion, Recharts, Lucide React, Socket.io Client.
- **Main Backend API (`/server`)**: Node.js, Express.js, MongoDB (Mongoose), JWT Auth, Socket.io, Cloudinary, pdf-parse.
- **AI Microservice (`/ai-backend`)**: Python, FastAPI, WebSockets, PyPDF2, LangChain.

---

## ✅ Features Implemented in This Prototype

### 🔐 Authentication & Role-Based Access
* 3-role system: Student, Employer & Faculty, Admin
* Simulated Google OAuth ("Sign in with Google" button with 1.5s spinner)
* Persistent session via `localStorage` and Role-based dashboard routing

### 🎓 Student Dashboard
* AI Match Score Ring (animated SVG circular progress per opportunity)
* Interview Readiness Score tracker and Application Status Tracker
* Explore Roles — searchable, filterable opportunity feed
* Interview Prep Hub and Team Formation Hub

### 🏢 Employer & Faculty Dashboard
* Employer Overview with hiring funnel (Recharts `ComposedChart`)
* Campus Drive Manager — create, view, manage drives with eligibility filters
* Talent Pipeline — candidate cards with Readiness %, Skill Match %, Confidence Score
* AI-powered candidate insights and Assessment Question Bank

### 🛡️ Admin Governance Center
* Platform KPI cards, Skill Supply vs Market Demand Radar Chart, User Growth Trends
* User Directory, System Health widget, Compliance & Audit Log
* Actionable Approvals — Approve / Reject drives & flagged content in real-time

### 💬 Community Mentorship Hub
* Forum-style discussion board with category filtering and Mentor profiles

### 🔔 Smart Notifications & 🎨 UI/UX Design System
* Role-specific notification panel (Socket.io)
* Premium dark theme (`#0d1117` base) with floating orbs and glassmorphism. Fully responsive.

---

## 🔮 Future Roadmap

### 🧠 Phase 1 — AI Voice Interview (In Progress)
* Resume PDF upload → FastAPI/PyPDF2 extraction → Gemini generates personalized questions
* Real-time WebSocket streaming (answers appear word-by-word like a real interviewer)
* Browser Speech Recognition (STT) and Text-to-Speech (TTS)

### ☁️ Phase 2 — Google Cloud Integration
* Firebase Authentication, Firebase Hosting deployment
* Google Cloud Run (Dockerized Node.js API + Python FastAPI)
* Google Cloud Storage for resume & image storage

### 🏗️ Phase 3 — Full-Stack Backend
* Node.js/Express REST API with MongoDB (Mongoose) + JWT authentication
* Real Socket.io server and Candidate Scoring Engine (`scoringEngine.js`)

### 🤖 Phase 4 — Advanced AI Features
* Vertex AI — custom placement probability model
* Gemini Vision API — parse image-based resume PDFs
* Predictive Placement Probability based on historical campus data

---

## 📁 Project Structure

```text
PICT_PROJECT_2/
├── client/                          # React Frontend (Vite)
│   ├── src/                         # React components, pages, routes, features
│   ├── Dockerfile & .dockerignore   # Deployment configs
│   ├── package.json
│   └── vite.config.js
├── server/                          # Node.js/Express REST API
│   ├── controllers/                 # Business logic (opportunities, auth)
│   ├── models/                      # MongoDB Schemas
│   ├── utils/scoringEngine.js       # AI-assisted candidate scoring algorithm
│   ├── server.js                    # Express server entry point
│   └── Dockerfile & .dockerignore   # Deployment configs
├── ai-backend/                      # Python FastAPI AI Microservice
│   ├── main.py                      # FastAPI app: /setup-interview + /ws/interview
│   ├── requirements.txt
│   └── Dockerfile & .dockerignore   # Deployment configs
├── docker-compose.yml               # Multi-container deployment orchestration
├── start_servers.bat                # Windows utility to start all 3 servers locally
└── README.md                        # This file
```

---

## ⚙️ Setup & Running Locally

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.10
- MongoDB (local or Atlas connection string)
- A Google Gemini API Key

### Option A: Start Everything at Once (Windows)
We provide a simple batch script to launch all 3 services at once:
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
```

---

## 🔑 Environment Variables

To run the backend fully, configure these environment variables.

**`server/.env`**
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/internmatch
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
OPENAI_API_KEY=sk-...
```

**`client/src/main.js`** *(Gemini — set inline for prototype)*
```javascript
const apiKey = "AIzaSy..."; // Your Google Gemini API Key
```

---

## 📡 API Reference (Backend Prototype)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | None | Register new user |
| `POST` | `/api/auth/login` | None | Login, returns JWT |
| `GET` | `/api/opportunities` | JWT | List all internships |
| `POST` | `/api/opportunities` | JWT + Company | Post new internship |
| `POST` | `/api/applications` | JWT + Student | Apply to a role |
| `POST` | `/api/setup-interview` | None (Python) | Upload resume, get session_id |
| `WS` | `/ws/interview/:session_id` | Session | Live WebSocket interview stream |

---

## 👩‍💻 Team — Last Second Squad

**Institution**: Walchand College of Engineering, Sangli  
**Branch**: B.Tech Computer Science & Engineering

| Name | Role | Email |
| :--- | :--- | :--- |
| **Shrenika Sajjankumar Patil** | Team Leader | shrenikapatil0211@gmail.com |
| **Gargi Salunkhe** | Member | gargisalunkhe1076@gmail.com |
| **Maruti Sarjerao Gaikwad** | Member | marutigaikwad2408@gmail.com |
| **Tanuj Ravindra Bhoite** | Member | tanujbhoite@gmail.com |

---

*Built with ❤️ by Team — Last Second Squad | Google Solution Challenge 2026 — Build with AI*  
*Walchand College of Engineering, Sangli*






