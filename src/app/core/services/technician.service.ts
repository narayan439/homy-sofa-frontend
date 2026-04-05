import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
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

  technicianLogin(credentials: { email: string; password: string }) {
    return this.http.post(`${API_URL}/technician/login`, credentials);
  }

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
    return this.http.get(`${API_URL}/technician/bookings`, options).pipe(
      // normalize response so callers always receive { total, page, size, bookings: [] }
      map((res: any) => this.normalizeBookingsResponse(res))
    );
  }

  // Ensure the response contains a bookings array and every booking has an `address` field
  private normalizeBookingsResponse(res: any): any {
    if (!res) return { total: 0, page: 0, size: 0, bookings: [] };

    // If already in paginated shape with bookings array
    const list: any[] = Array.isArray(res.bookings) ? res.bookings
      : Array.isArray(res.content) ? res.content
      : Array.isArray(res) ? res
      : [];

    console.log('TechnicianService.normalizeBookingsResponse - Raw API response:', res);
    console.log('TechnicianService.normalizeBookingsResponse - Extracted list length:', list.length);
    if (list.length > 0) {
      console.log('TechnicianService.normalizeBookingsResponse - First raw booking:', list[0]);
      console.log('TechnicianService.normalizeBookingsResponse - First booking address fields:', {
        address: list[0].address,
        addressText: list[0].addressText,
        address_text: list[0].address_text,
        specialAddress: list[0].specialAddress,
        special_address: list[0].special_address,
        fullAddress: list[0].fullAddress,
        full_address: list[0].full_address
      });
    }

    const normalizeAddr = (b: any) => {
      if (!b) return b;
      // prefer existing canonical fields
      if (!b.address || b.address === 'No address' || b.address === 'Address not available') {
        const candidates = [b.address, b.addressText, b.address_text, b.specialAddress, b.special_address, b.fullAddress, b.full_address];
        for (const c of candidates) {
          if (c && String(c).trim()) { b.address = String(c).trim(); break; }
        }
      }
      // fallback: reconstruct from parts if still missing
      if (!b.address || String(b.address).trim() === '' ) {
        const parts: string[] = [];
        if (b.house) parts.push(String(b.house).trim());
        if (b.area) parts.push(String(b.area).trim());
        if (b.city) parts.push(String(b.city).trim());
        if (b.landmark) parts.push(String(b.landmark).trim());
        if (b.pincode) parts.push(String(b.pincode).trim());
        if (parts.length) b.address = parts.filter(Boolean).join(', ');
      }
      // final safe value
      if (!b.address) b.address = null;
      return b;
    };

    const normalized = (list || []).map(normalizeAddr);

    console.log('TechnicianService.normalizeBookingsResponse - Normalized bookings:', normalized);

    return {
      total: (res.total ?? normalized.length),
      page: (res.page ?? 0),
      size: (res.size ?? normalized.length),
      bookings: normalized
    };
  }

  acceptJob(bookingId: string | number, technicianId?: string | number) {
    const token = localStorage.getItem('technicianToken');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;
    const options: any = headers ? { headers } : {};
    const body = technicianId ? { technicianId } : {};
    return this.http.put(`${API_URL}/technician/bookings/${bookingId}/accept`, body, options);
  }

  addAdditionalService(bookingId: string | number, serviceName: string, price: number, technicianId?: string | number) {
    const token = localStorage.getItem('technicianToken');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;
    const options: any = headers ? { headers } : {};
    const body: any = { serviceName, price };
    if (technicianId) body.technicianId = technicianId;
    return this.http.post(`${API_URL}/technician/bookings/${bookingId}/additional-service`, body, options);
  }

  startJob(bookingId: string | number, technicianId?: string | number) {
    const token = localStorage.getItem('technicianToken');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;
    const options: any = headers ? { headers } : {};
    const body = technicianId ? { technicianId } : {};
    return this.http.put(`${API_URL}/technician/bookings/${bookingId}/start`, body, options);
  }

  completeJob(bookingId: string | number, technicianId?: string | number, payload?: any) {
    const body: any = payload ? { ...payload } : {};
    if (technicianId) body.technicianId = technicianId;
    const token = localStorage.getItem('technicianToken');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;
    const options: any = headers ? { headers } : {};
    return this.http.put(`${API_URL}/technician/bookings/${bookingId}/complete`, body, options);
  }

  cancelJob(bookingId: string | number, technicianId?: string | number, reason?: string) {
    const body: any = {};
    if (technicianId) body.technicianId = technicianId;
    if (reason) body.cancelReason = reason;
    const token = localStorage.getItem('technicianToken');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;
    const options: any = headers ? { headers } : {};
    return this.http.put(`${API_URL}/technician/bookings/${bookingId}/cancel`, body, options);
  }
  // Admin helper endpoints for technicians
  private techApi = `${API_URL}/admin/technicians`;

  getById(id: string | number): Observable<Technician> {
    return this.http.get<Technician>(`${this.techApi}/${id}`);
  }

  update(id: string | number, data: any): Observable<any> {
    return this.http.put(`${this.techApi}/${id}`, data);
  }

  delete(id: string | number): Observable<any> {
    return this.http.delete(`${this.techApi}/${id}`);
  }

  resetPassword(id: string | number): Observable<any> {
    return this.http.post(`${this.techApi}/${id}/reset-password`, {});
  }

  updateStatus(id: string | number, status: string): Observable<any> {
    return this.http.patch(`${this.techApi}/${id}/status`, { status });
  }

  /**
   * Get all jobs/bookings for a technician
   * @param technicianId The ID of the technician
   */
  getTechnicianJobs(technicianId: string | number): Observable<any> {
    const token = localStorage.getItem('technicianToken');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    const options: any = { headers };
    return this.getBookingsForTechnician(technicianId, 0, 100);
  }
}
