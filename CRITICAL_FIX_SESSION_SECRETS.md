# 🔧 CRITICAL FIX NEEDED - Session Secret Mismatch

## ❌ Problem Identified

The server logs show this error:
```
[auth][error] JWTSessionError: no matching decryption secret
```

## 🎯 Root Cause

When we updated the `AUTH_SECRET` and `NEXTAUTH_SECRET` in your `.env` file, the existing session cookies in your browser were encrypted with the OLD secrets. Now NextAuth can't decrypt them with the NEW secrets.

## ✅ Solution (Choose ONE):

### Option 1: Clear Browser Cookies (Recommended)
1. Open your browser
2. Press `F12` to open DevTools
3. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
4. Find **Cookies** → `http://localhost:3002`
5. Delete all cookies
6. Refresh the page
7. Login again

### Option 2: Use Incognito/Private Window
1. Open a new Incognito/Private window
2. Go to http://localhost:3002
3. Login
4. Test employee update

### Option 3: Logout and Login
1. Click Logout in the app
2. Login again
3. This will create a new session with the new secrets

### Option 4: Revert to Old Secrets (Temporary)
If you want to keep your current session, we can temporarily use the old secrets:

**Edit `.env` file:**
```env
# Use the old secrets temporarily
AUTH_SECRET="pk_test_cmVuZXdpbmctb2NlbG90LTI0LmNsZXJrLmFjY291bnRzLmRldiQ"
NEXTAUTH_SECRET="sk_test_F0NbzqPGml60kwgXj9zkero2p5CwmQWfqvTF64jKHp"
```

Then restart the dev server.

## 🚀 Quick Fix Commands

### Clear cookies and restart:
```bash
# Kill the current dev server (Ctrl+C)
# Then restart:
rm -rf .next
npm run dev
```

Then in your browser:
- Clear cookies (F12 → Application → Cookies → Delete all)
- Go to http://localhost:3002
- Login again

## 🔍 Why This Happened

1. We generated NEW secure secrets for NextAuth
2. Your browser still has cookies encrypted with OLD secrets
3. NextAuth tries to decrypt with NEW secrets → fails
4. Result: "no matching decryption secret" error

## ✨ After Fixing

Once you clear cookies and login again:
1. New session will be created with NEW secrets
2. All authentication will work properly
3. Employee update will work
4. No more decryption errors

## 📝 For Production

In production, when you change secrets:
1. All users will need to login again
2. This is normal and expected
3. Plan secret rotation during maintenance windows
4. Notify users they'll need to re-authenticate

---

**Action Required**: Please clear your browser cookies and login again, then try the employee update!
