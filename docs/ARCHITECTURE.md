# CanteenX Architecture Specification

## Overview
CanteenX is an enterprise-grade, multi-canteen Smart Campus Food Service Platform designed for higher education institutions. The system optimizes campus food operations by pairing real-time digital order processing with AI microservices for queue estimation, demand forecasting, predictive inventory management, and operational decision support.

## Architectural Principles
1. **Multi-Role RBAC**: Strict separation of concerns across 6 distinct user roles (`STUDENT`, `FACULTY`, `CANTEEN_STAFF`, `CANTEEN_MANAGER`, `COLLEGE_ADMIN`, `SUPER_ADMIN`).
2. **Decoupled AI Engine**: Independent Python FastAPI service handling machine learning workloads without blocking Node.js event-loop IO.
3. **Real-time Event Synchronization**: WebSocket layer via Socket.IO pushing state changes to staff kiosks, student tracking screens, and manager dashboards.
4. **Resilient Persistence**: Database abstraction supporting PostgreSQL for production deployments and embedded SQLite for zero-dependency local testing.
5. **Fail-Safe Fallbacks**: Transparent rule-based fallback mechanisms for AI predictions when historical data volume is low.

## Layer Decomposition

```
+-----------------------------------------------------------------------+
|                         CLIENT PRESENTATION                           |
|  React 18 Single Page App | Tailwind CSS | Socket.IO | Recharts       |
+-----------------------------------------------------------------------+
                                   |
                         (REST API & WebSockets)
                                   v
+-----------------------------------------------------------------------+
|                         BACKEND ENGINE (Node.js)                      |
|  Express.js | Auth & RBAC | Order Engine | Socket.IO Server           |
+-----------------------------------------------------------------------+
                |                                      |
       (SQL Queries & Pools)                  (HTTP JSON Proxy)
                v                                      v
+------------------------------------+   +------------------------------+
|     PERSISTENCE LAYER (DB)         |   |    AI MICROSERVICE (Python)  |
|  PostgreSQL / SQLite Database      |   |  FastAPI | XGBoost | Pandas  |
+------------------------------------+   +------------------------------+
```
