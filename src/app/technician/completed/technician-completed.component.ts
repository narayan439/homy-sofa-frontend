import { Component, OnInit } from '@angular/core';
import { TechnicianService } from '../../core/services/technician.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-technician-completed',
  templateUrl: './technician-completed.component.html',
  styleUrls: ['./technician-completed.component.css']
})
export class TechnicianCompletedComponent implements OnInit {
  completedJobs: any[] = [];
  filteredJobs: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  technicianId: any;
  
  // Stats
  totalCompleted: number = 0;
  totalEarnings: number = 0;
  averageRating: number = 0;
  
  // Filter options
  searchTerm: string = '';
  selectedSort: string = 'recent';

  constructor(
    private techService: TechnicianService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCompletedJobs();
  }

  loadCompletedJobs(): void {
    this.isLoading = true;
    try {
      const techData = localStorage.getItem('technician');
      if (techData) {
        const tech = JSON.parse(techData);
        this.technicianId = tech.id;
        
        // Load completed jobs for this technician
        this.techService.getTechnicianJobs(this.technicianId).subscribe(
          (response: any) => {
            const allJobs = response.data || response || [];
            
            // Filter only completed jobs
            this.completedJobs = allJobs.filter((job: any) => {
              const status = (job.technicianStatus || job.status || '').toLowerCase();
              return status === 'completed';
            });
            
            this.calculateStats();
            this.applyFilters();
            this.isLoading = false;
          },
          (error: any) => {
            console.error('Error loading completed jobs:', error);
            this.errorMessage = 'Failed to load completed jobs';
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

  calculateStats(): void {
    this.totalCompleted = this.completedJobs.length;
    
    // Calculate total earnings
    this.totalEarnings = this.completedJobs.reduce((sum, job) => {
      return sum + (Number(job.amount || job.price) || 0);
    }, 0);
    
    // Calculate average rating
    const jobsWithRating = this.completedJobs.filter(job => job.rating || job.customerRating);
    if (jobsWithRating.length > 0) {
      const totalRating = jobsWithRating.reduce((sum, job) => {
        return sum + (Number(job.rating || job.customerRating) || 0);
      }, 0);
      this.averageRating = totalRating / jobsWithRating.length;
    } else {
      this.averageRating = 0;
    }
  }

  applyFilters(): void {
    let filtered = [...this.completedJobs];

    // Filter by search term
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(job => {
        const name = (job.name || job.customerName || '').toLowerCase();
        const service = (job.service || job.serviceName || '').toLowerCase();
        const address = (job.address || '').toLowerCase();
        return name.includes(searchLower) || service.includes(searchLower) || address.includes(searchLower);
      });
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.date || a.bookingDate || 0).getTime();
      const dateB = new Date(b.date || b.bookingDate || 0).getTime();
      
      if (this.selectedSort === 'recent') {
        return dateB - dateA;
      } else if (this.selectedSort === 'oldest') {
        return dateA - dateB;
      } else if (this.selectedSort === 'highest_earning') {
        return (Number(b.amount || b.price) || 0) - (Number(a.amount || a.price) || 0);
      }
      return dateB - dateA;
    });

    this.filteredJobs = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  viewJobDetails(jobId: any): void {
    this.router.navigate(['/technician/job-details', jobId]);
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
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

  getRatingStars(rating: any): number {
    return Math.round(Number(rating) || 0);
  }
}
