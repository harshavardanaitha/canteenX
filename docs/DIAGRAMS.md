# CanteenX System Architecture & Diagrams Specification

> [!IMPORTANT]
> **Source-of-Truth Compliance**: This document defines the genuine software architecture, data flows, entity relationships, and sequence interactions for **CanteenX - Smart Campus Food Service Platform**. All scam detection/Sentinel components from legacy references have been completely excluded.

---

## 1. System Architecture Diagram

```mermaid
flowchart TD
    subgraph USER_LAYER["User Access Layer (Responsive Multi-Device UI)"]
        A1["Student Portal (Mobile-First)"]
        A2["Faculty Cabin Portal"]
        A3["Kitchen Staff Kiosk / Scanner"]
        A4["Manager Operational Dashboard"]
        A5["College & Super Admin Console"]
    end

    subgraph PRESENTATION_LAYER["Frontend Application Layer"]
        B1["React 18 SPA + Vite"]
        B2["Tailwind CSS + Lucide Icons"]
        B3["Socket.IO Client Real-Time Listener"]
        B4["Recharts / Chart.js Data Visualizations"]
    end

    subgraph API_GATEWAY["Backend Core API Gateway (Node.js & Express)"]
        C1["JWT Authentication & RBAC Middleware"]
        C2["Order Engine & Token Generator"]
        C3["Inventory & Waste Tracker"]
        C4["Socket.IO Event Broadcaster"]
        C5["Razorpay Payment Handler"]
    end

    subgraph AI_LAYER["AI / ML Microservice (FastAPI & Python)"]
        D1["XGBoost Demand Forecaster"]
        D2["Queue & Wait Time Estimator"]
        D3["Predictive Inventory Alert Engine"]
        D4["Personalized Recommendation Engine"]
        D5["AI Operations Copilot (DB RAG Analytics)"]
    end

    subgraph DATABASE_LAYER["Persistence & Cache Layer"]
        E1[("PostgreSQL / SQLite Storage")]
        E2["Normalized Relational Schema (28 Tables)"]
    end

    subgraph EXTERNAL_SERVICES["External Integrations"]
        F1["Razorpay Payment Gateway"]
        F2["Firebase Cloud Messaging (FCM)"]
    end

    A1 & A2 & A3 & A4 & A5 --> B1
    B1 --> B2 & B3 & B4
    B1 -->|REST HTTP / HTTPS| C1
    B3 <-->|WebSocket bi-directional| C4
    C1 --> C2 & C3 & C5
    C2 & C3 & C5 --> E1
    C1 -->|FastAPI Proxy / Internal Call| D1 & D2 & D3 & D4 & D5
    D1 & D2 & D3 & D4 & D5 -->|Query Analytics & History| E1
    C5 <--> F1
    C4 -.-> F2
```

---

## 2. UML / Use Case Diagram

```mermaid
graph TD
    subgraph ACTORS["Platform Actors"]
        Student["Student"]
        Faculty["Faculty Member"]
        Staff["Canteen Staff"]
        Manager["Canteen Manager"]
        Admin["College Admin"]
        SuperAdmin["Super Admin"]
    end

    subgraph USE_CASES["CanteenX Core Use Cases"]
        UC1["Browse Menus & Real-Time Availability"]
        UC2["Check Queue & Estimated Wait Time"]
        UC3["Place Online Order (Pickup / Cabin Delivery)"]
        UC4["Select Capacity-Constrained Pickup Slot"]
        UC5["Process Digital Payment (Razorpay/Mock)"]
        UC6["Receive Digital Token & Live Order Tracking"]
        UC7["Scan & Validate QR Code Token"]
        UC8["Manage Kitchen Queue & Order States"]
        UC9["Update Food Item Stock & Preparation Time"]
        UC10["Log Food Waste & Waste Reason"]
        UC11["Manage Menu, Categories & Pricing"]
        UC12["Track Ingredients & Predictive Low-Stock"]
        UC13["Query AI Operations Copilot"]
        UC14["View Canteen Analytics & Sustainability Score"]
        UC15["Manage Campus Users & Announcements"]
        UC16["Manage Multi-College System Settings"]
    end

    Student --> UC1 & UC2 & UC3 & UC4 & UC5 & UC6
    Faculty --> UC1 & UC2 & UC3 & UC4 & UC5 & UC6
    Staff --> UC7 & UC8 & UC9 & UC10
    Manager --> UC9 & UC10 & UC11 & UC12 & UC13 & UC14
    Admin --> UC14 & UC15
    SuperAdmin --> UC16
```

---

## 3. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    COLLEGES ||--o{ CAMPUSES : "hosts"
    COLLEGES ||--o{ DEPARTMENTS : "contains"
    COLLEGES ||--o{ ANNOUNCEMENTS : "publishes"
    CAMPUSES ||--o{ CANTEENS : "houses"
    DEPARTMENTS ||--o{ USERS : "employs/teaches"
    COLLEGES ||--o{ USERS : "registers"
    
    CANTEENS ||--o{ MENU_CATEGORIES : "organizes"
    MENU_CATEGORIES ||--o{ MENU_ITEMS : "contains"
    CANTEENS ||--o{ CANTEEN_STAFF : "employs"
    USERS ||--o{ CANTEEN_STAFF : "assigned as"
    
    USERS ||--o{ ORDERS : "places"
    CANTEENS ||--o{ ORDERS : "fulfills"
    ORDERS ||--o{ ORDER_ITEMS : "includes"
    MENU_ITEMS ||--o{ ORDER_ITEMS : "selected in"
    
    ORDERS ||--|| PAYMENTS : "paid via"
    ORDERS ||--|| QR_TOKENS : "verifies with"
    ORDERS ||--o{ ORDER_STATUS_HISTORY : "tracks"
    
    CANTEENS ||--o{ INVENTORY : "stores"
    SUPPLIERS ||--o{ INVENTORY : "supplies"
    INVENTORY ||--o{ INVENTORY_TRANSACTIONS : "logs"
    
    CANTEENS ||--o{ FOOD_WASTE : "records"
    MENU_ITEMS ||--o{ FOOD_WASTE : "itemized in"
    
    MENU_ITEMS ||--o{ DEMAND_PREDICTIONS : "forecasted for"
    CANTEENS ||--o{ QUEUE_PREDICTIONS : "modeled for"
    
    USERS ||--o{ REVIEWS : "writes"
    USERS ||--o{ COMPLAINTS : "files"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ REWARD_TRANSACTIONS : "accumulates"
```

---

## 4. Data Flow Diagrams (DFD)

### DFD Level 0 (Context Diagram)

```mermaid
flowchart TD
    P1["Student / Faculty"] -->|Order Request, Payment, Query| SYS["CanteenX Platform"]
    P2["Canteen Staff"] -->|Order Status Update, QR Scan, Waste Log| SYS
    P3["Canteen Manager"] -->|Menu Update, Restock, Copilot Query| SYS
    P4["College Admin"] -->|User Management, Announcements| SYS

    SYS -->|Digital Token, Live Status, Recommendations| P1
    SYS -->|Kitchen Workload, QR Validation Result| P2
    SYS -->|Demand Predictions, Stock Alerts, Sustainability Score| P3
    SYS -->|Campus Heatmap, Revenue Analytics, Complaints| P4

    SYS <-->|Transaction Auth / Callback| EXT1["Razorpay Payment Gateway"]
    SYS -->|Push Alerts| EXT2["Firebase / Socket.IO Service"]
```

### DFD Level 1 (Decomposed Processes)

```mermaid
flowchart TD
    subgraph DFD_L1["CanteenX Core System Processes"]
        PROC1["1.0 User Authentication & RBAC"]
        PROC2["2.0 Real-Time Menu & Availability Engine"]
        PROC3["3.0 Order Placement & Token Dispatcher"]
        PROC4["4.0 Payment Gateway Gateway"]
        PROC5["5.0 QR Verification & Pickup Engine"]
        PROC6["6.0 Kitchen Workload & Queue Estimator"]
        PROC7["7.0 Smart Inventory & Predictive Restock"]
        PROC8["8.0 Food Waste & Sustainability Tracker"]
        PROC9["9.0 AI Demand & Copilot Engine"]
    end

    DB[("Central Database (PostgreSQL/SQLite)")]

    PROC1 <--> DB
    PROC2 <--> DB
    PROC3 <--> DB
    PROC4 <--> DB
    PROC5 <--> DB
    PROC6 <--> DB
    PROC7 <--> DB
    PROC8 <--> DB
    PROC9 <--> DB
```

---

## 5. Component Diagram

```mermaid
graph LR
    subgraph FRONTEND["Frontend Component Module"]
        FC1["AuthContext Provider"]
        FC2["Menu & Cart Component"]
        FC3["Live Tracker & Socket Hook"]
        FC4["Staff QR Scanner Modal"]
        FC5["Manager Copilot & Analytics View"]
    end

    subgraph BACKEND["Backend Controller Services"]
        BC1["Auth & User Controller"]
        BC2["Menu & Canteen Controller"]
        BC3["Order & Token Controller"]
        BC4["Payment Controller"]
        BC5["Inventory & Waste Controller"]
        BC6["Analytics & AI Proxy Controller"]
    end

    subgraph AI_SERVICE["Python AI FastAPI Microservice"]
        AC1["Forecast API (/api/predictions/demand)"]
        AC2["Queue API (/api/predictions/queue)"]
        AC3["Copilot RAG Query Engine (/api/copilot/query)"]
    end

    FC1 --> BC1
    FC2 --> BC2 & BC3
    FC3 --> BC3
    FC4 --> BC3
    FC5 --> BC5 & BC6
    BC6 --> AC1 & AC2 & AC3
```

---

## 6. Sequence Diagrams

### Sequence Diagram 1: Student Login & Role Authentication

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Frontend as Frontend (React SPA)
    participant AuthAPI as Auth Controller (/api/auth)
    participant DB as Central Database
    participant JWT as JWT Token Signer

    Student->>Frontend: Enter campus email & password
    Frontend->>AuthAPI: POST /api/auth/login {email, password}
    AuthAPI->>DB: SELECT * FROM users WHERE email = $1
    alt User Found & Active
        AuthAPI->>AuthAPI: bcrypt.compare(password, user.password_hash)
        alt Password Matches
            AuthAPI->>JWT: Generate Access Token (userId, role, collegeId)
            JWT-->>AuthAPI: Signed JWT Token
            AuthAPI->>DB: INSERT INTO audit_logs (user_id, action: 'LOGIN_SUCCESS')
            AuthAPI-->>Frontend: 200 OK {token, user: {name, role, reward_points}}
            Frontend->>Frontend: Store token in localStorage & update AuthContext
            Frontend-->>Student: Redirect to Student Portal / Dashboard
        else Invalid Password
            AuthAPI-->>Frontend: 401 Unauthorized {error: "Invalid credentials"}
            Frontend-->>Student: Display error banner
        end
    else User Not Found
        AuthAPI-->>Frontend: 401 Unauthorized {error: "Account not found"}
        Frontend-->>Student: Display account not found
    end
```

---

### Sequence Diagram 2: Food Ordering & Capacity Slot Allocation

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Frontend as Frontend Menu & Cart
    participant OrderAPI as Order Controller (/api/orders)
    participant SlotEngine as Slot Capacity Validator
    participant DB as Central Database
    participant Socket as Socket.IO Broadcaster

    Student->>Frontend: Add food items to cart & select Pickup Slot (13:15-13:30)
    Frontend->>OrderAPI: POST /api/orders {canteen_id, items, slot_id, order_type}
    OrderAPI->>DB: Validate menu items availability & calculate item total
    OrderAPI->>SlotEngine: Check remaining capacity for slot_id
    alt Slot Capacity Available (current_orders < max_capacity)
        SlotEngine-->>OrderAPI: Slot Reserved
        OrderAPI->>DB: INSERT INTO orders (order_status: 'PENDING_PAYMENT')
        OrderAPI->>DB: INSERT INTO order_items (...)
        OrderAPI->>DB: UPDATE pickup_slots SET current_orders = current_orders + 1
        OrderAPI-->>Frontend: 201 Created {order_id, total_amount, razorpay_order_id}
        Frontend-->>Student: Present Payment Screen
    else Slot Full (Overcapacity Peak)
        SlotEngine-->>OrderAPI: Slot Overcapacity Reached
        OrderAPI-->>Frontend: 400 Bad Request {error: "Slot full. Select alternate window."}
        Frontend-->>Student: Suggest next available 15-min slot
    end
```

---

### Sequence Diagram 3: Digital Payment Processing (Razorpay / Mock)

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Frontend as React Payment Drawer
    participant PaymentAPI as Payment Controller (/api/payments)
    participant Razorpay as Razorpay Gateway / Mock
    participant DB as Central Database
    participant Socket as Socket.IO Broadcaster

    Student->>Frontend: Click "Pay ₹185 via UPI / Razorpay"
    Frontend->>Razorpay: Open Razorpay Checkout modal (order_id, key_id, amount)
    Student->>Razorpay: Enter UPI PIN or Mock Confirm
    Razorpay-->>Frontend: Success Callback {razorpay_payment_id, razorpay_signature}
    Frontend->>PaymentAPI: POST /api/payments/verify {order_id, razorpay_payment_id, signature}
    PaymentAPI->>PaymentAPI: Verify HMAC SHA256 signature
    PaymentAPI->>DB: UPDATE payments SET payment_status = 'PAID', transaction_ref = $1
    PaymentAPI->>DB: UPDATE orders SET order_status = 'PLACED'
    PaymentAPI->>DB: Generate Token Number (e.g. #42) & insert into qr_tokens
    PaymentAPI->>DB: Award Student Reward Points (+18 pts)
    PaymentAPI->>Socket: Emit "new_order" {canteen_id, token_number: 42, items}
    PaymentAPI-->>Frontend: 200 OK {status: "PAID", token_number: 42, qr_payload}
    Frontend-->>Student: Display Token #42 & Animated Pickup QR Code
```

---

### Sequence Diagram 4: Staff QR Code Verification & Token Pickup

```mermaid
sequenceDiagram
    autonumber
    actor Staff
    actor Student
    participant ScannerUI as Staff Kiosk / QR Scanner
    participant OrderAPI as Order Controller (/api/orders)
    participant TokenEngine as Token Verification Engine
    participant DB as Central Database
    participant Socket as Socket.IO Broadcaster

    Student->>Staff: Present Digital QR Code on smartphone
    Staff->>ScannerUI: Point camera / input token payload
    ScannerUI->>OrderAPI: POST /api/orders/qr-verify {token_payload}
    OrderAPI->>TokenEngine: Parse & verify cryptographic payload
    TokenEngine->>DB: SELECT * FROM qr_tokens JOIN orders WHERE token_id = $1
    alt Token Valid & Order Status == 'READY'
        OrderAPI->>DB: UPDATE orders SET order_status = 'COMPLETED', completed_at = NOW()
        OrderAPI->>DB: UPDATE qr_tokens SET is_used = 1, used_at = NOW()
        OrderAPI->>DB: INSERT INTO order_status_history (status: 'COMPLETED')
        OrderAPI->>Socket: Emit "order_updated" {order_id, status: 'COMPLETED'}
        OrderAPI-->>ScannerUI: 200 OK {success: true, message: "Token #42 Verified", items}
        ScannerUI-->>Staff: Green Checkmark Displayed & Audio Ping
        Staff->>Student: Hand over prepared meal tray
    else Token Already Used
        OrderAPI-->>ScannerUI: 400 Bad Request {error: "Token already claimed at 13:22"}
        ScannerUI-->>Staff: Red Warning: Duplicate Pickup Attempt
    end
```

---

### Sequence Diagram 5: AI Demand Prediction & Preparation Planning

```mermaid
sequenceDiagram
    autonumber
    actor Manager as Canteen Manager
    participant Dashboard as Manager Dashboard UI
    participant Backend as Express Backend API
    participant AIService as FastAPI AI Service (Python)
    participant XGBoost as XGBoost ML Model
    participant DB as Central Database

    Manager->>Dashboard: Open "AI Demand Forecaster" for Tomorrow
    Dashboard->>Backend: GET /api/predictions/demand?canteen_id=cnt_main&target_date=2026-10-09
    Backend->>AIService: GET /predict/demand (features: day_of_week, weather, is_exam, is_fest)
    AIService->>DB: Fetch 30-day historical order quantities per menu item
    AIService->>XGBoost: model.predict(scaled_features)
    XGBoost-->>AIService: Predicted Portion Demands & 95% Confidence Intervals
    AIService->>AIService: Calculate Recommended Ingredient Prep (kg flour, paneer, veggies)
    AIService-->>Backend: JSON {forecasts: [{item: "Paneer Wrap", predicted_qty: 65, buffer: 75}]}
    Backend->>DB: Cache forecasts in demand_predictions table
    Backend-->>Dashboard: Return forecasted demand chart & prep recommendations
    Dashboard-->>Manager: Render interactive visual demand curve & 1-click Prep Sheet
```

---

### Sequence Diagram 6: AI Queue & Wait Time Estimation

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Frontend as Student Canteen Switcher
    participant QueueAPI as Prediction Controller (/api/predictions/queue)
    participant AIService as AI Queue Estimator
    participant DB as Central Database

    Student->>Frontend: View Campus Canteen List
    Frontend->>QueueAPI: GET /api/predictions/queue?canteen_id=cnt_main
    QueueAPI->>DB: SELECT COUNT(*) FROM orders WHERE order_status IN ('PLACED', 'ACCEPTED', 'PREPARING')
    QueueAPI->>DB: SELECT AVG(prep_time_mins) FROM order_items JOIN orders WHERE status = 'PREPARING'
    QueueAPI->>AIService: Compute Dynamic Queue Matrix (active_orders, staff_count: 4, cooking_stations: 3)
    AIService->>AIService: T_wait = (active_orders * avg_prep_time) / active_cooks
    AIService-->>QueueAPI: Return {queue_count: 8, estimated_wait_mins: 12, crowd_level: "MODERATE"}
    QueueAPI-->>Frontend: 200 OK {estimated_wait_mins: 12, crowd_level: "MODERATE"}
    Frontend-->>Student: Display "🟡 Moderate Crowd (~12 mins wait)" badge
```

---

### Sequence Diagram 7: Predictive Inventory Alert & Automatic Restocking Trigger

```mermaid
sequenceDiagram
    autonumber
    participant System as Background Cron / Inventory Engine
    participant InventoryAPI as Inventory Controller (/api/inventory)
    participant AIService as AI Stock Depletion Model
    participant DB as Central Database
    participant NotificationAPI as Notification Service

    System->>InventoryAPI: Run hourly stock depletion check
    InventoryAPI->>DB: SELECT * FROM inventory WHERE canteen_id = $1
    InventoryAPI->>AIService: Predict usage velocity for next 48 hours based on demand forecasts
    alt Projected Stock < Reorder Point (e.g. Cooking Oil < 15 Liters)
        InventoryAPI->>DB: INSERT INTO audit_logs (action: 'LOW_STOCK_PREDICTED', item: 'Cooking Oil')
        InventoryAPI->>NotificationAPI: Send notification to Canteen Manager
        NotificationAPI->>DB: INSERT INTO notifications (recipient_role: 'CANTEEN_MANAGER', title: 'Restock Alert')
        NotificationAPI->>NotificationAPI: Dispatch push / email alert to preferred supplier
        InventoryAPI-->>System: Log Restock PO #PO-8821 Generated
    else Stock Levels Healthy
        InventoryAPI-->>System: Stock verified adequate
    end
```

---

### Sequence Diagram 8: Faculty Cabin Delivery & Priority Dispatch

```mermaid
sequenceDiagram
    autonumber
    actor Faculty as Faculty Member
    participant FacultyUI as Faculty Exclusive Portal
    participant OrderAPI as Order Controller (/api/orders)
    participant DB as Central Database
    participant KitchenUI as Staff Kitchen Queue
    participant Socket as Socket.IO Broadcaster

    Faculty->>FacultyUI: Select "Tech Block A, Floor 2, Cabin 204" + Delivery at 13:10
    FacultyUI->>OrderAPI: POST /api/orders {order_type: 'CABIN_DELIVERY', cabin_details: {...}, items}
    OrderAPI->>DB: INSERT INTO orders (order_type: 'CABIN_DELIVERY', delivery_location: 'Block A - 204', is_priority: 1)
    OrderAPI->>DB: INSERT INTO order_status_history (status: 'PLACED', notes: 'VIP Faculty Priority')
    OrderAPI->>Socket: Emit "faculty_priority_order" {cabin: "204", target_time: "13:10"}
    Socket-->>KitchenUI: Highlight Order with Golden "FACULTY CABIN" badge at TOP of queue
    KitchenUI-->>Staff: Staff prepares order with priority packaging
    Staff->>KitchenUI: Click "Dispatched for Cabin Delivery"
    KitchenUI->>OrderAPI: PATCH /api/orders/:id/status {status: 'OUT_FOR_DELIVERY'}
    OrderAPI->>Socket: Emit "order_status_update" {status: 'OUT_FOR_DELIVERY'}
    Socket-->>FacultyUI: "Runner en route to Tech Block A - Cabin 204 (ETA 3 mins)"
    Staff->>Faculty: Meal delivered to cabin door
```
