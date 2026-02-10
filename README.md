🎓 Internship & Placement Management Platform
A production-grade MERN platform designed to streamline internships, placements, collaboration, and career readiness for students, faculty, companies, and administrators.
Built with real-time capabilities, role-based governance, and enterprise-level system integrity.


🚀 Key Features
🔐 Multi-Role Authentication (RBAC)
JWT-based secure authentication
Roles: Student, Faculty, Company, Admin
Role-protected routes and dashboards


🎯 Student Career Protocol
Dynamic profile creation (skills, CP links, resume, socials)
Profile completeness tracking
Opportunity discovery & application tracking
Real-time status updates (Pending, Shortlisted, Accepted)

🏢 Company Hiring Command Center
Internship & project posting lifecycle
Applicant review & status management
Hiring analytics dashboard

👨‍🏫 Faculty & Practice Ecosystem
Upload practice resources (PDF, Video, Links)
Manage research/projects
Track student readiness metrics

🤝 Team Collaboration Hub
Team formation & invitations
Real-time Kanban task board
Shared resource explorer
Project-level chat (Socket.io)

🧠 Intelligence & Community
Interview experience sharing (video & feedback)
Moderation workflow
Community discussions with read receipts

📊 Admin Governance Dashboard
User & opportunity moderation
System integrity metrics (API health, DB stats)
Broadcast notifications
Platform configuration & audit logs

⚡ Real-Time Infrastructure
Socket.io for:
Notifications
Status updates
Messaging
Live metrics sync

🛠️ Tech Stack
Frontend
React (Vite)
Tailwind CSS
Context API
Socket.io Client

Backend
Node.js
Express.js
MongoDB (Mongoose)
JWT Authentication
Socket.io Server
DevOps
Nodemon
Environment-based configs

📁 Architecture Overview
Feature-based architecture
Centralized AuthContext for session & sockets
Modular backend routes (auth, admin, student, company, practice, teams)
Defensive rendering & error-resilient UI

⚙️ Setup Instructions
1️⃣ Clone Repository
git clone https://github.com/your-username/your-repo-name.git
2️⃣ Backend Setup
cd server
npm install
npm run dev
Create .env:
PORT=5000
MONGO_URI=mongodb://localhost:27017/your-db
JWT_SECRET=your_secret

3️⃣ Frontend Setup
cd client
npm install
npm run dev

🔑 Default Admin Bootstrap
Admin can be bootstrapped via a script:
node bootstrapAdmin.js

📌 Project Status
✅ Authentication & RBAC: Complete
✅ Student & Company Workflows: Complete
✅ Real-time Notifications: Complete
🟡 AI Shortlisting: Rule-based (Expandable)
🟡 Practice Engine: UI Expansion Needed
🔴 Cloud Storage & Advanced Testing: Planned

🧭 Roadmap Highlights
Wallet & Redeem System
Interactive Mock Tests
Cloud Storage (S3 / Cloudinary)
AI-driven resume & skill analysis
Mobile-first UX refinements

👩‍💻 Author

Shrenika Patil

