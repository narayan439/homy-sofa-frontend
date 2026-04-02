# Homy Sofa — Project Functionality Documentation

## 📋 Project Overview

**Homy Sofa** is a comprehensive **booking and management system** for home furniture service businesses. It provides:
- A **public-facing website** where customers can browse services and create bookings
- An **admin dashboard** for managing services, bookings, customers, payments, and site settings
- **File upload capability** for service images
- **Database persistence** with Flyway migrations
- **REST API backend** with Spring Boot

---

## 🎯 Core Features

### 1. **User/Public Site Features**

#### Home Page
- Display hero section with call-to-action
- Showcase featured services
- Company information and statistics

#### Services Browsing
- Browse all available services with descriptions and prices
- View service details (features, duration, category)
- Filter services by category or price range
- View service images

#### Booking Management
- Create new bookings with:
  - Customer details (name, phone, email)
  - Service selection
  - Preferred date and time slot
  - Delivery/Service address with location (lat/long)
  - Special instructions
  - Optional additional services with custom pricing
- View booking status in real-time
- Track multiple bookings

#### Additional Pages
- **About** — Company information and mission
- **Contact** — Contact form for inquiries
- **Services** — Detailed service listing with filters

---

### 2. **Admin Dashboard Features**

#### 🔐 Authentication
- Admin login with email and password
- Token-based authentication (JWT stored in localStorage)
- Automatic logout on token expiration
- Protected routes with `AdminGuard`

#### 📊 Dashboard Home
- Overview of key metrics:
  - Total bookings count
  - Pending bookings
  - Completed bookings
  - Total revenue
  - Average booking value
- Quick statistics and charts

#### 📱 Manage Bookings
- View all bookings in a data table with filtering
- Display booking information:
  - Customer name, phone, email
  - Service booked
  - Booking date and preferred service date
  - Time slot
  - Address with coordinates
  - Status (PENDING, APPROVED, COMPLETED, CANCELLED)
  - Total amount and payment status
  - Additional services (multiple services support)
- **Bulk Actions:**
  - Approve bookings
  - Mark as completed (auto-sets completion date to today)
  - Cancel bookings
  - Add new services to existing bookings
  - Update booking status with custom dialogs
- **Export to Excel** — Download booking data for reporting
- **Search & Filter** — By status, date range, customer

#### 👥 Manage Customers
- View customer database
- Display customer details:
  - Name, email, phone, address
  - Total bookings
  - Total spent
  - Join date
- **Customer Service History:**
  - View all services provided to each customer
  - Shows service date, type, status
  - Amount paid
  - Completion date (for COMPLETED services)
  - Additional services provided
- Track customer lifetime value

#### 🛠️ Manage Services
- **CRUD Operations:**
  - Create new services
  - Edit existing services
  - Delete inactive services
  - Toggle service active/inactive status
- Service properties:
  - Name and description
  - Price
  - Category
  - Duration (in minutes)
  - Features list
  - Service image upload
- Image management with preview
- Category-based organization

#### 💳 Manage Payments
- View payment records
- Track payment status:
  - Pending, Completed, Failed, Refunded
- Payment details:
  - Booking ID
  - Customer information
  - Amount
  - Payment method (Credit Card, Debit Card, UPI, Net Banking, Wallet)
  - Transaction ID
  - Payment date
- Payment reconciliation
- Export payment data

#### ⚙️ Settings
- Configure admin profile
- Update app settings
- Manage business information

---

## 🔄 Key Business Workflows

### **Workflow 1: Customer Creates a Booking**
1. Customer navigates to "Booking" page
2. Selects a service from dropdown
3. Enters personal details (name, phone, email)
4. Chooses preferred date and time slot
5. Enters delivery/service address
6. Optionally adds special instructions
7. Optionally adds multiple additional services with custom prices
8. Submits booking
9. Booking appears in admin dashboard as **PENDING**

### **Workflow 2: Admin Approves Booking**
1. Admin navigates to "Manage Bookings"
2. Finds booking in PENDING status
3. Clicks on booking or action button
4. Dialog opens with booking details
5. Option to add new services:
   - Select service from dropdown
   - Enter custom amount/price
   - Enter instruments/materials needed
   - Click "Add Service" to add to list
   - Repeat for multiple services
6. Clicks "Approve" button
7. Booking status changes to **APPROVED**
8. All services stored as JSON array in database

### **Workflow 3: Admin Marks Booking as Completed**
1. Admin navigates to "Manage Bookings"
2. Finds booking in APPROVED status
3. Clicks action button to complete
4. Dialog opens asking for total amount
5. Admin enters final amount
6. Clicks "Save"
7. System automatically sets **completion date to today**
8. Booking status changes to **COMPLETED**
9. Completion date stored in database

### **Workflow 4: Admin Manages Services**
1. Admin navigates to "Manage Services"
2. Can:
   - **Create:** Click "Add Service" button
     - Fill in name, description, price, category, features
     - Upload service image
     - Click "Save"
   - **Edit:** Click on service
     - Modify details
     - Update or replace image
     - Save changes
   - **Delete:** Click delete button
     - Service marked inactive or removed
3. Services immediately available to customers

### **Workflow 5: View Customer History**
1. Admin navigates to "Manage Customers"
2. Clicks on customer name
3. Customer detail panel opens showing:
   - All bookings/services provided
   - Service dates
   - Completion dates
   - Total spent
   - Additional services provided
4. Can filter by date range or service type

---

## 📊 Data Models

### **Booking Model**
```typescript
{
  id: number | string
  name: string                          // Customer name
  phone: string                         // Customer phone
  email: string                         // Customer email
  service: string                       // Primary service name
  date: string                          // Preferred service date (dd/mm/yyyy)
  message?: string                      // Additional notes
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED'
  timeSlot?: string                     // Preferred time
  totalAmount?: number                  // Total booking amount
  price?: number                        // Service price
  extraAmount?: number                  // Additional service amount
  address?: string                      // Service address
  latLong?: string                      // "lat,lon" format
  completionDate?: string               // Auto-set when marked COMPLETED
  additionalServicesJson?: string       // JSON array of multiple services
  customerId?: number | string
  paymentStatus: string                 // Payment status
  createdAt?: string
  updatedAt?: string
}
```

### **Service Model**
```typescript
{
  id: string
  name: string
  description: string
  price?: number | null
  imageUrl?: string
  imagePath?: string
  isActive: boolean
  icon?: string
  image?: string
  features?: string[]
  duration?: number                     // in minutes
  category?: string
  createdAt?: string
  updatedAt?: string
}
```

### **Customer Model**
```typescript
{
  id: string
  name: string
  email: string
  phone: string
  address?: string
  city?: string
  zipCode?: string
  totalBookings?: number
  totalSpent?: number
  joinDate?: string
  createdAt?: string
  updatedAt?: string
}
```

### **Payment Model**
```typescript
{
  id: string
  bookingId: string
  customerId: string
  amount: number
  paymentMethod: 'credit_card' | 'debit_card' | 'upi' | 'net_banking' | 'wallet'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  transactionId?: string
  createdAt?: string
  updatedAt?: string
}
```

---

## 🛠️ Technical Architecture

### **Frontend Stack**
- **Framework:** Angular 15 (TypeScript)
- **UI Library:** Angular Material
- **HTTP Client:** Angular HttpClient with Interceptors
- **State Management:** RxJS BehaviorSubject for reactive data flows
- **Routing:** Lazy-loaded feature modules (User & Admin)
- **Styling:** SCSS with custom theme

### **Backend Stack**
- **Framework:** Spring Boot (Java 17)
- **Build Tool:** Maven
- **Database:** MySQL
- **Migrations:** Flyway
- **File Storage:** Server filesystem (configurable via `app.upload.dir`)

### **API Architecture**
- **RESTful endpoints** for all resources
- **Authentication:** JWT token-based
- **Request/Response:** JSON format
- **Error Handling:** HTTP status codes and error messages
- **Base URL:** Configurable via environment files

### **Module Structure**

```
Frontend
├── app.module.ts (root module)
├── app-routing.module.ts (lazy-load user & admin)
├── user/ (public site - lazy-loaded)
│   ├── home/
│   ├── services/
│   ├── booking/
│   ├── contact/
│   └── about/
├── admin/ (admin dashboard - lazy-loaded)
│   ├── login/
│   ├── dashboard-home/
│   ├── manage-bookings/
│   ├── manage-customers/
│   ├── manage-services/
│   ├── manage-payments/
│   ├── settings/
│   └── dialogs/ (reusable modal components)
├── core/ (singleton services)
│   ├── guards/
│   │   └── admin.guard.ts
│   ├── interceptors/
│   │   └── auth.interceptor.ts
│   └── services/
│       ├── auth.service.ts
│       ├── booking.service.ts
│       ├── service.service.ts
│       ├── customer.service.ts
│       ├── payment.service.ts
│       └── excel-export.service.ts
├── models/ (TypeScript interfaces)
├── shared/ (reusable components & modules)
│   ├── components/
│   │   ├── navbar/
│   │   └── footer/
│   └── material/ (Material imports)
```

---

## 🔒 Security Features

1. **Authentication:**
   - JWT token-based login
   - Token stored in localStorage
   - Token attached to all requests via `auth.interceptor.ts`

2. **Authorization:**
   - `AdminGuard` protects admin routes
   - Only authenticated admins can access dashboard

3. **Data Protection:**
   - HTTPS recommended for production
   - Sensitive data (tokens) handled securely
   - Password handling via backend

---

## 🧰 Technician Features (new)

This release adds a Technician Management System to support field technicians handling assigned jobs. High-level features:

- Technician accounts: create/manage technicians (admin) and technician login (technician JWT stored in `localStorage`).
- Technician dashboard: shows Assigned Jobs, Today's Jobs, In Progress, Completed, and detailed job lists.
- Job lifecycle (technician): ASSIGNED -> IN_PROGRESS -> COMPLETED / CANCELLED. Technicians can start, complete (with completion details), or cancel assigned jobs.
- Additional services: only technicians can add additional services and prices during completion; these are stored on the booking (`additionalServicesJson`, `additionalServiceName`, `additionalServicePrice`).
- Data enrichment: booking responses returned to technicians include customer name/phone/email and address for display.
- APIs:
  - `POST /api/technician/login` — credentials -> token, id, name, email
  - `GET /api/technician/bookings?technicianId=<id>` — returns bookings assigned to technician (token accepted)
  - `PUT /api/technician/bookings/{id}/start` — mark job IN_PROGRESS (body may include `technicianId`)
  - `PUT /api/technician/bookings/{id}/complete` — accept payload `{ totalAmount, technicianNotes, additionalServiceName, additionalServicePrice, additionalServicesJson }` and mark COMPLETED
  - `PUT /api/technician/bookings/{id}/cancel` — technician cancel with optional `cancelReason`
- Backend model updates: `Booking` now includes `technicianId`, `technicianStatus` (ASSIGNED / IN_PROGRESS / COMPLETED / CANCELLED), and `technicianNotes`.
- Frontend changes: new `src/app/technician` feature module with login, dashboard, jobs list, and job dialog. `TechnicianService` wraps API calls and attaches `Authorization` header when token present.

---

## 📈 Key Features Summary

| Feature | User | Admin | Technician | Status |
|---------|------|-------|------------|--------|
| Browse Services | ✅ | ✅ | ❌ | Active |
| Create Booking | ✅ | ✅ | ❌ | Active |
| View Booking Status | ✅ | ✅ | ✅ | Active |
| Login | ❌ | ✅ | ✅ | Active |
| Manage Services | ❌ | ✅ | ❌ | Active |
| Manage Bookings | ❌ | ✅ | ✅ (limited) | Active |
| Manage Customers | ❌ | ✅ | ❌ | Active |
| Track Payments | ❌ | ✅ | ❌ | Active |
| Export Data (Excel) | ❌ | ✅ | ❌ | Active |
| Multiple Services per Booking | ✅ | ✅ | ✅ | Active |
| Auto Completion Date | ❌ | ✅ | ✅ | Active |
| Service Image Upload | ❌ | ✅ | ❌ | Active |
| Advanced Filtering | ❌ | ✅ | ❌ | Active |

---

## 🚀 Development & Deployment

### Development Setup
```bash
npm install                 # Install frontend dependencies
./mvnw spring-boot:run     # Run backend (Windows: .\mvnw.cmd)
npm start                  # Start Angular dev server
```

### Build for Production
```bash
ng build --prod            # Build Angular optimized bundle
./mvnw clean package       # Build backend JAR
```

### Docker Deployment
- Dockerfiles provided for both frontend and backend
- Nginx configuration for production serving
- Containerized deployment ready

---

## 📝 Database Schema

Key tables:
- `bookings` — stores all booking records with multiple services support
- `services` — service catalog
- `customers` — customer information
- `payments` — payment records
- `admins` — admin user accounts (if present)

**Special Columns:**
- `bookings.additional_services_json` — JSON array of multiple services
- `bookings.completion_date` — auto-set when marking booking complete
- `bookings.latLong` — stores coordinates for location mapping

---

## 🎓 Usage Tips for Developers

1. **Add New Feature:**
   - Create component in appropriate feature module
   - Use services from `core/services`
   - Follow lazy-loading pattern in routing

2. **API Integration:**
   - Use `ApiService` or specific service (`BookingService`, etc.)
   - Interceptor automatically adds auth token

3. **State Management:**
   - Use RxJS BehaviorSubject for reactive data
   - Subscribe in components using `async` pipe when possible

4. **Material Components:**
   - Import from `shared/material/material.module.ts`
   - Follows Material design guidelines

---

## 📞 Contact & Support

For detailed code examples and implementation guides, refer to the [copilot-instructions.md](.github/copilot-instructions.md) file.
