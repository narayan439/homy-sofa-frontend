# Complete Booking Data Retrieval Debugging Guide

## 🔍 Quick Diagnostics (Run in Order)

### Step 1: Verify Database Has Bookings with user_id
```bash
# Login to MySQL
mysql -h localhost -u root -p123456

# Select database
USE homy_backend;

# Check bookings structure and user_id values
SELECT id, user_id, name, email, service, status, created_at FROM bookings LIMIT 5;

# Check if bookings without user_id exist
SELECT COUNT(*) as bookings_without_userid FROM bookings WHERE user_id IS NULL;

# Check total bookings count
SELECT COUNT(*) as total_bookings FROM bookings;

# For a specific user (e.g., user_id = 2)
SELECT id, user_id, name, email, service, status, created_at 
FROM bookings 
WHERE user_id = 2 
ORDER BY created_at DESC 
LIMIT 5;
```

### Step 2: Test Backend Endpoint Directly (Postman/cURL)

1. **Get a Valid JWT Token**
   - Login as user at http://localhost:4200/login
   - Open DevTools → Application → localStorage → Copy `userToken` value

2. **Test Backend GET endpoint**
   ```bash
   # Replace TOKEN with the copied JWT and USER_ID with the logged-in user's ID
   curl -X GET "http://localhost:8080/api/bookings/user/2" \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json"
   ```

   Expected Response:
   ```json
   [
     {
       "id": 1,
       "userId": 2,
       "name": "Test User",
       "email": "test@example.com",
       "service": "AC Service",
       "status": "PENDING",
       "totalAmount": 500,
       "createdAt": "2024-01-15T10:30:00"
     }
   ]
   ```

### Step 3: Frontend Console Debugging

1. **Open browser DevTools** (F12)
2. **Clear localStorage** (DevTools → Application → Storage → Clear All)
3. **Go to login page**: http://localhost:4200/login
4. **Login with test account**
5. **Go to dashboard**: http://localhost:4200/user/dashboard
6. **Open DevTools Console** (Ctrl+Shift+K or right-click → Inspect → Console)
7. **Look for `[UserDashboard]` logs** and report what you see:

   ```
   ✅ If you see: "[UserDashboard] Total bookings to display: X" (X > 0)
      → Bookings are loading correctly! Check UI display.
   
   ❌ If you see: "[UserDashboard] Total bookings to display: 0"
      → Backend returned empty array. Check database step.
   
   ❌ If you see: "[UserDashboard] Error loading bookings:"
      → Network error. Check backend is running.
   
   ❌ If you see: "[UserDashboard] userId is 0, cannot load bookings"
      → User not logged in properly. Check login step.
   ```

### Step 4: Backend Logs Check

1. **Ensure backend is running**:
   ```bash
   # In backend directory (backend/Homy-backend)
   .\mvnw.cmd spring-boot:run
   ```

2. **Look for logs when you hit dashboard**:
   - Should see no errors in console
   - No "Unknown column" or SQL errors

### Step 5: Authentication Verification

Check if user JWT token is being sent:

```javascript
// In browser DevTools Console, run:
const token = localStorage.getItem('userToken');
const userId = localStorage.getItem('userId');
console.log('Token:', token ? token.substring(0, 20) + '...' : 'NOT FOUND');
console.log('UserId:', userId);
```

Should show token and userId. If either is missing, user is not properly logged in.

---

## 🐛 Common Issues & Solutions

### Issue #1: "No Bookings Found" but Database has Bookings

**Causes to check:**

1. **Bookings don't have user_id in database**
   - **Fix**: Check database query in Step 1
   - If bookings have NULL user_id, they won't be returned

2. **JWT token not being sent to backend**
   - **Fix**: Check browser DevTools Network tab
   - Go to dashboard, Network tab, filter for `user/2`
   - Click on the request, check `Authorization` header exists with `Bearer TOKEN`

3. **JWT token extracted incorrectly on backend**
   - **Fix**: Look at backend logs during booking creation
   - Should see `[BookingController.create] Set booking userId: 2` (example)

### Issue #2: Backend Returns Error 401 Unauthorized

- JWT token expired or invalid
- **Fix**: 
  1. Logout and login again
  2. Try localhost:4200/user/dashboard

### Issue #3: Backend Returns 404 Not Found

- Endpoint doesn't exist (shouldn't happen)
- **Fix**: 
  1. Verify backend is running: `.\mvnw.cmd spring-boot:run`
  2. Check port is 8080 (not already in use)

### Issue #4: userId = 0 in Dashboard

- User data not loaded from localStorage
- **Fix**:
  1. Logout: http://localhost:4200/logout (or clear localStorage)
  2. Login again with correct credentials
  3. Check DevTools Console for `[UserDashboard] userId:` logs

---

## 📊 Expected Flow

```
1. User Login
   ↓
   UserAuthService.login() saves:
   - userToken (JWT)
   - userId (from response)
   - userData (full user object)
   ↓
2. User navigates to dashboard
   ↓
   UserDashboardComponent.loadUserData()
   - Loads userId from localStorage/userData
   ↓
3. Component calls loadBookings()
   ↓
   AuthInterceptor adds JWT to request:
   - GET /api/bookings/user/2
   - Header: Authorization: Bearer JWT_TOKEN
   ↓
4. Backend extracts userId from JWT
   ↓
   BookingController.getUserBookings(2)
   ↓
   BookingRepository.findByUserIdOrderByCreatedAtDesc(2)
   ↓
   Returns List<Booking> (should have bookings with user_id=2)
   ↓
5. Frontend receives array
   ↓
   Component transforms and displays
```

---

## 🔧 Logs to Look For

### Frontend Console Logs (Browser DevTools)

```
[UserDashboard] loadBookings() called
[UserDashboard] userId: 2
[UserDashboard] Calling bookingService.getUserBookings with userId: 2
[UserDashboard] getUserBookings response: [...]
[UserDashboard] response type: array
[UserDashboard] rawBookings count: 1
[UserDashboard] Processing booking: {id: 1, service: "AC Service", ...}
[UserDashboard] Transformed bookings: [{id: 1, serviceName: "AC Service", ...}]
[UserDashboard] Total bookings to display: 1
```

### Backend Logs (Spring Boot console)

```
[BookingController.create] Starting booking creation...
[BookingController.create] Claims from request: {...}
[BookingController.create] Parsed userId: 2
[BookingController.create] User found: user@example.com (ID: 2)
[BookingController.create] Set booking userId: 2
[BookingController.create] Booking saved with ID: 1, userId: 2
```

---

## 💾 Quick Fix Checklist

- [ ] Backend running on port 8080
- [ ] Frontend running on port 4200  
- [ ] User logged in (token visible in localStorage)
- [ ] Bookings exist in database with user_id populated
- [ ] No SQL errors in backend console
- [ ] No 401 errors in browser Network tab
- [ ] Logs show API response received
- [ ] Data transformation not losing bookings

---

## If Issue Persists

**Provide these details:**

1. Database query result (Step 1)
2. Browser console logs (Step 3) - copy all `[UserDashboard]` lines
3. Backend logs during dashboard load
4. Network tab → `/api/bookings/user/2` request details (headers + response)
5. What browser are you using?
6. Are you accessing from localhost or a different URL?
