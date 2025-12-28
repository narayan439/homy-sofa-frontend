import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { API_BASE_URL } from './api-url.service';

const API_URL = API_BASE_URL;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id?: string;
  email?: string;
  name?: string;
  admin?: {
    id: string;
    email: string;
    name: string;
    role?: 'admin' | 'manager' | 'staff';
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'manager' | 'staff';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkAuth();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('adminToken', response.token);
          // Support two response shapes: { token, admin: {..} } or { token, id, email, name }
          const adminObj: any = response.admin ? response.admin : { id: response.id ?? '', email: response.email ?? '', name: response.name ?? '' };
          localStorage.setItem('admin', JSON.stringify(adminObj));
          const user: User = {
            id: adminObj.id || '',
            email: adminObj.email || '',
            name: adminObj.name || '',
            role: (adminObj.role || 'admin') as any
          };
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  register(data: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/auth/register`, data)
      .pipe(
        tap(response => {
          localStorage.setItem('adminToken', response.token);
          const adminObj: any = response.admin ? response.admin : { id: response.id ?? '', email: response.email ?? '', name: response.name ?? '' };
          localStorage.setItem('admin', JSON.stringify(adminObj));
          const user: User = {
            id: adminObj.id || '',
            email: adminObj.email || '',
            name: adminObj.name || '',
            role: (adminObj.role || 'admin') as any
          };
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('adminToken');
  }

  getToken(): string | null {
    return localStorage.getItem('adminToken');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private checkAuth(): void {
    const token = localStorage.getItem('adminToken');
    const admin = localStorage.getItem('admin');
    
    if (token && admin) {
      try {
        this.currentUserSubject.next(JSON.parse(admin));
        this.isAuthenticatedSubject.next(true);
      } catch (e) {
        this.logout();
      }
    }
  }
}
