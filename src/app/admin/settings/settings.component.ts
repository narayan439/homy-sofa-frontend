import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  constructor(private snackBar: MatSnackBar) {}

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
}