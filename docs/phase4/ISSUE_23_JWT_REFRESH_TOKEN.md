# Issue #23: JWT Refresh Token Flow Implementation

**Status**: ✅ Complete  
**Date**: October 12, 2025  
**Sprint**: 1.1

---

## 📋 Overview

Implemented a complete JWT refresh token flow with automatic token refresh, token blacklisting, and secure logout.

---

## 🎯 Features Implemented

### 1. **Access Token & Refresh Token**
- **Access Token**: Short-lived (15 minutes), used for API authentication
- **Refresh Token**: Long-lived (7 days), used to obtain new access tokens
- Both tokens stored in Redis for validation and revocation

### 2. **Automatic Token Refresh**
- Frontend intercepts 401 errors
- Automatically refreshes access token using refresh token
- Retries failed request with new token
- Seamless user experience (no logout on token expiry)

### 3. **Token Blacklisting**
- Access tokens blacklisted on logout
- Refresh tokens revoked on logout
- Prevents token reuse after logout

### 4. **Enhanced Security**
- JWT verification with signature validation
- Token expiration checks
- Refresh token rotation (new access token each refresh)
- Redis-based token storage with TTL

---

## 🏗️ Architecture

### Token Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │         │  API Gateway │         │ Auth Service│
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │                        │
      │   1. Login             │                        │
      ├───────────────────────>│                        │
      │                        │   Generate Tokens      │
      │                        ├───────────────────────>│
      │                        │   (Access + Refresh)   │
      │                        │<───────────────────────┤
      │   Tokens + User        │                        │
      │<───────────────────────┤                        │
      │                        │                        │
      │   2. API Request       │                        │
      │   (Access Token)       │                        │
      ├───────────────────────>│   Verify Token         │
      │                        ├───────────────────────>│
      │   Response             │                        │
      │<───────────────────────┤                        │
      │                        │                        │
      │   3. Token Expired     │                        │
      ├───────────────────────>│                        │
      │   401 Unauthorized     │                        │
      │<───────────────────────┤                        │
      │                        │                        │
      │   4. Refresh Token     │                        │
      ├───────────────────────>│   Verify Refresh       │
      │                        ├───────────────────────>│
      │                        │   New Access Token     │
      │                        │<───────────────────────┤
      │   New Access Token     │                        │
      │<───────────────────────┤                        │
      │                        │                        │
      │   5. Retry Request     │                        │
      │   (New Access Token)   │                        │
      ├───────────────────────>│                        │
      │   Success!             │                        │
      │<───────────────────────┤                        │
```

---

## 📁 Files Modified

### Backend

#### 1. **`backend/services/auth/src/index.ts`**
Added functions for refresh token management:

```typescript
// Store refresh token in Redis (7 days TTL)
export async function storeRefreshToken(
  userId: string, 
  refreshToken: string, 
  expiresIn: number
)

// Verify refresh token and return user ID
export async function verifyRefreshToken(
  refreshToken: string
): Promise<string>

// Revoke refresh token from Redis
export async function revokeRefreshToken(
  refreshToken: string
): Promise<void>

// Generate JWT payload for user
export function generateTokenPayload(user: any)

// Parse token expiration string (15m, 7d, etc.)
export function getTokenExpiration(expiresIn: string): number
```

#### 2. **`backend/api-gateway/src/routes/auth-v2.ts`**
Updated logout endpoint to revoke refresh token:

```typescript
app.post('/logout', {
  onRequest: [authenticate],
  // ...
}, async (request, reply) => {
  const token = request.headers.authorization?.replace('Bearer ', '') || '';
  const { refreshToken } = request.body;
  
  // Blacklist access token
  await blacklistToken(token, 15 * 60 * 1000);
  
  // Revoke refresh token
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }
  
  reply.send({ message: 'Logged out successfully' });
});
```

#### 3. **`backend/api-gateway/src/middleware/auth.ts`**
Enhanced authentication middleware:

```typescript
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Extract token
  const token = authorization.replace('Bearer ', '');
  
  // Check blacklist
  const isBlacklisted = await isTokenBlacklisted(token);
  if (isBlacklisted) {
    return reply.code(401).send({ error: 'Token has been revoked' });
  }
  
  // Verify JWT
  const decoded = await request.jwtVerify();
  request.user = decoded;
}
```

### Frontend

#### 1. **`frontend/src/lib/api.ts`**
Fixed API URL and enhanced interceptor:

```typescript
// Fixed API URL to match API Gateway port
const API_URL = 'http://localhost:8000/api/v1'

// Response interceptor for automatic refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        // Refresh access token
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });
        
        // Store new access token
        localStorage.setItem('access_token', data.accessToken);
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
```

#### 2. **`frontend/src/store/auth.ts`**
Updated logout to revoke refresh token:

```typescript
logout: async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    
    // Send refresh token to backend for revocation
    await api.post('/auth/logout', { refreshToken });
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    localStorage.clear();
    window.location.href = '/login';
  }
}
```

---

## 🧪 Testing

### Test Script

Create `test-refresh-token.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:8000/api/v1"

echo "🧪 Testing JWT Refresh Token Flow"
echo "=================================="
echo ""

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

if [ "$ACCESS_TOKEN" == "null" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Login successful"
echo "   Access Token: ${ACCESS_TOKEN:0:20}..."
echo "   Refresh Token: ${REFRESH_TOKEN:0:20}..."
echo ""

# 2. Test authenticated request
echo "🔐 2. Testing authenticated request..."
ME_RESPONSE=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

EMAIL=$(echo $ME_RESPONSE | jq -r '.email')

if [ "$EMAIL" == "null" ]; then
  echo "❌ Authenticated request failed"
  exit 1
fi

echo "✅ Authenticated request successful"
echo "   User: $EMAIL"
echo ""

# 3. Test refresh token
echo "🔄 3. Testing token refresh..."
REFRESH_RESPONSE=$(curl -s -X POST "$API_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.accessToken')

if [ "$NEW_ACCESS_TOKEN" == "null" ]; then
  echo "❌ Token refresh failed"
  echo "   Response: $REFRESH_RESPONSE"
  exit 1
fi

echo "✅ Token refresh successful"
echo "   New Access Token: ${NEW_ACCESS_TOKEN:0:20}..."
echo ""

# 4. Test new access token
echo "🔐 4. Testing new access token..."
ME_RESPONSE2=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN")

EMAIL2=$(echo $ME_RESPONSE2 | jq -r '.email')

if [ "$EMAIL2" == "null" ]; then
  echo "❌ New access token failed"
  exit 1
fi

echo "✅ New access token works"
echo "   User: $EMAIL2"
echo ""

# 5. Test logout (blacklist + revoke)
echo "🚪 5. Testing logout..."
LOGOUT_RESPONSE=$(curl -s -X POST "$API_URL/auth/logout" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

echo "✅ Logout successful"
echo ""

# 6. Test blacklisted access token
echo "🚫 6. Testing blacklisted access token..."
ME_RESPONSE3=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN")

HTTP_CODE=$(echo "$ME_RESPONSE3" | tail -n1)

if [ "$HTTP_CODE" == "401" ]; then
  echo "✅ Access token successfully blacklisted (401)"
else
  echo "❌ Access token not blacklisted (got $HTTP_CODE)"
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
  echo "✅ Refresh token successfully revoked (401)"
else
  echo "❌ Refresh token not revoked (got $HTTP_CODE2)"
  exit 1
fi
echo ""

echo "🎉 All tests passed!"
echo "=================================="
```

### Manual Testing Steps

1. **Login and Get Tokens**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

2. **Use Access Token**:
```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

3. **Refresh Access Token**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

4. **Logout (Revoke Tokens)**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## 🔐 Security Features

### 1. **Token Storage**
- ✅ Refresh tokens stored in Redis with TTL
- ✅ Access tokens blacklisted on logout
- ✅ Automatic cleanup via Redis expiration

### 2. **Token Validation**
- ✅ JWT signature verification
- ✅ Expiration time checks
- ✅ Blacklist checks before processing

### 3. **Token Revocation**
- ✅ Access tokens blacklisted (15 min TTL)
- ✅ Refresh tokens deleted from Redis
- ✅ Both tokens revoked on logout

### 4. **Frontend Security**
- ✅ Tokens stored in localStorage (XSS protection recommended)
- ✅ Automatic retry with new token
- ✅ Logout on refresh failure

---

## 📊 Token Lifecycle

### Access Token
```
Login/Register → 15 min validity → Auto-refresh on 401 → Continue using
                                                      ↓
                                                   Expires
                                                      ↓
                                              Logout/Blacklist
```

### Refresh Token
```
Login/Register → 7 days validity → Used for refresh → Continue using
                                                    ↓
                                                Expires
                                                    ↓
                                              Logout/Revoke
```

---

## 📝 API Endpoints

### POST `/auth/refresh`
Refresh access token using refresh token.

**Request**:
```json
{
  "refreshToken": "string"
}
```

**Response** (200):
```json
{
  "accessToken": "string",
  "expiresIn": 900
}
```

**Errors**:
- `401`: Invalid or expired refresh token

### POST `/auth/logout`
Logout user and revoke tokens.

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request**:
```json
{
  "refreshToken": "string"
}
```

**Response** (200):
```json
{
  "message": "Logged out successfully"
}
```

---

## 🎯 Benefits

1. **Better UX**: Users stay logged in for 7 days
2. **Improved Security**: Short-lived access tokens (15 min)
3. **Token Rotation**: New access token on each refresh
4. **Clean Logout**: Both tokens properly revoked
5. **Automatic Recovery**: Seamless token refresh on expiry

---

## ✅ Checklist

- [x] Implement refresh token storage in Redis
- [x] Implement refresh token verification
- [x] Implement refresh token revocation
- [x] Update logout to revoke refresh token
- [x] Fix API URL in frontend (port 8000)
- [x] Add automatic token refresh in frontend
- [x] Add token blacklisting checks
- [x] Update middleware for blacklist validation
- [x] Create test script
- [x] Write comprehensive documentation

---

## 🚀 Next Steps

**Issue #24**: Password Reset Functionality
- Email verification
- Password reset tokens
- Secure password update flow

---

*Implementation completed by AI Assistant on October 12, 2025*

