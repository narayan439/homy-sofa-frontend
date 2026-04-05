import { Component, OnInit } from '@angular/core';
import { TechnicianService } from '../../core/services/technician.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-technician-history',
  templateUrl: './technician-history.component.html',
  styleUrls: ['./technician-history.component.css']
})
export class TechnicianHistoryComponent implements OnInit {
  allJobs: any[] = [];
  filteredJobs: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  technicianId: any;
  
  // Filter options
  selectedStatus: string = 'all';
  searchTerm: string = '';
  selectedDateSort: string = 'recent';

  statusOptions = [
    { value: 'all', label: 'All Jobs' },
  
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  constructor(
    private techService: TechnicianService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadJobHistory();
  }

  loadJobHistory(): void {
    this.isLoading = true;
    try {
      const techData = localStorage.getItem('technician');
      if (techData) {
        const tech = JSON.parse(techData);
        this.technicianId = tech.id;
        
        // Load all jobs (including completed/cancelled) using paginated endpoint
        // Fetch multiple pages to ensure we get all historical data
        const pages: any[] = [];
        let currentPage = 0;
        const pageSize = 50;
        let totalPages = 1;

        const loadPage = (pageNum: number) => {
          this.techService.getBookingsForTechnician(this.technicianId, pageNum, pageSize).subscribe({
            next: (response: any) => {
              if (response.bookings && response.bookings.length > 0) {
                pages.push(...response.bookings);
              }
              
              // Calculate total pages if not already known
              if (pageNum === 0 && response.total) {
                totalPages = Math.ceil(response.total / pageSize);
              }

              // Load next page if available
              if (pageNum + 1 < totalPages && pageNum < 5) { // Limit to 5 pages to avoid too many requests
                loadPage(pageNum + 1);
              } else {
                // All pages loaded - filter for history (COMPLETED, CANCELLED)
                this.allJobs = pages.filter((job: any) => {
                  const status = String(job.technicianStatus || '').toUpperCase();
                  return status === 'COMPLETED' || status === 'CANCELLED';
                });
                
                this.applyFilters();
                this.isLoading = false;
                console.log('History loaded:', this.allJobs.length, 'jobs');
              }
            },
            error: (error: any) => {
              console.error('Error loading job history page', pageNum, ':', error);
              if (pageNum === 0) {
                this.errorMessage = 'Failed to load job history';
                this.isLoading = false;
              } else {
                // Continue with what we have
                this.allJobs = pages.filter((job: any) => {
                  const status = String(job.technicianStatus || '').toUpperCase();
                  return status === 'COMPLETED' || status === 'CANCELLED';
                });
                this.applyFilters();
                this.isLoading = false;
              }
            }
          });
        };

        loadPage(0);
      } else {
        this.router.navigate(['/technician/login']);
      }
    } catch (error) {
      this.errorMessage = 'An error occurred';
      this.isLoading = false;
    }
  }

  applyFilters(): void {
    let filtered = [...this.allJobs];

    // Filter by status
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter((job: any) => {
        const jobStatus = (job.technicianStatus || job.status || '').toLowerCase();
        return jobStatus === this.selectedStatus.toLowerCase();
      });
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter((job: any) => {
        const name = (job.name || job.customerName || '').toLowerCase();
        const service = (job.service || job.serviceName || '').toLowerCase();
        const address = (job.address || '').toLowerCase();
        return name.includes(searchLower) || service.includes(searchLower) || address.includes(searchLower);
      });
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date || a.bookingDate || 0).getTime();
      const dateB = new Date(b.date || b.bookingDate || 0).getTime();
      return this.selectedDateSort === 'recent' ? dateB - dateA : dateA - dateB;
    });

    this.filteredJobs = filtered;
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onDateSortChange(): void {
    this.applyFilters();
  }

  viewJobDetails(jobId: any): void {
    this.router.navigate(['/technician/job-details', jobId]);
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
}
