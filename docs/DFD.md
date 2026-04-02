# Data Flow Diagram (DFD) — Homy Sofa Booking System

Comprehensive DFD documentation covering Level 0 (Context), Level 1 (Major Processes), and Level 2 (Detailed Processes).

---

## Level 0: Context Diagram

The context diagram shows the Homy Sofa system as a single process with all external actors and main data flows.

```mermaid
flowchart LR
  Customer["👤 Customer"]
  Admin["👨‍💼 Admin"]
  Technician["🔧 Technician"]
  Email["📧 Email System\n(External)"]

  subgraph System ["Homy Sofa Booking System"]
    Core["System"]
  end

  Customer -->|Service Browse, Booking Requests| Core
  Admin -->|Manage Bookings, Services, Customers| Core
  Technician -->|View Jobs, Update Status| Core
  
  Core -->|Booking Confirmation| Email
  Core -->|Status Updates, Notifications| Email
  Core -->|Booking Status, Job Details| Customer
  Core -->|Metrics, Reports| Admin
  Core -->|Assigned Jobs, Tasks| Technician
```

### Level 0 Actors & Data Flows

| Actor | Sends | Receives |
|-------|-------|----------|
| **Customer** | Service queries, Booking requests, Address/contact info | Booking confirmation, Status updates |
| **Admin** | Service CRUD, Booking approvals/completions, Technician assignments | Dashboard metrics, Booking list, Customer data, Payment records |
| **Technician** | Job status updates (start, complete, cancel), Completion notes, Additional services | Assigned jobs, Job details, Customer/address info |
| **Email System** | Receives notification requests | Sends confirmation/status emails |

---

## Level 1: Major Processes

Level 1 decomposes the system into key processes:

```mermaid
flowchart TB
  %% External actors
  Customer["👤 Customer"]
  Admin["👨‍💼 Admin"]
  Technician["🔧 Technician"]
  Email["📧 Email System"]

  %% Level 1 Processes
  P1["P1: Booking Management\n(Create, View, Manage)"]
  P2["P2: Authentication\n(Login, Token Management)"]
  P3["P3: Service Management\n(CRUD Operations)"]
  P4["P4: Technician Management\n(Assign, Track, Complete)"]
  P5["P5: Notification Service\n(Email Alerts)"]

  %% Data Stores
  subgraph DS ["Data Stores"]
    D1[("D1: Bookings")]
    D2[("D2: Customers")]
    D3[("D3: Services")]
    D4[("D4: Technicians")]
    D5[("D5: Addresses")]
  end

  %% Customer flows
  Customer -->|Service Query| P1
  Customer -->|Booking Request| P1
  P1 -->|Booking Confirmation| Customer

  %% Admin flows
  Admin -->|Login Credentials| P2
  P2 -->|JWT Token| Admin
  Admin -->|Manage Bookings| P1
  Admin -->|Create/Edit Services| P3
  Admin -->|Assign Technician| P4
  P1 -->|Dashboard Data| Admin
  P3 -->|Service List| Admin

  %% Technician flows
  Technician -->|Login Credentials| P2
  P2 -->|JWT Token| Technician
  Technician -->|View Jobs| P4
  Technician -->|Job Status Update| P4
  P4 -->|Assigned Jobs| Technician
  P4 -->|Job Details| Technician

  %% Data flow from processes to stores
  P1 -->|Read/Write| D1
  P1 -->|Read/Write| D2
  P1 -->|Read| D3
  P1 -->|Read| D5

  P2 -->|Validate| D4
  P2 -->|Validate| D2

  P3 -->|Read/Write| D3

  P4 -->|Read/Write| D1
  P4 -->|Read| D4
  P4 -->|Read| D2
  P4 -->|Read| D5

  %% Notifications
  P1 -->|Booking Event| P5
  P4 -->|Job Completion Event| P5
  P5 -->|Send Email| Email

  style P1 fill:#e3f2fd
  style P2 fill:#f3e5f5
  style P3 fill:#e8f5e9
  style P4 fill:#fff3e0
  style P5 fill:#fce4ec
  style DS fill:#fffde7
```

### Level 1 Processes

| Process | Input | Output | Functions |
|---------|-------|--------|-----------|
| **P1: Booking Mgmt** | Booking requests, Browse queries | Booking confirmation, Booking list, Status updates | Create, view, filter bookings; add services |
| **P2: Authentication** | Login credentials (email, password) | JWT token, User session | Admin & Technician login; token validation |
| **P3: Service Mgmt** | Service CRUD operations | Service list, Service details | Create, read, update, delete services |
| **P4: Technician Mgmt** | Job assignments, Status updates | Assigned jobs, Job metrics | Assign jobs, track progress, handle completions |
| **P5: Notification** | Booking/Job events | Email notifications sent | Send confirmation, status change, and completion emails |

### Level 1 Data Stores

| Store | Purpose | Fields |
|-------|---------|--------|
| **D1: Bookings** | Booking records | id, customerId, service, date, status, technicianId, technicianStatus, completionDate, technicianNotes, additionalServicesJson |
| **D2: Customers** | Customer profiles | id, name, email, phone, address, totalBookings, totalSpent |
| **D3: Services** | Available services | id, name, description, price, category, duration, features, imageUrl |
| **D4: Technicians** | Technician profiles | id, name, email, phone, password, serviceCategory, isActive |
| **D5: Addresses** | Booking addresses | id, bookingId, customerId, addressText, latLong |

---

## Level 2: Detailed Processes

### Level 2a: Booking Management (Decomposition of P1)

```mermaid
flowchart TB
  Customer["👤 Customer"]
  Admin["👨‍💼 Admin"]

  P1_1["P1.1: Browse Services"]
  P1_2["P1.2: Create Booking"]
  P1_3["P1.3: Approve Booking\n(Admin)"]
  P1_4["P1.4: Complete Booking\n(Admin)"]
  P1_5["P1.5: Manage Additional\nServices"]

  D1[("D1: Bookings")]
  D2[("D2: Customers")]
  D3[("D3: Services")]
  D5[("D5: Addresses")]

  Customer -->|Request Service List| P1_1
  P1_1 -->|Query Services| D3
  P1_1 -->|Service Details| Customer

  Customer -->|Submit Booking Form| P1_2
  P1_2 -->|Validate Customer| D2
  P1_2 -->|Store Booking| D1
  P1_2 -->|Store Address| D5
  P1_2 -->|Booking Confirmation| Customer

  Admin -->|Review PENDING| P1_3
  P1_3 -->|Read Booking| D1
  P1_3 -->|Update Status to ASSIGNED| D1
  P1_3 -->|Booking Approved| Admin

  Admin -->|Review ASSIGNED| P1_4
  P1_4 -->|Read Booking| D1
  P1_4 -->|Update with completion details| D1
  P1_4 -->|Booking Completed| Admin

  Admin -->|Add Extra Services| P1_5
  P1_5 -->|Update additionalServicesJson| D1
  P1_5 -->|Service Added| Admin

  style P1_1 fill:#e3f2fd
  style P1_2 fill:#e3f2fd
  style P1_3 fill:#e3f2fd
  style P1_4 fill:#e3f2fd
  style P1_5 fill:#e3f2fd
```

### Level 2b: Technician Management (Decomposition of P4)

```mermaid
flowchart TB
  Technician["🔧 Technician"]
  Admin["👨‍💼 Admin"]

  P4_1["P4.1: Create Technician\n(Admin)"]
  P4_2["P4.2: View Assigned Jobs"]
  P4_3["P4.3: Start Job"]
  P4_4["P4.4: Complete Job\nwith Details"]
  P4_5["P4.5: Cancel Job"]
  P4_6["P4.6: Track Job Status"]

  D1[("D1: Bookings")]
  D2[("D2: Customers")]
  D4[("D4: Technicians")]
  D5[("D5: Addresses")]

  Admin -->|Create Technician| P4_1
  P4_1 -->|Store Technician| D4
  P4_1 -->|Technician Created| Admin

  Technician -->|View My Jobs| P4_2
  P4_2 -->|Query by technicianId| D1
  P4_2 -->|Enrich with customer data| D2
  P4_2 -->|Enrich with address| D5
  P4_2 -->|Job List| Technician

  Technician -->|Start Job| P4_3
  P4_3 -->|Update technicianStatus to IN_PROGRESS| D1
  P4_3 -->|Job Started| Technician

  Technician -->|Submit Completion| P4_4
  P4_4 -->|Submit totalAmount, technicianNotes, additionalServices| D1
  P4_4 -->|Update status, technicianStatus, completionDate| D1
  P4_4 -->|Job Completed| Technician

  Technician -->|Cancel Job| P4_5
  P4_5 -->|Update technicianStatus to CANCELLED| D1
  P4_5 -->|Job Cancelled| Technician

  Admin -->|Monitor Progress| P4_6
  P4_6 -->|Query Technician Jobs| D1
  P4_6 -->|Status Report| Admin

  style P4_1 fill:#fff3e0
  style P4_2 fill:#fff3e0
  style P4_3 fill:#fff3e0
  style P4_4 fill:#fff3e0
  style P4_5 fill:#fff3e0
  style P4_6 fill:#fff3e0
```

### Level 2c: Authentication (Decomposition of P2)

```mermaid
flowchart TB
  Admin["👨‍💼 Admin"]
  Technician["🔧 Technician"]

  P2_1["P2.1: Admin Login"]
  P2_2["P2.2: Technician Login"]
  P2_3["P2.3: Token Generation"]
  P2_4["P2.4: Token Validation"]

  D2[("D2: Customers")]
  D4[("D4: Technicians")]

  Admin -->|Email, Password| P2_1
  P2_1 -->|Query Customer| D2
  P2_1 -->|Send to Token Generation| P2_3

  Technician -->|Email, Password| P2_2
  P2_2 -->|Query Technician| D4
  P2_2 -->|Send to Token Generation| P2_3

  P2_3 -->|Generate JWT Token| P2_3
  P2_3 -->|Token, User Info| Admin
  P2_3 -->|Token, User Info| Technician

  Admin -->|API Request + Token| P2_4
  Technician -->|API Request + Token| P2_4
  P2_4 -->|Validate JWT| P2_4
  P2_4 -->|Authorized / Rejected| Admin
  P2_4 -->|Authorized / Rejected| Technician

  style P2_1 fill:#f3e5f5
  style P2_2 fill:#f3e5f5
  style P2_3 fill:#f3e5f5
  style P2_4 fill:#f3e5f5
```

---

## Key Data Flows Summary

### Customer Journey
1. **Browse** → Query services (P1.1) → Service list
2. **Create Booking** → Submit form (P1.2) → Create booking + address + customer
3. **Confirmation** → Email notification (P5)
4. **Track Status** → View booking status in real-time

### Admin Journey
1. **Login** → Credentials (P2.1) → JWT token
2. **Manage Bookings** → View all, filter, approve/complete (P1.3, P1.4)
3. **Assign Technician** → Select technician during approval (P4.1 via P1.3)
4. **Add Services** → Append additional services to booking (P1.5)
5. **Dashboard** → Metrics, reports, customer analytics

### Technician Journey
1. **Login** → Credentials (P2.2) → JWT token
2. **View Jobs** → Query assigned jobs (P4.2) → Job list with customer/address
3. **Start Job** → Mark IN_PROGRESS (P4.3)
4. **Complete Job** → Submit completion details, add services (P4.4)
5. **Notifications** → Receive email on assignment and completion (P5)

---

## Technical Notes

### Data Store Implementation
- **D1–D5** map to MySQL tables: `bookings`, `customers`, `services`, `technicians`, `addresses`.
- **Booking fields** include: `status` (PENDING/ASSIGNED/COMPLETED/CANCELLED), `technicianId`, `technicianStatus` (ASSIGNED/IN_PROGRESS/COMPLETED/CANCELLED), `technicianNotes`, `additionalServicesJson`.

### Process Implementation
- **P1–P5** correspond to Spring Boot controllers/services and Angular services.
- **P2** uses JWT; tokens stored in `localStorage` on frontend; sent in `Authorization` header.
- **P5** uses `EmailService` (Spring Boot) to send async notifications.

### Security & Authentication
- Admin and Technician roles enforced by guards (`AdminGuard`, `TechnicianGuard`).
- JWT tokens validated on every protected request.
- Passwords hashed via `PasswordEncoder` (BCrypt).

---

## Diagram Export

For interactive diagrams, view this file in:
- **GitHub Markdown** (native Mermaid rendering)
- **VS Code** with Mermaid Preview extension
- **mermaid.live** (paste Mermaid blocks)

To export to PNG/SVG:
1. Open [mermaid.live](https://mermaid.live)
2. Paste any diagram block
3. Click "Download" to export as PNG/SVG
