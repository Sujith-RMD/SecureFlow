<p align="center">
  <img src="https://img.shields.io/badge/SecureFlow-UPI%20Fraud%20Prevention-00FF87?style=for-the-badge&labelColor=040D0A" alt="SecureFlow" />
</p>

<h1 align="center">🛡️ SecureFlow</h1>
<h3 align="center">Intent-Aware UPI Fraud Prevention — In Real Time</h3>

<p align="center">
  <img src="https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=threedotjs&logoColor=white" />
</p>

<p align="center">
  <b>₹10,000 Cr</b> lost to UPI fraud in 2023 alone. <b>55 Cr+ users</b> are at risk every day.<br/>
  SecureFlow intercepts risky payments <em>before</em> they happen — scoring intent, applying intelligent friction, and explaining <em>exactly why</em>.
</p>

---

## � About

**SecureFlow** is a real-time UPI fraud prevention system that acts as an intelligent security layer between users and their payments. Unlike traditional fraud detection that alerts users *after* the damage is done, SecureFlow analyzes every transaction *before* confirmation — evaluating recipient trust, spending behavior, transaction patterns, and message semantics to assign a risk score in under 80ms.

Based on the risk score, SecureFlow applies **calibrated friction** — safe payments go through instantly, suspicious ones trigger warnings with cooldown periods, and high-risk transactions are blocked entirely. Every decision is fully transparent: users see exactly which rules fired, how much each contributed to the score, and why the system intervened.

Built as a full-stack web application with a React + TypeScript frontend and a FastAPI Python backend, SecureFlow demonstrates how intelligent UX design combined with rule-based behavioral analysis can prevent fraud without degrading the payment experience for legitimate users.

---

## �📌 The Problem

India's UPI ecosystem processes **billions of transactions monthly**, but existing fraud detection is reactive — users discover losses *after* the money is gone. Current systems:

- ❌ Flag transactions **after** they're completed
- ❌ Provide no explanation for blocks
- ❌ Apply the same friction to safe and dangerous payments alike
- ❌ Can't detect social engineering patterns in real time

## 💡 Our Solution

**SecureFlow** is a real-time, intent-aware fraud prevention layer that sits between the user and the payment confirmation. It:

1. **Scores every transaction** against 6 behavioral + contextual rules in under 80ms
2. **Applies calibrated friction** — safe payments flow freely, risky ones get delays or blocks
3. **Explains every decision** — no black boxes, every flag comes with a plain-English reason
4. **Persists blocked attempts** — even intercepted transactions are logged for full audit trails

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React + TS)                  │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐ │
│  │ Landing  │  │ Dashboard │  │ SendMoney │  │  History  │ │
│  │ (GridScan│  │ (Live     │  │ (Multi-   │  │ (Filter + │ │
│  │  3D BG)  │  │  Stats)   │  │  Step)    │  │  Search)  │ │
│  └──────────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘ │
│                      │              │              │        │
│                      └──────────────┼──────────────┘        │
│                              axios  │  /api/*               │
└──────────────────────────────┬──────┘───────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI + Python)                │
│                                                             │
│  ┌──────────────┐  ┌────────────────┐  ┌─────────────────┐ │
│  │ Risk Engine  │  │ Friction Engine│  │  Stats Engine   │ │
│  │ (6 Rules,    │  │ (3-Tier Gate:  │  │ (Security Score,│ │
│  │  40+ Scam    │  │  TOAST → MODAL │  │  Trust Rate,    │ │
│  │  Keywords)   │  │  → BLOCK)      │  │  Risk Distro)   │ │
│  └──────────────┘  └────────────────┘  └─────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  In-Memory Transaction Store (seed data + persistence) ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Risk Engine — 6 Detection Rules

| # | Rule | What It Catches | Score |
|---|------|----------------|-------|
| 1 | **NEW_RECIPIENT** | First-ever payment to this UPI ID | +30 |
| 2 | **UNUSUAL_AMOUNT** | Amount exceeds 3× user's average | +25 |
| 3 | **HIGH_FREQUENCY** | 3+ transactions in the last 10 minutes | +20 |
| 4 | **LARGE_ROUND_NUMBER** | ₹10,000+ round amounts (common in scams) | +15 |
| 5 | **SCAM_KEYWORD** | 40+ keywords: "OTP", "KYC", "lottery", "urgent", etc. | +35 |
| 6 | **BEHAVIORAL_SHIFT** | Amount exceeds 4× median historical spending | +40 |

> Risk score is capped at **100**. Each rule contributes a percentage breakdown shown to the user.

---

## 🚦 Friction Engine — 3 Response Tiers

| Risk Level | Score Range | Action | UX Response |
|-----------|------------|--------|-------------|
| 🟢 **LOW** | 0 – 30 | `ALLOW` | Silent toast — payment proceeds instantly |
| 🟡 **MEDIUM** | 31 – 60 | `WARN` | Warning modal + 5s cooldown before confirm |
| 🔴 **HIGH** | 61 – 100 | `BLOCK` | Transaction blocked — logged with full reason |

---

## ✨ Key Features

### 🖥️ Landing Page
- **Three.js GridScan** — interactive 3D background with real-time face-tracking grid animation
- Animated hero section with blur-text reveal
- Stats bar, feature cards, step-by-step flow, risk level breakdown

### 📊 Dashboard
- **Live security score** meter (0–100) derived from real transaction history
- Risk distribution breakdown (LOW / MEDIUM / HIGH percentages)
- Recent transactions with risk badges and relative timestamps
- Trust rate, flagged count, blocked count — all computed from actual data

### 💸 Send Money (Multi-Step Flow)
- **Step 1 — Form**: Recipient UPI (validated for `@`), amount, optional remarks
- **Step 2 — Analysis**: Real-time risk scoring with animated loading state
- **Step 3 — Review**: Risk meter visualization, rule-by-rule breakdown with severity badges
- **Step 4 — Result**: Success confirmation, or block screen with full explanation
- Mandatory cooldown countdown for MEDIUM-risk (DELAY friction)
- Blocked transactions are persisted to history for audit

### 📜 Transaction History
- Filterable tabs: **All · Safe · Flagged · Blocked**
- Expandable risk detail panel per transaction
- Search across recipients, amounts, and remarks
- Sticky header with transaction counts per filter

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+** 
- **Node.js 18+** and **npm**

### 1. Clone the Repository

```bash
git clone https://github.com/Sujith-RMD/SecureFlow.git
cd SecureFlow
```

### 2. Start the Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app:app --host 0.0.0.0 --port 5000
```

The API will be running at `http://localhost:5000`. Verify with:
```bash
curl http://localhost:5000/api/health
# → {"status": "SecureFlow backend operational"}
```

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Risk-score a potential transaction (doesn't persist) |
| `POST` | `/api/send` | Analyze + persist transaction + deduct balance |
| `GET` | `/api/history` | Full transaction history (newest first) |
| `GET` | `/api/user` | Current user profile and balance |
| `GET` | `/api/dashboard-stats` | Aggregated metrics for the dashboard |
| `POST` | `/api/reset` | Clear all history for a fresh start |
| `GET` | `/api/health` | Backend status check |

### Example — Analyze a Suspicious Transaction

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"recipientUPI": "unknown@scam", "amount": 50000, "remarks": "urgent send money now"}'
```

```json
{
  "score": 100,
  "level": "HIGH",
  "reasons": [
    { "ruleId": "NEW_RECIPIENT", "title": "New Recipient Detected", "scoreAdded": 30 },
    { "ruleId": "UNUSUAL_AMOUNT", "title": "Unusual Transaction Amount", "scoreAdded": 25 },
    { "ruleId": "LARGE_ROUND_NUMBER", "title": "Large Round Number", "scoreAdded": 15 },
    { "ruleId": "SCAM_KEYWORD", "title": "Suspicious Keyword Detected", "scoreAdded": 35 },
    { "ruleId": "BEHAVIORAL_SHIFT", "title": "Behavioral Spending Shift", "scoreAdded": 40 }
  ],
  "recommendedAction": "BLOCK",
  "friction": { "type": "BLOCK", "delaySeconds": 10, "canOverride": false, "color": "red" }
}
```

> 5 out of 6 rules triggered → Score capped at 100 → **BLOCKED**

---

## 🗂️ Project Structure

```
SecureFlow/
├── backend/
│   ├── app.py                  # FastAPI app + CORS setup
│   ├── routes.py               # All API endpoints (/api/*)
│   ├── models.py               # Pydantic schemas
│   ├── mock_data.py            # In-memory transaction store + seed data
│   ├── requirements.txt
│   └── core/
│       ├── risk_engine.py      # 6-rule scoring engine (40+ scam keywords)
│       ├── friction_engine.py  # 3-tier friction mapping
│       └── stats_engine.py     # Dashboard metrics computation
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # React Router setup
│   │   ├── main.tsx            # Entry point
│   │   ├── pages/
│   │   │   ├── Landing.tsx     # Hero + features + CTA
│   │   │   ├── Dashboard.tsx   # Live stats dashboard
│   │   │   ├── SendMoney.tsx   # Multi-step transaction flow
│   │   │   └── History.tsx     # Filterable transaction log
│   │   ├── components/
│   │   │   ├── GridScan.tsx    # Three.js 3D background
│   │   │   ├── Navbar.tsx      # Navigation bar
│   │   │   ├── RiskBadge.tsx   # Risk level pill
│   │   │   └── FrictionModal.tsx
│   │   ├── services/
│   │   │   └── api.ts          # Axios API client
│   │   └── types/
│   │       └── index.ts        # TypeScript interfaces
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | Component-based UI |
| **Styling** | Tailwind CSS v3 | Utility-first styling |
| **Animations** | Motion (Framer Motion v11) | Page transitions + micro-interactions |
| **3D Graphics** | Three.js + Postprocessing | Interactive GridScan background |
| **HTTP Client** | Axios | Frontend ↔ Backend communication |
| **Backend** | FastAPI (Python) | High-performance async API |
| **Validation** | Pydantic | Request/response schema validation |
| **Server** | Uvicorn | ASGI server |
| **Build Tool** | Vite | Lightning-fast HMR + bundling |

---

## 🧪 Test Scenarios

Try these in the Send Money page to see different risk behaviors:

| Scenario | UPI | Amount | Remarks | Expected |
|----------|-----|--------|---------|----------|
| ✅ Safe payment | `rahul@okaxis` | ₹500 | Dinner split | **LOW** — instant allow |
| ⚠️ Medium risk | `newperson@upi` | ₹15,000 | — | **MEDIUM** — warn + delay |
| 🔴 Blocked | `unknown@scam` | ₹50,000 | urgent send money now | **HIGH** — blocked |
| 🔴 Scam keyword | `random@upi` | ₹1,000 | send OTP for KYC | **HIGH** — blocked |

---

## 🎯 What Makes SecureFlow Different

| Traditional Systems | SecureFlow |
|--------------------|-----------|
| Post-transaction alerts | **Pre-transaction interception** |
| Binary allow/block | **3-tier calibrated friction** |
| No explanation given | **Rule-by-rule breakdown with percentages** |
| Same UX for all risk levels | **Adaptive UX: toast → modal → block** |
| No audit trail for blocks | **Blocked transactions persisted in history** |
| Keyword blocklists only | **Behavioral + contextual + keyword analysis** |

---

## 👥 Team

Built with ❤️ by:

| Name | GitHub |
|------|--------|
| **Sujith** | [@Sujith-RMD](https://github.com/Sujith-RMD) |
| **Abdul Fattah** | [@hydralgorithm](https://github.com/hydralgorithm) |
| **Vaibhav** | [@vaibhavyadavvv2007-ai](https://github.com/vaibhavyadavvv2007-ai) |

---

<p align="center">
  <sub>SecureFlow — Because every transaction deserves a second look.</sub>
</p>