# CanteenX Deployment & Docker Specification

## Docker Architecture

CanteenX is packaged into multi-stage Docker containers orchestrated via `docker-compose.yml`:

- `frontend`: Nginx web server hosting React 18 production build.
- `backend`: Node.js Express API & Socket.IO server.
- `ai-service`: Python FastAPI application running Uvicorn workers.
- `postgres`: PostgreSQL 15 database container.

## Environment Variables Configuration

Create a `.env` file in the root directory:

```env
# General
NODE_ENV=production
PORT=5000
JWT_SECRET=super_secret_canteenx_jwt_key_2026

# Database
DB_TYPE=postgres
PGHOST=postgres
PGPORT=5432
PGUSER=canteenx
PGPASSWORD=canteenx_secure_pass
PGDATABASE=canteenx_db

# Razorpay Payments
RAZORPAY_KEY_ID=rzp_test_dummy_key_id
RAZORPAY_KEY_SECRET=dummy_secret_key
RAZORPAY_MOCK_MODE=true

# AI Service
AI_SERVICE_URL=http://ai-service:8000
```
