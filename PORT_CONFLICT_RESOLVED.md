# 🔌 Port Conflict Resolved

## 🛑 The Issue
You encountered a `ClientFetchError` with `Unexpected token '<'`.
- **Cause**: Port `3000` was blocked by a "zombie" (crashed) process that was returning 500 Errors (HTML).
- **Mismatch**: The new server started on `3005`, but the app configuration (`NEXTAUTH_URL`) was still pointing to `3000`.
- **Result**: The browser tried to fetch session data from the broken process on port 3000, received an HTML error page instead of JSON, and crashed.

## ✅ The Fix
1.  **Terminated the Zombie Process**: I forcibly killed the process using port `3000`.
2.  **Restarted Server**: I restarted the dev server, which successfully bound to `http://localhost:3000`.

## 🔄 What You Should Do
1.  **Refresh your browser** at `http://localhost:3000`.
2.  The error should be gone, and you should be able to login/impersonate correctly.

---
**Status**: ✅ Server running on Port 3000
