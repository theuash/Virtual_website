# Virtual | The Managed Execution Engine

**Virtual** is a high-end, cinematic platform designed for the elite creative economy. It bridges the gap between visionary initiators and world-class specialists through a managed execution framework characterized by technical precision and geometric stability.

---

## 💎 Core Features

### 1. Immersive Storytelling Interface
A production-grade landing experience built with **Framer Motion**, featuring full-screen scroll-linked parallax animations that visualize the platform's internal logic.

### 2. Micro-Task Distribution Engine
Proprietary architecture that fragments complex projects into precision-scoped units, matching work to specialists through AI-driven mastery tiers.

### 3. Sovereign Escrow Protection
Blockchain-inspired security ensuring 100% of project funds are secured at initiation, with managed capital release verified by internal human supervisors.

### 4. Aligned Resolution Protocol
A documented, grid-based resolution system where every conflict is managed by internal experts, ensuring a frictionless professional environment.

### 5. Live Command Dashboard
Total transparency through a singular command center. Track split-task progress, performance metrics, and real-time communication in a unified interface.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Framer Motion (Animations), Tailwind CSS, Lucide React (Icons).
- **Backend**: Node.js, Express, MongoDB, Mongoose.
- **Authentication**: JWT (JSON Web Tokens) with role-based access control.

---

## 📁 Project Structure

```text
Virtual_website/
├── frontend/             # React/Vite Client
│   ├── src/
│   │   ├── pages/        # Landing & Dashboard pages
│   │   ├── components/   # Reusable UI systems
│   │   └── assets/       # Cinematic media assets
├── backend/              # Node.js REST API
│   ├── routes/           # API Endpoints
│   ├── models/           # Mongoose Schemas
│   ├── services/         # Business Logic
│   └── utils/            # Error handlers & Responses
├── setup-auth.mjs        # Auth initialization script
└── README.md             # Project Documentation
```

---

## 🚀 Current Status

### ✅ Completed Features

#### Client Portal
- **Dashboard** - Stats, active projects, recent activity
- **Post Project** - Full project creation flow with:
  - Service-based and Open project modes
  - 15% first project discount (automatic)
  - Start date selection (dropdown)
  - Duration with days/months options
  - Reference links & attachments
  - Time-sensitive option
  - Experience format (Elite/Priority)
- **My Projects** - Project listing with filters, search, status badges, detail modal
- **Messages** - Integrated messaging UI
- **Wallet** - Balance, add money, transaction history
- **Settings** - (Placeholder)

#### Freelancer Portal
- **Dashboard** - Earnings, tasks, progress
- **Learning** - Educational content
- **Messages** - Messaging
- **Onboarding** - Profile setup
- **Progress** - Performance tracking
- **Tasks** - Task management
- **Settings** - (Likely placeholder)

#### Supervisor Portal
- **Dashboard** - Overview
- **Messages** - Messaging

#### Landing Page
- Hero section with animations
- Pricing strip
- Feature sections

---

## 📋 Remaining Tasks

### High Priority
1. **ProjectDetail.jsx** - Full project detail page with:
   - Project timeline/progress
   - Initiator assignment
   - Milestone tracking
   - Deliverable upload/approval
   - Payment actions (pay deposit, release final)
   - Revision requests
   - Chat with initiator

2. **ClientPayments.jsx** - Payment history and management page

3. **ClientSettings.jsx** - Client profile and settings:
   - Profile editing
   - Notification preferences
   - Security settings

4. **Backend: Project deadline calculation** - Auto-compute deadline from startDate + durationDays

5. **Backend: Payment endpoints** - Implement deposit payment, final payment, escrow release

### Medium Priority
6. **Freelancer Tasks** - Task detail view with submit work, request revision

7. **Freelancer Earnings** - Detailed earnings breakdown, payout history

8. **Supervisor Dashboard** - Project oversight, initiator management

9. **Backend: Project status workflow** - Status transitions (open → in_progress → under_review → completed)

10. **Backend: File upload** - Handle attachments and deliverable uploads

### Lower Priority
11. **Notifications system** - In-app notifications for all users

12. **Analytics dashboard** - Charts and insights for all roles

13. **Email notifications** - Transactional emails

14. **Admin panel** - User management, platform settings

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- npm or yarn

### 1. Repository Setup
```bash
git clone https://github.com/theuash/Virtual_website.git
cd Virtual_website
```

### 2. Backend Configuration
Navigate to the `backend` directory and install dependencies:
```bash
cd backend
npm install
```
Configure your `.env` file with:
- `MONGODB_URI`
- `JWT_SECRET`
- `PORT` (Default: 5000)

Start the server:
```bash
npm run dev
```

### 3. Frontend Configuration
Navigate to the `frontend` directory and install dependencies:
```bash
cd ../frontend
npm install
```
Start the development server:
```bash
npm run dev
```

The application will be accessible at `http://localhost:5173` (or the next available port).

---

## ⚖️ License
© 2026 Virtual Inc. Managed Creative Pipelines. All rights reserved.
