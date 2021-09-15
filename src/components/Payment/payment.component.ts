import {AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatCalendarCellCssClasses} from '@angular/material/datepicker';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {style} from './payments.style';
import {Element as StripeElement, ElementsOptions, StripeService} from 'ngx-stripe';
import ObjectID from 'bson-objectid';
import {findSetting} from '../../utils/FindSetting';
import {ConfigService} from '../../services/config.service';
import {ClearCart, RemoveFromCart, SetCustomer} from '../../store/actions';
import {Router} from '@angular/router';
import {ThemePalette} from '@angular/material/core';
import {CountryISO, SearchCountryField, TooltipLabel} from 'ngx-intl-tel-input';
import {Product} from '../../models/product';

interface LocalStripeElement extends StripeElement {
  addEventListener?: (name: string, callback: Function) => void;
}

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  providers: [FormBuilder, StripeService, ConfigService]
})
export class PaymentComponent implements OnInit, AfterViewInit {
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];

  loading = false;
  tableNumber = localStorage.getItem('tableNumber');
  checkoutProcess = 'Creating Order...';
  color: ThemePalette = 'accent';
  order: any;
  orderType: any = this.tableNumber === null ? 1 : 4;
  orderComplete: any;
  error: any;
  seats: any = [];
  autoAcceptOrder = localStorage.getItem('autoAccept');
  pauseOrder = localStorage.getItem('pauseOrder');
  seatsCount: number;
  isMethodCardSelected: any = 1;
  tipsOptions: any;
  tipSelected = 66;
  tips = 0;
  cart: any;
  storeInformation: any;
  customer: any;
  tipsOption: any;
  serviceCharge: any;
  customerFirstName: any;
  customerLastName: any;
  customerMobile: any;
  customerEmail: any;
  isGooglePay = false;
  invalid = true;
  number: any;
  isDisabledPlaceOrder = true;
  // stripe related elements
  elements: any;
  productNamePay = '';
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
              private stripeService: StripeService,
              private store: Store<{ storeInformation: []; cart: [] }>,
              private dialogRef: MatDialogRef<PaymentComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any
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

    this.customerFirstName = this.customer.customerFirstName === undefined ? '' : this.customer.customerFirstName;
    this.customerLastName = this.customer.customerLastName === undefined ? '' : this.customer.customerLastName;
    this.customerMobile = this.customer.customerMobile === undefined ? '' : this.customer.customerMobile;
    this.customerEmail = this.customer.customerEmail === undefined ? '' : this.customer.customerEmail;

    this.getServiceCharge();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.tipsOptions = JSON.parse(findSetting(this.storeInformation, 'OnlineStorePresetOptions'));
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

  getSubTotalAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + obj.subTotalAmount * obj.quantity;
    }, 0);
  }

  getTotalAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.totalAmount * obj.quantity);
    }, 0);
  }

  getTotalTaxesAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + obj.taxes;
    }, 0);
  }

  getServeId = () => {
    return this.storeInformation.settings.filter((setting) => {
      return setting.settingName === 'OnlineStoreAssignedEmployee';
    });
  }

  getModifiers = (product) => {
    return product.modifiers.map(modifier => {
      return {
        modifierId: modifier.modifierId,
        modifierName: modifier.modifierName,
        modifierPrice: modifier.modifierPrice,
        modifierType: modifier.modifierType,
        modifierGroupId: modifier.modifierGroupId,
        modifierGroupName: 'Modifications',
        modifierOptionId: modifier.modifierOptionId,
        modifierOptionName: 'Normal',
        hasMultipleOptions: false,
        orderTypeId: modifier.orderTypeId,
        isServable: modifier.isServable
      };
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
          },
          (error) => (this.error = error)
        );
    } else {
      return this.serviceCharge = 0;
    }
  }

  setStoreCustomer(currentCustomer) {
    this.store.dispatch(new SetCustomer(currentCustomer));
  }

  createGuest = () => {
    const params = {
      customerFirstName: this.customerFirstName,
      customerLastName: this.customerLastName,
      customerEmail: this.customerEmail,
      customerMobile: this.customerMobile.e164Number,
      merchantId: this.storeInformation.merchantId,
      storeId: this.storeInformation.storeId
    };

    this.configService.createGuest(params).subscribe((data: any) => {
      this.customer = data.response;
      this.setStoreCustomer(this.customer);
    });
    return true;
  }


  isSettingActive = (setting) => {
    const settingValue = findSetting(this.storeInformation, setting);
    return settingValue !== 'false';
  }

  selectTip = (tip, percentage) => {
    this.tipsOption = '';
    this.tips = this.getSubTotalAmount() * percentage / 100;
    return this.tipSelected = tip;
  }


  disabled = () => {
    if (this.cardNumber !== undefined) {
      this.invalid = !(
        // @ts-ignore
        this.cardNumber._invalid === false &&
        // @ts-ignore
        this.cardCvc._invalid === false &&
        // @ts-ignore
        this.cardExpiry._invalid === false &&
        // @ts-ignore
        this.cardNumber._empty === false &&
        // @ts-ignore
        this.cardCvc._empty === false &&
        // @ts-ignore
        this.cardExpiry._empty === false);
    }
    return this.invalid;
  }

  setCustomTips = () => {
    this.tips = this.tipsOption === '' ? this.tips : this.tipsOption;
  }

  cardSelected = (card) => {
    this.isMethodCardSelected = card;
  }

  openSchedule() {
    this.dialog.open(ScheduleComponent, {
      panelClass: 'my-class',
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
      productTaxValue: productSelected.taxesTotalAmount, // cart
      productServiceChargeValue: 0,
      productOrderDiscountValue: 0,
      productDiscountValue: 0,
      productCalculatedPrice: productSelected.variant.variantValue, // cart + tax
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

  setOrder = () => {
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
      orderName: 'Online Ordering',
      customerId: this.customer.customerId,
      customerName: this.customer.customerFirstName,
      customerPhoneNumber: this.customer.customerMobile,
      customerEmail: this.customer.customerEmail,
      orderNumberSuffix: '',
      tableId: localStorage.tableId || '',
      serverId: findSetting(this.storeInformation, 'OnlineStoreAssignedEmployee'),
      serverJobtype: '',
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
      deliveryAmount: 0,
      receiptEmail: '',
      receiptPhone: '',
      revenueCenterId: findSetting(this.storeInformation, 'OnlineOrderingRevenueCenter'),
      trackerId: '',
      originId: '',
      isSyncedMarketMan: 0,
      waitingToBePreparedAt: 0,
      beingPreparedAt: 0,
      readyAt: 0,
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

  generateOrder = (e) => {
    this.checkoutProcess = 'Creating Order...';
    this.loading = !this.loading;

    if (this.customer.length === 0) {
      this.createGuest();
    }

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
          this.buy();
        },
        (error) => (this.error = error)
      );
    }, 3000);
  }

  buy() {
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
    this.store.dispatch(new ClearCart([]));
    this.router.navigate(['receipt']);
  }

  generateOrderGoogle = () => {
    this.isGooglePay = true;
  }

  generatePayment = (token) => {
    this.checkoutProcess = 'Generating Payment';
    localStorage.setItem('finalAmount', (this.tips + this.getTotalAmount()).toFixed(2));
    const params = {
      tokenId: token.id,
      amount: parseFloat((this.getTotalAmount() + this.tips).toFixed(2)),
      tipAmount: this.tips,
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
          this.cleanCart();
          this.goBack();
        }
      },
      (error) => (this.error = error)
    );
  }

  setOrderType(orderType) {
    this.orderType = orderType;
  }

  goBack() {
    this.dialogRef.close();
  }

  redirectEditProduct(id, productCartId) {
    this.router.navigate(['products/' + id.toString() + '/' + productCartId]);
    this.dialogRef.close();
  }

  removeProduct(item: Product) {
    this.store.dispatch(new RemoveFromCart(item));
  }
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'schedule-dialog',
  templateUrl: './schedule-dialog.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  selectedDate: any;
  customCalendarHeader: any;
  todayDate: Date = new Date();

  ngOnInit(): void {
  }

  onSelect(event) {
    this.selectedDate = event;
  }

  constructor(private dialogRef: MatDialogRef<ScheduleComponent>) {
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

  closeDialog() {
    this.dialogRef.close();
  }

}
