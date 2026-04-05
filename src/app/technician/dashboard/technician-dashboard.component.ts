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
        this.technicianId = this.technician.id || this.technician.technicianId;
        this.technicianName = this.technician.name || this.technician.fullName || 'Technician';
        
        console.log('Technician loaded:', this.technician);
        console.log('Technician ID:', this.technicianId);
        
        // Load technician's jobs
        this.loadTechnicianJobs();
      } else {
        console.error('No technician found in localStorage');
        this.errorMessage = 'No technician logged in. Please login again.';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/technician/login']);
        }, 2000);
      }
    } catch (error) {
      console.error('Error loading technician data:', error);
      this.errorMessage = 'Failed to load technician data';
      this.isLoading = false;
    }
  }

  loadTechnicianJobs(): void {
    if (!this.technicianId) {
      console.error('No technician ID available');
      this.errorMessage = 'Technician ID not found';
      this.isLoading = false;
      return;
    }

    console.log('Loading jobs for technician ID:', this.technicianId);

    this.techService.getBookingsForTechnician(this.technicianId).subscribe({
      next: (response: any) => {
        console.log('API Response received:', response);
        console.log('Raw API Response (Pretty JSON):\n', JSON.stringify(response, null, 2));
        
        // Handle different response formats
        let jobs: any[] = [];
        
        if (Array.isArray(response)) {
          jobs = response;
          console.log('Response is direct array, count:', jobs.length);
        } else if (response && response.data && Array.isArray(response.data)) {
          jobs = response.data;
          console.log('Response has data array, count:', jobs.length);
        } else if (response && response.bookings && Array.isArray(response.bookings)) {
          jobs = response.bookings;
          console.log('Response has bookings array, count:', jobs.length);
        } else if (response && response.content && Array.isArray(response.content)) {
          jobs = response.content;
          console.log('Response has content array, count:', jobs.length);
        } else if (response && typeof response === 'object') {
          // Check if it's a single booking object
          if (response.id || response.bookingId) {
            jobs = [response];
            console.log('Response is single booking object');
          }
        }

        // Log raw jobs address data before enrichment
        if (jobs.length > 0) {
          console.log('First 3 raw jobs (address fields):', jobs.slice(0, 3).map(j => ({
            id: j.id || j.bookingId,
            address: j.address,
            serviceAddress: j.serviceAddress,
            customerAddress: j.customerAddress,
            addressText: j.addressText,
            all_address_fields: Object.keys(j).filter(k => k.toLowerCase().includes('address'))
          })));
        }

        // Enrich jobs with customer and address information
        this.allJobs = this.enrichJobs(jobs);
        console.log('Enriched jobs count:', this.allJobs.length);
        
        // Log enriched jobs
        if (this.allJobs.length > 0) {
          console.log('First enriched job:', this.allJobs[0]);
          console.log('First 3 enriched jobs (address field):', this.allJobs.slice(0, 3).map((j, i) => ({
            id: j.id,
            address: j.address,
            fullAddress: j.fullAddress
          })));
        }
        
        this.processJobs(this.allJobs);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
        this.errorMessage = error.error?.message || error.message || 'Failed to load jobs. Please try again.';
        this.isLoading = false;
      }
    });
  }

  enrichJobs(jobs: any[]): any[] {
    return jobs.map(job => {
      console.log('Processing job:', job.id || job.bookingId);
      
      // ==================== ADDRESS EXTRACTION - FIXED ====================
      let finalAddress = 'No address provided';
      
      // Try all possible address fields
      const addressFields = [
        'address', 'serviceAddress', 'customerAddress', 'addressText', 'address_text',
        'fullAddress', 'full_address', 'location', 'service_location', 'customer_location',
        'bookingAddress', 'jobAddress', 'addressLine', 'address_line', 'street',
        'house', 'area', 'city', 'landmark', 'pincode', 'postalCode'
      ];
      
      // First check direct string fields
      for (const field of addressFields) {
        const value = job[field];
        if (value && typeof value === 'string' && value.trim().length > 0) {
          finalAddress = value.trim();
          console.log(`Found address in field "${field}":`, finalAddress);
          break;
        }
      }
      
      // If still no address, try to build from components
      if (finalAddress === 'No address provided') {
        const addressParts = [];
        if (job.house) addressParts.push(job.house);
        if (job.street) addressParts.push(job.street);
        if (job.area) addressParts.push(job.area);
        if (job.landmark) addressParts.push(job.landmark);
        if (job.city) addressParts.push(job.city);
        if (job.district) addressParts.push(job.district);
        if (job.state) addressParts.push(job.state);
        if (job.pincode) addressParts.push(job.pincode);
        if (job.zipCode) addressParts.push(job.zipCode);
        
        if (addressParts.length > 0) {
          finalAddress = addressParts.filter(p => p && p.trim()).join(', ');
          console.log('Built address from components:', finalAddress);
        }
      }
      
      // Check nested objects for address
      if (finalAddress === 'No address provided' && job.customer && typeof job.customer === 'object') {
        const customer = job.customer;
        if (customer.address) finalAddress = customer.address;
        else if (customer.location) finalAddress = customer.location;
        else if (customer.fullAddress) finalAddress = customer.fullAddress;
      }
      
      if (finalAddress === 'No address provided' && job.user && typeof job.user === 'object') {
        const user = job.user;
        if (user.address) finalAddress = user.address;
        else if (user.location) finalAddress = user.location;
      }
      
      // ==================== DATE FORMATTING - FIXED ====================
      let bookingDate = null;
      const dateFields = ['bookingDate', 'date', 'createdAt', 'created_at', 'scheduledDate', 'scheduled_date', 'jobDate', 'serviceDate'];
      
      for (const field of dateFields) {
        const value = job[field];
        if (value) {
          try {
            const parsedDate = new Date(value);
            if (!isNaN(parsedDate.getTime())) {
              bookingDate = parsedDate;
              console.log(`Found date in field "${field}":`, bookingDate);
              break;
            }
          } catch (e) {
            console.warn(`Could not parse date from field ${field}:`, value);
          }
        }
      }
      
      if (!bookingDate) {
        bookingDate = new Date();
      }
      
      // ==================== TIME SLOT EXTRACTION ====================
      let timeSlot = 'Flexible';
      const timeFields = ['timeSlot', 'time', 'slot', 'time_slot', 'bookingTime', 'preferredTime', 'appointmentTime'];
      
      for (const field of timeFields) {
        if (job[field]) {
          timeSlot = job[field];
          break;
        }
      }
      
      // ==================== STATUS EXTRACTION ====================
      let status = 'ASSIGNED';
      const statusFields = ['technicianStatus', 'status', 'bookingStatus', 'jobStatus', 'currentStatus'];
      
      for (const field of statusFields) {
        if (job[field]) {
          status = String(job[field]).toUpperCase();
          break;
        }
      }
      
      // ==================== CUSTOMER INFO EXTRACTION ====================
      let customerName = 'Customer';
      const nameFields = ['name', 'customerName', 'fullName', 'userName', 'customer.name', 'user.name'];
      
      for (const field of nameFields) {
        if (field.includes('.')) {
          const parts = field.split('.');
          let value = job;
          for (const part of parts) {
            if (value && value[part] !== undefined) {
              value = value[part];
            } else {
              value = null;
              break;
            }
          }
          if (value && typeof value === 'string') {
            customerName = value;
            break;
          }
        } else if (job[field]) {
          customerName = job[field];
          break;
        }
      }
      
      let customerPhone = '';
      const phoneFields = ['phone', 'customerPhone', 'mobile', 'contact', 'customer.phone', 'user.phone'];
      
      for (const field of phoneFields) {
        if (field.includes('.')) {
          const parts = field.split('.');
          let value = job;
          for (const part of parts) {
            if (value && value[part] !== undefined) {
              value = value[part];
            } else {
              value = null;
              break;
            }
          }
          if (value) {
            customerPhone = value;
            break;
          }
        } else if (job[field]) {
          customerPhone = job[field];
          break;
        }
      }
      
      let serviceName = 'Service';
      const serviceFields = ['service', 'serviceName', 'serviceType', 'service_name', 'service_type'];
      
      for (const field of serviceFields) {
        if (job[field]) {
          serviceName = job[field];
          break;
        }
      }
      
      return {
        ...job, // Spread all original job fields first
        technicianStatus: status,
        status: status,
        bookingDate: bookingDate,
        date: bookingDate,
        timeSlot: timeSlot,
        time: timeSlot,
        address: finalAddress,
        fullAddress: finalAddress,
        customerName: customerName,
        name: customerName,
        customerPhone: customerPhone,
        phone: customerPhone,
        serviceType: serviceName,
        service: serviceName
      };
    });
  }

  processJobs(jobs: any[]): void {
    // Clear previous filters
    this.assignedJobs = [];
    this.todaysJobs = [];
    this.inProgressJobs = [];
    this.completedJobs = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('Today\'s date for filtering:', today);

    jobs.forEach(job => {
      const status = job.technicianStatus || job.status || 'ASSIGNED';
      
      // Filter by status
      if (status === 'ASSIGNED') {
        this.assignedJobs.push(job);
      }
      
      if (status === 'IN_PROGRESS') {
        this.inProgressJobs.push(job);
      }
      
      if (status === 'COMPLETED') {
        this.completedJobs.push(job);
      }
      
      // Filter by today's date - FIXED DATE COMPARISON
      if (job.bookingDate) {
        let jobDate;
        if (job.bookingDate instanceof Date) {
          jobDate = new Date(job.bookingDate);
        } else {
          jobDate = new Date(job.bookingDate);
        }
        jobDate.setHours(0, 0, 0, 0);
        
        console.log(`Job date: ${jobDate.toDateString()}, Today: ${today.toDateString()}`);
        
        if (jobDate.getTime() === today.getTime()) {
          this.todaysJobs.push(job);
          console.log('Added to today\'s jobs:', job.id);
        }
      }
    });

    console.log('Processed jobs summary:', {
      total: this.allJobs.length,
      assigned: this.assignedJobs.length,
      today: this.todaysJobs.length,
      inProgress: this.inProgressJobs.length,
      completed: this.completedJobs.length
    });
  }

  getStatusClass(status: string): string {
    const statusUpper = (status || '').toUpperCase();
    switch(statusUpper) {
      case 'ASSIGNED': return 'assigned';
      case 'IN_PROGRESS':
      case 'INPROGRESS': return 'in_progress';
      case 'COMPLETED': return 'completed';
      case 'CANCELLED': return 'cancelled';
      case 'ACCEPTED': return 'accepted';
      default: return 'assigned';
    }
  }

  getStatusIcon(status: string): string {
    const statusUpper = (status || '').toUpperCase();
    switch(statusUpper) {
      case 'ASSIGNED': return 'assignment';
      case 'ACCEPTED': return 'schedule';
      case 'IN_PROGRESS':
      case 'INPROGRESS': return 'engineering';
      case 'COMPLETED': return 'check_circle';
      case 'CANCELLED': return 'cancel';
      default: return 'pending';
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

  formatDate(date: any): string {
    if (!date) return 'N/A';
    
    try {
      let dateObj;
      if (date instanceof Date) {
        dateObj = date;
      } else {
        dateObj = new Date(date);
      }
      
      if (isNaN(dateObj.getTime())) {
        return 'N/A';
      }
      
      // Format as DD MMM YYYY (e.g., 04 Apr 2025)
      return dateObj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'N/A';
    }
  }

  formatTime(timeSlot: string): string {
    if (!timeSlot) return 'Flexible';
    return timeSlot;
  }

  /**
   * Extract a specific part from address string
   * Mirrors the logic from manage-bookings component
   */
  getAddressPart(address: string, part: string): string {
    if (!address || address.trim() === '') return 'N/A';

    const patterns: { [key: string]: RegExp } = {
      house: /house\s*(no\.?|number)?\s*[:#]?\s*([^,.\n]+)/i,
      area: /(?:area|locality|sector)\s*[:]?\s*([^,.\n]+)/i,
      city: /(?:city|town)\s*[:]?\s*([^,.\n]+)/i,
      pincode: /(?:pincode|pin\s*code|zip\s*code)\s*[:#]?\s*(\d{6})/i,
      landmark: /(?:near|landmark|opposite|beside)\s*[:]?\s*([^,.\n]+)/i
    };

    if (patterns[part]) {
      const match = address.match(patterns[part]);
      if (match && match[2]) return match[2].trim();
      if (match && match[1]) return match[1].trim();
    }

    // Fallback: Parse comma-separated parts
    const parts = address.split(',').map(p => p.trim());

    switch (part) {
      case 'house':
        return parts[0] || 'N/A';
      case 'area':
        return parts.length > 1 ? parts[1] : 'N/A';
      case 'city':
        for (const p of parts) {
          if (p.toLowerCase().includes('city') || p.toLowerCase().includes('town')) {
            return p.replace(/city|town/gi, '').trim() || 'N/A';
          }
        }
        return parts.length > 2 ? parts[2] : 'N/A';
      case 'pincode':
        const pincodeMatch = address.match(/\b\d{6}\b/);
        return pincodeMatch ? pincodeMatch[0] : 'N/A';
      case 'landmark':
        for (const p of parts) {
          if (p.toLowerCase().includes('near') || p.toLowerCase().includes('opposite') ||
              p.toLowerCase().includes('beside') || p.toLowerCase().includes('landmark')) {
            return p.replace(/near|opposite|beside|landmark/gi, '').trim() || 'N/A';
          }
        }
        return parts.length > 3 ? parts[3] : 'N/A';
      default:
        return 'N/A';
    }
  }

  /**
   * Format address as tooltip with parsed components
   */
  formatAddressTooltip(address: string): string {
    if (!address) return 'No address provided';

    return `📍 ADDRESS DETAILS
━━━━━━━━━━━━━━━━━━━━━
House/Flat: ${this.getAddressPart(address, 'house')}
Area: ${this.getAddressPart(address, 'area')}
City: ${this.getAddressPart(address, 'city')}
Pincode: ${this.getAddressPart(address, 'pincode')}
Landmark: ${this.getAddressPart(address, 'landmark')}`;
  }

  getTodayDate(): Date {
    return new Date();
  }
}