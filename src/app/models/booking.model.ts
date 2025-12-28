export type BookingStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
  totalBookings: number;
  id?: number | string;
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string; // Format: dd/mm/yyyy
  message?: string;
  status: BookingStatus;
  timeSlot?: string;
  bookingDate?: string; // When the booking was created
  totalAmount?: number;
  price?: number;
  notes?: string;
  customerId?: number | string;
  reference?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingFilter {
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
  customerId?: string;
  service?: string;
}

export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageValue: number;
}