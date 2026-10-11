# CanteenX API Specification

## Authentication Endpoints
- `POST /api/auth/register`: Register user account (Student / Faculty).
- `POST /api/auth/login`: Authenticate user & return JWT token.
- `GET /api/auth/me`: Retrieve authenticated user profile.

## Canteen & Menu Endpoints
- `GET /api/canteens`: List canteens for selected college.
- `GET /api/canteens/:id`: Retrieve canteen details & real-time queue.
- `GET /api/menu`: List menu categories & items with live availability.
- `PATCH /api/menu/:id/availability`: Canteen staff/manager update stock status.

## Order Endpoints
- `POST /api/orders`: Place new food order (Pickup or Cabin Delivery).
- `GET /api/orders`: List orders filtered by role (Student history or Staff active queue).
- `GET /api/orders/:id`: Get order tracking details & digital token.
- `PATCH /api/orders/:id/status`: Update order status (`ACCEPTED`, `PREPARING`, `READY`, `COMPLETED`).
- `POST /api/orders/qr-verify`: Verify QR token code for counter pickup.

## Payment Endpoints
- `POST /api/payments/create-razorpay-order`: Initialize Razorpay payment order.
- `POST /api/payments/verify`: Validate payment signature & finalize order.

## Inventory & Waste Endpoints
- `GET /api/inventory`: List ingredients & current stock levels.
- `POST /api/inventory`: Add or update stock.
- `POST /api/waste`: Record food waste item log.
- `GET /api/waste/analytics`: Waste cost summary & reason distribution.

## AI & Copilot Endpoints
- `GET /api/predictions/demand`: Get item demand forecasts & preparation recommendation.
- `GET /api/predictions/queue`: Get current canteen queue prediction & wait mins.
- `POST /api/copilot/query`: Manager natural language AI Operations Copilot query.

## Analytics & Admin Endpoints
- `GET /api/analytics/dashboard`: Multi-canteen aggregate metrics.
- `GET /api/analytics/heatmap`: Campus food activity heatmap data.
- `POST /api/announcements`: Create campus-wide announcement broadcast.
