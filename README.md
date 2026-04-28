# 🎓 InternMatch AI — Unified Internship & Placement Platform

**InternMatch AI React Gemini AI Status**

🌐 Live Demo → [my-react-app-beryl-mu.vercel.app](https://my-react-app-beryl-mu.vercel.app)  
**Team**: Last Second Squad | Google Solution Challenge 2026

An AI-powered platform that connects students, faculty, companies, and administrators into a single, intelligent hiring and placement ecosystem.

---

## 🌟 The Problem We Solve

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

---

## 🤖 How Gemini AI is Integrated Right Now

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

## ✅ Features Implemented in This Prototype

### 🔐 Authentication & Role-Based Access
* 3-role system: Student, Employer & Faculty, Admin
* Simulated Google OAuth ("Sign in with Google" button with 1.5s spinner)
* Email/password mock login with `DEMO_CREDENTIALS` validation
* "Forgot Password" flow with simulated success toast
* Persistent session via `localStorage`
* Role-based dashboard routing (wrong role → redirected)

### 🎓 Student Dashboard
* AI Match Score Ring (animated SVG circular progress per opportunity)
* Interview Readiness Score tracker
* Explore Roles — searchable, filterable opportunity feed
* Application Status Tracker (Applied → Review → Shortlisted → Interview)
* Interview Prep Hub — category-based question bank with difficulty levels
* Team Formation Hub — browse & create teams for hackathons/projects
* Skill compatibility matching between team members
* Student Identity/Profile page

### 🏢 Employer & Faculty Dashboard
* Employer Overview with hiring funnel (Recharts `ComposedChart`)
* Campus Drive Manager — create, view, manage drives with eligibility filters
* Talent Pipeline — candidate cards with Readiness %, Skill Match %, Confidence Score
* AI-powered candidate insights (Gemini surfaces anomalies in candidate pool)
* Assessment Question Bank — manage interview questions per drive
* Community Hub access for posting opportunities

### 🛡️ Admin Governance Center
* Platform KPI cards (Placement Rate, Fairness Score, Active Drives, Pending Approvals)
* Radar Chart — Skill Supply vs Market Demand (Recharts `RadarChart`)
* Composed Chart — Platform user growth trends (Area + Line)
* User Directory — view/suspend/edit users across all roles
* System Health widget — uptime (99.9%), load bar, status indicators
* Compliance & Audit Log — timestamped activity log, exportable
* Actionable Approvals — Approve / Reject drives & flagged content in real-time

### 💬 Community Mentorship Hub
* Forum-style discussion board (All roles)
* Post interview experiences, research tips, career guidance
* Category filtering (Interview Experiences, Research, Career Guidance)
* Faculty/Alumni mentor profiles sidebar

### 🔔 Smart Notifications
* Role-specific notification panel
* Triggered by: new matches, drive deadlines, application updates

### 🎨 UI/UX Design System
* Premium dark theme — deep `#0d1117` base with `#161b27` surfaces
* Animated floating orbs (blue, purple, pink) on Landing & Login pages
* Subtle dot-grid background pattern
* Glassmorphism login card with `backdrop-filter: blur(20px)`
* Gradient text (blue → purple → pink) for brand elements
* Framer Motion animations — fade-ins, slide-ups, floating hero cards
* Fully responsive (mobile → desktop)
* Light/Dark mode toggle (Sun/Moon icon in navbar & sidebar)
* Custom dark scrollbar

---

## 🔮 Features To Be Implemented

### 🧠 Phase 1 — AI Voice Interview (In Progress)
* Resume PDF upload → FastAPI/PyPDF2 extraction → Gemini generates personalized questions
* Real-time WebSocket streaming (answers appear word-by-word like a real interviewer)
* Browser Speech Recognition (STT) for hands-free answering
* Browser Text-to-Speech (TTS) reads out AI questions
* Post-interview feedback PDF report generated by Gemini

### ☁️ Phase 2 — Google Cloud Integration
* Firebase Authentication — real "Sign in with Google" OAuth
* Firebase Hosting deployment (`firebase deploy`)
* Google Cloud Run — Dockerized Node.js API + Python FastAPI
* Move Gemini API key server-side (remove from frontend for production security)
* Google Cloud Storage for resume & image storage

### 🏗️ Phase 3 — Full-Stack Backend
* Node.js/Express REST API with MongoDB (Mongoose)
* JWT authentication with refresh token rotation
* Real Socket.io server for live notifications
* Cloudinary / GCS integration for file uploads
* Candidate Scoring Engine (`scoringEngine.js`) with AI shortlisting logic
* Complete CRUD for opportunities, applications, users, drives

### 🤖 Phase 4 — Advanced AI Features
* Vertex AI — custom placement probability model
* Gemini Vision API — parse image-based resume PDFs
* AI Resume Builder — Gemini generates tailored resume from target JD
* Predictive Placement Probability based on historical campus data
* AI-powered JD-to-student matching (backend scoring, not frontend mock)

### 📱 Phase 5 — Platform Expansion
* React Native mobile app for student portal
* Google Analytics 4 funnel analysis for admin dashboard
* Alumni Network with verified referrals and mentorship slots
* Gamification — XP points, leaderboard, achievement badges
* Multi-college support (admin manages multiple institutions)
* ATS integration — export shortlisted candidates to external tools
* Email notifications (SendGrid / Firebase Cloud Messaging)

---

## 🛠️ Tech Stack (Prototype)

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **UI Framework** | React 18 + Vite | Fast SPA with hot module reload |
| **Styling** | Tailwind CSS 3 | Utility-first dark theme |
| **Animations** | Framer Motion | Page transitions, hero animations, floating cards |
| **Charts** | Recharts | Radar, ComposedChart, PieChart, BarChart, LineChart |
| **Icons** | Lucide React | 300+ modern icons |
| **AI** | Google Gemini 2.5 Flash API | Role-aware AI assistant in all dashboards |
| **Auth** | Mock (`localStorage`) | Simulated for prototype — Firebase Auth planned |
| **State** | React `useState`/`useEffect` | Local component state + `localStorage` persistence |

### Full Production Stack (In Development)

```text
Frontend (React/Vite) ─── Node.js/Express API ─── Python FastAPI AI
     Firebase Hosting          MongoDB Atlas          Google Cloud Run
                     ↕                    ↕
              Socket.io (Real-time)   Google Gemini Pro
```

---

## ⚙️ Run Locally

```bash
# Clone the repo
git clone https://github.com/shrenika2/last-second-squad-gsc2026.git
cd last-second-squad-gsc2026

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

> No API keys needed to run the prototype — all AI calls use the mock flow unless you add your own Gemini key in `src/main.jsx` (line ~27: `const apiKey = "YOUR_KEY_HERE"`).

---

## 📌 Current Status at Submission

| Module | Status |
| :--- | :--- |
| ✅ Multi-Role Auth (Mock + Google simulation) | Complete |
| ✅ Student Dashboard + Job Discovery | Complete |
| ✅ Employer Drive Management | Complete |
| ✅ Admin Governance + Analytics | Complete |
| ✅ Gemini AI Assistant (all dashboards) | Complete |
| ✅ Team Formation Hub | Complete |
| ✅ Community Mentorship Forum | Complete |
| ✅ Premium Dark Theme Design System | Complete |
| ✅ Responsive (Mobile + Desktop) | Complete |
| 🟡 Voice AI Mock Interviewer (FastAPI) | In Progress |
| 🟡 Real Backend API (Node.js) | In Progress |
| 🔴 Firebase Hosting Deployment | Planned |
| 🔴 Google Cloud Run | Planned |

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
