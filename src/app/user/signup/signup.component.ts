import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { UserAuthService } from '../../core/services/user-auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  emailCheckInProgress = false;

  constructor(
    private formBuilder: FormBuilder,
    private userAuthService: UserAuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    // If already logged in, redirect to dashboard
    if (this.userAuthService.isUserLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  initializeForm(): void {
    this.signupForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\-\s()]+$/), Validators.minLength(10)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      agreeTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.snackBar.open('Please fill in all fields correctly', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const { name, email, password, phone } = this.signupForm.value;

    this.userAuthService.signup(name, email, password, phone).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response && response.success) {
          this.snackBar.open('✓ Account created successfully! Redirecting to login...', 'Close', { duration: 2000 });
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.snackBar.open(response?.message || 'Signup failed', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        this.isLoading = false;
        const message = error.error?.message || 'Signup failed. Please try again.';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        console.error('Signup error:', error);
      }
    });
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'password') {
      this.hidePassword = !this.hidePassword;
    } else if (field === 'confirm') {
      this.hideConfirmPassword = !this.hideConfirmPassword;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  getPasswordErrorMessage(): string {
    const password = this.signupForm.get('password');
    if (password?.hasError('required')) return 'Password is required';
    if (password?.hasError('minlength')) return 'Password must be at least 6 characters';
    return '';
  }

  getConfirmPasswordErrorMessage(): string {
    const confirm = this.signupForm.get('confirmPassword');
    if (confirm?.hasError('required')) return 'Please confirm your password';
    if (this.signupForm.hasError('passwordMismatch') && confirm?.value) {
      return 'Passwords do not match';
    }
    return '';
  }
}
