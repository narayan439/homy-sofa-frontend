# Address System - Complete Integration Guide

## ✅ Features Implemented

- ✅ **Multiple Addresses** - Users can save unlimited addresses
- ✅ **Custom Labels** - Label addresses (My Home, Office, etc.)
- ✅ **Address Types** - Home, Office, Other categories
- ✅ **Default Address** - Pre-selected for bookings
- ✅ **Responsive Design** - Mobile-friendly interface
- ✅ **Material Design UI** - Beautiful, consistent styling
- ✅ **Address Selection Popup** - Zomato-style selection dialog
- ✅ **Geolocation Support** - Latitude/Longitude for future maps
- ✅ **Security** - JWT-protected endpoints, only view own addresses
- ✅ **Soft Delete** - Addresses marked inactive (recoverable)

---

## 📍 Frontend Integration

### 1. ✅ Navigation Setup
The "Manage Addresses" link is already added to:
- User menu (Desktop) → Account → Manage Addresses
- Mobile sidebar available when logged in

### 2. ✅ Routing
Route `/user/addresses` is configured and protected with `UserGuard`

### 3. ✅ Module Configuration
All necessary Material modules are imported:
- MatRadioModule - for address selection
- MatChipsModule - for address badges
- MatProgressSpinnerModule - for loading states

---

## 🔗 Booking Integration Instructions

### Step 1: Update Your Booking Component

Open `src/app/user/booking/booking.component.ts` and add:

```typescript
import { AddressSelectionDialogComponent } from '../address-selection-dialog/address-selection-dialog.component';
import { AddressService, UserAddress } from '../../core/services/address.service';

export class BookingComponent {
  
  // Add these properties
  selectedAddress: UserAddress | null = null;
  bookingData: any = {};

  constructor(
    private dialog: MatDialog,
    private addressService: AddressService,
    private bookingService: BookingService,
    // ... other services
  ) {}

  /**
   * Open address selection dialog
   */
  selectAddressForBooking(): void {
    this.addressService.getAddresses().subscribe({
      next: (response) => {
        const addresses = response?.data || [];
        
        if (addresses.length === 0) {
          this.snackBar.open('❌ Please add an address first', 'Go to Addresses', { 
            duration: 4000 
          })
            .onAction()
            .subscribe(() => {
              this.router.navigate(['/addresses']);
            });
          return;
        }

        // Open address selection dialog
        const dialogRef = this.dialog.open(AddressSelectionDialogComponent, {
          width: '500px',
          maxWidth: '90vw',
          disableClose: false,
          data: { addresses }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.selectedAddress = result;
            this.snackBar.open('✅ Address selected', 'Close', { duration: 2000 });
          }
        });
      },
      error: (err) => {
        console.error('Error loading addresses:', err);
        this.snackBar.open('❌ Failed to load addresses', 'Close', { duration: 3000 });
      }
    });
  }

  /**
   * Complete booking with address
   */
  completeBooking(): void {
    // Validation
    if (!this.selectedAddress) {
      this.snackBar.open('❌ Please select a delivery address', 'Close', { 
        duration: 3000 
      });
      return;
    }

    if (!this.bookingData.serviceId) {
      this.snackBar.open('❌ Please select a service', 'Close', { 
        duration: 3000 
      });
      return;
    }

    // Prepare booking data with address
    const completeBookingData = {
      ...this.bookingData,
      addressId: this.selectedAddress.id,
      fullAddress: this.selectedAddress.fullAddress,
      latitude: this.selectedAddress.latitude,
      longitude: this.selectedAddress.longitude
    };

    // Send to backend
    this.bookingService.createBooking(completeBookingData)
      .subscribe({
        next: (response) => {
          if (response?.success) {
            this.snackBar.open('✅ Booking created successfully!', 'Close', { 
              duration: 3000 
            });
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          console.error('Booking error:', err);
          this.snackBar.open('❌ Failed to create booking', 'Close', { 
            duration: 3000 
          });
        }
      });
  }
}
```

### Step 2: Update Booking Template

Add this to your booking form template (e.g., `booking.component.html`):

```html
<!-- Address Selection Section -->
<mat-card class="booking-section address-section" *ngIf="selectedService">
  <mat-card-header class="section-header">
    <h3>
      <mat-icon>location_on</mat-icon>
      Delivery Address
    </h3>
  </mat-card-header>

  <mat-card-content>
    <!-- No Address Selected -->
    <div *ngIf="!selectedAddress" class="address-empty">
      <p class="info-text">Select where you need our service</p>
      <button 
        mat-raised-button
        color="primary"
        (click)="selectAddressForBooking()"
        class="select-btn"
      >
        <mat-icon>add_location</mat-icon>
        Select Address
      </button>
    </div>

    <!-- Address Selected -->
    <div *ngIf="selectedAddress" class="address-selected">
      <div class="selected-address-card">
        <div class="address-label-badge">
          <mat-icon>{% raw %}{{ 
            selectedAddress.addressType === 'Home' ? 'home' : 
            selectedAddress.addressType === 'Office' ? 'business' : 
            'location_on' 
          }}{% endraw %}</mat-icon>
          <strong>{{ selectedAddress.label }}</strong>
          <span class="type-badge">{{ selectedAddress.addressType }}</span>
        </div>

        <div class="address-full">
          <p class="main-address">
            {{ selectedAddress.house }}, {{ selectedAddress.area }}
          </p>
          <p class="city-zip">
            {{ selectedAddress.city }} - {{ selectedAddress.pincode }}
          </p>
          <p class="landmark" *ngIf="selectedAddress.landmark">
            <mat-icon>flag</mat-icon>
            Near: {{ selectedAddress.landmark }}
          </p>
        </div>

        <div class="address-actions">
          <button 
            mat-stroked-button
            (click)="selectAddressForBooking()"
            class="change-btn"
          >
            <mat-icon>edit_location</mat-icon>
            Change Address
          </button>
        </div>
      </div>
    </div>
  </mat-card-content>
</mat-card>

<!-- Booking Submit Button -->
<button 
  mat-raised-button
  color="primary"
  (click)="completeBooking()"
  [disabled]="!selectedAddress || !selectedService"
  class="submit-booking-btn"
>
  <mat-icon *ngIf="!isSubmitting">confirmation</mat-icon>
  <mat-spinner *ngIf="isSubmitting" diameter="20" class="btn-spinner"></mat-spinner>
  {{ isSubmitting ? 'Creating Booking...' : 'Confirm & Book' }}
</button>
```

### Step 3: Add CSS Styles

Add to your booking component CSS:

```css
/* Address Section */
.address-section {
  margin: 24px 0;
  border-left: 4px solid #1a237e;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1a237e;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header h3 mat-icon {
  color: #1a237e;
}

/* Empty State */
.address-empty {
  text-align: center;
  padding: 24px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.info-text {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.select-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 24px;
}

/* Selected Address */
.address-selected {
  padding: 16px;
}

.selected-address-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: #f9f9f9;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-label-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1a237e;
}

.address-label-badge mat-icon {
  color: #1a237e;
}

.type-badge {
  background: #e3f2fd;
  color: #1a237e;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  margin-left: auto;
}

.address-full {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.main-address {
  margin: 0;
  color: #555;
  font-size: 14px;
  font-weight: 500;
}

.city-zip {
  margin: 0;
  color: #888;
  font-size: 13px;
}

.landmark {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  color: #999;
  font-size: 12px;
}

.landmark mat-icon {
  font-size: 12px;
  width: 12px;
  height: 12px;
}

.address-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.change-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  font-size: 13px;
}

/* Submit Button */
.submit-booking-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-spinner {
  margin: 0 !important;
}

/* Responsive */
@media (max-width: 768px) {
  .address-section {
    margin: 16px 0;
  }

  .address-selected {
    padding: 12px;
  }

  .selected-address-card {
    padding: 12px;
  }

  .type-badge {
    margin-left: 0;
    margin-top: 4px;
  }

  .address-actions {
    flex-direction: column;
  }

  .change-btn {
    width: 100%;
    justify-content: center;
  }
}
```

---

## 🔧 Backend Integration

### Update Booking Model

Update `Booking.java` to include address field:

```java
@Column(name = "address_id")
private Long addressId;

@Column(name = "full_address", length = 500)
private String fullAddress;

@Column(name = "latitude")
private Double latitude;

@Column(name = "longitude")
private Double longitude;

// Getters and Setters
public Long getAddressId() { return addressId; }
public void setAddressId(Long addressId) { this.addressId = addressId; }

public String getFullAddress() { return fullAddress; }
public void setFullAddress(String fullAddress) { this.fullAddress = fullAddress; }

public Double getLatitude() { return latitude; }
public void setLatitude(Double latitude) { this.latitude = latitude; }

public Double getLongitude() { return longitude; }
public void setLongitude(Double longitude) { this.longitude = longitude; }
```

### Database Migration

Add to `V5__add_address_fields_to_bookings.sql`:

```sql
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS address_id BIGINT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS full_address VARCHAR(500);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

ALTER TABLE bookings ADD FOREIGN KEY (address_id) REFERENCES user_addresses(id);
```

---

## 📱 User Flow

1. **User navigates to** → Booking page
2. **User selects** → Service (existing flow)
3. **User clicks** → "Select Address" button
4. **Popup appears** → Shows all saved addresses with radio buttons
5. **User selects** → Address from list (pre-selects default)
6. **User confirms** → Selection closes dialog
7. **Page shows** → Selected address details
8. **User can** → Change address if needed
9. **User clicks** → "Confirm & Book" button
10. **Backend receives** → Booking data with addressId, coordinates, etc.

---

## 🛡️ Security Features

✅ **JWT Authentication** - All endpoints require valid token
✅ **User Isolation** - Users only see their own addresses
✅ **Address Verification** - Booking must have valid addressId
✅ **Soft Delete** - Addresses never permanently deleted
✅ **Role-Based Access** - Only ROLE_USER can access

---

## 📊 API Endpoints

### Address Management
```
GET    /api/addresses                    - Get all user addresses
POST   /api/addresses                    - Add new address
GET    /api/addresses/{id}               - Get specific address
PUT    /api/addresses/{id}               - Update address
DELETE /api/addresses/{id}               - Delete address (soft)
PUT    /api/addresses/{id}/set-default   - Set default
GET    /api/addresses/default            - Get default address
```

### Booking (Updated)
```
POST   /api/bookings                     - Create booking with addressId
GET    /api/bookings/{id}                - Get booking details
```

---

## ✨ Next Steps

1. ✅ **Already Done:**
   - Backend models, services, controllers
   - Frontend address service
   - Address management component
   - Address selection dialog
   - Navigation integration
   - Module configuration

2. **You Need to Do:**
   - Integrate address selection into booking component (use above code)
   - Update booking model with address fields
   - Run database migrations
   - Test address selection flow

3. **Optional Enhancements:**
   - Add Google Maps integration for address verification
   - Show delivery time based on coordinates
   - Add address search/autocomplete
   - Send booking confirmation with address

---

## 🧪 Testing Checklist

- [ ] Can add a new address
- [ ] Can view all addresses
- [ ] Can edit an address
- [ ] Can set default address
- [ ] Can delete an address
- [ ] Can book with selected address
- [ ] Address appears in booking details
- [ ] Mobile responsiveness works
- [ ] Dialog opens/closes properly
- [ ] Default address pre-selected in dialog

---

## 📞 Support

All endpoints are protected with JWT. Make sure Authorization header is included:
```
Authorization: Bearer <your-jwt-token>
```

For issues, check console logs and network tab in DevTools.
