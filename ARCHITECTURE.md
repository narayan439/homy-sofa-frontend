# Homy Sofa — System Architecture & Design Patterns

Complete technical architecture documentation for Homy Sofa.

## Table of Contents
1. [High-Level Architecture](#high-level-architecture)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Database Schema](#database-schema)
6. [Design Patterns](#design-patterns)
7. [Security Architecture](#security-architecture)
8. [Scalability & Performance](#scalability--performance)

---

## 🏗️ High-Level Architecture

### System Overview
```
┌─────────────────────────────────────────────────────────────┐
│                         HOMY SOFA                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐           ┌─────────────────────┐    │
│  │   FRONTEND       │           │   BACKEND           │    │
│  │  (Angular SPA)   │◄─────────►│  (Spring Boot)      │    │
│  │  - User Site     │    REST   │  - Services         │    │
│  │  - Admin Panel   │    API    │  - Controllers      │    │
│  │  - Tech Portal   │  (JSON)   │  - Business Logic   │    │
│  └──────────────────┘           └─────────────────────┘    │
│         │                               │                   │
│         │                               │                   │
│         ▼                               ▼                   │
│  ┌──────────────────┐           ┌─────────────────────┐    │
│  │   BROWSER/       │           │   MYSQL             │    │
│  │   STORAGE        │           │   DATABASE          │    │
│  │  - LocalStorage  │           │  - Bookings         │    │
│  │  - SessionStorage│           │  - Customers        │    │
│  │  - IndexedDB     │           │  - Services         │    │
│  └──────────────────┘           │  - Technicians      │    │
│                                  │  - Payments         │    │
│                                  │  - Addresses        │    │
│                                  └─────────────────────┘    │
│                                          ▲                  │
│                                          │                  │
│                                   ┌──────┴──────┐            │
│                                   │   Flyway    │            │
│                                   │ Migrations  │            │
│                                   └─────────────┘            │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           INFRASTRUCTURE                            │    │
│  │  - Nginx (Production Reverse Proxy)                │    │
│  │  - Docker (Containerization)                       │    │
│  │  - File Storage (uploads/backend)                  │    │
│  │  - JWT Authentication                             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🖥️ Frontend Architecture

### Angular Architecture Pattern: Multi-Tier

```
┌─────────────────────────────────────────────────────────────┐
│              APP MODULE (Root)                              │
│  - AppComponent                                             │
│  - AppRoutingModule (Top-level Routes)                      │
└────────┬──────────────────────────────┬────────────────────┘
         │                              │
    ┌────▼─────────┐          ┌────────▼─────────┐
    │ USER MODULE  │          │ ADMIN MODULE     │
    │ (Lazy)       │          │ (Lazy, Protected)│
    ├──────────────┤          ├──────────────────┤
    │ - Home       │          │ - Login          │
    │ - Services   │          │ - Dashboard      │
    │ - Booking    │          │ - Manage: Books, │
    │ - Contact    │          │   Services,      │
    │ - About      │          │   Customers,     │
    │              │          │   Payments,      │
    │ Routing      │          │   Technicians    │
    │ Guards: None │          │                  │
    │ (Public)     │          │ Routing Guards:  │
    │              │          │ AdminGuard       │
    └──────────────┘          └──────────────────┘

    ┌────────────────────────────────────┐
    │ TECHNICIAN MODULE (Lazy, Protected)│
    ├────────────────────────────────────┤
    │ - Login                            │
    │ - Dashboard                        │
    │ - Jobs List                        │
    │ - Job Details & Actions            │
    │                                    │
    │ Routing Guards:                    │
    │ TechnicianGuard                    │
    └────────────────────────────────────┘

    ┌────────────────────────────────────┐
    │ SHARED MODULE                      │
    ├────────────────────────────────────┤
    │ - Navbar Component                 │
    │ - Footer Component                 │
    │ - Shared Dialog Components         │
    │ - Material Module Barrel           │
    │ (Used by all modules)              │
    └────────────────────────────────────┘

    ┌────────────────────────────────────┐
    │ CORE MODULE (Singleton Services)   │
    ├────────────────────────────────────┤
    │ Services:                          │
    │ - AuthService (login)              │
    │ - BookingService (API)             │
    │ - ServiceService (CRUD)            │
    │ - CustomerService                  │
    │ - TechnicianService                │
    │ - PaymentService                   │
    │ - ExcelExportService               │
    │                                    │
    │ Guards:                            │
    │ - AdminGuard (authentication)      │
    │ - TechnicianGuard                  │
    │                                    │
    │ Interceptors:                      │
    │ - AuthInterceptor (add JWT token)  │
    │ - ErrorInterceptor                 │
    └────────────────────────────────────┘

    ┌────────────────────────────────────┐
    │ MODELS FOLDER                      │
    ├────────────────────────────────────┤
    │ TypeScript Interfaces:             │
    │ - admin.model.ts                   │
    │ - booking.model.ts                 │
    │ - customer.model.ts                │
    │ - service.model.ts                 │
    │ - technician.model.ts              │
    │ - payment.model.ts                 │
    └────────────────────────────────────┘
```

### Component Hierarchy Example: Admin Dashboard
```
AdminModule
├── DashboardLayout (smart)
│   ├── Navbar (presentational, shared)
│   └── Sidebar (smart)
│       ├── DashboardHome (smart)
│       │   ├── StatisticsCard (presentational)
│       │   ├── BarChart (presentational)
│       │   └── RecentBookingsList (presentational)
│       │
│       ├── ManageBookings (smart)
│       │   ├── BookingsTable (presentational)
│       │   ├── BookingDetailDialog (smart)
│       │   │   ├── StatusUpdateDialog (smart)
│       │   │   └── AddServiceDialog (smart)
│       │   └── FiltersPanel (presentational)
│       │
│       ├── ManageServices (smart)
│       │   ├── ServicesList (presentational)
│       │   ├── ServiceFormDialog (smart)
│       │   └── ImageUploadComponent (presentational)
│       │
│       ├── ManageCustomers (smart)
│       │   ├── CustomersList (presentational)
│       │   └── CustomerDetailPanel (smart)
│       │       └── ServiceHistoryTable (presentational)
│       │
│       └── ManageTechnicians (smart)
│           ├── TechniciansList (presentational)
│           └── TechnicianFormDialog (smart)
│
└── Footer (presentational, shared)
```

### Data Flow Pattern: Booking Management
```
┌─────────────────────────────────────────────────────────────┐
│ COMPONENT LAYER                                             │
│ ManageBookingsComponent                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ loadBookings()
                       │ updateStatus()
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ INJECTION LAYER                                             │
│ constructor(private bookingService: BookingService)        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ getAll(): Observable<Booking[]>
                       │ update(id, status): Observable<Booking>
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ SERVICE LAYER                                               │
│ BookingService                                              │
│ - Manages HTTP communication                                │
│ - Handles RxJS Observables                                  │
│ - Implements error handling                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP GET /api/bookings
                       │ HTTP PUT /api/bookings/{id}
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ INTERCEPTOR LAYER                                           │
│ AuthInterceptor                                             │
│ - Attaches JWT token to headers                             │
│ - Handles request/response                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Authorization: Bearer <token>
                       │ Content-Type: application/json
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND API                                                 │
│ GET/PUT /api/bookings                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Response: Booking[] or Booking
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ VIEW LAYER                                                  │
│ ManageBookings Component Template                           │
│ - Table with booking data                                   │
│ - Status badges                                             │
│ - Action buttons                                            │
│ - Dialogs for editing                                       │
└─────────────────────────────────────────────────────────────┘
```

### Routing Architecture
```
AppRoutingModule
├── User Module (lazy-loaded)
│   ├── /user/home
│   ├── /user/services
│   ├── /user/booking
│   ├── /user/contact
│   └── /user/about
│
├── Admin Module (lazy-loaded, protected by AdminGuard)
│   ├── /admin/login
│   ├── /admin/dashboard (protected)
│   ├── /admin/manage-bookings (protected)
│   ├── /admin/manage-services (protected)
│   ├── /admin/manage-customers (protected)
│   ├── /admin/manage-payments (protected)
│   ├── /admin/manage-technicians (protected)
│   └── /admin/settings (protected)
│
└── Technician Module (lazy-loaded, protected by TechnicianGuard)
    ├── /technician/login
    ├── /technician/dashboard (protected)
    ├── /technician/jobs (protected)
    ├── /technician/job/{id} (protected)
    └── /technician/job/{id}/complete (protected)
```

---

## 🔧 Backend Architecture

### Spring Boot Architectural Layers
```
┌─────────────────────────────────────────────────────────────┐
│              SPRING BOOT APPLICATION                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ PRESENTATION LAYER (REST Controllers)              │    │
│  │ - AuthController                                   │    │
│  │ - BookingController                                │    │
│  │ - ServiceController                                │    │
│  │ - CustomerController                               │    │
│  │ - TechnicianController                             │    │
│  │ - PaymentController                                │    │
│  │ - ContactController                                │    │
│  │ - EmailController                                  │    │
│  │                                                    │    │
│  │ Responsibilities:                                  │    │
│  │ - Accept HTTP requests                             │    │
│  │ - Parameter validation & validation                │    │
│  │ - Delegate to services                             │    │
│  │ - Return JSON responses                            │    │
│  │ - Handle CORS                                      │    │
│  └────────────────────────────────────────────────────┘    │
│                     ▲                                        │
│                     │ depend on                              │
│                     ▼                                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │ BUSINESS LOGIC LAYER (Services)                    │    │
│  │ - BookingService                                   │    │
│  │ - ServiceEntityService                             │    │
│  │ - CustomerService                                  │    │
│  │ - TechnicianService                                │    │
│  │ - AssignmentService (auto-assign technicians)      │    │
│  │ - EmailService (notifications)                     │    │
│  │ - ExcelExportService (reporting)                   │    │
│  │                                                    │    │
│  │ Responsibilities:                                  │    │
│  │ - Business rules & validation                      │    │
│  │ - Data transformation                              │    │
│  │ - Transaction management                           │    │
│  │ - Orchestration of operations                      │    │
│  └────────────────────────────────────────────────────┘    │
│                     ▲                                        │
│                     │ depend on                              │
│                     ▼                                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │ DATA ACCESS LAYER (Repositories)                   │    │
│  │ - BookingRepository (extends JpaRepository)        │    │
│  │ - ServiceRepository                                │    │
│  │ - CustomerRepository                               │    │
│  │ - TechnicianRepository                             │    │
│  │ - AddressRepository                                │    │
│  │ - PaymentRepository                                │    │
│  │ - AdminRepository                                  │    │
│  │ - ContactRepository                                │    │
│  │                                                    │    │
│  │ Responsibilities:                                  │    │
│  │ - CRUD operations                                  │    │
│  │ - Custom queries (findByX, etc.)                   │    │
│  │ - Database interaction                             │    │
│  │ - Connection pooling                               │    │
│  └────────────────────────────────────────────────────┘    │
│                     ▲                                        │
│                     │ depend on                              │
│                     ▼                                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ENTITY / MODEL LAYER (JPA Entities)                │    │
│  │ @Entity Classes:                                   │    │
│  │ - Booking (JPA mapped)                             │    │
│  │ - ServiceEntity                                    │    │
│  │ - Customer                                         │    │
│  │ - Technician                                       │    │
│  │ - Address                                          │    │
│  │ - Payment                                          │    │
│  │ - AdminUser                                        │    │
│  │ - Contact                                          │    │
│  │                                                    │    │
│  │ - DTOs (Data Transfer Objects)                     │    │
│  │   - AuthRequest/AuthResponse                       │    │
│  │   - BookingDTO                                     │    │
│  │                                                    │    │
│  │ Responsibilities:                                  │    │
│  │ - Domain objects                                   │    │
│  │ - Database mapping                                 │    │
│  │ - Data validation (annotations)                    │    │
│  │ - ORM relationships                                │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ CROSS-CUTTING CONCERNS                             │    │
│  │ Security:                                          │    │
│  │ - JwtUtil (token generation/validation)            │    │
│  │ - PasswordEncoder (bcrypt)                         │    │
│  │ - Spring Security Config                          │    │
│  │                                                    │    │
│  │ Persistence:                                       │    │
│  │ - Flyway (database migrations)                     │    │
│  │ - Hibernate (ORM)                                  │    │
│  │                                                    │    │
│  │ Exception Handling:                                │    │
│  │ - Custom exceptions                                │    │
│  │ - Global exception handler                         │    │
│  │                                                    │    │
│  │ Configuration:                                     │    │
│  │ - CorsConfig                                       │    │
│  │ - SecurityConfig                                   │    │
│  │ - JpaConfig                                        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
          │                                        │
          │                                        │
          ▼                                        ▼
    ┌──────────┐                          ┌──────────────┐
    │ DATABASE │                          │ FILE SYSTEM  │
    │ (MySQL) │                          │ (uploads/)   │
    └──────────┘                          └──────────────┘
```

### Service Dependencies Example: BookingService
```
BookingService
├── BookingRepository (CrudRepository)
├── CustomerRepository
├── ServiceRepository
├── AddressRepository
├── EmailService (for notifications)
├── AssignmentService (for technician assignment)
└── (Can be injected  in controllers)
    └── BookingController uses BookingService
```

### Database Access Pattern: JPA with Custom Queries
```
Interface: BookingRepository extends JpaRepository<Booking, Long>

Built-in methods (automatic):
- findAll() → returns List<Booking>
- findById(id) → returns Optional<Booking>
- save(booking) → returns saved Booking
- delete(booking) → void
- count() → returns Long

Custom Query Methods (auto-generated):
- findByEmail(email) → List<Booking>
- findByStatus(status) → List<Booking>
- findByCustomerId(customerId) → List<Booking>
- findByTechnicianId(technicianId) → List<Booking>
- findByDateBetween(from, to) → List<Booking>

@Query Annotations (custom SQL):
@Query("SELECT b FROM Booking b WHERE b.status = ?1 AND b.date >= ?2")
List<Booking> findApprovedAfter(String status, LocalDate date);
```

---

## 📊 Data Flow Diagrams

### Workflow 1: Customer Creates a Booking
```
┌──────────────────────────────────────────────────────────┐
│ CUSTOMER USING PUBLIC SITE                               │
│ (User/Booking Page)                                      │
└──────────────┬───────────────────────────────────────────┘
               │ 1. Click "Book Service"
               ▼
┌──────────────────────────────────────────────────────────┐
│ BOOKING FORM (Angular Component)                         │
│ - Select service (calls ServiceService.getActive())      │
│ - Fill personal details                                  │
│ - Choose date/time                                       │
│ - Enter address (stores lat/long)                        │
│ - Optionally add multiple services                       │
│ - Submit form                                            │
└──────────────┬───────────────────────────────────────────┘
               │ 2. POST /api/bookings
               │    {name, phone, email, service, date, ...}
               ▼
┌──────────────────────────────────────────────────────────┐
│ SPRING BOOT BACKEND                                      │
│ BookingController.create()                               │
│ ├─ Validate input                                        │
│ ├─ Find or create customer (by phone then email)         │
│ ├─ Find service by name                                  │
│ ├─ Create Address and Booking records                    │
│ ├─ Set booking status = "PENDING"                        │
│ └─ Return saved booking with ID                          │
└──────────────┬───────────────────────────────────────────┘
               │ 3. Response: Booking (id, customerId, status)
               ▼
┌──────────────────────────────────────────────────────────┐
│ DATABASE UPDATES                                         │
│ customers table:                                         │
│ ├─ INSERT (name, phone, email) if new                    │
│ └─ UPDATE total_bookings = total_bookings + 1            │
│                                                          │
│ bookings table:                                          │
│ ├─ INSERT (customerId, service, date, amount, ...)       │
│ └─ status = "PENDING"                                    │
│                                                          │
│ addresses table:                                         │
│ └─ INSERT (bookingId, address_text, lat_long)            │
└──────────────┬───────────────────────────────────────────┘
               │ 4. Booking now visible in admin dashboard
               │    as "PENDING" in red badge
               ▼
┌──────────────────────────────────────────────────────────┐
│ ADMIN DASHBOARD (Angular)                                │
│ ManageBookingsComponent                                  │
│ - Polls /api/bookings regularly                          │
│ - Shows new booking marked PENDING                       │
│ - Admin can click to approve, add services, or cancel    │
└──────────────────────────────────────────────────────────┘
```

### Workflow 2: Admin Approves Booking & Assigns Technician
```
┌──────────────────────────────────────────────────────────┐
│ ADMIN IN MANAGE BOOKINGS                                 │
│ Clicks on PENDING booking row                            │
└──────────────┬───────────────────────────────────────────┘
               │ 1. Click booking or action button
               ▼
┌──────────────────────────────────────────────────────────┐
│ BOOKING DETAIL DIALOG OPENS                              │
│ - Shows customer details (name, phone, email)            │
│ - Shows service & address                                │
│ - "Add Additional Service" button                        │
│ - "Approve" button                                       │
└──────────────┬───────────────────────────────────────────┘
               │ 2. Optional: Add multiple services
               │    (serviceName, price)
               ▼
┌──────────────────────────────────────────────────────────┐
│ POST /api/bookings/{id}/additional-service              │
│ {serviceName: "Fabric Protector", price: 500}           │
│ ├─ Service added to additionalServicesJson              │
│ └─ Booking.extraAmount updated                          │
└──────────────┬───────────────────────────────────────────┘
               │ 3. Admin clicks "Approve"
               ▼
┌──────────────────────────────────────────────────────────┐
│ PUT /api/bookings/{id}                                   │
│ {status: "APPROVED", totalAmount: 5500}                 │
│ ├─ Update booking record in database                     │
│ └─ Return updated booking                                │
└──────────────┬───────────────────────────────────────────┘
               │ 4. Admin assigns technician
               │    (via "Assign Technician" button)
               ▼
┌──────────────────────────────────────────────────────────┐
│ PUT /api/admin/bookings/{id}/assign                      │
│ (Auto-assignment service)                                │
│ ├─ Find available technician (minimum jobs assigned)     │
│ ├─ Update booking.technicianId                           │
│ ├─ Update booking.technicianStatus = "ASSIGNED"          │
│ └─ Return assigned technician info                       │
└──────────────┬───────────────────────────────────────────┘
               │ 5. DATABASE UPDATES
               ▼
┌──────────────────────────────────────────────────────────┐
│ bookings table:                                          │
│ ├─ status = "APPROVED"                                   │
│ ├─ technicianId = <selected tech id>                     │
│ ├─ technicianStatus = "ASSIGNED"                         │
│ ├─ totalAmount = 5500                                    │
│ └─ additionalServicesJson = "[...]"                      │
└──────────────────────────────────────────────────────────┘
```

### Workflow 3: Technician Completes Job
```
┌──────────────────────────────────────────────────────────┐
│ TECHNICIAN LOGIN                                         │
│ /technician/login                                        │
│ ├─ POST credentials (email, password)                    │
│ ├─ Backend validates & returns JWT token                 │
│ └─ Token stored in localStorage                          │
└──────────────┬───────────────────────────────────────────┘
               │ Token used in all subsequent requests
               ▼
┌──────────────────────────────────────────────────────────┐
│ TECHNICIAN DASHBOARD                                     │
│ GET /api/technician/bookings?technicianId=<id>          │
│ ├─ Authorization header: Bearer <token>                  │
│ ├─ Returns bookings assigned to this technician          │
│ │  status = ASSIGNED, IN_PROGRESS, COMPLETED             │
│ └─ Shows job lists by status                             │
└──────────────┬───────────────────────────────────────────┘
               │ 2. Technician clicks "Start Job"
               ▼
┌──────────────────────────────────────────────────────────┐
│ PUT /api/technician/bookings/{id}/start                  │
│ {technicianId: <id>}                                     │
│ ├─ Validate technician matches booking.technicianId      │
│ ├─ Update bookings.technicianStatus = "IN_PROGRESS"      │
│ └─ Return success                                        │
└──────────────┬───────────────────────────────────────────┘
               │ Job dashboard shows as "In Progress"
               │ 3. Tech works on job...
               │ 4. Clicks "Complete Job"
               ▼
┌──────────────────────────────────────────────────────────┐
│ JOB COMPLETION DIALOG                                    │
│ - Enter total amount (if different from approved)        │
│ - Enter technician notes                                 │
│ - Option to add additional services on-site              │
│   (e.g., "Stain Removal: 1500 Rs")                       │
│ - Submit form                                            │
└──────────────┬───────────────────────────────────────────┘
               │ 5. PUT /api/technician/bookings/{id}/complete
               ▼
┌──────────────────────────────────────────────────────────┐
│ {                                                        │
│   technicianId: <id>,                                    │
│   totalAmount: 6000,                                     │
│   technicianNotes: "Job completed successfully",         │
│   additionalServiceName: "Stain Removal",                │
│   additionalServicePrice: 1500,                          │
│   additionalServicesJson: "[{...}]"                      │
│ }                                                        │
└──────────────┬───────────────────────────────────────────┘
               │ Backend validates & updates
               ▼
┌──────────────────────────────────────────────────────────┐
│ bookings table:                                          │
│ ├─ technicianStatus = "COMPLETED"                        │
│ ├─ status = "COMPLETED"                                  │
│ ├─ completionDate = TODAY                                │
│ ├─ totalAmount = 6000 (updated)                          │
│ ├─ technicianNotes = "..."                               │
│ ├─ additionalServiceName = "Stain Removal"               │
│ ├─ additionalServicePrice = 1500                         │
│ └─ additionalServicesJson = "[{...}]"                    │
└──────────────┬───────────────────────────────────────────┘
               │ 6. Admin sees booking as COMPLETED
               │    Payment marked COMPLETED
               ▼
┌──────────────────────────────────────────────────────────┐
│ NOTIFICATIONS (Email, Optional)                          │
│ - Customer: Job completed notification (optional)        │
│ - Admin: Job completion receipt (optional)               │
└──────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Entity Relationships
```
┌──────────────────┐
│    CUSTOMER      │
├──────────────────┤
│ id (PK)          │
│ name             │
│ email            │
│ phone            │
│ address          │
│ city             │
│ zipCode          │
│ totalBookings    │
│ totalSpent       │
│ joinDate         │
│ createdAt        │
│ updatedAt        │
└──────────────────┘
       │  1:N
       │
       ▼
┌──────────────────┐
│    BOOKING       │ 1:N
├──────────────────┤
│ id (PK)          │────────────┐
│ customerId (FK)  │            │
│ name             │            │
│ email            │            │
│ phone            │            │
│ service          │            │ 1:N ┌──────────────┐
│ date             │            │     │   ADDRESS    │
│ message          │            │     ├──────────────┤
│ status           │            └────►│ id (PK)      │
│ timeSlot         │                  │ bookingId(FK)│
│ totalAmount      │                  │ addressText  │
│ price            │                  │ latLong      │
│ extraAmount      │                  └──────────────┘
│ address          │
│ latLong          │
│ technicianId (FK)│──────┐
│ technicianStatus │      │
│ completionDate   │      │ N:1
│ additionalSrv... │      │
│ paymentStatus    │      ▼
│ createdAt        │  ┌──────────────┐
│ updatedAt        │  │ TECHNICIAN   │
└──────────────────┘  ├──────────────┤
       │              │ id (PK)      │
       │ 1:N          │ name         │
       │              │ email        │
       ▼              │ phone        │
┌──────────────────┐  │ password     │
│   PAYMENT        │  │ specializ... │
├──────────────────┤  │ isActive     │
│ id (PK)          │  │ createdAt    │
│ bookingId (FK)   │  │ updatedAt    │
│ customerId (FK)  │  └──────────────┘
│ amount           │
│ paymentMethod    │
│ status           │
│ transactionId    │
│ createdAt        │
│ updatedAt        │
└──────────────────┘

┌──────────────────┐
│  SERVICE         │
├──────────────────┤
│ id (PK)          │
│ name             │
│ description      │
│ price            │
│ category         │
│ duration         │
│ features         │
│ imageUrl         │
│ imagePath        │
│ isActive         │
│ createdAt        │
│ updatedAt        │
└──────────────────┘

┌──────────────────┐
│  ADMIN_USER      │
├──────────────────┤
│ id (PK)          │
│ email            │
│ password         │
│ name             │
│ createdAt        │
│ updatedAt        │
└──────────────────┘

┌──────────────────┐
│  CONTACT         │
├──────────────────┤
│ id (PK)          │
│ name             │
│ email            │
│ phone            │
│ subject          │
│ message          │
│ status           │
│ createdAt        │
│ updatedAt        │
└──────────────────┘
```

### SQL Indexes
```sql
-- Performance optimization
CREATE INDEX idx_booking_status ON bookings(status);
CREATE INDEX idx_booking_date ON bookings(date);
CREATE INDEX idx_booking_customer ON bookings(customerId);
CREATE INDEX idx_booking_technician ON bookings(technicianId);
CREATE INDEX idx_customer_email ON customers(email);
CREATE INDEX idx_customer_phone ON customers(phone);
CREATE INDEX idx_technician_email ON technicians(email);
CREATE INDEX idx_address_booking ON addresses(bookingId);
```

---

## 🎨 Design Patterns

### 1. MVC Pattern
- **Model:** TypeScript interfaces (Booking, Service, Customer, etc.)
- **View:** Angular templates (HTML with data binding)
- **Controller:** Components with business logic

### 2. Service Layer Pattern
- Services encapsulate business logic
- Controllers delegate to services
- Services handle HTTP communication
- Example: `BookingService` → `BookingRepository` → Database

### 3. Dependency Injection
- Angular uses constructor injection
- Spring uses `@Autowired` annotation
- Loose coupling between components
- Easy to test with mocks

### 4. Repository Pattern
- Abstract database access
- JpaRepository provides CRUD operations
- Custom queries with findByX methods
- Example: `interface BookingRepository extends JpaRepository<Booking, Long>`

### 5. Factory Pattern
- Services create entities
- Example: `BookingService.create()` uses `CustomerService.findOrCreate()`

### 6. Observable/RxJS Pattern
- Services return Observables
- Components subscribe with async pipe or manually
- Better memory management with unsubscribe

```typescript
// Service returns Observable
bookingService.getAll(): Observable<Booking[]>

// Component uses it
this.bookings$ = this.bookingService.getAll();

// Template uses async pipe (auto unsubscribe)
<app-booking-list [bookings]="bookings$ | async"></app-booking-list>
```

### 7. Lazy Loading Pattern
- User, Admin, and Technician modules loaded on demand
- Reduces initial bundle size
- Better performance

### 8. Guard Pattern (Angular)
- `AdminGuard` protects admin routes
- `TechnicianGuard` protects technician routes
- Redirects unauthenticated users to login

### 9. Interceptor Pattern
- `AuthInterceptor` adds JWT token to all requests
- `ErrorInterceptor` handles global errors
- Centralized cross-cutting concerns

### 10. Adapter Pattern
- API responses adapted to component models
- Example: Backend returns `{bookingId: 1, ...}`, frontend normalizes to component format

---

## 🔒 Security Architecture

### Authentication Flow
```
┌─ Client (Browser) ─────────────────────────────────────────┐
│                                                             │
│  1. User enters email & password                            │
│  2. Component calls AuthService.login(email, password)      │
│  3. POST /api/auth/login {email, password}                  │
│                                                             │
└─────────────────────────┬─────────────────────────────────┘
                          │
                          ▼
              ┌─ Backend ────────────────────┐
              │                              │
              │ AuthController.login()       │
              │ ├─ Find user by email        │
              │ ├─ Match password (bcrypt)   │
              │ ├─ Generate JWT token        │
              │ │  (id, email, role, exp)    │
              │ └─ Return token              │
              │                              │
              └────────────┬─────────────────┘
                           │
                           ▼
┌─ Client ──────────────────────────────────────────────────┐
│                                                            │
│ 4. Response: {token, id, email, name}                    │
│ 5. Store token in localStorage                            │
│ 6. localStorage.setItem('token', token)                   │
│ 7. Redirect to dashboard                                  │
│                                                            │
│ Subsequent Requests:                                      │
│ 8. AuthInterceptor intercepts all requests                │
│ 9. Attaches Authorization header:                         │
│    Authorization: Bearer <token>                          │
│ 10. All API calls include token                           │
│                                                            │
└────────────────┬──────────────────────────────────────────┘
                 │
                 ▼
    ┌─ Backend ────────────────────────┐
    │                                  │
    │ JwtUtil.validateToken(token)     │
    │ ├─ Verify signature               │
    │ ├─ Check expiration               │
    │ ├─ Extract claims (id, role)      │
    │ └─ Allow request if valid         │
    │                                  │
    │ If invalid/expired:               │
    │ ├─ Return 401 Unauthorized        │
    │ └─ Client redirects to login      │
    │                                  │
    └──────────────────────────────────┘
```

### Authorization (Role-Based Access Control)
```
┌─ Admin Routes ────────────────────────────┐
│ /admin/* → Requires role = "ADMIN"        │
│ Enforced by: AdminGuard (Angular)         │
│ Backend: JWT token role claim checked     │
└───────────────────────────────────────────┘

┌─ Technician Routes ───────────────────────┐
│ /technician/* → Requires role = "TECHNICIAN"
│ Enforced by: TechnicianGuard (Angular)    │
│ Backend: JWT token role claim checked     │
└───────────────────────────────────────────┘

┌─ Public Routes ───────────────────────────┐
│ /user/* → No authentication required      │
│ /api/auth/login → Public endpoint         │
│ /api/services/active → Public endpoint    │
└───────────────────────────────────────────┘
```

### Password Security
```
Password Lifecycle:
1. User sets password during registration
2. Password sent over HTTPS (not HTTP)
3. Backend receives password
4. Password encoded using BCrypt with salt
5. Hashed password stored in database
6. Original password NEVER stored
7. Plain password NOT logged
8. Password reset generates new encoded password
```

### Data Protection
```
Sensitive Data Handling:
┌────────────────────────────────────────────┐
│ CUSTOMER DATA                              │
├────────────────────────────────────────────┤
│ Phone: Only visible to admin & technician │
│ Email: Only visible to admin & booking    │
│        owner                              │
│ Address: Only visible to admin &          │
│         assigned technician               │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ PAYMENT DATA                               │
├────────────────────────────────────────────┤
│ Transaction ID: Encrypted/hashed           │
│ Payment Method: Logged but not card full   │
│ Amount: Only visible to admin              │
└────────────────────────────────────────────┘
```

### CORS (Cross-Origin Resource Sharing)
```
Frontend: http://localhost:4200
Backend: http://localhost:8080

CORS Configuration:
├─ Allowed Origins: frontend domain only
├─ Allowed Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
├─ Allowed Headers: Content-Type, Authorization
├─ Max Age: 3600 seconds
└─ Credentials: true (for secure cookies)
```

---

## 📈 Scalability & Performance

### Frontend Optimization
```
1. Code Splitting
   ├─ Lazy-loaded modules (User, Admin, Technician)
   └─ Reduces initial bundle from ~2MB to ~500KB

2. Change Detection Strategy
   ├─ OnPush strategy for presentational components
   └─ Reduces unnecessary DOM updates

3. Image Optimization
   ├─ Service images compressed before upload
   ├─ Responsive images (srcset)
   └─ Lazy loading for below-fold images

4. Caching Strategy
   ├─ HTTP cache headers
   ├─ LocalStorage for user auth
   ├─ Service worker for offline support (future)
   └─ API response caching in service layer

5. Bundle Analysis
   ├─ Webpack Bundle Analyzer
   ├─ Identify large dependencies
   └─ Tree-shaking unused code
```

### Backend Optimization
```
1. Database Optimization
   ├─ Indexed columns (status, date, customerId)
   ├─ Connection pooling (HikariCP)
   ├─ Query optimization (N+1 problem solved)
   ├─ Pagination for large result sets
   └─ Lazy loading of relationships

2. Caching
   ├─ HTTP cache headers
   ├─ Application-level caching (future)
   ├─ Database query result caching
   └─ Service response caching

3. API Optimization
   ├─ DTO layer reduces payload size
   ├─ Gzip compression enabled
   ├─ JSON response minimization
   └─ Batch operations support

4. Concurrency
   ├─ Thread pool for request handling
   ├─ Connection pool for database
   ├─ Async processing for heavy tasks
   └─ Task scheduling (future)

5. Monitoring & Logging
   ├─ Application performance monitoring
   ├─ Error tracking (Sentry, DataDog)
   ├─ Request logging with response time
   └─ Database query performance monitoring
```

### Scaling Strategies
```
Vertical Scaling (Same database):
├─ Increase server RAM
├─ Upgrade to faster CPU
└─ Optimize code & queries

Horizontal Scaling (Multiple servers):
├─ Load balancer (Nginx)
├─ Multiple backend instances
├─ Read replicas for database
├─ Distributed caching (Redis)
└─ Message queue (RabbitMQ) for async tasks

Current Deployment:
├─ Single server (suitable for < 10,000 concurrent users)
├─ MySQL database on same/separate server
├─ Nginx as reverse proxy
└─ Docker containers for easy scaling
```

---

**Last Updated:** March 2024

For detailed code examples, see the [PROJECT_FUNCTIONALITY.md](PROJECT_FUNCTIONALITY.md) and [API_REFERENCE.md](API_REFERENCE.md).
