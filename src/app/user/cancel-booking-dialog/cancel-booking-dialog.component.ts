import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

@Component({
  selector: 'app-cancel-booking-dialog',
  templateUrl: './cancel-booking-dialog.component.html',
  styleUrls: ['./cancel-booking-dialog.component.css']
})
export class CancelBookingDialogComponent implements OnInit {
  cancelForm: FormGroup;
  isSubmitting: boolean = false;

  cancelReasons: string[] = [
    'Change of plans',
    'Emergency',
    'Need to reschedule',
    'Found alternative service',
    'Technical issues',
    'Other'
  ];

  constructor(
    private dialogRef: MatDialogRef<CancelBookingDialogComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.cancelForm = this.formBuilder.group({
      reason: ['', [Validators.required, Validators.minLength(5)]],
      feedback: ['', Validators.minLength(10)]
    });
  }

  ngOnInit(): void {
  }

  /**
   * Submit cancellation
   */
  onSubmit(): void {
    if (this.cancelForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    // Simulate a small delay for UX
    setTimeout(() => {
      this.dialogRef.close({
        confirmed: true,
        reason: this.cancelForm.get('reason')?.value,
        feedback: this.cancelForm.get('feedback')?.value || ''
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
   * Get error message for reason field
   */
  getReasonErrorMessage(): string {
    const control = this.cancelForm.get('reason');
    if (control?.hasError('required')) {
      return 'Please select a reason for cancellation';
    }
    if (control?.hasError('minlength')) {
      return 'Reason must be at least 5 characters';
    }
    return '';
  }
}
