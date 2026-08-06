# Deployment Guide

# Project

PratyaBites

Version: 1.0

---

# Purpose

This document describes how the PratyaBites application will be deployed from the development environment to production.

---

# Deployment Architecture

Frontend

↓

Vercel

↓

Backend API (Render)

↓

PostgreSQL Database

---

# Technology

## Frontend

- Next.js
- React
- Tailwind CSS

Hosting

- Vercel

---

## Backend

- Django
- Django REST Framework

Hosting

- Render

---

## Database

PostgreSQL

Provider

- Neon
or
- Supabase

---

## Media Storage

Development

Local Storage

Production

Cloudinary

---

# Domain

Development

http://localhost:3000

Production

https://www.pratyabites.com

API

https://api.pratyabites.com

---

# Environment Variables

Frontend

NEXT_PUBLIC_API_URL

Backend

SECRET_KEY

DEBUG

DATABASE_URL

ALLOWED_HOSTS

JWT_SECRET

---

# Deployment Workflow

Developer

↓

GitHub

↓

Automatic Deployment

↓

Production Server

---

# CI/CD

Whenever code is pushed to GitHub:

1. GitHub stores the latest code.
2. Vercel deploys the frontend.
3. Render deploys the backend.
4. The latest version becomes available online.

---

# SSL

HTTPS will be enabled for all production domains.

---

# Backup Strategy

Database

Daily Backup

Images

Cloud Storage Backup

Source Code

GitHub Repository

---

# Monitoring

Future

- Uptime Monitoring
- Error Logging
- Performance Monitoring

---

# Rollback Strategy

If deployment fails:

- Roll back to the previous stable release.
- Investigate the issue.
- Fix and redeploy.

---

# Future Deployment

Future versions may include:

- Docker
- Nginx
- GitHub Actions
- Kubernetes
- AWS

---

# Conclusion

PratyaBites will use a modern cloud deployment architecture with Vercel for the frontend, Render for the backend, and PostgreSQL as the primary database.