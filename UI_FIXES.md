# ✨ UI & Functional Fixes Applied

I have addressed your latest 3 requests:

## 1. 🏢 Unable to Create Department
- **Fix:** SUPER_ADMINs (who don't have a default company) can now create departments. I updated the API to allow you to specify the Company ID, rather than erroring out due to missing context.

## 2. 📝 Subscription Requests
- **New Feature:** Added a **"View Requests"** button on the Subscriptions Dashboard (for Admins).
- **Function:** Clicking it filters the list to show only "Requested" subscriptions instantly.

## 3. 👁️ Input Visibility
- **Fix:** Increased the contrast of input field borders. They are now darker and clearly visible against the white background.

## 🚀 Action
**Redeploy** the application to see these changes.
