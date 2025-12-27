import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class AdminLoginComponent {
  
  loginForm: FormGroup;
  showPassword = false;
  showError = false;
  isLoading = false;

  // Demo credentials (remove in production)
  private readonly DEMO_EMAIL = 'admin@homysofa.com';
  private readonly DEMO_PASSWORD = '123456';

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  login() {
    if (this.loginForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.showError = false;

    const { email, password } = this.loginForm.value;

    this.auth.login({ email, password }).subscribe({
      next: (res) => {
        this.snackBar.open('Login successful! Redirecting...', 'Close', { duration: 1500, panelClass: ['success-snackbar'] });
        this.router.navigate(['/admin']);
        this.isLoading = false;
      },
      error: () => {
        this.showError = true;
        this.loginForm.get('password')?.reset();
        this.snackBar.open('Invalid email or password. Please try again.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
        this.isLoading = false;
      }
    });
  }

  forgotPassword(event: Event) {
    event.preventDefault();
    
    const email = prompt('Enter your admin email to reset password:');
    if (email) {
      this.snackBar.open(
        `Password reset link sent to ${email}`,
        'Close',
        { duration: 3000 }
      );
    }
  }

  private generateToken(): string {
    return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
  }

  // Quick login for demo (remove in production)
  quickLogin() {
    this.loginForm.patchValue({
      email: this.DEMO_EMAIL,
      password: this.DEMO_PASSWORD
    });
  }
}