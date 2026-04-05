# Address System - Testing Guide

## 🚀 Quick Start Testing

### Prerequisites
✅ Backend running on http://localhost:8080
✅ Frontend running on http://localhost:4200
✅ MySQL database with migrations executed
✅ User logged in with valid JWT token

---

## 📋 Manual Testing Steps

### Test 1: Access Address Management Page

**Steps:**
1. Log in as a user
2. Click user menu → "Manage Addresses"
3. Should navigate to `/user/addresses`

**Expected Result:**
- Page displays with header "Manage Addresses"
- "Add New Address" button visible
- Empty state message or existing addresses list shown
- ✅ **PASS** if page loads without errors

---

### Test 2: Add a New Address

**Steps:**
1. Click "Add New Address" button
2. Form appears with fields:
   - Label (My Home, Office, etc.)
   - Address Type (Home, Office, Other)
   - House/Building
   - Area
   - City
   - Pincode (6 digits)
   - Landmark (optional)
3. Fill all required fields
4. Click "Save Address"

**Expected Result:**
- Loading spinner appears briefly
- Success message shown ("✅ Address added successfully")
- New address appears in list below
- Form collapses
- ✅ **PASS** if address saved and visible in list

**Test as Admin:**
- Open devtools → Network tab
- Look for POST request to `/api/addresses`
- Response should contain: `{ "success": true, "data": { "id": ..., "userId": ..., ... } }`

---

### Test 3: Edit Existing Address

**Steps:**
1. In address list, click "Edit" button on any address
2. Form populates with current values
3. Modify any field (e.g., change landmark)
4. Click "Update Address"

**Expected Result:**
- Loading spinner appears
- Success message shown
- Address details updated in list
- ✅ **PASS** if edit saved successfully

**Test as Admin:**
- Look for PUT request to `/api/addresses/{id}`
- Check response contains updated data

---

### Test 4: Set as Default Address

**Steps:**
1. Add 2-3 addresses first
2. Click "Set as Default" on one address
3. Observe the DEFAULT badge moves

**Expected Result:**
- Previous default loses badge
- New address gets green DEFAULT badge
- Only one address marked as default
- ✅ **PASS** if default correctly changed

**Test as Admin:**
- Look for PUT request to `/api/addresses/{id}/set-default`
- Check that `isDefault: false` set on other addresses

---

### Test 5: Delete Address (Soft Delete)

**Steps:**
1. Click "Delete" button on an address
2. Confirmation dialog appears
3. Click "Confirm Delete"

**Expected Result:**
- Loading spinner
- Success message ("✅ Address deleted successfully")
- Address removed from list
- ✅ **PASS** if deletion works (soft delete, recoverable in DB)

**Test as Admin:**
- Database: SELECT * FROM user_addresses WHERE user_id = ? AND is_active = 0;
- Should show deleted address with `is_active = false`

---

### Test 6: Responsive Design - Mobile

**Steps:**
1. Open DevTools (F12)
2. Set viewport to mobile (375px width)
3. Navigate to Manage Addresses page
4. Test all interactions

**Expected Result:**
- Form fields stack vertically
- Address cards take full width
- Buttons are large and tappable (44px+ height)
- No horizontal scroll
- ✅ **PASS** if layout adapts to mobile

---

### Test 7: Address Selection in Booking (Once Integrated)

**Steps:**
1. Go to booking page
2. Select a service
3. Click "Select Address" button
4. Address dialog opens

**Expected Result:**
- Dialog shows all user addresses
- Default address pre-selected (radio button filled)
- Each address shows:
  - Label and type badge
  - Full address
  - City and pincode
  - Landmark if available
- ✅ **PASS** if dialog displays correctly

**Steps (continued):**
5. Select different address
6. Click "Confirm Address"
7. Dialog closes and address shown on booking page

**Expected Result:**
- Selected address displays in booking form
- Can click "Change Address" to select different one
- "Confirm & Book" button enabled
- ✅ **PASS** if selection works end-to-end

---

### Test 8: Validation Testing

**Test Case 1: Missing Required Fields**
1. Click "Add New Address"
2. Leave "Label" empty
3. Click "Save"
4. **Expected:** Error message under Label field
5. **✅ PASS:** Cannot submit without required fields

**Test Case 2: Invalid Pincode**
1. Fill form with all fields
2. Enter pincode with letters (e.g., "12AB34")
3. Click "Save"
4. **Expected:** Error "Pincode must be 6 digits"
5. **✅ PASS:** Validation catches format errors

**Test Case 3: Label Too Short**
1. Enter label "A" (less than 2 chars)
2. Click "Save"
3. **Expected:** Error "Label must be at least 2 characters"
4. **✅ PASS:** Validation enforces minimum length

---

### Test 9: Security - User Isolation

**Steps:**
1. Log in as User A
2. Add address (e.g., "My Home")
3. Open DevTools → Network tab
4. Copy the address ID (e.g., 5)
5. Open Incognito window, log in as User B
6. In DevTools, manually call: `fetch('/api/addresses/5').then(r => r.json())`

**Expected Result:**
- User B gets 404 or 403 error (cannot access User A's address)
- Response: `{ "error": "Unauthorized" }` or 404
- ✅ **PASS** if users cannot see each other's addresses

---

### Test 10: API Integration Test

**Using curl or Postman:**

```bash
# 1. Get all addresses
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/api/addresses

# Expected Response:
# {
#   "success": true,
#   "data": [
#     { "id": 1, "label": "My Home", "addressType": "Home", ... },
#     { "id": 2, "label": "Office", "addressType": "Office", ... }
#   ]
# }

# 2. Get default address
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/api/addresses/default

# Expected Response (single address object):
# {
#   "success": true,
#   "data": { "id": 1, "label": "My Home", "isDefault": true, ... }
# }

# 3. Set address as default
curl -X PUT \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/api/addresses/2/set-default

# Expected Response:
# { "success": true, "message": "Default address updated" }
```

---

## 🐛 Troubleshooting

### Issue: "500 Internal Server Error" when adding address

**Possible Causes:**
1. JWT token not sent or invalid
   - **Fix:** Check Authorization header in DevTools
   
2. Database migration not executed
   - **Fix:** Check if `user_addresses` table exists
   - **Command:** `SHOW TABLES;` in MySQL
   
3. User not found from JWT token
   - **Fix:** Verify JwtUtil.extractUserId() returns valid ID
   - **Debug:** Add logs in UserAddressController

**Check logs:**
```bash
# Backend logs
# Look for: org.springframework.security.access.AccessDeniedException
# or: java.lang.NullPointerException in UserAddressService
```

---

### Issue: Dialog opens but shows no addresses

**Possible Causes:**
1. AddressService.getAddresses() returns empty array
   - **Fix:** Verify user has addresses saved in database
   
2. Frontend service not calling correct endpoint
   - **Fix:** Check Network tab in DevTools
   - Should see GET request to `/api/addresses`

**Debug in Console:**
```javascript
// Check if service is working
angular.element(document.querySelector('[ng-app]')).injector().get('address.service').getAddresses().subscribe(console.log)
```

---

### Issue: Address forms not validating

**Possible Causes:**
1. ReactiveFormsModule not imported in UserModule
   - **Check:** src/app/user/user.module.ts
   - **Should have:** `import { ReactiveFormsModule } from '@angular/forms'`

2. Validators not applied correctly
   - **Check:** manage-addresses.component.ts
   - **Should have:** `Validators.required`, `Validators.minLength(2)`, etc.

---

### Issue: Styles not applying (form looks broken)

**Possible Causes:**
1. CSS file not linked
   - **Fix:** Check manage-addresses.component.css exists and is referenced
   
2. Material theme not loaded
   - **Fix:** Check custom-theme.scss is referenced in styles.css
   
3. Browser cache issue
   - **Fix:** Hard refresh (Ctrl+Shift+R)

---

## ✅ Test Report Template

Use this to record your testing:

```
Address System - Test Report
Date: _______________
Tester: ______________

Test Results:
- Test 1 (Access Page): PASS / FAIL / SKIP
- Test 2 (Add Address): PASS / FAIL / SKIP
- Test 3 (Edit Address): PASS / FAIL / SKIP
- Test 4 (Set Default): PASS / FAIL / SKIP
- Test 5 (Delete Address): PASS / FAIL / SKIP
- Test 6 (Mobile Layout): PASS / FAIL / SKIP
- Test 7 (Booking Integration): PASS / FAIL / SKIP
- Test 8 (Validation): PASS / FAIL / SKIP
- Test 9 (Security): PASS / FAIL / SKIP
- Test 10 (API Integration): PASS / FAIL / SKIP

Issues Found:
1. [Issue description...]
2. [Issue description...]

Overall Status:  PASS ✅ / FAIL ❌
```

---

## 🎯 Coverage Checklist

- [ ] User can access /addresses page
- [ ] User can add address (POST /api/addresses)
- [ ] User can view addresses (GET /api/addresses)
- [ ] User can edit address (PUT /api/addresses/:id)
- [ ] User can set default (PUT /api/addresses/:id/set-default)
- [ ] User can delete address (DELETE /api/addresses/:id)
- [ ] Address list displays correctly
- [ ] Validation prevents invalid entries
- [ ] Mobile experience is good
- [ ] Users cannot see other users' addresses
- [ ] Dialog works in booking flow
- [ ] All Material components render correctly
- [ ] Network requests include JWT token
- [ ] Database soft delete working
- [ ] Error messages display properly

---

## 📊 Performance Checks

```javascript
// Test in browser console:

// 1. Check load time
performance.mark('addresses-start');
fetch('/api/addresses', {
  headers: {'Authorization': 'Bearer YOUR_TOKEN'}
}).then(r => r.json())
  .then(() => {
    performance.mark('addresses-end');
    performance.measure('addresses-load', 'addresses-start', 'addresses-end');
    console.log(performance.getEntriesByName('addresses-load')[0].duration, 'ms');
  });

// Should load in < 500ms
```

---

## 🚀 Ready for Production?

Before deploying, ensure:

- [ ] All 10 tests PASS
- [ ] No console errors in DevTools
- [ ] Network requests all successful (2xx, 200)
- [ ] Soft delete works (DB shows is_active=false)
- [ ] JWT security working (unauthorized requests blocked)
- [ ] Responsive design tested on 3+ devices
- [ ] Booking + Address integration tested
- [ ] Database migrations executed
- [ ] Backend compiled without warnings

**✅ Once all above checked: Ready to deploy!**
