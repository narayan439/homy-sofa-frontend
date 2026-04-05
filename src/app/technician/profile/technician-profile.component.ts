import { Component, OnInit } from '@angular/core';
import { TechnicianService } from '../../core/services/technician.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';

@Component({
  selector: 'app-technician-profile',
  templateUrl: './technician-profile.component.html',
  styleUrls: ['./technician-profile.component.css']
})
export class TechnicianProfileComponent implements OnInit {
  technician: any = {};
  isLoading: boolean = true;
  isEditing: boolean = false;
  editForm: any = {};
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private techService: TechnicianService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTechnicianProfile();
  }

  loadTechnicianProfile(): void {
    try {
      // First get cached data from localStorage
      const techData = localStorage.getItem('technician');
      if (techData) {
        this.technician = JSON.parse(techData);
        this.editForm = { ...this.technician };
      }

      // Then fetch full profile from backend to ensure we have all data including phone
      this.techService.getCurrentTechnicianProfile().subscribe({
        next: (profile) => {
          this.technician = { ...this.technician, ...profile };
          this.editForm = { ...this.technician };
          localStorage.setItem('technician', JSON.stringify(this.technician));
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading technician profile:', error);
          this.isLoading = false;
          // Keep using cached data if backend call fails
        }
      });
    } catch (error) {
      this.errorMessage = 'Failed to load profile';
      this.isLoading = false;
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.editForm = { ...this.technician };
    }
  }

  saveProfile(): void {
    // Validate required fields
    if (!this.editForm.name || !this.editForm.email) {
      this.errorMessage = 'Name and Email are required';
      return;
    }

    // Send update to backend
    this.techService.updateTechnicianProfile(this.editForm).subscribe({
      next: (updatedProfile) => {
        // Update local technician object with response from backend
        this.technician = { ...this.technician, ...updatedProfile };
        this.editForm = { ...this.technician };
        
        // Update localStorage with new data
        localStorage.setItem('technician', JSON.stringify(this.technician));
        
        this.successMessage = 'Profile updated successfully!';
        this.isEditing = false;
        this.errorMessage = '';
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.errorMessage = 'Failed to update profile. Please try again.';
        this.successMessage = '';
      }
    });
  }

  formatTechnicianId(id: any): string {
    if (!id) return 'N/A';
    const numId = typeof id === 'string' ? parseInt(id) : id;
    return `TECH${String(numId).padStart(3, '0')}`;
  }

  openChangePasswordDialog(): void {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '450px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.changePassword(result.oldPassword, result.newPassword);
      }
    });
  }

  changePassword(oldPassword: string, newPassword: string): void {
    this.techService.changePassword(oldPassword, newPassword).subscribe({
      next: (response) => {
        this.successMessage = 'Password changed successfully!';
        this.errorMessage = '';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error changing password:', error);
        this.errorMessage = error.error?.error || 'Failed to change password. Please check your current password.';
        this.successMessage = '';
      }
    });
  }

  logout(): void {
    localStorage.removeItem('technician');
    localStorage.removeItem('authToken');
    this.router.navigate(['/technician/login']);
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
}
