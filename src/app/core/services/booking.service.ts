import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Booking, BookingStatus } from '../../models/booking.model';
import { API_BASE_URL } from './api-url.service';

const API_URL = API_BASE_URL;

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private bookingsSubject = new BehaviorSubject<Booking[]>([]);
  bookings$ = this.bookingsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadBookings();
    // Try to sync from backend on startup
    this.getAllBookings().subscribe({ next: () => {}, error: () => {} });
  }

  private normalizeBooking(b: any): Booking {
    const svc = b.service || b.serviceType || b.serviceName || b['service_type'] || '';
    let dateVal: string = b.date || '';
    if (typeof dateVal === 'string' && dateVal.includes('/')) {
      const parts = dateVal.split('/').map((p: string) => p.trim());
      if (parts.length === 3) {
        const day = Number(parts[0]);
        const month = Number(parts[1]) - 1;
        const year = Number(parts[2]);
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) dateVal = d.toISOString();
      }
    }
    return { ...b, service: svc, date: dateVal } as Booking;
  }

  // API Methods
  addBooking(booking: Booking): Observable<Booking> {
    return this.http.post<Booking>(`${API_URL}/bookings`, booking)
      .pipe(
        tap(newBooking => {
          const current = this.bookingsSubject.value;
          const normalized = this.normalizeBooking(newBooking as any);
          this.bookingsSubject.next([...current, normalized]);
          this.saveToLocalStorage();
        })
      );
  }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<any[]>(`${API_URL}/bookings`)
      .pipe(
        tap(rawBookings => {
          // normalize booking objects to ensure `service` and `date` fields are usable
          const bookings: Booking[] = (rawBookings || []).map((b: any) => this.normalizeBooking(b));
          this.bookingsSubject.next(bookings);
          this.saveToLocalStorage();
        })
      );
  }

  getBookingById(id: string | number): Observable<Booking> {
    return this.http.get<Booking>(`${API_URL}/bookings/${id}`);
  }

  updateBooking(id: string | number, booking: Partial<Booking>): Observable<Booking> {
    const idStr = String(id);
    return this.http.put<Booking>(`${API_URL}/bookings/${id}`, booking)
      .pipe(
        tap(updatedBooking => {
          const current = this.bookingsSubject.value;
          const normalized = this.normalizeBooking(updatedBooking as any);
          const updated = current.map(b => String(b.id) === idStr ? normalized : b);
          this.bookingsSubject.next(updated);
          this.saveToLocalStorage();
        })
      );
  }

  updateBookingStatus(id: string | number, status: BookingStatus | string, sendEmail: boolean = true): Observable<Booking> {
    const idStr = String(id);
    const url = `${API_URL}/bookings/${idStr}?sendEmail=${sendEmail}`;
    return this.http.put<Booking>(url, { status: status as BookingStatus })
      .pipe(
        tap(updatedBooking => {
          const current = this.bookingsSubject.value;
          const normalized = this.normalizeBooking(updatedBooking as any);
          const updated = current.map(b => String(b.id) === idStr ? normalized : b);
          this.bookingsSubject.next(updated);
          this.saveToLocalStorage();
        })
      );
  }

  deleteBooking(id: string | number): Observable<void> {
    const idStr = String(id);
    return this.http.delete<void>(`${API_URL}/bookings/${id}`)
      .pipe(
        tap(() => {
          const current = this.bookingsSubject.value;
          this.bookingsSubject.next(current.filter(b => String(b.id) !== idStr));
          this.saveToLocalStorage();
        })
      );
  }

  getBookingsByStatus(status: BookingStatus): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${API_URL}/bookings?status=${status}`);
  }

  getBookingsByCustomer(email: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${API_URL}/bookings/customer/${email}`);
  }

  // Local Methods
  private loadBookings(): void {
    const savedBookings = localStorage.getItem('homy_bookings');
    if (savedBookings) {
      try {
        const raw = JSON.parse(savedBookings) as any[];
        // Normalize dates stored in localStorage (convert dd/MM/yyyy to ISO)
        const normalized = (raw || []).map((b: any) => {
          let dateVal: string = b.date || '';
          if (typeof dateVal === 'string' && dateVal.includes('/')) {
            const parts = dateVal.split('/').map((p: string) => p.trim());
            if (parts.length === 3) {
              const day = Number(parts[0]);
              const month = Number(parts[1]) - 1;
              const year = Number(parts[2]);
              const d = new Date(year, month, day);
              if (!isNaN(d.getTime())) dateVal = d.toISOString();
            }
          }
          return { ...b, date: dateVal } as Booking;
        });
        this.bookingsSubject.next(normalized);
      } catch (e) {
        console.error('Error loading bookings from localStorage:', e);
      }
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('homy_bookings', JSON.stringify(this.bookingsSubject.value));
  }

  getLocalBookingById(id: string | number): Booking | undefined {
    const idStr = String(id);
    return this.bookingsSubject.value.find(booking => String(booking.id) === idStr);
  }

  getLocalAllBookings(): Booking[] {
    return this.bookingsSubject.value;
  }
}
