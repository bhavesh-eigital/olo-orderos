import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {MatDialog} from '@angular/material/dialog';
import {ClearCart, SetCustomer} from '../../store/actions';
import {MatMenuTrigger} from '@angular/material/menu';
import { AfterLoginViews, UIService } from 'src/services/ui.service';

@Component({
  selector: 'account',
  templateUrl: './account.html',
  styleUrls: ['./account.scss']
})
export class Account implements OnInit {

  customer: any;
  customerInformation: any;
  customerPhoto: any;
  loginStatus = 'Log in';
  tableNumber: any;
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

  open = false;

  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @Output() openSidebar = new EventEmitter<void>();

  constructor(
    private router: Router,
    private store: Store<{ storeInformation: []; cart: [], customer: [] }>,
    private dialog: MatDialog,
    private uiService: UIService
  ) {
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
    if (this.customer.length !== 0) {
      this.customerInformation = this.customer;
    }
  }

  openMenu() {
    this.trigger.openMenu();
  }

  closeMenu() {
    this.trigger.closeMenu();
  }

  redirectHome() {
    this.router.navigate(['home']);
  }

  redirectFavorites() {
    if (this.customer === undefined || this.customer.length === 0) {
      this.router.navigate(['login']);
    } else {
      this.router.navigate(['favorites']);
    }
  }

  redirectOrders() {
    if (this.customer === undefined || this.customer.length === 0) {
      this.uiService.afterLogin = AfterLoginViews.TO_ORDERS;
      this.router.navigate(['login']);
    } else {
      this.router.navigate(['orders']);
    }
  }

  redirectAccount() {
    if (this.customer === undefined || this.customer.length === 0) {
      this.uiService.afterLogin = AfterLoginViews.TO_ACCOUNT;
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

  redirectLogin() {
    if(this.customer.length !== 0) {
      this.setCustomer([]);
      this.cleanCart([]);
      localStorage.removeItem('scheduleCategoryId');
    }
    const currency = localStorage.currency;
    const subdomain = localStorage.subdomain;
    const provider = localStorage.provider;
    const autoAccept = localStorage.autoAccept;
    localStorage.clear();
    localStorage.currency = currency;
    localStorage.subdomain = subdomain;
    localStorage.provider = provider;
    localStorage.autoAccept = autoAccept;

    this.uiService.afterLogin = null;

    this.router.navigate(['login']);
  }

  checkUser() {
    if (this.customer.length === 0) {
      this.router.navigate(['login']);
    } else {
      return;
    }
  }


  getCustomerPhoto = () => {
    const link = this.customer.customerPhoto.replace(/^https?:\/\//, '');
    return 'https://' + link;
  }

  redirectTickets() {
    if (this.customer === undefined || this.customer.length === 0) {
      this.uiService.afterLogin = AfterLoginViews.TO_TICKETS;
      this.router.navigate(['login']);
    } else {
      this.router.navigate(['tickets']);
    }
  }
}
