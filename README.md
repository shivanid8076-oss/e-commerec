# 🔒 Secure Full-Stack Web Application

A production-grade secure web application built with **React.js**, **Node.js/Express**, and **PostgreSQL**.

## Security Features

| Feature | Implementation |
|---------|---------------|
| SQL Injection | Prisma ORM (parameterized queries) |
| XSS Protection | DOMPurify + xss library + Helmet CSP |
| Brute Force | express-rate-limit |
| CSRF | SameSite=Strict cookies + CORS |
| Password Security | bcrypt (12 rounds) |
| Secure Headers | Helmet.js |
| Token Security | HTTP-only, Secure, SameSite cookies |

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Setup Database
```bash
sudo -u postgres psql
CREATE USER secureapp WITH PASSWORD 'secureapp123';
CREATE DATABASE secure_app_db OWNER secureapp;
\q
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

### 3. Start Backend
```bash
cd server
npm install
npx prisma migrate dev --name init
npm run dev
```

### 4. Start Frontend
```bash
cd client
npm install
npm run dev
```

### 5. Open App
Navigate to `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/logout` | Logout | Yes |
| GET | `/api/auth/me` | Get current user | Yes |
| GET | `/api/users/profile` | Get user profile | Yes |
