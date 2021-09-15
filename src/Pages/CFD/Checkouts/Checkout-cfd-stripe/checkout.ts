import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Router } from '@angular/router';
import ObjectID from 'bson-objectid';
import { findSetting } from '../../../../utils/FindSetting';
import { ConfigService } from '../../../../services/config.service';
import { ClearCart, SetCustomer } from '../../../../store/actions';
import { Element as StripeElement } from 'ngx-stripe/lib/interfaces/element';
import { ElementsOptions, StripeService } from 'ngx-stripe';
import { style } from './payments.style';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { CountryISO, SearchCountryField, TooltipLabel } from 'ngx-intl-tel-input';
import { WebSocketService } from '../../../../services/socket.service';
import { environment } from '../../../../environments/environment';
import * as LocalizedFormat from 'dayjs/plugin/localizedFormat';
import * as moment from 'dayjs';
moment.extend(LocalizedFormat)
import { Subscription } from 'rxjs';

interface LocalStripeElement extends StripeElement {
  // tslint:disable-next-line:ban-types
  addEventListener?: (name: string, callback: Function) => void;
}

@Component({
  selector: 'checkout-cfd',
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss'],
  providers: [WebSocketService]
})

export class CheckoutCfdStripe implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('cardNumber') cardNumberRef: ElementRef;
  @ViewChild('cardExpiry') cardExpiryRef: ElementRef;
  @ViewChild('cardCvc') cardCvcRef: ElementRef;

  finalAmount = 0;
  paymentIntentId: any;
  paymentRequest;
  canPaymentRequest = false;
  applePaymentRequest = false;
  currency = localStorage.getItem('currency');
  separateDialCode = true;
  isDestroy = true;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  btnDisabled = false;
  cart: any;
  storeInformation: any;
  checkoutProcess = 'Creating Order...';
  loading = false;
  customer: any;
  customerInformation: any;
  prepDay: any;
  prepTime: any = '';
  tipSelected: any = 0.00;
  isPaymentFail = false;
  tipSelectedIndex: any = 5;
  seats: any = [];
  tableNumber: any;
  seatsCount: number;
  order: any;
  orderComplete: any;
  customerMobile: any;
  newCustomerInformation: any = {
    customerEmail: '',
    customerFirstName: '',
    customerLastName: '',
    customerMobile: '',
    customerAdresses: {
      customerAddress1: '',
      customerAddress2: '',
      customerCity: '',
      customerCountry: '',
      customerState: '',
      customerZip: ''
    }
  };
  autoAcceptOrder = localStorage.getItem('autoAccept');
  pauseOrder = localStorage.getItem('pauseOrder');
  currentOrderType = parseInt(localStorage.getItem('orderType'), 10);
  elements: any;
  orderType: any = this.currentOrderType;
  serviceCharge: any;
  customTip: any = '';
  deliveryFee = 0.00;
  card: StripeElement;
  cardNumber: LocalStripeElement;
  cardCvc: StripeElement;
  cardExpiry: StripeElement;
  cardNumberMobile: LocalStripeElement;
  cardCvcMobile: StripeElement;
  cardExpiryMobile: StripeElement;
  stripeTest: FormGroup;
  secretKeyStripe: any;
  stripe;
  customerPaymentAuth;
  stripeMerchant;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
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
  subTotalAmount = 0;
  totalAmount = 0;
  nameFormControl = new FormControl('', [
    Validators.required
  ]);

  lastNameFormControl = new FormControl('', [
    Validators.required
  ]);

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  phoneNumber = new FormControl('', [
    Validators.required,
    Validators.minLength(7)
  ]);

  addressFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(7)
  ]);
  address2FormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(7)
  ]);

  cityFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(1)
  ]);

  stateFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(1)
  ]);
  postalFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(1)
  ]);

  optionsDays = [
    { value: 'today', viewValue: 'Today' },
  ];

  optionsHours = [
    { viewValue: '00:00am  - 01:00am', value: moment().set('hour', 0).set('minute', 0).unix() },
    { viewValue: '01:00am  - 02:00am', value: moment().set('hour', 1).set('minute', 0).unix() },
    { viewValue: '02:00am  - 03:00am', value: moment().set('hour', 2).set('minute', 0).unix() },
    { viewValue: '03:00am  - 04:00am', value: moment().set('hour', 3).set('minute', 0).unix() },
    { viewValue: '04:00am  - 05:00am', value: moment().set('hour', 4).set('minute', 0).unix() },
    { viewValue: '05:00am  - 10:00am', value: moment().set('hour', 5).set('minute', 0).unix() },
    { viewValue: '06:00am  - 01:00am', value: moment().set('hour', 6).set('minute', 0).unix() },
    { viewValue: '07:00am  - 01:00am', value: moment().set('hour', 7).set('minute', 0).unix() },
    { viewValue: '08:00am  - 01:00am', value: moment().set('hour', 8).set('minute', 0).unix() },
    { viewValue: '09:00am  - 01:00am', value: moment().set('hour', 9).set('minute', 0).unix() },
    { viewValue: '10:00am  - 01:00am', value: moment().set('hour', 10).set('minute', 0).unix() },
    { viewValue: '11:00am  - 12:00pm', value: moment().set('hour', 11).set('minute', 0).unix() },
    { viewValue: '12:00pm  - 01:00pm', value: moment().set('hour', 12).set('minute', 0).unix() },
    { viewValue: '01:00pm  - 02:00pm', value: moment().set('hour', 13).set('minute', 0).unix() },
    { viewValue: '02:00pm  - 03:00pm', value: moment().set('hour', 14).set('minute', 0).unix() },
    { viewValue: '03:00pm  - 04:00pm', value: moment().set('hour', 15).set('minute', 0).unix() },
    { viewValue: '04:00pm  - 05:00pm', value: moment().set('hour', 16).set('minute', 0).unix() },
    { viewValue: '05:00pm  - 06:00pm', value: moment().set('hour', 17).set('minute', 0).unix() },
    { viewValue: '06:00pm  - 07:00pm', value: moment().set('hour', 18).set('minute', 0).unix() },
    { viewValue: '07:00pm  - 08:00pm', value: moment().set('hour', 19).set('minute', 0).unix() },
    { viewValue: '08:00pm  - 09:00pm', value: moment().set('hour', 20).set('minute', 0).unix() },
    { viewValue: '09:00pm  - 10:00pm', value: moment().set('hour', 21).set('minute', 0).unix() },
    { viewValue: '10:00pm  - 11:00pm', value: moment().set('hour', 22).set('minute', 0).unix() },
    { viewValue: '11:00pm  - 12:00am', value: moment().set('hour', 23).set('minute', 0).unix() },
    { viewValue: '12:00am  - 01:00am', value: moment().set('hour', 24).set('minute', 0).unix() },
  ];
  finalCurrentAmount = 0;

  storeSub$ = new Subscription();

  constructor(
    private router: Router,
    private configService: ConfigService,
    private fb: FormBuilder,
    private webSocket: WebSocketService,
    private snackBar: MatSnackBar,
    private stripeService: StripeService,
    private store: Store<{ storeInformation: []; cart: []; customer: [] }>,
  ) {
    // @ts-ignore
    this.storeSub$ = store.pipe(select('cartShop'))
      .subscribe((data: any) => (this.cart = data.cart, this.storeInformation = data.storeInformation, this.customer = data.customer));
    this.customerMobile = this.customer.customerMobile;

    this.configService.cfdOn = true;

    this.getOrder();
  }

  ngOnChanges(): void {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.finalAmount = (this.order.totalAmount + this.tipSelected);
      this.finalCurrentAmount = this.order.totalAmount + this.tipSelected;
      this.finalAmount = parseInt(String(Number(this.finalAmount.toFixed(2)) * 100), 10);
      this.stripe = Stripe('pk_test_TTF68ceJV8AKZCuq3ho4vrjY00iIHqHUZO', {
        stripeAccount: environment.stripe_account
      });
      this.stripeMerchant = Stripe('pk_test_TTF68ceJV8AKZCuq3ho4vrjY00iIHqHUZO', {
        stripeAccount: this.getAccountIntegrationId().accountId
      });
      this.paymentRequest = this.stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: 'Checkout-Stripe order',
          amount: parseInt(String(Number((this.order.totalAmount + this.tipSelected).toFixed(2)) * 100), 10),
        },
      });

      this.paymentRequest.canMakePayment().then((result) => {
        if (result) {
          this.canPaymentRequest = true;
          if (result.applePay) {
            this.applePaymentRequest = true;
          }
        } else {
          console.log('no supported');
        }
      });

      this.paymentRequest.canMakePayment().then((result) => {
        if (result) {
          this.canPaymentRequest = true;
          if (result.applePay) {
            this.applePaymentRequest = true;
          }
        } else {
          console.log('no supported');
        }
      });

      this.paymentRequest.canMakePayment().then((result) => {
        if (result) {
          this.canPaymentRequest = true;
          if (result.applePay) {
            this.applePaymentRequest = true;
          }
        } else {
          console.log('no supported');
        }
      });

      this.paymentRequest.on('paymentmethod', (ev) => {
        this.finalAmount = parseFloat((this.order.totalAmount + this.tipSelected).toFixed(2));
        this.configService.paymentAuth({
          amount: this.finalCurrentAmount,
          storeId: this.storeInformation.storeId,
          merchantId: this.storeInformation.merchantId,
          paymentProcessor: 'STRIPE',
          paymentMethodId: ev.paymentMethod.id,
        }).subscribe(({ data }: any) => {
          this.stripeMerchant
            .confirmCardPayment(data.secret, { payment_method: ev.paymentMethod.id }, { handleActions: false })
            .then((confirmResult) => {
              if (confirmResult.error) {
                ev.complete('fail');
                this.openSnackBar(confirmResult.error.code, 2);
                this.loading = !this.loading;
              } else {
                ev.complete('success');
                this.secretKeyStripe = confirmResult.paymentIntent.client_secret;
                this.paymentIntentId = confirmResult.paymentIntent.id;
                // this.generatePayment();
                if (confirmResult.paymentIntent.status === 'requires_action') {
                  this.stripe.confirmCardPayment(data.secret).then((result) => {
                    if (result.error) {
                      // The payment failed -- ask your customer for a new payment method.
                    } else {
                      // The payment has succeeded.
                    }
                  });
                } else {
                  // The payment has succeeded.
                }
              }
            });
        });
        // console.log(ev)
      });

      this.stripe = Stripe('pk_test_TTF68ceJV8AKZCuq3ho4vrjY00iIHqHUZO', {
        stripeAccount: environment.stripe_account
      });
      this.stripeMerchant = Stripe('pk_test_TTF68ceJV8AKZCuq3ho4vrjY00iIHqHUZO', {
        stripeAccount: this.getAccountIntegrationId().accountId
      });
      const elements2 = this.stripe.elements(this.elementsOptions);

      this.cardNumberMobile = elements2.create('cardNumber', { style, showIcon: true });
      this.cardNumberMobile.mount('#cardNumber2');

      this.cardCvcMobile = elements2.create('cardCvc', { style, showIcon: true });
      this.cardCvcMobile.mount('#cardCvc2');

      this.cardExpiryMobile = elements2.create('cardExpiry', { style, showIcon: true });
      this.cardExpiryMobile.mount('#cardExpiry2');

      this.cardNumberMobile.addEventListener('change', ({ error }) => {
        this.cardErrors = error && error.message;
      });

      this.tableNumber = localStorage.getItem('tableNumber') === null ? false : localStorage.getItem('tableNumber');
    }, 2000);
  }

  ngOnInit(): void {
    this.getServiceCharge();
    this.customer.length === 0
      ? this.customerInformation = this.newCustomerInformation
      : this.customerInformation = this.setCustomer(this.customer);
    this.deliveryFee = findSetting(this.storeInformation, 'OnlineStoreDeliveryFee') === 'false'
      ? 0
      : parseFloat(findSetting(this.storeInformation, 'OnlineStoreDeliveryFee'));
    if (this.currentOrderType !== 1) {
      this.deliveryFee = 0;
    } else {
      this.deliveryFee = this.deliveryFee === null ? 0 : parseFloat(String(this.deliveryFee));
    }
  }

  showPaymentRequest() {

    if (this.tipSelectedIndex === 0) {
      this.tipSelected = parseFloat((Math.round((this.getSubTotalAmount() * 0.10 * 100)) / 100).toFixed(2));
      this.customTip = '';
    }
    if (this.tipSelectedIndex === 1) {
      this.tipSelected = parseFloat((Math.round((this.getSubTotalAmount() * 0.15 * 100)) / 100).toFixed(2));
      this.customTip = '';
    }

    if (this.tipSelectedIndex === 2) {
      this.tipSelected = parseFloat((Math.round((this.getSubTotalAmount() * 0.18 * 100)) / 100).toFixed(2));
      this.customTip = '';
    }
    if (this.tipSelectedIndex === 3) {
      this.tipSelected = parseFloat((Math.round((this.getSubTotalAmount() * 0.20 * 100)) / 100).toFixed(2));
      this.customTip = '';
    }
    if (this.tipSelectedIndex === 4) {
      this.tipSelected = parseFloat((Math.round((this.getSubTotalAmount() * 0.25 * 100)) / 100).toFixed(2));
      this.customTip = '';
    }
    if (this.customTip !== 0 && this.tipSelectedIndex === 5) {
      this.tipSelected = this.customTip || 0;
    }
    this.finalAmount = parseFloat((this.getTotalAmount() + parseFloat(this.tipSelected)).toFixed(2));
    this.updatePaymentRequest('checkout', this.finalAmount * 100);
    this.paymentRequest.show();
  }

  updatePaymentRequest(label, amount) {
    this.paymentRequest.update({
      // country: 'US',
      // currency: 'usd',
      total: {
        label,
        amount,
      },
    });
  }

  getOrder = () => {
    this.loading = true;
    this.configService.getOrder(this.storeInformation.merchantId, localStorage.getItem('orderId')).subscribe((data: any) => {
      this.loading = !this.loading;
      this.order = data.response;
      this.subTotalAmount = this.order.subTotalAmount;
      this.totalAmount = this.order.totalAmount;
      this.loading = false;
      this.sendNotificationWaittingForFound();
    });
  }

  sendNotificationWaittingForFound = () => {
    const params = {
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      orderId: localStorage.getItem('orderId')
    };

    this.configService.cratePaymentInProcessNotification(params).subscribe((data: any) => {
      if (data.success === 1) {
        console.log('notification sent');
      } else {
        console.log('notification error');
      }
    });
  }

  setCustomer = (customer) => {
    return {
      customerEmail: customer.customerEmail,
      customerFirstName: customer.customerFirstName,
      customerLastName: customer.customerLastName,
      customerMobile: customer.customerMobile,
      customerAdresses: {
        customerAddress1: customer.customerAdresses[0].customerAddress1,
        customerAddress2: customer.customerAdresses[0].customerAddress2,
        customerCity: customer.customerAdresses[0].customerCity,
        customerCountry: customer.customerAdresses[0].customerCountry,
        customerState: customer.customerAdresses[0].customerState,
        customerZip: customer.customerAdresses[0].customerZip
      }
    };
  }

  orderTypeSelected(orderType) {
    this.currentOrderType = orderType;
    if (this.currentOrderType !== 1) {
      this.deliveryFee = 0;
    } else {
      this.deliveryFee = this.deliveryFee === null ? 0 : parseFloat(String(this.deliveryFee));
    }
  }

  createOrder = () => {
    console.log('creating order...');
  }

  goBack() {
    this.router.navigate(['home']);
  }

  selectTip = (tip, index) => {
    this.tipSelectedIndex = index;
    if (this.customTip !== 0 && this.tipSelectedIndex === 5) {
      this.tipSelected = 0.00;
    } else {
      this.tipSelected = this.order.subTotalAmount * tip;
      this.customTip = '';
    }
    this.finalCurrentAmount = parseFloat(this.order.totalAmount.toFixed(2)) + parseFloat(this.tipSelected.toFixed(2));
  }

  getServeId = () => {
    return this.storeInformation.settings.filter((setting) => {
      return setting.settingName === 'OnlineStoreAssignedEmployee';
    });
  }

  getServiceCharge = () => {
    if (findSetting(this.storeInformation, 'OnlineStoreAllowServiceCharge') === 'true') {
      this.configService.getServiceCharge(
        this.storeInformation.merchantId,
        this.storeInformation.storeId,
        findSetting(this.storeInformation, 'OnlineStoreServiceCharge'))
        .subscribe(
          (data: any) => {
            this.serviceCharge = data.response;
          }
        );
    } else {
      return this.serviceCharge = 0;
    }
  }

  getSubTotalAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.totalAmount * obj.quantity);
    }, 0);
  }

  getTotalAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return ((obj.totalAmount * obj.quantity) + acc + obj.taxes + this.deliveryFee);
    }, 0);
  }

  getTotalTaxesAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + obj.taxes;
    }, 0);
  }

  getModifiers = (product) => {
    return product.modifiers.map(modifier => {
      return {
        modifierId: modifier.modifierId,
        modifierName: modifier.modifierName,
        modifierPrice: modifier.modifierOptions[0].modifierOptionsValue,
        modifierType: modifier.modifierType,
        modifierGroupId: modifier.modifierGroupId,
        modifierGroupName: 'Modifications',
        modifierOptionId: modifier.modifierOptions[0]._id,
        modifierOptionName: 'Normal',
        hasMultipleOptions: false,
        orderTypeId: modifier.orderTypeId,
        isServable: modifier.isServable
      };
    });
  }

  setSeats = (productSelected) => {
    return {
      productDiscount: {
        authorizerId: '',
        discountName: '',
        discountValue: 0,
        discountType: 0,
        discountId: '',
      },
      productCategory: {
        parentCategoryName: productSelected.categoryInformation.parentCategory,
        parentCategoryId: productSelected.categoryInformation.parentCategoryId,
        categoryName: productSelected.categoryInformation.categoryName,
        categoryOrder: productSelected.categoryInformation.categoryOrder,
        categoryId: productSelected.categoryInformation.categoryId,
      },
      productSaleCategory: {
        saleCategoryName: '', // agregar categoria en el cart
        saleCategoryOrder: 0, // agregar categoria en el cart
        saleCategoryId: '', // agregar categoria en el cart
      },
      orderedProductId: new ObjectID().toHexString(),
      splitOrderIds: [],
      totalVariantNumber: 1,
      isNoTax: 0,
      negativeInventory: 0,
      inventoryTracking: 0,
      productName: productSelected.productName,
      productId: productSelected.productId, // productId
      productPrintName: productSelected.productPrinterName, // cart
      courseId: '',
      coursePosition: -1,
      courseName: '',
      productVariantName: productSelected.variant.variantName, // cart
      productVariantSKU: productSelected.variant.SKU, // cart
      productVariantId: '', // cart
      productUnitPrice: productSelected.variant.variantValue, // cart
      productTaxValue: productSelected.taxes, // cart
      productServiceChargeValue: 0,
      productOrderDiscountValue: 0,
      productDiscountValue: 0,
      productCalculatedPrice: productSelected.subTotalAmount * productSelected.quantity, // cart + tax
      productSellStatus: 1,
      productServeStatus: 1,
      productQuantity: productSelected.quantity, // cart
      productMenuId: '',
      productMenu: '',
      productMenuName: productSelected.productMenuName, // cart
      printerId: [],
      note: productSelected.notes,  // cart
      waitingToBePreparedAt: 0,
      beingPreparedAt: 0,
      readyAt: 0,
      servedAt: 0,
      cancelledAt: 0,
      voidedAt: 0,
      productTax: [
        {
          taxApplyFor: {
            delivery: true,
            here: true,
            pickup: true,
            toGo: true,
            cashRegister: true,
            banquet: true,
            customItem: true,
            serviceCharge: false,
            onlineOrdering: true
          },
          authorizerId: findSetting(this.storeInformation, 'OnlineStoreAssignedEmployee'),
          taxName: 'Sales Tax',
          taxValue: 9.5,
          taxType: 1,
          taxId: '5de6b511546335001dcd3f58',
        },
      ],
      productServiceCharge: [],
      productModifiers: this.getModifiers(productSelected), // cart
      productIngredients: productSelected.ingredients, // cart
      refundTransactionId: '',
      refundReason: null,
    };
  }

  getSeats = () => {
    this.cart.map((product => {
      return this.seats.push(this.setSeats(product));
    }));
    this.seatsCount = this.seats.length;
  }

  setOrder = (isMobile) => {
    return {
      orderServiceCharge: {
        authorizerId: this.serviceCharge === 0 ? '' : findSetting(this.storeInformation, 'OnlineStoreAssignedEmployee'),
        serviceChargeName: this.serviceCharge === 0 ? '' : this.serviceCharge.serviceChargeName,
        serviceChargeValue: this.serviceCharge === 0 ? 0 : this.serviceCharge.serviceChargeValue,
        serviceChargeType: this.serviceCharge === 0 ? 0 : this.serviceCharge.serviceChargeType,
        serviceChargeId: this.serviceCharge === 0 ? '' : this.serviceCharge.serviceChargeId,
        applicableTaxIds: this.serviceCharge === 0 ? [] : this.serviceCharge.applicableTaxIds,
      },
      globalDiscount: {
        authorizerId: '',
        discountName: '',
        discountValue: 0,
        discountType: 1,
        discountId: '',
      },
      guestsNumber: 1,
      splitOrderList: [],
      parentId: '',
      updateWS: false,
      orderName: 'Online Ordering',
      customerId: this.customer.customerId,
      customerName: this.customerInformation.customerFirstName + this.customerInformation.customerLastName,
      customerFirstName: this.customerInformation.customerFirstName,
      customerLastName: this.customerInformation.customerLastName,
      customerMobile: isMobile === true ? this.customerInformation.customerMobile.e164Number : this.customerMobile.e164Number,
      customerEmail: this.customerInformation.customerEmail,
      orderNumberSuffix: '',
      tableId: '',
      serverId: findSetting(this.storeInformation, 'OnlineStoreAssignedEmployee'),
      serverJobType: '',
      orderSellStatus: 2,
      orderServeStatus: 1,
      orderType: 8,
      onlineOrderType: this.orderType,
      onlineOrderServeStatus: this.autoAcceptOrder === 'true' ? 2 : 1,
      serviceName: 'others', // settings
      serviceId: '', // pending nicholas
      shiftId: '', // pending nicholas
      shiftName: '', // pending nicholas
      serviceType: 1, // pending nicholas
      timeOfArrival: Math.round(new Date().getTime() / 1000),
      notes: '',
      paymentId: '',
      subTotalAmount: this.getSubTotalAmount(),
      refundedAmount: 0,
      actualPaidAmount: this.getTotalAmount(),
      totalAmount: this.getTotalAmount(),
      taxAmount: this.getTotalTaxesAmount(),
      serviceChargeAmount: this.serviceCharge === 0 ? 0 : this.serviceCharge.serviceChargeValue,
      discountAmount: 0,
      generalDiscountAmount: 0,
      deliveryAmount: parseFloat(String(this.deliveryFee)),
      receiptEmail: '',
      receiptPhone: '',
      revenueCenterId: findSetting(this.storeInformation, 'OnlineOrderingRevenueCenter'),
      trackerId: '',
      originId: '',
      isSyncedMarketMan: 0,
      waitingToBePreparedAt: 0,
      beingPreparedAt: 0,
      readyAt: 0,
      prepTime: this.prepTime === '' ? '' : this.prepTime,
      servedAt: 0,
      cancelledAt: 0,
      voidedAt: 0,
      createdEmployeeId: this.getServeId()[0].createdEmployeeId,
      updatedEmployeeId: this.getServeId()[0].updatedEmployeeId,
      status: 1,
      seats: [
        {
          seatName: 'online Ordering',
          seatNumber: null,
          customerId: this.customer.customerId,
          customerName: this.customer.customerFirstName,
          orderProducts: this.seats,
        },
      ],
      updatedAt: Math.round(new Date().getTime() / 1000),
      orderGiftCard: [],
      storeId: this.storeInformation.storeId,
      createdAt: Math.round(new Date().getTime() / 1000),
      merchantId: this.storeInformation.merchantId,
    };
  }

  cleanCart() {
    this.router.navigate(['receipt-cfd']);
  }

  setStoreCustomer(currentCustomer) {
    this.store.dispatch(new SetCustomer(currentCustomer));
  }

  ngOnDestroy() {
    this.storeSub$.unsubscribe();
    this.configService.cfdOn = false;
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

  createGuest(isMobile) {
    const params = {
      customerFirstName: this.customerInformation.customerFirstName,
      customerLastName: this.customerInformation.customerLastName,
      customerEmail: this.customerInformation.customerEmail,
      customerMobile: isMobile === true ? this.customerInformation.customerMobile.e164Number : this.customerMobile.e164Number,
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      customerAdresses: [{
        customerAddress1: this.customerInformation.customerAdresses.customerAddress1,
        customerAddress2: this.customerInformation.customerAdresses.customerAddress2,
        customerCity: this.customerInformation.customerAdresses.customerCity,
        customerState: this.customerInformation.customerAdresses.customerState,
        customerCountry: this.customerInformation.customerAdresses.customerCountry,
        customerZip: this.customerInformation.customerAdresses.customerZip
      }]
    };
    this.configService.createGuest(params).subscribe((data: any) => {
      this.customer = data.response;
      this.setStoreCustomer(this.customer);
    });
    return true;
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 3000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  getAccountIntegrationId = () => {
    return this.storeInformation.integrations.find((integration) => {
      return integration.name === 'STRIPE';
    });
  }

  getSecretKey = async (amount) => {
    const response = await this.stripe.createPaymentMethod({
      type: 'card',
      card: this.cardNumberMobile,
    });

    try {
      this.checkoutProcess = 'Loading...';
      this.loading = true;
      this.configService.paymentAuth({
        amount,
        storeId: this.storeInformation.storeId,
        merchantId: this.storeInformation.merchantId,
        paymentProcessor: 'STRIPE',
        paymentMethodId: response.paymentMethod.id,
        isCfd: true,
      }).subscribe((data: any) => {
        if (data.success === 1) {
          this.customerPaymentAuth = data.data;
          this.secretKeyStripe = data.data.secret;
          this.paymentIntentId = data.data.id;

          this.stripeMerchant.confirmCardPayment(
            this.secretKeyStripe,
            {
              payment_method: data.data.paymentMethodId,
            })
            .then((result) => {
              try {
                if (result.paymentIntent.id) {
                  const params = {
                    storeId: this.storeInformation.storeId,
                    merchantId: this.storeInformation.merchantId,
                    amount,
                    paymentIntentId: this.paymentIntentId,
                    paymentProcessor: 'STRIPE',
                  };
                  this.configService.captureOrder(params)
                    .subscribe((captureResponse: any) => {
                      if (captureResponse.success === 1) {
                        this.generatePayment();
                      } else {
                        this.openSnackBar('Error in capture process', 2);
                        this.loading = !this.loading;
                      }
                    });
                }
              } catch (e) {
                this.openSnackBar(result.error.code, 2);
                this.loading = !this.loading;
              }
            });
        } else {
          console.log('error');
        }
      });
    } catch (e) {
      this.openSnackBar('Please verify all credit cart fields', 2);
      this.loading = false;
      console.log(e);
    }
  }

  buy() {
    const name = this.stripeTest.get('name').value;
    this.stripeService
      .createToken(this.cardNumber, { name })
      .subscribe((result) => {
        if (result.token) {
          if (this.isPaymentFail === false) {
            this.generatePayment();
          } else {
            this.payAgain(result.token);
          }
        } else if (result.error) {
          this.openSnackBar(result.error.message, 2);
          this.loading = !this.loading;
        }
      });
  }

  generatePayment = () => {
    this.checkoutProcess = 'Generating Payment';
    localStorage.setItem('finalAmount', (this.tipSelected + this.order.totalAmount).toFixed(2));
    const params = {
      amount: this.finalCurrentAmount,
      tipAmount: parseFloat(this.tipSelected.toFixed(2)),
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      orderId: localStorage.getItem('orderId'),
      paymentIntentId: this.paymentIntentId,
      employeeId: findSetting(this.storeInformation, 'OnlineStoreAssignedEmployee'),
      card: this.customerPaymentAuth.card,
      captured: true,
      paymentProcessor: localStorage.provider,
    };
    this.configService.generateCardconnectPayment(params).subscribe(
      (data: any) => {
        if (data.success === 1) {
          this.checkoutProcess = 'Payment successfully ';
          localStorage.cfdLoad = false;
          this.store.dispatch(new ClearCart([]));
          this.loading = !this.loading;
          localStorage.setItem('currentOrderCart', JSON.stringify(this.cart));
          this.isDestroy = false;
          this.cleanCart();
        } else {
          this.openSnackBar(data.message, 2);
          this.loading = false;
          this.isPaymentFail = true;
        }
      }
    );
  }

  generateOrder = () => {
    this.checkoutProcess = 'Creating Order...';
    this.loading = !this.loading;

    if (this.customer.length === 0) {
      this.createGuest(false);
    }

    setTimeout(() => {
      if (this.cart !== []) {
        this.order = this.setOrder(false);
        this.getSeats();
      }
      const params = {
        ...this.order,
      };

      this.configService.generateOrder(params).subscribe(
        (data: any) => {
          this.orderComplete = data.data;
          localStorage.setItem('orderId', this.orderComplete._id);
          this.buy();
        }
      );
    }, 3000);
  }

  generateOrderMobile = () => {
    const amount = this.finalCurrentAmount;
    this.getSecretKey(amount);
  }

  select(value) {
    this.btnDisabled = true;
  }

  setAsap() {
    this.btnDisabled = false;
  }

  selectCustomTips(ev) {
    if (ev === 0) {
      this.customTip = '';
    }

    this.tipSelected = this.customTip || 0;
    this.finalCurrentAmount = this.order.totalAmount + this.tipSelected;
  }

  payAgain = (token) => {
    const currentCart = this.cart;
    const params = {
      tokenId: token.id,
      amount: parseFloat((this.order.totalAmount + this.tipSelected).toFixed(2)),
      tipAmount: parseFloat(this.tipSelected.toFixed(2)),
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      orderId: localStorage.getItem('orderId'),
      paymentIntentId: this.paymentIntentId,
      employeeId: findSetting(this.storeInformation, 'OnlineStoreAssignedEmployee'),
    };
    this.configService.generatePayment(params).subscribe(
      (data: any) => {
        if (data.success === 1) {
          this.checkoutProcess = 'Payment successfully ';
          this.store.dispatch(new ClearCart([]));
          localStorage.setItem('currentOrderCart', JSON.stringify(currentCart));
          this.isPaymentFail = false;
          this.loading = !this.loading;
          this.cleanCart();
        } else {
          this.openSnackBar(data.message, 2);
          this.loading = !this.loading;
          this.isPaymentFail = true;
        }
      }
    );
  }

  displayFloatTip() {
    this.customTip = parseFloat(this.customTip).toFixed(2);
  }
}
