# Quick Reference Guide - STM Customer Management

## 🚀 Getting Started

### Start Development Server
```bash
npm run dev
```
Access at: http://localhost:3000

### Default Login Credentials
Check your database for existing users or create one through the registration page.

## 📋 Common Operations

### 1. Employee Management

#### View All Employees
- Navigate to: **Dashboard → HR Management → Employees**
- Requires role: `SUPER_ADMIN`, `ADMIN`, or `MANAGER`

#### View Employee Profile
- Click on any employee in the list
- API: `GET /api/hr/employees/{id}`

#### Update Employee Profile
- Click "Edit" on employee profile
- All fields are optional
- Empty fields will be saved as `null`
- API: `PATCH /api/hr/employees`

**Supported Fields:**
- Basic Info: designation, department, dateOfJoining, baseSalary
- Contact: personalEmail, officialEmail, phoneNumber, officePhone, emergencyContact
- Statutory: panNumber, aadharNumber, uanNumber, pfNumber, esicNumber
- Banking: bankName, accountNumber, ifscCode
- Address: address, permanentAddress
- Personal: dateOfBirth, bloodGroup, profilePicture
- Documents: offerLetterUrl, contractUrl
- Experience: totalExperienceYears, totalExperienceMonths, qualification
- Growth: grade, lastPromotionDate, lastIncrementDate, nextReviewDate

### 2. Authentication

#### Login
```typescript
import { signIn } from 'next-auth/react';

const result = await signIn('credentials', {
  email: 'user@example.com',
  password: 'password',
  redirect: false,
});
```

#### Logout
```typescript
import { signOut } from 'next-auth/react';

await signOut({ callbackUrl: '/login' });
```

#### Get Current Session
```typescript
import { useSession } from 'next-auth/react';

const { data: session, status } = useSession();
// status: 'loading' | 'authenticated' | 'unauthenticated'
```

### 3. API Route Protection

#### Using authorizedRoute
```typescript
import { authorizedRoute } from '@/lib/middleware-auth';

export const GET = authorizedRoute(
    ['SUPER_ADMIN', 'ADMIN'], // Allowed roles
    async (req, user) => {
        // user is automatically authenticated
        // user.id, user.email, user.role, user.companyId available
        
        return NextResponse.json({ data: 'protected' });
    }
);
```

### 4. Data Validation

#### Using Zod Schemas
```typescript
import { updateEmployeeSchema } from '@/lib/validators/hr';

const result = updateEmployeeSchema.safeParse(data);
if (!result.success) {
    return createErrorResponse(result.error);
}
const validData = result.data;
```

## 🔧 Troubleshooting

### Issue: "Bad Request" on Employee Update
**Solution**: The validator now handles empty strings automatically. No action needed.

### Issue: "Unauthorized" on API calls
**Solution**: 
1. Check if user is logged in: `const { data: session } = useSession()`
2. Verify role permissions in the API route
3. Check if `Authorization` header is set (for legacy JWT)

### Issue: Middleware errors about `dotenv` or `pg`
**Solution**: Already fixed! The middleware now uses Edge-compatible config only.

### Issue: Session not persisting
**Solution**: 
1. Verify `NEXTAUTH_SECRET` is set in `.env`
2. Check `NEXTAUTH_URL` matches your domain
3. Clear browser cookies and try again

## 📁 File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth handlers
│   │   └── hr/
│   │       └── employees/
│   │           ├── route.ts              # List/Create/Update employees
│   │           └── [id]/route.ts         # Get employee by ID
│   ├── dashboard/                        # Dashboard pages
│   └── login/                            # Login page
├── components/
│   ├── dashboard/                        # Dashboard components
│   └── providers/
│       ├── AuthProvider.tsx              # NextAuth SessionProvider wrapper
│       └── QueryProvider.tsx             # React Query provider
├── lib/
│   ├── nextauth/
│   │   ├── config.ts                     # Edge-compatible config
│   │   └── index.ts                      # Full NextAuth setup
│   ├── auth-legacy.ts                    # Legacy JWT functions
│   ├── session.ts                        # Unified session retrieval
│   ├── middleware-auth.ts                # authorizedRoute wrapper
│   ├── validators/hr.ts                  # Zod validation schemas
│   └── prisma.ts                         # Prisma client
└── types/
    └── next-auth.d.ts                    # NextAuth type extensions
```

## 🎯 Best Practices

### 1. Always Use authorizedRoute for Protected APIs
```typescript
// ✅ Good
export const GET = authorizedRoute(['ADMIN'], async (req, user) => {
    // ...
});

// ❌ Avoid
export async function GET(req: NextRequest) {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // ...
}
```

### 2. Use Zod for Validation
```typescript
// ✅ Good
const result = schema.safeParse(data);
if (!result.success) {
    return createErrorResponse(result.error);
}

// ❌ Avoid
if (!data.email || !data.password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
}
```

### 3. Handle Empty Strings in Forms
The validators automatically handle empty strings, but you can also clean data before sending:
```typescript
// Optional: Clean empty strings before sending
const cleanData = Object.fromEntries(
    Object.entries(formData).map(([key, value]) => 
        [key, value === '' ? null : value]
    )
);
```

## 📊 Database Schema

### Key Models
- **User**: Authentication and user data
- **EmployeeProfile**: Extended employee information
- **Company**: Multi-tenant company data
- **Department**: Organizational structure
- **Attendance**: Employee attendance records
- **WorkReport**: Daily work reports
- **LeaveRequest**: Leave management
- **PerformanceReview**: Performance evaluations

### Relationships
- User → EmployeeProfile (1:1)
- User → Company (Many:1)
- User → Department (Many:1)
- EmployeeProfile → Attendance (1:Many)
- EmployeeProfile → WorkReport (1:Many)

## 🔐 Security

### Authentication Flow
1. User submits credentials
2. NextAuth validates against database
3. JWT token created with user info
4. Session stored in HTTP-only cookie
5. Middleware validates on each request

### Authorization Levels
- **SUPER_ADMIN**: Full system access
- **ADMIN**: Company-wide access
- **MANAGER**: Department/team access
- **TEAM_LEADER**: Team member access
- **SALES_EXECUTIVE**: Customer management
- **CUSTOMER**: Limited self-service access

## 📝 Environment Variables

Required variables in `.env`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# NextAuth (Required!)
AUTH_SECRET="your-secret-at-least-32-chars"
NEXTAUTH_SECRET="your-secret-at-least-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Legacy JWT
JWT_SECRET="your-jwt-secret"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## 🎉 You're All Set!

The application is now fully functional with:
- ✅ Secure authentication via NextAuth
- ✅ Role-based access control
- ✅ Comprehensive employee management
- ✅ Robust data validation
- ✅ Production-ready error handling

Happy coding! 🚀
