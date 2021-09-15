import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {ConfigService} from '../../../services/config.service';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';
import {CountryISO, SearchCountryField, TooltipLabel} from 'ngx-intl-tel-input';
import {SetCustomer} from '../../../store/actions';
import * as LocalizedFormat from 'dayjs/plugin/localizedFormat';
import * as moment from 'dayjs';
moment.extend(LocalizedFormat)

@Component({
  selector: 'app-receipt-cfd',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss'],
  providers: [ConfigService, MatSnackBar],
})
export class ReceiptCfdComponent implements OnInit {
  currency = localStorage.getItem('currency')
  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];

  customer: any = [];
  guest: any = 'Guest';
  storeInformation: any;
  cart: any;
  totalAmount: string;
  error: any;
  email: any;
  number: any = '';
  currentPayment: any;
  numberPhone: any = '';
  storeId: any;
  merchantId: any;
  finalAmount: any = localStorage.getItem('finalAmount');
  orderId: any = localStorage.getItem('orderId');
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  paymentInfo: any;
  loading = true;
  currentOrderType = localStorage.getItem('orderType');
  tipSelected: any = 0.00;

  constructor(
    private router: Router,
    private configService: ConfigService,
    private snackBar: MatSnackBar,
    private store: Store<{ storeInformation: []; cart: [], customer: [] }>,
  ) {
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data) => (this.storeInformation = data.storeInformation));
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data) => (this.customer = data.customer));
    this.guest = this.customer.length === 0 ? 'Guest' : this.customer.customerFirstName + ' ' + this.customer.customerLastName;
  }

  ngOnInit(): void {
    this.totalAmount = localStorage.getItem('finalAmount');
    this.getOrderPaymentsInformation(this.storeInformation);
    this.noPaymentComplete();
  }

  redirect() {
    this.router.navigate(['home']);
  }

  seeReceipt() {
    window.open('https://s.dashboard.eatos.com/#/!receipt/' + localStorage.getItem('orderId'));
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 5000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  getOrderPaymentsInformation = (storeInformation) => {
    this.configService.getOrderPayments(storeInformation.merchantId, storeInformation.storeId, localStorage.getItem('orderId'))
      .subscribe((data: any) => {
        this.paymentInfo = data.response[0];
        this.tipSelected = this.paymentInfo.paymentTipAmount;
        this.loading = !this.loading;
      });
  }

  sendReceipt = () => {
    const paramsEmail = {
      orderId: this.orderId,
      email: this.email,
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId
    };

    this.configService.sendReceipt(paramsEmail).subscribe(
      (data: any) => {
        if (data.success === 1) {
          this.openSnackBar(data.message, 1);
        } else {
          this.openSnackBar(data.message, 0);
        }
      },
      (error) => (this.error = error)
    );
  }

  sendReceiptMobile = () => {
    const paramsMobile = {
      orderId: this.orderId,
      mobile: this.number.e164Number,
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId
    };

    this.configService.sendReceipt(paramsMobile).subscribe(
      (data: any) => {
        if (data.success === 1) {
          this.openSnackBar(data.message, 1);
        } else {
          this.openSnackBar(data.message, 0);
        }
      },
      (error) => (this.error = error)
    );
  }

  sendReceiptMobileResponsive = () => {
    const paramsMobile = {
      orderId: this.orderId,
      mobile: this.numberPhone.e164Number,
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId
    };

    this.configService.sendReceipt(paramsMobile).subscribe(
      (data: any) => {
        if (data.success === 1) {
          this.openSnackBar(data.message, 1);
        } else {
          this.openSnackBar(data.message, 0);
        }
      },
      (error) => (this.error = error)
    );
  }

  redirectMenu() {
    localStorage.setItem('orderType', '2');
    this.router.navigate(['home']);
  }

  redirectCustomer() {
    if (this.customer.length === 0) {
      this.router.navigate(['login']);
    } else {
      this.router.navigate(['customer']);
    }
  }

  redirectOrders() {
    this.router.navigate(['orderHistory']);
  }

  setCustomer(currentStore) {
    this.store.dispatch(new SetCustomer(currentStore));
  }

  redirectLogin() {
    this.setCustomer([]);
    this.router.navigate(['login']);
  }

  goBack() {
    localStorage.setItem('orderType', '2');
    this.router.navigate(['home']);
  }

  changeTimeFormat = (date) => {
    return moment((date * 1000)).format('h:mm:ss a');
  }

  changeDateFormat = (date) => {
    return moment((date * 1000)).format('ll');
  }

  currentCustomerPhoto = () => {
    const link = this.customer.customerPhoto.replace(/^https?:\/\//, '');
    return this.customer.customerPhoto ? 'https://' + link : 'assets/profile/profile.png';
  }

  noPaymentComplete() {
    this.currentPayment = localStorage.getItem('currentOrderCart');
    if (this.currentPayment !== true) {
      console.log('redirect');
    }
  }


}
