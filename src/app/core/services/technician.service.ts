import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { API_BASE_URL } from './api-url.service';

export interface Technician {
  id?: string | number;
  name: string;
  email: string;
  phone?: string;
  serviceCategory?: string;
  isActive?: boolean;
}

const API_URL = API_BASE_URL;

@Injectable({ providedIn: 'root' })
export class TechnicianService {
  private techniciansSubject = new BehaviorSubject<Technician[]>([]);
  technicians$ = this.techniciansSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTechnicians();
  }

  loadTechnicians() {
    this.getAll().subscribe(techs => this.techniciansSubject.next(techs));
  }

  getAll(): Observable<Technician[]> {
    return this.http.get<Technician[]>(`${API_URL}/admin/technicians`)
      .pipe(tap(techs => this.techniciansSubject.next(techs)));
  }

  create(tech: any) {
    return this.http.post(`${API_URL}/admin/technicians`, tech).pipe(tap(() => this.loadTechnicians()));
  }

  assignToBooking(bookingId: string | number, technicianId: string | number) {
    return this.http.put(`${API_URL}/admin/bookings/${bookingId}/assign`, { technicianId });
  }

  /**
   * Trigger automatic assignment for a booking (no technicianId provided).
   * Backend will pick the best available technician.
   */
  assignAuto(bookingId: string | number) {
    return this.http.put(`${API_URL}/admin/bookings/${bookingId}/assign`, {});
  }

  /**
   * Get current technician profile
   */
  getCurrentTechnicianProfile(): Observable<any> {
    return this.http.get(`${API_URL}/technician/profile`);
  }

  /**
   * Update technician profile
   */
  updateTechnicianProfile(profile: any): Observable<any> {
    return this.http.put(`${API_URL}/technician/profile`, profile);
  }

  /**
   * Change password for technician
   */
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${API_URL}/technician/change-password`, {
      oldPassword,
      newPassword
    });
  }

  /**
   * Technician login
   */
  technicianLogin(credentials: { email: string; password: string }) {
    return this.http.post(`${API_URL}/technician/login`, credentials);
  }

  /**
   * Get bookings assigned to technician
   */
  getBookingsForTechnician(technicianId?: string | number, page: number = 0, size: number = 10) {
    const token = localStorage.getItem('technicianToken');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    const options: any = { headers };
    const params: any = { page: String(page), size: String(size) };
    if (technicianId) params.technicianId = String(technicianId);
    options.params = params;
    return this.http.get(`${API_URL}/technician/bookings`, options);
  }

  /**
   * Get jobs for technician
   */
  getTechnicianJobs(technicianId?: string | number): Observable<any> {
    const token = localStorage.getItem('technicianToken');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;
    const options: any = headers ? { headers } : {};
    let url = `${API_URL}/technician/jobs`;
    if (technicianId) {
      url += `?technicianId=${technicianId}`;
    }
    return this.http.get(url, options);
  }

  /**
   * Accept job
   */
  acceptJob(bookingId: string | number, technicianId?: string | number) {
    const token = localStorage.getItem('technicianToken');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;
    const options: any = headers ? { headers } : {};
    const body = technicianId ? { technicianId } : {};
    return this.http.put(`${API_URL}/technician/bookings/${bookingId}/accept`, body, options);
  }

  /**
   * Add additional service to job
   */
  addAdditionalService(bookingId: string | number, serviceName: string, price: number, technicianId?: string | number) {
    const token = localStorage.getItem('technicianToken');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;
    const options: any = headers ? { headers } : {};
    const body: any = { serviceName, price };
    if (technicianId) body.technicianId = technicianId;
    return this.http.post(`${API_URL}/technician/bookings/${bookingId}/additional-service`, body, options);
  }

  /**
   * Start job
   */
  startJob(bookingId: string | number, technicianId?: string | number) {
    const token = localStorage.getItem('technicianToken');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;
    const options: any = headers ? { headers } : {};
    const body = technicianId ? { technicianId } : {};
    return this.http.put(`${API_URL}/technician/bookings/${bookingId}/start`, body, options);
  }

  /**
   * Complete job
   */
  completeJob(bookingId: string | number, technicianId?: string | number, payload?: any) {
    const body: any = payload ? { ...payload } : {};
    if (technicianId) body.technicianId = technicianId;
    const token = localStorage.getItem('technicianToken');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;
    const options: any = headers ? { headers } : {};
    return this.http.put(`${API_URL}/technician/bookings/${bookingId}/complete`, body, options);
  }

  /**
   * Cancel job
   */
  cancelJob(bookingId: string | number, technicianId?: string | number, reason?: string) {
    const body: any = {};
    if (technicianId) body.technicianId = technicianId;
    if (reason) body.cancelReason = reason;
    const token = localStorage.getItem('technicianToken');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;
    const options: any = headers ? { headers } : {};
    return this.http.put(`${API_URL}/technician/bookings/${bookingId}/cancel`, body, options);
  }

  /**
   * Get technician jobs for admin panel
   */
  getTechnicianJobsAsAdmin(technicianId: string | number): Observable<any> {
    return this.http.get(`${API_URL}/admin/technicians/${technicianId}/jobs`);
  }

  /**
   * Get technician by ID (admin)
   */
  getById(id: string | number): Observable<Technician> {
    const techApi = `${API_URL}/admin/technicians`;
    return this.http.get<Technician>(`${techApi}/${id}`);
  }

  /**
   * Update technician (admin)
   */
  update(id: string | number, data: any): Observable<any> {
    const techApi = `${API_URL}/admin/technicians`;
    return this.http.put(`${techApi}/${id}`, data);
  }

  /**
   * Delete technician (admin)
   */
  delete(id: string | number): Observable<any> {
    const techApi = `${API_URL}/admin/technicians`;
    return this.http.delete(`${techApi}/${id}`);
  }

  /**
   * Reset password (admin)
   */
  resetPassword(id: string | number): Observable<any> {
    const techApi = `${API_URL}/admin/technicians`;
    return this.http.post(`${techApi}/${id}/reset-password`, {});
  }

  /**
   * Update status (admin)
   */
  updateStatus(id: string | number, status: string): Observable<any> {
    const techApi = `${API_URL}/admin/technicians`;
    return this.http.patch(`${techApi}/${id}/status`, { status });
  }
}
