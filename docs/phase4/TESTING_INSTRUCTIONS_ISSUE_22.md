# Testing Instructions - Issue #22: Real Auth Integration

**Status**: ✅ Code Complete - Ready for Testing  
**Branch**: `feature/issue-22-real-auth`  
**Commit**: `b5aee55`

---

## 🚀 Quick Start - Test the Auth Integration

### Step 1: Start the Backend (Terminal 1)

```bash
# Navigate to backend
cd /Users/omc-office/NinjaIT/backend/api-gateway

# Install dependencies (if not already done)
npm install

# Start the backend server
npm run dev
```

**Expected Output**:
```
Server listening at http://localhost:3001
```

### Step 2: Start Database Services (Terminal 2)

```bash
# Navigate to project root
cd /Users/omc-office/NinjaIT

# Start PostgreSQL and Dragonfly (Redis)
docker-compose up -d postgres dragonfly
```

**Verify Services**:
```bash
# Check if containers are running
docker ps | grep -E "postgres|dragonfly"
```

### Step 3: Start the Frontend (Terminal 3)

```bash
# Navigate to frontend
cd /Users/omc-office/NinjaIT/frontend

# Install dependencies (if not already done)
npm install

# Start the frontend
npm run dev
```

**Expected Output**:
```
- Local: http://localhost:3000
```

---

## 🧪 Test Scenarios

### Test 1: User Registration ✅

1. Open browser: http://localhost:3000/register
2. Fill in the registration form:
   - **Email**: `test@example.com`
   - **Password**: `password123`
   - **Full Name**: `Test User`
   - **Organization Name**: `Test Org`
3. Click **"Sign Up"**
4. **Expected Result**:
   - ✅ Success message appears
   - ✅ Redirected to dashboard
   - ✅ User profile shown in top right
   - ✅ Check DevTools → Application → Local Storage:
     - `access_token`: should exist
     - `refresh_token`: should exist

**Backend Verification**:
```bash
# Check PostgreSQL for new user
docker exec -it ninjait-postgres psql -U ninjait -d ninjait_dev -c "SELECT id, email, first_name, last_name FROM users ORDER BY created_at DESC LIMIT 1;"
```

---

### Test 2: User Login ✅

1. **Logout** first (click profile → Logout)
2. Go to: http://localhost:3000/login
3. Enter credentials:
   - **Email**: `test@example.com`
   - **Password**: `password123`
4. Click **"Sign In"**
5. **Expected Result**:
   - ✅ Success message appears
   - ✅ Redirected to dashboard
   - ✅ User profile shown
   - ✅ Dashboard loads with all widgets

**Network Tab Verification** (DevTools):
- Look for `POST http://localhost:3001/auth/login`
- Response should be `200 OK`
- Response body should contain:
  ```json
  {
    "user": { ... },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 900
  }
  ```

---

### Test 3: Session Persistence ✅

1. Make sure you're logged in
2. **Refresh the page** (F5 or Cmd+R)
3. **Expected Result**:
   - ✅ You remain logged in
   - ✅ Dashboard loads normally
   - ✅ User data persists
   - ✅ No redirect to login page

---

### Test 4: User Logout ✅

1. Make sure you're logged in
2. Click on user profile dropdown (top right)
3. Click **"Logout"**
4. **Expected Result**:
   - ✅ Success message appears
   - ✅ Redirected to login page
   - ✅ Local storage cleared (check DevTools)
   - ✅ Cannot access /dashboard anymore

---

### Test 5: Invalid Credentials ❌

1. Go to: http://localhost:3000/login
2. Enter **wrong** credentials:
   - **Email**: `test@example.com`
   - **Password**: `wrongpassword`
3. Click **"Sign In"**
4. **Expected Result**:
   - ❌ Error message shown
   - ❌ Not logged in
   - ❌ Still on login page

---

### Test 6: Protected Routes 🔒

1. Make sure you're **logged out**
2. Try to access: http://localhost:3000/dashboard
3. **Expected Result**:
   - ↗️ Automatically redirected to `/login`
   - ❌ Cannot access protected pages

4. Now **login** and try again
5. **Expected Result**:
   - ✅ Dashboard loads successfully

---

### Test 7: Token Auto-Refresh ⏰

**Note**: This requires waiting 15 minutes or modifying the token expiry time.

**Option A - Wait 15 minutes**:
1. Login successfully
2. Wait 15-16 minutes
3. Try to access any page or make any action
4. **Expected Result**:
   - ✅ Token automatically refreshes
   - ✅ Action completes successfully
   - ✅ No logout or error

**Option B - Modify token expiry** (for faster testing):
1. Edit `backend/api-gateway/src/routes/auth-v2.ts`
2. Change line 59: `expiresIn: '15m'` → `expiresIn: '30s'`
3. Restart backend
4. Login
5. Wait 35 seconds
6. Make any API request
7. **Expected Result**:
   - Check DevTools Network tab
   - Should see `POST /auth/refresh` called
   - Original request succeeds

---

## 📊 Expected API Calls

### On Login:
```
POST http://localhost:3001/auth/login
Request:  { "email": "...", "password": "..." }
Response: { "user": {...}, "accessToken": "...", "refreshToken": "..." }
Status:   200 OK
```

### On Register:
```
POST http://localhost:3001/auth/register
Request:  { "email": "...", "password": "...", "fullName": "...", "organizationName": "..." }
Response: { "user": {...}, "organization": {...}, "accessToken": "...", "refreshToken": "..." }
Status:   201 Created
```

### On Get Current User (page refresh):
```
GET http://localhost:3001/auth/me
Headers:  Authorization: Bearer eyJ...
Response: { "id": "...", "email": "...", "fullName": "...", "role": "...", ... }
Status:   200 OK
```

### On Logout:
```
POST http://localhost:3001/auth/logout
Headers:  Authorization: Bearer eyJ...
Response: { "message": "Logged out successfully" }
Status:   200 OK
```

### On Token Refresh:
```
POST http://localhost:3001/auth/refresh
Request:  { "refreshToken": "..." }
Response: { "accessToken": "...", "expiresIn": 900 }
Status:   200 OK
```

---

## 🐛 Troubleshooting

### Problem: "Connection refused" errors

**Solution**:
```bash
# Make sure backend is running
cd backend/api-gateway && npm run dev

# Make sure database is running
docker-compose up -d postgres dragonfly

# Check if services are up
docker ps
```

### Problem: "401 Unauthorized" on all requests

**Solution**:
- Check if access_token is in localStorage
- Try logging out and back in
- Check browser console for errors

### Problem: Database connection errors

**Solution**:
```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres

# Verify connection
docker exec -it ninjait-postgres psql -U ninjait -d ninjait_dev -c "SELECT 1;"
```

### Problem: Frontend won't start

**Solution**:
```bash
# Clear cache and reinstall
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

---

## ✅ Success Criteria Checklist

After testing, all these should work:

- [ ] Can register a new user
- [ ] Can login with valid credentials
- [ ] Cannot login with invalid credentials
- [ ] User stays logged in on page refresh
- [ ] User profile shows correctly
- [ ] Logout works and clears session
- [ ] Cannot access protected routes when logged out
- [ ] Can access dashboard when logged in
- [ ] Tokens are stored in localStorage
- [ ] Network tab shows real API calls (not mocks)
- [ ] No demo credentials on login page
- [ ] Error messages show properly

---

## 📈 Next Steps

After successful testing:

1. **Merge to main**:
   ```bash
   git checkout master
   git merge feature/issue-22-real-auth
   git push origin master
   ```

2. **Close GitHub Issue #22**:
   - Go to: https://github.com/yossibmoha/NinjaIT/issues/22
   - Add comment with testing results
   - Close the issue

3. **Move to Issue #23**:
   - JWT Refresh Token Flow improvements
   - Token rotation
   - Better error handling

---

## 🎉 Celebration

If all tests pass, you've successfully:
- ✅ Replaced mock auth with real backend
- ✅ Integrated JWT authentication
- ✅ Implemented token refresh
- ✅ Created secure login/logout flow
- ✅ Completed your first Phase 4 task!

**Great work! Ready for the next issue! 🚀**

---

*Testing Date: October 9, 2025*  
*Issue: #22*  
*Status: Ready for Testing*

