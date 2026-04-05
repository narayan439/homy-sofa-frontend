import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { API_BASE_URL } from './api-url.service';

@Injectable({
  providedIn: 'root'
})
export class UserAuthService {

  private currentUser = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUser.asObservable();

  private isLoggedIn = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$ = this.isLoggedIn.asObservable();

  private apiUrl = `${API_BASE_URL}/users`;

  constructor(private http: HttpClient) {
    this.loadCurrentUser();
  }

  // Sign Up - Register new user
  signup(name: string, email: string, password: string, phone: string, address?: string): Observable<any> {
    const request = {
      name,
      email,
      password,
      phone,
      address: address || ''
    };
    return this.http.post(`${this.apiUrl}/register`, request).pipe(
      tap((response: any) => {
        if (response && response.success) {
          console.log('User registered successfully');
        }
      })
    );
  }

  // Login - Authenticate user
  login(email: string, password: string): Observable<any> {
    const request = { email, password };
    return this.http.post(`${this.apiUrl}/login`, request).pipe(
      tap((response: any) => {
        console.log('[UserAuthService] Login response:', response);
        // Backend returns message, token, userId, email, name, phone
        if (response && response.token) {
          this.saveUserData(response);
          this.isLoggedIn.next(true);
          console.log('[UserAuthService] User logged in successfully, userId:', response.userId);
        } else {
          console.warn('[UserAuthService] Invalid login response:', response);
        }
      })
    );
  }

  // Save user data to localStorage and update subject
  private saveUserData(response: any): void {
    console.log('[UserAuthService] Saving user data:', response);
    localStorage.setItem('userToken', response.token);
    localStorage.setItem('userId', response.userId?.toString() || '');
    localStorage.setItem('userEmail', response.email || '');
    localStorage.setItem('userName', response.name || '');
    localStorage.setItem('userPhone', response.phone || '');

    const userData = {
      id: response.userId,
      email: response.email,
      name: response.name,
      phone: response.phone,
      createdAt: response.createdAt || null
    };
    console.log('[UserAuthService] Storing userData:', userData);
    localStorage.setItem('userData', JSON.stringify(userData));
    this.currentUser.next(userData);
  }

  // Load current user from localStorage
  private loadCurrentUser(): void {
    const userData = localStorage.getItem('userData');
    console.log('[UserAuthService] loadCurrentUser - userData from storage:', userData);
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        console.log('[UserAuthService] Parsed user data:', parsed);
        this.currentUser.next(parsed);
      } catch (e) {
        console.error('[UserAuthService] Error parsing userData:', e);
        this.currentUser.next(null);
      }
    } else {
      console.log('[UserAuthService] No userData in localStorage');
      this.currentUser.next(null);
    }
  }

  // Check if token exists
  private hasToken(): boolean {
    return !!localStorage.getItem('userToken');
  }

  // Get stored JWT token
  getToken(): string | null {
    return localStorage.getItem('userToken');
  }

  // Get current user ID
  getCurrentUserId(): string | null {
    return localStorage.getItem('userId');
  }

  // Get current user data
  getCurrentUser(): any {
    const userData = localStorage.getItem('userData');
    console.log('[UserAuthService] getCurrentUser called - userData:', userData);
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        console.log('[UserAuthService] getCurrentUser returning:', parsed);
        return parsed;
      } catch (e) {
        console.error('[UserAuthService] Error parsing getCurrentUser userData:', e);
        return null;
      }
    }
    console.warn('[UserAuthService] getCurrentUser - userData is null');
    return null;
  }

  // Check if user is logged in
  isUserLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Logout - Clear user data
  logout(): void {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userData');
    this.currentUser.next(null);
    this.isLoggedIn.next(false);
  }

  // Check email existence (for signup validation)
  checkEmailExists(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-email`, { email });
  }

  // Check if email is already used by another user
  checkDuplicateEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-duplicate-email`, { email });
  }

  // Check if phone is already used by another user
  checkDuplicatePhone(phone: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-duplicate-phone`, { phone });
  }

  // Get user profile
  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  // Get user by email
  getUserByEmail(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/by-email/${email}`);
  }

  // Update user profile (name, email, phone, address)
  updateUserProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, profileData).pipe(
      tap((response: any) => {
        if (response && response.success) {
          // Update local storage with new user data
          const currentUser = this.getCurrentUser();
          const updatedUser = { ...currentUser, ...profileData };
          // Preserve createdAt if it exists
          if (response.data && response.data.createdAt) {
            updatedUser.createdAt = response.data.createdAt;
          }
          localStorage.setItem('userData', JSON.stringify(updatedUser));
          localStorage.setItem('userName', updatedUser.name || '');
          localStorage.setItem('userEmail', updatedUser.email || '');
          localStorage.setItem('userPhone', updatedUser.phone || '');
          this.currentUser.next(updatedUser);
        }
      })
    );
  }

  // Change password
  changePassword(passwordData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, passwordData);
  }

  // Delete account permanently
  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/account`);
  }
}
