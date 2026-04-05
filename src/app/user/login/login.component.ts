import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserAuthService } from '../../core/services/user-auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  returnUrl: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private userAuthService: UserAuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // If already logged in, redirect to dashboard
    if (this.userAuthService.isUserLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.snackBar.open('Please fill in all fields correctly', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.userAuthService.login(email, password).subscribe({
      next: (response) => {
        console.log('[LoginComponent] Login response:', response);
        // Backend returns token, userId, email, name, phone (no 'success' field)
        if (response && response.token && response.userId) {
          this.snackBar.open('✓ Login successful!', 'Close', { duration: 2000 });
          console.log('[LoginComponent] Token saved, navigating to:', this.returnUrl);
          // Keep isLoading true until navigation completes to prevent form re-submission
          setTimeout(() => {
            console.log('[LoginComponent] Executing navigation...');
            this.router.navigate([this.returnUrl]).then(success => {
              console.log('[LoginComponent] Navigation result:', success);
              if (!success) {
                this.isLoading = false;
                this.snackBar.open('Navigation failed. Please refresh the page.', 'Close', { duration: 3000 });
              }
            });
          }, 500);
        } else {
          this.isLoading = false;
          this.snackBar.open(response?.message || 'Login failed', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        this.isLoading = false;
        const message = error.error?.message || 'Login failed. Please try again.';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        console.error('[LoginComponent] Login error:', error);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }
}
