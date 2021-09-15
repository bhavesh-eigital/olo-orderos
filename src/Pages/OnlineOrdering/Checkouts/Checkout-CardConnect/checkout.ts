import {AfterViewInit, Component, ElementRef, HostListener, OnChanges, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Store} from '@ngrx/store';
import {Router} from '@angular/router';
import ObjectID from 'bson-objectid';
import {findSetting} from '../../../../utils/FindSetting';
import {ConfigService, TemportalAddressIdResponse} from '../../../../services/config.service';
import {ClearCart, SetCustomer, SetDefaultAddress, SetDefaultPaymentMethod, SetPaymentMethods} from '../../../../store/actions';
import {Element as StripeElement} from 'ngx-stripe/lib/interfaces/element';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';
import {CountryISO, SearchCountryField, TooltipLabel} from 'ngx-intl-tel-input';
import {AddressDialog, DialogAddPaymentMethod} from '../../../Account/Customer/customer.component';
import {MatDialog} from '@angular/material/dialog';
import {getCardLogo} from '../../../../utils/GetCardLogo';
import {CardConnectAddPaymentMethods} from '../../../Account/Customer/AddPaymenMetods/CardConnect/CardConnect';
import {environment} from '../../../../environments/environment';
import {OrderTypeSliderComponent} from 'src/components/order-type-slider/order-type-slider.component';
import {UIService} from 'src/services/ui.service';
import {getCurrentAddressData} from 'src/utils/getCurrentAddressData';
import {switchMap, tap} from 'rxjs/operators';
import {SecondEndpoint} from 'src/models/secondEndpoint';
import {FirstEndpoint} from 'src/models/firstEndpoint';
import * as LocalizedFormat from 'dayjs/plugin/localizedFormat';
import * as isoWeek from 'dayjs/plugin/isoWeek';
import * as moment from 'dayjs';
import {WebSocketService} from '../../../../services/socket.service';
import {PoyntModalComponent} from 'src/components/poynt-modal/poynt-modal.component';
import {PoyntService} from '../../../../services/poynt.service';
import {DeliveryOloModalComponent} from '../Components/delivery-olo-modal/delivery-olo-modal.component';
import {OloService} from '../../../../services/olo.service';
import {timeConvert} from '../../../../utils/TimeConvert';
import {Observable, of, Subscription} from 'rxjs';
import {ReRequestOloModalComponent} from '../Components/re-request-olo-modal/re-request-olo-modal.component';

moment.extend(LocalizedFormat);
moment.extend(isoWeek);

@Component({
  selector: 'checkout',
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss'],
})

export class CheckoutCardConnect implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('cardNumber') cardNumberRef: ElementRef;
  @ViewChild('cardExpiry') cardExpiryRef: ElementRef;
  @ViewChild('cardCvc') cardCvcRef: ElementRef;
  @ViewChild('customTipInput') customTipInput: ElementRef<HTMLInputElement>;
  @ViewChild('desktopCheckout') desktopCheckout: ElementRef<HTMLDivElement>;
  @ViewChild('mobileCheckout') mobileCheckout: ElementRef<HTMLDivElement>;

  finalAmount = 0;
  paymentRequest;
  canPaymentRequest = false;
  applePaymentRequest = false;
  secretKeyStripe: any;
  paymentIntentId: any;
  currency = localStorage.getItem('currency');
  r;
  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  btnDisabled = false;
  cart: any;
  storeInformation: any;
  checkoutProcess = 'Creating Order...';
  loading = false;
  calculateLoading = false;
  customer: any;
  customerInformation: any;
  prepDay: any = '';
  prepTimeSelected: any = '';
  prepDaySelected: any = '';
  prepTime: any = '';
  tipSelected: any = 0.00;
  tipSelectedIndex: any = 0;
  seats: any = [];
  deliveryUtensils: false;
  tableNumber: any;
  seatsCount: number;
  notes: '';
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
  stripe;
  stripeMerchant;
  stripeMobile; // : stripe.Stripe;
  autoAcceptOrder = localStorage.getItem('autoAccept');
  pauseOrder = localStorage.getItem('pauseOrder');
  currentOrderType = 2;
  elements: any;
  orderType: any;
  serviceCharge: any;
  customTip;
  deliveryFee = 0.00;
  deliveryFeeTime = 0;
  isInRange: any;
  customerDefaultAddress: any;
  card: StripeElement;
  cardNumber;
  cardExpiry;
  cardCvc;
  cardErrors;
  paymentMethods: any[];
  defaultPaymentMethod: '';
  cardNumberMobile;
  cardExpiryMobile;
  cardCvcMobile;
  cardErrorsMobile;
  addressSelected: any;
  showAddress = false;
  onlineStorePrepTime: any;
  showPayments = false;
  isUseDefaultAddress = true;
  addressDefaultId = 0;
  stripeTest: FormGroup;
  disabledButton = false;
  isPaymentFail = false;
  OnlineStoreOrderAhead: number;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  elementsOptions = {
    locale: 'en',
    fonts: [
      {
        cssSrc:
          'https://fonts.googleapis.com/css?family=Montserrat:300,300i,400,500,600',
      },
    ],
  };
  currentTime = moment().unix();
  daySelected: any;
  openRestaurantHours: any;
  closeRestaurantHours: any;

  optionsDays = [];

  optionsHours = [];
  isClosed: boolean;
  restaurantHours: any;
  sendToKitchen: any;

  customerPaymentAuth;

  @ViewChild('slider') slider: OrderTypeSliderComponent;
  @ViewChild('slider2') slider2: OrderTypeSliderComponent;

  open = false;
  previousOrderTypeValue: number;
  allowScheduledOrders: string;
  allowGratuity: string;
  disabledAsSoonAsPosbile = false;
  OnlineOrderingEnable = 'true';

  storeSubs$ = new Subscription();

  scheduleCategoryId: string;

  categories = [];
  isOloDeliveryModal = false;
  deliveryQuoteIdOLO: string;
  timerExpire: any;
  timeInterval: any;

  tipOptions = [];

  firstLoad = true;

  // Retrieve if olo is integrated
  isOloIntegrated = localStorage.getItem('isOloIntegrated') === 'true';

  constructor(
    private router: Router,
    public configService: ConfigService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private store: Store<{ storeInformation: []; cart: []; customer: [] }>,
    private uIService: UIService,
    private webSocket: WebSocketService,
    private poyntService: PoyntService,
    private oloService: OloService,
  ) {

    this.webSocket.socket.on('data', (data) => {
      if (data[0].model === 'setting' && data[0].data[0].settingName === 'OnlineStorePrepTime') {
        this.onlineStorePrepTime = parseInt(data[0].data[0].settingValue, 10);
        localStorage.onlineStorePrepTime = this.onlineStorePrepTime;
      }
    });

    this.storeSubs$ = store.subscribe((state: any) => {
      const data = state.cartShop;
      this.cart = data.cart;
      this.storeInformation = data.storeInformation;
      this.paymentMethods = data.paymentMethods;
      if (!this.paymentMethods || !this.paymentMethods.length) {
        this.showPayments = true;
      }
      this.customer = data.customer;
      this.defaultPaymentMethod = data.customerDefaultPaymentMethod;
      this.restaurantHours = data.restaurantHours;
      this.categories = data.categories;
      const {customerDefaultAddress} = getCurrentAddressData(data.customerDefaultAddress);
      this.customerDefaultAddress = customerDefaultAddress;
      this.addressSelected = this.customerDefaultAddress;
      if (!this.addressSelected) {
        this.changeLocation(this.customer.customerAdresses[0]);
      }
      if (this.cart.length === 0) {
        if(this.currentOrderType !== 1) {
          this.router.navigate(['home']);
        }
        return;
      }
      this.optionsDays = this.getOptionDays();
      this.OnlineStoreOrderAhead = parseInt(findSetting(this.storeInformation, 'OnlineStoreOrderAhead'), 10);

      this.scheduleCategoryId = localStorage.getItem('scheduleCategoryId');

      if (this.scheduleCategoryId) {
        const scheduleCategory = this.categories.find(cat => cat.categoryId === this.scheduleCategoryId)?.scheduleCategory;
        this.optionsDays = this.optionsDays.slice(scheduleCategory || 0, localStorage.provider === 'STRIPE' ? this.OnlineStoreOrderAhead : 2);
      } else {
        this.optionsDays = this.optionsDays.slice(0, localStorage.provider === 'STRIPE' ? this.OnlineStoreOrderAhead : 2);
      }
      this.tipOptions = JSON.parse(findSetting(this.storeInformation, 'OnlineStorePresetOptions'));
    });

    if (this.customer.customerAdresses?.length === 0 || this.customer.customerMobile === null || this.customer.isVerified === false) {
      this.router.navigate(['customer']);
    } else {
      this.customerMobile = this.customer.customerMobile;
      this.onlineStorePrepTime = localStorage.onlineStorePrepTime === undefined || localStorage.onlineStorePrepTime === null
        ? parseInt(findSetting(this.storeInformation, 'OnlineStorePrepTime'), 10)
        : parseInt(localStorage.onlineStorePrepTime, 10);
      this.sendToKitchen = findSetting(this.storeInformation, 'OnlineOrderingDirectlyToKitchen');
      this.allowScheduledOrders = findSetting(this.storeInformation, 'OnlineStoreAllowScheduledOrders');
      this.allowGratuity = findSetting(this.storeInformation, 'OnlineStoreAllowGratuity');
      this.OnlineOrderingEnable = findSetting(this.storeInformation, 'OnlineOrderingEnable');
      this.setDefaultAddress(this.getCurrentAddressDefault(this.customer.customerDefaultAddressId));
      if (localStorage.provider !== 'POYNT') {
        this.getPaymentMethods();
      }
    }
  }

  ngOnInit(): void {
    if (!this.allowGratuity || this.allowGratuity === 'false') {
      this.tipSelectedIndex = null;
      this.tipSelected = 0.00;
    }
    this.getRangeHourByOrderType();
    this.compareTime();
    this.getServiceCharge();
    this.currentOrderType = parseInt(localStorage.getItem('orderType'), 10);
    this.orderType = this.currentOrderType;

    this.customer.length === 0
      ? this.customerInformation = this.newCustomerInformation
      : this.customerInformation = this.setCustomer(this.customer);
    if (this.customer.length === 0) {
      this.router.navigate(['login']);
      return;
    }

    this.scheduleCategoryId = localStorage.getItem('scheduleCategoryId');
    if (this.scheduleCategoryId) {
      this.btnDisabled = true;
    }
  }

  ngOnChanges(): void {
  }

  getCurrentLocation() {
    if (localStorage.temporalDefaultAddress !== undefined && localStorage.temporalDefaultAddress !== '') {

    }
  }

  ngAfterViewInit(): void {
    this.uIService.materialInputEventListener();
    this.onResize();
    this.finalAmount = this.getTotalAmount() + this.tipSelected;
    this.finalAmount = parseInt(String(Number(this.finalAmount.toFixed(2)) * 100), 10);
    this.tableNumber = localStorage.getItem('tableNumber') === null ? false : localStorage.getItem('tableNumber');
    this.stripe = Stripe('pk_test_TTF68ceJV8AKZCuq3ho4vrjY00iIHqHUZO', {
      stripeAccount: environment.stripe_account
    });
    this.stripeMerchant = Stripe('pk_test_TTF68ceJV8AKZCuq3ho4vrjY00iIHqHUZO', {
      stripeAccount: this.getAccountIntegrationId().accountId
    });

    this.orderTypeSelected(this.currentOrderType);

    if (this.currentOrderType !== 1) {
      this.deliveryFee = 0;
    } else {
      if (this.isOloIntegrated) {
        this.openOLODelivery();
      } else {
        this.getDynamicDeliveryFee();
        this.getDeliveryFeeTime();
      }
    }
  }

  showPaymentRequest() {

    if (this.tipSelectedIndex === 0) {
      this.tipSelected = parseFloat((Math.round((this.getSubTotalAmount() * (this.tipOptions[0] / 100) * 100)) / 100).toFixed(2));
      this.customTip = 0;
    }
    if (this.tipSelectedIndex === 1) {
      this.tipSelected = parseFloat((Math.round((this.getSubTotalAmount() * (this.tipOptions[1] / 100) * 100)) / 100).toFixed(2));
      this.customTip = 0;
    }

    if (this.tipSelectedIndex === 2) {
      this.tipSelected = parseFloat((Math.round((this.getSubTotalAmount() * (this.tipOptions[2] / 100) * 100)) / 100).toFixed(2));
      this.customTip = 0;
    }
    if (this.tipSelectedIndex === 3) {
      this.tipSelected = parseFloat((Math.round((this.getSubTotalAmount() * (this.tipOptions[3] / 100) * 100)) / 100).toFixed(2));
      this.customTip = 0;
    }
    if (this.customTip !== 0 && this.tipSelectedIndex === 5) {
      this.tipSelected = this.customTip;
    }
    this.finalAmount = parseFloat((this.getTotalAmount() + parseFloat(this.tipSelected || 0)).toFixed(2));
    this.updatePaymentRequest('checkout', this.finalAmount * 100);
    this.paymentRequest.show();
  }

  updatePaymentRequest(label, amount) {
    this.paymentRequest.update({
      country: 'US',
      currency: 'usd',
      total: {
        label,
        amount,
      },
    });
  }

  getDeliveryFeeTime() {
    const {currentAddress, currentCity} = getCurrentAddressData(this.customerDefaultAddress);

    this.configService.getDeliveryDistance(this.storeInformation.storeId, currentAddress, currentCity)
      .subscribe((distanceResponse: any) => {
        this.isInRange = distanceResponse.inRange;
        this.deliveryFeeTime = (distanceResponse.deliveryDuration);
      });
  }

  getCustomerPhoto = () => {
    return this.customer.customerPhoto ? 'https://' + this.customer.customerPhoto : 'assets/IconsSVG/Account.svg';
  };
  compareTime = () => {
    this.optionsHours = [
      {viewValue: '00:00am  - 00:30am', value: moment().set('hour', 0).set('minute', 0)},
      {viewValue: '00:30am  - 01:00am', value: moment().set('hour', 0).set('minute', 30)},
      {viewValue: '01:00am  - 01:30am', value: moment().set('hour', 1).set('minute', 0)},
      {viewValue: '01:30am  - 02:00am', value: moment().set('hour', 1).set('minute', 30)},
      {viewValue: '02:00am  - 02:30am', value: moment().set('hour', 2).set('minute', 0)},
      {viewValue: '02:30am  - 03:00am', value: moment().set('hour', 2).set('minute', 30)},
      {viewValue: '03:00am  - 03:30am', value: moment().set('hour', 3).set('minute', 0)},
      {viewValue: '03:30am  - 04:00am', value: moment().set('hour', 3).set('minute', 30)},
      {viewValue: '04:00am  - 04:30am', value: moment().set('hour', 4).set('minute', 0)},
      {viewValue: '04:30am  - 05:00am', value: moment().set('hour', 4).set('minute', 30)},
      {viewValue: '05:00am  - 05:30am', value: moment().set('hour', 5).set('minute', 0)},
      {viewValue: '05:30am  - 06:00am', value: moment().set('hour', 5).set('minute', 30)},
      {viewValue: '06:00pm  - 06:30pm', value: moment().set('hour', 6).set('minute', 0)},
      {viewValue: '06:30am  - 07:00am', value: moment().set('hour', 6).set('minute', 30)},
      {viewValue: '07:00am  - 07:30am', value: moment().set('hour', 7).set('minute', 0)},
      {viewValue: '07:30am  - 08:00am', value: moment().set('hour', 7).set('minute', 30)},
      {viewValue: '08:00am  - 08:30am', value: moment().set('hour', 8).set('minute', 0)},
      {viewValue: '08:30am  - 09:00am', value: moment().set('hour', 8).set('minute', 30)},
      {viewValue: '09:00am  - 09:30am', value: moment().set('hour', 9).set('minute', 0)},
      {viewValue: '09:30am  - 10:00am', value: moment().set('hour', 9).set('minute', 30)},
      {viewValue: '10:00am  - 10:30am', value: moment().set('hour', 10).set('minute', 0)},
      {viewValue: '10:30am  - 11:00am', value: moment().set('hour', 10).set('minute', 30)},
      {viewValue: '11:00am  - 11:30am', value: moment().set('hour', 11).set('minute', 0)},
      {viewValue: '11:30am  - 12:00am', value: moment().set('hour', 11).set('minute', 30)},
      {viewValue: '12:00pm  - 12:30pm', value: moment().set('hour', 12).set('minute', 0)},

      {viewValue: '12:30pm  - 01:00pm', value: moment().set('hour', 12).set('minute', 30)},
      {viewValue: '01:00pm  - 01:30pm', value: moment().set('hour', 13).set('minute', 0)},
      {viewValue: '01:30pm  - 02:00pm', value: moment().set('hour', 13).set('minute', 30)},
      {viewValue: '02:00pm  - 02:30pm', value: moment().set('hour', 14).set('minute', 0)},
      {viewValue: '02:30pm  - 03:00pm', value: moment().set('hour', 14).set('minute', 30)},
      {viewValue: '03:00pm  - 03:30pm', value: moment().set('hour', 15).set('minute', 0)},
      {viewValue: '03:30pm  - 04:00pm', value: moment().set('hour', 15).set('minute', 30)},
      {viewValue: '04:00pm  - 04:30pm', value: moment().set('hour', 16).set('minute', 0)},
      {viewValue: '04:30pm  - 05:00pm', value: moment().set('hour', 16).set('minute', 30)},
      {viewValue: '05:00pm  - 05:30pm', value: moment().set('hour', 17).set('minute', 0)},
      {viewValue: '05:30pm  - 06:00pm', value: moment().set('hour', 17).set('minute', 30)},
      {viewValue: '06:00pm  - 06:30pm', value: moment().set('hour', 18).set('minute', 0)},
      {viewValue: '06:30pm  - 07:00pm', value: moment().set('hour', 18).set('minute', 30)},
      {viewValue: '07:00pm  - 07:30pm', value: moment().set('hour', 19).set('minute', 0)},
      {viewValue: '07:30pm  - 08:00pm', value: moment().set('hour', 19).set('minute', 30)},
      {viewValue: '08:00pm  - 08:30pm', value: moment().set('hour', 20).set('minute', 0)},
      {viewValue: '08:30pm  - 09:00pm', value: moment().set('hour', 20).set('minute', 30)},
      {viewValue: '09:00pm  - 09:30pm', value: moment().set('hour', 21).set('minute', 0)},
      {viewValue: '09:30pm  - 10:00pm', value: moment().set('hour', 21).set('minute', 30)},
      {viewValue: '10:00pm  - 10:30pm', value: moment().set('hour', 22).set('minute', 0)},
      {viewValue: '10:30pm  - 11:00pm', value: moment().set('hour', 22).set('minute', 30)},
      {viewValue: '11:00pm  - 11:30pm', value: moment().set('hour', 23).set('minute', 0)},
      {viewValue: '11:30pm  - 12:00am', value: moment().set('hour', 23).set('minute', 30)},
      {viewValue: '12:00am  - 12:30am', value: moment().set('hour', 24).set('minute', 0)},
    ];

    this.openRestaurantHours = localStorage.getItem('prepTimeHoursOpen')
      ? localStorage.getItem('prepTimeHoursOpen')
      : this.openRestaurantHours;

    this.closeRestaurantHours = localStorage.getItem('prepTimeHoursClose')
      ? localStorage.getItem('prepTimeHoursClose')
      : this.openRestaurantHours;

    const startHour = this.openRestaurantHours.split(':')[0];
    const startHourTime = this.openRestaurantHours.split(' ')[1];

    const endHour = this.closeRestaurantHours.split(':')[0];
    const endHourTime = this.closeRestaurantHours.split(' ')[1];

    const startTime = moment()
      .set('hour', (startHourTime === 'AM' ? parseInt(startHour, 10) : parseInt(startHour, 10) + 12)).unix();
    const endTime = moment()
      .set('hour', (endHourTime === 'PM' ? parseInt(endHour, 10) + 12 : parseInt(endHour, 10)) - 1).unix();

    this.optionsHours = this.optionsHours.filter((option) => {
      return moment(option.value).unix() >= startTime && moment(option.value).unix() <= endTime;
    });

    if (this.prepDaySelected === moment().isoWeekday()) {
      this.optionsHours = this.optionsHours.filter((option) => {
        return moment(option.value).unix() >= this.currentTime;
      });
    }

  };

  getPrepTimeHours = (orderType, daySelected) => {

    const OnlineOrderingRestaurantDineInHours = JSON.parse(findSetting(this.storeInformation, 'OnlineOrderingRestaurantDineInHours'));
    const OnlineOrderingRestaurantPickupHours = JSON.parse(findSetting(this.storeInformation, 'OnlineOrderingRestaurantPickupHours'));
    const OnlineOrderingRestaurantCurbsidePickupHours = JSON.parse(findSetting(this.storeInformation, 'OnlineOrderingRestaurantCurbsidePickupHours'));
    const OnlineOrderingRestaurantDeliveryHours = JSON.parse(findSetting(this.storeInformation, 'OnlineOrderingRestaurantDeliveryHours'));

    if (orderType === 1) {
      switch (daySelected) {
        case 1:
          const mondayInfo = OnlineOrderingRestaurantDeliveryHours.find((data) => {
            return data.day === 'Monday';
          });
          if (mondayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(mondayInfo);
          }
          break;
        case 2:
          const tuesdayInfo = OnlineOrderingRestaurantDeliveryHours.find((data) => {
            return data.day === 'Tuesday';
          });
          if (tuesdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(tuesdayInfo);
          }
          break;
        case 3:
          const wednesdayInfo = OnlineOrderingRestaurantDeliveryHours.find((data) => {
            return data.day === 'Wednesday';
          });
          if (wednesdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(wednesdayInfo);
          }
          break;
        case 4:
          const thursdayInfo = OnlineOrderingRestaurantDeliveryHours.find((data) => {
            return data.day === 'Thursday';
          });
          if (thursdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(thursdayInfo);
          }
          break;
        case 5:
          const fridayInfo = OnlineOrderingRestaurantDeliveryHours.find((data) => {
            return data.day === 'Friday';
          });
          if (fridayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(fridayInfo);
          }
          break;
        case 6:
          const saturdayInfo = OnlineOrderingRestaurantDeliveryHours.find((data) => {
            return data.day === 'Saturday';
          });
          if (saturdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(saturdayInfo);
          }
          break;
        case 7:
          const sundayInfo = OnlineOrderingRestaurantDeliveryHours.find((data) => {
            return data.day === 'Sunday';
          });
          if (sundayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(sundayInfo);
          }
          break;
      }
    }
    if (orderType === 3) {
      switch (daySelected) {
        case 1:
          const mondayInfo = OnlineOrderingRestaurantCurbsidePickupHours.find((data) => {
            return data.day === 'Monday';
          });
          if (mondayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(mondayInfo);
          }
          break;
        case 2:
          const tuesdayInfo = OnlineOrderingRestaurantCurbsidePickupHours.find((data) => {
            return data.day === 'Tuesday';
          });
          if (tuesdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(tuesdayInfo);
          }
          break;
        case 3:
          const wednesdayInfo = OnlineOrderingRestaurantCurbsidePickupHours.find((data) => {
            return data.day === 'Wednesday';
          });
          if (wednesdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(wednesdayInfo);
          }
          break;
        case 4:
          const thursdayInfo = OnlineOrderingRestaurantCurbsidePickupHours.find((data) => {
            return data.day === 'Thursday';
          });
          if (thursdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(thursdayInfo);
          }
          break;
        case 5:
          const fridayInfo = OnlineOrderingRestaurantCurbsidePickupHours.find((data) => {
            return data.day === 'Friday';
          });
          if (fridayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(fridayInfo);
          }
          break;
        case 6:
          const saturdayInfo = OnlineOrderingRestaurantCurbsidePickupHours.find((data) => {
            return data.day === 'Saturday';
          });
          if (saturdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(saturdayInfo);
          }
          break;
        case 7:
          const sundayInfo = OnlineOrderingRestaurantCurbsidePickupHours.find((data) => {
            return data.day === 'Sunday';
          });
          if (sundayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(sundayInfo);
          }
          break;
      }
    }

    if (orderType === 2) {
      switch (daySelected) {
        case 1:
          const mondayInfo = OnlineOrderingRestaurantPickupHours.find((data) => {
            return data.day === 'Monday';
          });
          if (mondayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(mondayInfo);
          }
          break;
        case 2:
          const tuesdayInfo = OnlineOrderingRestaurantPickupHours.find((data) => {
            return data.day === 'Tuesday';
          });
          if (tuesdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(tuesdayInfo);
          }
          break;
        case 3:
          const wednesdayInfo = OnlineOrderingRestaurantPickupHours.find((data) => {
            return data.day === 'Wednesday';
          });
          if (wednesdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(wednesdayInfo);
          }
          break;
        case 4:
          const thursdayInfo = OnlineOrderingRestaurantPickupHours.find((data) => {
            return data.day === 'Thursday';
          });
          if (thursdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(thursdayInfo);
          }
          break;
        case 5:
          const fridayInfo = OnlineOrderingRestaurantPickupHours.find((data) => {
            return data.day === 'Friday';
          });
          if (fridayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(fridayInfo);
          }
          break;
        case 6:
          const saturdayInfo = OnlineOrderingRestaurantPickupHours.find((data) => {
            return data.day === 'Saturday';
          });
          if (saturdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(saturdayInfo);
          }
          break;
        case 7:
          const sundayInfo = OnlineOrderingRestaurantPickupHours.find((data) => {
            return data.day === 'Sunday';
          });
          if (sundayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(sundayInfo);
          }
          break;
      }
    }

    if (orderType === 4) {
      switch (daySelected) {
        case 1:
          const mondayInfo = OnlineOrderingRestaurantDineInHours.find((data) => {
            return data.day === 'Monday';
          });
          if (mondayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(mondayInfo);
          }
          break;
        case 2:
          const tuesdayInfo = OnlineOrderingRestaurantDineInHours.find((data) => {
            return data.day === 'Tuesday';
          });
          if (tuesdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(tuesdayInfo);
          }
          break;
        case 3:
          const wednesdayInfo = OnlineOrderingRestaurantDineInHours.find((data) => {
            return data.day === 'Wednesday';
          });
          if (wednesdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(wednesdayInfo);
          }
          break;
        case 4:
          const thursdayInfo = OnlineOrderingRestaurantDineInHours.find((data) => {
            return data.day === 'Thursday';
          });
          if (thursdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(thursdayInfo);
          }
          break;
        case 5:
          const fridayInfo = OnlineOrderingRestaurantDineInHours.find((data) => {
            return data.day === 'Friday';
          });
          if (fridayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(fridayInfo);
          }
          break;
        case 6:
          const saturdayInfo = OnlineOrderingRestaurantDineInHours.find((data) => {
            return data.day === 'Saturday';
          });
          if (saturdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(saturdayInfo);
          }
          break;
        case 7:
          const sundayInfo = OnlineOrderingRestaurantDineInHours.find((data) => {
            return data.day === 'Sunday';
          });
          if (sundayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(sundayInfo);
          }
          break;
      }
    }
  }

  setRestaurantHours(dayInfo) {
    localStorage.setItem('prepTimeHoursOpen', moment(dayInfo.startTimeFormat * 1000).format('LT'));
    localStorage.setItem('prepTimeHoursClose', moment(dayInfo.endTimeFormat * 1000).format('LT'));
    this.isClosed = moment().set('hour', dayInfo.endTime).set('minute', 0).unix() < moment().unix()
      || moment().set('hour', dayInfo.startTime).set('minute', 0).unix() > moment().unix();
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

  changeOrderType = (orderType) => {
    let RestaurantInfo;
    if (orderType === 1) {
      RestaurantInfo = this.restaurantHours.find((restaurantDineIn) => {
        return restaurantDineIn.kind === 'DELIVERY';
      });
    }
    if (orderType === 2) {
      RestaurantInfo = this.restaurantHours.find((restaurantDineIn) => {
        return restaurantDineIn.kind === 'PICKUP';
      });
    }
    if (orderType === 3) {
      RestaurantInfo = this.restaurantHours.find((restaurantDineIn) => {
        return restaurantDineIn.kind === 'CURBSIDE';
      });
    }
    if (orderType === 4) {
      RestaurantInfo = this.restaurantHours.find((restaurantDineIn) => {
        return restaurantDineIn.kind === 'DINE_IN';
      });
    }

    if (RestaurantInfo.status === 'CLOSED') {
      this.openSnackBar('The order type selected is close for the moment.', 2);
      this.disabledButton = true;
    } else {
      this.openRestaurantHours = RestaurantInfo.schedule.from;
      this.closeRestaurantHours = RestaurantInfo.schedule.to;
      this.currentOrderType = orderType;
      localStorage.orderType = orderType;
      this.getRangeHourByOrderType();
      if (orderType === 1) {
        this.getDynamicDeliveryFee();
      } else {
        this.deliveryFee = 0.00;
      }
      this.disabledButton = false;
    }
  };

  isOrderTypeClosed(orderTypeName: string) {
    const deliveryHour = this.restaurantHours.find(restaurantHour => restaurantHour.kind === orderTypeName);
    if (deliveryHour.status === 'CLOSED') {
      if (orderTypeName === 'PICKUP') {
        if (this.allowScheduledOrders === 'false') {
          orderTypeName = orderTypeName.toLocaleLowerCase();
          orderTypeName = orderTypeName[0].toUpperCase() + orderTypeName.slice(1);
          this.snackBar.open(`${orderTypeName} is closed`, '', {
            duration: 5000,
            panelClass: 'red-snackbar',
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.disabledButton = true;
          this.disabledAsSoonAsPosbile = false;
        } else {
          this.disabledButton = false;
          this.disabledAsSoonAsPosbile = true;
          this.btnDisabled = true;
        }
      }
    } else {
      this.disabledButton = false;
    }
  }

  orderTypeSelected = (orderType) => {
    this.setDeliveryFee();
    if (orderType === 1) {
      this.isOrderTypeClosed('DELIVERY');
    } else if (orderType === 2) {
      this.isOrderTypeClosed('PICKUP');
    } else if (orderType === 3) {
      this.isOrderTypeClosed('CURBSIDE');
    }
    if (orderType === 2 || orderType === 3) {
      return;
    }

    const {currentAddress, currentCity} = getCurrentAddressData(this.customerDefaultAddress);

    if (!this.isOloIntegrated) {
      this.getDeliveryFeeTime();
    }

    // this.configService.getDeliveryDistance(this.storeInformation.storeId, currentAddress, currentCity)
    //   .subscribe((distanceResponse: any) => {
    //     this.isInRange = distanceResponse.inRange;
    //     if (orderType === 1 && this.isInRange === false) {
    //       // this.dialog.open(AddressValidation);
    //     } else {
    //       this.deliveryFeeTime = (distanceResponse.deliveryDuration / 60);
    //       this.setDeliveryFee();
    //       this.changeOrderType(orderType);
    //     }
    //   });
  }

  setDeliveryFee() {
    if (this.currentOrderType === 1 && !this.isOloIntegrated) {
      this.getDynamicDeliveryFee();
      // this.openOLODelivery();
    } else {
      this.deliveryFee = 0;
    }
  }

  goBack() {
    this.router.navigate(['home']);
  }

  getTips = (tip) => {
    return parseFloat((Math.round((this.getSubTotalAmount() * tip * 100)) / 100).toFixed(2));
  }

  selectTip = (tip, index) => {
    this.tipSelectedIndex = index;
    if (this.customTip !== 0 && this.tipSelectedIndex === 5) {
      this.tipSelected = parseFloat(this.customTip);
    } else {
      this.tipSelected = parseFloat((Math.round((this.getSubTotalAmount() * tip * 100)) / 100).toFixed(2));
      this.customTip = '';
    }

    if (index === 5) {
      this.customTipInput.nativeElement.focus();
    }
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
    return Math.round(this.cart.reduce((acc, obj) => {
      return acc + (obj.totalAmount * obj.quantity);
    }, 0) * 100) / 100;
  }

  getTotalAmount = () => {
    return (this.cart.reduce((acc, obj) => {
      return ((obj.totalAmount * obj.quantity) + acc);
    }, 0) * 100 + this.deliveryFee * 100 + this.getTotalTaxesAmount() * 100) / 100;
  }

  getTotalTaxesAmount = () => {
    return Math.round(this.cart.reduce((acc, obj) => {
      return acc + (obj.taxes * obj.quantity);
    }, 0) * 100) / 100;
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
        modifierOptionName: modifier.modifierOptions[0].modifierOptionsName,
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
      prepTime: 0, // PRODUCT SCHEDULE
      onlineOrderServeStatus: 9, // ONLY IF A PREP TIME IS SELECTED
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
      productTaxValue: Math.round(((productSelected.taxes * productSelected.quantity) * 100)) / 100, // cart
      productServiceChargeValue: 0,
      productOrderDiscountValue: 0,
      productDiscountValue: 0,
      productCalculatedPrice: Math.round(((productSelected.subTotalAmount * productSelected.quantity) * 100)) / 100,
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
          taxValue: 0.0,
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
  }

  setOrder = (isMobile) => {
    return {
      orderServiceCharge: {
        authorizerId: '',
        serviceChargeName: 0,
        serviceChargeValue: 0,
        serviceChargeType: 0,
        serviceChargeId: 0,
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
      orderName: 'Online Ordering',
      customerId: this.customer.customerId,
      customerName: this.customerInformation.customerFirstName + this.customerInformation.customerLastName,
      customerFirstName: this.customerInformation.customerFirstName,
      customerLastName: this.customerInformation.customerLastName,
      customerMobile: this.customerMobile.e164Number || this.customerMobile,
      customerEmail: this.customerInformation.customerEmail,
      deliveryAddressId: this.addressDefaultId,
      deliveryUtensils: this.deliveryUtensils,
      orderNumberSuffix: '',
      tableId: '',
      serverId: findSetting(this.storeInformation, 'OnlineStoreAssignedEmployee'),
      serverJobType: '',
      orderSellStatus: 2,
      orderServeStatus: this.autoAcceptOrder === 'true' && this.sendToKitchen === 'true' ? 2 : 1,
      orderType: 8,
      onlineOrderType: this.currentOrderType,
      onlineOrderServeStatus: this.prepTimeSelected !== '' ? 9 : this.autoAcceptOrder === 'true' ? 2 : 1,
      readyTime: this.autoAcceptOrder === 'true' ? this.onlineStorePrepTime * 60 : 0,
      prepareStartAt: this.autoAcceptOrder === 'true' ? Math.round(new Date().getTime() / 1000) : 0,
      serviceName: 'others', // settings
      serviceId: '', // pending nicholas
      shiftId: '', // pending nicholas
      shiftName: '', // pending nicholas
      serviceType: 1, // pending nicholas
      timeOfArrival: Math.round(new Date().getTime() / 1000),
      notes: this.notes,
      paymentId: '',
      refundedAmount: 0,
      actualPaidAmount: this.getTotalAmount(),
      taxAmount: this.getTotalTaxesAmount(),
      subTotalAmount: this.getSubTotalAmount(),
      totalAmount: this.getTotalAmount(),
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
      prepTime: this.prepTimeSelected === '' ? null : this.prepTimeSelected,
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
          customerName: this.customerInformation.customerFirstName + ' ' + this.customerInformation.customerLastName,
          orderProducts: this.seats,
        },
      ],
      updatedAt: Math.round(new Date().getTime() / 1000),
      orderGiftCard: [],
      storeId: this.storeInformation.storeId,
      createdAt: Math.round(new Date().getTime() / 1000),
      merchantId: this.storeInformation.merchantId,
    };
  };

  setStoreCustomer(currentCustomer) {
    this.store.dispatch(new SetCustomer(currentCustomer));
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
      duration: 2000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  setDefaultCard = (paymentMethod) => {
    if (this.defaultPaymentMethod !== paymentMethod.id) {
      this.configService
        .setDefaultPaymentMethod({
          paymentMethodId: paymentMethod.id,
          customerId: this.customer.customerId,
          merchantId: this.storeInformation.merchantId,
          storeId: this.storeInformation.storeId,
          paymentProcessor: localStorage.provider
        }).subscribe((data: any) => {
        if (data.success === 1) {
          this.store.dispatch(new SetDefaultPaymentMethod(paymentMethod.id));
          this.getPaymentMethods();
        } else {
          this.openSnackBar(data.message, 2);
        }
      });
    }
  };

  deletePaymentMethod = (paymentMethod) => {
    this.configService.removePaymentMethod({paymentMethodId: paymentMethod.id}).subscribe((data) => {
      const filteredPaymentMethods = this.paymentMethods.filter(
        (paymentMethodArray) => paymentMethodArray.id !== paymentMethod.id
      );
      this.store.dispatch(new SetPaymentMethods(filteredPaymentMethods));
      const wasDefault = this.defaultPaymentMethod === paymentMethod.id;
      if (wasDefault && filteredPaymentMethods.length > 0) {
        this.configService
          .updateCustomer({
            customerId: this.customer.customerId,
            customerDefaultPaymentMethod: filteredPaymentMethods[0].id,
          })
          .subscribe((dataUpdate: any) => {
            if (dataUpdate.success === 1) {
              this.store.dispatch(new SetDefaultPaymentMethod(filteredPaymentMethods[0].id));
            } else {
              this.openSnackBar(dataUpdate.message, 2);
            }
          });
      } else {
        this.configService
          .updateCustomer({
            customerId: this.customer.customerId,
            customerDefaultPaymentMethod: '',
          })
          .subscribe((dataUpdatePayment: any) => {
            if (dataUpdatePayment.success === 1) {
              this.store.dispatch(new SetDefaultPaymentMethod(''));
            } else {
              this.openSnackBar(dataUpdatePayment.message, 2);
            }
          });
      }
    });
  };

  buy() {
    if (this.OnlineOrderingEnable === 'false') {
      this.snackBar.open('This store has deactivated orders for the moment. Please, try later', '', {
        duration: 5000,
        panelClass: ['red-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }
    this.loading = true;
    this.disabledButton = true;
    this.calculateTipSelected();
    this.generateOrder();
  }

  showListAddress = () => {
    this.showAddress = !this.showAddress;
  };

  showPaymentMethodList = () => {
    this.showPayments = !this.showPayments;
  };

  getCurrentAddressDefault = (addressId) => {
    const addressDefault = this.customer.customerAdresses.find((address) => {
      return address._id === addressId;
    });
    return addressDefault === undefined ? '' : addressDefault;
  };

  setDefaultAddress(defaultAddress) {
    this.store.dispatch(new SetDefaultAddress(defaultAddress));
  }

  openCustomerAddressDialog = (isEditable, currentAddress) => {
    const isNewAddress = isEditable === true
      ? {
        address: currentAddress,
        edit: isEditable
      }
      : {
        edit: isEditable
      };

    this.dialog.open(AddressDialog, {
      data: isNewAddress,
      panelClass: 'full-screen-modal'
    });
  };

  generateOrder = () => {
    this.checkoutProcess = 'Creating Order...';
    if (this.customer.length === 0) {
      this.createGuest(false);
    }

    this.order = {};
    this.seats = [];

    if (this.cart !== []) {
      this.order = this.setOrder(false);
      this.getSeats();
    }

    this.getCurrentAddressId().pipe(
      tap((resp) => {
        if (resp) {
          this.customerDefaultAddress = {...this.customerDefaultAddress, _id: resp.response};
          localStorage.temporalDefaultAddress = '';
          this.store.dispatch(new SetDefaultAddress(this.customerDefaultAddress));
        }
      }),
      switchMap(() => {
        const payload: FirstEndpoint = {
          orderName: this.order.orderName,
          serverId: this.order.serverId,
          orderSellStatus: this.order.orderSellStatus,
          orderType: this.order.orderType,
          deliveryAddressId: this.customerDefaultAddress._id,
          serviceName: this.order.serviceName,
          serviceType: this.order.serviceType,
          timeOfArrival: this.order.timeOfArrival,
          notes: this.order.notes,
          revenueCenterId: this.order.revenueCenterId,
          prepTime: this.order.prepTime,
          createdEmployeeId: this.getServeId()[0].createdEmployeeId,
          updatedEmployeeId: this.getServeId()[0].updatedEmployeeId,
          status: this.order.status,
          orderProducts: this.order.seats.flatMap(seat => seat.orderProducts),
          storeId: this.order.storeId,
          merchantId: this.order.merchantId,
          subTotalAmount: this.order.subTotalAmount,
          refundedAmount: this.order.refundedAmount,
          actualPaidAmount: 0,
          taxAmount: this.order.taxAmount,
          deliveryAmount: this.order.deliveryAmount || 0,
          onlineOrderType: this.currentOrderType,
          customerFirstName: this.customerInformation.customerFirstName,
          customerLastName: this.customerInformation.customerLastName,
          customerId: this.customer.customerId,
          deliveryUtensils: this.deliveryUtensils,
          customerMobile: this.customerMobile.e164Number || this.customerMobile,
          customerEmail: this.customerInformation.customerEmail,
          onlineOrderServeStatus: this.prepTimeSelected !== '' ? 9 : this.autoAcceptOrder === 'true' ? 2 : 1,
          readyTime: this.autoAcceptOrder === 'true' ? this.onlineStorePrepTime * 60 : 0,
          prepareStartAt: this.autoAcceptOrder === 'true' ? Math.round(new Date().getTime() / 1000) : 0,
          orderServeStatus: this.autoAcceptOrder === 'true' && this.sendToKitchen === 'true' ? 2 : 1,
        };

        if (localStorage.failedOrderId) {
          payload.orderId = localStorage.failedOrderId;
        }

        return this.configService.orderValidation(payload).pipe(
          switchMap((resp: any) => {

            if (resp.success === 0) {
              this.openSnackBar(resp.message, 2);
              this.disabledButton = false;
              this.loading = !this.loading;
              setTimeout(() => {
                this.onResize();
              }, 100);
              return;
            }

            let processorCustomerId = '';
            if (localStorage.provider === 'STRIPE') {
              const stripeAccount = this.customer.stripe.accounts.find(acc => acc.storeId === this.storeInformation.storeId);
              processorCustomerId = stripeAccount.customerId;
            }

            if (localStorage.provider === 'POYNT') {
              const poyntAccount = this.customer.poynt.find(acc => acc.storeId === this.storeInformation.storeId);
              processorCustomerId = poyntAccount.customerId;
            }

            let params: SecondEndpoint;
            params = {
              checkSum: resp.response.checkSum,
              orderId: resp.response.orderId,
              storeId: this.storeInformation.storeId,
              merchantId: this.storeInformation.merchantId,
              paymentProcessor: localStorage.provider,
              paymentMethodId: this.defaultPaymentMethod,
              customerName: this.customerInformation.customerFirstName + ' ' + this.customerInformation.customerLastName,
              customerAddress: this.customerDefaultAddress.customerAddress1,
              customerPostal: this.customerDefaultAddress.customerZip,
              tipAmount: this.allowGratuity === 'false' ? 0 : this.tipSelected,
              employeeId: findSetting(this.storeInformation, 'OnlineStoreAssignedEmployee'),
              processorCustomerId,
              customerMobile: this.customerMobile.e164Number || this.customerMobile,
              customerId: this.customer.customerId,
            };
            return this.configService.paymentValidation(params).pipe(
              tap((data: any) => {
                if (data.success === 1) {
                  if (localStorage.failedOrderId) {
                    localStorage.removeItem('failedOrderId');
                  }
                  localStorage.setItem('orderId', data.response.orderId);
                  this.checkoutProcess = 'Payment successfully ';
                  this.store.dispatch(new ClearCart([]));
                  localStorage.setItem('currentOrderCart', JSON.stringify(this.cart));
                  // start olo process if it has been activated
                  if (this.currentOrderType === 1 && this.isOloIntegrated) {  // validate order status
                    this.oloService
                      .acceptOrder(  // Accept delivery price
                        this.deliveryQuoteIdOLO,
                        this.customer.customerId,
                        this.storeInformation.storeId,
                        data.response.orderId)
                      .pipe(
                        tap(({success, response}) => {
                          if (success === 1) {
                            this.router.navigate(['delivery/state'], {
                              queryParams: {
                                orderId: data.response.orderId,
                                deliveryId: response.deliveryId
                              }
                            });
                            this.oloService.sendDriverInformation({
                              ...response,
                              deliveryFee: this.deliveryFee,
                              deliveryFeeTime: this.deliveryFeeTime
                            });
                          }
                          this.loading = !this.loading;
                        })
                      ).subscribe();
                  } else {
                    this.router.navigate(['receipt']);
                    this.loading = !this.loading;
                  }
                } else {
                  localStorage.setItem('failedOrderId', data.orderId);
                  this.openSnackBar(data.message, 2);
                  this.loading = !this.loading;
                  this.disabledButton = !this.disabledButton;
                  this.isPaymentFail = true;
                  setTimeout(() => {
                    this.onResize();
                  }, 100);
                }
              })
            );
          })
        );
      })
    ).subscribe();
  };

  getCurrentAddressId(): Observable<TemportalAddressIdResponse | null> {
    if (!this.customerDefaultAddress._id) {
      return this.configService.getTemporalAddressID({
        customerId: this.customer.customerId,
        customerAddress1: this.customerDefaultAddress.customerAddress1,
        customerCity: this.customerDefaultAddress.customerCity,
        customerCountry: this.customerDefaultAddress.customerCountry,
        customerState: this.customerDefaultAddress.customerState,
        customerZip: this.customerDefaultAddress.customerDefaultAddress
      });
    }
    return of(null);
  }

  select(optionDay) {
    this.prepDaySelected = optionDay.value;
    this.btnDisabled = true;
    this.getPrepTimeHours(this.currentOrderType, optionDay.value);
    this.compareTime();
  }

  setAsap() {
    this.btnDisabled = false;
    this.prepTime = '';
    this.prepTimeSelected = '';
    this.prepDay = '';
  }

  openDateOptions() {
    this.btnDisabled = true;
    setTimeout(() => this.uIService.materialInputEventListener(), 200);
  }

  changePrepTime = (value) => {
    const day = moment(value);
    this.btnDisabled = true;

    this.prepTimeSelected = day.set('year', moment(this.prepDay.viewValue).year())
      .set('month', moment(this.prepDay.viewValue).month())
      .set('date', moment(this.prepDay.viewValue).date());
    this.prepTimeSelected = moment(this.prepTimeSelected).unix();

  };

  selectCustomTips(event) {
    this.tipSelected = event;
  }

  displayFloatTip() {
    this.customTip = parseFloat(this.customTip).toFixed(2);
  }

  updateNotes(value) {
    this.notes = value;
  }

  returnCardLogo = (cardType) => {
    return getCardLogo(cardType);
  };

  calculateTipSelected = () => {
    switch (this.tipSelectedIndex) {
      case 0:
        this.tipSelected = 0;
        return this.tipSelected = (Math.round((this.getSubTotalAmount() * (this.tipOptions[0] / 100) * 100)) / 100).toFixed(2);
      case 1:
        this.tipSelected = 0;
        return this.tipSelected = (Math.round((this.getSubTotalAmount() * (this.tipOptions[1] / 100) * 100)) / 100).toFixed(2);
      case 2:
        this.tipSelected = 0;
        return this.tipSelected = (Math.round((this.getSubTotalAmount() * (this.tipOptions[2] / 100) * 100)) / 100).toFixed(2);
      case 3:
        this.tipSelected = 0;
        return this.tipSelected = (Math.round((this.getSubTotalAmount() * (this.tipOptions[3] / 100) * 100)) / 100).toFixed(2);
      default:
        this.tipSelected = this.tipSelected;
    }
  }

  addressDefault = (listAddress) => {
    if (this.isUseDefaultAddress === true) {
      return listAddress.filter((address) => {
        return address.isDefault === true;
      });
    }
    if (this.isUseDefaultAddress === false) {
      return listAddress.filter((address) => {
        return address._id === this.addressDefaultId;
      });
    }
  };

  changeLocation(address: any) {
    const currentAddress = address.customerAddress1;
    const currentCity = address.customerCity;
    if (this.currentOrderType === 1) {
      this.configService.getDeliveryDistance(this.storeInformation.storeId, currentAddress, currentCity)
        .subscribe((distanceResponse: any) => {
          this.isInRange = distanceResponse.inRange;
          if (this.isInRange === true) {
            this.deliveryFeeTime = (distanceResponse.deliveryDuration / 60);
            this.isUseDefaultAddress = false;
            this.addressDefaultId = address._id;
            this.showAddress = false;
            this.addressSelected = address;
            this.store.dispatch(new SetDefaultAddress(address));
            this.getDynamicDeliveryFee();
            localStorage.temporalDefaultAddress = '';
          } else {
            this.openSnackBar('Location is not within the range of the store. Please select other location', 2);
            this.snackBar.open('Location is not within the range of the store. Please select other location', '', {
              panelClass: ['red-snackbar'],
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.addressSelected = this.customerDefaultAddress;
            this.getDynamicDeliveryFee();
            // this.dialog.open(AddressValidation);
            // this.openSnackBar('the Address is not in the range,please select other address', 2);
          }
        });
    } else {
      this.isUseDefaultAddress = false;
      this.addressDefaultId = address._id;
      this.showAddress = false;
      this.addressSelected = address;
      this.store.dispatch(new SetDefaultAddress(address));
    }
  }

  openAddNewPaymentsMethods = () => {

    if (localStorage.provider === 'POYNT') {
      this.dialog.open(PoyntModalComponent, {
        width: '100%',
        minWidth: '320px',
        maxWidth: '450px',
        panelClass: 'poyntModal',
      }).afterClosed().pipe(
        tap((payment) => {
          if (payment) {
            this.store.dispatch(new SetPaymentMethods([...this.paymentMethods, payment]));
            this.setDefaultCard(payment);
          }
        })
      ).subscribe();

    } else if (localStorage.provider === 'STRIPE') {
      this.dialog.open(DialogAddPaymentMethod, {
        maxWidth: '540px',
        width: '100%',
        minWidth: '320px',
      }).afterClosed().subscribe(() => {
        this.getPaymentMethods();
      });
    } else {
      this.dialog.open(CardConnectAddPaymentMethods, {
        maxWidth: '540px',
        width: '100%',
        minWidth: '320px',
      }).afterClosed().subscribe(() => {
        this.getPaymentMethods();
      });
    }
  };

  getOrderTypeName = () => {
    let orderTypeName = '';
    switch (this.currentOrderType) {
      case 1:
        return orderTypeName = 'Delivery';
      case 2:
        return orderTypeName = 'Pick up';
      case 3:
        return orderTypeName = 'Pick up';
    }
    return orderTypeName;
  };

  getDynamicDeliveryFee() {
    this.calculateLoading = true;
    const {currentAddress, currentCity} = getCurrentAddressData(this.customerDefaultAddress);
    this.configService.getDeliveryFee(`${currentAddress},${currentCity}`, this.storeInformation.storeId)
      .subscribe((data: any) => {
        if (data.success === 1) {
          this.deliveryFee = data.deliveryFee;
          this.calculateLoading = false;
        }
      });
  }

  getTipSelected = (tips) => {
    this.tipSelected = tips;
  };

  getAccountIntegrationId = () => {
    return this.storeInformation.integrations.find((integration) => {
      return integration.name === 'STRIPE';
    });
  };


  getRangeHourByOrderType = () => {
    if (this.currentOrderType === 1) {
      const RestaurantInfo = this.restaurantHours.find((restaurantDineIn) => {
        return restaurantDineIn.kind === 'DELIVERY';
      });
      this.openRestaurantHours = RestaurantInfo.schedule.from;
      this.closeRestaurantHours = RestaurantInfo.schedule.to;
      RestaurantInfo.status === 'CLOSED' ? this.isClosed = true : this.isClosed = false;
    }
    if (this.currentOrderType === 2) {
      const RestaurantInfo = this.restaurantHours.find((restaurantDineIn) => {
        return restaurantDineIn.kind === 'PICKUP';
      });
      this.openRestaurantHours = RestaurantInfo.schedule.from;
      this.closeRestaurantHours = RestaurantInfo.schedule.to;
      RestaurantInfo.status === 'CLOSED' ? this.isClosed = true : this.isClosed = false;
    }
    if (this.currentOrderType === 3) {
      const RestaurantInfo = this.restaurantHours.find((restaurantDineIn) => {
        return restaurantDineIn.kind === 'CURBSIDE';
      });
      this.openRestaurantHours = RestaurantInfo.schedule.from;
      this.closeRestaurantHours = RestaurantInfo.schedule.to;
      RestaurantInfo.status === 'CLOSED' ? this.isClosed = true : this.isClosed = false;
    }
    if (this.currentOrderType === 4) {
      const RestaurantInfo = this.restaurantHours.find((restaurantDineIn) => {
        return restaurantDineIn.kind === 'DINE_IN';
      });
      this.openRestaurantHours = RestaurantInfo.schedule.from;
      this.closeRestaurantHours = RestaurantInfo.schedule.to;
      RestaurantInfo.status === 'CLOSED' ? this.isClosed = true : this.isClosed = false;
    }
  };

  getPaymentMethods() {
    this.configService
      .getPaymentMethods(
        this.customer.customerId, this.storeInformation.storeId, this.storeInformation.merchantId, localStorage.provider)
      .subscribe((data: any) => {
        if (data.success === 1) {
          this.store.dispatch(new SetPaymentMethods(data.response));
        } else {
          this.openSnackBar('error:' + data.message, 2);
        }
      });
  }

  getCollapseTitle() {
    if (this.currentOrderType === 1 && !this.btnDisabled) {
      return `DELIVERY TIME | Ready in ${(this.onlineStorePrepTime + this.deliveryFeeTime).toFixed(0)} Min`;
    }
    if (this.currentOrderType === 2 && !this.btnDisabled) {
      return `PICK UP TIME | Ready in ${(this.onlineStorePrepTime).toFixed(0)} Min`;
    }
    if (this.currentOrderType === 3 && !this.btnDisabled) {
      return `PICK UP TIME | Ready in ${(this.onlineStorePrepTime).toFixed(0)} Min`;
    }
    if (this.btnDisabled) {
      return 'Select a Date & Time';
    }
  }

  getIngredientsAndModifiers(item) {
    let words = '';
    if (item && item.ingredients) {
      item.ingredients.map((ingredient: any, i: number) => {
        words += ingredient.ingredientName;
        if (i < item.ingredients.length - 1 && (!item.ingredients || !item.ingredients.length)) {
          words += ', ';
        }
      });
    }
    if (item && item.modifiers) {
      item.modifiers.map((modifier: any, i: number) => {
        words += modifier.modifierName;
        if (i < item.modifiers.length - 1) {
          words += ', ';
        }
      });
    }
    return words;
  }

  getDeliveryFee = (delivery) => {
    return parseFloat(delivery).toFixed(2);
  };
  getTaxes = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.taxes * obj.quantity);
    }, 0);
  };

  getCustomerName() {
    if (this.customer.length !== 0) {
      return `${this.customer.customerFirstName} ${this.customer.customerLastName}`;
    }
    return null;
  }

  isValidCard() {
    return this.paymentMethods.find(method => method.id === this.defaultPaymentMethod);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth > 576) {
      if (!this.desktopCheckout.nativeElement.style.display || this.desktopCheckout.nativeElement.style.display === 'none') {
        this.mobileCheckout.nativeElement.style.display = 'none';
        this.desktopCheckout.nativeElement.style.display = 'block';
        setTimeout(() => this.slider.toggleSlider(this.currentOrderType), 150);
      }
    } else {
      if (!this.mobileCheckout.nativeElement.style.display || this.mobileCheckout.nativeElement.style.display === 'none') {
        this.desktopCheckout.nativeElement.style.display = 'none';
        this.mobileCheckout.nativeElement.style.display = 'block';
        setTimeout(() => this.slider2.toggleSlider(this.currentOrderType), 150);
      }
    }

    if (window.innerWidth > 744) {
      this.poyntService.options.iFrame.width = '335px';
      this.poyntService.options.iFrame.height = '100px';
    } else {
      this.poyntService.options.iFrame.width = '270px';
      this.poyntService.options.iFrame.height = '100px';
    }
  }

  getOptionDays() {
    if (localStorage.provider === 'STRIPE') {
      return [
        {value: moment().isoWeekday(), viewValue: moment().format('dddd, ll')},
        {value: moment().add(1, 'days').isoWeekday(), viewValue: moment().add(1, 'days').format('dddd, ll')},
        {value: moment().add(2, 'days').isoWeekday(), viewValue: moment().add(2, 'days').format('dddd, ll')},
        {value: moment().add(3, 'days').isoWeekday(), viewValue: moment().add(3, 'days').format('dddd, ll')},
        {value: moment().add(4, 'days').isoWeekday(), viewValue: moment().add(4, 'days').format('dddd, ll')},
        {value: moment().add(5, 'days').isoWeekday(), viewValue: moment().add(5, 'days').format('dddd, ll')},
        {value: moment().add(6, 'days').isoWeekday(), viewValue: moment().add(6, 'days').format('dddd, ll')},
        {value: moment().add(7, 'days').isoWeekday(), viewValue: moment().add(7, 'days').format('dddd, ll')},
      ];
    } else {
      return [
        {value: moment().isoWeekday(), viewValue: moment().format('dddd, ll')},
        {value: moment().add(1, 'days').isoWeekday(), viewValue: moment().add(1, 'days').format('dddd, ll')},
        {value: moment().add(2, 'days').isoWeekday(), viewValue: moment().add(2, 'days').format('dddd, ll')},
      ];
    }
  }

  getCompleteAddress(customerDefaultAddress) {
    return `${customerDefaultAddress.customerAddress1}, ${customerDefaultAddress.customerCity}, ${customerDefaultAddress.customerState} ${customerDefaultAddress.customerZip}`;
  }

  ngOnDestroy(): void {
    this.storeSubs$.unsubscribe();
    clearInterval(this.timeInterval);
  }

  openOLODelivery() {
    this.isOloDeliveryModal = true;
    const storeId = this.storeInformation.storeId;
    const customerId = this.customer.customerId;
    const {currentAddressId} = getCurrentAddressData(this.customerDefaultAddress);
    const subTotalAmount = this.getTotalAmount();
    this.calculateLoading = true;
    this.dialog.open(DeliveryOloModalComponent, {
      data: {
        storeId,
        customerId,
        currentAddressId,
        subTotalAmount
      },
      disableClose: true
    }, ).afterClosed().pipe(
      tap((data) => {
        this.isOloDeliveryModal = false;
        this.calculateLoading = false;
        this.startTimer(( 60 * 5 ));
        if (data) {
          this.deliveryFee = data.deliveryFee;
          this.deliveryFeeTime = data.deliveryTime;
          this.deliveryQuoteIdOLO = data.quoteId;
        }
      })
    ).subscribe();
  }

  openOrderTypeByOLO = (orderType) => {
    this.deliveryQuoteIdOLO = '';
    clearInterval(this.timeInterval);
    if (!this.isOloDeliveryModal && orderType === 1 && this.isOloIntegrated) {
      this.openOLODelivery();
    }
  }

  startTimer(duration) {
    let timer = duration;
    let minutes;
    let seconds;
    this.timeInterval = setInterval( () => {
      minutes = parseInt(String(timer / 60), 10);
      seconds = parseInt(String(timer % 60), 10);

      minutes = minutes < 10 ? '0' + minutes : minutes;
      seconds = seconds < 10 ? '0' + seconds : seconds;

      this.timerExpire = minutes + ':' + seconds;

      if (--timer < 0) {
        this.openReRequestModal();
        clearInterval(this.timeInterval);
      }
    }, 1000);
  }

  openReRequestModal(){
    this.dialog.open(ReRequestOloModalComponent, {
      data: {},
      disableClose: true
    }, ).afterClosed().pipe(
      tap( res => {
        if (res) {
          this.openOLODelivery();
        }
      })
    ).subscribe();
  }

}
