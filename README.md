# STM Customer Management System

A comprehensive web application for managing journal subscriptions, customers, institutions, and HR operations. Built with Next.js, TypeScript, and Prisma.

## 🚀 Core Features

### 🏢 Institution & Customer Management
- **Institution Hub**: Unified view for libraries/universities with aggregated metrics across all affiliated members.
- **Bulk Operations**: Mass assignment of service executives to institution members.
- **Data Portability**: Bulk CSV Import/Export for Institutions, Customers, Journals, and Subscriptions.
- **Dynamic Assignments**: Multi-level executive tracking (Primary, Secondary, and Support roles).

### 👥 HR & Staff Management
- **Complete Portal**: Employee self-service for attendance, work reports, and leave management.
- **Recruitment Pipeline**: End-to-end management from job posting to onboard exams and interview logs.
- **Performance & Growth**: Grade tracking, promotion history, and automated productivity analysis.
- **Financial Details**: Automated salary slips and commission (10% agency) tracking.

### 🔐 Security & Auth
- **NextAuth v5**: Secure session management with HTTP-only cookies and RBAC.
- **Impersonation**: Super-admin capability to view the dashboard as any other user for troubleshooting.
- **Standardized Middleware**: Uniform route protection across all API segments.

## 🛠️ Tech Stack
- **Frontend**: Next.js 15, React, Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Routes, Prisma ORM v7
- **Database**: PostgreSQL
- **State/Data**: React Query, Zod Validation

## ⚙️ Setup & Development

### 1. Prerequisites
- Node.js 18+
- PostgreSQL instance

### 2. Installation
```bash
npm install
npx prisma generate
```

### 3. Environment Configuration
Create a `.env` file from the provided template. Essential keys:
- `DATABASE_URL`: Your Postgres connection string.
- `AUTH_SECRET`: Random string for session encryption.
- `NEXTAUTH_URL`: Your base application URL.

### 4. Running Locally
```bash
npm run dev # Access at http://localhost:3000
```

## 📊 Documentation
For more detailed information, please refer to:
- [CHANGELOG.md](./CHANGELOG.md): History of updates and fixed bugs.
- [DEPLOYMENT.md](./DEPLOYMENT.md): Production setup and troubleshooting.
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md): Developer guide for APIs and components.

---
**Proprietary - All rights reserved**
