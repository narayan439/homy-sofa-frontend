import { Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class ApiUrlService {
  public baseUrl = 'https://homy-sofa-backend-production.up.railway.app';
  public apiPrefix = '/api';

  get apiUrl(): string {
    return `${this.baseUrl}${this.apiPrefix}`;
  }
}

export const API_BASE_URL = 'https://homy-sofa-backend-production.up.railway.app/api';
