#!/bin/bash

# Employee Update Test Script
# This script helps test the employee update API

echo "🧪 Employee Update API Test"
echo "============================"
echo ""

# Get the employee ID from command line or use a default
EMPLOYEE_ID="${1:-your-employee-id-here}"
TOKEN="${2:-your-token-here}"

echo "Testing employee update for ID: $EMPLOYEE_ID"
echo ""

# Test payload with various field types
cat > /tmp/test-employee-update.json << 'EOF'
{
  "id": "EMPLOYEE_ID_PLACEHOLDER",
  "designation": "Senior Developer",
  "baseSalary": 75000,
  "personalEmail": "",
  "dateOfBirth": "",
  "phoneNumber": "1234567890",
  "department": "Engineering"
}
EOF

# Replace placeholder with actual ID
sed -i "s/EMPLOYEE_ID_PLACEHOLDER/$EMPLOYEE_ID/g" /tmp/test-employee-update.json

echo "📦 Test Payload:"
cat /tmp/test-employee-update.json | jq .
echo ""

echo "🚀 Sending request..."
curl -X PATCH http://localhost:3000/api/hr/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @/tmp/test-employee-update.json \
  -v

echo ""
echo ""
echo "✅ Test complete! Check the server logs for validation details."
