import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookingService } from '../../core/services/booking.service';
import { ServiceService, Service } from '../../core/services/service.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  bookingForm: FormGroup;
  selectedService: string = 'cleaning';
  minDate: Date;
  services: Service[] = [];
  selectedServicePrice: number | null = null;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private snackBar: MatSnackBar,
    private serviceService: ServiceService
  ) {
    this.minDate = new Date();
    this.bookingForm = this.fb.group({
      fullName: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[A-Za-z ]+$/)
      ]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      serviceDate: ['', Validators.required],
      timeSlot: ['morning', Validators.required],
      details: ['', [Validators.maxLength(100)]],
      serviceType: ['cleaning', Validators.required]
    });
  }

  ngOnInit(): void {
    this.serviceService.services$.subscribe(list => {
      this.services = list || [];
      // Set default price if form already has a value
      const selected = this.services.find(s => s.id === this.bookingForm.get('serviceType')?.value || s.name === this.bookingForm.get('serviceType')?.value);
      this.selectedServicePrice = selected?.price ?? null;
    });
    this.serviceService.loadServices();

    this.bookingForm.get('serviceType')?.valueChanges.subscribe(val => {
      const svc = this.services.find(s => s.id === val || s.name === val);
      this.selectedServicePrice = svc?.price ?? null;
    });
  }

  selectService(service: string) {
    this.selectedService = service;
    this.bookingForm.patchValue({ serviceType: service });
    const svc = this.services.find(s => s.id === service || s.name === service);
    this.selectedServicePrice = svc?.price ?? null;
  }

  submit() {
    if (this.bookingForm.valid) {
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

      const bookingData = {
        name: this.bookingForm.get('fullName')?.value,
        email: this.bookingForm.get('email')?.value,
        phone: this.bookingForm.get('phone')?.value,
        service: this.bookingForm.get('serviceType')?.value,
        date: formattedDate,
        message: this.bookingForm.get('details')?.value,
        status: 'PENDING' as 'PENDING',
        price: this.selectedServicePrice ?? undefined
      };

      this.bookingService.addBooking(bookingData).subscribe({
        next: (saved) => {
          const bookingRef = saved.reference || this.generateBookingRef(saved.id);
          this.snackBar.open(
            `Booking submitted successfully! Reference: ${bookingRef}`,
            'Close',
            {
              duration: 5000,
              panelClass: ['success-snackbar']
            }
          );

          // Reset form only after successful save
          this.bookingForm.reset({
            timeSlot: 'morning',
            serviceType: 'cleaning'
          });
          this.selectedService = 'cleaning';
        },
        error: (err) => {
          console.error('Failed to submit booking', err);
          if (err && err.status === 409) {
            // Backend signals duplicate active booking for same service
            this.snackBar.open('You already have an active booking for this service.', 'Close', { duration: 6000, panelClass: ['warning-snackbar'] });
          } else {
            this.snackBar.open('Failed to submit booking. Please try again.', 'Close', { duration: 4000, panelClass: ['error-snackbar'] });
          }
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.bookingForm.controls).forEach(key => {
        this.bookingForm.get(key)?.markAsTouched();
      });
    }
  }

  generateBookingRef(bookingId?: number | string): string {
    const year = new Date().getFullYear();
    let num = 0;
    if (bookingId !== undefined && bookingId !== null) {
      const parsed = Number(bookingId);
      if (Number.isFinite(parsed) && !isNaN(parsed)) {
        num = Math.max(0, Math.floor(parsed));
      }
    }
    const serial = String(num).padStart(2, '0'); // 0001
    return `HOMY${year}${serial}`;
  }

}