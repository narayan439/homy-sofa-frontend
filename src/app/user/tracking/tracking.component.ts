import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.components.html',
  styleUrls: ['./tracking.component.css']
})
export class TrackingComponent implements OnInit {
  trackingForm!: FormGroup;
  isLoading = false;
  searchAttempted = false;
  bookingDetails: any = null;
  errorMessage = '';

  // Status timeline
  statusTimeline = [
    { status: 'PENDING', label: 'Booking Confirmed', icon: 'check_circle', completed: false, date: null },
    { status: 'ASSIGNED', label: 'Technician Assigned', icon: 'person', completed: false, date: null },
    { status: 'IN_PROGRESS', label: 'Service In Progress', icon: 'build', completed: false, date: null },
    { status: 'COMPLETED', label: 'Service Completed', icon: 'task_alt', completed: false, date: null }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private bookingService: BookingService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    
    // Check if booking data was passed from navigation using history state
    const state = (history as any).state;
    
    if (state && state['bookingData']) {
      // Pre-fill form with booking data
      const booking = state['bookingData'];
      this.trackingForm.patchValue({
        trackingId: booking.reference || '',
        phoneNumber: state['phone'] || ''
      });
      
      // Auto-search with pre-filled data
      if (booking.reference && state['phone']) {
        this.searchAttempted = true;
        this.bookingDetails = this.mapBookingDetails(booking);
        this.updateStatusTimeline();
      }
    }
  }

  initializeForm(): void {
    this.trackingForm = this.formBuilder.group({
      trackingId: ['', [Validators.required, Validators.minLength(3)]],
      phoneNumber: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  trackBooking(): void {
    if (this.trackingForm.invalid) {
      const errors = [];
      if (this.trackingForm.get('trackingId')?.hasError('required')) {
        errors.push('Booking Reference/ID is required');
      }
      if (this.trackingForm.get('phoneNumber')?.hasError('required')) {
        errors.push('Phone Number is required');
      }
      if (this.trackingForm.get('phoneNumber')?.hasError('minlength')) {
        errors.push('Phone Number must be at least 10 digits');
      }
      this.snackBar.open(errors.join(' | '), 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.searchAttempted = true;
    this.errorMessage = '';
    this.bookingDetails = null;

    const trackingId = this.trackingForm.get('trackingId')?.value?.trim();
    const phoneNumber = this.trackingForm.get('phoneNumber')?.value?.trim();

    console.log('Searching for booking:', { trackingId, phoneNumber });

    // Call booking service with both tracking ID and phone number
    this.bookingService.searchBookingByIdAndPhone(trackingId, phoneNumber).subscribe({
      next: (result: any) => {
        this.isLoading = false;
        console.log('Search result:', result);
        
        if (result && result.success && result.data) {
          const bookingData = Array.isArray(result.data) ? result.data[0] : result.data;
          
          if (bookingData && this.isValidBooking(bookingData)) {
            this.bookingDetails = this.mapBookingDetails(bookingData);
            this.updateStatusTimeline();
            this.snackBar.open('✓ Booking found successfully!', 'Close', { duration: 2000 });
          } else {
            this.errorMessage = 'No booking found matching the provided reference and phone number.';
          }
        } else if (result && result.data) {
          // Handle success without explicit success flag
          const bookingData = Array.isArray(result.data) ? result.data[0] : result.data;
          if (bookingData && this.isValidBooking(bookingData)) {
            this.bookingDetails = this.mapBookingDetails(bookingData);
            this.updateStatusTimeline();
            this.snackBar.open('✓ Booking found successfully!', 'Close', { duration: 2000 });
          } else {
            this.errorMessage = 'No booking found matching the provided reference and phone number.';
          }
        } else if (result && result.id) {
          // Handle direct object response
          if (this.isValidBooking(result)) {
            this.bookingDetails = this.mapBookingDetails(result);
            this.updateStatusTimeline();
            this.snackBar.open('✓ Booking found successfully!', 'Close', { duration: 2000 });
          } else {
            this.errorMessage = 'No booking found matching the provided reference and phone number.';
          }
        } else if (Array.isArray(result) && result.length > 0 && this.isValidBooking(result[0])) {
          // Handle array response
          this.bookingDetails = this.mapBookingDetails(result[0]);
          this.updateStatusTimeline();
          this.snackBar.open('✓ Booking found successfully!', 'Close', { duration: 2000 });
        } else {
          this.errorMessage = 'No booking found matching the provided reference and phone number.';
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Search error:', error);
        
        if (error.status === 404) {
          this.errorMessage = 'No booking found with the provided tracking ID and phone number.';
        } else if (error.status === 400) {
          this.errorMessage = 'Invalid tracking ID or phone number format. Please check and try again.';
        } else if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'Verification failed. The phone number does not match this booking.';
        } else {
          this.errorMessage = 'Unable to search for booking. Please try again later.';
        }
        
        this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
      }
    });
  }

  isValidBooking(data: any): boolean {
    return data && (data.id || data.bookingId || data.booking_id);
  }

  mapBookingDetails(data: any): any {
    // Map backend response to our display format
    return {
      id: data.id,
      bookingReference: data.bookingReference || data.referenceNumber || data.booking_reference || data.reference || `HOMY2026${data.id}`,
      // Customer Details - priority: customerName from dashboard, then name from backend
      name: data.customerName || data.name || data.customerName || data.customer_name || '-',
      phone: data.customerPhone || data.phone || data.phoneNumber || data.phone_number || '-',
      email: data.customerEmail || data.email || '-',
      address: data.address || '-',
      // Service Details
      service: data.service || data.serviceName || data.service_name || '-',
      date: data.date || data.bookingDate || data.booking_date || data.serviceDate || '-',
      time: data.timeSlot || data.time || data.time_slot || data.serviceTime || '-',
      price: data.price || data.amount || data.totalAmount || data.total_amount || '-',
      // Booking Status
      status: data.status || data.bookingStatus || data.booking_status || 'PENDING',
      technicianStatus: data.technicianStatus || data.technician_status || data.status || 'PENDING',
      // Technician Details
      technicianName: data.technicianName || data.technician_name || '-',
      technicianPhone: data.technicianPhone || data.technician_phone || data.technicianMobile || data.technician_mobile || '-',
      completionDate: data.completionDate || data.completedAt || data.completed_at || null,
      // Payment Details
      paymentStatus: data.paymentStatus || data.payment_status || 'PENDING',
      paymentMethod: data.paymentMethod || data.payment_method || 'NOT  YET DONE',
      paymentTimestamp: data.paymentTimestamp || data.payment_timestamp || null,
      // Additional Details
      estimatedCompletionTime: data.estimatedCompletionTime || data.estimated_completion_time || null,
      completedAt: data.completedAt || data.completed_at || null,
      createdAt: data.createdAt || data.created_at || new Date().toISOString()
    };
  }

  updateStatusTimeline(): void {
    if (!this.bookingDetails) return;

    const currentStatus = this.bookingDetails.technicianStatus || this.bookingDetails.status || 'PENDING';
    const statusOrder: any = {
      'PENDING': 0,
      'ASSIGNED': 1,
      'IN_PROGRESS': 2,
      'COMPLETED': 3,
      'CANCELLED': -1
    };

    const currentIndex = statusOrder[currentStatus] || 0;
    const created = this.bookingDetails.createdAt;
    const completed = this.bookingDetails.completionDate || this.bookingDetails.completedAt || null;

    this.statusTimeline.forEach((item, index) => {
      item.completed = index <= currentIndex;
      // Attach date when available
      if (item.status === 'PENDING') {
        item.date = created || '-';
      } else if (item.status === 'COMPLETED') {
        item.date = completed || '-';
      } else {
        item.date = item.completed ? (this.bookingDetails.estimatedCompletionTime || '-') : '-';
      }
    });
  }

  getStatusIcon(status: string): string {
    const iconMap: any = {
      'PENDING': 'check_circle',
      'ASSIGNED': 'person',
      'IN_PROGRESS': 'build',
      'COMPLETED': 'task_alt',
      'CANCELLED': 'cancel'
    };
    return iconMap[status] || 'help_outline';
  }

  getTechStatusIcon(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ASSIGNED': return 'person_check';
      case 'IN_PROGRESS': return 'engineering';
      case 'COMPLETED': return 'done_circle';
      default: return 'hourglass_empty';
    }
  }

  getBookingStatusIcon(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'schedule';
      case 'CONFIRMED': return 'check_circle';
      case 'IN_PROGRESS': return 'build';
      case 'COMPLETED': return 'task_alt';
      case 'CANCELLED': return 'cancel';
      default: return 'info';
    }
  }

  getStatusClass(status: string): string {
    if (!status) return 'pending';
    const statusLower = String(status).toUpperCase();
    const classMap: any = {
      'PENDING': 'pending',
      'ASSIGNED': 'assigned',
      'IN_PROGRESS': 'in_progress',
      'COMPLETED': 'completed',
      'CANCELLED': 'cancelled'
    };
    return classMap[statusLower] || 'pending';
  }

  formatDate(date: any): string {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return date;
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return date || '-';
    }
  }

  formatTime(time: any): string {
    if (!time) return '-';
    return String(time);
  }

  clearSearch(): void {
    this.trackingForm.reset({ trackingId: '', phoneNumber: '' });
    this.bookingDetails = null;
    this.errorMessage = '';
    this.searchAttempted = false;
  }
}
