import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {ConfigService} from '../../../services/config.service';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';
import {CountryISO, SearchCountryField, TooltipLabel} from 'ngx-intl-tel-input';
import {SetCustomer} from '../../../store/actions';
import * as LocalizedFormat from 'dayjs/plugin/localizedFormat';
import * as moment from 'dayjs';
moment.extend(LocalizedFormat)
import { Subscription } from 'rxjs';

@Component({
  selector: 'receipt-DineIn',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss'],
  providers: [ConfigService, MatSnackBar],
})
export class ReceiptDineInComponent implements OnInit, OnDestroy {
  currency = localStorage.getItem('currency');
  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  totals: any;
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
  payments: any = [];

  customerSub$ = new Subscription();
  storeInfoSub$ = new Subscription();

  constructor(
    private router: Router,
    private configService: ConfigService,
    private snackBar: MatSnackBar,
    private store: Store<{ storeInformation: []; cart: [], customer: [] }>,
  ) {
    // @ts-ignore
    this.customerSub$ = store.pipe(select('cartShop')).subscribe((data) => (this.storeInformation = data.storeInformation));
    // @ts-ignore
    this.storeInfoSub$ = store.pipe(select('cartShop')).subscribe((data) => (this.customer = data.customer));
    this.guest = this.customer.length === 0 ? 'Guest' : this.customer.customerFirstName + ' ' + this.customer.customerLastName;
    this.email = this.customer.customerEmail;
    this.numberPhone = this.customer.customerMobile;
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
    window.open('https://d.dashboard.eatos.com/#/!receipt/' + localStorage.getItem('orderId'));
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
    const paymentOrders = JSON.parse(localStorage.ordersPayments);
    paymentOrders.map((order, index) => {
      this.configService.getOrderPayments(storeInformation.merchantId, storeInformation.storeId, order.orderId)
        .subscribe((data: any) => {
          this.paymentInfo = data.response[0];
          this.payments.push(data.response[0]);
          this.tipSelected = this.paymentInfo.paymentTipAmount;
          if (index + 1 === paymentOrders.length) {
            this.loading = !this.loading;
          }
          setTimeout(() => {
            this.totals = this.getTotalPlacedOrders();
          }, 700);
        });
    });
  }

  getTotalPlacedOrders = () => {
    const orders = this.payments.flatMap((payments) => {
      return payments.orderId;
    });

    const transactions = this.payments.flatMap((payments) => {
      return payments.transactionIds;
    });

    const placedOrdersTotalAmount = this.payments.reduce((acc, obj) => {
      return acc + (obj.paymentAmount);
    }, 0);

    const placedOrdersSubTotalAmount = orders.reduce((acc, obj) => {
      return acc + (obj.subTotalAmount);
    }, 0);

    const placedOrdersTaxes = orders.reduce((acc, obj) => {
      return acc + obj.taxAmount;
    }, 0);

    const placedOrdersTips = transactions.reduce((acc, obj) => {
      return acc + (obj.transactionTipAmount);
    }, 0);

    const currentOrders = orders.flatMap((orderProducts) => {
      return orderProducts.seats[0].orderProducts;
    });

    return {
      placedOrdersTotalAmount,
      placedOrdersSubTotalAmount,
      placedOrdersTaxes,
      placedOrdersTips,
      currentOrders
    };
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

  ngOnDestroy() {
    this.customerSub$.unsubscribe();
    this.storeInfoSub$.unsubscribe();
  }

}
