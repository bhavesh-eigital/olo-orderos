import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {MatDialog} from '@angular/material/dialog';
import {MatCalendarCellCssClasses} from '@angular/material/datepicker';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {style} from './payments.style';
import {Element as StripeElement, ElementsOptions, StripeService,} from 'ngx-stripe';
import {findSetting} from '../../utils/FindSetting';
import {ConfigService} from '../../services/config.service';
import {Router} from '@angular/router';
import {ThemePalette} from '@angular/material/core';
import {WebSocketService} from '../../services/socket.service';

interface LocalStripeElement extends StripeElement {
  addEventListener?: (name: string, callback: Function) => void;
}

@Component({
  selector: 'app-CDF-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  providers: [FormBuilder, StripeService, ConfigService]
})
export class PaymentCFDComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  loading = true;
  checkoutProcess = 'Creating Order...';
  color: ThemePalette = 'accent';
  order: any;
  orderType: any = 1;
  orderComplete: any;
  error: any;
  seats: any = [];
  seatsCount: number;
  isMethodCardSelected: any = 1;
  tipsOptions: any;
  tipSelected = 0;
  tips = 0;
  cart: any;
  storeInformation: any;
  customer: any;
  tipsOption: any;
  serviceCharge: any;
  isDestroy = true;
  paymentInfo: any;
  // stripe related elements
  elements: any;
  card: StripeElement;
  cardNumber: LocalStripeElement;
  cardCvc: StripeElement;
  cardExpiry: StripeElement;
  stripeTest: FormGroup;
  elementsOptions: ElementsOptions = {
    locale: 'en',
    fonts: [
      {
        cssSrc:
          'https://fonts.googleapis.com/css?family=Montserrat:300,300i,400,500,600',
      },
    ],
  };
  cardErrors;

  constructor(private dialog: MatDialog,
              private configService: ConfigService,
              private fb: FormBuilder,
              private router: Router,
              private webSocket: WebSocketService,
              private stripeService: StripeService,
              private store: Store<{ storeInformation: []; cart: [] }>,
  ) {
    // @ts-ignore
    // tslint:disable-next-line:no-shadowed-variable
    store.pipe(select('cartShop')).subscribe((data) => (this.cart = data.cart));
    // @ts-ignore
    // tslint:disable-next-line:no-shadowed-variable
    store.pipe(select('cartShop')).subscribe((data) => (this.storeInformation = data.storeInformation));
    // @ts-ignore
    // tslint:disable-next-line:no-shadowed-variable
    store.pipe(select('cartShop')).subscribe((data) => (this.customer = data.customer));
  }

  ngAfterViewInit(): void {
    this.stripeTest = this.fb.group({
      name: ['', [Validators.required]],
    });
    this.stripeService
      .elements(this.elementsOptions)
      .subscribe((elements) => {
        this.elements = elements;
        if (!this.cardNumber) {
          this.cardNumber = this.elements.create('cardNumber', {
            style,
            classes: {base: 'form-control'},
          });
          this.cardNumber.mount('#card-number');
          this.cardNumber.addEventListener('change', ({error}) => {
            this.cardErrors = error && error.message;
          });
        }
        if (!this.cardCvc) {
          this.cardCvc = this.elements.create('cardCvc', {
            style,
            classes: {base: 'form-control'},
          });
          this.cardCvc.mount('#card-cvc');
        }
        if (!this.cardExpiry) {
          this.cardExpiry = this.elements.create('cardExpiry', {
            style,
            classes: {base: 'form-control'},
          });
          this.cardExpiry.mount('#card-expiry');
        }
      });
  }

  @HostListener('window:beforeunload')
  ngOnDestroy() {
    if (this.isDestroy === true) {
      this.webSocket.socket.emit('cfd', {
        storeId: this.storeInformation.storeId,
        merchantId: this.storeInformation.merchantId,
        type: 'payment',
        data: {
          status: 'payment_canceled',
          orderId: localStorage.getItem('orderId')
        },
        message: 'Payment Canceled'
      });
    }
  }

  getOrder = () => {
    this.loading = true;
    this.configService.getOrder(this.storeInformation.merchantId, localStorage.getItem('orderId')).subscribe((data: any) => {
      this.loading = !this.loading;
      this.order = data.response;
    });
  }

  ngOnInit() {
    this.webSocket.socket.emit('cfd', {
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      type: 'payment',
      data: {
        status: 'payment_in_progress',
        orderId: localStorage.getItem('orderId')
      },
      message: 'Payment in progress'
    });

    this.tipsOptions = JSON.parse(findSetting(this.storeInformation, 'OnlineStorePresetOptions'));
    this.getOrder();
  }

  isSettingActive = (setting) => {
    const settingValue = findSetting(this.storeInformation, setting);
    return settingValue !== 'false';
  }

  selectTip = (tip, percentage) => {
    this.tipsOption = '';
    this.tips = this.order.totalAmount * percentage;
    return this.tipSelected = tip;
  }

  setCustomTips = () => {
    this.tips = this.tipsOption === '' ? this.tips : this.tipsOption;
  }

  cardSelected = (card) => {
    this.isMethodCardSelected = card;
  }

  openSchedule() {
    this.dialog.open(ScheduleCFDComponent, {
      panelClass: 'my-class',
    });
  }

  pay() {
    this.loading = true;
    const name = this.stripeTest.get('name').value;
    this.stripeService
      .createToken(this.cardNumber, {name})
      .subscribe((result) => {
        if (result.token) {
          this.generatePayment(result.token);
        } else if (result.error) {
          console.log(result.error.message);
        }
      });
  }

  cleanCart() {
    this.router.navigate(['receipt']);
  }

  generatePayment = (token) => {
    this.checkoutProcess = 'Generating Payment';
    localStorage.setItem('finalAmount', (this.tips + this.order.totalAmount).toFixed(2));
    const params = {
      tokenId: token.id,
      amount: parseFloat((this.order.totalAmount + this.tips).toFixed(2)),
      tipAmount: this.tips,
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      orderId: localStorage.getItem('orderId'),
      employeeId: findSetting(this.storeInformation, 'OnlineStoreAssignedEmployee'),
    };
    this.configService.generatePayment(params).subscribe(
      (data: any) => {
        if (data.message === 'Payment successfully created') {
          this.checkoutProcess = 'Payment successfully ';
          this.loading = !this.loading;
          this.webSocket.socket.emit('cfd', {
            storeId: this.storeInformation.storeId,
            merchantId: this.storeInformation.merchantId,
            type: 'payment',
            data: {
              status: 'payment_completed',
              orderId: localStorage.getItem('orderId')
            },
            message: 'Payment successfully'
          });
          this.isDestroy = false;
          this.loading = !this.loading;

          this.cleanCart();
        }
      },
      (error) => (this.error = error)
    );
  }
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'schedule-CDF-dialog',
  templateUrl: './schedule-dialog.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleCFDComponent implements OnInit {
  selectedDate: any;
  customCalendarHeader: any;

  ngOnInit(): void {
  }

  onSelect(event) {
    this.selectedDate = event;
  }

  constructor() {
  }

  dateClass() {
    return (date: Date): MatCalendarCellCssClasses => {
      if (date.getDate() === 1) {
        return 'special-date';
      } else {
        return;
      }
    };
  }
}
