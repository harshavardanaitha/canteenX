# CanteenX Security & Access Control Specification

## Role-Based Access Control (RBAC) Matrix

| Endpoint Group | Student | Faculty | Staff | Manager | Admin | Super Admin |
|---|---|---|---|---|---|---|
| View Menu & Queue | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Place Order | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Cabin Delivery | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Kitchen Queue & Scan QR | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Menu & Stock Mgmt | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Waste Logging & Copilot | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Campus Analytics & User Mgmt | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Multi-College Platform Config | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

## Security Controls
1. **Password Hashing**: `bcryptjs` with salt rounds = 10.
2. **Stateless Auth**: JWT Tokens signed with SHA256 containing User ID, Role, and College ID.
3. **HTTP Security Headers**: `Helmet.js` protection against XSS, clickjacking, and MIME sniffing.
4. **Rate Limiting**: IP-based rate limiting on sensitive auth endpoints.
5. **Data Isolation**: Multi-tenant dataset partitioning by `college_id` and `canteen_id`.
