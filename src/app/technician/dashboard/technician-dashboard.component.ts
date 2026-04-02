import { Component, OnInit } from '@angular/core';
import { TechnicianService } from '../../core/services/technician.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-technician-dashboard',
  templateUrl: './technician-dashboard.component.html',
  styleUrls: ['./technician-dashboard.component.css']
})
export class TechnicianDashboardComponent implements OnInit {
  technician: any = {};
  technicianName: string = 'Technician';
  technicianId: any;

  // Dashboard stats
  assignedJobs: any[] = [];
  todaysJobs: any[] = [];
  inProgressJobs: any[] = [];
  completedJobs: any[] = [];
  allJobs: any[] = [];

  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private techService: TechnicianService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTechnicianData();
  }

  loadTechnicianData(): void {
    this.isLoading = true;
    
    try {
      // Get technician from localStorage
      const techData = localStorage.getItem('technician');
      if (techData) {
        this.technician = JSON.parse(techData);
        this.technicianId = this.technician.id;
        this.technicianName = this.technician.name || 'Technician';
        
        // Load technician's jobs
        this.loadTechnicianJobs();
      } else {
        // No technician logged in, redirect to login
        this.router.navigate(['/technician/login']);
      }
    } catch (error) {
      console.error('Error loading technician data:', error);
      this.errorMessage = 'Failed to load technician data';
      this.isLoading = false;
    }
  }

  loadTechnicianJobs(): void {
    if (!this.technicianId) return;

    this.techService.getBookingsForTechnician(this.technicianId).subscribe({
      next: (response: any) => {
        console.log('API Response:', response); // Debug log
        
        // Handle different response formats
        let jobs: any[] = [];
        if (Array.isArray(response)) {
          jobs = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          jobs = response.data;
        } else if (response && response.bookings && Array.isArray(response.bookings)) {
          jobs = response.bookings;
        } else if (response && typeof response === 'object') {
          jobs = [response]; // Single booking object
        }

        // Enrich jobs with customer and address information
        this.allJobs = this.enrichJobs(jobs);
        this.processJobs(this.allJobs);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
        this.errorMessage = 'Failed to load jobs. Please try again.';
        this.isLoading = false;
      }
    });
  }

  enrichJobs(jobs: any[]): any[] {
    return jobs.map(job => ({
      ...job,
      customerName: job.name || job.customerName || 'Unknown Customer',
      customerEmail: job.email || job.customerEmail || '',
      customerPhone: job.phone || job.customerPhone || '',
      address: job.address || '',
      serviceType: job.service || job.serviceName || 'Service',
      bookingDate: job.date || job.bookingDate || job.createdAt
    }));
  }

  processJobs(jobs: any[]): void {
    // Clear previous filters
    this.assignedJobs = [];
    this.todaysJobs = [];
    this.inProgressJobs = [];
    this.completedJobs = [];

    const today = new Date().toDateString();

    jobs.forEach(job => {
      // Normalize status (handle both technicianStatus and status fields)
      const techStatus = job.technicianStatus ? job.technicianStatus.toUpperCase() : null;
      const bookingStatus = job.status ? job.status.toUpperCase() : null;
      const displayStatus = techStatus || bookingStatus || '';

      // Check if this job belongs to this technician
      const jobTechId = job.technicianId ? String(job.technicianId) : null;
      const currentTechId = String(this.technicianId);

      if (jobTechId !== currentTechId) {
        // Job not assigned to this technician
        return;
      }

      // Filter by ASSIGNED status
      if (displayStatus === 'ASSIGNED') {
        this.assignedJobs.push(job);
      }

      // Filter by IN_PROGRESS status
      if (displayStatus === 'IN_PROGRESS' || displayStatus === 'INPROGRESS') {
        this.inProgressJobs.push(job);
      }

      // Filter by COMPLETED status
      if (displayStatus === 'COMPLETED') {
        this.completedJobs.push(job);
      }

      // Filter by today's date
      const jobDate = job.bookingDate || job.date || job.createdAt;
      if (jobDate && new Date(jobDate).toDateString() === today) {
        this.todaysJobs.push(job);
      }
    });

    console.log('Processed jobs:', {
      assigned: this.assignedJobs.length,
      today: this.todaysJobs.length,
      inProgress: this.inProgressJobs.length,
      completed: this.completedJobs.length
    });
  }

  // Helper methods for status styling
  getStatusClass(status: string): string {
    const statusUpper = (status || '').toUpperCase();
    switch(statusUpper) {
      case 'ASSIGNED': return 'status-assigned';
      case 'IN_PROGRESS':
      case 'INPROGRESS': return 'status-inprogress';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getStatusIcon(status: string): string {
    const statusUpper = (status || '').toUpperCase();
    switch(statusUpper) {
      case 'ASSIGNED': return 'assignment';
      case 'IN_PROGRESS':
      case 'INPROGRESS': return 'engineering';
      case 'COMPLETED': return 'check_circle';
      case 'CANCELLED': return 'cancel';
      default: return 'schedule';
    }
  }

  // Action methods
  startJob(jobId: string): void {
    this.router.navigate(['/technician/job', jobId, 'start']);
  }

  viewJobDetails(jobId: string): void {
    this.router.navigate(['/technician/job', jobId]);
  }

  completeJob(jobId: string): void {
    this.router.navigate(['/technician/job', jobId, 'complete']);
  }

  refreshDashboard(): void {
    this.loadTechnicianJobs();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatTime(timeSlot: string): string {
    if (!timeSlot) return 'N/A';
    return timeSlot;
  }

  getTodayDate(): Date {
    return new Date();
  }

}