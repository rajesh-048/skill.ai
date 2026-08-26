# SkillSphere AI 🚀
> **"Know Your Gaps. Learn Smarter. Grow Faster."**

### Smart India Hackathon 2026 — Official Working Prototype
- **Ministry / Organization**: Ministry of Statistics and Programme Implementation (MoSPI)
- **Problem Statement ID**: `SIH26101`
- **Category**: Software
- **Theme**: Smart Education / Capacity Building

---

## 📌 Executive Summary

**SkillSphere AI** is a production-style, government- and enterprise-ready EdTech platform developed for MoSPI to solve static, one-size-fits-all education. The platform dynamically identifies learner competency and knowledge gaps, generates personalized 30-day learning roadmaps, synthesizes uploaded academic notes (PDF/Word/Text) into adaptive AI quizzes, provides a grounded pedagogical AI mentor with verified citations, and integrates with the **iGOT Karmayogi** civil services capacity building ecosystem.

---

## 🔑 Key Features & Mathematical Formulations

### 1. Multi-Source Weighted Competency Gap Engine
SkillSphere AI computes a multi-dimensional competency score for each technical skill ($0 - 100\%$):
$$\text{Competency Score} = 0.30 \cdot Q + 0.20 \cdot A + 0.20 \cdot C + 0.15 \cdot S + 0.15 \cdot L$$
- $Q$: Average Quiz Accuracy percentage
- $A$: Assessment & Assignment performance
- $C$: Course Progress completion rate
- $S$: Self-Assessment rating (Beginner: 30%, Intermediate: 65%, Advanced: 90%)
- $L$: Learning Activity & Daily streak consistency

#### 4-Tier Gap Classification Matrix:
- 🔴 **$0\% - 39\%$**: **Beginner / Critical Gap** (Immediate remediation required)
- 🟠 **$40\% - 59\%$**: **Developing** (Structured exercises & intermediate labs)
- 🟡 **$60\% - 79\%$**: **Proficient** (Capstone projects & synthesis)
- 🟢 **$80\% - 100\%$**: **Advanced / Mastery** (Advanced certification & mentor eligibility)

---

### 2. Multi-Factor Personalized Recommendation Engine
$$\text{RecScore} = (\text{Skill Gap} \times 0.40) + (\text{Career Relevance} \times 0.25) + (\text{Learning History} \times 0.15) + (\text{Difficulty Fit} \times 0.10) + (\text{User Interest} \times 0.10)$$
Every recommendation provides an explicit, transparent **"Why this was recommended"** explanation card linking back to learner gaps and career goals.

---

### 3. AI Document Quiz Generator
- Upload PDF, DOCX, or TXT lecture notes.
- Text is semantically chunked and analyzed for core technical concepts.
- The AI Engine generates targeted MCQs and True/False assessments with detailed explanations.
- Adaptive difficulty modifies future quiz difficulty based on learner accuracy.

---

### 4. SkillSphere AI Mentor (Grounded Chatbot with Citations)
- Explains math formulas, code snippets, and theories.
- Answers questions grounded in uploaded documents with verified page citations (e.g., `[Source: Machine Learning Notes — Page 1, Section: Core Principles]`).
- Features a **100% Offline Intelligent Fallback Engine** that works seamlessly without requiring an external OpenAI API key.

---

### 5. iGOT Karmayogi Integration Layer
- **Architecture**:
  ```
  LearningProvider (Abstract Base Class)
  ├── DemoProvider (MoSPI & Civil Services mock repository) [Active]
  └── iGOTProvider (REST / GraphQL Karmayogi Bharat sandbox adapter)
  ```
- Maps technical competencies to national standards (e.g., `IGOT-AI-105`, `IGOT-STAT-401`, `IGOT-DATA-204`, `IGOT-GOV-302`).
- Interactive synchronization console with payload inspector and audit logging.

---

### 6. Multi-Role Portals
1. **Student Portal**: Competency radar, 30-day dynamic roadmap, course player, quiz center, achievements/XP badges, notification drawer.
2. **Instructor Portal**: Classroom cohort analytics, weak topic diagnostics, student $\times$ skill heatmap matrix, course authoring, downloadable reports.
3. **Admin Portal**: Platform health status, adoption charts, user role governance, security audit logs.

---

## ⚡ 1-Click SIH Judge Demonstration Walkthrough

Click the **"⚡ SIH Judge Test Drive"** button in the navigation bar to experience the complete end-to-end user journey:
1. **Profile Setup**: Learner Ravi Kumar (CSE Sem 4, Career Target: AI/ML Engineer).
2. **Gap Detection**: System flags Machine Learning as **Critical Gap (32%)**.
3. **AI Recommendation**: System recommends *"Machine Learning Fundamentals"*.
4. **Document Synthesis**: Uploads `Machine_Learning_Basics.pdf`.
5. **AI Quiz Generation**: AI generates targeted diagnostic assessment.
6. **Quiz Submission**: Student scores 66%+.
7. **Dynamic Recalculation**: ML Competency dynamically climbs from **$32\% \to 42\%$**, badges unlock, and 30-day roadmap refreshes in real-time.

---

## 👥 Demo Personas & Credentials

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Student** | Ravi Kumar | `demo.student@skillsphere.ai` | `Demo@123` |
| **Instructor** | Dr. Sunita Sharma | `demo.instructor@skillsphere.ai` | `Demo@123` |
| **Administrator** | MoSPI Director | `demo.admin@skillsphere.ai` | `Demo@123` |

*Or use the 1-click **Persona Switcher** in the top navigation bar at any time.*

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, Vite 6, Tailwind CSS, Lucide Icons, Recharts, Canvas Confetti, Axios, React Router v6.
- **Backend**: Python FastAPI, Uvicorn, Pydantic, Python-jose, Bcrypt, PyPDF, Python-docx, Pytest.
- **Database**: SQLite WAL (Local zero-config deployment) + PostgreSQL Supabase compatible schema.
- **AI Service**: Dual-mode engine supporting OpenAI `gpt-4o-mini` with 100% offline local intelligent fallback.

---

## 🚀 Installation & Running Guide

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1-Click Startup (Windows)
Double-click `run_app.bat` or run:
```bash
.\run_app.bat
```

### Manual Startup

#### 1. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn backend.main:app --port 8000 --reload
```
Backend API will be available at: `http://127.0.0.1:8000` (Swagger UI at `/docs`).

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend Web UI will be available at: `http://localhost:5173`.

---

## 🧪 Automated Testing

Run the automated backend test suite:
```bash
python -m pytest backend/tests -v
```

All 11 unit tests verify:
- Password hashing & JWT session creation
- Multi-role demo authentication
- Competency formula mathematical accuracy ($0.30Q + 0.20A + 0.20C + 0.15S + 0.15L$)
- Gap classification thresholds (<40% Critical, 40-59% Developing, 60-79% Proficient, 80-100% Mastery)
- Multi-factor recommendation scoring
- AI Quiz generation, evaluation, and adaptive difficulty tuning
- Document text extraction, chunking, and topic modeling

---

## 🏛️ Future iGOT Karmayogi Production Plan
- Connect `iGOTProvider` to Karmayogi Bharat API endpoints (`/api/v1/courses/sync`, `/api/v1/competencies/map`).
- Implement DigiLocker API integration for automated verification of academic credentials.
- Expand regional language support (Hindi, Tamil, Telugu, Marathi, Bengali) for inclusive civil service capacity building.

---

### © 2026 SkillSphere AI — Smart India Hackathon Prototype for MoSPI
