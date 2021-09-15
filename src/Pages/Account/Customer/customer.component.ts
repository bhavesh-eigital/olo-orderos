import { AfterViewInit, Component, HostListener, Inject, OnChanges, OnInit, SimpleChanges, ViewChild, OnDestroy } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfigService } from '../../../services/config.service';
import { SetCustomer, SetDefaultAddress, SetDefaultPaymentMethod, SetPaymentMethods } from '../../../store/actions';
import { CountryISO, SearchCountryField, TooltipLabel } from 'ngx-intl-tel-input';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CreateAccountModal } from '../../../components/create-account/create-account-modal';
import { getCardLogo } from '../../../utils/GetCardLogo';
import { CardConnectAddPaymentMethods } from './AddPaymenMetods/CardConnect/CardConnect';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { switchMap, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
  providers: [MatSnackBar]
})
export class Customer implements OnInit, OnChanges, OnDestroy {

  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  cart: any;
  storeInformation: any;
  customer: any;
  favorites: any;
  customerInformation: any;
  customerPhoto: any;
  typePayment: any = [];
  uploadForm: FormGroup;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  dataUpdated: boolean;
  newCustomerInformation: any = {
    customerEmail: '',
    customerFirstName: '',
    customerLastName: '',
    customerMobile: '',
    customerPhoto: '',
    customerAdresses: [{
      customerAddress1: '',
      customerAddress2: '',
      customerCity: '',
      customerState: '',
      customerCountry: '',
      customerZip: ''
    }],
  };
  photoU = false;
  changes: any;
  // Set New Password
  hideOldPass = true;
  hideNewPass = true;
  hideConfirmNewPass = true;

  paymentMethods: any[];
  defaultPaymentMethod: '';
  customerDefaultAddress: any;

  newPassword: any = '';
  currentPassword: any = '';
  newPasswordConfirm: any = '';
  formPass = new FormGroup({
    currentPasswordFormControl: new FormControl('', [
      Validators.required,
      Validators.minLength(7),
    ]),
    newPasswordFormControl: new FormControl('', [
      Validators.required,
      PasswordValidator.strong,
      Validators.minLength(7),
    ]),
    confirmPasswordFormControl: new FormControl('', [
      Validators.required,
      PasswordValidator.strong,
      Validators.minLength(7),
    ]),
  });
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

  countryFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(7)
  ]);

  cityFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(4)
  ]);

  stateFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(4)
  ]);

  postalFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(5)
  ]);
  private picUser: any;
  open = false;

  storeSubs$ = new Subscription();

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public configService: ConfigService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private http: HttpClient,
    private builder: FormBuilder,
    private store: Store<{ storeInformation: []; cart: []; customer: []; favorites: [] }>,
  ) {
    this.storeSubs$ = store.subscribe((state: any) => {
      const data = state.cartShop;
      this.cart = data.cart;
      this.storeInformation = data.storeInformation;
      this.defaultPaymentMethod = data.customerDefaultPaymentMethod;
      this.customerDefaultAddress = data.customerDefaultAddress;
      this.paymentMethods = data.paymentMethods;
      this.customer = data.customer;
      this.favorites = data.favorites;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  ngOnInit(): void {
    if (this.customer.length === 0) {
      this.router.navigate(['login']);
      return;
    }
    this.customer.length === 0 ? this.customerInformation = this.newCustomerInformation : this.customerInformation = this.customer;
    this.uploadForm = this.formBuilder.group({
      profile: ['']
    });

    if (this.customer.customerAdresses.length === 0 || this.customer.customerMobile === '' || this.customer.customerMobile === null
      || this.customer.isVerified === false) {
      this.dialog.open(CreateAccountModal, {
        panelClass: 'create-account-modal',
        disableClose: true
      });
    } else {
      this.setDefaultAddress(this.getCurrentAddressDefault(this.customer.customerDefaultAddressId));
      this.getPaymentMethods();
    }
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngAfterViewInit(): void {
    if (this.changes || this.photoU) {
      this.dataUpdated = true;
    }
  }

  getCurrentAddressDefault = (addressId) => {
    const addressDefault = this.customer.customerAdresses.find((address) => {
      return address._id === addressId;
    });
    return addressDefault === undefined ? '' : addressDefault;
  }

  setChanges = (event) => {
    this.changes = event.target.value;
    this.dataUpdated = true;
  }

  goBack() {
    this.router.navigate(['home']);
  }

  setStoreCustomer(currentCustomer) {
    this.store.dispatch(new SetCustomer(currentCustomer));
  }

  openDialog() {
    if (localStorage.provider === 'STRIPE') {
      this.dialog.open(DialogAddPaymentMethod, {
        maxWidth: '540px',
        width: '100%',
        minWidth: '320px',
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
  }

  returnCardLogo = (cardType) => {
    return getCardLogo(cardType);
  }

  updateCustomer = () => {
    const validateField = (
      this.customerInformation.customerFirstName &&
      this.customerInformation.customerLastName &&
      this.customerInformation.customerEmail &&
      this.customerInformation.customerMobile !== null &&
      this.customerInformation.customerMobile.e164Number.length > 5
    );

    if (validateField === true) {
      const params = {
        storeId: this.storeInformation.storeId,
        merchantId: this.storeInformation.merchantId,
        customerId: this.customer.customerId,
        customerFirstName: this.customerInformation.customerFirstName,
        customerLastName: this.customerInformation.customerLastName,
        customerEmail: this.customerInformation.customerEmail,
        customerMobile: this.customerInformation.customerMobile.e164Number,
        customerAnniversary: this.customerInformation.customerAnniversary,
        customerPhoto: this.customerInformation.customerPhoto,
        customerDOB: this.customerInformation.customerDOB,
      };

      this.configService.updateCustomer(params).subscribe((data: any) => {
        if (data.success === 1) {
          this.customer = data.response;
          this.setStoreCustomer(this.customer);
          this.setDefaultAddress(this.getCurrentAddressDefault(this.customer.customerDefaultAddressId));
          this.openSnackBar('Customer Updated', 1);
        } else {
          this.openSnackBar(data.message, 0);
          return;
        }
      });
    } else {
      this.openSnackBar('Please complete all the fields.', 2);
    }
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 3000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

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


  generatePassword() {
    if (this.currentPassword === '' || this.newPassword === '' || this.newPasswordConfirm === '') {
      this.openSnackBar('Complete all the fields', 2);
    } else {
      if (this.newPassword.toString() === this.newPasswordConfirm.toString()) {
        const params = {
          currentPassword: this.currentPassword,
          newPassword: this.newPassword,
          customerId: this.customer.customerId
        };
        this.configService.updatePasswordCustomer(params).subscribe((data: any) => {
          if (data.success === 0) {
            this.openSnackBar(data.message, 2);
          } else {
            this.openSnackBar(data.message, 1);
          }
        });
      } else {
        this.openSnackBar('Passwords do not match', 2);
      }
    }
  }

  validateFieldsForNewPassword() {
    if (this.currentPassword === '' || this.newPassword === '' || this.newPasswordConfirm === '') {
      return 'btn-disable';
    } else {
      return 'checkout-button';
    }
  }

  getCustomerPhoto = () => {
    const link = this.customer.customerPhoto.replace(/^https?:\/\//, '');
    return this.customer.customerPhoto ? 'https://' + link : 'assets/profile/profile.png';
  }

  uploadImage = (fileInputEvent) => {
    const file = fileInputEvent.target.files[0];
    if (file.type.indexOf('image') < 0) {
      this.openSnackBar('Only jpg images are allowed', 2);
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    this.configService.setImageInStorage(formData).pipe(
      tap((data: any) => this.customerInformation.customerPhoto = data.response),
      switchMap((data: any) => this.updateCustomerPhoto(data.response))
    ).subscribe();
  }

  updateCustomerPhoto(photoUrl: string) {
    return this.configService.updateCustomer({
      customerId: this.customer.customerId,
      customerPhoto: photoUrl
    }).pipe(
      tap((data: any) => {
        if (data.success === 1) {
          this.setStoreCustomer(data.response);
        } else {
          this.openSnackBar(data.message, 2);
        }
      })
    )
  }

  currentCustomerPhoto = () => {
    const link = this.customer.customerPhoto.replace(/^https?:\/\//, '');
    return 'https://' + link;
  }

  openCustomerAddressDialog = (isEditable, currentAddress) => {
    const isNewAddress = isEditable === true
      ? {
        address: currentAddress,
        edit: isEditable,
        isDeletable: this.customer.customerAdresses.length > 1
      }
      : {
        edit: isEditable
      };

    this.dialog.open(AddressDialog, {
      data: isNewAddress,
      panelClass: 'full-screen-modal'
    });
  }

  setDefaultAddress = (address) => {
    this.store.dispatch(new SetDefaultAddress(address));
  }

  updateAndSetAddress = (address) => {
    this.configService
      .updateCustomer({
        customerId: this.customer.customerId,
        customerDefaultAddressId: address._id,
      }).subscribe((data: any) => {
        if (data.success === 1) {
          this.setStoreCustomer(data.response);
          this.setDefaultAddress(this.getCurrentAddressDefault(this.customer.customerDefaultAddressId));
        } else {
          this.openSnackBar(data.message, 2);
          // this.openSnackBar(data.message, 2);
        }
      });
  }

  savePaymentDefault = (paymentMethod) => {
    this.setDefaultCard(paymentMethod);
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
  }

  setDefaultCardConnect = (paymentMethod) => {
    if (this.defaultPaymentMethod !== paymentMethod.id) {
      this.configService
        .updateCustomer({
          customerId: this.customer.customerId,
          customerDefaultPaymentMethod: paymentMethod.id,
          storeId: this.storeInformation.storeId
        })
        .subscribe((data: any) => {
          if (data.success === 1) {
            this.setStoreCustomer(data.response);
            this.store.dispatch(new SetDefaultPaymentMethod(paymentMethod.id));
          } else {
            this.openSnackBar(data.message, 2);
          }
        });
    }
  }

  deletePaymentMethod = (paymentMethodId) => {
    const bodyParams = {
      paymentMethodId: paymentMethodId.id,
      customerId: this.customer.customerId,
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      paymentProcessor: localStorage.provider
    };

    const options = { body: bodyParams };
    this.configService.deletePaymentMethods(options).then(() => {
      this.getPaymentMethods();
    });
  }

  getCustomerName() {
    if (this.customer.length !== 0) {
      return `${this.customer.customerFirstName} ${this.customer.customerLastName}`
    }
    return null;
  }

  ngOnDestroy(): void {
    this.storeSubs$.unsubscribe();
  }
}

export class PasswordValidator {

  public static strong(control: FormControl): { valid: boolean; strong: boolean; errors: any[] } {
    const hasNumber = /\d/.test(control.value);
    const hasUpper = /[A-Z]/.test(control.value);
    const hasLower = /[a-z]/.test(control.value);
    const hasSpecialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(control.value);
    // console.log('Num, Upp, Low', hasNumber, hasUpper, hasLower);
    const valid = hasNumber && hasUpper && hasLower && hasSpecialCharacters;
    if (!valid) {
      // return what´s not valid
      return { errors: [], valid: false, strong: true };
    }
    return null;
  }
}

@Component({
  selector: 'AddressDialog',
  templateUrl: 'customerAddress.html',
  styleUrls: ['./customerAddress.scss'],
})
export class AddressDialog implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('addresstext') addresstext: any;
  autocompleteInput: string;
  queryWait: boolean;

  addressName: any = '';
  address: any = '';
  secondAddress: any = '';
  country: any = '';
  city: any = '';
  state: any = '';
  streetNumber: any = '';
  postalCode: any = '';
  mobile: any;
  deliveryNote: any = '';
  isDefault = false;
  cart: any;
  customer: any;
  storeInformation: any;

  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];

  dropoffOptions = '';
  leaveItems = '';


  addressFormControl = new FormControl('', [
    Validators.required,
  ]);

  countryFormControl = new FormControl('', [
    Validators.required,
  ]);

  cityFormControl = new FormControl('', [
    Validators.required,
  ]);

  stateFormControl = new FormControl('', [
    Validators.required,
  ]);

  postalCodeFormControl = new FormControl('', [
    Validators.required,
  ]);

  phoneFormControl = new FormControl('', [
    Validators.required,
  ]);

  storeSubs$ = new Subscription();

  constructor(
    public configService: ConfigService,
    private dialogRef: MatDialogRef<AddressDialog>,
    private store: Store<{ storeInformation: []; cart: []; customer: []; favorites: [] }>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.storeSubs$ = store.subscribe((response: any) => {
      this.cart = response.cartShop.cart;
      this.storeInformation = response.cartShop.storeInformation;
      this.customer = response.cartShop.customer;
    });

    if (localStorage.temporalDefaultAddress !== undefined) {
      if (localStorage.temporalDefaultAddress.length > 0) {
        const temporalLocation = JSON.parse(localStorage.temporalDefaultAddress);
        this.addressName = '';
        this.address = temporalLocation.customerAddress1;
        this.secondAddress = temporalLocation.customerAddress2;
        this.country = temporalLocation.customerCountry;
        this.city = temporalLocation.customerCity;
        this.state = temporalLocation.customerState;
        this.postalCode = temporalLocation.customerZip;
        this.dropoffOptions = temporalLocation.dropoffOptions;
        this.leaveItems = temporalLocation.leaveItems;
      }
    }

    if (data.edit === true) {
      this.addressName = data.address.customerAddressName;
      this.address = data.address.customerAddress1;
      this.secondAddress = data.address.customerAddress2;
      this.country = data.address.customerCountry;
      this.city = data.address.customerCity;
      this.state = data.address.customerState;
      this.postalCode = data.address.customerZip;
      this.mobile = data.address.customerMobile;
      this.deliveryNote = data.address.deliveryInstructions;
      this.isDefault = data.address.isDefault;
      this.dropoffOptions = data.address.dropoffOptions;
      this.leaveItems = data.address.leaveItems;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  closeModal = () => {
    this.dialogRef.close();
  }

  setStoreCustomer(currentCustomer) {
    this.store.dispatch(new SetCustomer(currentCustomer));
  }

  saveAddressCustomer = () => {
    const currentAddresses = this.customer.customerAdresses;

    currentAddresses.push({
      customerAddressName: this.addressName,
      customerAddress1: this.address,
      customerAddress2: this.secondAddress,
      customerCity: this.city,
      customerState: this.state,
      customerCountry: this.country,
      customerZip: this.postalCode,
      customerMobile: this.mobile.e164Number,
      deliveryInstructions: this.deliveryNote,
      isDefault: this.isDefault,
      dropoffOptions: this.dropoffOptions,
      leaveItems: this.leaveItems
    });

    const params = {
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      customerId: this.customer.customerId,
      customerAdresses: currentAddresses,
    };

    this.configService.updateCustomer(params).subscribe((data: any) => {
      if (data.success === 1) {
        this.customer = data.response;
        this.closeModal();
      } else {
        console.log('error');
        this.closeModal();
        return;
      }
    });
    this.closeModal();
  }

  ngAfterViewInit() {
    this.getPlaceAutocomplete();
  }

  private getPlaceAutocomplete() {
    const autocomplete = new google.maps.places.Autocomplete(this.addresstext.nativeElement,
      {
        componentRestrictions: { country: 'US' },
        types: ['address']  // 'establishment' / 'address' / 'geocode'
      });
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      const place = autocomplete.getPlace();
      this.address = this.getStreetNumber(place) ? this.getStreetNumber(place) + ' ' + this.getStreet(place) : this.getStreet(place);
      this.postalCode = this.getPostCode(place);
      this.city = this.getCity(place);
      this.country = this.getCountryShort(place);
      this.state = this.getState(place);
      this.streetNumber = this.getStreetNumber(place);
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

  getStreetNumber = (place) => {
    const COMPONENT_TEMPLATE = { street_number: 'short_name' };
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getStreet = (place) => {
    const COMPONENT_TEMPLATE = { route: 'long_name' };
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getCity = (place) => {
    const COMPONENT_TEMPLATE = { locality: 'long_name' };
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getState = (place) => {
    const COMPONENT_TEMPLATE = { administrative_area_level_1: 'short_name' };
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getDistrict = (place) => {
    const COMPONENT_TEMPLATE = { administrative_area_level_2: 'short_name' };
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getCountryShort = (place) => {
    const COMPONENT_TEMPLATE = { country: 'short_name' };
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getCountry = (place) => {
    const COMPONENT_TEMPLATE = { country: 'long_name' };
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getPostCode = (place) => {
    const COMPONENT_TEMPLATE = { postal_code: 'long_name' };
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getPhone = (place) => {
    const COMPONENT_TEMPLATE = { formatted_phone_number: 'formatted_phone_number' };
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  disabledButton = () => {
    return !!(this.address && this.country && this.city && this.state && this.state && this.postalCode && this.mobile);
  }

  editAddress = (address) => {

    this.customer.customerAdresses = this.customer.customerAdresses.filter((addressCustomer) => {
      return addressCustomer._id !== address._id;
    });

    const currentAddresses = this.customer.customerAdresses;

    currentAddresses.push({
      customerAddressName: this.addressName,
      customerAddress1: this.address,
      customerAddress2: this.secondAddress,
      customerCity: this.city,
      customerState: this.state,
      customerCountry: this.country,
      customerZip: this.postalCode,
      customerMobile: this.mobile.e164Number,
      deliveryInstructions: this.deliveryNote,
      isDefault: this.isDefault,
      dropoffOptions: this.dropoffOptions,
      leaveItems: this.leaveItems
    });

    const params = {
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      customerId: this.customer.customerId,
      customerAdresses: currentAddresses,
    };

    this.configService.updateCustomer(params).subscribe((data: any) => {
      if (data.success === 1) {
        this.customer = data.response;
        this.closeModal();
      } else {
        console.log('error');
        this.closeModal();
        return;
      }
    });

  }

  deleteAddress = (address) => {
    this.customer.customerAdresses = this.customer.customerAdresses.filter((addressCustomer) => {
      return addressCustomer._id !== address._id;
    });

    const params = {
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      customerId: this.customer.customerId,
      customerAdresses: this.customer.customerAdresses,
    };

    this.configService.updateCustomer(params).subscribe((data: any) => {
      if (data.success === 1) {
        this.customer = data.response;
        this.setStoreCustomer(data.response);
        this.closeModal();
      } else {
        console.log('error');
        this.closeModal();
        return;
      }
    });
  }

  ngOnDestroy(): void {
    this.storeSubs$.unsubscribe();
  }
}

export const style = {
  base: {
    fontSize: '15px',
    fontWeight: 500,
    '::placeholder': {
      color: '#afafaf',
    },
  },
  invalid: {
    color: '#fa755a',
    iconColor: '#fa755a',
  },
};

@Component({
  selector: 'dialog-add-payment-method',
  templateUrl: 'dialog-add-payment-method.html',
  styleUrls: ['./add-payment-method.component.scss'],
  providers: [MatSnackBar]
})
export class DialogAddPaymentMethod implements OnInit, OnDestroy {
  stripe;
  card;
  cardErrors;
  customer: any;
  paymentMethods: any[];
  customerPaymentMethods: any[];
  storeInformation: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  addPaymentMethodClicked = false;
  defaultPaymentMethod = '';

  storeSub$ = new Subscription();

  constructor(
    public configService: ConfigService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<DialogAddPaymentMethod>,
    private store: Store<{
      storeInformation: [];
      cart: [];
      customer: [];
      favorites: [];
    }>
  ) {
    this.storeSub$ = store.subscribe((state: any) => {
      const data = state.cartShop;
      this.customer = data.customer;
      this.storeInformation = data.storeInformation;
      this.paymentMethods = data.paymentMethods;
      this.defaultPaymentMethod = data.customerDefaultPaymentMethod;
    });
  }

  ngOnInit() {
    this.stripe = Stripe('pk_test_TTF68ceJV8AKZCuq3ho4vrjY00iIHqHUZO', {
      stripeAccount: environment.stripe_account
    });
    const elements = this.stripe.elements();
    this.card = elements.create('card', { style });
    this.card.mount('#card-element');
    this.card.addEventListener('change', (event) => {
      const displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });
  }

  getAccountIntegrationId = () => {
    return this.storeInformation.integrations.find((integration) => {
      return integration.name === 'STRIPE';
    });
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 5000,
      panelClass: [status === 1 ? 'green-snackbar' : 'rebar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

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

  async saveCard(e) {
    this.addPaymentMethodClicked = true;
    e.preventDefault();
    try {
      const response = await this.stripe.createPaymentMethod({
        type: 'card',
        card: this.card,
        billing_details: {
          name: this.customer.customerFirstName + ' ' + this.customer.customerLastName,
        },
      });
      const paymentMethod: any = await this.configService.addCustomerPaymentMethod({
        storeId: this.storeInformation.storeId,
        customerId: this.customer.customerId,
        paymentMethodId: response.paymentMethod.id,
        merchantId: this.storeInformation.merchantId,
        paymentProcessor: 'STRIPE'
      }).then((data: any) => {
        if (data.success === 0) {
          this.openSnackBar(data.message, 2);
          this.dialogRef.close();
        } else {
          this.getPaymentMethods();
        }
      });

      this.store.dispatch(new SetPaymentMethods([...this.paymentMethods, paymentMethod.data]));
      const defaultExists = !!this.defaultPaymentMethod;
      if (!defaultExists) {
        this.configService
          .updateCustomer({
            customerId: this.customer.customerId,
            customerDefaultPaymentMethod: response.paymentMethod.id,
          })
          .subscribe((data: any) => {
            if (data.success === 0) {
              this.openSnackBar(data.message, 2);
            } else {
              this.store.dispatch(new SetDefaultPaymentMethod(response.paymentMethod.id));
            }
          });
      }
      this.dialogRef.close();
    } catch (err) {
      this.dialogRef.close();
    }
  }

  ngOnDestroy(): void {
    this.storeSub$.unsubscribe();
  }
}
