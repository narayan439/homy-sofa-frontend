import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceService } from '../../core/services/service.service';

interface UserBooking {
  id: number;
  serviceName: string;
  bookingDate: string;
  status: string;
  totalAmount: number;
  technician?: {
    name: string;
    phone: string;
  };
}

interface DialogData {
  booking: UserBooking;
}

interface ServiceOption {
  id: number;
  name: string;
  price: number;
  description?: string;
}

@Component({
  selector: 'app-add-service-dialog',
  templateUrl: './add-service-dialog.component.html',
  styleUrls: ['./add-service-dialog.component.css']
})
export class AddServiceDialogComponent implements OnInit {
  addServiceForm: FormGroup;
  isSubmitting: boolean = false;
  isLoadingServices: boolean = false;
  services: ServiceOption[] = [];

  constructor(
    private dialogRef: MatDialogRef<AddServiceDialogComponent>,
    private formBuilder: FormBuilder,
    private serviceService: ServiceService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.addServiceForm = this.formBuilder.group({
      serviceName: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(100)]]
    });
  }

  ngOnInit(): void {
    this.loadServices();
  }

  /**
   * Load available services
   */
  private loadServices(): void {
    this.isLoadingServices = true;
    this.serviceService.getServices()
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.services = response.data;
          }
          this.isLoadingServices = false;
        },
        error: (error: any) => {
          console.error('Error loading services:', error);
          this.isLoadingServices = false;
        }
      });
  }

  /**
   * Handle service selection change
   */
  onServiceChange(selectedService: ServiceOption): void {
    if (selectedService && selectedService.price) {
      this.addServiceForm.patchValue({
        price: selectedService.price
      });
    }
  }

  /**
   * Submit add service request
   */
  onSubmit(): void {
    if (this.addServiceForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    // Simulate a small delay for UX
    setTimeout(() => {
      this.dialogRef.close({
        confirmed: true,
        serviceName: this.addServiceForm.get('serviceName')?.value,
        price: this.addServiceForm.get('price')?.value
      });
    }, 300);
  }

  /**
   * Cancel dialog without action
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  }

  /**
   * Calculate new total
   */
  getNewTotal(): number {
    const currentAmount = this.data.booking.totalAmount || 0;
    const additionalPrice = this.addServiceForm.get('price')?.value || 0;
    return currentAmount + additionalPrice;
  }

  /**
   * Get price error message
   */
  getPriceErrorMessage(): string {
    const control = this.addServiceForm.get('price');
    if (control?.hasError('required')) {
      return 'Price is required';
    }
    if (control?.hasError('min')) {
      return 'Minimum price must be 100 PKR';
    }
    return '';
  }
}
