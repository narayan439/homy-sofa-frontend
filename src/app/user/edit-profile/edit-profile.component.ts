import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserAuthService } from '../../core/services/user-auth.service';
import { Subject, Observable } from 'rxjs';
import { takeUntil, map, catchError, debounceTime, first } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit, OnDestroy {
  // Forms
  profileForm: FormGroup;
  addressForm: FormGroup;
  passwordForm: FormGroup;

  // State
  currentUser: any = null;
  isLoadingProfile: boolean = false;
  isSavingProfile: boolean = false;
  isSavingPassword: boolean = false;
  isDeletingAccount: boolean = false;
  hideCurrentPassword: boolean = true;
  hideNewPassword: boolean = true;
  hideConfirmPassword: boolean = true;
  activeTab: string = 'profile';

  // Validation
  emailError: string = '';
  phoneError: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userAuthService: UserAuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {
    // Initialize forms
    this.profileForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[A-Za-z ]+$/)
      ]],
      email: ['', 
        {
          validators: [
            Validators.required,
            Validators.email
          ],
          asyncValidators: [this.duplicateEmailValidator.bind(this)],
          updateOn: 'blur'
        }
      ],
      phone: ['', 
        {
          validators: [
            Validators.required,
            Validators.pattern(/^[0-9]{10}$/)
          ],
          asyncValidators: [this.duplicatePhoneValidator.bind(this)],
          updateOn: 'blur'
        }
      ]
    });

    this.addressForm = this.fb.group({
      house: [''],
      area: [''],
      city: [''],
      pincode: ['', [Validators.pattern(/^[0-9]{6}$|^$/)]],
      landmark: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator.bind(this)
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator.bind(this)
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load current user profile
   */
  loadUserProfile(): void {
    const user = this.userAuthService.getCurrentUser();
    if (!user) {
      this.snackBar.open('❌ User not found', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    this.currentUser = user;
    this.profileForm.patchValue({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || ''
    });

    // Parse address if available
    if (user.address) {
      const addressParts = user.address.split(',').map((p: string) => p.trim());
      if (addressParts.length >= 4) {
        this.addressForm.patchValue({
          house: addressParts[0] || '',
          area: addressParts[1] || '',
          city: addressParts[2] || '',
          pincode: addressParts[3] || '',
          landmark: addressParts[4] || ''
        });
      }
    }
  }

  /**
   * Custom validator for password strength
   */
  passwordStrengthValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*]/.test(value);

    const passwordStrong = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;

    return passwordStrong ? null : { passwordStrength: true };
  }

  /**
   * Custom validator for password match
   */
  passwordMatchValidator(group: AbstractControl): { [key: string]: any } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  /**
   * Async validator to check if email is already in use by another user
   */
  duplicateEmailValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) {
      return of(null);
    }

    // Don't validate if email hasn't changed from current user's email
    if (this.currentUser && this.currentUser.email === control.value) {
      return of(null);
    }

    return this.userAuthService.checkDuplicateEmail(control.value).pipe(
      debounceTime(300),
      map((response: any) => {
        if (response && response.exists) {
          this.emailError = 'This email is already registered by another user';
          return { duplicateEmail: true };
        }
        this.emailError = '';
        return null;
      }),
      catchError((error) => {
        console.error('Email validation error:', error);
        return of(null);
      }),
      first()
    );
  }

  /**
   * Async validator to check if phone is already in use by another user
   */
  duplicatePhoneValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) {
      return of(null);
    }

    // Don't validate if phone hasn't changed from current user's phone
    if (this.currentUser && this.currentUser.phone === control.value) {
      return of(null);
    }

    return this.userAuthService.checkDuplicatePhone(control.value).pipe(
      debounceTime(300),
      map((response: any) => {
        if (response && response.exists) {
          this.phoneError = 'This phone number is already registered by another user';
          return { duplicatePhone: true };
        }
        this.phoneError = '';
        return null;
      }),
      catchError((error) => {
        console.error('Phone validation error:', error);
        return of(null);
      }),
      first()
    );
  }

  /**
   * Save profile changes (Name, Email, Phone)
   */
  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.snackBar.open('❌ Please fix the errors in the form', 'Close', { duration: 3000 });
      return;
    }

    this.isSavingProfile = true;
    this.emailError = '';
    this.phoneError = '';

    const formData = this.profileForm.value;

    // Build address string from form
    const addressParts = [
      this.addressForm.get('house')?.value || '',
      this.addressForm.get('area')?.value || '',
      this.addressForm.get('city')?.value || '',
      this.addressForm.get('pincode')?.value || '',
      this.addressForm.get('landmark')?.value || ''
    ];
    const address = addressParts.filter(p => p).join(', ');

    const updateData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: address
    };

    this.userAuthService.updateUserProfile(updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.success) {
            // Update local user data
            this.currentUser = { ...this.currentUser, ...updateData };
            this.snackBar.open('✅ Profile updated successfully!', 'Close', { duration: 3000 });
          } else if (response?.error) {
            this.handleProfileUpdateError(response.error);
          }
        },
        error: (err: any) => {
          console.error('Error updating profile:', err);
          this.handleProfileUpdateError(err.error?.error || 'Failed to update profile');
        },
        complete: () => {
          this.isSavingProfile = false;
        }
      });
  }

  /**
   * Handle profile update errors
   */
  private handleProfileUpdateError(error: string): void {
    if (error.toLowerCase().includes('email')) {
      this.emailError = error;
    } else if (error.toLowerCase().includes('phone')) {
      this.phoneError = error;
    } else {
      this.snackBar.open(`❌ ${error}`, 'Close', { duration: 3000 });
    }
  }

  /**
   * Save address changes
   */
  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.snackBar.open('❌ Please fix address errors', 'Close', { duration: 3000 });
      return;
    }

    const addressParts = [
      this.addressForm.get('house')?.value || '',
      this.addressForm.get('area')?.value || '',
      this.addressForm.get('city')?.value || '',
      this.addressForm.get('pincode')?.value || '',
      this.addressForm.get('landmark')?.value || ''
    ];
    const address = addressParts.filter(p => p).join(', ');

    this.isSavingProfile = true;

    const updateData = {
      name: this.currentUser.name,
      email: this.currentUser.email,
      phone: this.currentUser.phone,
      address: address
    };

    this.userAuthService.updateUserProfile(updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.success) {
            this.currentUser.address = address;
            this.snackBar.open('✅ Address updated successfully!', 'Close', { duration: 3000 });
          }
        },
        error: (err: any) => {
          this.snackBar.open('❌ Failed to update address', 'Close', { duration: 3000 });
        },
        complete: () => {
          this.isSavingProfile = false;
        }
      });
  }

  /**
   * Change password
   */
  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.snackBar.open('❌ Please fix password errors', 'Close', { duration: 3000 });
      return;
    }

    // Check password strength
    const newPassword = this.passwordForm.get('newPassword')?.value;
    if (!this.isPasswordStrong(newPassword)) {
      this.snackBar.open('❌ Password must contain uppercase, lowercase, number, and special character', 'Close', { duration: 4000 });
      return;
    }

    this.isSavingPassword = true;

    const passwordData = {
      currentPassword: this.passwordForm.get('currentPassword')?.value,
      newPassword: newPassword
    };

    this.userAuthService.changePassword(passwordData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.success) {
            this.snackBar.open('✅ Password changed successfully!', 'Close', { duration: 3000 });
            this.passwordForm.reset();
          } else {
            this.snackBar.open('❌ ' + (response?.error || 'Failed to change password'), 'Close', { duration: 3000 });
          }
        },
        error: (err: any) => {
          console.error('Error changing password:', err);
          this.snackBar.open('❌ ' + (err.error?.error || 'Current password is incorrect'), 'Close', { duration: 3000 });
        },
        complete: () => {
          this.isSavingPassword = false;
        }
      });
  }

  /**
   * Check if password is strong
   */
  isPasswordStrong(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;
  }

  /**
   * Delete account permanently
   */
  deleteAccount(): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isDeletingAccount = true;

        this.userAuthService.deleteAccount()
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response: any) => {
              if (response && response.success) {
                this.snackBar.open('✅ Account deleted successfully', 'Close', { duration: 2000 });
                setTimeout(() => {
                  this.userAuthService.logout();
                  this.router.navigate(['/home']);
                }, 1000);
              }
            },
            error: (err: any) => {
              console.error('Error deleting account:', err);
              this.snackBar.open('❌ Failed to delete account', 'Close', { duration: 3000 });
            },
            complete: () => {
              this.isDeletingAccount = false;
            }
          });
      }
    });
  }

  /**
   * Switch tabs
   */
  switchTab(tab: string): void {
    this.activeTab = tab;
  }

  /**
   * Get tab icon
   */
  getTabIcon(tab: string): string {
    const icons: { [key: string]: string } = {
      'profile': 'person',
      'address': 'location_on',
      'password': 'lock',
      'account': 'settings'
    };
    return icons[tab] || 'info';
  }

  /**
   * Get tab label
   */
  getTabLabel(tab: string): string {
    const labels: { [key: string]: string } = {
      'profile': 'Profile',
      'address': 'Address',
      'password': 'Password',
      'account': 'Account'
    };
    return labels[tab] || 'Tab';
  }

  /**
   * Get password strength class
   */
  getPasswordStrengthClass(): string {
    const password = this.passwordForm.get('newPassword')?.value || '';
    if (!password) return '';

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    if (strength >= 5) return 'strength-strong';
    if (strength >= 3) return 'strength-medium';
    return 'strength-weak';
  }

  /**
   * Get password strength text
   */
  getPasswordStrengthText(): string {
    const password = this.passwordForm.get('newPassword')?.value || '';
    if (!password) return '';

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    if (strength >= 5) return 'Strong';
    if (strength >= 3) return 'Medium';
    return 'Weak';
  }

  /**
   * Navigate back
   */
  goBack(): void {
    window.history.back();
  }

  /**
   * Clear errors
   */
  clearEmailError(): void {
    this.emailError = '';
  }

  clearPhoneError(): void {
    this.phoneError = '';
  }
}

/**
 * Confirmation dialog for account deletion
 */
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-delete-dialog',
  template: `
    <h2 mat-dialog-title>Delete Account Permanently?</h2>
    <mat-dialog-content>
      <p><strong>⚠️ Warning:</strong> This action cannot be undone!</p>
      <p>Your account and all associated data will be permanently deleted.</p>
      <p>Type <strong>DELETE</strong> to confirm:</p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Confirmation</mat-label>
        <input matInput [(ngModel)]="confirmText" placeholder="Type DELETE">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button 
        mat-raised-button 
        color="warn" 
        [disabled]="confirmText !== 'DELETE'"
        (click)="onConfirm()">
        Delete Account
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-top: 15px;
    }
    p {
      margin: 10px 0;
      line-height: 1.6;
    }
  `]
})
export class ConfirmDeleteDialogComponent {
  confirmText: string = '';

  constructor(public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
