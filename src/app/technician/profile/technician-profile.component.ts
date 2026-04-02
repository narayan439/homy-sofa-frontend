import { Component, OnInit } from '@angular/core';
import { TechnicianService } from '../../core/services/technician.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

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
      const techData = localStorage.getItem('technician');
      if (techData) {
        this.technician = JSON.parse(techData);
        this.editForm = { ...this.technician };
        this.isLoading = false;
      } else {
        this.router.navigate(['/technician/login']);
      }
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
    // Update technician profile
    this.technician = { ...this.editForm };
    localStorage.setItem('technician', JSON.stringify(this.technician));
    this.successMessage = 'Profile updated successfully!';
    this.isEditing = false;
    
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  changePassword(): void {
    // Implement change password logic
    console.log('Change password clicked');
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
