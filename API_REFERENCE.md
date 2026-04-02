# Homy Sofa — API Reference Guide

Complete REST API documentation for Homy Sofa backend services.

## Base URL
```
http://localhost:8080/api
```

---

## 📋 Table of Contents
1. [Authentication API](#authentication-api)
2. [Booking API](#booking-api)
3. [Service API](#service-api)
4. [Customer API](#customer-api)
5. [Technician API](#technician-api)
6. [Payment API](#payment-api)
7. [Contact API](#contact-api)
8. [Error Handling](#error-handling)

---

## 🔐 Authentication API

### Admin Login
**POST** `/auth/login`

Login with admin credentials to obtain JWT token.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": 1,
  "email": "admin@example.com",
  "name": "Administrator"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

---

### Admin Register
**POST** `/auth/register`

Register a new admin account.

**Request Body:**
```json
{
  "email": "newadmin@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": 2,
  "email": "newadmin@example.com",
  "name": "Administrator"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Email already exists"
}
```

---

## 📱 Booking API

### Get All Bookings
**GET** `/bookings`

Retrieve all bookings with enriched customer and address data.

**Authentication:** Required (Bearer Token)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "phone": "+91-9999999999",
    "email": "john@example.com",
    "service": "Sofa Repair",
    "date": "15/03/2024",
    "message": "Please call before coming",
    "status": "APPROVED",
    "timeSlot": "10:00 AM - 2:00 PM",
    "totalAmount": 5000.00,
    "price": 4500.00,
    "extraAmount": 500.00,
    "address": "123 Main St, City",
    "latLong": "28.7041,77.1025",
    "completionDate": "16/03/2024",
    "additionalServicesJson": "[{\"name\": \"Cushion Replacement\", \"price\": 500}]",
    "customerId": 1,
    "paymentStatus": "PENDING",
    "createdAt": "2024-03-15T10:00:00",
    "updatedAt": "2024-03-16T14:00:00"
  }
]
```

---

### Get Booking by ID
**GET** `/bookings/{id}`

Retrieve a specific booking with full details.

**Parameters:**
- `id` (path) — Booking ID

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "phone": "+91-9999999999",
  "email": "john@example.com",
  "service": "Sofa Repair",
  "date": "15/03/2024",
  "status": "APPROVED",
  "totalAmount": 5000.00,
  "address": "123 Main St, City",
  "latLong": "28.7041,77.1025",
  "customerId": 1,
  "createdAt": "2024-03-15T10:00:00"
}
```

---

### Get Bookings by Customer Email
**GET** `/bookings/customer/{email}`

Retrieve all bookings for a specific customer.

**Parameters:**
- `email` (path) — Customer email address

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "status": "COMPLETED",
    "totalAmount": 5000.00,
    "createdAt": "2024-03-15T10:00:00"
  },
  {
    "id": 2,
    "name": "John Doe",
    "email": "john@example.com",
    "status": "PENDING",
    "totalAmount": 3500.00,
    "createdAt": "2024-03-20T11:00:00"
  }
]
```

---

### Create Booking
**POST** `/bookings`

Create a new booking (customer-initiated or admin-created).

**Request Body:**
```json
{
  "name": "Jane Smith",
  "phone": "+91-8888888888",
  "email": "jane@example.com",
  "service": "Carpet Cleaning",
  "date": "20/03/2024",
  "timeSlot": "2:00 PM - 6:00 PM",
  "message": "Urgent cleaning needed",
  "address": "456 Oak Ave, City",
  "latLong": "28.6092,77.0506",
  "status": "PENDING"
}
```

**Response (200 OK):**
```json
{
  "id": 5,
  "name": "Jane Smith",
  "phone": "+91-8888888888",
  "email": "jane@example.com",
  "service": "Carpet Cleaning",
  "date": "20/03/2024",
  "status": "PENDING",
  "customerId": 3,
  "createdAt": "2024-03-18T15:30:00"
}
```

---

### Update Booking Status
**PUT** `/bookings/{id}`

Update booking details or status.

**Parameters:**
- `id` (path) — Booking ID

**Request Body:**
```json
{
  "status": "APPROVED",
  "totalAmount": 5500.00,
  "paymentStatus": "COMPLETED"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "status": "APPROVED",
  "totalAmount": 5500.00,
  "paymentStatus": "COMPLETED",
  "updatedAt": "2024-03-16T14:00:00"
}
```

---

### Delete Booking
**DELETE** `/bookings/{id}`

Delete a booking record.

**Parameters:**
- `id` (path) — Booking ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking deleted successfully"
}
```

---

## 🛠️ Service API

### Get All Services
**GET** `/services`

Retrieve all services (active and inactive).

**Response (200 OK):**
```json
[
  {
    "id": "svc-1710501600000",
    "name": "Sofa Repair",
    "description": "Professional sofa repair with warranty",
    "price": 4500.00,
    "category": "Repair",
    "duration": 120,
    "features": ["Fabric Repair", "Spring Replacement", "Polish"],
    "imageUrl": "/uploads/backend/sofa-repair.jpg",
    "isActive": true,
    "createdAt": "2024-03-15T10:00:00"
  },
  {
    "id": "svc-1710501700000",
    "name": "Carpet Cleaning",
    "description": "Deep carpet cleaning service",
    "price": 2000.00,
    "category": "Cleaning",
    "duration": 90,
    "features": ["Steam Cleaning", "Stain Removal"],
    "imageUrl": "/uploads/backend/carpet-clean.jpg",
    "isActive": true,
    "createdAt": "2024-03-14T09:00:00"
  }
]
```

---

### Get Active Services
**GET** `/services/active`

Retrieve only active services (for customer browsing).

**Response (200 OK):**
```json
[
  {
    "id": "svc-1710501600000",
    "name": "Sofa Repair",
    "description": "Professional sofa repair with warranty",
    "price": 4500.00,
    "category": "Repair",
    "features": ["Fabric Repair", "Spring Replacement", "Polish"],
    "imageUrl": "/uploads/backend/sofa-repair.jpg",
    "isActive": true
  }
]
```

---

### Get Service by ID
**GET** `/services/{id}`

Retrieve a specific service.

**Parameters:**
- `id` (path) — Service ID

**Response (200 OK):**
```json
{
  "id": "svc-1710501600000",
  "name": "Sofa Repair",
  "description": "Professional sofa repair with warranty",
  "price": 4500.00,
  "category": "Repair",
  "duration": 120,
  "features": ["Fabric Repair", "Spring Replacement", "Polish"],
  "imageUrl": "/uploads/backend/sofa-repair.jpg",
  "isActive": true,
  "createdAt": "2024-03-15T10:00:00"
}
```

---

### Create Service
**POST** `/services`

Create a new service.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "name": "Upholstery Cleaning",
  "description": "Professional upholstery cleaning service",
  "price": 3500.00,
  "category": "Cleaning",
  "duration": 180,
  "features": ["Stain Removal", "Odor Removal", "Protection Coating"],
  "imageUrl": "/uploads/backend/upholstery-clean.jpg",
  "isActive": true
}
```

**Response (200 OK):**
```json
{
  "id": "svc-1710501800000",
  "name": "Upholstery Cleaning",
  "description": "Professional upholstery cleaning service",
  "price": 3500.00,
  "category": "Cleaning",
  "duration": 180,
  "features": ["Stain Removal", "Odor Removal", "Protection Coating"],
  "imageUrl": "/uploads/backend/upholstery-clean.jpg",
  "isActive": true,
  "createdAt": "2024-03-18T10:00:00"
}
```

---

### Update Service
**PUT** `/services/{id}`

Update an existing service.

**Parameters:**
- `id` (path) — Service ID

**Request Body:**
```json
{
  "price": 3800.00,
  "description": "Updated service description",
  "features": ["Stain Removal", "Odor Removal", "Protection Coating", "Color Restoration"]
}
```

**Response (200 OK):**
```json
{
  "id": "svc-1710501800000",
  "name": "Upholstery Cleaning",
  "price": 3800.00,
  "description": "Updated service description",
  "features": ["Stain Removal", "Odor Removal", "Protection Coating", "Color Restoration"],
  "updatedAt": "2024-03-18T15:00:00"
}
```

---

### Delete Service
**DELETE** `/services/{id}`

Delete a service (mark as inactive or remove).

**Parameters:**
- `id` (path) — Service ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

---

### Upload Service Image
**POST** `/services/{id}/upload-image`

Upload an image for a service.

**Parameters:**
- `id` (path) — Service ID

**Request Body:** (multipart/form-data)
- `file` — Image file (PNG, JPG, JPEG)

**Response (200 OK):**
```json
{
  "success": true,
  "imageUrl": "/uploads/backend/service-123.jpg",
  "message": "Image uploaded successfully"
}
```

---

## 👥 Customer API

### Get All Customers
**GET** `/customers`

Retrieve all customers with booking history.

**Authentication:** Required (Admin)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91-9999999999",
    "address": "123 Main St, City",
    "city": "Delhi",
    "zipCode": "110001",
    "totalBookings": 5,
    "totalSpent": 25000.00,
    "joinDate": "2024-01-10",
    "createdAt": "2024-01-10T10:00:00"
  }
]
```

---

### Get Customer by ID
**GET** `/customers/{id}`

Retrieve customer details with service history.

**Parameters:**
- `id` (path) — Customer ID

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91-9999999999",
  "address": "123 Main St, City",
  "totalBookings": 5,
  "totalSpent": 25000.00,
  "joinDate": "2024-01-10",
  "serviceHistory": [
    {
      "bookingId": 1,
      "serviceName": "Sofa Repair",
      "serviceDate": "2024-03-15",
      "status": "COMPLETED",
      "amount": 5000.00,
      "completionDate": "2024-03-16"
    },
    {
      "bookingId": 2,
      "serviceName": "Carpet Cleaning",
      "serviceDate": "2024-03-20",
      "status": "COMPLETED",
      "amount": 3500.00,
      "completionDate": "2024-03-21"
    }
  ]
}
```

---

### Get Customer Service History
**GET** `/customers/{id}/service-history`

Retrieve detailed service history for a customer.

**Parameters:**
- `id` (path) — Customer ID

**Query Parameters:**
- `from` (optional) — Start date (YYYY-MM-DD)
- `to` (optional) — End date (YYYY-MM-DD)

**Response (200 OK):**
```json
{
  "customerId": 1,
  "customerName": "John Doe",
  "totalServices": 5,
  "totalAmountSpent": 25000.00,
  "services": [
    {
      "bookingId": 1,
      "serviceName": "Sofa Repair",
      "serviceDate": "2024-03-15",
      "status": "COMPLETED",
      "timeSlot": "10:00 AM - 2:00 PM",
      "amount": 5000.00,
      "completionDate": "2024-03-16",
      "additionalServices": [
        {
          "name": "Cushion Replacement",
          "price": 500.00
        }
      ]
    }
  ]
}
```

---

## 👨‍🔧 Technician API

### Technician Login
**POST** `/technician/login`

Login technician with credentials to obtain JWT token.

**Request Body:**
```json
{
  "email": "tech01@example.com",
  "password": "Tech0123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": 1,
  "email": "tech01@example.com",
  "name": "Rajesh Kumar"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

---

### Get Technician Bookings
**GET** `/technician/bookings`

Retrieve all bookings assigned to technician.

**Authentication:** Required (Bearer Token or Admin)

**Query Parameters:**
- `technicianId` (required) — Technician ID
- `page` (optional) — Page number (default: 0)
- `size` (optional) — Page size (default: 10)

**Response (200 OK):**
```json
{
  "total": 8,
  "page": 0,
  "size": 10,
  "bookings": [
    {
      "id": 1,
      "name": "John Doe",
      "phone": "+91-9999999999",
      "email": "john@example.com",
      "service": "Sofa Repair",
      "date": "15/03/2024",
      "status": "ASSIGNED",
      "technicianStatus": "ASSIGNED",
      "totalAmount": 5000.00,
      "address": "123 Main St, City",
      "latLong": "28.7041,77.1025",
      "customerId": 1,
      "technicianId": 1,
      "createdAt": "2024-03-15T10:00:00"
    }
  ]
}
```

---

### Start Job
**PUT** `/technician/bookings/{id}/start`

Mark booking as IN_PROGRESS.

**Parameters:**
- `id` (path) — Booking ID

**Request Body:**
```json
{
  "technicianId": 1
}
```

**Response (200 OK):**
```json
{
  "success": true
}
```

**Error Response (404):**
```json
{
  "error": "Booking not found or technician mismatch"
}
```

---

### Complete Job
**PUT** `/technician/bookings/{id}/complete`

Mark booking as COMPLETED with additional details.

**Parameters:**
- `id` (path) — Booking ID

**Request Body:**
```json
{
  "technicianId": 1,
  "totalAmount": 5500.00,
  "technicianNotes": "Service completed successfully, customer satisfied",
  "additionalServiceName": "Cushion Replacement",
  "additionalServicePrice": 500.00,
  "additionalServicesJson": "[{\"name\": \"Cushion Replacement\", \"price\": 500}]"
}
```

**Response (200 OK):**
```json
{
  "success": true
}
```

---

### Cancel Job
**PUT** `/technician/bookings/{id}/cancel`

Cancel a booking assigned to technician.

**Parameters:**
- `id` (path) — Booking ID

**Request Body:**
```json
{
  "technicianId": 1,
  "cancelReason": "Customer not available at scheduled time"
}
```

**Response (200 OK):**
```json
{
  "success": true
}
```

---

### Add Additional Service
**POST** `/technician/bookings/{id}/additional-service`

Add additional service to a booking during completion.

**Parameters:**
- `id` (path) — Booking ID

**Request Body:**
```json
{
  "technicianId": 1,
  "serviceName": "Stain Removal",
  "price": 1500.00
}
```

**Response (200 OK):**
```json
{
  "success": true
}
```

**Error Response (409 Conflict):**
```json
{
  "error": "Service already added to this booking"
}
```

---

### Admin: Create Technician
**POST** `/admin/technicians`

Create a new technician account.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "phone": "+91-9876543210",
  "password": "SecurePass123",
  "isActive": true,
  "specialization": "Sofa Repair"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "phone": "+91-9876543210",
  "specialization": "Sofa Repair",
  "isActive": true,
  "createdAt": "2024-03-18T10:00:00"
}
```

---

### Admin: Get All Technicians
**GET** `/admin/technicians`

Retrieve all technicians.

**Authentication:** Required (Admin)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "phone": "+91-9876543210",
    "specialization": "Sofa Repair",
    "isActive": true,
    "createdAt": "2024-03-18T10:00:00"
  }
]
```

---

### Admin: Get Technician by ID
**GET** `/admin/technicians/{id}`

Retrieve specific technician details.

**Authentication:** Required (Admin)

**Parameters:**
- `id` (path) — Technician ID

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "phone": "+91-9876543210",
  "specialization": "Sofa Repair",
  "isActive": true,
  "totalAssignedJobs": 15,
  "completedJobs": 12,
  "createdAt": "2024-03-18T10:00:00"
}
```

---

### Admin: Update Technician
**PUT** `/admin/technicians/{id}`

Update technician details.

**Authentication:** Required (Admin)

**Parameters:**
- `id` (path) — Technician ID

**Request Body:**
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh.new@example.com",
  "phone": "+91-9876543210",
  "specialization": "Sofa Repair & Cleaning",
  "password": "NewSecurePass123"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Rajesh Kumar",
  "email": "rajesh.new@example.com",
  "phone": "+91-9876543210",
  "specialization": "Sofa Repair & Cleaning",
  "updatedAt": "2024-03-19T10:00:00"
}
```

---

### Admin: Delete Technician
**DELETE** `/admin/technicians/{id}`

Delete a technician account.

**Authentication:** Required (Admin)

**Parameters:**
- `id` (path) — Technician ID

**Response (200 OK):**
```json
{
  "success": true
}
```

---

### Admin: Reset Technician Password
**POST** `/admin/technicians/{id}/reset-password`

Reset technician password to default (name + phone).

**Authentication:** Required (Admin)

**Parameters:**
- `id` (path) — Technician ID

**Response (200 OK):**
```json
{
  "success": true,
  "password": "Raje987"
}
```

---

### Admin: Update Technician Status
**PATCH** `/admin/technicians/{id}/status`

Update technician active/inactive status.

**Authentication:** Required (Admin)

**Parameters:**
- `id` (path) — Technician ID

**Request Body:**
```json
{
  "status": "active"
}
```

**Response (200 OK):**
```json
{
  "success": true
}
```

---

### Admin: Assign Technician to Booking
**PUT** `/admin/bookings/{bookingId}/assign`

Automatically assign best available technician to booking.

**Authentication:** Required (Admin)

**Parameters:**
- `bookingId` (path) — Booking ID

**Response (200 OK):**
```json
{
  "success": true,
  "technicianId": 1,
  "technicianName": "Rajesh Kumar"
}
```

**Error Response (404):**
```json
{
  "error": "No available technician found"
}
```

---

## 💳 Payment API

### Get All Payments
**GET** `/payments`

Retrieve all payment records.

**Authentication:** Required (Admin)

**Response (200 OK):**
```json
[
  {
    "id": "pay-1710501600000",
    "bookingId": 1,
    "customerId": 1,
    "amount": 5000.00,
    "paymentMethod": "credit_card",
    "status": "completed",
    "transactionId": "TXN123456789",
    "createdAt": "2024-03-16T14:00:00",
    "updatedAt": "2024-03-16T14:00:00"
  }
]
```

---

### Get Payments by Booking
**GET** `/payments/booking/{bookingId}`

Retrieve payments for a specific booking.

**Parameters:**
- `bookingId` (path) — Booking ID

**Response (200 OK):**
```json
[
  {
    "id": "pay-1710501600000",
    "bookingId": 1,
    "customerId": 1,
    "amount": 5000.00,
    "paymentMethod": "credit_card",
    "status": "completed",
    "transactionId": "TXN123456789",
    "createdAt": "2024-03-16T14:00:00"
  }
]
```

---

### Create Payment
**POST** `/payments`

Create a new payment record.

**Request Body:**
```json
{
  "bookingId": 1,
  "customerId": 1,
  "amount": 5000.00,
  "paymentMethod": "credit_card",
  "status": "completed",
  "transactionId": "TXN123456789"
}
```

**Response (200 OK):**
```json
{
  "id": "pay-1710501600000",
  "bookingId": 1,
  "customerId": 1,
  "amount": 5000.00,
  "paymentMethod": "credit_card",
  "status": "completed",
  "transactionId": "TXN123456789",
  "createdAt": "2024-03-16T14:00:00"
}
```

---

## 📧 Contact API

### Submit Contact Form
**POST** `/contact`

Submit a contact form inquiry (public endpoint).

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+91-8888888888",
  "subject": "Service Inquiry",
  "message": "I would like to know more about your sofa repair service"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Your message has been received. We will contact you soon."
}
```

---

## ❌ Error Handling

### Standard Error Response Format

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong",
  "timestamp": "2024-03-18T15:30:00Z",
  "status": 400
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| **200** | Success | Booking created successfully |
| **201** | Created | New resource created |
| **204** | No Content | Successful deletion |
| **400** | Bad Request | Missing required field |
| **401** | Unauthorized | Invalid token or credentials |
| **404** | Not Found | Booking ID doesn't exist |
| **409** | Conflict | Duplicate email or duplicate service |
| **500** | Server Error | Unexpected backend error |

### Authentication

All protected endpoints require JWT token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Claims

JWT tokens include:
- **sub** (subject): User ID (numeric or string)
- **email**: User email
- **role**: User role (ADMIN, TECHNICIAN)
- **iat**: Issued at timestamp
- **exp**: Expiration timestamp

---

## 🔄 Common Request/Response Patterns

### Pagination Example
Some endpoints support pagination:

**Request:**
```
GET /api/technician/bookings?technicianId=1&page=0&size=10
```

**Response:**
```json
{
  "total": 25,
  "page": 0,
  "size": 10,
  "data": [...]
}
```

### Filter Example
Filter bookings by status:

**Request:**
```
GET /api/bookings?status=APPROVED&from=2024-03-01&to=2024-03-31
```

### Bulk Actions
Some endpoints support bulk operations:

**Request:**
```json
{
  "bookingIds": [1, 2, 5],
  "action": "APPROVE"
}
```

---

## 📝 Rate Limiting

Rate limiting may be applied in production:
- **Requests per minute:** 100
- **Requests per hour:** 5000

The response headers will include:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## 🧪 Testing with cURL

### Example: Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Example: Get Bookings (with token)
```bash
curl -X GET http://localhost:8080/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Example: Create Service
```bash
curl -X POST http://localhost:8080/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Service",
    "description": "Service description",
    "price": 2000,
    "category": "Cleaning"
  }'
```

---

## 📞 Support

For API issues or additional documentation, contact the development team or check the GitHub repository.
