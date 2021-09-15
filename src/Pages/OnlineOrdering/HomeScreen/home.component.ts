import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { CountryISO, SearchCountryField, TooltipLabel } from 'ngx-intl-tel-input';
import { FormBuilder } from '@angular/forms';
import { ConfigService } from '../../../services/config.service';
import { SetCustomer } from '../../../store/actions';
import { findSetting } from 'src/utils/FindSetting';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [ConfigService, MatSnackBar],
})
export class HomeScreenComponent implements OnInit, OnDestroy {

  address: any;
  establishmentAddress: any;
  formattedAddress: string;
  formattedEstablishmentAddress: string;
  phone: string;
  innerWidth = 0;

  orderTypeDelivery = 'true';
  orderTypePickup = 'true';
  orderTypeCurbside = 'true';

  customerSub$ = new Subscription();
  storeInfoSub$ = new Subscription();

  constructor(
    public configService: ConfigService,
    private router: Router,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    public zone: NgZone,
    private store: Store<{ storeInformation: []; cart: [], customer: [] }>,
  ) {
    // @ts-ignore
    this.customerSub$ = store.pipe(select('cartShop')).subscribe((data) => (this.customer = data.customer));
    // @ts-ignore
    this.storeInfoSub$ = store.pipe(select('cartShop')).subscribe((data) => (this.storeInformation = data.storeInformation, this.getOrderTypeSettings()));

    if (this.customer.length !== 0) {
      this.router.navigate(['home']);
    }
  }

  addressDefault: any;
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
  categorySelected: string;
  currentOrderType: any;
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


  ngOnInit(): void {
    if (localStorage.getItem('orderType') === null) {
      localStorage.setItem('orderType', '1');
      this.currentOrderType = parseInt(localStorage.getItem('orderType'), 10);
    } else {
      this.currentOrderType = parseInt(localStorage.getItem('orderType'), 10);
    }
    if (this.currentOrderType === 2 || this.currentOrderType === 3) {
      this.router.navigate(['home']);
    }
  }

  setStoreCustomer(currentCustomer) {
    this.store.dispatch(new SetCustomer(currentCustomer));
  }

  redirect() {
    this.router.navigate(['home']);
  }

  redirectLogin() {
    localStorage.setItem('orderType', '2');
    this.router.navigate(['login']);
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 5000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  goBack() {
    this.router.navigate(['home']);
  }

  orderTypeSelected(orderType) {
    this.currentOrderType = orderType;
    localStorage.setItem('orderType', orderType);
    if (orderType === 2 || orderType === 3) {
      this.router.navigate(['home']);
    }
  }


  getAddress(place: any) {
    this.address = place.formatted_address;
    this.phone = this.getPhone(place);
    this.formattedAddress = place.formatted_address;
    this.zone.run(() => this.formattedAddress = place.formatted_address);
    this.addressDefault = {
      place,
      customerAddress1: this.getStreetNumber(place) + ' ' + this.getStreet(place),
      number: this.getStreetNumber(place),
      street: this.getStreet(place),
      city: this.getCity(place),
      postalCode: this.getPostCode(place),
      country: this.getCountryShort(place)
    };
  }

  getEstablishmentAddress(place: any) {
    this.establishmentAddress = place.formatted_address;
    this.phone = this.getPhone(place);
    this.formattedEstablishmentAddress = place.formatted_address;
    this.zone.run(() => {
      this.formattedEstablishmentAddress = place.formatted_address;
      this.phone = place.formatted_phone_number;
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

  saveAddressDefault = () => {
    if (this.currentOrderType === 1) {
      if (!this.addressDefault) {
        this.openSnackBar('You should enter your location', 2);
        return;
      }
      this.configService.getDeliveryDistance(this.storeInformation.storeId, this.addressDefault.customerAddress1, this.addressDefault.customerCity)
        .subscribe((data: any) => {
          if (data.inRange === true) {
            localStorage.temporalDefaultAddress = JSON.stringify(this.addressDefault);
            this.router.navigate(['home']);
          } else {
            this.openSnackBar('The address is not in the delivery range, please choose another address.', 1);
          }
        });
    } else {
      this.router.navigate(['home']);
    }
  }


  getOrderTypeSettings() {
    this.orderTypeDelivery = findSetting(this.storeInformation, 'OnlineStoreDelivery');
    this.orderTypePickup = findSetting(this.storeInformation, 'OnlineStorePickUp');
    this.orderTypeCurbside = findSetting(this.storeInformation, 'OnlineStoreCurbsidePickUp');
    if (this.storeInformation.length !== 0 && this.orderTypeDelivery === 'false') {
      this.router.navigate(['home']);
      localStorage.setItem('orderType', '2');
    }
  }

  ngOnDestroy() {
    this.storeInfoSub$.unsubscribe();
    this.customerSub$.unsubscribe();
  }

}

