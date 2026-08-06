# Database Design

# Project

PratyaBites

Version: 1.0

Database: PostgreSQL

---

# Introduction

This document defines the database schema for the PratyaBites platform.

The database is designed to be scalable, secure, and maintainable.

---

# Database Tables

1. Users
2. Categories
3. Foods
4. Food Images
5. Addresses
6. Cart
7. Cart Items
8. Orders
9. Order Items
10. Payments
11. Coupons
12. Reviews
13. Favorites
14. Notifications

---

# Entity Relationship

Customer

↓

Cart

↓

Cart Items

↓

Order

↓

Order Items

↓

Payment

---

# Users Table

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| first_name | VARCHAR(100) | First Name |
| last_name | VARCHAR(100) | Last Name |
| email | VARCHAR(255) | Unique Email |
| phone | VARCHAR(20) | Mobile Number |
| password | TEXT | Hashed Password |
| profile_image | TEXT | Image URL |
| is_active | BOOLEAN | Active Status |
| is_staff | BOOLEAN | Admin User |
| created_at | TIMESTAMP | Created Date |
| updated_at | TIMESTAMP | Updated Date |

---

# Categories Table

| Column | Type |
|---------|------|
| id | UUID |
| name | VARCHAR(100) |
| image | TEXT |
| description | TEXT |
| is_active | BOOLEAN |

---

# Foods Table

| Column | Type |
|---------|------|
| id | UUID |
| category_id | FK |
| name | VARCHAR |
| slug | VARCHAR |
| description | TEXT |
| price | DECIMAL |
| discount_price | DECIMAL |
| image | TEXT |
| is_special | BOOLEAN |
| is_best_seller | BOOLEAN |
| is_available | BOOLEAN |
| calories | INTEGER |
| preparation_time | INTEGER |
| created_at | TIMESTAMP |

---

# Food Images Table

| Column | Type |
|---------|------|
| id | UUID |
| food_id | FK |
| image | TEXT |

---

# Address Table

| Column | Type |
|---------|------|
| id | UUID |
| user_id | FK |
| full_name | VARCHAR |
| phone | VARCHAR |
| house_no | VARCHAR |
| street | VARCHAR |
| city | VARCHAR |
| state | VARCHAR |
| pincode | VARCHAR |
| landmark | VARCHAR |
| is_default | BOOLEAN |

---

# Cart Table

| Column | Type |
|---------|------|
| id | UUID |
| user_id | FK |
| total_price | DECIMAL |

---

# Cart Items

| Column | Type |
|---------|------|
| id | UUID |
| cart_id | FK |
| food_id | FK |
| quantity | INTEGER |
| price | DECIMAL |

---

# Orders

| Column | Type |
|---------|------|
| id | UUID |
| user_id | FK |
| address_id | FK |
| total_amount | DECIMAL |
| payment_method | VARCHAR |
| order_status | VARCHAR |
| created_at | TIMESTAMP |

---

# Order Items

| Column | Type |
|---------|------|
| id | UUID |
| order_id | FK |
| food_id | FK |
| quantity | INTEGER |
| price | DECIMAL |

---

# Payments

| Column | Type |
|---------|------|
| id | UUID |
| order_id | FK |
| payment_id | VARCHAR |
| payment_method | VARCHAR |
| amount | DECIMAL |
| payment_status | VARCHAR |

---

# Coupons

| Column | Type |
|---------|------|
| id | UUID |
| code | VARCHAR |
| discount | INTEGER |
| expiry_date | DATE |
| is_active | BOOLEAN |

---

# Reviews

| Column | Type |
|---------|------|
| id | UUID |
| user_id | FK |
| food_id | FK |
| rating | INTEGER |
| review | TEXT |
| created_at | TIMESTAMP |

---

# Favorites

| Column | Type |
|---------|------|
| id | UUID |
| user_id | FK |
| food_id | FK |

---

# Notifications

| Column | Type |
|---------|------|
| id | UUID |
| user_id | FK |
| title | VARCHAR |
| message | TEXT |
| is_read | BOOLEAN |
| created_at | TIMESTAMP |

---

# Relationships

User

↓

Address

↓

Order

↓

Payment

↓

Order Items

↓

Food

↓

Category

---

# Indexes

Create indexes on

- email
- phone
- slug
- category
- order_status

---

# Future Tables

Wishlist

Inventory

Kitchen

Delivery Partner

Loyalty Points

Wallet

Referral

Coupons History

Analytics

Branches

---

# Conclusion

The database is designed to support future expansion while maintaining performance and scalability.