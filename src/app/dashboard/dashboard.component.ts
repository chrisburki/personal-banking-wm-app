import { Component, OnInit } from '@angular/core';
import { Customer } from '../model/model.customer.class';
import { CustomerService } from '../service/customer.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  customer: Customer;
  fillerContent = Array.from({length: 15}, () =>
      `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
       labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
       laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
       voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
       cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`);

  constructor(private customerService: CustomerService) { }

  getCustomer(): void {
    this.customerService.getCustomer()
    .subscribe(customer => this.customer = customer);
  }

  ngOnInit() {
    this.getCustomer();
  }

}
