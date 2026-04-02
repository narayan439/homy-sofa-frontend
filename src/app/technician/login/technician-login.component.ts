import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TechnicianService } from '../../core/services/technician.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-technician-login',
  templateUrl: './technician-login.component.html',
  styleUrls: ['./technician-login.component.css']
})
export class TechnicianLoginComponent {
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  constructor(
    private fb: FormBuilder,
    private techService: TechnicianService,
    private router: Router,
    private snack: MatSnackBar
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  goBack() {
    this.router.navigate(['/']);
  }

  submit() {
    if (this.form.invalid) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    const v = this.form.value;
    const creds: { email: string; password: string } = {
      email: v.email as string,
      password: v.password as string
    };

    this.techService.technicianLogin(creds).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        localStorage.setItem('technicianToken', res.token);
        localStorage.setItem('technician', JSON.stringify({
          id: res.id,
          email: res.email,
          name: res.name
        }));
        this.snack.open('Login successful!', 'Close', { duration: 2000 });
        this.router.navigate(['/technician/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login error:', err);
        this.errorMessage = err?.error?.message || 'Login failed. Please check your credentials and try again.';
        this.snack.open(this.errorMessage, 'Close', { duration: 4000, panelClass: 'error-snackbar' });
      }
    });
  }
}
