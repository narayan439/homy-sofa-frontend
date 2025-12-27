export interface Customer {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  zipCode?: string;
  totalBookings?: number;
  totalSpent?: number;
  joinDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentDetails {
  id?: string;
  bookingId: string;
  customerId: string;
  amount: number;
  paymentMethod: 'credit_card' | 'debit_card' | 'upi' | 'net_banking' | 'wallet';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id?: string;
  bookingId: string;
  customerId: string;
  rating: number; // 1-5
  comment: string;
  createdAt?: string;
  updatedAt?: string;
}
