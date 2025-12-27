import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactPayload {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private base = 'http://localhost:8080/api/contacts';

  constructor(private http: HttpClient) {}

  submitContact(payload: ContactPayload): Observable<ContactPayload> {
    return this.http.post<ContactPayload>(this.base, payload);
  }

  // admin: list all contacts
  getAllContacts(): Observable<ContactPayload[]> {
    return this.http.get<ContactPayload[]>(`${this.base}/all`);
  }
}
