import { Component, OnInit } from '@angular/core';
import { CustomerService, Customer } from '../../core/services/customer.service';

@Component({
  selector: 'app-manage-customers',
  templateUrl: './manage-customers.component.html',
  styleUrls: ['./manage-customers.component.css']
})
export class ManageCustomersComponent implements OnInit {

  displayedColumns: string[] = ['name', 'phone', 'email', 'bookings', 'actions'];

  customers: Customer[] = [];

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.customerService.getAllCustomers().subscribe({
      next: (data) => this.customers = data || [],
      error: (err) => {
        console.error('Failed to load customers', err);
        this.customers = [];
      }
    });
  }

  getTotalBookings(): number {
    return this.customers.reduce((total, customer) => total + (customer.totalBookings || 0), 0);
  }

  viewCustomerDetails(customer: Customer) {
    // TODO: navigate to customer detail or open dialog
    console.log('View customer:', customer);
  }

  callCustomer(customer: Customer) {
    console.log('Call customer:', customer.phone);
  }

  messageCustomer(customer: Customer) {
    console.log('Message customer:', customer.phone);
  }

}