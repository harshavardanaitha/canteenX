-- CANTEENX DATABASE SCHEMA (PostgreSQL / SQLite Compatible)
-- Normalized relational architecture for Smart Campus Food Service Platform

-- 1. COLLEGES
CREATE TABLE IF NOT EXISTS colleges (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CAMPUSES
CREATE TABLE IF NOT EXISTS campuses (
    id VARCHAR(36) PRIMARY KEY,
    college_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
);

-- 3. DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(36) PRIMARY KEY,
    college_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    building VARCHAR(100),
    floor VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
);

-- 4. USERS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    college_id VARCHAR(36),
    department_id VARCHAR(36),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('STUDENT', 'FACULTY', 'CANTEEN_STAFF', 'CANTEEN_MANAGER', 'COLLEGE_ADMIN', 'SUPER_ADMIN')),
    phone VARCHAR(50),
    card_id VARCHAR(100),
    room_number VARCHAR(50),
    reward_points INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 5. CANTEENS
CREATE TABLE IF NOT EXISTS canteens (
    id VARCHAR(36) PRIMARY KEY,
    campus_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    location_details VARCHAR(255),
    opening_time VARCHAR(10) DEFAULT '08:00',
    closing_time VARCHAR(10) DEFAULT '20:00',
    is_active INTEGER DEFAULT 1,
    enable_delivery INTEGER DEFAULT 1,
    enable_preorder INTEGER DEFAULT 1,
    current_queue_count INTEGER DEFAULT 0,
    avg_prep_time_mins INTEGER DEFAULT 10,
    sustainability_score DECIMAL(5,2) DEFAULT 85.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campus_id) REFERENCES campuses(id) ON DELETE CASCADE
);

-- 6. CANTEEN STAFF ASSIGNMENTS
CREATE TABLE IF NOT EXISTS canteen_staff (
    id VARCHAR(36) PRIMARY KEY,
    canteen_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    shift VARCHAR(50) DEFAULT 'MORNING',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (canteen_id) REFERENCES canteens(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. MENU CATEGORIES
CREATE TABLE IF NOT EXISTS menu_categories (
    id VARCHAR(36) PRIMARY KEY,
    canteen_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (canteen_id) REFERENCES canteens(id) ON DELETE CASCADE
);

-- 8. MENU ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
    id VARCHAR(36) PRIMARY KEY,
    canteen_id VARCHAR(36) NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_veg INTEGER DEFAULT 1,
    calories INTEGER DEFAULT 0,
    prep_time_mins INTEGER DEFAULT 10,
    rating DECIMAL(3,2) DEFAULT 4.5,
    rating_count INTEGER DEFAULT 0,
    availability_status VARCHAR(50) DEFAULT 'AVAILABLE' CHECK (availability_status IN ('AVAILABLE', 'LOW_STOCK', 'SOLD_OUT', 'TEMPORARILY_UNAVAILABLE')),
    available_quantity INTEGER DEFAULT 100,
    is_popular INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (canteen_id) REFERENCES canteens(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
);

-- 9. SUPPLIERS
CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(36) PRIMARY KEY,
    canteen_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (canteen_id) REFERENCES canteens(id) ON DELETE CASCADE
);

-- 10. INVENTORY
CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(36) PRIMARY KEY,
    canteen_id VARCHAR(36) NOT NULL,
    supplier_id VARCHAR(36),
    ingredient_name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    current_stock DECIMAL(10,2) DEFAULT 0.00,
    min_stock_threshold DECIMAL(10,2) DEFAULT 5.00,
    max_stock_capacity DECIMAL(10,2) DEFAULT 100.00,
    cost_per_unit DECIMAL(10,2) DEFAULT 0.00,
    batch_number VARCHAR(100),
    expiry_date DATE,
    last_restocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (canteen_id) REFERENCES canteens(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- 11. INVENTORY TRANSACTIONS
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id VARCHAR(36) PRIMARY KEY,
    inventory_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36),
    transaction_type VARCHAR(50) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 12. PICKUP SLOTS
CREATE TABLE IF NOT EXISTS pickup_slots (
    id VARCHAR(36) PRIMARY KEY,
    canteen_id VARCHAR(36) NOT NULL,
    slot_time VARCHAR(50) NOT NULL,
    max_capacity INTEGER DEFAULT 30,
    current_booked INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (canteen_id) REFERENCES canteens(id) ON DELETE CASCADE
);

-- 13. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    canteen_id VARCHAR(36) NOT NULL,
    order_type VARCHAR(50) NOT NULL DEFAULT 'PICKUP',
    order_status VARCHAR(50) NOT NULL DEFAULT 'PLACED',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(50) DEFAULT 'RAZORPAY',
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    final_amount DECIMAL(10,2) NOT NULL,
    token_number INTEGER NOT NULL,
    pickup_slot_id VARCHAR(36),
    scheduled_time TIMESTAMP,
    delivery_building VARCHAR(100),
    delivery_floor VARCHAR(20),
    delivery_room VARCHAR(50),
    est_prep_mins INTEGER DEFAULT 15,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (canteen_id) REFERENCES canteens(id) ON DELETE CASCADE,
    FOREIGN KEY (pickup_slot_id) REFERENCES pickup_slots(id) ON DELETE SET NULL
);

-- 14. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    menu_item_id VARCHAR(36) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    special_instructions TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- 15. ORDER STATUS HISTORY
CREATE TABLE IF NOT EXISTS order_status_history (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    status VARCHAR(50) NOT NULL,
    changed_by_user_id VARCHAR(36),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 16. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    transaction_id VARCHAR(255) NOT NULL,
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) NOT NULL,
    payment_gateway VARCHAR(50) DEFAULT 'RAZORPAY',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 17. QR TOKENS
CREATE TABLE IF NOT EXISTS qr_tokens (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) UNIQUE NOT NULL,
    token_code VARCHAR(255) NOT NULL,
    qr_payload TEXT NOT NULL,
    is_scanned INTEGER DEFAULT 0,
    scanned_at TIMESTAMP,
    scanned_by_user_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (scanned_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 18. REVIEWS & RATINGS
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36),
    user_id VARCHAR(36) NOT NULL,
    canteen_id VARCHAR(36) NOT NULL,
    menu_item_id VARCHAR(36),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (canteen_id) REFERENCES canteens(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- 19. COMPLAINTS
CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(36) PRIMARY KEY,
    ticket_number VARCHAR(50),
    user_id VARCHAR(36) NOT NULL,
    canteen_id VARCHAR(36) NOT NULL,
    order_id VARCHAR(36),
    category VARCHAR(50) NOT NULL CHECK(category IN ('WRONG_ITEM', 'MISSING_ITEM', 'LATE_ORDER', 'PAYMENT_ISSUE', 'FOOD_QUALITY', 'SERVICE_ISSUE', 'HYGIENE', 'PRICING', 'WAITING_TIME', 'DELIVERY', 'OTHER')),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'IN_REVIEW', 'RESOLVED', 'CLOSED')),
    resolution_notes TEXT,
    resolved_by_user_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (canteen_id) REFERENCES canteens(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 20. COMPLAINT RESPONSES
CREATE TABLE IF NOT EXISTS complaint_responses (
    id VARCHAR(36) PRIMARY KEY,
    complaint_id VARCHAR(36) NOT NULL,
    responder_id VARCHAR(36) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (responder_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 21. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'ORDER_STATUS',
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 22. COUPONS
CREATE TABLE IF NOT EXISTS coupons (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL DEFAULT 'PERCENTAGE',
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0.00,
    max_discount_amount DECIMAL(10,2) DEFAULT 100.00,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    usage_limit INTEGER DEFAULT 1000,
    times_used INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1
);

-- 23. REWARDS & TRANSACTIONS
CREATE TABLE IF NOT EXISTS reward_transactions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    points INTEGER NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 24. FOOD WASTE MANAGEMENT
CREATE TABLE IF NOT EXISTS food_waste (
    id VARCHAR(36) PRIMARY KEY,
    canteen_id VARCHAR(36) NOT NULL,
    menu_item_id VARCHAR(36),
    prepared_quantity DECIMAL(10,2) NOT NULL,
    sold_quantity DECIMAL(10,2) NOT NULL,
    wasted_quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) DEFAULT 'servings',
    waste_cost DECIMAL(10,2) DEFAULT 0.00,
    waste_reason VARCHAR(100) NOT NULL,
    recorded_by_user_id VARCHAR(36),
    waste_date DATE DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (canteen_id) REFERENCES canteens(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL,
    FOREIGN KEY (recorded_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 25. AI DEMAND PREDICTIONS
CREATE TABLE IF NOT EXISTS demand_predictions (
    id VARCHAR(36) PRIMARY KEY,
    canteen_id VARCHAR(36) NOT NULL,
    menu_item_id VARCHAR(36) NOT NULL,
    target_date DATE NOT NULL,
    target_hour INTEGER NOT NULL,
    predicted_demand INTEGER NOT NULL,
    recommended_prep INTEGER NOT NULL,
    confidence_score DECIMAL(5,2) DEFAULT 0.85,
    influencing_factors TEXT,
    model_version VARCHAR(50) DEFAULT 'xgb_v1.0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (canteen_id) REFERENCES canteens(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- 26. AI QUEUE PREDICTIONS
CREATE TABLE IF NOT EXISTS queue_predictions (
    id VARCHAR(36) PRIMARY KEY,
    canteen_id VARCHAR(36) NOT NULL,
    current_orders INTEGER NOT NULL,
    staff_on_duty INTEGER NOT NULL,
    predicted_wait_mins INTEGER NOT NULL,
    confidence_score DECIMAL(5,2) DEFAULT 0.90,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (canteen_id) REFERENCES canteens(id) ON DELETE CASCADE
);

-- 27. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR(36) PRIMARY KEY,
    college_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    target_role VARCHAR(50) DEFAULT 'ALL',
    is_active INTEGER DEFAULT 1,
    created_by_user_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 28. CAMPUS EVENTS (EVENT MODE)
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(36) PRIMARY KEY,
    college_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(100) DEFAULT 'COLLEGE_FEST',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_event_mode_active INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
);

-- 29. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(36),
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- INDEXES FOR HIGH-PERFORMANCE QUERYING
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_menu_items_canteen ON menu_items(canteen_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_status ON menu_items(availability_status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_canteen ON orders(canteen_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_inventory_canteen ON inventory(canteen_id);
CREATE INDEX IF NOT EXISTS idx_food_waste_canteen ON food_waste(canteen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_user ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_canteen ON complaints(canteen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_reviews_canteen ON reviews(canteen_id);
CREATE INDEX IF NOT EXISTS idx_reviews_menu_item ON reviews(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
