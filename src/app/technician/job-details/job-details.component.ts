import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TechnicianService } from '../../core/services/technician.service';

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.css']
})
export class JobDetailsComponent implements OnInit {
  job: any = {};
  isLoading: boolean = true;
  errorMessage: string = '';
  jobId: any;
  technicianId: any;
  isActionLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private techService: TechnicianService
  ) {}

  ngOnInit(): void {
    this.loadJobDetails();
  }

  loadJobDetails(): void {
    this.isLoading = true;
    this.jobId = this.route.snapshot.paramMap.get('id');
    
    try {
      const techData = localStorage.getItem('technician');
      if (techData) {
        const tech = JSON.parse(techData);
        this.technicianId = tech.id;
        
        // Load job details
        this.techService.getTechnicianJobs(this.technicianId).subscribe(
          (response: any) => {
            const allJobs = response.data || response || [];
            const foundJob = allJobs.find((j: any) => j.id == this.jobId);
            
            if (foundJob) {
              this.job = foundJob;
              this.isLoading = false;
            } else {
              this.errorMessage = 'Job not found';
              this.isLoading = false;
            }
          },
          (error: any) => {
            console.error('Error loading job details:', error);
            this.errorMessage = 'Failed to load job details';
            this.isLoading = false;
          }
        );
      } else {
        this.router.navigate(['/technician/login']);
      }
    } catch (error) {
      this.errorMessage = 'An error occurred';
      this.isLoading = false;
    }
  }

  startJob(): void {
    this.isActionLoading = true;
    // Implement job start logic
    setTimeout(() => {
      this.job.technicianStatus = 'IN_PROGRESS';
      this.isActionLoading = false;
    }, 1000);
  }

  completeJob(): void {
    this.isActionLoading = true;
    // Implement job completion logic
    setTimeout(() => {
      this.job.technicianStatus = 'COMPLETED';
      this.isActionLoading = false;
    }, 1000);
  }

  goBack(): void {
    this.router.navigate(['/technician/history']);
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'assigned': 'assigned',
      'accepted': 'accepted',
      'in_progress': 'in_progress',
      'completed': 'completed',
      'cancelled': 'cancelled'
    };
    return statusMap[(status || '').toLowerCase()] || 'assigned';
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'assigned': 'assignment',
      'accepted': 'check',
      'in_progress': 'engineering',
      'completed': 'check_circle',
      'cancelled': 'cancel'
    };
    return iconMap[(status || '').toLowerCase()] || 'assignment';
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  }

  formatTime(time: any): string {
    if (!time) return 'Flexible';
    return time;
  }

  getRoundedRating(rating: any): number {
    return Math.round(Number(rating) || 0);
  }
}
