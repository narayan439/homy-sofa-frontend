# Backend Address Parsing Integration Guide

## Overview
To display addresses properly in the Technician Dashboard and Jobs view, the backend needs to enrich booking responses with parsed address components. This guide shows how to integrate the `AddressParsingUtil` utility into your Java backend.

## Step 1: Add AddressParsingUtil to Backend

Copy the `AddressParsingUtil.java` file to:
```
src/main/java/com/example/homy/util/AddressParsingUtil.java
```

## Step 2: Update TechnicianService.java

In your `TechnicianService.java` (the service that handles paginated technician bookings), update the method that returns bookings to enrich addresses:

### Current (Needs Update):
```java
public Page<Booking> getBookingsForTechnician(Long technicianId, Pageable pageable) {
    // ... current implementation
    return bookingRepository.findByTechnicianId(technicianId, pageable);
}
```

### Updated (With Address Enrichment):
```java
import com.example.homy.util.AddressParsingUtil;

public Page<Booking> getBookingsForTechnician(Long technicianId, Pageable pageable) {
    Page<Booking> bookings = bookingRepository.findByTechnicianId(technicianId, pageable);
    
    // Enrich each booking with parsed address
    bookings.getContent().forEach(booking -> {
        enrichBookingAddress(booking);
    });
    
    return bookings;
}

private void enrichBookingAddress(Booking booking) {
    // Ensure address is populated
    if (booking.getAddress() == null || booking.getAddress().isEmpty()) {
        // Try to get address from customer
        if (booking.getCustomer() != null && booking.getCustomer().getAddress() != null) {
            booking.setAddress(booking.getCustomer().getAddress());
        }
        // Try to get latest address from address repository
        else if (booking.getId() != null) {
            Optional<Address> latestAddr = addressRepository.findTopByCustomerIdOrderByCreatedAtDesc(booking.getCustomer().getId());
            if (latestAddr.isPresent()) {
                booking.setAddress(latestAddr.get().getAddressText());
            }
        }
    }
    
    // Parse and normalize the address
    if (booking.getAddress() != null && !booking.getAddress().isEmpty()) {
        booking.setAddress(normalizeAddress(booking.getAddress()));
    } else {
        booking.setAddress("No address provided");
    }
}

private String normalizeAddress(String address) {
    // Remove extra whitespace
    String normalized =address.replaceAll("\\s+", " ").trim();
    
    // Ensure it's properly formatted for parsing
    // If address parts are separate fields, concatenate them
    // Example: "House 123, Area Sector5, City Bengaluru, 560001"
    
    return normalized;
}
```

## Step 3: Update BookingController.java

In your `BookingController.java`, the endpoint that returns technician bookings should use the enriched service:

### Current (Needs Update):
```java
@GetMapping("/technician/bookings")
public ResponseEntity<?> getTechnicianBookings(
    @RequestParam Long technicianId,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size) {
    
    Page<Booking> bookings = technicianService.getBookingsForTechnician(technicianId, PageRequest.of(page, size));
    return ResponseEntity.ok(bookings);
}
```

### Updated (Ensures Address is Present):
```java
@GetMapping("/technician/bookings")
public ResponseEntity<?> getTechnicianBookings(
    @RequestParam Long technicianId,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size) {
    
    Page<Booking> bookings = technicianService.getBookingsForTechnician(technicianId, PageRequest.of(page, size));
    
    // Ensure each booking has an address for frontend display
    bookings.getContent().forEach(booking -> {
        if (booking.getAddress() == null || booking.getAddress().isEmpty()) {
            booking.setAddress("No address provided");
        }
    });
    
    return ResponseEntity.ok(bookings);
}
```

## Step 4: Booking Entity Model

Ensure your `Booking.java` entity has these fields:
```java
@Entity
public class Booking {
    @Id
    private Long id;
    
    private String address;  // Full address string
    private String addressText;
    private String specialAddress;
    
    // ... other fields
    
    @ManyToOne
    private Customer customer;
    
    @ManyToOne
    private Technician technician;
    
    // Getters and setters
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    // ... other getters/setters
}
```

## Step 5: Address Entity (If Separate)

Ensure your `Address.java` entity has:
```java
@Entity
public class Address {
    @Id
    private Long id;
    
    @ManyToOne
    private Customer customer;
    
    private String addressText;
    private String house;
    private String area;
    private String city;
    private String landmark;
    private String pincode;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    // Getters and setters
    public String getAddressText() {
        return addressText;
    }
    
    public void setAddressText(String addressText) {
        this.addressText = addressText;
    }
    
    // ... other getters/setters
}
```

## Step 6: AddressRepository (If Separate Entity)

Ensure you have:
```java
@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    Optional<Address> findByBookingId(Long bookingId);
    Optional<Address> findTopByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
```

## Step 7: Usage in Frontend

The frontend will now receive addresses with the API response. The Technician Dashboard will:

1. Display full address in the table
2. Show **parsed address tooltip** when hovering over the address:
   - House/Flat
   - Area
   - City
   - Pincode
   - Landmark

## Step 8: Testing

1. **Restart Backend**:
```bash
cd backend/Homy-backend
./mvnw clean install
./mvnw spring-boot:run
```

2. **Rebuild Frontend**:
```bash
npm start
# or
ng serve
```

3. **Check DevTools Console** for address logs:
   - "API Response received:"
   - "First 3 raw jobs (address fields):" - Should show address field with data
   - "First 3 enriched jobs (address field):" - Should show parsed address

4. **Verify in UI**:
   - Open Technician Dashboard
   - Hover over an address in the table → Tooltip shows parsed components
   - Address should display in the table

## Troubleshooting

### Addresses still showing "N/A"
- Check backend logs for address enrichment
- Verify `getBookingsForTechnician` in `TechnicianService` is being called
- Confirm Booking entity includes addresses from customer or address table

### Backend not returning addresses
- Verify `@Query` or repository method is fetching address data
- Check if booking-specific address exists, or if you need to join customer.address
- Add debug logging:
```java
System.out.println("Booking " + booking.getId() + " address: " + booking.getAddress());
```

### Frontend parsing fails
- Ensure address format matches expected patterns
- May need to pre-format address in backend (e.g., "House 123, Area XYZ, City ABC, 560001")
- Check browser console for parsing errors

## Frontend Code Already Updated

The frontend files have been updated with:
- `technician-dashboard.component.ts`: Added `getAddressPart()` and `formatAddressTooltip()` methods
- `technician-dashboard.component.html`: Added tooltip to address cells
- `technician.service.ts`: Already has `normalizeBookingsResponse()` for address fallback

No additional frontend changes needed. Just restart `npm start` after backend is updated.
