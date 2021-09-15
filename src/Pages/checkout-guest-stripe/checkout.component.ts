import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { ConfigService } from '../../services/config.service';
import { findSetting } from '../../utils/FindSetting';
import { CountryISO, SearchCountryField, TooltipLabel } from 'ngx-intl-tel-input';
import {
  AddPlacedOrder,
  ClearCart,
  SetPlacedOrder,
  SetTemporalCustomer,
  SetTemporalCustomerPhoneDetails
} from '../../store/actions';
import ObjectID from 'bson-objectid';
import { NgForm, NgModel } from '@angular/forms';
import { map } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { UIService } from 'src/services/ui.service';
import { ElementsOptions, StripeService } from "ngx-stripe";
import { environment } from "../../environments/environment";
import { cardExpiryAndCvcStyle, cardNumberStyle } from "../ReportIssue/Checkout-Refund/payments.style";
import { Element as StripeElement } from "ngx-stripe/lib/interfaces/element";

interface LocalStripeElement extends StripeElement {
  addEventListener?: (name: string, callback: Function) => void;
}


@Component({
  selector: 'app-checkout-stripe',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutGuestStripeComponent implements AfterViewInit, OnInit {
  @ViewChild('cardNumber') cardNumberRef: ElementRef;
  @ViewChild('cardExpiry') cardExpiryRef: ElementRef;
  @ViewChild('cardCvc') cardCvcRef: ElementRef;

  show = false;
  remember = false;
  tipSelected = 0;
  tableNumber = localStorage.tableNumber ? localStorage.tableNumber : 0;
  customerName = 'Guest';
  cart: any;
  placedOrders: any;
  storeInformation: any;
  customer: any;
  responseFormCard: any;
  totals: any;

  customAmount = 0;
  customerPaymentAuth;
  tipSelectedValue = 0;

  products = [];
  customerOrders = [];
  successfull = false;
  orderInfo = {};
  order: any;
  seats: any = [];
  prepTime: any = '';
  seatsCount: number;
  orderComplete: any;
  autoAcceptOrder = localStorage.getItem('autoAcceptDineIn');
  onlineStorePrepTime: any;
  customerMobile: any;
  customerInformation: any;
  newCustomerInformation: any = {
    customerEmail: '',
    customerFirstName: '',
    customerLastName: '',
    customerMobile: {},
    customerAdresses: {
      customerAddress1: '',
      customerAddress2: '',
      customerCity: '',
      customerCountry: '',
      customerState: '',
      customerZip: ''
    }
  };


  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];

  allowUsertoOrderwithoutPaying: string;

  loading = false;

  isFormValid = false;
  passwordShown = false;
  password = '';
  passwordIsValid = false;
  allowGratuity: string;

  stripe;
  card: StripeElement;
  cardNumber: LocalStripeElement;
  cardCvc: StripeElement;
  cardExpiry: StripeElement;
  cardErrors;

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  secretKeyStripe: any;
  paymentIntentId: any;
  stripeMerchant;
  elementsOptions: ElementsOptions = {
    locale: 'en',
    fonts: [
      {
        cssSrc:
          'https://fonts.googleapis.com/css?family=Montserrat:300,300i,400,500,600',
      },
    ],
  };
  currency = localStorage.getItem('currency');
  customTip: any = '';

  @ViewChild('customTipInput') customTipInput: ElementRef<HTMLElement>;
  @ViewChild('userInformationForm') userInformationForm: NgForm;
  @ViewChild('userPassword') userPassword: NgModel;
  private deliveryFee = 0;

  constructor(
    private router: Router,
    private store: Store,
    private configService: ConfigService,
    private renderer: Renderer2,
    private snackBar: MatSnackBar,
    private stripeService: StripeService,
    private uiService: UIService
  ) {
    // @ts-ignore
    store.pipe(select('cartShop'))
      .subscribe((data: any) => {
        this.cart = data.cart;
        this.placedOrders = data.placedOrders;
        this.storeInformation = data.storeInformation;
        this.customer = data.customer;
        this.onlineStorePrepTime = parseInt(findSetting(this.storeInformation, 'OnlineStorePrepTime'), 10);

        this.newCustomerInformation.customerFirstName = data.temporalCustomer.customerFirstName || '';
        this.newCustomerInformation.customerLastName = data.temporalCustomer.customerLastName || '';
        this.newCustomerInformation.customerEmail = data.temporalCustomer.customerEmail || '';

        this.getPhoneNumber(data.temporalCustomer);

        this.allowGratuity = findSetting(this.storeInformation, 'OnlineStoreAllowGratuity');
      });
    this.allowUsertoOrderwithoutPaying = localStorage.OnlineStoreAllowOrderWithoutPaying;
  }

  getPhoneNumber(temporalCustomer) {
    this.newCustomerInformation.customerMobile.countryCode = temporalCustomer.customerISOCode || '';
    this.newCustomerInformation.customerMobile.dialCode = temporalCustomer.customerPhoneCode || '';
    this.newCustomerInformation.customerMobile.e164Number = temporalCustomer.customerMobile || '';
    this.newCustomerInformation.customerMobile.number = temporalCustomer.customerMobile;
  }

  ngOnInit(): void {
    this.stripe = Stripe('pk_test_TTF68ceJV8AKZCuq3ho4vrjY00iIHqHUZO', {
      stripeAccount: environment.stripe_account
    });

    this.stripeMerchant = Stripe('pk_test_TTF68ceJV8AKZCuq3ho4vrjY00iIHqHUZO', {
      stripeAccount: this.getAccountIntegrationId().accountId
    });

    this.totals = this.getTotalPlacedOrders();
    if (!this.allowGratuity || this.allowGratuity === 'false') {
      this.selectTip = null;
      this.tipSelectedValue = 0.00;
    } else {
      this.selectTip(0);
    }

    this.getProducts();
    this.customer.length === 0
      ? this.customerInformation = this.newCustomerInformation
      : this.customerInformation = this.setCustomer(this.customer);


    const elements = this.stripe.elements(this.elementsOptions);

    setTimeout(() => {
      this.cardNumber = elements.create('cardNumber', { style: cardNumberStyle, showIcon: true });
      this.cardNumber.mount(this.cardNumberRef.nativeElement);

      this.cardCvc = elements.create('cardCvc', { style: cardExpiryAndCvcStyle, showIcon: true });
      this.cardCvc.mount(this.cardCvcRef.nativeElement);

      this.cardExpiry = elements.create('cardExpiry', { style: cardExpiryAndCvcStyle, showIcon: true });
      this.cardExpiry.mount(this.cardExpiryRef.nativeElement);

      this.cardNumber.addEventListener('change', ({ error }) => {
        this.cardErrors = error && error.message;
      });
    }, 2000);

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

  getAccountIntegrationId = () => {
    return this.storeInformation.integrations.find((integration) => {
      return integration.name === 'STRIPE';
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.uiService.materialInputEventListener(), 200);

    this.userInformationForm.statusChanges.subscribe(status => {
      if (status === 'VALID') {
        this.isFormValid = true;
      } else {
        this.isFormValid = false;
      }
    });
  }

  getProducts() {
    if (this.placedOrders.length !== 0) {
      this.products = this.placedOrders.flatMap((order: any) => order.seats[0].orderProducts);
    } else {
      this.products = this.cart.map((product) => {
        return {
          productQuantity: product.quantity,
          productName: product.productName,
          description: '',
          productPrice: product.subTotalAmount
        };
      });
    }
  }

  setOrderInfo() {
    this.orderInfo = {
      subTotalAmount: this.totals.finalSubTotalAmount,
      taxAmount: this.totals.finalTax,
      tipAmount: this.tipSelectedValue,
      totalAmount: this.totals.finalTotalAmount
    };
  }

  onSuccess() {
    this.setOrderInfo();
    this.successfull = true;
    this.loading = false;
  }

  getSubTotalAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.totalAmount * obj.quantity);
    }, 0);
  }

  getTotalAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.totalAmount * obj.quantity);
    }, 0) + this.getTaxes();
  }

  getTaxes = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.taxes * obj.quantity);
    }, 0);
  }

  getTotalPlacedOrders = () => {
    const placedOrdersTotalAmount = this.placedOrders.reduce((acc, obj: any) => {
      return acc + (obj.totalAmount);
    }, 0);

    const placedOrdersSubTotalAmount = this.placedOrders.reduce((acc, obj: any) => {
      return acc + (obj.subTotalAmount);
    }, 0);

    const placedOrdersTaxes = this.placedOrders.reduce((acc, obj: any) => {
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
      finalTotalAmount: placedOrdersTotalAmount + Math.round(currentCartTotalAmountCart * 100) / 100 + this.tipSelectedValue,
    };
  }


  getToken(formData: any) {
    this.responseFormCard = formData;
  }

  setPlacedOrders(newOrder) {
    this.store.dispatch(new SetPlacedOrder(newOrder));
  }

  getOrderForPayments = () => {
    const ordersArray = [];
    this.placedOrders.map((order: any, index) => {
      ordersArray.push({
        orderId: order._id,
        amount: order.totalAmount + (this.placedOrders.length === index + 1 ? this.tipSelectedValue : 0),
        tipAmount: this.placedOrders.length === index + 1 ? this.tipSelectedValue : 0
      });
    });
    return ordersArray;
  }

  payPlacedOrders = () => {
    const params = {
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      orders: this.getOrderForPayments(),
      employeeId: findSetting(this.storeInformation, 'OnlineStoreAssignedEmployee'),
      paymentIntentId: this.customerPaymentAuth.id,
      card: this.customerPaymentAuth.card,
      paymentProcessor: localStorage.provider
    };

    this.configService.generateCardconnectPayments(params).subscribe((data: any) => {
      if (data.success === 1) {
        localStorage.setItem('ordersPayments', JSON.stringify(this.getOrderForPayments()));
        this.setPlacedOrders([]);
        this.store.dispatch(new ClearCart([]));
        localStorage.removeItem('tableNumber');
        localStorage.orderType = 1;
        this.sendReceipt();
        this.sendReceiptMobile();
        this.onSuccess();
      } else {
        this.loading = false;
        this.store.dispatch(new ClearCart([]));
      }
    });
  }

  getServeId = () => {
    return this.storeInformation.settings.filter((setting) => {
      return setting.settingName === 'OnlineStoreAssignedEmployee';
    });
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
      customerMobile: this.customerInformation.customerMobile.e164Number
        ? this.customerInformation.customerMobile.e164Number
        : this.customerInformation.customerMobile,
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
      notes: '',
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
          // this.openSnackBar(data.message, 2);
        }
      });
  }

  addPlacedOrders(newOrder) {
    this.store.dispatch(new AddPlacedOrder(newOrder));
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 3000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  generateOrderMobile = (isPay, response) => {
    // Create Temporal Customer
    if (!localStorage.OnlineStoreAllowOrderWithoutPaying || localStorage.OnlineStoreAllowOrderWithoutPaying === 'false') {
      this.setTemporalCustomer();
    }
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
            this.getSecretKey(response);
            this.setOrderIdInTable(this.orderComplete._id);
          } else {
            this.store.dispatch(new ClearCart([]));
            this.setOrderIdInTable(this.orderComplete._id);
          }
        }
      );
    }, 1000);
  }

  getSecretKey = (response) => {
    const amount = parseFloat(this.totals.finalTotalAmount.toFixed(2)) + this.tipSelectedValue || 0;
    try {
      this.loading = true;
      this.configService.paymentAuth({
        amount,
        storeId: this.storeInformation.storeId,
        merchantId: this.storeInformation.merchantId,
        paymentProcessor: 'STRIPE',
        paymentMethodId: response.paymentMethod.id,
      }).subscribe((data: any) => {
        if (data.success === 1) {
          this.secretKeyStripe = data.data.secret;
          this.paymentIntentId = data.data.id;
          this.customerPaymentAuth = data.data;
          this.stripeMerchant.confirmCardPayment(
            this.secretKeyStripe,
            {
              payment_method: data.data.paymentMethodId,
            })
            .then((result) => {
              try {
                if (result.paymentIntent.id) {
                  this.payPlacedOrders();
                }
              } catch (e) {
                console.log(e);
                this.openSnackBar(result.error.code, 2);
                this.loading = !this.loading;
              }
            });
        } else {
          console.log('error');
        }
      });
    } catch (e) {
      // this.openSnackBar('Please verify all credit cart fields', 2);
      this.loading = false;
      console.log(e);
    }
  }

  selectTip = (tipSelected) => {
    this.tipSelected = tipSelected;
    switch (tipSelected) {
      case 0:
        this.tipSelectedValue = parseFloat((this.totals.finalSubTotalAmount * 0.10).toFixed(2));
        this.customTip = '';
        break;
      case 1:
        this.tipSelectedValue = parseFloat((this.totals.finalSubTotalAmount * 0.15).toFixed(2));
        this.customTip = '';
        break;
      case 2:
        this.tipSelectedValue = parseFloat((this.totals.finalSubTotalAmount * 0.18).toFixed(2));
        this.customTip = '';
        break;
      case 3:
        this.tipSelectedValue = parseFloat((this.totals.finalSubTotalAmount * 0.20).toFixed(2));
        this.customTip = '';
        break;
      case 4:
        // this.tipSelectedValue = 0;
        this.customTipInput.nativeElement.focus();
        this.tipSelectedValue = 0;
        break;
    }
  }

  payOrders = async () => {

    const response = await this.stripe.createPaymentMethod({
      type: 'card',
      card: this.cardNumber,
    });
    if (response.paymentMethod) {
      this.loading = true;
      if (this.cart.length > 0) {
        this.generateOrderMobile(true, response);
      } else {
        this.getSecretKey(response);
      }
    } else {
      console.log('error');
      // console.log(this.responseFormCard, 2);
    }
  }

  setPhoneNumber(ev) {
    if (!ev) {
      return;
    }
    this.customerInformation.customerMobile = ev;
  }

  setTemporalCustomer() {
    const params = {
      customerFirstName: this.customerInformation.customerFirstName,
      customerLastName: this.customerInformation.customerLastName,
      customerEmail: this.customerInformation.customerEmail,
      customerMobile: this.newCustomerInformation.customerMobile.e164Number,
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      customerAdresses: [
        {
          customerAddress1: '',
          customerAddress2: '',
          customerCity: '',
          customerState: '',
          customerCountry: '',
          customerZip: ''
        }
      ]
    };
    const payload = {
      customerPhoneCode: this.newCustomerInformation.customerMobile.dialCode,
      customerMobile: this.newCustomerInformation.customerMobile.e164Number,
      customerISOCode: this.newCustomerInformation.customerMobile.countryCode,
    };

    this.configService.dineInTemporalSignup(params).subscribe(
      (data: any) => {
        if (data.success === 1) {
          this.store.dispatch(new SetTemporalCustomer(data.response));
          this.store.dispatch(new SetTemporalCustomerPhoneDetails(payload));
        }
      },
      (error) => console.log(error)
    );
  }

  onCheckClicked() {
    this.remember = !this.remember;
    if (this.remember) {
      setTimeout(() => this.userPassword.statusChanges.pipe(
        map(status => {
          if (status === 'VALID') {
            this.passwordIsValid = true;
          } else {
            this.passwordIsValid = false;
          }
        })
      ).subscribe(), 500);
    } else {
      this.passwordIsValid = false;
    }
  }

  getDisabledButtonCondition() {
    if (this.remember && !this.passwordIsValid) {
      return true;
    }
    if (this.allowUsertoOrderwithoutPaying && this.allowUsertoOrderwithoutPaying === 'true') {
      return false;
    } else {
      return !this.isFormValid;
    }
  }

  sendReceipt = () => {
    const paramsEmail = {
      orderId: localStorage.orderId,
      email: this.newCustomerInformation.customerEmail,
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId
    };

    this.configService.sendReceipt(paramsEmail).subscribe(
      (data: any) => {
        if (data.success === 1) {
          console.log(data.message, 1);
        } else {
          console.log(data.message, 0);
        }
      },
      (error) => (console.log(error))
    );
  }

  sendReceiptMobile = () => {
    const paramsMobile = {
      orderId: localStorage.orderId,
      mobile: this.customerInformation.customerMobile.e164Number
        ? this.customerInformation.customerMobile.e164Number
        : this.customerInformation.customerMobile,
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId
    };

    this.configService.sendReceipt(paramsMobile).subscribe(
      (data: any) => {
        if (data.success === 1) {
          console.log(data.message, 1);
        } else {
          console.log(data.message, 0);
        }
      },
      (error) => (console.log(error))
    );
  }

  displayFloatTip() {
    this.customTip = parseFloat(this.customTip).toFixed(2);
  }

  selectCustomTips(event) {
    if(!event) {
      this.tipSelectedValue = 0;
      return;
    }
    this.tipSelectedValue = parseFloat(event);
  }

}
