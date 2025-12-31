import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { API_BASE_URL } from './api-url.service';

const API_URL = API_BASE_URL;


export interface Service {
  id?: string;
  name: string;
  description?: string;
  price?: number | null;
  imageUrl?: string;
  imagePath?: string;
  isActive?: boolean;
  icon?: string;
  image?: string;
  features?: string[];
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  private servicesSubject = new BehaviorSubject<Service[]>([]);
  services$ = this.servicesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadServices();
  }

  // Load services from backend
  loadServices(): void {
    this.getServices().subscribe(
      services => this.servicesSubject.next(services),
      error => console.error('Error loading services:', error)
    );
  }

  // Get all services from backend
  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${API_URL}/services`)
      .pipe(
        tap(services => {
          this.servicesSubject.next(services);
          localStorage.setItem('homy_services', JSON.stringify(services));
        })
      );
  }

  // Get only active services
  getActiveServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${API_URL}/services/active`)
      .pipe(
        tap(services => {
          this.servicesSubject.next(services);
          localStorage.setItem('homy_services', JSON.stringify(services));
        })
      );
  }

  getServiceById(id: string): Observable<Service> {
    return this.http.get<Service>(`${API_URL}/services/${id}`);
  }

  createService(service: Service): Observable<Service> {
    return this.http.post<Service>(`${API_URL}/services`, service)
      .pipe(
        tap(newService => {
          const current = this.servicesSubject.value;
          this.servicesSubject.next([...current, newService]);
          localStorage.setItem('homy_services', JSON.stringify([...current, newService]));
        })
      );
  }

  updateService(id: string, service: Partial<Service>): Observable<Service> {
    return this.http.put<Service>(`${API_URL}/services/${id}`, service)
      .pipe(
        tap(updatedService => {
          const current = this.servicesSubject.value;
          const updated = current.map(s => s.id === id ? updatedService : s);
          this.servicesSubject.next(updated);
          localStorage.setItem('homy_services', JSON.stringify(updated));
        })
      );
  }

  deleteService(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/services/${id}`)
      .pipe(
        tap(() => {
          const current = this.servicesSubject.value;
          const filtered = current.filter(s => s.id !== id);
          this.servicesSubject.next(filtered);
          localStorage.setItem('homy_services', JSON.stringify(filtered));
        })
      );
  }

  getLocalServices(): Service[] {
    return this.servicesSubject.value;
  }

  // Upload service image
  uploadServiceImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${API_URL}/services/upload-image`, formData, { responseType: 'text' });
  }
}
