# Deployment Guide

This document outlines the requirements and steps for deploying the STM Customer Management application to production.

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
Ensure the following variables are set in your production environment (e.g., Coolify, Vercel, Railway). **Do not share these or commit them to version control.**

| Variable | Description | Example/Format |
|----------|-------------|---------------|
| `DATABASE_URL` | Postgres Connection String | `postgresql://user:password@host:5432/dbname?sslmode=disable` |
| `AUTH_SECRET` | NextAuth encryption secret | Generate via `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Full URL of your application | `https://your-domain.com` |
| `AUTH_TRUST_HOST` | Required if behind a proxy | `true` |
| `JWT_SECRET` | Legacy token secret | Any long random string |
| `NEXT_PUBLIC_APP_URL` | Frontend public URL | `https://your-domain.com` |
| `RAZORPAY_KEY_ID` | Razorpay API Key | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret | `[SECRET]` |
| `AWS_ACCESS_KEY_ID` | AWS Credentials (SES) | `[ACCESS_KEY]` |
| `AWS_SECRET_ACCESS_KEY` | AWS Credentials (SES) | `[SECRET_KEY]` |
| `AWS_REGION` | AWS Data Center Region | `us-east-1` |

### 2. Database Configuration
- **Prisma Schema**: The application uses `url = env("DATABASE_URL")` in `prisma/schema.prisma`.
- **Migrations**: Run `npx prisma migrate deploy` during your build or release phase to apply schema changes to the production database.
- **Direct Access**: Use `npx prisma studio` locally with a temporary tunnel to view production data if necessary.

---

## 🚀 Deployment Steps

### Manual Deployment
1.  **Install Production Dependencies**:
    ```bash
    npm install --production=false # Standard install for build
    ```
2.  **Generate Prisma Client**:
    ```bash
    npx prisma generate
    ```
3.  **Build the Project**:
    ```bash
    npm run build
    ```
4.  **Start the Server**:
    ```bash
    npm start
    ```

### Containerized Deployment (Docker/Coolify)
- **Networking**: Ensure your application container and Postgres container are on the same internal network. If using Coolify, the `DATABASE_URL` should point to the container's internal service name (e.g., `postgres:5432`) rather than `localhost:5432`.
- **Port**: The application listens on port **3000** by default.

---

## 🛠️ Troubleshooting Common Issues

### 500 Error After Login
- **Auth Secrets**: Ensure `AUTH_SECRET` is set and at least 32 characters long.
- **URL Mismatch**: Ensure `NEXTAUTH_URL` exactly matches the domain in your browser.
- **Trust Host**: Add `AUTH_TRUST_HOST=true` if using Nginx/Coolify as a proxy.

### Database Connection Refused
- **Internal Host**: If your database host looks like `c0wssw...`, it is an internal Docker host. Ensure your application is running inside the same environment.
- **SSL**: If your provider requires SSL, add `?sslmode=require` to your `DATABASE_URL`.

### Authentication Redirect Loops
- Clear browser cookies. Changing `AUTH_SECRET` will invalidate existing cookies and might cause decryption errors (`JWTSessionError: no matching decryption secret`). Logout and back in.
