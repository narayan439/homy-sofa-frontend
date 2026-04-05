import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  totalBookings?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserAdminService {

  constructor(private http: HttpClient, private apiService: ApiService) { }

  /**
   * Get all users (admin endpoint)
   */
  getAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiService.apiUrl}/users/admin/all`);
  }

  /**
   * Get user by ID (admin endpoint)
   */
  getUserById(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiService.apiUrl}/users/admin/${userId}`);
  }

  /**
   * Deactivate a user
   */
  deactivateUser(userId: number): Observable<any> {
    return this.http.put<any>(`${this.apiService.apiUrl}/users/admin/${userId}/deactivate`, {});
  }

  /**
   * Activate a user
   */
  activateUser(userId: number): Observable<any> {
    return this.http.put<any>(`${this.apiService.apiUrl}/users/admin/${userId}/activate`, {});
  }

  /**
   * Delete user account
   */
  deleteAccount(userId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiService.apiUrl}/users/${userId}`);
  }

  /**
   * Format users with booking counts for display
   */
  formatUsersForDisplay(users: AdminUser[]): AdminUser[] {
    return (users || []).map(user => ({
      ...user,
      totalBookings: 0  // Will be populated by component if needed
    }));
  }
}
