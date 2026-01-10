# Quick Reference Guide

## 🔧 Getting Started
- **Development**: `npm run dev` (Access at http://localhost:3000)
- **Database GUI**: `npx prisma studio`

## 📧 Email Configuration (AWS SES)
The system uses AWS SES for production emails.
- **Requirements**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`.
- **Fallback**: If AWS keys are missing, the system falls back to SMTP (configured in `src/lib/mail.ts`).

## 📋 Common Operations

### 1. Employee Management
- **View All**: Dashboard → HR Management → Employees
- **Update**: PATCH `/api/hr/employees`
- **Fields**: Supports basic info, contact, statutory (PAN/Aadhar), banking, and growth (grades/promotions).

### 2. Authentication (NextAuth)
- **Sign In**:
```typescript
import { signIn } from 'next-auth/react';
await signIn('credentials', { email: '...', password: '...' });
```
- **Session**:
```typescript
const { data: session, status } = useSession();
```

### 3. API Protection
Always use `authorizedRoute` for protected endpoints:
```typescript
export const GET = authorizedRoute(['ADMIN', 'MANAGER'], async (req, user) => {
    // ... logic
});
```

## 🔐 Role Hierarchy
- **SUPER_ADMIN**: Full system control.
- **ADMIN**: Company-level administration.
- **MANAGER**: Team and department oversight.
- **SALES_EXECUTIVE**: Customer and subscription focus.
- **CUSTOMER**: Self-service portal access.

## 📁 Environment Variables (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
AUTH_SECRET="your-32-char-secret"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="your-legacy-secret"
```

---
*Refer to [DEPLOYMENT.md](./DEPLOYMENT.md) for production-specific configuration.*
