import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { BookingService } from '../../core/services/booking.service';
import { ServiceService, Service } from '../../core/services/service.service';
import { UserAuthService } from '../../core/services/user-auth.service';
import { AddressService, UserAddress } from '../../core/services/address.service';
import { AddressSelectionDialogComponent } from '../address-selection-dialog/address-selection-dialog.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit, OnDestroy {
  bookingForm: FormGroup;
  selectedService: string | null = null;
  selectedAddress: UserAddress | null = null;
  minDate: Date;
  services: Service[] = [];
  selectedServicePrice: number | null = null;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private snackBar: MatSnackBar,
    private serviceService: ServiceService,
    public userAuthService: UserAuthService,
    private addressService: AddressService,
    private dialog: MatDialog
  ) {
    this.minDate = new Date();

    // Initialize the booking form
    // Note: Address is now selected separately from manage-addresses
    this.bookingForm = this.fb.group({
      serviceType: ['', Validators.required],
      serviceDate: ['', Validators.required],
      timeSlot: [''],
      details: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.serviceService.services$.subscribe(list => {
      // Filter to only active services for booking
      this.services = (list || []).filter(s => s.isActive !== false);
      const selected = this.services.find(s => 
        s.id === this.bookingForm.get('serviceType')?.value || 
        s.name === this.bookingForm.get('serviceType')?.value
      );
      this.selectedServicePrice = selected?.price ?? null;
    });
    this.serviceService.loadServices();

    this.bookingForm.get('serviceType')?.valueChanges.subscribe(val => {
      const svc = this.services.find(s => s.id === val || s.name === val);
      this.selectedServicePrice = svc?.price ?? null;
    });
  }

  ngOnDestroy(): void {
  }

  selectService(service: string) {
    this.selectedService = service;
    this.bookingForm.patchValue({ serviceType: service });
    const svc = this.services.find(s => s.id === service || s.name === service);
    this.selectedServicePrice = svc?.price ?? null;
  }

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
              window.location.href = '/user/addresses';
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

  submit() {
    // Validate form and address selection
    if (this.bookingForm.invalid) {
      this.snackBar.open('❌ Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    if (!this.selectedAddress) {
      this.snackBar.open('❌ Please select a delivery address first', 'Close', { duration: 3000 });
      return;
    }

    // Format date to dd/mm/yyyy
    const rawDate = this.bookingForm.get('serviceDate')?.value;
    let formattedDate = '';
    
    if (rawDate) {
      const date = new Date(rawDate);
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      formattedDate = `${dd}/${mm}/${yyyy}`;
    }

    // Build full address from selected address
    const addressParts = [
      this.selectedAddress.house,
      this.selectedAddress.area,
      this.selectedAddress.city,
      this.selectedAddress.landmark
    ].filter(Boolean);
    const fullAddress = addressParts.join(', ') + (this.selectedAddress.pincode ? ` - ${this.selectedAddress.pincode}` : '');

    // Get current user info
    const user = this.userAuthService.getCurrentUser();
    
    const bookingData: any = {
      name: user?.name || 'N/A',
      email: user?.email || 'N/A',
      phone: user?.phone || 'N/A',
      service: this.bookingForm.get('serviceType')?.value,
      date: formattedDate,
      message: this.bookingForm.get('details')?.value,
      timeSlot: this.bookingForm.get('timeSlot')?.value,
      address: fullAddress,
      addressId: this.selectedAddress.id,
      latitude: this.selectedAddress.latitude || null,
      longitude: this.selectedAddress.longitude || null,
      latLong: (this.selectedAddress.latitude && this.selectedAddress.longitude)
        ? `${this.selectedAddress.latitude},${this.selectedAddress.longitude}`
        : null,
      status: 'PENDING',
      price: this.selectedServicePrice ?? undefined,
      totalBookings: 1
    };

    // Call the booking service
    this.isSubmitting = true;
    this.bookingService.addBooking(bookingData).subscribe({
      next: (response: any) => {
        const bookingId = response.id || response.bookingId;
          const bookingRef = this.generateBookingRef(bookingId);
          
          this.snackBar.open(
            `Booking submitted successfully! Reference: ${bookingRef}`,
            'Close',
            {
              duration: 5000,
              panelClass: ['success-snackbar']
            }
          );

          // Reset form
          this.bookingForm.reset({});
          this.selectedService = null;
          this.selectedAddress = null;
          this.selectedServicePrice = null;
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Failed to submit booking', err);
          if (err && err.status === 409) {
            // 409 Conflict: Customer already has an active booking
            const existingBooking = err.error;
            const refNum = existingBooking?.reference || 'N/A';
            this.snackBar.open(
              `You already have an active booking (Reference: ${refNum}). Please complete or cancel it first.`, 
              'Close', 
              { 
                duration: 6000, 
                panelClass: ['warning-snackbar'] 
              }
            );
          } else {
            this.snackBar.open('Failed to submit booking. Please try again.', 'Close', { 
              duration: 4000, 
              panelClass: ['error-snackbar'] 
            });
          }
          this.isSubmitting = false;
        }
      });
  }

  generateBookingRef(bookingId?: number | string): string {
    const year = new Date().getFullYear();
    let num = 0;
    if (bookingId !== undefined && bookingId !== null) {
      const parsed = Number(bookingId);
      if (!isNaN(parsed)) {
        num = Math.max(0, Math.floor(parsed));
      }
    }
      const serial = String(num); // no zero-padding: e.g. 38 -> "38"
    return `HOMY${year}${serial}`;
  }

  /**
   * Check if the detected city/address is within service area.
   * Allowed cities: Bhubaneswar, BBSR, Cuttack (case-insensitive)
   */
  private checkServiceable(city: string, fullAddress?: string): boolean {
    if (!city && !fullAddress) return false;
    const c = (city || '').toString().toLowerCase();
    const f = (fullAddress || '').toString().toLowerCase();
    const allowed = [ 'khorda','bhubaneswar', 'bbsr', 'cuttack'];
    for (const a of allowed) {
      if (c.includes(a) || f.includes(a)) return true;
    }
    return false;
  }
}
