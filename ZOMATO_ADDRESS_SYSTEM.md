# Zomato-Style Multiple Address System - Integration Guide

## Overview
This system allows users to save multiple addresses and select one during booking, similar to Zomato.

---

## BACKEND INTEGRATION

### 1. Enable UserAddressService Injection

Update `pom.xml` if using Flyway for migrations:
```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
```

### 2. Add Service to Spring Context

The `UserAddressService` will be auto-discovered via `@Service` annotation.

### 3. Database Migration

Place the migration file at:
```
src/main/resources/db/migration/V4__create_user_addresses_table.sql
```

Run your application to auto-migrate.

---

## FRONTEND INTEGRATION

### 1. Update Module Imports

Update `src/app/user/user.module.ts`:

```typescript
import { ManageAddressesComponent } from './manage-addresses/manage-addresses.component';
import { AddressSelectionDialogComponent } from './address-selection-dialog/address-selection-dialog.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatSpinner } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    // ... existing components
    ManageAddressesComponent,
    AddressSelectionDialogComponent
  ],
  imports: [
    // ... existing imports
    MatRadioModule,
    MatChipsModule,
    MatSpinner
  ]
})
export class UserModule { }
```

### 2. Update User Routing

Add to `src/app/user/user-routing.module.ts`:

```typescript
{
  path: 'addresses',
  component: ManageAddressesComponent
}
```

### 3. Add to Navigation

Update `src/app/shared/components/navbar/navbar.component.html`:

```html
<a routerLink="/user/addresses" routerLinkActive="active">
  <mat-icon>location_on</mat-icon>
  Addresses
</a>
```

---

## BOOKING INTEGRATION

### 1. Update Booking Service

In `src/app/core/services/booking.service.ts`, add:

```typescript
createBookingWithAddress(bookingData: any, addressId: number): Observable<any> {
  bookingData.addressId = addressId;
  return this.http.post(`${this.apiUrl}/bookings`, bookingData);
}
```

### 2. Update Booking Component

In your booking component (e.g., `src/app/user/booking/booking.component.ts`):

```typescript
import { AddressSelectionDialogComponent } from '../address-selection-dialog/address-selection-dialog.component';
import { AddressService } from '../../core/services/address.service';

export class BookingComponent {
  selectedAddress: any = null;

  constructor(
    private dialog: MatDialog,
    private addressService: AddressService,
    private bookingService: BookingService
  ) {}

  selectAddressForBooking(): void {
    this.addressService.getAddresses().subscribe({
      next: (response) => {
        const addresses = response?.data || [];
        
        if (addresses.length === 0) {
          this.snackBar.open('Please add an address first', 'Close', { duration: 3000 });
          this.router.navigate(['/user/addresses']);
          return;
        }

        const dialogRef = this.dialog.open(AddressSelectionDialogComponent, {
          width: '500px',
          data: { addresses }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.selectedAddress = result;
          }
        });
      }
    });
  }

  completeBooking(): void {
    if (!this.selectedAddress) {
      this.snackBar.open('Please select an address', 'Close', { duration: 3000 });
      return;
    }

    const bookingData = {
      // ... other booking data
      addressId: this.selectedAddress.id
    };

    this.bookingService.createBookingWithAddress(bookingData, this.selectedAddress.id)
      .subscribe({
        next: (response) => {
          this.snackBar.open('Booking created successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.snackBar.open('Failed to create booking', 'Close', { duration: 3000 });
        }
      });
  }
}
```

### 3. Update Booking Template

Add address selection button in booking form template:

```html
<div class="booking-section" *ngIf="selectedService">
  <h3>Delivery Address</h3>
  
  <div *ngIf="!selectedAddress" class="address-select">
    <button 
      mat-raised-button
      color="primary"
      (click)="selectAddressForBooking()"
      class="full-width"
    >
      <mat-icon>location_on</mat-icon>
      Select Address
    </button>
  </div>

  <div *ngIf="selectedAddress" class="selected-address">
    <mat-card>
      <h4>{{ selectedAddress.label }}</h4>
      <p>{{ selectedAddress.fullAddress }}</p>
      <button 
        mat-button
        (click)="selectAddressForBooking()"
      >
        Change Address
      </button>
    </mat-card>
  </div>
</div>
```

---

## BACKEND - Booking Model Updates

Update `src/main/java/com/homy/backend/model/Booking.java`:

```java
@Column(name = "address_id")
private Long addressId;

// Getters and Setters
public Long getAddressId() { return addressId; }
public void setAddressId(Long addressId) { this.addressId = addressId; }
```

---

## API ENDPOINTS SUMMARY

### User Addresses API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/addresses` | Get all user addresses |
| POST | `/api/addresses` | Add new address |
| GET | `/api/addresses/{id}` | Get specific address |
| PUT | `/api/addresses/{id}` | Update address |
| DELETE | `/api/addresses/{id}` | Delete address |
| PUT | `/api/addresses/{id}/set-default` | Set as default |
| GET | `/api/addresses/default` | Get default address |

---

## FEATURES

✅ **Add Multiple Addresses** - Users can save addresses like Home, Office, etc.  
✅ **Address Types** - Home, Office, Other categories  
✅ **Default Address** - Preselect default on booking  
✅ **Address Labels** - Custom labels (My Home, Office, etc.)  
✅ **Soft Delete** - Addresses marked inactive instead of hard delete  
✅ **Full Address Building** - Automatically constructs complete address  
✅ **Location Support** - Latitude/Longitude for future maps integration  
✅ **Selection Dialog** - Zomato-style popup for address selection  
✅ **Responsive Design** - Works on mobile and desktop  

---

## NEXT STEPS

1. Run database migration
2. Import modules in Angular
3. Add routes to user routing module
4. Update booking flow to use address selection
5. Test address management UI
6. Test booking with address selection

---

## SECURITY NOTES

- Addresses are associated only with authenticated users
- Address endpoints use `@PreAuthorize("hasRole('USER')")`
- Users can only access their own addresses
- Soft delete prevents data loss
