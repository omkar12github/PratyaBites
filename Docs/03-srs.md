# Software Requirements Specification (SRS)

# PratyaBites

Version: 1.0

Prepared By: Omkar Dubey

---

# Document Information

| Item | Details |
|------|---------|
| Project | PratyaBites |
| Version | 1.0 |
| Document Type | Software Requirements Specification |
| Status | Draft |
| Last Updated | August 2026 |

---

# Table of Contents

1. Introduction
2. Purpose
3. Scope
4. Definitions
5. Product Overview
6. User Roles
7. Functional Requirements
8. Non-Functional Requirements
9. System Modules
10. Data Requirements
11. Business Rules
12. External Interfaces
13. Security Requirements
14. Performance Requirements
15. Technology Stack
16. Future Scope

---

# 1. Introduction

PratyaBites is a Pure Vegetarian Cloud Kitchen platform that enables customers to browse food items, place online orders, make payments, and track their orders.

The platform is designed for scalability and future expansion.

---

# 2. Purpose

The purpose of this document is to define all software requirements for the PratyaBites platform.

It serves as the reference document for developers, testers, designers, and future contributors.

---

# 3. Scope

The system shall provide:

- Customer registration
- User authentication
- Food browsing
- Search
- Shopping cart
- Checkout
- Online payment
- Order management
- Admin dashboard
- Customer dashboard

---

# 4. Definitions

Cloud Kitchen

A delivery-only restaurant without dine-in service.

Customer

A registered user who purchases food.

Administrator

The person responsible for managing the system.

Order

A purchase made by the customer.

Cart

Temporary storage of selected food items.

---

# 5. Product Overview

PratyaBites is a web-based application.

Users can

- Create accounts
- Browse food
- Add items to cart
- Place orders
- Make payments
- Track delivery

Administrators can

- Manage menu
- Manage categories
- Manage orders
- Manage users
- View reports

---

# 6. User Roles

## Customer

Permissions

- Register
- Login
- Logout
- Browse menu
- Search food
- Add to cart
- Checkout
- Make payment
- Track order
- View profile
- View order history

---

## Administrator

Permissions

- Dashboard
- Food Management
- Category Management
- User Management
- Order Management
- Coupon Management
- Reports
- Analytics

---

# 7. Functional Requirements

## Authentication Module

The system shall

- Register users
- Authenticate users
- Reset passwords
- Allow password changes
- Logout securely

---

## Food Module

The system shall

- Display food categories
- Display food items
- Display food details
- Search food
- Filter by category

---

## Cart Module

The system shall

- Add items
- Remove items
- Update quantity
- Calculate total
- Apply coupons

---

## Checkout Module

The system shall

- Select delivery address
- Choose payment method
- Display order summary
- Confirm order

---

## Order Module

The system shall

- Create orders
- Display order history
- Display order status

Order Status

- Pending
- Confirmed
- Preparing
- Ready
- Out for Delivery
- Delivered
- Cancelled

---

## Profile Module

The system shall

- Update profile
- Change password
- Manage addresses

---

## Admin Module

The administrator shall

- Add food
- Update food
- Delete food
- Manage categories
- Manage orders
- Manage users
- Manage coupons
- View reports

---

# 8. Non-Functional Requirements

## Performance

- Fast response time
- Responsive interface
- Efficient database queries

---

## Reliability

- Stable operation
- Error handling
- Data backup

---

## Security

- Password encryption
- Authentication
- Authorization
- HTTPS
- SQL Injection protection
- CSRF protection
- XSS protection

---

## Scalability

The system should support

- Thousands of users
- Multiple cloud kitchens
- Future mobile applications

---

## Availability

Target uptime:

99.9%

---

# 9. System Modules

Customer Module

↓

Authentication

↓

Food Management

↓

Cart

↓

Checkout

↓

Orders

↓

Payments

↓

Admin Dashboard

---

# 10. Data Requirements

The system shall maintain

Users

Categories

Foods

Orders

Order Items

Payments

Coupons

Reviews

Addresses

---

# 11. Business Rules

- Only registered users can place orders.
- Every order must contain at least one item.
- Food availability shall be checked before checkout.
- Cancelled orders cannot be delivered.
- Delivered orders cannot be modified.

---

# 12. External Interfaces

Payment Gateway

Future Integration

Google Maps

Email Service

SMS Service

Cloud Storage

---

# 13. Security Requirements

The system shall

- Encrypt passwords
- Validate user input
- Protect APIs
- Secure user sessions
- Prevent unauthorized access

---

# 14. Performance Requirements

Page Load

Less than 3 seconds

Search

Less than 1 second

Checkout

Less than 5 seconds

---

# 15. Technology Stack

Frontend

- React
- Next.js
- Tailwind CSS

Backend

- Python
- Django
- Django REST Framework

Database

- PostgreSQL

Authentication

- JWT

Version Control

- Git

Repository

- GitHub

---

# 16. Future Scope

Future versions may include

- Android Application
- iOS Application
- AI Food Recommendation
- Loyalty Program
- Wallet
- Referral Program
- Live Delivery Tracking
- Franchise Management
- Multiple Kitchen Support

---

# Conclusion

This Software Requirements Specification defines the functional and non-functional requirements for the PratyaBites platform. It serves as the primary reference document for development and testing throughout the project lifecycle.