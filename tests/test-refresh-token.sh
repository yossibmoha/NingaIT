#!/bin/bash

API_URL="http://localhost:8000/api/v1"

echo "🧪 Testing JWT Refresh Token Flow"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Register/Login
echo "📝 1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.refreshToken')

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}❌ Login failed${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo "   Access Token: ${ACCESS_TOKEN:0:20}..."
echo "   Refresh Token: ${REFRESH_TOKEN:0:20}..."
echo ""

# 2. Test authenticated request
echo "🔐 2. Testing authenticated request..."
ME_RESPONSE=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

EMAIL=$(echo $ME_RESPONSE | jq -r '.email')

if [ "$EMAIL" == "null" ] || [ -z "$EMAIL" ]; then
  echo -e "${RED}❌ Authenticated request failed${NC}"
  echo "Response: $ME_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Authenticated request successful${NC}"
echo "   User: $EMAIL"
echo ""

# 3. Test refresh token
echo "🔄 3. Testing token refresh..."
REFRESH_RESPONSE=$(curl -s -X POST "$API_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.accessToken')

if [ "$NEW_ACCESS_TOKEN" == "null" ] || [ -z "$NEW_ACCESS_TOKEN" ]; then
  echo -e "${RED}❌ Token refresh failed${NC}"
  echo "   Response: $REFRESH_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Token refresh successful${NC}"
echo "   New Access Token: ${NEW_ACCESS_TOKEN:0:20}..."
echo ""

# 4. Test new access token
echo "🔐 4. Testing new access token..."
ME_RESPONSE2=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN")

EMAIL2=$(echo $ME_RESPONSE2 | jq -r '.email')

if [ "$EMAIL2" == "null" ] || [ -z "$EMAIL2" ]; then
  echo -e "${RED}❌ New access token failed${NC}"
  echo "Response: $ME_RESPONSE2"
  exit 1
fi

echo -e "${GREEN}✅ New access token works${NC}"
echo "   User: $EMAIL2"
echo ""

# 5. Test logout (blacklist + revoke)
echo "🚪 5. Testing logout..."
LOGOUT_RESPONSE=$(curl -s -X POST "$API_URL/auth/logout" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

echo -e "${GREEN}✅ Logout successful${NC}"
echo ""

# 6. Test blacklisted access token
echo "🚫 6. Testing blacklisted access token..."
ME_RESPONSE3=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN")

HTTP_CODE=$(echo "$ME_RESPONSE3" | tail -n1)

if [ "$HTTP_CODE" == "401" ]; then
  echo -e "${GREEN}✅ Access token successfully blacklisted (401)${NC}"
else
  echo -e "${RED}❌ Access token not blacklisted (got $HTTP_CODE)${NC}"
  exit 1
fi
echo ""

# 7. Test revoked refresh token
echo "🚫 7. Testing revoked refresh token..."
REFRESH_RESPONSE2=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

HTTP_CODE2=$(echo "$REFRESH_RESPONSE2" | tail -n1)

if [ "$HTTP_CODE2" == "401" ]; then
  echo -e "${GREEN}✅ Refresh token successfully revoked (401)${NC}"
else
  echo -e "${RED}❌ Refresh token not revoked (got $HTTP_CODE2)${NC}"
  exit 1
fi
echo ""

echo -e "${GREEN}🎉 All tests passed!${NC}"
echo "=================================="
echo ""
echo "Summary:"
echo "  ✅ Login with credentials"
echo "  ✅ Use access token for API calls"
echo "  ✅ Refresh access token using refresh token"
echo "  ✅ Use new access token"
echo "  ✅ Logout revokes both tokens"
echo "  ✅ Blacklisted access token rejected"
echo "  ✅ Revoked refresh token rejected"

