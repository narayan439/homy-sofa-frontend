import { Component, OnInit } from '@angular/core';
import { TechnicianService } from '../../core/services/technician.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-manage-technicians',
  templateUrl: './manage-technicians.component.html',
  styleUrls: ['./manage-technicians.component.css']
})
export class ManageTechniciansComponent implements OnInit {
  technicians: any[] = [];
  filteredTechnicians: any[] = [];
  
  // Filters
  searchQuery: string = '';
  categoryFilter: string[] = [];
  statusFilter: string = 'all';
  
  // Pagination
  pageSize: number = 12;
  
  // Dialog
  showDialog: boolean = false;
  dialogMode: 'add' | 'edit' = 'add';
  formData: any = {
    name: '',
    email: '',
    phone: '',
    password: '',
    serviceCategory: '',
    isActive: true
  };
  selectedTechnician: any = null;

  constructor(private techService: TechnicianService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.techService.getAll().subscribe((res: any) => {
      this.technicians = Array.isArray(res) ? res : (res || []);
      this.applyFilters();
    });
  }

  applyFilters() {
    this.filteredTechnicians = this.technicians.filter(tech => {
      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        const matchesSearch = 
          (tech.name?.toLowerCase().includes(query) || false) ||
          (tech.email?.toLowerCase().includes(query) || false) ||
          (tech.phone?.includes(query) || false) ||
          (tech.mobile?.includes(query) || false) ||
          (tech.serviceCategory?.toLowerCase().includes(query) || false);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (this.categoryFilter.length > 0) {
        if (!this.categoryFilter.includes(tech.serviceCategory)) return false;
      }

      // Status filter
      if (this.statusFilter !== 'all') {
        const techStatus = tech.isActive === true ? 'active' : 'inactive';
        if (techStatus !== this.statusFilter) return false;
      }

      return true;
    });
  }

  clearFilters() {
    this.searchQuery = '';
    this.categoryFilter = [];
    this.statusFilter = 'all';
    this.applyFilters();
  }

  refreshList() {
    this.load();
  }

  getActiveTechnicians(): number {
    return this.technicians.filter(t => t.isActive === true).length;
  }

  getTotalCategories(): number {
    const categories = new Set(this.technicians.map(t => t.serviceCategory).filter(c => c));
    return categories.size;
  }

  getTotalAssignedJobs(): number {
    return this.technicians.reduce((sum, t) => sum + (t.activeJobs || 0), 0);
  }

  getUniqueCategories(): string[] {
    const cats = this.technicians.map(t => t.serviceCategory).filter(c => c);
    return [...new Set(cats)];
  }

  getAvatarColor(name: string): string {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  }

  // Dialog methods
  openAddTechnicianDialog() {
    this.dialogMode = 'add';
    this.formData = {
      name: '',
      email: '',
      phone: '',
      password: '',
      serviceCategory: '',
      isActive: true
    };
    this.showDialog = true;
  }

  editTechnician(tech: any) {
    this.dialogMode = 'edit';
    this.selectedTechnician = tech;
    this.formData = { ...tech, isActive: tech.isActive === undefined ? true : tech.isActive };
    this.showDialog = true;
  }

  closeDialog() {
    this.showDialog = false;
    this.selectedTechnician = null;
  }

  saveTechnician() {
    if (this.dialogMode === 'add') {
      // Auto-generate password from name and phone if not provided
      this.formData.password = this.generatePassword(this.formData.name, this.formData.phone);
      this.techService.create(this.formData).subscribe({
        next: () => {
          this.snack.open('Technician created successfully', 'Close', { duration: 2000 });
          this.load();
          this.closeDialog();
        },
        error: (err) => {
          const msg = err?.error?.error || err?.error?.message || err?.message || 'Error creating technician';
          this.snack.open(msg, 'Close', { duration: 4000 });
        }
      });
    } else {
      this.techService.update(this.selectedTechnician.id, this.formData).subscribe({
        next: () => {
          this.snack.open('Technician updated successfully', 'Close', { duration: 2000 });
          this.load();
          this.closeDialog();
        },
        error: (err) => {
          const msg = err?.error?.error || err?.error?.message || err?.message || 'Error updating technician';
          this.snack.open(msg, 'Close', { duration: 4000 });
        }
      });
    }
  }

  generatePassword(name: string, phone: string): string {
    if (!name) name = 'tech';
    // Extract letters from name, ignore non-letter prefixes
    const letters = (name || '').replace(/[^a-zA-Z]/g, '');
    const firstPart = letters.substring(0, 4);
    // Capitalize first letter and rest as-is (or lowercase)
    const formattedFirst = firstPart.length > 0 ? (firstPart.charAt(0).toUpperCase() + firstPart.slice(1)) : 'Tech';
    // Extract digits from phone
    const digits = (phone || '').replace(/\D/g, '');
    const secondPart = digits.substring(0, 3) || '000';
    return `${formattedFirst}${secondPart}`;
  }

  regeneratePassword() {
    this.formData.password = this.generatePassword(this.formData.name, this.formData.phone);
  }

  // Action methods
  viewTechnician(tech: any) {
    // Implement view details
    console.log('View technician:', tech);
  }

  assignJobs(tech: any) {
    // Implement job assignment
    console.log('Assign jobs to:', tech.name);
  }

  viewSchedule(tech: any) {
    // Implement schedule view
    console.log('View schedule for:', tech.name);
  }

  resetPassword(tech: any) {
    if (confirm(`Reset password for ${tech.name}?`)) {
      this.techService.resetPassword(tech.id).subscribe({
        next: (res: any) => {
          const pwd = res?.password;
          if (pwd) {
            this.snack.open(`Password reset: ${pwd}`, 'Close', { duration: 5000 });
          } else {
            this.snack.open('Password reset successfully', 'Close', { duration: 2000 });
          }
        },
        error: () => {
          this.snack.open('Error resetting password', 'Close', { duration: 2000 });
        }
      });
    }
  }

  toggleStatus(tech: any) {
    const willActivate = tech.isActive !== true;
    if (confirm(`${willActivate ? 'Activate' : 'Deactivate'} ${tech.name}?`)) {
      const newStatus = willActivate ? 'active' : 'inactive';
      this.techService.updateStatus(tech.id, newStatus).subscribe({
        next: () => {
          this.snack.open(`Technician ${willActivate ? 'activated' : 'deactivated'}`, 'Close', { duration: 2000 });
          tech.isActive = willActivate;
        },
        error: () => {
          this.snack.open('Error updating status', 'Close', { duration: 2000 });
        }
      });
    }
  }

  deleteTechnician(tech: any) {
    if (confirm(`Are you sure you want to delete ${tech.name}? This action cannot be undone.`)) {
      this.techService.delete(tech.id).subscribe({
        next: () => {
          this.snack.open('Technician deleted successfully', 'Close', { duration: 2000 });
          this.load();
        },
        error: () => {
          this.snack.open('Error deleting technician', 'Close', { duration: 2000 });
        }
      });
    }
  }

  exportTechnicians() {
    // Implement export functionality
    console.log('Export technicians');
  }
}