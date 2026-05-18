import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TechnicianService } from '../../../core/services/technician.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-technician-details-dialog',
  templateUrl: './technician-details-dialog.component.html',
  styleUrls: ['./technician-details-dialog.component.css']
})
export class TechnicianDetailsDialogComponent {
  isDeactivating: boolean = false;
  isActivating: boolean = false;
  showDeactivationConfirm: boolean = false;
  deactivationReason: string = '';
  jobs: any[] = [];
  isLoadingJobs: boolean = false;
  isCancelingJob: boolean = false;
  cancelingJobId: number | null = null;

  constructor(
    public dialogRef: MatDialogRef<TechnicianDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public technician: any,
    private techService: TechnicianService,
    private snack: MatSnackBar
  ) {
    this.loadTechnicianJobs();
  }

  getInitials(name: string): string {
    return name
      ? name
          .split(' ')
          .map((n: string) => n.charAt(0))
          .join('')
          .toUpperCase()
      : '?';
  }

  getStatusColor(): string {
    if (this.technician.isActive === true) {
      return '#4caf50'; // green for active
    } else {
      return '#f44336'; // red for inactive
    }
  }

  loadTechnicianJobs(): void {
    this.isLoadingJobs = true;
    this.techService.getTechnicianJobsAsAdmin(this.technician.id).subscribe({
      next: (response: any) => {
        const bookings = response?.bookings || response || [];
        this.jobs = Array.isArray(bookings) ? bookings : [];
        
        // Update metrics
        this.technician.completedJobs = this.jobs.filter(
          (j: any) => j.status?.toLowerCase() === 'completed'
        ).length;
        this.technician.activeJobs = this.jobs.filter(
          (j: any) => j.status?.toLowerCase() === 'assigned' || j.status?.toLowerCase() === 'accepted' || j.status?.toLowerCase() === 'in_progress'
        ).length;
        
        this.isLoadingJobs = false;
      },
      error: (err: any) => {
        console.error('Error loading technician jobs:', err);
        this.isLoadingJobs = false;
        this.jobs = [];
      }
    });
  }

  getCompletedJobs(): number {
    return this.jobs.filter(
      (j: any) => j.status?.toLowerCase() === 'completed'
    ).length;
  }

  getActiveJobs(): number {
    return this.jobs.filter(
      (j: any) => j.status?.toLowerCase() === 'assigned' || j.status?.toLowerCase() === 'accepted' || j.status?.toLowerCase() === 'in_progress'
    ).length;
  }

  cancelJob(job: any): void {
    if (confirm(`Cancel job #${job.id}? This action cannot be undone.`)) {
      this.isCancelingJob = true;
      this.cancelingJobId = job.id;
      
      this.techService.cancelJob(job.id, this.technician.id).subscribe({
        next: () => {
          this.snack.open('Job cancelled successfully', 'Close', { duration: 2000 });
          this.loadTechnicianJobs();
          this.isCancelingJob = false;
          this.cancelingJobId = null;
        },
        error: (err) => {
          this.isCancelingJob = false;
          this.cancelingJobId = null;
          const errorMsg = err?.error?.error || 'Error cancelling job';
          this.snack.open(errorMsg, 'Close', { duration: 3000 });
        }
      });
    }
  }

  onDeactivateClick(): void {
    this.showDeactivationConfirm = true;
  }

  confirmDeactivate(): void {
    if (this.deactivationReason.trim().length < 3) {
      this.snack.open('Please provide a reason for deactivation', 'Close', { duration: 2000 });
      return;
    }

    this.isDeactivating = true;
    this.techService.updateStatus(this.technician.id, 'inactive').subscribe({
      next: () => {
        this.technician.isActive = false;
        this.technician.deactivatedAt = new Date().toISOString();
        this.technician.deactivationReason = this.deactivationReason;
        this.snack.open('Technician account deactivated successfully', 'Close', { duration: 2000 });
        this.showDeactivationConfirm = false;
        this.isDeactivating = false;
        setTimeout(() => {
          this.dialogRef.close(this.technician);
        }, 500);
      },
      error: (err) => {
        this.isDeactivating = false;
        const errorMsg = err?.error?.error || err?.error?.message || 'Error deactivating technician';
        console.error('Deactivation error:', err);
        this.snack.open(errorMsg, 'Close', { duration: 3000 });
      }
    });
  }

  onActivateClick(): void {
    if (confirm(`Activate ${this.technician.name}?`)) {
      this.isActivating = true;
      this.techService.updateStatus(this.technician.id, 'active').subscribe({
        next: () => {
          this.technician.isActive = true;
          this.snack.open('Technician account activated successfully', 'Close', { duration: 2000 });
          this.isActivating = false;
          setTimeout(() => {
            this.dialogRef.close(this.technician);
          }, 500);
        },
        error: (err) => {
          this.isActivating = false;
          const errorMsg = err?.error?.error || err?.error?.message || 'Error activating technician';
          console.error('Activation error:', err);
          this.snack.open(errorMsg, 'Close', { duration: 3000 });
        }
      });
    }
  }

  cancelDeactivation(): void {
    this.showDeactivationConfirm = false;
    this.deactivationReason = '';
  }

  close(): void {
    this.dialogRef.close();
  }
}
