# CanteenX - Smart Campus Food Service Platform

![CanteenX Banner](https://img.shields.io/badge/CanteenX-Smart%20Campus%20Food%20Service-indigo?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/status-Production%20Ready-success?style=for-the-badge)

CanteenX is an AI-powered Smart Campus Food Service Platform designed to modernize college food operations for **Students**, **Faculty**, **Canteen Staff**, **Canteen Managers**, **College Administrators**, and **Super Admins**.

## 🚀 Key Features

- 🍕 **Real-time Food Availability**: Live menu item availability (`AVAILABLE`, `LOW_STOCK`, `SOLD_OUT`, `TEMPORARILY_UNAVAILABLE`).
- ⏱️ **AI Queue & Waiting-Time Prediction**: ML-driven waiting time calculations with transparent fallback rules.
- 📈 **AI Food Demand Forecasting**: Predictive analytics for peak hours, preparation planning, and waste reduction.
- 📦 **Smart Inventory & Predictive Stock Alerts**: Real-time ingredient consumption tracking and future stockout alerts.
- 🤖 **AI Operations Copilot**: Natural-language operational assistant for canteen managers grounded in real database analytics.
- 👨‍🏫 **Faculty Cabin Delivery & Scheduled Orders**: Dedicated cabin ordering for department staff and faculty members.
- 📱 **QR Order Verification**: Fast, secure QR token scanning at pickup counters to eliminate physical queues.
- 💳 **Digital Payments**: Integrated payment processing via Razorpay with development mock mode.
- 📊 **Campus Food Heatmap & Analytics**: Live visualization of busy canteens, peak hours, and revenue trends.
- 🌿 **Canteen Sustainability Score**: Quantitative operational score tracking waste reduction and inventory efficiency.
- 🎟️ **Campus Event Mode**: Specialized event menus, temporary counters, and fest ordering management.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios, Socket.IO Client |
| **Backend** | Node.js, Express.js, Socket.IO, JWT, bcryptjs, Zod |
| **Database** | PostgreSQL (Production) / SQLite3 (Zero-config local fallback) |
| **AI Service** | Python 3.10+, FastAPI, XGBoost, Scikit-Learn, Pandas, NumPy, Uvicorn |
| **Containerization** | Docker, Docker Compose |

---

## 🔐 Demo Credentials

Quickly test CanteenX using these pre-configured demo credentials:

| Role | Email | Password | Access / Capabilities |
|---|---|---|---|
| **Student** | `student@anurag.edu` | `password123` | Ordering, Live tracking, Recommendations, Rewards |
| **Faculty** | `faculty@anurag.edu` | `password123` | Cabin delivery, Scheduled orders, Pre-ordering |
| **Canteen Staff** | `staff@anurag.edu` | `password123` | Order kitchen view, Status update, QR Scanner |
| **Canteen Manager**| `manager@anurag.edu` | `password123` | Menu control, Inventory, Waste logs, AI Copilot |
| **College Admin** | `admin@anurag.edu` | `password123` | Canteen analytics, Announcements, Reports |
| **Super Admin** | `superadmin@canteenx.com` | `password123` | System settings, Platform analytics |

---

## ⚙️ Quick Start & Installation

### Option 1: Development Mode (Local Node & Python)

1. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   npm run seed  # Seeds database with demo accounts & 20+ menu items
   npm start     # Runs backend server on http://localhost:3001
   ```

2. **Install AI Service Dependencies:**
   ```bash
   cd ai-service
   pip install -r requirements.txt
   python3 -m uvicorn app.main:app --reload --port 8000
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   npm run dev   # Starts Vite React App on http://localhost:5173
   ```

### Option 2: Docker Compose

```bash
docker-compose up --build
```
Access the application at `http://localhost:5173`.

---

## 📁 Repository Architecture

```
canteenx/
├── frontend/        # React + Vite + Tailwind CSS SPA
├── backend/         # Express.js REST API + Socket.IO Server
├── ai-service/      # FastAPI Microservice (XGBoost, Scikit-learn)
├── database/        # PostgreSQL / SQLite Schema & Seed Scripts
├── docs/            # Architecture, Database, API & AI Specs
├── docker/          # Dockerfiles & Docker Compose
└── README.md
```

---

## 📄 Documentation Links

- [System Architecture & Diagrams](docs/DIAGRAMS.md)
- [Architecture Overview](ARCHITECTURE.md)
- [Database Specification](DATABASE.md)
- [API Documentation](API.md)
- [AI Models & Copilot Specification](AI.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Security & RBAC Specification](SECURITY.md)
