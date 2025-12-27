import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface AppSettings {
  id?: string;
  appName: string;
  appLogo?: string;
  phoneNumber: string;
  email: string;
  address: string;
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  currency: string;
  timezone: string;
  maintenanceMode: boolean;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(private http: HttpClient, private apiService: ApiService) { }

  getSettings(): Observable<AppSettings> {
    return this.http.get<AppSettings>(`${this.apiService.apiUrl}/settings`);
  }

  updateSettings(settings: Partial<AppSettings>): Observable<AppSettings> {
    return this.http.put<AppSettings>(`${this.apiService.apiUrl}/settings`, settings);
  }

  getBusinessHours(): Observable<AppSettings['businessHours']> {
    return this.http.get<AppSettings['businessHours']>(`${this.apiService.apiUrl}/settings/business-hours`);
  }

  updateBusinessHours(hours: AppSettings['businessHours']): Observable<AppSettings['businessHours']> {
    return this.http.put<AppSettings['businessHours']>(`${this.apiService.apiUrl}/settings/business-hours`, hours);
  }
}
