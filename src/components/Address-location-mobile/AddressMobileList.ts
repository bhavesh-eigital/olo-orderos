import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {SetCustomer, SetDefaultAddress} from '../../store/actions';
import {ConfigService} from '../../services/config.service';

/**
 * @title Injecting data when opening a dialog
 */
@Component({
  selector: 'AddressMobileList',
  templateUrl: 'AddressMobileList.html',
  styleUrls: ['./AddressMobileList.scss'],
})


export class AddressMobileList implements AfterViewInit {
  @ViewChild('addresstext') addresstext: any;
  customer: any;
  customerDefaultAddress: any;
  address: any;
  postalCode: any;
  city: any;
  country: any;
  state: any;
  streetNumber: any;

  constructor(
    public dialog: MatDialog,
    public configService: ConfigService,
    private store: Store<{ storeInformation: []; cart: []; customer: [] }>) {
    store.subscribe((state: any) => {
      const data = state.cartShop;
      this.customer = data.customer;
      this.customerDefaultAddress = data.customerDefaultAddress;
    });
  }

  ngAfterViewInit() {
    this.getPlaceAutocomplete();
  }

  setStoreCustomer(currentCustomer) {
    this.store.dispatch(new SetCustomer(currentCustomer));
  }

  setDefaultAddress = (address) => {
    this.configService
      .updateCustomer({
        customerId: this.customer.customerId,
        customerDefaultAddressId: address._id,
      }).subscribe((data: any) => {
      if (data.success === 1) {
        localStorage.temporalDefaultAddress = '';
        localStorage.temporalDefaultAddress = '';
        this.setStoreCustomer(data.response);
        this.store.dispatch(new SetDefaultAddress(address));
        this.dialog.closeAll();
        window.location.reload();
      } else {
        console.log(data.message);
      }
    });
  }

  private getPlaceAutocomplete() {
    const autocomplete = new google.maps.places.Autocomplete(this.addresstext.nativeElement,
      {
        componentRestrictions: {country: 'US'},
        types: ['address']  // 'establishment' / 'address' / 'geocode'
      });
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      const place = autocomplete.getPlace();
      this.address = this.getStreetNumber(place) + ' ' + this.getStreet(place);
      this.postalCode = this.getPostCode(place);
      this.city = this.getCity(place);
      this.country = this.getCountryShort(place);
      this.state = this.getState(place);
      this.streetNumber = this.getStreetNumber(place);

      localStorage.temporalDefaultAddress = JSON.stringify({
        customerAddress1: this.address,
        customerCity: this.city,
        customerState: this.state,
        customerCountry: this.country,
        customerZip: this.postalCode,
      });
      this.dialog.closeAll();
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
    const COMPONENT_TEMPLATE = {street_number: 'short_name'};
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getStreet(place) {
    const COMPONENT_TEMPLATE = {route: 'long_name'};
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getCity(place) {
    const COMPONENT_TEMPLATE = {locality: 'long_name'};
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getState(place) {
    const COMPONENT_TEMPLATE = {administrative_area_level_1: 'short_name'};
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getDistrict(place) {
    const COMPONENT_TEMPLATE = {administrative_area_level_2: 'short_name'};
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getCountryShort(place) {
    const COMPONENT_TEMPLATE = {country: 'short_name'};
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getCountry(place) {
    const COMPONENT_TEMPLATE = {country: 'long_name'};
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getPostCode(place) {
    const COMPONENT_TEMPLATE = {postal_code: 'long_name'};
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getPhone(place) {
    const COMPONENT_TEMPLATE = {formatted_phone_number: 'formatted_phone_number'};
    return this.getAddrComponent(place, COMPONENT_TEMPLATE);
  }

  getLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const longitude = position.coords.longitude;
        const latitude = position.coords.latitude;
        this.configService.getAddressByLocation(latitude + ',' + longitude)
          .subscribe((data: any) => {
            const place = data.results[0];
            this.address = this.getStreetNumber(place) + ' ' + this.getStreet(place);
            this.postalCode = this.getPostCode(place);
            this.city = this.getCity(place);
            this.country = this.getCountryShort(place);
            this.state = this.getState(place);
            this.streetNumber = this.getStreetNumber(place);

            localStorage.temporalDefaultAddress = JSON.stringify({
              customerAddressName: '',
              customerAddress1: this.address,
              customerAddress2: '',
              customerCity: this.city,
              customerState: this.state,
              customerCountry: this.country,
              customerZip: this.postalCode,
            });
          });
      });
    } else {
      console.log('No support for geolocation');
    }
  }

}
