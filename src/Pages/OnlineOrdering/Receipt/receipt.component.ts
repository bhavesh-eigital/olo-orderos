import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {ConfigService} from '../../../services/config.service';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';
import {CountryISO, SearchCountryField, TooltipLabel} from 'ngx-intl-tel-input';
import {SetCustomer} from '../../../store/actions';
import {findSetting} from 'src/utils/FindSetting';
import * as LocalizedFormat from 'dayjs/plugin/localizedFormat';
import * as moment from 'dayjs';
moment.extend(LocalizedFormat)
import { Subscription } from 'rxjs';
import { UIService } from 'src/services/ui.service';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss'],
  providers: [ConfigService, MatSnackBar],
})
export class ReceiptComponent implements OnInit, OnDestroy {
  currency = localStorage.getItem('currency');
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
  allowGratuity: string;

  customerSub$ = new Subscription();
  storeInfoSub$ = new Subscription();


  constructor(
    private router: Router,
    private configService: ConfigService,
    private snackBar: MatSnackBar,
    private store: Store<{ storeInformation: []; cart: [], customer: [] }>,
    public uiService: UIService
  ) {
    // @ts-ignore
    this.customerSub$ = store.pipe(select('cartShop')).subscribe((data) => (this.storeInformation = data.storeInformation));
    // @ts-ignore
    this.storeInfoSub$ = store.pipe(select('cartShop')).subscribe((data) => (this.customer = data.customer));
    this.guest = this.customer.length === 0 ? 'Guest' : this.customer.customerFirstName + ' ' + this.customer.customerLastName;

    this.email = this.customer.customerEmail;
    this.numberPhone = this.customer.customerMobile;
    this.number = this.customer.customerMobile;

  }

  ngOnInit(): void {
    this.totalAmount = localStorage.getItem('finalAmount');
    this.getOrderPaymentsInformation(this.storeInformation);
    this.noPaymentComplete();
    this.allowGratuity = findSetting(this.storeInformation, 'OnlineStoreAllowGratuity');
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
    this.configService.getOrderPayments(storeInformation.merchantId, storeInformation.storeId, localStorage.getItem('orderId'))
      .subscribe((data: any) => {
        this.paymentInfo = data.response[0];
        this.tipSelected = this.paymentInfo?.paymentTipAmount;
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

  getTotalPaymentAmount = (transactionIds) => {
    return transactionIds.reduce((acc, obj) => {
      return acc + obj.transactionAmount;
    }, 0);
  }

  ngOnDestroy() {
    this.customerSub$.unsubscribe();
    this.storeInfoSub$.unsubscribe();
    this.uiService.showOldReceiptUI = false;
  }
}
