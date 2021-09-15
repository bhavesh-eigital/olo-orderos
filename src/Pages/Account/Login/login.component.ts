import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {ConfigService} from '../../../services/config.service';
import {SetCustomer, SetDefaultPaymentMethod, SetFavorites, SetPaymentMethods} from '../../../store/actions';
import {select, Store} from '@ngrx/store';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';
import {CountryISO, SearchCountryField, TooltipLabel} from 'ngx-intl-tel-input';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {FacebookService} from '../../../services/facebook.service';
import {GoogleService} from '../../../services/google.service';
import {CreateAccountModal} from '../../../components/create-account/create-account-modal';
import {MatDialog} from '@angular/material/dialog';
import {environment} from '../../../environments/environment';
import { AfterLoginViews, UIService } from 'src/services/ui.service';

declare const FB: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [ConfigService, MatSnackBar],
})
export class LoginComponentV2 implements OnInit, AfterViewInit {
  @ViewChild('addresstext') addresstext: ElementRef<HTMLInputElement>;
  @ViewChild('addressText2') addressText2: ElementRef<HTMLInputElement>;

  configUrl = environment.globalUrlApi;
  typeOfOrder = 0;
  orderType;
  innerWidth = 0;

  constructor(
    public configService: ConfigService,
    private router: Router,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef,
    private facebookService: FacebookService,
    private googleService: GoogleService,
    private store: Store<{ storeInformation: []; cart: [], customer: [] }>,
    private uiService: UIService
  ) {
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data) => (this.customer = data.customer));
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data) => (this.storeInformation = data.storeInformation));
    this.orderType = localStorage.getItem('orderType');
  }

  loading = false;
  googleAuth: string;
  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  email: any;
  password: any;
  storeInformation: any;
  customer: any;
  temporalCustomer: any;
  error: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  passwordShown: boolean;
  categorySelected: string;

  addressName: any = '';
  address: any = '';
  secondAddress: any = '';
  country: any = '';
  city: any = '';
  state: any = '';
  streetNumber: any = '';
  postalCode: any = '';
  map: google.maps.Map;


  newCustomer = {
    customerFirstName: '',
    customerLastName: '',
    customerEmail: '',
    password: '',
    customerMobile: {
      e164Number: undefined
    },
    customerAddress1: '',
    customerAddress2: '',
    customerCity: '',
    customerState: '',
    customerCountry: '',
    customerZip: '',
    customerPassword: ''
  };
  currentPasswordFormControl = new FormControl('', [
    Validators.required,
    PasswordValidator.strong,
    Validators.minLength(7),
  ]);

  ngOnInit(): void {
    this.categorySelected = 'login';
  }

  ngAfterViewInit() {
    this.getPlaceAutocomplete();
  }

  setStoreCustomer(currentCustomer) {
    this.store.dispatch(new SetCustomer(currentCustomer));
  }

  setFavoritesCustomer(currentFavorites) {
    this.store.dispatch(new SetFavorites(currentFavorites));
  }

  redirectRegister() {
    this.router.navigate(['register']);
  }

  redirect() {
    if (localStorage.orderType !== '4') {
      const redirectOptions = {
        [AfterLoginViews.TO_CHECK_OUT]: 'checkout', 
        [AfterLoginViews.TO_FAVORITES]: 'favorites',
        [AfterLoginViews.TO_ACCOUNT]: 'customer',
        [AfterLoginViews.TO_ORDERS]: 'orders'
      };

      const path = redirectOptions[this.uiService.afterLogin] || 'home';

      this.router.navigate([path]);
      this.uiService.afterLogin = null;

    } else {
      return this.router.navigate(['dinein']);
    }
  }

  setEmail = (event) => {
    this.email = event.target.value;
  }

  setPassword = (event) => {
    this.password = event.target.value;
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 3000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  togglePassword() {
    this.passwordShown = !this.passwordShown;
  }

  login = () => {
    const params = {
      customerEmail: this.email,
      password: this.password,
      merchantId: this.storeInformation.merchantId,
      storeId: this.storeInformation.storeId
    };
    this.configService.loginCustomer(params).subscribe(
      (data: any) => {
        if (data.success === 1) {
          localStorage.token = data.accessToken;
          this.customer = data.response.customer;
          // this.openSnackBar('Login Complete', 1);
          this.setStoreCustomer(this.customer);
          this.getFavorites();
          this.getPaymentMethods();
        } else {
          this.openSnackBar(this.capitalize(data.message), 0);
          return;
        }
      },
      (error) => {
        this.error = error
      }
    );
  }

  capitalize(message: string) {
    const arr = message.split(' ');
    if(arr[0] === 'customerEmail') {
      arr.shift();
      arr.unshift('email');
      arr.unshift('customer');
    }
    arr[0] = arr[0][0].toUpperCase() + arr[0].slice(1);
    return arr.join(' ');
  }

  getFavorites = () => {
    this.configService
      .getCustomerFavoritesProducts(this.storeInformation.storeId, this.storeInformation.merchantId, this.customer.customerId)
      .subscribe((data: any) => {
        this.setFavoritesCustomer(data.response.customerFavoriteProducts);
        this.redirect();
      });
  }

  redirectForgetPassword() {
    this.router.navigate(['forgetPassword']);
  }

  goBack() {
    this.router.navigate(['home']);
  }

  goTo(name) {
    this.categorySelected = name;
  }


  sendOTP = (customerId) => {
    const params = {
      customerId
    };

    this.configService.sendOTP(params)
      .subscribe((data: any) => {
        this.openSnackBar(data.message, 1);
      });
  }

  getPaymentMethods() {
    this.configService
      .getPaymentMethods(this.customer.customerId, this.storeInformation.storeId, this.storeInformation.merchantId, localStorage.provider)
      .subscribe((data: any) => {
        if (data.success === 1) {
          this.store.dispatch(new SetPaymentMethods(data.response));
          this.setPaymentMethod(data.response);
        } else {
          this.openSnackBar('error:' + data.message, 2);
        }
      });
  }

  setPaymentMethod = (paymentMethods) => {
    const paymentDefault = paymentMethods.find((paymentMethod) => {
      return paymentMethod.isDefault === true;
    });
    if (paymentDefault !== undefined) {
      this.store.dispatch(new SetDefaultPaymentMethod(paymentDefault.id));
    }
  }


  register = () => {
    const params = {
      customerFirstName: this.newCustomer.customerFirstName,
      customerLastName: this.newCustomer.customerLastName,
      customerEmail: this.newCustomer.customerEmail,
      password: this.newCustomer.customerPassword,
      customerMobile: this.newCustomer.customerMobile.e164Number,
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      customerAdresses: [
        {
          customerAddress1: this.newCustomer.customerAddress1,
          customerAddress2: this.newCustomer.customerAddress2,
          customerCity: this.newCustomer.customerCity,
          customerState: this.newCustomer.customerState,
          customerCountry: this.newCustomer.customerCountry,
          customerZip: this.newCustomer.customerZip
        }
      ]
    };

    this.configService.registerCustomer(params).subscribe(
      (data: any) => {
        if (data.success === 1) {
          this.temporalCustomer = data.response;
          localStorage.setItem('temporalCustomer', JSON.stringify(this.temporalCustomer));
          this.sendOTP(this.temporalCustomer.customerId);
          this.router.navigate(['verify']);
        } else {
          this.openSnackBar(data.message, 2);
        }
      },
      (error) => (this.error = error)
    );
  }

  // tslint:disable-next-line:variable-name
  loginCustomerWithFacebook = (accessToken) => {
    this.loading = true;
    const params = {
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      access_token: accessToken
    };
    this.configService.loginFacebook(params).subscribe((data: any) => {
      if (data.success === 1) {
        this.setStoreCustomer(data.response.customer);
        window.location.reload();
        this.openSnackBar(data.message, 1);
        this.loading = false;
      } else {
        this.loading = false;
        this.openSnackBar(data.message, 2);
      }
    });
  }

  loginWithFacebook() {
    this.facebookService.signIn().subscribe((res) => {
      this.loginCustomerWithFacebook(res.accessToken);
    });
  }


  loginCustomerWithGoogle = (idToken) => {
    const params = {
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      id_token: idToken
    };
    this.configService.loginGoogle(params).subscribe((data: any) => {
      if (data.success === 1) {
        this.setStoreCustomer(data.response.customer);
        window.location.reload();
        this.openSnackBar(data.message, 1);
        this.loading = false;
      } else {
        this.loading = false;
        this.openSnackBar(data.message, 2);
      }
    });
  }

  loginWithGoogle() {
    this.loading = true;
    this.googleService.signIn().subscribe((res) => {
      this.googleAuth = res;
      this.loginCustomerWithGoogle(res.id_token);
      this.cdRef.detectChanges();
    });
  }

  openModal() {
    this.dialog.open(CreateAccountModal, {
      panelClass: 'create-account-modal'
    });
  }

  openLoginGoogle() {
    window.location.href = this.configUrl + '/auth/google?subdomain='
      + localStorage.subdomain + '&storeId=' + this.storeInformation.storeId;
  }

  openLoginFacebook() {
    window.location.href = this.configUrl + '/auth/facebook?subdomain='
      + localStorage.subdomain + '&storeId=' + this.storeInformation.storeId;
  }

  openLoginApple() {
    window.location.href = this.configUrl + '/auth/apple?subdomain='
      + localStorage.subdomain + '&storeId=' + this.storeInformation.storeId;
  }

  private getPlaceAutocomplete() {
    const autocomplete = new google.maps.places.Autocomplete(this.addresstext.nativeElement,
      {
        componentRestrictions: { country: 'US' },
        types: ['address']  // 'establishment' / 'address' / 'geocode'
      });
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      const place = autocomplete.getPlace();
      this.newCustomer.customerAddress1 = this.getStreetNumber(place) ? this.getStreetNumber(place) + ' ' + this.getStreet(place) : this.getStreet(place);
      this.newCustomer.customerZip = this.getPostCode(place);
      this.newCustomer.customerCity = this.getCity(place);
      this.newCustomer.customerCountry = this.getCountryShort(place);
      this.newCustomer.customerState = this.getState(place);
      this.streetNumber = this.getStreetNumber(place);
      this.addresstext.nativeElement.blur();
      this.addressText2.nativeElement.focus();
    });
  }


  getAddrComponent(place, componentTemplate) {
    let result;

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < place.address_components.length; i++) {
      const addressType = place.address_components[i].types[0];
      if (componentTemplate[addressType]) {
        result = place.address_components[i][componentTemplate[addressType]];
        return result;
      }
    }
    return;
  }

  getStreetNumber(place) {
    const COMPONENT_TEMPLATE = { street_number: 'short_name' };
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getStreet(place) {
    const COMPONENT_TEMPLATE = { route: 'long_name' };
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getCity(place) {
    const COMPONENT_TEMPLATE = { locality: 'long_name' };
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getState(place) {
    const COMPONENT_TEMPLATE = { administrative_area_level_1: 'short_name' };
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getDistrict(place) {
    const COMPONENT_TEMPLATE = { administrative_area_level_2: 'short_name' };
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getCountryShort(place) {
    const COMPONENT_TEMPLATE = { country: 'short_name' };
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getCountry(place) {
    const COMPONENT_TEMPLATE = { country: 'long_name' };
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getPostCode(place) {
    const COMPONENT_TEMPLATE = { postal_code: 'long_name' };
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getPhone(place) {
    const COMPONENT_TEMPLATE = { formatted_phone_number: 'formatted_phone_number' };
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  selectOrderType(typeNumber: number) {
    if (typeNumber === 0) {
      this.typeOfOrder = typeNumber;
      localStorage.setItem('orderType', '4');
    } else {
      this.typeOfOrder = typeNumber;
      localStorage.setItem('orderType', '1');
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.innerWidth = window.innerWidth;
  }

}

export class PasswordValidator {

  public static strong(control: FormControl): { valid: boolean; strong: boolean; errors: any[] } {
    const hasNumber = /\d/.test(control.value);
    const hasUpper = /[A-Z]/.test(control.value);
    const hasLower = /[a-z]/.test(control.value);
    const hasSpecialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(control.value);
    const valid = hasNumber && hasUpper && hasLower && hasSpecialCharacters;
    if (!valid) {
      // return what´s not valid
      return { errors: [], valid: false, strong: true };
    }
    return null;
  }
}
