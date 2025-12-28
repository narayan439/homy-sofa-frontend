import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiUrlService {
  public baseUrl = environment.apiBaseUrl;
  public apiPrefix = environment.apiPrefix;

  get apiUrl(): string {
    return `${this.baseUrl}${this.apiPrefix}`;
  }
}

export const API_BASE_URL = `${environment.apiBaseUrl}${environment.apiPrefix}`;
