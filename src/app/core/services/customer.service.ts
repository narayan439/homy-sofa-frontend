import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Service } from './service.service';

export interface Customer {
  totalServices: number;
  id?: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  zipCode?: string;
  totalBookings?: number;
  totalSpent?: number;
  joinDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(private http: HttpClient, private apiService: ApiService) { }

  getAllCustomers(): Observable<Customer[]> {
    // Backend returns { customer: {...}, bookingCount: number } items
    return this.http.get<any[]>(`${this.apiService.apiUrl}/admin/customers`).pipe(
      map(list => (list || []).map(item => ({ ...(item.customer || item), totalBookings: item.bookingCount || 0 } as Customer)))
    );
  }

  getCustomerById(id: string): Observable<Customer> {
    // Backend does not expose /customers/{id}; fetch list and find the one with matching id
    return new Observable<Customer>(subscriber => {
      this.getAllCustomers().subscribe({
        next: (list) => {
          const found = (list || []).find(c => String(c.id) === String(id));
          if (found) subscriber.next(found);
          subscriber.complete();
        },
        error: (err) => { subscriber.error(err); }
      });
    });
  }

  createCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiService.apiUrl}/customers`, customer);
  }

  updateCustomer(id: string, customer: Partial<Customer>): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiService.apiUrl}/customers/${id}`, customer);
  }

  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiService.apiUrl}/customers/${id}`);
  }

  searchCustomers(query: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiService.apiUrl}/customers/search?q=${query}`);
  }

  getCustomerByEmail(email: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiService.apiUrl}/customers/email/${email}`);
  }
  getCustomerServices(id: string): Observable<Service[]> {
  return this.http.get<Service[]>(`${this.apiService.apiUrl}/customers/${id}/services`);
}
}
