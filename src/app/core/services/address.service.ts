import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface UserAddress {
  id?: number;
  userId?: number;
  addressType: string; // "Home", "Office", "Other"
  label: string; // e.g., "My Home", "Office"
  house: string;
  area: string;
  city: string;
  pincode: string;
  landmark?: string;
  fullAddress?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  isActive?: boolean;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  constructor(private http: HttpClient, private apiService: ApiService) { }

  /**
   * Get all addresses for current user
   */
  getAddresses(): Observable<any> {
    return this.http.get<any>(`${this.apiService.apiUrl}/addresses`);
  }

  /**
   * Add new address
   */
  addAddress(address: UserAddress): Observable<any> {
    return this.http.post<any>(`${this.apiService.apiUrl}/addresses`, address);
  }

  /**
   * Get single address by ID
   */
  getAddress(addressId: number): Observable<any> {
    return this.http.get<any>(`${this.apiService.apiUrl}/addresses/${addressId}`);
  }

  /**
   * Update address
   */
  updateAddress(addressId: number, address: UserAddress): Observable<any> {
    return this.http.put<any>(`${this.apiService.apiUrl}/addresses/${addressId}`, address);
  }

  /**
   * Set address as default
   */
  setDefaultAddress(addressId: number): Observable<any> {
    return this.http.put<any>(`${this.apiService.apiUrl}/addresses/${addressId}/set-default`, {});
  }

  /**
   * Delete address
   */
  deleteAddress(addressId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiService.apiUrl}/addresses/${addressId}`);
  }

  /**
   * Get default address
   */
  getDefaultAddress(): Observable<any> {
    return this.http.get<any>(`${this.apiService.apiUrl}/addresses/default`);
  }
}
