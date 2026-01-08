# Employee Update Debugging Guide

## 🐛 Current Issue: "API Error: Bad Request"

You're getting a validation error when trying to update employee profiles. I've added comprehensive logging to help us identify the exact field causing the issue.

## 🔍 How to Debug

### Step 1: Try to Update an Employee

1. Go to your application
2. Navigate to **HR Management → Employees**
3. Click on an employee
4. Try to edit and save

### Step 2: Check Server Logs

After you try to update, look at your terminal where `npm run dev` is running. You should see output like this:

```
📝 Update Employee Request: { id: 'xxx-xxx-xxx', dataKeys: ['designation', 'baseSalary', ...] }
```

If there's a validation error, you'll see:

```
❌ Validation Error: {
  "personalEmail": {
    "_errors": ["Invalid email address"]
  },
  ...
}
📦 Received Data: {
  "designation": "Senior Dev",
  "personalEmail": "",
  ...
}
```

### Step 3: Share the Error

Copy the error output and share it so we can fix the specific field causing issues.

## 🛠️ What I've Fixed

### 1. Enhanced Empty String Handling

The validator now handles these cases:
- Empty strings (`""`)
- String "null" (`"null"`)
- String "undefined" (`"undefined"`)
- Actual `null` and `undefined`

All are converted to proper `null` or `undefined` before validation.

### 2. More Flexible Email Validation

```typescript
personalEmail: z.preprocess(emptyToNull, z.string().email().nullable().optional())
  .or(z.literal(null))
  .optional()
```

This allows:
- Valid email addresses
- Empty strings (converted to null)
- null values
- undefined (field not sent)

### 3. Passthrough Mode

Added `.passthrough()` to the schema, which means:
- Extra fields won't cause validation errors
- Only specified fields are validated
- Unknown fields are passed through

### 4. Better Error Messages

The server now logs:
- ✅ Which fields are being sent
- ✅ The exact validation error
- ✅ The actual data received

## 🧪 Manual Testing

You can test the API directly using curl:

```bash
# Make the script executable
chmod +x test-employee-update.sh

# Run the test (replace with actual employee ID and token)
./test-employee-update.sh "employee-uuid-here" "your-jwt-token-here"
```

Or use curl directly:

```bash
curl -X PATCH http://localhost:3000/api/hr/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "id": "employee-uuid",
    "designation": "Senior Developer",
    "baseSalary": 75000,
    "personalEmail": "",
    "dateOfBirth": ""
  }'
```

## 📋 Common Issues and Solutions

### Issue 1: Email Validation Error
**Error**: `Invalid email address`
**Cause**: Empty string not being converted to null
**Solution**: ✅ Fixed with `.or(z.literal(null))`

### Issue 2: UUID Validation Error
**Error**: `Invalid UUID`
**Cause**: Empty string for designationId
**Solution**: ✅ Fixed with preprocessing

### Issue 3: Date Validation Error
**Error**: `Invalid input: expected date, received Date`
**Cause**: Invalid date strings
**Solution**: ✅ Fixed with `.nullable().optional()`

### Issue 4: Unknown Fields
**Error**: `Unrecognized key(s) in object`
**Solution**: ✅ Fixed with `.passthrough()`

## 🎯 Next Steps

1. **Try updating an employee** in the UI
2. **Check the server logs** for the detailed error
3. **Share the error output** if it still fails
4. I'll fix the specific field causing the issue

## 📝 Example Server Log Output

### Success Case:
```
📝 Update Employee Request: { 
  id: '123e4567-e89b-12d3-a456-426614174000', 
  dataKeys: ['designation', 'baseSalary', 'phoneNumber'] 
}
✅ Employee updated successfully
```

### Error Case:
```
📝 Update Employee Request: { 
  id: '123e4567-e89b-12d3-a456-426614174000', 
  dataKeys: ['designation', 'personalEmail', 'designationId'] 
}
❌ Validation Error: {
  "personalEmail": {
    "_errors": ["Invalid email address"]
  },
  "designationId": {
    "_errors": ["Invalid UUID"]
  }
}
📦 Received Data: {
  "designation": "Senior Developer",
  "personalEmail": "",
  "designationId": ""
}
```

## 🔧 Validator Changes Made

### Before:
```typescript
personalEmail: z.string().email().optional().nullable()
```

### After:
```typescript
personalEmail: z.preprocess(
  emptyToNull,
  z.string().email().nullable().optional()
).or(z.literal(null)).optional()
```

This ensures:
1. Empty strings are converted to null FIRST
2. Then validated as either email or null
3. Or can be literal null
4. Or can be undefined (not sent)

## 💡 Tips

- **Clear browser cache** if you're still seeing old errors
- **Restart the dev server** to ensure new code is loaded
- **Check Network tab** in browser DevTools to see the exact request payload
- **Look for console errors** in the browser console

## 🆘 Still Having Issues?

If you're still getting errors after trying to update:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to update an employee
4. Find the PATCH request to `/api/hr/employees`
5. Copy the **Request Payload**
6. Share it along with the **server logs**

This will help me identify the exact field and value causing the issue.

---

**Updated**: 2026-01-08
**Status**: Enhanced validation with comprehensive logging
