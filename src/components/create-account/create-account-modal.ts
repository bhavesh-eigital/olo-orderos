import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { CountryISO, SearchCountryField, TooltipLabel } from 'ngx-intl-tel-input';
import { select, Store } from '@ngrx/store';
import { ConfigService } from '../../services/config.service';
import { Router } from '@angular/router';
import { SetCustomer, SetDefaultAddress } from '../../store/actions';

@Component({
  selector: 'curbsideModal',
  templateUrl: './create-account-modal.html',
  styleUrls: ['./create-account-modal.scss'],
  providers: [MatSnackBar]
})
export class CreateAccountModal implements OnInit, AfterViewInit {
  @ViewChild('addresstext') addresstext: any;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  onPressNext: any;
  code1: any;
  tFormGroup: FormGroup;
  indexStepper = 0;


  addressName: any = '';
  address: any = '';
  secondAddress: any = '';
  country: any = '';
  city: any = '';
  state: any = '';
  postalCode: any = '';
  mobile: any;
  deliveryNote: any = '';
  isDefault = false;
  cart: any;
  storeInformation: any;
  isAddressEditable = true;
  customer: any;
  newMobilePhone: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(
    private store: Store<{ storeInformation: []; cart: []; customer: []; favorites: [] }>,
    private dialogRef: MatDialogRef<CreateAccountModal>,
    public configService: ConfigService,
    private router: Router,
    private snackBar: MatSnackBar,
    // tslint:disable-next-line:variable-name
    private _formBuilder: FormBuilder
  ) {
    // @ts-ignore
    store.pipe(select('cartShop'))
      .subscribe((data: any) => (this.cart = data.cart, this.storeInformation = data.storeInformation, this.customer = data.customer));
  }

  ngAfterViewInit() {
    this.getPlaceAutocomplete();
  }

  ngOnInit(): void {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
    this.tFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });

    if ((this.customer.customerMobile === '' || this.customer.customerMobile === null) && this.customer.customerAdresses.length !== 0) {
      this.isAddressEditable = false;
      this.indexStepper = 1;
    }


    if (this.customer.isVerified === false) {
      if (this.customer.customerAdresses.length !== 0) {
        this.isAddressEditable = false;
        this.indexStepper = 1;
      } else {
        this.indexStepper = 0;
        this.isAddressEditable = true;
      }
    }
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

  private getPlaceAutocomplete() {
    const autocomplete = new google.maps.places.Autocomplete(this.addresstext.nativeElement,
      {
        componentRestrictions: { country: 'US' },
        types: ['geocode']  // 'establishment' / 'address' / 'geocode'
      });
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      const place = autocomplete.getPlace();
      this.address = place.formatted_address;
      this.postalCode = this.getPostCode(place);
      this.city = this.getCity(place);
      this.country = this.getCountryShort(place);
      this.state = this.getState(place);
    });
  }

  closeModal() {
    this.dialogRef.close();
  }

  cancel() {
  }

  setStoreCustomer(currentCustomer) {
    this.store.dispatch(new SetCustomer(currentCustomer));
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 5000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  sendNumberForVerification = () => {
    const params = {
      customerId: this.customer.customerId
    };
    this.configService.sendOTP(params)
      .subscribe((data: any) => {
        console.log('send number');
        this.indexStepper = 2;
      });
  }

  verify() {
    this.verifyCode(this.customer.customerId,
      (this.code1.toString()));
  }

  verifyCode = (customerId, otp) => {
    const params = {
      customerId,
      otp
    };
    this.configService.verifyOTP(params).subscribe((data: any) => {
      if (data.success === 0) {
        this.openSnackBar(data.message, 2);
      } else {
        this.setStoreCustomer(data.response);
        this.openSnackBar(data.message, 1);
        this.closeModal();
        this.router.navigate(['home']);
      }
    });
  }

  reSendCode() {
    this.sendNumberForVerification();
  }

  updatePhoneNumberCustomer = () => {
    if (this.newMobilePhone !== null) {
      const params = {
        storeId: this.storeInformation.storeId,
        merchantId: this.storeInformation.merchantId,
        customerId: this.customer.customerId,
        customerMobile: this.newMobilePhone.e164Number,
      };

      this.configService.updateCustomer(params).subscribe((data: any) => {
        if (data.success === 1) {
          this.customer = data.response;
          this.setStoreCustomer(this.customer);
          this.sendNumberForVerification();
          this.indexStepper = 2;
        } else {
          this.openSnackBar(data.message, 0);
          return;
        }
      });
    } else {
      this.openSnackBar('Please complete the information', 0);
    }
  }

  setDefaultAddress = (address) => {
    this.store.dispatch(new SetDefaultAddress(address));
  }

  getCurrentAddressDefault = (addressId) => {
    const addressDefault = this.customer.customerAdresses.find((address) => {
      return address._id === addressId;
    });
    return addressDefault === undefined ? '' : addressDefault;
  }


  saveAddressCustomer = () => {

    const validateFields = (
      this.addressName.length > 2 &&
      this.address.length > 5 &&
      this.city.length > 2 &&
      this.state.length <= 2 &&
      this.postalCode.length > 2);


    if (validateFields === true) {

      const currentAddresses = this.customer.customerAdresses;
      currentAddresses.push({
        customerAddressName: this.addressName,
        customerAddress1: this.address,
        customerAddress2: this.secondAddress,
        customerCity: this.city,
        customerState: this.state,
        customerCountry: this.country,
        customerZip: this.postalCode,
        customerMobile: '',
        deliveryInstructions: this.deliveryNote,
        isDefault: true
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
          this.setDefaultAddress(this.getCurrentAddressDefault(this.customer.customerAdresses[0]._id));
          this.indexStepper = 1;
          this.isAddressEditable = !this.isAddressEditable;
        } else {
          console.log('error');
          return;
        }
      });
    } else {
      this.openSnackBar('Please complete all the fields', 2);
    }
  }
}
