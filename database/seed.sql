-- CANTEENX SEED DATA REPOSITORY
-- Provides rich, production-grade initial seed dataset for testing all 6 user roles and operational workflows.

-- 1. COLLEGES
INSERT INTO colleges (id, name, code, address, city, state, contact_email, contact_phone) VALUES
('clg_anurag', 'ANURAG UNIVERSITY', 'ANU', '200 University Lane, City Center', 'Hyderabad', 'Telangana', 'info@anurag.edu', '+91 40 1111 2222');

-- 2. CAMPUSES
INSERT INTO campuses (id, college_id, name, code, address) VALUES
('cmp_main', 'clg_anurag', 'Main Academic Campus', 'ANU-MAIN', 'Anurag University, Venkatapur, Ghatkesar, Hyderabad');

-- 3. DEPARTMENTS
INSERT INTO departments (id, college_id, name, code, building, floor) VALUES
('dept_cse', 'clg_anurag', 'Computer Science & Engineering', 'CSE', 'D-Block', '2nd Floor'),
('dept_ece', 'clg_anurag', 'Electronics & Communication', 'ECE', 'D-Block', '3rd Floor'),
('dept_mech', 'clg_anurag', 'Mechanical Engineering', 'MECH', 'Workshop Block', '1st Floor'),
('dept_civil', 'clg_anurag', 'Civil Engineering', 'CIVIL', 'Civil Block', '1st Floor'),
('dept_mba', 'clg_anurag', 'School of Business', 'MBA', 'Management Block', '4th Floor');

-- 4. DEMO USERS (Password for all demo accounts: 'password123')
INSERT INTO users (id, college_id, department_id, full_name, email, password_hash, role, phone, room_number, reward_points) VALUES
('usr_student1', 'clg_anurag', 'dept_cse', 'Rishi Student', 'student@anurag.edu', '$2a$10$eW6YctvYQFZnsWPSPqSPCOB0uAD2KmjgVus4g6ZwMruYeHByBdaDC', 'STUDENT', '9876543210', 'Dorm 104', 240),
('usr_faculty1', 'clg_anurag', 'dept_cse', 'Dr. Sharma Faculty', 'faculty@anurag.edu', '$2a$10$eW6YctvYQFZnsWPSPqSPCOB0uAD2KmjgVus4g6ZwMruYeHByBdaDC', 'FACULTY', '9876543211', 'Cabin 204', 380),
('usr_staff1', 'clg_anurag', 'dept_cse', 'Suresh Canteen Staff', 'staff@anurag.edu', '$2a$10$eW6YctvYQFZnsWPSPqSPCOB0uAD2KmjgVus4g6ZwMruYeHByBdaDC', 'CANTEEN_STAFF', '9876543212', 'Counter 1', 0),
('usr_manager1', 'clg_anurag', 'dept_cse', 'Rajesh Canteen Manager', 'manager@anurag.edu', '$2a$10$eW6YctvYQFZnsWPSPqSPCOB0uAD2KmjgVus4g6ZwMruYeHByBdaDC', 'CANTEEN_MANAGER', '9876543213', 'Manager Office', 0),
('usr_admin1', 'clg_anurag', 'dept_cse', 'Dean Admin Officer', 'admin@anurag.edu', '$2a$10$eW6YctvYQFZnsWPSPqSPCOB0uAD2KmjgVus4g6ZwMruYeHByBdaDC', 'COLLEGE_ADMIN', '9876543214', 'Admin Block 101', 0),
('usr_superadmin1', NULL, NULL, 'CanteenX Super Admin', 'superadmin@canteenx.com', '$2a$10$eW6YctvYQFZnsWPSPqSPCOB0uAD2KmjgVus4g6ZwMruYeHByBdaDC', 'SUPER_ADMIN', '9876543215', 'HQ', 0),
('usr_student2', 'clg_anurag', 'dept_ece', 'Ananya Verma', 'ananya@anurag.edu', '$2a$10$eW6YctvYQFZnsWPSPqSPCOB0uAD2KmjgVus4g6ZwMruYeHByBdaDC', 'STUDENT', '9876543220', 'Dorm 210', 110),
('usr_faculty2', 'clg_anurag', 'dept_mba', 'Prof. K. Venkatesh', 'kvenkat@anurag.edu', '$2a$10$eW6YctvYQFZnsWPSPqSPCOB0uAD2KmjgVus4g6ZwMruYeHByBdaDC', 'FACULTY', '9876543221', 'Cabin 402', 190);

-- 5. CANTEENS
INSERT INTO canteens (id, campus_id, name, code, location_details, opening_time, closing_time, current_queue_count, avg_prep_time_mins, sustainability_score) VALUES
('cnt_main', 'cmp_main', 'D-Block Canteen', 'CANTEEN-01', 'Ground Floor, D-Block, Anurag University', '07:30', '20:30', 4, 12, 88.50),
('cnt_foodcourt', 'cmp_main', 'Cafeteria', 'CANTEEN-02', '1st Floor, Main Building, Anurag University', '09:00', '22:00', 8, 15, 82.00);

-- 6. CANTEEN STAFF ASSIGNMENTS
INSERT INTO canteen_staff (id, canteen_id, user_id, shift) VALUES
('stf_assign1', 'cnt_main', 'usr_staff1', 'MORNING'),
('stf_assign2', 'cnt_main', 'usr_manager1', 'FULL_DAY');

-- 7. MENU CATEGORIES
INSERT INTO menu_categories (id, canteen_id, name, display_order) VALUES
('cat_bfast', 'cnt_main', 'Breakfast Specials', 1),
('cat_south', 'cnt_main', 'South Indian Delights', 2),
('cat_north', 'cnt_main', 'North Indian & Meals', 3),
('cat_chinese', 'cnt_main', 'Indo-Chinese & Fried Rice', 4),
('cat_snacks', 'cnt_main', 'Quick Snacks & Beverages', 5),
('cat_combos', 'cnt_main', 'Smart Student Combos', 6),
('cat_fc_fastfood', 'cnt_foodcourt', 'Burgers & Wraps', 1),
('cat_fc_pizza', 'cnt_foodcourt', 'Pizzas & Pastas', 2),
('cat_fc_drinks', 'cnt_foodcourt', 'Coolers & Mocktails', 3);

-- 8. MENU ITEMS (24+ items across 3 canteens)
INSERT INTO menu_items (id, canteen_id, category_id, name, description, price, image_url, is_veg, calories, prep_time_mins, rating, rating_count, availability_status, available_quantity, is_popular) VALUES
-- Canteen 1: Central Canteen
('itm_dosa', 'cnt_main', 'cat_south', 'Masala Dosa', 'Crispy rice crepes stuffed with spiced potato filling, served with fresh coconut chutney and sambar.', 55.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500', 1, 320, 10, 4.8, 142, 'AVAILABLE', 45, 1),
('itm_idli', 'cnt_main', 'cat_south', 'Steamed Idli Sambar (3 Pcs)', 'Fluffy steamed rice cakes accompanied by traditional lentil stew and peanut chutney.', 40.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500', 1, 210, 5, 4.6, 98, 'AVAILABLE', 60, 1),
('itm_vada', 'cnt_main', 'cat_south', 'Medu Vada (2 Pcs)', 'Golden crispy lentil donuts served hot with freshly ground mint coconut chutney.', 35.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500', 1, 280, 5, 4.5, 76, 'LOW_STOCK', 8, 0),
('itm_poha', 'cnt_main', 'cat_bfast', 'Maharashtrian Kanda Poha', 'Tempered flattened rice cooked with onions, mustard seeds, curry leaves, and crunchy peanuts.', 30.00, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500', 1, 250, 6, 4.4, 52, 'AVAILABLE', 30, 0),
('itm_samosa', 'cnt_main', 'cat_snacks', 'Samosa Chat & Chole', '2 Crispy spiced potato samosas topped with spicy chickpea curry and sweet tamarind sauce.', 45.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500', 1, 350, 8, 4.7, 210, 'AVAILABLE', 50, 1),
('itm_thali', 'cnt_main', 'cat_north', 'Executive North Indian Thali', 'Paneer butter masala, Dal makhani, 2 Butter rotis, Jeera rice, Salad, and Gulab jamun.', 110.00, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500', 1, 650, 15, 4.9, 310, 'AVAILABLE', 25, 1),
('itm_friedrice', 'cnt_main', 'cat_chinese', 'Veg Schezwan Fried Rice', 'Wok-tossed basmati rice with crunchy vegetables in hot garlic Schezwan chili paste.', 75.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500', 1, 480, 12, 4.6, 185, 'AVAILABLE', 35, 1),
('itm_noodle', 'cnt_main', 'cat_chinese', 'Hakka Veg Noodles', 'Stir-fried noodles with bell peppers, cabbage, spring onions, and oriental sauces.', 70.00, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500', 1, 420, 12, 4.5, 120, 'AVAILABLE', 20, 0),
('itm_biryani', 'cnt_main', 'cat_north', 'Hyderabadi Paneer Dum Biryani', 'Aromatic long-grain basmati rice layered with marinated paneer, herbs, and saffron.', 120.00, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500', 1, 580, 18, 4.9, 412, 'AVAILABLE', 40, 1),
('itm_chai', 'cnt_main', 'cat_snacks', 'Special Masala Tea / Cutting Chai', 'Freshly brewed ginger and cardamom milk tea.', 15.00, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500', 1, 90, 3, 4.9, 530, 'AVAILABLE', 150, 1),
('itm_combo1', 'cnt_main', 'cat_combos', 'Student Saver Combo (Rice + Paneer + Cold Drink)', 'Hearty portion of Jeera Rice with Paneer Curry and a 250ml beverage.', 95.00, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500', 1, 520, 12, 4.8, 160, 'AVAILABLE', 30, 1),
('itm_chole_bhature', 'cnt_main', 'cat_north', 'Amritsari Chole Bhature (2 Pcs)', 'Puffed golden bhature served with rich tangy chickpea curry and pickle.', 85.00, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500', 1, 540, 12, 4.7, 134, 'AVAILABLE', 25, 1),


-- Canteen 2: Cafeteria
('itm_fc_burger', 'cnt_foodcourt', 'cat_fc_fastfood', 'Crispy Veggie Supreme Burger', 'Herbed potato-corn patty with crunchy lettuce, sliced tomatoes, and creamy mayo in sesame bun.', 65.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', 1, 410, 8, 4.7, 180, 'AVAILABLE', 40, 1),
('itm_fc_wrap', 'cnt_foodcourt', 'cat_fc_fastfood', 'Paneer Tikka Roll / Wrap', 'Tandoori-spiced cottage cheese cubes rolled in soft flatbread with mint mayo and pickled onions.', 80.00, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500', 1, 380, 10, 4.8, 145, 'AVAILABLE', 35, 1),
('itm_fc_pizza', 'cnt_foodcourt', 'cat_fc_pizza', 'Margherita Personal Pizza (7-inch)', 'Stone-crust base topped with San Marzano tomato puree, mozzarella cheese, and fresh basil.', 130.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500', 1, 590, 15, 4.6, 95, 'AVAILABLE', 20, 0),
('itm_fc_pasta', 'cnt_foodcourt', 'cat_fc_pizza', 'Penne Alfredo White Sauce Pasta', 'Italian durum wheat penne tossed in rich parmesan garlic cream sauce with broccoli & mushrooms.', 115.00, 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?w=500', 1, 520, 14, 4.5, 78, 'AVAILABLE', 25, 0),
('itm_fc_fries', 'cnt_foodcourt', 'cat_fc_fastfood', 'Peri-Peri French Fries', 'Crispy golden potato fries generously dusted with fiery African peri-peri seasoning.', 50.00, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500', 1, 310, 5, 4.8, 220, 'AVAILABLE', 50, 1),
('itm_fc_mojito', 'cnt_foodcourt', 'cat_fc_drinks', 'Virgin Fresh Mint Mojito', 'Sparkling cooler with muddled fresh garden mint, lime juice, and cane sugar.', 45.00, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', 1, 120, 3, 4.7, 110, 'AVAILABLE', 60, 0);

-- 9. SUPPLIERS
INSERT INTO suppliers (id, canteen_id, name, contact_person, phone, email, address) VALUES
('sup_01', 'cnt_main', 'GreenField Fresh Produce Co.', 'Anand Kumar', '9848012345', 'supply@greenfield.com', 'Kothapet Wholesale Market, Hyderabad'),
('sup_02', 'cnt_main', 'Dairy Best Ltd.', 'Venkatesh Rao', '9848054321', 'sales@dairybest.com', 'Dairy Circle, Hyderabad'),
('sup_03', 'cnt_foodcourt', 'BakeWell Wholesale Bakers', 'Girish Gupta', '9848099887', 'orders@bakewell.com', 'Industrial Area, Phase 2, Hyderabad');

-- 10. INVENTORY
INSERT INTO inventory (id, canteen_id, supplier_id, ingredient_name, unit, current_stock, min_stock_threshold, max_stock_capacity, cost_per_unit, batch_number, expiry_date) VALUES
('inv_01', 'cnt_main', 'sup_01', 'Basmati Rice', 'kg', 45.00, 15.00, 150.00, 70.00, 'BATCH-RICE-902', '2027-01-01'),
('inv_02', 'cnt_main', 'sup_01', 'Fresh Tomatoes', 'kg', 6.50, 10.00, 50.00, 35.00, 'BATCH-TOM-11', '2026-10-10'),
('inv_03', 'cnt_main', 'sup_02', 'Fresh Cottage Cheese (Paneer)', 'kg', 12.00, 5.00, 30.00, 240.00, 'BATCH-PAN-44', '2026-10-08'),
('inv_04', 'cnt_main', 'sup_02', 'Whole Milk', 'liters', 35.00, 10.00, 80.00, 55.00, 'BATCH-MLK-09', '2026-10-06'),
('inv_05', 'cnt_main', 'sup_01', 'Refined Cooking Oil', 'liters', 28.00, 10.00, 100.00, 120.00, 'BATCH-OIL-88', '2026-12-31'),
('inv_06', 'cnt_foodcourt', 'sup_03', 'Burger Buns & Pizza Bases', 'packets', 18.00, 20.00, 100.00, 40.00, 'BATCH-BN-102', '2026-10-09'),
('inv_07', 'cnt_foodcourt', 'sup_02', 'Mozzarella Cheese Blocks', 'kg', 8.00, 5.00, 25.00, 320.00, 'BATCH-MOZ-33', '2026-10-15'),
('inv_10', 'cnt_main', 'sup_01', 'Potatoes & Onions', 'kg', 55.00, 20.00, 120.00, 28.00, 'BATCH-VEG-99', '2026-10-25');

-- 11. PICKUP SLOTS
INSERT INTO pickup_slots (id, canteen_id, slot_time, max_capacity, current_booked, is_active) VALUES
('slot_1', 'cnt_main', '12:30 PM - 12:40 PM', 30, 12, 1),
('slot_2', 'cnt_main', '12:40 PM - 12:50 PM', 30, 25, 1),
('slot_3', 'cnt_main', '12:50 PM - 01:00 PM', 30, 18, 1),
('slot_4', 'cnt_main', '01:00 PM - 01:10 PM', 30, 8, 1),
('slot_5', 'cnt_main', '01:10 PM - 01:20 PM', 30, 5, 1),
('slot_fc_1', 'cnt_foodcourt', '01:00 PM - 01:15 PM', 25, 14, 1),
('slot_fc_2', 'cnt_foodcourt', '01:15 PM - 01:30 PM', 25, 10, 1);

-- 12. COUPONS
INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount) VALUES
('cpn_welcome', 'WELCOME20', 'Get 20% OFF on your first food order at CanteenX', 'PERCENTAGE', 20.00, 50.00, 40.00),
('cpn_student', 'STUDENT50', 'Flat Rs. 50 discount on orders above Rs. 200', 'FLAT', 50.00, 200.00, 50.00),
('cpn_saver', 'SAVER10', '10% discount on executive thalis and combo meals', 'PERCENTAGE', 10.00, 80.00, 25.00),
('cpn_fest', 'FESTIVE15', 'Special 15% discount during Campus Tech Fest week', 'PERCENTAGE', 15.00, 100.00, 50.00);

-- 13. DEMO ORDERS & HISTORICAL ORDERS (For training & realistic analytics)
INSERT INTO orders (id, order_number, user_id, canteen_id, order_type, order_status, payment_status, total_amount, discount_amount, final_amount, token_number, pickup_slot_id, est_prep_mins, created_at) VALUES
('ord_1001', 'CX-1001', 'usr_student1', 'cnt_main', 'PICKUP', 'COMPLETED', 'PAID', 110.00, 20.00, 90.00, 24, 'slot_1', 10, '2026-10-01 12:35:00'),
('ord_1002', 'CX-1002', 'usr_faculty1', 'cnt_main', 'CABIN_DELIVERY', 'COMPLETED', 'PAID', 135.00, 0.00, 135.00, 25, 'slot_2', 15, '2026-10-02 13:10:00'),
('ord_1003', 'CX-1003', 'usr_student2', 'cnt_main', 'PICKUP', 'COMPLETED', 'PAID', 95.00, 0.00, 95.00, 26, 'slot_3', 12, '2026-10-03 12:45:00'),
('ord_1004', 'CX-1004', 'usr_student1', 'cnt_foodcourt', 'PICKUP', 'COMPLETED', 'PAID', 115.00, 10.00, 105.00, 27, 'slot_fc_1', 8, '2026-10-03 13:20:00'),
('ord_1005', 'CX-1005', 'usr_faculty2', 'cnt_coffee', 'PICKUP', 'COMPLETED', 'PAID', 85.00, 0.00, 85.00, 28, 'slot_cf_1', 5, '2026-10-04 10:40:00'),
('ord_1006', 'CX-1006', 'usr_student1', 'cnt_main', 'PICKUP', 'READY', 'PAID', 120.00, 0.00, 120.00, 29, 'slot_2', 12, '2026-10-04 12:40:00'),
('ord_1007', 'CX-1007', 'usr_faculty1', 'cnt_main', 'CABIN_DELIVERY', 'PREPARING', 'PAID', 150.00, 0.00, 150.00, 30, 'slot_3', 15, '2026-10-04 12:55:00'),
('ord_1008', 'CX-1008', 'usr_student2', 'cnt_main', 'PICKUP', 'PLACED', 'PAID', 75.00, 0.00, 75.00, 31, 'slot_4', 10, '2026-10-04 13:05:00');

-- 14. ORDER ITEMS
INSERT INTO order_items (id, order_id, menu_item_id, item_name, quantity, unit_price, total_price) VALUES
('oi_1', 'ord_1001', 'itm_dosa', 'Masala Dosa', 2, 55.00, 110.00),
('oi_2', 'ord_1002', 'itm_thali', 'Executive North Indian Thali', 1, 110.00, 110.00),
('oi_3', 'ord_1002', 'itm_chai', 'Special Masala Tea / Cutting Chai', 2, 12.50, 25.00),
('oi_4', 'ord_1003', 'itm_combo1', 'Student Saver Combo (Rice + Paneer + Cold Drink)', 1, 95.00, 95.00),
('oi_5', 'ord_1004', 'itm_fc_burger', 'Crispy Veggie Supreme Burger', 1, 65.00, 65.00),
('oi_6', 'ord_1004', 'itm_fc_fries', 'Peri-Peri French Fries', 1, 50.00, 50.00),
('oi_7', 'ord_1005', 'itm_cappuccino', 'Hazelnut Cappuccino', 1, 65.00, 65.00),
('oi_8', 'ord_1005', 'itm_coffee', 'South Indian Filter Coffee', 1, 20.00, 20.00),
('oi_9', 'ord_1006', 'itm_biryani', 'Hyderabadi Paneer Dum Biryani', 1, 120.00, 120.00),
('oi_10', 'ord_1007', 'itm_thali', 'Executive North Indian Thali', 1, 110.00, 110.00),
('oi_11', 'ord_1007', 'itm_idli', 'Steamed Idli Sambar (3 Pcs)', 1, 40.00, 40.00),
('oi_12', 'ord_1008', 'itm_friedrice', 'Veg Schezwan Fried Rice', 1, 75.00, 75.00);

-- 15. ORDER STATUS HISTORY
INSERT INTO order_status_history (id, order_id, status, remarks) VALUES
('osh_1', 'ord_1001', 'PLACED', 'Order placed successfully by student.'),
('osh_2', 'ord_1001', 'ACCEPTED', 'Accepted by kitchen staff.'),
('osh_3', 'ord_1001', 'READY', 'Order ready for token pickup.'),
('osh_4', 'ord_1001', 'COMPLETED', 'QR scanned and handed over at counter.'),
('osh_5', 'ord_1002', 'PLACED', 'Faculty cabin order placed for CSE Block A Cabin 204.'),
('osh_6', 'ord_1002', 'ACCEPTED', 'Kitchen accepted scheduled delivery.'),
('osh_7', 'ord_1002', 'COMPLETED', 'Delivered to Dr. Sharma in Cabin 204.'),
('osh_8', 'ord_1006', 'READY', 'Freshly packed, ready at pickup counter.'),
('osh_9', 'ord_1007', 'PREPARING', 'Executive Thali cooking in kitchen.'),
('osh_10', 'ord_1008', 'PLACED', 'Waiting for kitchen staff confirmation.');

-- 16. PAYMENTS
INSERT INTO payments (id, order_id, transaction_id, razorpay_order_id, razorpay_payment_id, amount, status) VALUES
('pay_1001', 'ord_1001', 'TXN_9921001', 'order_rzp_1001', 'pay_rzp_1001', 90.00, 'SUCCESS'),
('pay_1002', 'ord_1002', 'TXN_9921002', 'order_rzp_1002', 'pay_rzp_1002', 135.00, 'SUCCESS'),
('pay_1003', 'ord_1003', 'TXN_9921003', 'order_rzp_1003', 'pay_rzp_1003', 95.00, 'SUCCESS'),
('pay_1004', 'ord_1004', 'TXN_9921004', 'order_rzp_1004', 'pay_rzp_1004', 105.00, 'SUCCESS'),
('pay_1005', 'ord_1005', 'TXN_9921005', 'order_rzp_1005', 'pay_rzp_1005', 85.00, 'SUCCESS'),
('pay_1006', 'ord_1006', 'TXN_9921006', 'order_rzp_1006', 'pay_rzp_1006', 120.00, 'SUCCESS'),
('pay_1007', 'ord_1007', 'TXN_9921007', 'order_rzp_1007', 'pay_rzp_1007', 150.00, 'SUCCESS'),
('pay_1008', 'ord_1008', 'TXN_9921008', 'order_rzp_1008', 'pay_rzp_1008', 75.00, 'SUCCESS');

-- 17. QR TOKENS
INSERT INTO qr_tokens (id, order_id, token_code, qr_payload, is_scanned) VALUES
('qr_1001', 'ord_1001', 'CX-QR-1001', '{"orderId":"ord_1001","token":24,"user":"student@anurag.edu"}', 1),
('qr_1002', 'ord_1002', 'CX-QR-1002', '{"orderId":"ord_1002","token":25,"user":"faculty@anurag.edu"}', 1),
('qr_1003', 'ord_1003', 'CX-QR-1003', '{"orderId":"ord_1003","token":26,"user":"ananya@anurag.edu"}', 1),
('qr_1006', 'ord_1006', 'CX-QR-1006', '{"orderId":"ord_1006","token":29,"user":"student@anurag.edu"}', 0),
('qr_1007', 'ord_1007', 'CX-QR-1007', '{"orderId":"ord_1007","token":30,"user":"faculty@anurag.edu"}', 0),
('qr_1008', 'ord_1008', 'CX-QR-1008', '{"orderId":"ord_1008","token":31,"user":"ananya@anurag.edu"}', 0);

-- 18. REVIEWS
INSERT INTO reviews (id, order_id, user_id, canteen_id, menu_item_id, rating, comment, created_at) VALUES
('rev_01', 'ord_1001', 'usr_student1', 'cnt_main', 'itm_dosa', 5, 'Best Masala Dosa on campus! Crispy and fresh coconut chutney was delightful.', '2026-10-01 13:00:00'),
('rev_02', 'ord_1002', 'usr_faculty1', 'cnt_main', 'itm_thali', 5, 'Delivered right on time to my cabin before 1:15 PM class. Hot food and delicious paneer.', '2026-10-02 13:30:00'),
('rev_03', 'ord_1003', 'usr_student2', 'cnt_main', 'itm_combo1', 4, 'Very affordable combo for engineering students. Jeera rice portion was generous.', '2026-10-03 13:00:00'),
('rev_04', 'ord_1004', 'usr_student1', 'cnt_foodcourt', 'itm_fc_burger', 5, 'Crispy patty and peri peri fries combo hit the spot during lunch break.', '2026-10-03 13:40:00'),
('rev_05', 'ord_1005', 'usr_faculty2', 'cnt_coffee', 'itm_cappuccino', 5, 'Excellent roast quality. Best place for faculty morning coffee discussions.', '2026-10-04 11:00:00');

-- 19. COMPLAINTS
INSERT INTO complaints (id, ticket_number, user_id, canteen_id, order_id, category, subject, description, status, created_at) VALUES
('cmp_01', 'TCK-2026-01', 'usr_student1', 'cnt_main', 'ord_1001', 'WAITING_TIME', 'Pickup Delay during 12:45 Peak', 'Order token was called 7 minutes after the estimated waiting time. Counter staff were overwhelmed.', 'RESOLVED', '2026-10-01 13:15:00'),
('cmp_02', 'TCK-2026-02', 'usr_student2', 'cnt_main', 'ord_1003', 'FOOD_QUALITY', 'Sambar was lukewarm', 'The sambar served with the midday thali was slightly cold.', 'IN_REVIEW', '2026-10-03 13:10:00'),
('cmp_03', 'TCK-2026-03', 'usr_faculty1', 'cnt_foodcourt', NULL, 'SERVICE_ISSUE', 'Need dedicated cabin delivery runner during exams', 'During mid-semester exam week, faculty cabin deliveries require dedicated staff runner.', 'OPEN', '2026-10-04 09:30:00');

-- 20. COMPLAINT RESPONSES
INSERT INTO complaint_responses (id, complaint_id, responder_id, message, created_at) VALUES
('cr_01', 'cmp_01', 'usr_manager1', 'We have added a second verification counter during 12:30-1:30 PM peak to prevent future bottleneck.', '2026-10-01 15:30:00'),
('cr_02', 'cmp_02', 'usr_staff1', 'Thank you for reporting. Chef has recalibrated the hot-holding temperature vessels.', '2026-10-03 14:00:00');

-- 21. FOOD WASTE MANAGEMENT
INSERT INTO food_waste (id, canteen_id, menu_item_id, prepared_quantity, sold_quantity, wasted_quantity, waste_cost, waste_reason, recorded_by_user_id, waste_date) VALUES
('wst_01', 'cnt_main', 'itm_dosa', 50, 46, 4, 120.00, 'OVERSTOCK', 'usr_staff1', '2026-10-01'),
('wst_02', 'cnt_main', 'itm_poha', 40, 32, 8, 160.00, 'LOW_DEMAND', 'usr_staff1', '2026-10-02'),
('wst_03', 'cnt_main', 'itm_samosa', 80, 75, 5, 90.00, 'LOW_DEMAND', 'usr_staff1', '2026-10-03'),
('wst_04', 'cnt_foodcourt', 'itm_fc_burger', 30, 28, 2, 70.00, 'PREPARATION_ERROR', 'usr_staff1', '2026-10-03');

-- 22. DEMAND & QUEUE PREDICTIONS
INSERT INTO demand_predictions (id, canteen_id, menu_item_id, target_date, target_hour, predicted_demand, recommended_prep, influencing_factors) VALUES
('dp_01', 'cnt_main', 'itm_dosa', CURRENT_DATE, 13, 85, 90, '["Lunch Peak", "Friday Pattern", "Historical Sales +12%"]'),
('dp_02', 'cnt_main', 'itm_thali', CURRENT_DATE, 13, 110, 115, '["Executive Lunch Surge", "High Popularity Rating"]'),
('dp_03', 'cnt_main', 'itm_biryani', CURRENT_DATE, 13, 95, 100, '["Pre-orders High", "Student Saver Combo"]');

INSERT INTO queue_predictions (id, canteen_id, current_orders, staff_on_duty, predicted_wait_mins) VALUES
('qp_01', 'cnt_main', 6, 4, 8),
('qp_02', 'cnt_foodcourt', 8, 4, 12);

-- 23. ANNOUNCEMENTS
INSERT INTO announcements (id, college_id, title, content, target_role) VALUES
('anc_1', 'clg_anurag', 'D-Block Canteen & Cafeteria Now Accepting Digital Orders', 'Place your orders from D-Block Canteen and Cafeteria using CanteenX for instant paperless pickup!', 'ALL'),
('anc_2', 'clg_anurag', 'Faculty Pre-order System Live', 'Faculty members can now pre-order meals for cabin delivery up to 24 hours in advance.', 'FACULTY'),
('anc_3', 'clg_anurag', 'Digital Token Verification Active', 'Please show your QR Code directly at the pickup counters to receive your orders instantly.', 'STUDENT');

-- 24. CAMPUS EVENTS
INSERT INTO events (id, college_id, name, description, event_type, start_date, end_date, is_event_mode_active) VALUES
('evt_01', 'clg_anurag', 'Anurag University Tech Fest 2026', 'Annual National Tech Symposium with extended canteen operating hours and fest food stalls.', 'TECH_FEST', '2026-10-15', '2026-10-17', 1),
('evt_02', 'clg_anurag', 'Inter-Collegiate Sports Meet 2026', 'Athletics and outdoor tournaments across campuses with sports energy meals & protein combos.', 'SPORTS_DAY', '2026-11-05', '2026-11-08', 0);
