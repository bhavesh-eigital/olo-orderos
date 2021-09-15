import {AfterViewChecked, AfterViewInit, Component, OnChanges, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {select, Store} from '@ngrx/store';
import {Router} from '@angular/router';
import ObjectID from 'bson-objectid';
import {findSetting} from '../../../../utils/FindSetting';
import {ConfigService} from '../../../../services/config.service';
import {AddPlacedOrder, ClearCart, SetCustomer, SetPlacedOrder} from '../../../../store/actions';
import {Element as StripeElement} from 'ngx-stripe/lib/interfaces/element';
import {ElementsOptions, StripeService} from 'ngx-stripe';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';
import {CountryISO, SearchCountryField, TooltipLabel} from 'ngx-intl-tel-input';
import orderBy from 'lodash.orderby';
import * as LocalizedFormat from 'dayjs/plugin/localizedFormat';
import * as moment from 'dayjs';
moment.extend(LocalizedFormat)

interface LocalStripeElement extends StripeElement {
  // tslint:disable-next-line:ban-types
  addEventListener?: (name: string, callback: Function) => void;
}

@Component({
  selector: 'checkout-dineIn',
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss'],
})

export class CheckoutGuestDineInStripe implements OnInit, AfterViewInit, OnChanges, AfterViewChecked {
  finalAmount = 0;
  paymentRequest;
  canPaymentRequest = false;
  applePaymentRequest = false;
  secretKeyStripe: any;
  paymentIntentId: any;
  stripeMobile;
  stripe;
  placeOrder = true;
  placedOrders: any;
  totals: any;
  onlineStorePrepTime: any;
  enablePay = false;
  currency = localStorage.getItem('currency');
  orderGuest: any;
  notes: '';
  separateDialCode = true;
  disabledButton = false;
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
  prepDay: any = '';
  prepTime: any = '';
  tipSelected: any = 0.00;
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
  autoAcceptOrder = localStorage.getItem('autoAcceptDineIn');
  pauseOrder = localStorage.getItem('pauseOrder');
  currentOrderType = parseInt(localStorage.getItem('orderType'), 10);
  elements: any;
  orderType: any = this.currentOrderType;
  serviceCharge: any;
  customTip = 0.00;
  deliveryFee = 0.00;
  card: StripeElement;
  cardNumber: LocalStripeElement;
  cardCvc: StripeElement;
  cardExpiry: StripeElement;
  cardNumberMobile: LocalStripeElement;
  cardCvcMobile: StripeElement;
  cardExpiryMobile: StripeElement;
  stripeTest: FormGroup;
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
  responseFormCard: any;
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

  currentTime = moment().unix();
  daySelected: any;
  openHourRestaurant = localStorage.getItem('openRestaurantHours');
  closeHourRestaurant = localStorage.getItem('closeRestaurantHours');
  isPaymentFail = false;

  customerPaymentAuth;

  constructor(
    private router: Router,
    private configService: ConfigService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private stripeService: StripeService,
    private store: Store<{ storeInformation: []; cart: []; customer: []; placedOrders: [] }>,
  ) {
    // @ts-ignore
    store.pipe(select('cartShop'))
      .subscribe((data: any) => (
        this.cart = data.cart,
          this.placedOrders = data.placedOrders,
          this.storeInformation = data.storeInformation,
          this.customer = data.customer));
    this.customerMobile = this.customer.customerMobile;
    this.orderGuest = findSetting(this.storeInformation, 'OnlineStoreAllowOrderAsGuest');
    this.onlineStorePrepTime = parseInt(findSetting(this.storeInformation, 'OnlineStorePrepTime'), 10);
  }

  ngOnChanges(): void {
  }

  ngAfterViewInit(): void {
    this.tableNumber = localStorage.getItem('tableNumber') === null ? false : localStorage.getItem('tableNumber');
  }

  ngAfterViewChecked(): void {
    if (this.tipSelectedIndex === 0) {
      this.tipSelected = parseFloat((Math.round((this.getSubTotalAmount() * 0.10 * 100)) / 100).toFixed(2));
      this.customTip = 0;
    }
    if (this.tipSelectedIndex === 1) {
      this.tipSelected = parseFloat((Math.round((this.getSubTotalAmount() * 0.15 * 100)) / 100).toFixed(2));
      this.customTip = 0;
    }

    if (this.tipSelectedIndex === 2) {
      this.tipSelected = parseFloat((Math.round((this.getSubTotalAmount() * 0.18 * 100)) / 100).toFixed(2));
      this.customTip = 0;
    }
    if (this.tipSelectedIndex === 3) {
      this.tipSelected = parseFloat((Math.round((this.getSubTotalAmount() * 0.20 * 100)) / 100).toFixed(2));
      this.customTip = 0;
    }
    if (this.tipSelectedIndex === 4) {
      this.tipSelected = parseFloat((Math.round((this.getSubTotalAmount() * 0.25 * 100)) / 100).toFixed(2));
      this.customTip = 0;
    }
    if (this.customTip !== 0 && this.tipSelectedIndex === 5) {
      this.tipSelected = this.customTip;
    }
  }

  ngOnInit(): void {
    this.calculateTotalQuantity();
    this.customer.length === 0
      ? this.customerInformation = this.newCustomerInformation
      : this.customerInformation = this.setCustomer(this.customer);
    this.deliveryFee = findSetting(this.storeInformation, 'OnlineStoreDeliveryFee') === 'false'
      ? 0
      : parseFloat(findSetting(this.storeInformation, 'OnlineStoreDeliveryFee'));

    if (this.currentOrderType !== 1) {
      this.deliveryFee = 0;
    } else {
      this.deliveryFee = this.deliveryFee === null || '' ? 0 : parseFloat(String(this.deliveryFee));
    }
    this.totals = this.getTotalPlacedOrders();
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

  showPaymentRequest() {

    if (this.tipSelectedIndex === 0) {
      this.tipSelected = parseFloat((Math.round((this.getSubTotalAmount() * 0.10 * 100)) / 100).toFixed(2));
      this.customTip = 0;
    }
    if (this.tipSelectedIndex === 1) {
      this.tipSelected = parseFloat((Math.round((this.getSubTotalAmount() * 0.15 * 100)) / 100).toFixed(2));
      this.customTip = 0;
    }

    if (this.tipSelectedIndex === 2) {
      this.tipSelected = parseFloat((Math.round((this.getSubTotalAmount() * 0.18 * 100)) / 100).toFixed(2));
      this.customTip = 0;
    }
    if (this.tipSelectedIndex === 3) {
      this.tipSelected = parseFloat((Math.round((this.getSubTotalAmount() * 0.20 * 100)) / 100).toFixed(2));
      this.customTip = 0;
    }
    if (this.tipSelectedIndex === 4) {
      this.tipSelected = parseFloat((Math.round((this.getSubTotalAmount() * 0.25 * 100)) / 100).toFixed(2));
      this.customTip = 0;
    }
    if (this.customTip !== 0 && this.tipSelectedIndex === 5) {
      this.tipSelected = this.customTip;
    }
    this.finalAmount = parseFloat((this.totals.finalTotalAmount).toFixed(2));
    this.updatePaymentRequest('checkout', this.finalAmount * 100);
    this.paymentRequest.show();
  }


  calculateTotalsProductChanges = () => {
    this.totals = this.getTotalPlacedOrders();
    if (this.cart.length === 0 && this.placedOrders.length === 0) {
      this.router.navigate(['home']);
    }
  }

  getDeliveryFee = (delivery) => {
    return parseFloat(delivery).toFixed(2);
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

  goBack() {
    this.router.navigate(['home']);
  }

  selectTip = (tip, index) => {
    this.tipSelectedIndex = index;
    if (this.customTip !== 0 && this.tipSelectedIndex === 5) {
      this.tipSelected = parseFloat(this.customTip.toFixed(2));
    } else {
      this.customTip = 0;
      this.tipSelected = Math.round((this.totals.finalSubTotalAmount * tip) * 100) / 100;
    }
    this.totals = this.getTotalPlacedOrders();
  }

  getServeId = () => {
    return this.storeInformation.settings.filter((setting) => {
      return setting.settingName === 'OnlineStoreAssignedEmployee';
    });
  }

  getSubTotalAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.totalAmount * obj.quantity);
    }, 0);
  }

  getTotalAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.totalAmount * obj.quantity);
    }, 0) + this.getTaxes() + parseFloat(String(this.deliveryFee));
  }

  getTaxes = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.taxes * obj.quantity);
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
        saleCategoryName: '',
        saleCategoryOrder: 0,
        saleCategoryId: '',
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
      productModifiers: this.getModifiers(productSelected), // car
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
  }

  setOrder = () => {
    return {
      orderServiceCharge: {
        authorizerId: '',
        serviceChargeName: '',
        serviceChargeValue: 0,
        serviceChargeType: 0,
        serviceChargeId: '',
        applicableTaxIds: [],
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
      orderName: `QR Table ${localStorage.tableNumber}`,
      customerId: this.customer.customerId,
      customerName: this.customerInformation.customerFirstName + this.customerInformation.customerLastName,
      customerFirstName: this.customerInformation.customerFirstName,
      customerLastName: this.customerInformation.customerLastName,
      customerMobile: this.customerMobile.e164Number,
      customerEmail: this.customerInformation.customerEmail,
      orderNumberSuffix: '',
      tableId: localStorage.tableId,
      serverId: findSetting(this.storeInformation, 'OnlineStoreAssignedEmployee'),
      serverJobType: '',
      orderSellStatus: 2,
      orderServeStatus: 1,
      onlineOrderType: 4,
      orderType: 8,
      onlineOrderServeStatus: this.autoAcceptOrder === 'true' ? 2 : 1,
      serviceName: 'others',
      serviceId: '',
      shiftId: '',
      shiftName: '',
      serviceType: 1,
      timeOfArrival: Math.round(new Date().getTime() / 1000),
      notes: this.notes,
      paymentId: '',
      subTotalAmount: this.getSubTotalAmount(),
      refundedAmount: 0,
      // actualPaidAmount: this.getTotalAmount(),
      actualPaidAmount: 0,
      totalAmount: this.getTotalAmount(),
      taxAmount: this.getTaxes(),
      // serviceChargeAmount: this.serviceCharge === 0 ? 0 : this.serviceCharge.serviceChargeValue,
      serviceChargeAmount: 0,
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
      readyTime: this.autoAcceptOrder === 'true' ? this.onlineStorePrepTime * 60 : 0,
      prepareStartAt: this.autoAcceptOrder === 'true' ? Math.round(new Date().getTime() / 1000) : 0,
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
    this.router.navigate(['home']);
  }

  setStoreCustomer(currentCustomer) {
    this.store.dispatch(new SetCustomer(currentCustomer));
  }

  addPlacedOrders(newOrder) {
    this.store.dispatch(new AddPlacedOrder(newOrder));
  }

  setPlacedOrders(newOrder) {
    this.store.dispatch(new SetPlacedOrder(newOrder));
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 3000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  buyMobile() {
    this.loading = true;
    const name = this.stripeTest.get('name').value;
    this.stripeService
      .createToken(this.cardNumberMobile, {name})
      .subscribe((result) => {
        if (result.token) {
          this.payPlacedOrders();
        } else if (result.error) {
          this.openSnackBar(result.error.message, 2);
          this.loading = false;
          this.disabledButton = false;
        }
      });
  }

  generatePayment = (token) => {
    this.checkoutProcess = 'Generating Payment';
    localStorage.setItem('finalAmount', this.totals.finalTotalAmount.toFixed(2));
    const params = {
      tokenId: token.id,
      amount: parseFloat((this.getTotalAmount() + this.tipSelected).toFixed(2)),
      tipAmount: this.tipSelected,
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      orderId: localStorage.getItem('orderId'),
      employeeId: findSetting(this.storeInformation, 'OnlineStoreAssignedEmployee'),
    };
    this.configService.generatePayment(params).subscribe(
      (data: any) => {
        if (data.success === 1) {
          this.checkoutProcess = 'Payment successfully ';
          this.loading = !this.loading;
          this.store.dispatch(new ClearCart([]));
          localStorage.setItem('currentOrderCart', JSON.stringify(this.cart));
          this.cleanCart();
        }
      }
    );
  }

  generateOrder = (token) => {
    this.checkoutProcess = 'Creating Order...';
    this.loading = !this.loading;
    setTimeout(() => {
      if (this.cart !== []) {
        this.order = this.setOrder();
        this.getSeats();
      }
      const params = {
        ...this.order,
      };

      this.configService.generateOrder(params).subscribe(
        (data: any) => {
          this.orderComplete = data.data;
          localStorage.setItem('orderId', this.orderComplete._id);
          this.generatePayment(token);
        }
      );
    }, 3000);
  }

  generateOrderMobile = (isPay) => {
    this.loading = true;
    this.checkoutProcess = 'Creating Order...';

    setTimeout(() => {
      if (this.cart !== []) {
        this.order = this.setOrder();
        this.getSeats();
      }
      const params = {
        ...this.order,
      };

      this.configService.generateOrderDineIn(params).subscribe(
        (data: any) => {
          this.orderComplete = data.data;
          localStorage.setItem('orderId', this.orderComplete._id);
          this.addPlacedOrders(data.data);
          if (isPay === true) {
            this.getSecretKey();
            this.setOrderIdInTable(this.orderComplete._id);
          } else {
            this.store.dispatch(new ClearCart([]));
            this.setOrderIdInTable(this.orderComplete._id);
            this.openSnackBar('Order created!', 1);
            this.cleanCart();
            this.loading = !this.loading;
          }
        }
      );
    }, 1000);
  }

  generateOrderManualMethod = (isPay) => {
    this.loading = true;
    this.checkoutProcess = 'Creating Order...';
    if (this.cart !== []) {
      this.order = this.setOrder();
      this.getSeats();
    }
    const params = {
      ...this.order,
    };

    this.configService.generateOrderDineIn(params).subscribe(
      (data: any) => {
        this.orderComplete = data.data;
        localStorage.setItem('orderId', this.orderComplete._id);
        this.addPlacedOrders(data.data);
        if (isPay === true) {
          this.payPlacedOrders();
        } else {
          this.store.dispatch(new ClearCart([]));
          this.openSnackBar('Order created!', 1);
          this.cleanCart();
          this.loading = !this.loading;
        }
      }
    );
  }


  select(value) {
    this.btnDisabled = true;
  }

  setAsap() {
    this.btnDisabled = false;
    this.prepTime = '';
    this.prepDay = '';
  }

  getTotalPlacedOrders = () => {
    const placedOrdersTotalAmount = this.placedOrders.reduce((acc, obj) => {
      return acc + (obj.totalAmount);
    }, 0);

    const placedOrdersSubTotalAmount = this.placedOrders.reduce((acc, obj) => {
      return acc + (obj.subTotalAmount);
    }, 0);

    const placedOrdersTaxes = this.placedOrders.reduce((acc, obj) => {
      return acc + (obj.taxAmount);
    }, 0);
    const currentCartSubtotalAmount = this.getSubTotalAmount();
    const currentCartTax = this.getTaxes();
    const currentCartTotalAmountCart = this.getTotalAmount();
    const currentCartQuantity = this.cart.length;

    return {
      placedOrdersTotalAmount,
      placedOrdersSubTotalAmount,
      placedOrdersTaxes,
      currentCartSubtotalAmount,
      currentCartTax,
      currentCartTotalAmountCart,
      finalQuantity: currentCartQuantity,
      finalTax: placedOrdersTaxes + currentCartTax,
      finalSubTotalAmount: placedOrdersSubTotalAmount + currentCartSubtotalAmount,
      tipSelected: this.tipSelected,
      finalTotalAmount: placedOrdersTotalAmount + Math.round(currentCartTotalAmountCart * 100) / 100 + this.tipSelected,
    };
  }

  getOrderForPayments = () => {
    const ordersArray = [];
    this.placedOrders.map((order, index) => {
      ordersArray.push({
        orderId: order._id,
        amount: order.totalAmount + (this.placedOrders.length === index + 1 ? this.tipSelected : 0),
        tipAmount: this.placedOrders.length === index + 1 ? this.tipSelected : 0
      });
    });
    return ordersArray;
  }

  payPlacedOrders = () => {
    this.checkoutProcess = 'paying order...';

    const params = {
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      orders: this.getOrderForPayments(),
      employeeId: findSetting(this.storeInformation, 'OnlineStoreAssignedEmployee'),
      paymentIntentId: this.customerPaymentAuth.paymentIntentId,
      card: this.customerPaymentAuth.card
    };

    this.configService.generateCardconnectPayments(params).subscribe((data: any) => {
      if (data.success === 1) {
        localStorage.setItem('ordersPayments', JSON.stringify(this.getOrderForPayments()));
        this.setPlacedOrders([]);
        this.store.dispatch(new ClearCart([]));
        this.checkoutProcess = 'Payment successfully';
        this.loading = false;
        this.isPaymentFail = false;
        localStorage.removeItem('tableNumber');
        localStorage.orderType = 1;
        this.router.navigate(['receipt/restaurant']);
      } else {
        this.store.dispatch(new ClearCart([]));
        this.openSnackBar(data.message, 2);
        this.loading = false;
        this.disabledButton = false;
        this.isPaymentFail = true;
      }
    });
  }

  getAccountIntegrationId = () => {
    return this.storeInformation.integrations.find((integration) => {
      return integration.name === 'STRIPE';
    });
  }

  payOrders = () => {
    if (this.enablePay === false) {
      this.enablePay = true;
    } else {
      this.loading = true;
      this.disabledButton = true;
      if (this.responseFormCard.errorCode === '0') {
        if (this.cart.length > 0) {
          this.generateOrderMobile(true);
        } else {
          this.getSecretKey();
        }
      } else {
        this.loading = !this.loading;
        this.openSnackBar(this.responseFormCard.errorMessage, 2);
      }
    }
  }

  orderByDate = (cart) => {
    return orderBy(cart, 'createAt');
  }

  selectCustomTips() {
    this.tipSelected = this.customTip;
    this.totals = this.getTotalPlacedOrders();
  }

  updateNotes(value) {
    this.notes = value;
  }

  calculateTotalQuantity = () => {
    const orderInformations = this.placedOrders.flatMap((order) => {
        return order.seats[0].orderProducts;
      }
    );
    const totalCart = this.cart.reduce((acc, obj) => {
      return acc + obj.quantity;
    }, 0);
    const totalPlaced = orderInformations.reduce((acc, obj) => {
      return acc + obj.productQuantity;
    }, 0);

    return totalCart + totalPlaced;
  }

  calculateTotalPrice = () => {
    const totalAmountCart = this.cart.reduce((acc, obj) => {
      return acc + (obj.totalAmount * obj.quantity);
    }, 0) + this.getTaxes();

    const totalAmountPlaced = this.placedOrders.reduce((acc, obj) => {
      return acc + obj.actualPaidAmount;
    }, 0);
    this.totals = this.getTotalPlacedOrders();
    return totalAmountCart + totalAmountPlaced;
  }

  getSecretKey = () => {
    const amount = parseFloat(this.totals.finalTotalAmount.toFixed(2));
    const params = {
      amount,
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      token: this.responseFormCard.token,
      expiry: this.responseFormCard.expiry
    };
    this.configService.paymentAuth(params).subscribe((response: any) => {
      if (response.success === 1) {
        try {
          this.customerPaymentAuth = response.data;
          this.payPlacedOrders();
        } catch (e) {
          this.store.dispatch(new ClearCart([]));
          // this.openSnackBar(result.error.code, 2);
          this.disabledButton = false;
          this.loading = !this.loading;
        }
      } else {
        this.openSnackBar(response.message, 2);
        this.loading = false;
        this.disabledButton = false;
      }
    });
  }

  setOrderIdInTable(orderId) {
    const params = {
      tableNumber: localStorage.tableNumber,
      storeId: this.storeInformation.storeId,
      orderId
    };
    this.configService.setOrderInTable(params)
      .subscribe((data: any) => {
        // console.log(data);
        if (data.success === 0) {
          this.openSnackBar(data.message, 2);
        }
      });
  }

  getToken(formData: any) {
    this.responseFormCard = formData;
  }
}
