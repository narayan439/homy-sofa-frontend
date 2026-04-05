import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { UserAdminService } from '../../core/services/user-admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {

  settings = {
    businessName: 'HomY Sofa',
    phone: '9876543210',
    whatsapp: '9876543210',
    email: 'support@homysofa.com',
    city: 'Bhubaneswar, Odisha',
    workingHours: '9 AM - 7 PM'
  };

  password = {
    current: '',
    new: '',
    confirm: ''
  };

  constructor(
    private snackBar: MatSnackBar,
    private userAdminService: UserAdminService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  saveSettings() {
    // Show success message
    this.snackBar.open(
      'Business settings saved successfully!',
      'Close',
      { 
        duration: 3000,
        panelClass: ['success-snackbar']
      }
    );
  }

  changePassword() {
    // Validate passwords
    if (!this.password.current || !this.password.new || !this.password.confirm) {
      this.snackBar.open(
        'Please fill in all password fields',
        'Close',
        { 
          duration: 3000,
          panelClass: ['error-snackbar']
        }
      );
      return;
    }

    if (this.password.new !== this.password.confirm) {
      this.snackBar.open(
        'New password and confirm password do not match',
        'Close',
        { 
          duration: 3000,
          panelClass: ['error-snackbar']
        }
      );
      return;
    }

    if (this.password.new.length < 8) {
      this.snackBar.open(
        'Password must be at least 8 characters long',
        'Close',
        { 
          duration: 3000,
          panelClass: ['error-snackbar']
        }
      );
      return;
    }

    // Show success message
    this.snackBar.open(
      'Password changed successfully!',
      'Close',
      { 
        duration: 3000,
        panelClass: ['success-snackbar']
      }
    );

    // Reset password fields
    this.password = { current: '', new: '', confirm: '' };
  }

  deleteAccount() {
    const confirmation = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    
    if (!confirmation) {
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.snackBar.open('User ID not found', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.userAdminService.deleteAccount(Number(userId)).subscribe(
      (response) => {
        this.snackBar.open('Account deleted successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Clear localStorage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        this.router.navigate(['/auth/login']);
      },
      (error) => {
        this.snackBar.open(
          error.error?.message || 'Failed to delete account',
          'Close',
          {
            duration: 3000,
            panelClass: ['error-snackbar']
          }
        );
      }
    );
  }
}