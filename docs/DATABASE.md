# CanteenX Database Specification

## Overview
The CanteenX database schema is composed of 28 normalized tables designed to manage multi-tenant college environments, multi-canteen operations, real-time menus, order lifecycles, payments, ingredient inventories, food waste, AI forecasts, and platform audit logs.

## Table Summary

| Entity Table | Primary Key | Key Foreign Keys | Purpose |
|---|---|---|---|
| `colleges` | `id` (UUID) | - | Top-level college entity |
| `campuses` | `id` (UUID) | `college_id` | Physical campus sites |
| `departments` | `id` (UUID) | `college_id` | Academic & admin departments |
| `users` | `id` (UUID) | `college_id`, `department_id` | User identity & RBAC role |
| `canteens` | `id` (UUID) | `campus_id` | Canteen operational units |
| `canteen_staff` | `id` (UUID) | `canteen_id`, `user_id` | Staff assignment matrix |
| `menu_categories` | `id` (UUID) | `canteen_id` | Menu categorization |
| `menu_items` | `id` (UUID) | `canteen_id`, `category_id` | Menu items & live availability |
| `suppliers` | `id` (UUID) | `canteen_id` | Raw ingredient vendors |
| `inventory` | `id` (UUID) | `canteen_id`, `supplier_id` | Ingredient stock & thresholds |
| `inventory_transactions` | `id` (UUID) | `inventory_id`, `user_id` | Stock movement audit trail |
| `pickup_slots` | `id` (UUID) | `canteen_id` | Time slots & capacity limits |
| `orders` | `id` (UUID) | `user_id`, `canteen_id`, `pickup_slot_id` | Order transactions |
| `order_items` | `id` (UUID) | `order_id`, `menu_item_id` | Itemized order lines |
| `order_status_history` | `id` (UUID) | `order_id`, `changed_by_user_id` | Audit trail for order states |
| `payments` | `id` (UUID) | `order_id` | Razorpay transaction records |
| `qr_tokens` | `id` (UUID) | `order_id` | Digital token & QR validation |
| `reviews` | `id` (UUID) | `order_id`, `user_id`, `canteen_id` | Ratings & comments |
| `complaints` | `id` (UUID) | `user_id`, `canteen_id`, `order_id` | Ticket tracking |
| `notifications` | `id` (UUID) | `user_id` | User push/in-app alerts |
| `coupons` | `id` (UUID) | - | Promotional discount codes |
| `reward_transactions` | `id` (UUID) | `user_id` | Loyalty point logs |
| `food_waste` | `id` (UUID) | `canteen_id`, `menu_item_id` | Recorded food waste logs |
| `demand_predictions` | `id` (UUID) | `canteen_id`, `menu_item_id` | AI demand forecasts |
| `queue_predictions` | `id` (UUID) | `canteen_id` | AI queue wait time models |
| `announcements` | `id` (UUID) | `college_id` | Campus wide broadcasts |
| `events` | `id` (UUID) | `college_id` | Campus event mode setup |
| `audit_logs` | `id` (UUID) | `user_id` | System audit trail |
