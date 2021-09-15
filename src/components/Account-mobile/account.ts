import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {MatDialog} from '@angular/material/dialog';
import {ClearCart, SetCustomer, SetPlacedOrder} from '../../store/actions';

@Component({
  selector: 'account-mobile',
  templateUrl: './account.html',
  styleUrls: ['./account.scss']
})
export class AccountMobile implements OnInit {

  customer: any;
  customerInformation: any;
  tableNumber: any;
  loginStatus = 'Log in';
  newCustomerInformation: any = {
    customerEmail: '',
    customerFirstName: 'Guest',
    customerLastName: '',
    customerMobile: '',
    customerPhoto: '',
    customerAdresses: [{
      customerAddress1: '',
      customerAddress2: '',
      customerCity: '',
      customerState: '',
      customerCountry: '',
      customerZip: ''
    }],
  };


  constructor(private router: Router,
    private store: Store<{ storeInformation: []; cart: [], customer: [] }>,
    private dialog: MatDialog) {
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data) => (this.cart = data.cart));
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data) => (this.storeInformation = data.storeInformation));
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data) => (this.customer = data.customer));
  }

  ngOnInit(): void {
    this.customer.length === 0 ? this.customerInformation = this.newCustomerInformation : this.customerInformation = this.customer;
    this.customer.length === 0 ? this.loginStatus = 'Login' : this.loginStatus = 'Sign Out';
    this.tableNumber = localStorage.getItem('tableNumber') === null ? false : localStorage.getItem('tableNumber');
  }


  redirectHome() {
    this.router.navigate(['home']);
  }

  redirectFavorites() {
    if (this.customer === undefined || this.customer.length > 0) {
      this.router.navigate(['login']);
    } else {
      this.router.navigate(['favorites']);
    }
  }

  redirectOrders() {
    if (this.customer === undefined || this.customer.length > 0) {
      this.router.navigate(['login']);
    } else {
      this.router.navigate(['orders']);
    }
  }


  redirectAccount() {
    if (this.customer === undefined || this.customer.length > 0) {
      this.router.navigate(['login']);
    } else {
      this.router.navigate(['customer']);
    }
  }

  setCustomer(currentStore) {
    this.store.dispatch(new SetCustomer(currentStore));
  }

  cleanCart(currentStore) {
    this.store.dispatch(new ClearCart(currentStore));
  }

  setPlacedOrders(newOrder) {
    this.store.dispatch(new SetPlacedOrder(newOrder));
  }

  redirectLogin() {
    this.setCustomer([]);
    this.cleanCart([]);
    this.setPlacedOrders([]);
    const currency = localStorage.currency;
    const subdomain = localStorage.subdomain;
    const provider = localStorage.provider;
    localStorage.clear();
    localStorage.currency = currency;
    localStorage.subdomain = subdomain;
    localStorage.provider = provider;

    this.router.navigate(['login']);
  }

}
