# API Documentation

# Project

PratyaBites

Version: 1.0

Architecture: REST API

Backend: Django REST Framework

---

# Base URL

Development

http://localhost:8000/api/

Production

https://api.pratyabites.com/api/

---

# Authentication

JWT Authentication

Authorization

Bearer <access_token>

---

# API Modules

- Authentication
- Categories
- Foods
- Cart
- Orders
- Payments
- Reviews
- Favorites
- Profile
- Notifications

---

# Authentication APIs

## Register

POST

/api/auth/register/

### Request

{
    "first_name": "Omkar",
    "last_name": "Dubey",
    "email": "example@gmail.com",
    "phone": "9876543210",
    "password": "********"
}

### Response

201 Created

---

## Login

POST

/api/auth/login/

### Request

{
    "email": "example@gmail.com",
    "password": "********"
}

### Response

{
    "access":"JWT_TOKEN",
    "refresh":"JWT_REFRESH"
}

---

## Logout

POST

/api/auth/logout/

---

## Refresh Token

POST

/api/auth/token/refresh/

---

# Categories

## Get Categories

GET

/api/categories/

---

## Category Details

GET

/api/categories/{id}/

---

# Foods

## Get Foods

GET

/api/foods/

---

## Food Details

GET

/api/foods/{id}/

---

## Search Food

GET

/api/foods/?search=pizza

---

## Filter Category

GET

/api/foods/?category=pizza

---

## Specials

GET

/api/foods/specials/

---

## Best Sellers

GET

/api/foods/bestsellers/

---

# Cart

## View Cart

GET

/api/cart/

---

## Add Item

POST

/api/cart/add/

---

## Update Quantity

PATCH

/api/cart/update/

---

## Remove Item

DELETE

/api/cart/remove/{id}/

---

## Clear Cart

DELETE

/api/cart/clear/

---

# Orders

## Create Order

POST

/api/orders/

---

## My Orders

GET

/api/orders/

---

## Order Details

GET

/api/orders/{id}/

---

## Cancel Order

PATCH

/api/orders/{id}/cancel/

---

# Payments

## Create Payment

POST

/api/payments/

---

## Verify Payment

POST

/api/payments/verify/

---

# Profile

## My Profile

GET

/api/profile/

---

## Update Profile

PUT

/api/profile/

---

## Change Password

PATCH

/api/profile/change-password/

---

# Address

GET

/api/address/

POST

/api/address/

PUT

/api/address/{id}/

DELETE

/api/address/{id}/

---

# Reviews

GET

/api/reviews/

POST

/api/reviews/

DELETE

/api/reviews/{id}/

---

# Favorites

GET

/api/favorites/

POST

/api/favorites/

DELETE

/api/favorites/{id}/

---

# Notifications

GET

/api/notifications/

PATCH

/api/notifications/read/

---

# Admin APIs

Manage Categories

Manage Foods

Manage Orders

Manage Users

Manage Coupons

Reports

Dashboard

---

# HTTP Status Codes

200 OK

201 Created

204 Deleted

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

500 Internal Server Error

---

# API Version

Current Version

v1

Future

v2
