#!/bin/bash
# API Test Script
# Test all endpoints with curl
# Echo each test name before running
#
# Test 1: GET all couriers
# Test 2: POST create order
# Test 3: GET all orders
# Test 4: GET specific order
# Test 5: PATCH update state (valid)
# Test 6: PATCH update state (invalid - should fail)
# Test 7: Test 404 route

BASE="http://localhost:3000"
set -e

echo "=== Test 1: GET all couriers ==="
curl -s "${BASE}/api/couriers"
echo -e "\n"

echo "=== Test 2: POST create order ==="
CREATE_RESP=$(curl -s -X POST "${BASE}/api/orders" -H "Content-Type: application/json" -d '{
  "pickupLocation": { "x": 10, "y": 10 },
  "dropLocation": { "x": 20, "y": 25 },
  "deliveryType": "standard",
  "packageDetails": { "weight": 2 }
}')
echo "Response: $CREATE_RESP"

# Extract order id using node (requires Node.js)
ORDER_ID=$(printf '%s' "$CREATE_RESP" | node -e "let s='';process.stdin.on('data',c=>s+=c);process.stdin.on('end',()=>{try{const j=JSON.parse(s); console.log(j.id||'');}catch(e){process.exit(0)}})")
if [ -z "$ORDER_ID" ]; then
  echo "Could not extract order id; continuing but some tests may fail."
else
  echo "Created order id: $ORDER_ID"
fi

echo -e "\n=== Test 3: GET all orders ==="
curl -s "${BASE}/api/orders"
echo -e "\n"

if [ -n "$ORDER_ID" ]; then
  echo "=== Test 4: GET specific order (${ORDER_ID}) ==="
  curl -s "${BASE}/api/orders/${ORDER_ID}"
  echo -e "\n"

  echo "=== Test 5: PATCH update state (valid -> PICKED_UP) ==="
  curl -s -X PATCH "${BASE}/api/orders/${ORDER_ID}/state" -H "Content-Type: application/json" -d '{"state":"PICKED_UP"}'
  echo -e "\n"

  echo "=== Test 6: PATCH update state (invalid -> DELIVERED directly) ==="
  # Expect this to fail (invalid transition)
  HTTP_CODE=$(curl -s -o /dev/stderr -w "%{http_code}" -X PATCH "${BASE}/api/orders/${ORDER_ID}/state" -H "Content-Type: application/json" -d '{"state":"DELIVERED"}' 2>&1 | tail -n1)
  echo -e "HTTP status: $HTTP_CODE"
  echo -e "\n"
else
  echo "Skipping tests 4-6 because ORDER_ID not available."
fi

echo "=== Test 7: Test 404 route ==="
HTTP_404=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/api/invalid")
echo "HTTP status for /api/invalid: $HTTP_404"

echo "\nAll tests finished."
