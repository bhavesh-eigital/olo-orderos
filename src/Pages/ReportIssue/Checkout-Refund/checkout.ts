import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {select, Store} from '@ngrx/store';
import {Router} from '@angular/router';
import ObjectID from 'bson-objectid';
import {findSetting} from '../../../utils/FindSetting';
import {ConfigService} from '../../../services/config.service';
import {ClearCart, SetCustomer} from '../../../store/actions';
import {Element as StripeElement} from 'ngx-stripe/lib/interfaces/element';
import {ElementsOptions, StripeService} from 'ngx-stripe';
import {style} from './payments.style';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';
import {CountryISO, SearchCountryField, TooltipLabel} from 'ngx-intl-tel-input';
import {WebSocketService} from '../../../services/socket.service';
import {environment} from '../../../environments/environment';

interface LocalStripeElement extends StripeElement {
  addEventListener?: (name: string, callback: Function) => void;
}

@Component({
  selector: 'checkout-refund',
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss'],
})

export class CheckoutRefund implements OnInit, AfterViewInit {
  @ViewChild('cardNumber') cardNumberRef: ElementRef;
  @ViewChild('cardExpiry') cardExpiryRef: ElementRef;
  @ViewChild('cardCvc') cardCvcRef: ElementRef;


  finalAmount = 0;
  paymentRequest;
  canPaymentRequest = false;
  applePaymentRequest = false;
  secretKeyStripe: any;
  paymentIntentId: any;
  separateDialCode = true;
  stripe;
  stripeMobile;
  customerPaymentAuth;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  btnDisabled = false;
  cart: any;
  disabledButton = false;
  storeInformation: any;
  checkoutProcess = 'Creating Order...';
  loading = false;
  customer: any;
  customerInformation: any;
  prepDay: any;
  prepTime: any = '';
  tipSelected: any = 0.00;
  tipSelectedIndex: any = 4;
  seats: any = [];
  tableNumber: any;
  customerMobile: any;
  seatsCount: number;
  order: any;
  orderComplete: any;
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
  stripeMerchant: any
  autoAcceptOrder = localStorage.getItem('autoAccept');
  pauseOrder = localStorage.getItem('pauseOrder');
  currentOrderType = parseInt(localStorage.getItem('orderType'), 10);
  elements: any;
  orderType: any = this.currentOrderType;
  serviceCharge: any;
  customTip = 0;
  paymentInfo: any;
  card: StripeElement;
  cardNumber: LocalStripeElement;
  cardCvc: StripeElement;
  cardExpiry: StripeElement;
  cardNumberMobile: LocalStripeElement;
  cardCvcMobile: StripeElement;
  cardExpiryMobile: StripeElement;
  stripeTest: FormGroup;
  notes = '';
  totalAmountRefund = 0;
  subTotalAmountRefund = 0;
  totalTaxesAmountRefund = 0;
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
  orderRefunded: any;
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
    store.pipe(select('cartShop'))
      .subscribe((data: any) => (this.cart = data.cart, this.storeInformation = data.storeInformation, this.customer = data.customer));
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.finalAmount = parseFloat(((this.orderRefunded.order.totalAmount
        + parseFloat(this.getTotalAmount().toFixed(2)) - this.totalAmountRefund)).toFixed(2))
        + this.orderRefunded.payment.paymentTipAmount;

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
          label: 'Checkout order',
          amount: parseFloat((this.finalAmount * 100).toFixed(2)),
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

      this.paymentRequest.on('paymentmethod', (ev) => {
        this.finalAmount = parseFloat((this.getTotalAmount() + parseFloat(this.tipSelected)));
        this.configService.paymentIntent({
          storeId: this.storeInformation.storeId,
          merchantId: this.storeInformation.merchantId,
          amount: this.finalAmount
        }).subscribe(({ data }: any) => {
          this.stripe
            .confirmCardPayment(data.secret, { payment_method: ev.paymentMethod.id }, { handleActions: false })
            .then((confirmResult) => {
              if (confirmResult.error) {
                ev.complete('fail');
                this.openSnackBar(confirmResult.error.code, 2);
                this.disabledButton = false;
                this.loading = !this.loading;
              } else {
                ev.complete('success');
                this.secretKeyStripe = confirmResult.paymentIntent.client_secret;
                this.paymentIntentId = confirmResult.paymentIntent.id;
                this.generateOrder(false);
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
      const elements = this.stripe.elements(this.elementsOptions);

      this.cardNumber = elements.create('cardNumber', { style, showIcon: true });
      this.cardNumber.mount(this.cardNumberRef.nativeElement);

      this.cardCvc = elements.create('cardCvc', { style, showIcon: true });
      this.cardCvc.mount(this.cardCvcRef.nativeElement);

      this.cardExpiry = elements.create('cardExpiry', { style, showIcon: true });
      this.cardExpiry.mount(this.cardExpiryRef.nativeElement);

      this.cardNumber.addEventListener('change', ({ error }) => {
        this.cardErrors = error && error.message;
      });

      this.stripeMobile = Stripe('pk_test_TTF68ceJV8AKZCuq3ho4vrjY00iIHqHUZO', {
        stripeAccount: environment.stripe_account
      });
      const elements2 = this.stripeMobile.elements(this.elementsOptions);

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
    }, 1000
    );
  }

  ngOnInit(): void {
    this.customer.length === 0
      ? this.customerInformation = this.newCustomerInformation
      : this.customerInformation = this.setCustomer(this.customer);
    this.getOrderRefund(localStorage.orderId);
    this.getOrderPaymentsInformation(this.storeInformation);
  }

  showPaymentRequest() {
    this.paymentRequest.show();
  }

  getAccountIntegrationId = () => {
    return this.storeInformation.integrations.find((integration) => {
      return integration.name === 'STRIPE';
    });
  }

  cleanCart = () => {
    localStorage.setItem('isRefundOrder', 'false');
    this.router.navigate(['receipt']);
  }

  select(value) {
    this.btnDisabled = true;
  }

  updateNotes(value) {
    this.notes = value;
  }

  goBack() {
    this.router.navigate(['home']);
  }

  setStoreCustomer = (currentCustomer) => {
    this.store.dispatch(new SetCustomer(currentCustomer));
  }

  openSnackBar = (message, status) => {
    this.snackBar.open(message, '', {
      duration: 3000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  getOrderPaymentsInformation = (storeInformation) => {
    this.configService.getOrderPayments(storeInformation.merchantId, storeInformation.storeId, localStorage.getItem('orderId'))
      .subscribe((data: any) => {
        this.paymentInfo = data.response[0];
      });
  }

  getOrderRefund = (orderId) => {
    this.configService.getOrderRefund(orderId)
      .subscribe((data: any) => {
        this.orderRefunded = data.response;
        this.totalTaxesAmountRefund = this.getTotalTaxesAmountRefund();
        this.totalAmountRefund = this.getTotalAmountRefund();
        this.subTotalAmountRefund = this.getSubTotalAmountRefund();
      });
  }

  refundCartDifference = () => {
    return this.getTotalAmount() - this.totalAmountRefund;
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

  getServeId = () => {
    return this.storeInformation.settings.filter((setting) => {
      return setting.settingName === 'OnlineStoreAssignedEmployee';
    });
  }

  getCustomerPhoto = () => {
    return this.customer.customerPhoto ? 'https://' + this.customer.customerPhoto : 'assets/IconsSVG/Account.svg';
  }

  getSubTotalAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.totalAmount * obj.quantity);
    }, 0);
  }

  getTotalTaxesAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.taxes * obj.quantity);
    }, 0);
  }

  getTotalTaxesAmountRefund = () => {
    return this.orderRefunded.removedProducts.reduce((acc, obj) => {
      return acc + obj.productTaxValue;
    }, 0);
  }

  selectTip = (tip, index) => {
    this.tipSelectedIndex = index;
    this.tipSelected = this.getSubTotalAmount() * tip;
  }

  getSubTotalAmountRefund = () => {
    return this.orderRefunded.removedProducts.reduce((acc, obj) => {
      return acc + obj.productTotal - obj.productTaxValue;
    }, 0);
  }

  getTotalAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return ((obj.totalAmount * obj.quantity) + acc);
    }, 0) + this.getTotalTaxesAmount();
  }

  getTotalAmountRefund = () => {
    return this.orderRefunded.removedProducts.reduce((acc, obj) => {
      return acc + obj.productTotal;
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
      productTaxValue: productSelected.taxes * productSelected.quantity, // cart
      productServiceChargeValue: 0,
      productOrderDiscountValue: 0,
      productDiscountValue: 0,
      productCalculatedPrice: productSelected.subTotalAmount * productSelected.quantity,
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
      productIngredients: productSelected.diselectedIngredients, // cart
      refundTransactionId: '',
      refundReason: null,
    };
  }

  getSeats = () => {
    this.cart.map((product => {
      return this.seats.push(this.setSeats(product));
    }));
    this.seatsCount = this.seats.length;
    this.seats.map((product) => {
      this.orderRefunded.order.seats[0].orderProducts.push(product);
    });
    this.orderRefunded.order.seats[0].orderProducts = this.orderRefunded.order.seats[0].orderProducts.filter((product) => {
      return product.productSellStatus !== 7;
    });
  }

  setOrder = (isMobile) => {
    return {
      _id: localStorage.orderId,
      actualPaidAmount: parseFloat((this.orderRefunded.order.actualPaidAmount
        + this.getTotalAmount() - this.totalAmountRefund).toFixed(2)),

      taxAmount:
        parseFloat((this.orderRefunded.order.taxAmount
          + parseFloat(this.getTotalTaxesAmount().toFixed(2)) - this.totalTaxesAmountRefund).toFixed(2)),

      subTotalAmount: parseFloat((this.orderRefunded.order.subTotalAmount
        + parseFloat(this.getSubTotalAmount().toFixed(2))
        - this.subTotalAmountRefund).toFixed(2)),

      totalAmount: parseFloat(((this.orderRefunded.order.totalAmount
        + parseFloat(this.getTotalAmount().toFixed(2)) - this.totalAmountRefund)).toFixed(2)),

      seats: [
        {
          seatName: this.orderRefunded.order.seats[0].seatName,
          seatNumber: this.orderRefunded.order.seats[0].seatNumber,
          customerId: this.orderRefunded.order.seats[0].customerId,
          customerName: this.orderRefunded.order.seats[0].customerName,
          orderProducts: this.orderRefunded.order.seats[0].orderProducts
        },
      ],
      storeId: this.storeInformation.storeId,
      onlineOrderServeStatus: 1,
      orderSellStatus: 4,
      merchantId: this.storeInformation.merchantId,
    };
  }

  generateOrder = (isUpdatePaymentIntent) => {
    this.checkoutProcess = 'Creating Order...';
    if (this.cart !== []) {
      this.seats.map((product) => {
        this.orderRefunded.order.seats[0].orderProducts.push(product);
      });
      this.getSeats();
      this.order = this.setOrder(false);
    }
    const params = {
      ...this.order,
    };

    this.configService.generateOrderDineIn(params).subscribe(
      (data: any) => {
        this.orderComplete = data.data;
        this.generatePayment(isUpdatePaymentIntent);
      }
    );
  }

  generatePayment = (isUpdatePaymentIntent) => {
    this.checkoutProcess = 'Generating Payment';
    const params = {
      amount: (this.orderRefunded.order.totalAmount * 100 + this.getTotalAmount() * 100 - this.totalAmountRefund * 100 + this.orderRefunded.payment.paymentTipAmount * 100) / 100,
      tipAmount: this.orderRefunded.payment.paymentTipAmount,
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      orderId: localStorage.getItem('orderId'),
      paymentIntentId: this.paymentIntentId,
      employeeId: findSetting(this.storeInformation, 'OnlineStoreAssignedEmployee'),
      card: isUpdatePaymentIntent === true ? this.customerPaymentAuth.card : null,
      paymentProcessor: localStorage.provider,
      updatePaymentIntent: isUpdatePaymentIntent
    };
    this.configService.generateCardconnectPayment(params).subscribe(
      (data: any) => {
        if (data.success === 1) {
          this.checkoutProcess = 'Payment successfully ';
          this.store.dispatch(new ClearCart([]));
          this.loading = !this.loading;
          localStorage.setItem('currentOrderCart', JSON.stringify(this.cart));
          this.cleanCart();
          this.openSnackBar('Order Updated', 1);
        } else {
          this.loading = false;
          this.openSnackBar(data.message, 2);
        }
      }
    );
  }

  placeOrder = async () => {
    this.disabledButton = true;
    this.loading = true;
    if (this.refundCartDifference() > 0) {
      this.loading = true;
      this.disabledButton = true;

      let response;

      if (window.innerWidth >= 992) {

        response = await this.stripe.createPaymentMethod({
          type: 'card',
          card: this.cardNumber,
          billing_details: {
            name: this.customer.customerFirstName + ' ' + this.customer.customerLastName,
          },
        });
      } else {

        response = await this.stripeMobile.createPaymentMethod({
          type: 'card',
          card: this.cardNumberMobile,
          billing_details: {
            name: this.customer.customerFirstName + ' ' + this.customer.customerLastName,
          },
        });
      }

      if (response.error && response.error.message) {
        this.openSnackBar(response.error.message, 1);
        this.loading = false;
        this.disabledButton = false;
        return;
      }

      const cancelVoidParams = {
        paymentId: this.paymentInfo.paymentId,
        storeId: this.storeInformation.storeId,
        merchantId: this.storeInformation.merchantId
      };

      this.configService.voidPayment(cancelVoidParams).then(() => {

        const params = {
          storeId: this.storeInformation.storeId,
          merchantId: this.storeInformation.merchantId,
          amount: (this.orderRefunded.order.totalAmount * 100 + this.getTotalAmount() * 100 - this.totalAmountRefund * 100 + this.orderRefunded.payment.paymentTipAmount * 100) / 100,
          paymentProcessor: 'STRIPE',
          customerName: this.customerInformation.customerFirstName + ' ' + this.customerInformation.customerLastName,
          customerAddress: this.customerInformation.customerAdresses.customerAddress1,
          customerPostal: this.customerInformation.customerAdresses.customerZip,
          paymentMethodId: response.paymentMethod.id,
        };

        this.configService.paymentAuth(params).subscribe((responsePaymentIntent: any) => {
          if (responsePaymentIntent.success === 1) {
            this.customerPaymentAuth = responsePaymentIntent.data;
            this.secretKeyStripe = responsePaymentIntent.data.secret;
            this.paymentIntentId = responsePaymentIntent.data.paymentMethodId;

            this.stripeMerchant.confirmCardPayment(
              this.secretKeyStripe,
              {
                payment_method: responsePaymentIntent.data.paymentMethodId,
              })
              .then((result) => {
                try {
                  if (result.paymentIntent.id) {
                    this.generateOrder(true);
                  }
                } catch (e) {
                  this.openSnackBar(result.error.code, 2);
                  this.loading = !this.loading;
                }
              });
          } else {
            this.openSnackBar(responsePaymentIntent.message, 2);
            this.loading = !this.loading;
          }
        });
      });
    } else {
      this.loading = false;
      this.generateOrder(false);
    }
  }
}
