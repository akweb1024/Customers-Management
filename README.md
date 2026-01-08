# STM Customer Management System

A comprehensive web application for managing journal subscriptions, customers, sales channels, and analytics.

## 🚀 Features

### Phase 1, 2, 3 & 4 - Currently Implemented
- ✅ **NextAuth Integration**: Secure authentication with NextAuth.js v5, session management, and role-based access control.
- ✅ **HR Management System**: Complete employee lifecycle management with profiles, attendance, performance reviews, and salary tracking.
- ✅ **Institution-Centric Architecture**: Unified dashboards for universities/libraries with bulk member assignment.
- ✅ **Advanced Data Hub**: Bulk CSV Import/Export for Institutions, Customers, Journals, and Subscriptions.
- ✅ **Dynamic Assignment Manager**: Multi-executive assignment tracking (Primary/Secondary/Support) for customers.
- ✅ **Subscription Lifecycle**: Request -> Approval -> Billing -> Activation with automated financials.
- ✅ **Automated Financials**: Invoice generation, payment tracking, and agency commission (10%) management.
- ✅ **Communication Engine**: Professional email automation for renewals, requests, and bulk broadcasts.
- ✅ **Analytics Suite**: Revenue trends, journal performance, and institutional activity dashboards.
- ✅ **Task Management**: Integrated CRM follow-up system with status tracking and resolution logs.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (React), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM v7
- **Authentication**: NextAuth.js v5 (Beta) with JWT strategy
- **Validation**: Zod schemas for type-safe validation
- **State Management**: React Query for server state
- **Styling**: Tailwind CSS with custom design system

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+

### Setup Steps

1. **Clone and navigate to the project**
   ```bash
   cd /home/itb-09/Desktop/architecture/stmCustomer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create a PostgreSQL database named 'stm_customer'
   createdb stm_customer
   ```

4. **Configure environment variables**
   ```bash
   # Copy the example env file
   cp .env.example .env
   
   # Edit .env and update DATABASE_URL with your PostgreSQL credentials
   # Format: postgresql://username:password@localhost:5432/stm_customer
   ```

5. **Generate Prisma client and push schema to database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000`

## 📊 Database Management

### Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database (development)
npm run prisma:push

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Create and apply migrations (production)
npx prisma migrate dev --name init
```

## 🔐 User Roles & Permissions

1. **CUSTOMER** - Manage own profile and subscriptions
2. **AGENCY** - Manage clients and agency subscriptions
3. **SALES_EXECUTIVE** - Manage assigned customers and create subscriptions
4. **MANAGER** - Oversee team performance and analytics
5. **FINANCE_ADMIN** - Manage invoices and payments
6. **SUPER_ADMIN** - Full system access

## 🎨 Design System

The application features a premium design system with:

- **Color Palette**: Primary (Blue), Success (Green), Warning (Yellow), Danger (Red)
- **Typography**: Inter font family
- **Components**: Reusable buttons, cards, forms, badges, tables
- **Animations**: Fade-in, slide-in, and subtle pulse effects
- **Responsive**: Mobile-first design approach

## 📁 Project Structure

```
stmCustomer/
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard pages
│   │   ├── login/        # Login page
│   │   ├── register/     # Registration page
│   │   ├── globals.css   # Global styles
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Landing page
│   ├── components/
│   │   ├── dashboard/    # Dashboard components
│   │   └── ui/           # Reusable UI components
│   ├── lib/
│   │   ├── auth.ts       # Authentication utilities
│   │   └── prisma.ts     # Prisma client
│   └── types/
│       └── index.ts      # TypeScript types
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static assets
├── .env.example          # Environment variables template
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Quality

- **TypeScript**: Strict mode enabled for type safety
- **ESLint**: Code linting and formatting
- **Prisma**: Type-safe database access

## 🌐 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/stm_customer?schema=public"

# NextAuth (Required!)
AUTH_SECRET="your-generated-secret-at-least-32-chars-long"
NEXTAUTH_SECRET="your-generated-secret-at-least-32-chars-long"
NEXTAUTH_URL="http://localhost:3000"

# Legacy JWT (for backward compatibility)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Push Notifications (Optional)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
```

## 📖 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Analytics & Reporting
- `GET /api/dashboard/stats` - Global overview metrics
- `GET /api/dashboard/revenue` - Financial performance time-series
- `GET /api/institutions/activity` - Institutional engagement tracking
- `GET /api/dashboard/data-hub` - Data integrity and count checks

### Data Portability
- `POST /api/imports/[type]` - Bulk CSV data ingestion
- `GET /api/exports/[type]` - Secured CSV data extraction

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
# Customers-Management
