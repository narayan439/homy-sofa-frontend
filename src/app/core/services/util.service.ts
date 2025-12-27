import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  /**
   * Generate a unique ID
   */
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Format date to DD/MM/YYYY
   */
  formatDateDDMMYYYY(date: Date | string): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Format date to YYYY-MM-DD
   */
  formatDateYYYYMMDD(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Validate email
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number (Indian format)
   */
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }

  /**
   * Truncate string
   */
  truncateString(str: string, length: number = 50): string {
    if (str.length <= length) {
      return str;
    }
    return str.substring(0, length) + '...';
  }

  /**
   * Check if string is empty or whitespace
   */
  isEmpty(str: string): boolean {
    return !str || str.trim().length === 0;
  }

  /**
   * Get query parameters from URL
   */
  getQueryParams(): { [key: string]: string } {
    const params: { [key: string]: string } = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split('&');

    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
    });

    return params;
  }

  /**
   * Get query parameter by name
   */
  getQueryParam(name: string): string | null {
    const params = this.getQueryParams();
    return params[name] || null;
  }

  /**
   * Debounce function
   */
  debounce(func: Function, wait: number): (...args: any[]) => void {
    let timeout: any;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle function
   */
  throttle(func: Function, limit: number): (...args: any[]) => void {
    let inThrottle: boolean;
    return (...args: any[]) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Deep clone object
   */
  deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Merge objects
   */
  mergeObjects<T>(target: T, source: Partial<T>): T {
    return { ...target, ...source };
  }

  /**
   * Get time ago string
   */
  getTimeAgo(date: Date | string): string {
    const now = new Date();
    const d = new Date(date);
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

    return this.formatDateDDMMYYYY(d);
  }

  /**
   * Check if device is mobile
   */
  isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  /**
   * Scroll to element by ID
   */
  scrollToElement(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Copy text to clipboard
   */
  copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text);
  }
}
