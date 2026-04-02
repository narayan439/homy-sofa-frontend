# Homy Sofa — Detailed Workflows & User Journeys

Complete step-by-step workflows for all major features and user roles.

## Table of Contents
1. [Public User Workflows](#public-user-workflows)
2. [Admin Workflows](#admin-workflows)
3. [Technician Workflows](#technician-workflows)
4. [Management Workflows](#management-workflows)
5. [Exception Handling Workflows](#exception-handling-workflows)

---

## 👤 Public User Workflows

### Workflow 1: Browse Services and Explore Offerings

**User Goal:** Discover available services and understand what the business offers

**Steps:**

1. **Access Home Page**
   - Open browser to `http://app.homysofa.com`
   - Landing page loads with hero section
   - Featured services carousel displays

2. **View Service Categories**
   - Scroll down to see service categories (Repair, Cleaning, Maintenance, etc.)
   - Click on category filter (optional)
   - Services filter by category

3. **Browse Service Cards**
   - Each card shows:
     - Service name
     - Short description
     - Price (if applicable)
     - Service image
     - Key features (e.g., "Fabric Repair", "Warranty 1 Year")
   - Hover over card for more details

4. **View Detailed Service Page**
   - Click on service card
   - Full service page opens showing:
     - High-quality service image
     - Full description
     - Price breakdown
     - Duration (e.g., "2-3 hours")
     - List of features with icons
     - Customer reviews/ratings (future)
     - "Book Now" button

5. **Return to Home**
   - Click "Services" in navbar
   - Returns to browsing page

**Success Criteria:**
- User finds desired service
- User understands service details
- User ready to proceed with booking

---

### Workflow 2: Create a New Booking

**User Goal:** Submit a booking request for a service

**Steps:**

1. **Navigate to Booking Page**
   - Click "Book Now" button (from service page OR navbar "Booking")
   - Booking form page loads

2. **Fill Service Selection**
   - Click "Select Service" dropdown
   - Choose service from list
   - Dropdown closes, service name displayed

3. **Enter Personal Information**
   - **Name field:**
     - Click input, type full name (e.g., "John Doe")
     - Validation: min 3 characters, max 100

   - **Phone field:**
     - Click input, type phone number (e.g., "+91-9999999999")
     - Validation: 10-15 digits, can contain +, -, spaces

   - **Email field:**
     - Click input, type email address
     - Validation: valid email format (user@example.com)

4. **Select Date and Time**
   - **Date picker:**
     - Click date field
     - Calendar widget opens
     - Cannot select past dates (validation)
     - Select desired date (e.g., 20/03/2024)

   - **Time slot dropdown:**
     - Click time slot
     - Available slots: 
       - 10:00 AM - 2:00 PM
       - 2:00 PM - 6:00 PM
       - 6:00 PM - 10:00 PM
     - Select preferred slot

5. **Enter Service Address**
   - **Address text field:**
     - Click and type address (e.g., "123 Main St, Delhi")
     - Component shows address autocomplete (optional)

   - **Map picker (for lat/long):**
     - Click map button
     - Google Maps opens
     - User clicks on location OR types address
     - Latitude and longitude auto-filled
     - Lat/Long format: "28.7041,77.1025"

6. **Add Additional Notes (Optional)**
   - Click "Special Instructions" textarea
   - Type any special requirements
   - Example: "Please call 10 minutes before arrival"
   - Max 500 characters

7. **Add Multiple Services (Optional)**
   - Click "+ Add More Services" button
   - New service selection row appears
   - Select service from dropdown
   - Can add unlimited services
   - If user later books, these stored as JSON array

8. **Review Booking Summary**
   - Summary panel shows:
     - Service name and price
     - Date and time slot
     - Address
     - Additional services (if any) with prices
     - **Total Amount:** Sum of all services
   - User verifies all details

9. **Submit Booking**
   - Click "Submit Booking" button
   - Form validates all required fields
   - If validation fails → error messages shown in red
   - If validation passes → booking submitted

10. **Booking Confirmation**
    - Success toast notification appears
    - Message: "Booking submitted successfully!"
    - Booking details displayed with:
      - **Booking ID:** Auto-generated
      - **Status:** "PENDING" (shown in yellow badge)
      - **Confirmation Message:** "Your booking will be reviewed by our team"
    - Option to:
      - Go back to home
      - View booking status
      - Book another service

11. **Follow-up Email (Optional)**
    - Customer receives confirmation email with:
      - Booking details
      - Booking ID for reference
      - Expected timeline
      - Contact information

**Success Criteria:**
- Booking created with PENDING status
- Booking ID assigned
- Admin sees booking in dashboard
- Customer receives confirmation

**Error Scenarios:**
| Error | Cause | Solution |
|-------|-------|----------|
| "Service required" | Service not selected | Select service from dropdown |
| "Invalid phone" | Phone < 10 digits | Enter valid phone number |
| "Invalid email" | Email format incorrect | Enter valid email |
| "Date in past" | Selected past date | Choose future date |
| Server error | Backend down | Try again later |

---

### Workflow 3: Track Booking Status

**User Goal:** Check status of submitted booking

**Steps:**

1. **Access Booking Status**
   - Option A: Click "Check Status" link (sent in email)
   - Option B: Go to `/user/booking` page
   - Option C: Enter booking ID manually

2. **Enter Booking Information**
   - Click "Enter Booking Details"
   - Form appears asking for:
     - **Email:** Associated with booking
     - **Booking ID:** (optional) or
     - **Phone:** (optional)
   - User enters any combination

3. **View Booking Status**
   - Click "Check Status" button
   - Backend queries bookings matching criteria
   - Booking displayed with:
     - **Status Badge:**
       - 🟡 PENDING (yellow)
       - 🟢 APPROVED (green)
       - 🔵 COMPLETED (blue)
       - 🔴 CANCELLED (red)
     - **Service Details:**
       - Service name
       - Scheduled date & time
       - Address
     - **Timeline:**
       - Created date
       - Approved date (if available)
       - Completion date (if completed)
     - **Amount Information:**
       - Quoted amount
       - Final amount (if completed)
       - Payment status

4. **Next Steps Display**
   - Based on status:
     - **PENDING:** "Your booking is being reviewed. Expected response within 24 hours."
     - **APPROVED:** "Your booking is confirmed! Technician will contact you soon."
     - **COMPLETED:** "Thank you for choosing us! Please check your email for invoice."
     - **CANCELLED:** "This booking was cancelled. Reason: [if provided]"

5. **Contact Support**
   - User can click "Contact Us" from status page
   - Redirects to contact form
   - Pre-fills fields if logged in

**Success Criteria:**
- User can find booking by email/phone
- Status clearly displayed
- Next steps communicated

---

### Workflow 4: Contact Support/Inquiry

**User Goal:** Send inquiry or feedback to business

**Steps:**

1. **Navigate to Contact Page**
   - Click "Contact Us" in navbar/footer
   - Contact page loads (`/user/contact`)

2. **View Contact Information**
   - Page displays:
     - Business address
     - Phone number
     - Email address
     - Business hours
     - Location map (optional)

3. **Fill Contact Form**
   - **Name field:**
     - Type full name

   - **Email field:**
     - Type email address
     - System may validate format

   - **Phone field:**
     - Type phone number

   - **Subject dropdown:**
     - Choose: Service Inquiry, Feedback, Complaint, Other
     - Default: "Service Inquiry"

   - **Message field:**
     - Click and type message
     - Min 20 characters, max 1000
     - Character counter shows remaining

4. **Submit Form**
   - Click "Send Message" button
   - Form validates:
     - All required fields filled → RED error text
     - Email format valid → "Invalid email" error
     - Message length 20-1000 → "Message too short" error
   - If validation passes → form submitted

5. **Confirmation**
   - Success toast: "Message sent successfully!"
   - Form clears
   - Message stored in database as CONTACT record
   - Status: "NEW"

6. **Follow-up Email (Optional)**
   - User receives email confirming receipt
   - Example: "Thank you for contacting us. We will respond within 24 hours."

7. **Admin Reviews Contact**
   - Admin sees new contact inquiry in dashboard (future feature)
   - Can respond and mark as resolved

**Success Criteria:**
- Contact form submitted
- Confirmation displayed to user
- Message stored for admin review

---

## 👨‍💼 Admin Workflows

### Workflow 5: Admin Login

**User Goal:** Authenticate and access admin dashboard

**Steps:**

1. **Navigate to Admin Login**
   - Go to `http://app.homysofa.com/admin/login`
   - Login page loads with:
     - Homy Sofa logo
     - Email input field
     - Password input field
     - "Login" button
     - "Forgot Password" link (future)

2. **Enter Credentials**
   - Click email field, type email (e.g., "admin@example.com")
   - Click password field, type password
   - Password field shows dots (masked)

3. **Submit Login**
   - Click "Login" button
   - Frontend validates:
     - Email format valid
     - Password not empty
   - Sends POST request: `/api/auth/login`

4. **Backend Authentication**
   - Backend checks:
     - Email exists in database
     - Password matches (bcrypt comparison)
   - If mismatch → returns 401 Unauthorized
   - If valid → generates JWT token with:
     - ID: admin ID
     - Email: admin email
     - Role: "ADMIN"
     - Expiry: 24 hours from now

5. **Store Token**
   - Frontend receives JWT token
   - Token stored in `localStorage` as:
     - Key: `"token"`
     - Value: JWT string

6. **Redirect to Dashboard**
   - Page redirects to `/admin/dashboard`
   - Dashboard index loads with admin data
   - Navigation shows admin username

7. **Verify Session**
   - Every subsequent API call includes token
   - Header: `Authorization: Bearer <token>`
   - Backend validates token:
     - Signature valid
     - Not expired
     - Role = "ADMIN"
   - If invalid → returns 401 → frontend redirects to login

**Success Criteria:**
- Token stored securely
- User authenticated
- Dashboard accessible
- Token expires after 24 hours

**Error Scenarios:**

| Error | Cause | User Sees | Solution |
|-------|-------|-----------|----------|
| Invalid credentials | Wrong email or password | "Invalid email or password" in red | Check credentials and retry |
| Server error | Backend down | "Unable to connect to server" | Try again later |
| Email not found | No account exists | "Email not registered" | Contact admin to create account |

---

### Workflow 6: View and Manage Bookings

**User Goal:** Review all bookings and take actions (approve, complete, cancel)

**Steps:**

1. **Navigate to Manage Bookings**
   - Click "Manage Bookings" in sidebar
   - Page loads with data table of all bookings

2. **View Booking Table**
   - Table columns:
     - ✓ (checkbox for multi-select)
     - **Booking ID** — Click to expand details
     - **Customer Name** — Clickable
     - **Service** — Service booked
     - **Date** — Preferred service date
     - **Status** — Color-coded badge (PENDING, APPROVED, COMPLETED, CANCELLED)
     - **Amount** — Total amount
     - **Payment Status** — PENDING/COMPLETED
     - **Actions** — Approve, Approve & Assign, Cancel, Complete
   - Table is sortable by column
   - Default sort: Date DESC (newest first)

3. **Filter Bookings**
   - **Filter by Status:**
     - Dropdown: All, PENDING, APPROVED, COMPLETED, CANCELLED
     - Table updates instantly

   - **Filter by Date Range:**
     - Date picker: From date and To date
     - Click "Filter" button
     - Table shows bookings within range

   - **Search by Customer:**
     - Type customer name in search box
     - Table filters as user types (real-time)

   - **Clear Filters:**
     - Click "Clear" button
     - All filters removed

4. **View Booking Details Dialog**
   - Click on booking row OR click "View Details" action button
   - Dialog opens showing:
     ```
     BOOKING DETAILS
     ─────────────────────
     Booking ID: #1001
     Status: PENDING
     Created: 15 Mar 2024
     
     CUSTOMER INFORMATION
     ─────────────────────
     Name: John Doe
     Phone: +91-9999999999
     Email: john@example.com
     
     SERVICE INFORMATION
     ─────────────────────
     Primary Service: Sofa Repair
     Price: ₹4,500
     Date: 20/03/2024
     Time Slot: 10:00 AM - 2:00 PM
     Duration: 2 hours
     
     ADDRESS
     ─────────────────────
     Address: 123 Main St, Delhi
     Coordinates: 28.7041, 77.1025
     [Show on Map button]
     
     ADDITIONAL DETAILS
     ─────────────────────
     Special Instructions: Call before arrival
     Additional Services: None
     
     AMOUNT & PAYMENT
     ─────────────────────
     Service Amount: ₹4,500
     Extra Amount: ₹0
     Total Amount: ₹4,500
     Payment Status: PENDING
     
     ACTIONS
     ─────────────────────
     [Approve] [Add Service] [Cancel] [Complete]
     ```

5. **Action: Approve Booking**
   - Click "Approve" button in dialog
   - Confirmation appears: "Approve this booking?"
   - Click "Yes, Approve"
   - Backend updates:
     - `bookings.status = "APPROVED"`
     - `bookings.updatedAt = NOW()`
   - Dialog closes and table refreshes
   - Status badge changes to green

6. **Action: Add Additional Service**
   - Click "Add Service" button in dialog
   - "Add Service" sub-dialog appears:
     ```
     ADD ADDITIONAL SERVICE TO BOOKING
     ─────────────────────────────────
     Select Service:
     [Dropdown showing:]
     - Sofa Repair
     - Cushion Replacement
     - Stain Removal
     - Polish & Protection
     
     Select: [Cushion Replacement]
     
     Custom Price (Optional):
     [₹500 ________]
     
     Materials/Instruments Needed (Optional):
     [Canvas, Thread, Padding...]
     
     [Add Service] [Cancel]
     ```
   - Admin selects service
   - Enters custom amount if different from default
   - Clicks "Add Service"
   - Service added to `additionalServicesJson` array
   - Amount updated in main booking

7. **Action: Assign Technician**
   - After approving, click "Assign Technician"
   - Options appear:
     - **Auto Assign:** System finds available technician (fewest jobs)
     - **Manual Assign:** Select technician from dropdown
   - Click "Assign"
   - Backend updates:
     - `bookings.technicianId = <id>`
     - `bookings.technicianStatus = "ASSIGNED"`
   - Status changes, technician name shown

8. **Action: Complete Booking**
   - Click "Complete" button
   - "Complete Booking" dialog appears:
     ```
     COMPLETE BOOKING
     ───────────────
     Booking ID: #1001
     
     Final Amount:
     [₹4500 ________] (default from approved amount)
     
     Completion Notes (Optional):
     [Work completed successfully, customer satisfied
      Sofa fabric restored, cushions replaced...]
     
     [Save] [Cancel]
     ```
   - Admin enters final amount (if different)
   - Adds completion notes
   - Clicks "Save"
   - Backend updates:
     - `bookings.status = "COMPLETED"`
     - `bookings.completionDate = TODAY()`
     - `bookings.totalAmount = <entered amount>`
     - Payment automatically marked COMPLETED

9. **Action: Cancel Booking**
   - Click "Cancel" button
   - Confirmation dialog:
     ```
     CANCEL BOOKING
     ─────────────
     Are you sure? This cannot be undone.
     
     Reason for Cancellation (Optional):
     [Customer requested cancellation
      Out of stock material
      Customer not available...]
     
     [Yes, Cancel] [No, Keep]
     ```
   - Admin enters reason
   - Clicks "Yes, Cancel"
   - Backend updates:
     - `bookings.status = "CANCELLED"`
     - `bookings.cancelReason = <reason>`
   - Customer notified via email (optional)

10. **Bulk Actions**
    - Select multiple bookings (checkboxes)
    - Bulk action dropdown appears:
      - "Approve All"
      - "Complete All"
      - "Cancel All"
    - Select action → confirmation → update all

11. **Export to Excel**
    - Click "Export" button
    - Filtered bookings exported to .xlsx file
    - Columns: ID, Customer, Service, Date, Status, Amount
    - Downloaded as `bookings_<date>.xlsx`

**Success Criteria:**
- All bookings visible in table
- Filters work correctly
- Actions update status
- Details dialog comprehensive
- Bulk operations functional

---

### Workflow 7: Manage Services

**User Goal:** Add, edit, and manage service catalog

**Steps:**

1. **Navigate to Manage Services**
   - Click "Manage Services" in sidebar
   - Page loads with service cards in grid layout

2. **View Services Grid**
   - Each service card shows:
     - Service image (thumbnail)
     - Service name
     - Price
     - Category
     - Active/Inactive badge
     - Actions: Edit, Delete, Toggle Active

3. **Create New Service**
   - Click "+ Add Service" button
   - "New Service" form dialog opens:
     ```
     ADD NEW SERVICE
     ───────────────
     
     Service Name:
     [Sofa Repair ________]
     
     Description:
     [Professional sofa repair with warranty
      ____________________________]
     
     Category:
     [Dropdown: Repair, Cleaning, Maintenance]
     [Repair]
     
     Price (₹):
     [4500 ________]
     
     Duration (minutes):
     [120 ________]
     
     Features (one per line):
     [Fabric Repair
      Spring Replacement
      Polish
      ____________________________]
     
     Service Image:
     [Choose File] [Upload Preview]
     [Image thumbnail shown after upload]
     
     [Save Service] [Cancel]
     ```

4. **Fill Service Details**
   - Enter service name (min 3 chars)
   - Enter description (max 500 chars)
   - Select category from dropdown
   - Enter price (optional, must be > 0)
   - Enter duration in minutes (optional)
   - Add 3-5 key features
   - Upload service image:
     - Max 5MB
     - Formats: JPG, PNG, JPEG
     - Image compressed before upload
     - Preview shown after upload

5. **Submit New Service**
   - Click "Save Service" button
   - Frontend validates all fields
   - Sends POST request: `/api/services`
   - Backend creates service:
     - Generates ID: "svc-<timestamp>"
     - Stores all fields
     - Default `isActive = true`
   - Dialog closes
   - New service appears in list
   - Success toast: "Service created successfully"

6. **Edit Existing Service**
   - Click "Edit" button on service card
   - Same form dialog opens with pre-filled fields
   - Admin can modify any field
   - Clicks "Save Service"
   - Backend updates service:
     - SQL: `UPDATE services SET ... WHERE id = ?`
     - Data persisted
   - Success toast: "Service updated successfully"

7. **Delete Service**
   - Click "Delete" button on service card
   - Confirmation dialog:
     ```
     DELETE SERVICE
     ──────────────
     Are you sure? This service will be:
     
     Option A: Marked as inactive (recommended)
     Option B: Permanently deleted
     
     [Mark Inactive] [Delete] [Cancel]
     ```
   - If "Mark Inactive":
     - `services.isActive = false`
     - Service hidden from public browsing
     - Still viewable in existing bookings
   - If "Delete":
     - Service permanently removed
   - Success toast

8. **Toggle Service Active/Inactive**
   - Click "Active/Inactive" button
   - Service status toggles
   - Backend immediately updates
   - Public site updates (services hidden if inactive)

**Success Criteria:**
- New services added to catalog
- Services editable
- Images upload correctly
- Inactive services hidden from public
- Service list refreshes after changes

---

### Workflow 8: Manage Customers

**User Goal:** View customer database and service history

**Steps:**

1. **Navigate to Manage Customers**
   - Click "Manage Customers" in sidebar
   - Page loads with customer list (table or cards)

2. **View Customers List**
   - Table columns:
     - **Name** — Customer name (clickable)
     - **Email** — Customer email
     - **Phone** — Contact number
     - **City** — Location
     - **Total Bookings** — Count of bookings
     - **Total Spent** — Lifetime spending (₹)
     - **Join Date** — Registration date
     - **Actions** — View Details, Send Message

3. **Filter and Search Customers**
   - **Search by Name:**
     - Type in search box
     - Results filter in real-time

   - **Filter by City:**
     - Dropdown: All Cities, Delhi, Mumbai, Bangalore, etc.
     - Table filters

   - **Sort by Column:**
     - Click column header (Total Spent, Join Date, etc.)
     - Table sorts ASC/DESC

   - **Date Range (Optional):**
     - From and To date pickers
     - Shows new customers in period

4. **View Customer Details**
   - Click "View Details" OR click customer name
   - Customer detail panel opens:
     ```
     CUSTOMER PROFILE
     ────────────────────────
     Name: John Doe
     Email: john@example.com
     Phone: +91-9999999999
     Address: 123 Main St                 [Edit]
     City: Delhi
     Zip Code: 110001
     
     CUSTOMER STATISTICS
     ────────────────────────
     Total Bookings: 5
     Total Spent: ₹25,000
     Average Booking: ₹5,000
     Join Date: 10 Jan 2024
     Last Booking: 15 Mar 2024
     
     SERVICE HISTORY
     ────────────────────────
     Booking 1: Sofa Repair | 15 Mar 2024 | COMPLETED | ₹5,000
     Booking 2: Carpet Cleaning | 08 Mar 2024 | COMPLETED | ₹3,500
     Booking 3: Upholstery Cleaning | 28 Feb 2024 | CANCELLED | ₹0
     ... (showing last 5, pagination available)
     
     [View All Bookings] [Send Message] [Close]
     ```

5. **View Full Service History (Optional)**
   - Click "View All Bookings"
   - Expanded history panel shows all bookings with:
     - Booking ID
     - Service name
     - Date booked
     - Status (with color)
     - Amount paid
     - Additional services
     - Notes/completion details

6. **Send Message to Customer (Optional)**
   - Click "Send Message" button
   - Email composition dialog appears:
     ```
     SEND EMAIL TO CUSTOMER
     ─────────────────────
     To: john@example.com
     Subject: [Select Template or Custom]
     
     Template Options:
     - Thank you for booking
     - Service reminder
     - Follow-up inquiry
     - Special offer
     - Custom
     
     Selected: [Thank you for booking]
     
     Body:
     [Dear John Doe,
     
     Thank you for choosing us! We appreciate your business...
     
     Best regards,
     Homy Sofa Team]
     
     [Send] [Cancel]
     ```
   - Admin can select template or write custom
   - Clicks "Send"
   - Email sent to customer
   - Entry logged in system

**Success Criteria:**
- Customer list searchable and filterable
- Service history visible
- Customer spending tracked
- Communication possible

---

### Workflow 9: Manage Technicians (Admin)

**User Goal:** Create, update, and manage technician accounts

**Steps:**

1. **Navigate to Manage Technicians**
   - Click "Manage Technicians" in sidebar (admin only)
   - Page loads with technician list

2. **View Technicians List**
   - Table/card view shows:
     - Name
     - Email
     - Phone
     - Specialization (e.g., "Sofa Repair")
     - Status (Active/Inactive)
     - Total Assigned Jobs
     - Completed Jobs
     - Actions

3. **Create New Technician**
   - Click "+ Add Technician" button
   - Form dialog appears:
     ```
     ADD NEW TECHNICIAN
     ──────────────────
     
     Name:
     [Rajesh Kumar ________]
     
     Email:
     [rajesh@example.com ________]
     
     Phone:
     [+91-9876543210 ________]
     
     Password:
     [Initial password set below]
     [Random123!]  [Regenerate]
     (Password emailed to technician)
     
     Specialization:
     [Sofa Repair, Cleaning, Maintenance]
     [Sofa Repair]
     
     Skills/Certifications (Optional):
     [Furniture restoration, High-end fabrics
      ____________________________]
     
     Status:
     [Active] [Inactive]
     
     [Create Technician] [Cancel]
     ```

4. **Fill Technician Information**
   - Enter name, email, phone
   - Password auto-generated (cryptographically random)
   - Admin can regenerate if needed
   - Select specialization
   - Add optional skills
   - Select active status

5. **Submit New Technician**
   - Click "Create Technician"
   - Backend validates:
     - Email unique (no duplicates)
     - Phone unique
     - All required fields present
   - Creates technician:
     - Password encoded (bcrypt)
     - Status set to "active"
     - Created date recorded
   - Password sent to technician via email:
     ```
     From: support@homysofa.com
     Subject: Your Technician Account Created
     
     Dear Rajesh Kumar,
     
     Your technician account has been created.
     Login at: http://app.homysofa.com/technician/login
     
     Email: rajesh@example.com
     Temporary Password: Random123!
     
     Please change your password after first login.
     
     Best regards,
     Admin Team
     ```

6. **Edit Technician**
   - Click "Edit" button
   - Form opens with pre-filled data
   - Can modify:
     - Name
     - Email
     - Phone
     - Specialization
     - Skills
     - Status
   - Password can be reset (generates new one)
   - Clicks "Save"
   - Backend updates technician record

7. **Reset Technician Password**
   - Click "Reset Password" button
   - Confirmation: "Generate new password for [name]?"
   - Click "Yes"
   - Backend generates new secure password
   - Password displayed to admin:
     ```
     New Password: SecurePass789!
     [Copy to Clipboard] [Close]
     ```
   - Admin manually communicates password to technician
   - OR system auto-emails new password

8. **Toggle Technician Status**
   - Click "Deactivate" or "Activate" button
   - Status toggles
   - Inactive technician cannot login
   - No new jobs assigned to inactive technician

9. **View Technician Performance**
   - Click technician name or "View Details"
   - Performance panel shows:
     - Total jobs assigned: 25
     - Jobs completed: 22
     - Jobs in progress: 2
     - Jobs cancelled: 1
     - Average rating: 4.8/5
     - Job completion rate: 88%
     - Average time to complete: 2.3 hours
     - Recent jobs (last 5)

10. **Delete Technician (Optional)**
    - Click "Delete" button
    - Confirmation: "Permanently remove technician?"
    - If "Yes":
      - Technician record marked deleted OR
      - All records purged depending on configuration
    - Existing job assignments remain (historical)

**Success Criteria:**
- Technicians created with auto-passwords
- Can be activated/deactivated
- Performance metrics visible
- Job assignments traceable

---

## 👨‍🔧 Technician Workflows

### Workflow 10: Technician Login

**User Goal:** Authenticate as technician and access job dashboard

**Steps:**

1. **Navigate to Technician Login**
   - Go to `http://app.homysofa.com/technician/login`
   - Login page loads (similar to admin login but for technicians)

2. **Enter Credentials**
   - Email: (provided by admin)
   - Password: (from initial setup or reset)
   - Click "Login"

3. **Backend Validates**
   - Checks email in technician table
   - Compares password (bcrypt)
   - If valid:
     - Generates JWT token with role = "TECHNICIAN"
     - Returns: token, id, email, name

4. **Token Stored**
   - Token saved in `localStorage`
   - TechnicianGuard allows navigation to `/technician/dashboard`

5. **Redirect to Dashboard**
   - Page shows:
     - Welcome message: "Welcome, Rajesh Kumar"
     - Job statistics cards
     - Job list by status

**Success Criteria:**
- Technician authenticated
- Token stored
- Dashboard accessible

---

### Workflow 11: View Assigned Jobs

**User Goal:** See all jobs available to work on

**Steps:**

1. **Technician Dashboard**
   - Logged-in technician sees dashboard
   - Statistics cards show:
     - Assigned Jobs: 8
     - Today's Jobs: 2
     - In Progress: 1
     - Completed (This Week): 3

2. **View Job Lists by Status**
   - **Assigned Jobs Tab:**
     - Shows jobs with status = "ASSIGNED"
     - Customer name, service, address, date
     - Action buttons: "Start Job", "View Details", "Cancel"

   - **Today's Jobs Tab:**
     - Only jobs scheduled for today
     - Sorted by time slot

   - **In Progress Tab:**
     - Jobs currently being worked on
     - Action buttons: "View Details", "Complete Job"

   - **Completed Tab:**
     - Jobs already completed
     - Shows completion date and amount
     - View receipt

3. **View Job Details**
   - Click "View Details" on any job
   - Detail panel shows:
     ```
     JOB DETAILS
     ──────────────
     Job ID: 1001
     Status: ASSIGNED / IN_PROGRESS / COMPLETED
     
     CUSTOMER INFO
     ──────────────
     Name: John Doe
     Phone: +91-9999999999
     Email: john@example.com
     
     SERVICE INFO
     ──────────────
     Service: Sofa Repair
     Scheduled Date: 20/03/2024
     Time Slot: 10:00 AM - 2:00 PM
     Address: 123 Main St, Delhi
     
     [Show Map] [Call Customer] [Send SMS]
     
     BOOKING DETAILS
     ──────────────
     Approved Amount: ₹4,500
     Service Details: Fabric repair, Spring replacement
     Special Instructions: Call before arrival
     Additional Services: None yet
     ```

**Success Criteria:**
- All assigned jobs visible
- Can filter by status
- Customer contact info available
- Job details clear

---

### Workflow 12: Start and Complete Jobs

**User Goal:** Update job status from ASSIGNED → IN_PROGRESS → COMPLETED

**Steps:**

1. **Start Job**
   - Technician clicks "Start Job" button
   - Confirmation: "Mark job as IN_PROGRESS?"
   - Clicks "Yes, Start"
   - Backend updates:
     - `booking.status = "IN_PROGRESS"`
     - `booking.technicianStatus = "IN_PROGRESS"`
   - Status changes on dashboard
   - Job moves to "In Progress" tab

2. **Complete Job with Details**
   - Technician clicks "Complete Job" button
   - "Job Completion" form appears:
     ```
     JOB COMPLETION
     ──────────────────
     Job ID: 1001
     Service: Sofa Repair
     Customer: John Doe
     
     COMPLETION INFORMATION
     ──────────────────────
     Final Amount (₹):
     [4500 ________] (default from approved)
     
     Work Completed:
     [✓] Sofa fabric repair
     [✓] Spring replacement
     [✓] Polish applied
     
     TECHNICIAN NOTES
     ──────────────────
     [Work completed successfully.
      Sofa fabric fully restored, springs replaced.
      Customer satisfied with results.
      ____________________________]
     
     ADD ADDITIONAL SERVICES (Optional)
     ──────────────────────────────────
     [ + Add Service ]
     
     Service Name: [Cushion Replacement]
     Price (₹): [500]
     [Add] [Remove]
     
     [Complete Job] [Cancel]
     ```

3. **Enter Completion Details**
   - Review or modify final amount
   - Type detailed notes of work completed
   - Optionally add "additional services" that were done on-site:
     - Service name (e.g., "Stain Removal")
     - Custom price (e.g., ₹1,500)
     - Added services stored as JSON array

4. **Submit Completion**
   - Click "Complete Job" button
   - Backend updates:
     - `booking.status = "COMPLETED"`
     - `booking.technicianStatus = "COMPLETED"`
     - `booking.completionDate = TODAY()`
     - `booking.totalAmount = <final amount>`
     - `booking.technicianNotes = <notes>`
     - `booking.additionalServicesJson = [...]`
   - Response includes completion receipt

5. **Completion Confirmation**
   - Toast notification: "Job completed successfully!"
   - Job moves to "Completed" tab
   - Completion receipt shown:
     ```
     JOB COMPLETION RECEIPT
     ─────────────────────
     Completion Date: 20/03/2024
     Time Completed: 2:30 PM
     
     Services Provided:
     - Sofa Repair: ₹4,500
     - Stain Removal: ₹1,500
     Total: ₹6,000
     
     Technician Notes:
     [Shown in receipt]
     
     Customer has been notified.
     [Print] [Share] [Close]
     ```

6. **Customer Notification (Optional)**
   - Customer receives email:
     ```
     From: support@homysofa.com
     Subject: Your Service Completed - Job #1001
     
     Dear John Doe,
     
     Your sofa repair service has been completed successfully!
     
     Service Details:
     - Primary: Sofa Repair - ₹4,500
     - Additional: Stain Removal - ₹1,500
     - Total: ₹6,000
     
     Technician Notes: [included]
     
     Payment due upon receipt of invoice.
     
     View receipt: [link]
     
     Best regards,
     Homy Sofa Team
     ```

**Success Criteria:**
- Job status updated correctly
- Completion notes recorded
- Additional services captured
- Receipt generated
- Customer notified

---

### Workflow 13: Cancel Job

**User Goal:** Cancel assigned job with reason

**Steps:**

1. **Request Job Cancellation**
   - Technician clicks "Cancel Job" button
   - "Cancel Job" confirmation dialog appears:
     ```
     CANCEL JOB
     ──────────
     Are you sure you want to cancel this job?
     
     Job ID: 1001
     Customer: John Doe
     Service: Sofa Repair
     
     REASON FOR CANCELLATION (Required)
     ─────────────────────────────────
     [Select reason:]
     - Customer not available
     - Customer requested
     - Equipment issue
     - Unable to reach customer
     - Other (please specify)
     
     [Reason selected: Customer not available]
     
     Additional Notes (Optional):
     [Customer postponed to next week
      ____________________________]
     
     [Cancel Job] [Keep Job] [Close]
     ```

2. **Provide Cancellation Reason**
   - Select reason from dropdown
   - Optionally add notes
   - Confirm: "Yes, Cancel Job"

3. **Backend Updates**
   - `booking.status = "CANCELLED"`
   - `booking.technicianStatus = "CANCELLED"`
   - `booking.cancelReason = <selected reason>`
   - `booking.technician Notes = <notes>`
   - Payment status remains unchanged

4. **Confirmation**
   - Toast: "Job cancelled successfully"
   - Job removed from dashboards
   - Admin notified (notifications feature)

5. **Customer Notification (Optional)**
   - Customer receives email about cancellation
   - Reason shown
   - Option to reschedule

**Success Criteria:**
- Job cancelled with reason
- Status updated
- Customer informed
- Job history preserved

---

## 📊 Management Workflows

### Workflow 14: Generate Reports (Admin)

**User Goal:** Export and analyze booking/customer data

**Steps:**

1. **Navigate to Reports**
   - Click "Reports" in admin dashboard (if available)
   - Or click "Export" in Manage Bookings

2. **Export Bookings to Excel**
   - Apply filters (optional):
     - Date range
     - Status
     - Customer name
   - Click "Export to Excel"
   - Browser downloads file: `bookings_<date>.xlsx`
   - File contains:
     - Headers: ID, Customer, Email, Phone, Service, Amount, Status, Date
     - Filtered booking rows
     - Summary row: Total Amount, Count, etc.

3. **Open in Excel/Google Sheets**
   - File opens in spreadsheet application
   - Data analyzed:
     - Pivot tables
     - Charts
     - Totals
     - Trends

**Success Criteria:**
- Export works correctly
- Filters applied
- Data accurate

---

## ❌ Exception Handling Workflows

### Workflow 15: Handle Booking Errors

**Scenarios and Resolutions:**

**Scenario 1: Customer forgets booking details**
- Customer tries to check status without info
- System shows error: "Email or booking ID required"
- Solution: Admin can search in database by phone number

**Scenario 2: Technician cannot reach customer**
- Technician tries to start job but no response
- Options:
  - Call customer (system provides phone)
  - Mark as "Customer not available"
  - Cancel job with reason

**Scenario 3: Service price changes mid-booking**
- Admin was updating service price
- Customer booking in progress
- Resolution:
  - Use price when customer submitted (not updated price)
  - Show warning: "Price may have changed"

**Scenario 4: Database connection lost during booking submission**
- Customer clicks "Submit Booking"
- Backend temporarily unavailable
- Frontend shows error: "Unable to submit booking. Please try again."
- Customer clicks retry
- System resubmits request
- Duplicate check in backend (if booking already created)

**Scenario 5: Payment not received but booking marked complete**
- Admin marks booking complete
- Payment status remains "PENDING"
- Admin can manually mark as completed in payment management
- OR generate invoice for customer to pay

---

**Last Updated:** March 2024

For more details, see [PROJECT_FUNCTIONALITY.md](PROJECT_FUNCTIONALITY.md), [API_REFERENCE.md](API_REFERENCE.md), and [ARCHITECTURE.md](ARCHITECTURE.md).
