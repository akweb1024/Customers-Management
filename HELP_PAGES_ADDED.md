# 📚 Role-Based Help System Added

## ✅ Feature Implemented
I have integrated a dynamic **"My Work Guide"** into the **Knowledge Base** (`/dashboard/knowledge-base`).

### How it Works
1.  **Automatic Detection**: When a user visits the Knowledge Base, the system detects their role (e.g., Manager, Admin, Customer).
2.  **Tailored Content**: The default tab **"MY WORK"** displays a specific guide just for them.
3.  **Roles Covered**:
    *   **super admin**: System control, user management.
    *   **admin**: Company operations, HR setup.
    *   **manager**: Approvals, team monitoring.
    *   **team_leader**: Task distribution.
    *   **sales_executive**: Customer management.
    *   **agency**: Subscription tracking.
    *   **institution**: Library access.
    *   **customer**: Invoice and order tracking.

### 🔒 Security
- These guides are part of the Dashboard, meaning they are **only accessible to authenticated (valid) users**.
- Users only see the guide relevant to their logged-in identity.

## 🧪 How to Test
1.  **Login** as any user (e.g., Super Admin).
2.  Navigate to **Knowledge Base** (in "Resources & Team" or "My Profile").
3.  You will immediately see the **"MY WORK"** guide tailored to you.
4.  Switch to "ALL" or "FAQ" to see general articles.
5.  **Impersonate** a differnt user (e.g. Manager) to verify they see *their* specific guide.

---
**Status**: ✅ Complete & Live
