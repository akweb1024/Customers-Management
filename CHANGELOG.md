# Changelog & Project History

## [1.0.0] - 2026-01-08

### Summary
The application has undergone a significant refactor to improve security, stability, and feature completeness. The core HR management system and authentication flow are now production-ready.

### Added
- **NextAuth Integration**: Successfully implemented NextAuth v5 (Beta) with Credentials provider for secure, cookie-based sessions.
- **Institution-Centric System**: 
  - Unified activity dashboard for university and library institutions.
  - Bulk employee assignment feature for institutions.
  - Aggregated statistics (revenue, customers, subscriptions) at the institution level.
- **Role-Based Workflows**: Enhanced "Manager" section for HR workflows including Work Reports and Leave Requests.
- **Knowledge Base**: Added comprehensive role-based guides ("My Work" section) for all user roles.
- **Data Hub**: Bulk Import/Export capabilities for Customers, Journals, and Institutions.

### Fixed
- **Employee Update System**: 
  - Resolved "Bad Request" errors by implementing Zod preprocessing for empty strings.
  - Fixed Prisma relation errors when updating `designationId`.
  - Standardized phone and email validation for nullable fields.
- **Impersonation Mode**: Fixed the "Login As" feature to work correctly with NextAuth sessions, including a "Back to Admin" return mechanism.
- **API Reliability**: 
  - Refactored 50+ API routes to use a standardized `authorizedRoute` middleware.
  - Improved type safety across all recruitment and HR endpoints.
  - Fixed "zombie process" issues and port conflicts on development servers.
- **UI/UX**: 
  - Improved layout of Employee Profile with vertically stacked Job Descriptions/KRAs.
  - Added loading states and helpful empty states across the dashboard.
  - Fixed raw HTML display issues in the Staff Portal.

### Security
- Switched from custom JWT to NextAuth with HTTP-only cookies.
- Standardized role-based access control (RBAC) across frontend and backend.
- Implemented robust input validation using Zod schemas.

---

*Note: This changelog summarizes various implementation phases including Phase 2 (Institutions), Phase 3 (Advanced Analytics), and critical bug fix sessions.*
