import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Booking } from '../../models/booking.model';

@Injectable({ providedIn: 'root' })
export class ExcelExportService {
  private parseAdditionalServices(jsonString?: string): Array<{ id: string; name: string; price: number }> {
    try {
      if (!jsonString) return [];
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse additional services JSON', e);
      return [];
    }
  }

  exportBookings(bookings: Booking[], getServiceName: (id: string) => string) {
    if (!bookings || bookings.length === 0) return;

    const excelData = bookings.map(booking => {
      const serviceName = getServiceName(booking.service);
      const extraServices = this.parseAdditionalServices(booking.additionalServicesJson || '');
      const extraServicesText = extraServices.length > 0
        ? extraServices.map(s => `${s.name} (₹${s.price})`).join('; ')
        : 'None';

      const formattedDate = booking.date ? new Date(booking.date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      }) : 'N/A';

      const bookingTime = booking.timeSlot ? (
        booking.timeSlot === 'morning' ? '9 AM - 12 PM' :
        booking.timeSlot === 'afternoon' ? '12 PM - 4 PM' :
        booking.timeSlot === 'evening' ? '4 PM - 8 PM' : booking.timeSlot
      ) : 'N/A';

      // prefer explicit createdAt from backend; fallback to bookingDate if present
      const bookingCreated = (booking.createdAt || booking.bookingDate) ? new Date((booking.createdAt || booking.bookingDate) as string).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }) : 'N/A';

      const daysUntilService = booking.date
        ? `${Math.ceil(Math.abs(new Date(booking.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`
        : 'N/A';

      return {
         'Serial ID': booking.id || 'N/A',
        'Reference No': booking.reference || 'N/A',
        'Customer Name': booking.name || 'N/A',
        'Email': booking.email || 'N/A',
        'Phone': booking.phone || 'N/A',
        'Service Type': serviceName,
        'Service Date': formattedDate,
        'Extra Services Taken': extraServicesText,
        // 'Service Price': `₹${booking.price || '0'}`,
        // 'Extra Amount': `₹${booking.extraAmount || '0'}`,
        'Completed Amount': `₹${booking.totalAmount || booking.price || '0'}`,
        'Status': booking.status || 'N/A',
        'Booking Time': bookingCreated,
        'Completion Date': booking.completionDate || 'N/A',
        'Days Until Service': daysUntilService
      };
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

    const wscols = [
      { wch: 15 }, // Serial ID
      { wch: 18 }, // Reference No
      { wch: 20 }, // Customer Name
      { wch: 28 }, // Email
      { wch: 15 }, // Phone
      { wch: 20 }, // Service Type
      { wch: 15 }, // Service Date
    //   { wch: 18 }, // Booking Time
      { wch: 35 }, // Extra Services Taken
    //   { wch: 15 }, // Service Price
    //   { wch: 15 }, // Extra Amount
      { wch: 18 }, // Completed Amount
      { wch: 12 }, // Status
      { wch: 25 }, // Booking Created
      { wch: 18 }, // Completion Date
      { wch: 15 }  // Days Until Service
    ];

    worksheet['!cols'] = wscols;

    const workbook: XLSX.WorkBook = { Sheets: { 'Bookings': worksheet }, SheetNames: ['Bookings'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
    const fileName = `HomY_Sofa_Bookings_${dateStr}.xlsx`;

    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
