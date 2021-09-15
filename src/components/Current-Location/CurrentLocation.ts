import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import {ConfigService} from '../../services/config.service';
import {Store} from '@ngrx/store';
import {SetCustomer, SetDefaultAddress} from '../../store/actions';
import {UIService} from 'src/services/ui.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'Current-Location',
  templateUrl: './Current-Location.html',
  styleUrls: ['./Current-Location.scss'],
  host: {
    '(document:click)': 'onClick($event)'
  }
})
export class CurrentLocation implements OnInit, AfterViewInit {
  @ViewChild('addresstext') addresstext: any;
  @Output() customerDefaultAddressEmit = new EventEmitter<any>();
  isChangeLocation = false;
  customer: any;
  customerDefaultAddress: any;
  addressName: any = '';
  address: any = '';
  secondAddress: any = '';
  country: any = '';
  city: any = '';
  state: any = '';
  streetNumber: any = '';
  postalCode: any = '';
  map: google.maps.Map;
  infoWindow: google.maps.InfoWindow;
  addressSelected: any;
  innerWidth = 0;
  locationLabel = 'Select Location';

  @ViewChild('menu') menu: ElementRef<HTMLDivElement>;

  constructor(
    public configService: ConfigService,
    private store: Store<{ storeInformation: []; cart: []; customer: [] }>,
    private renderer: Renderer2,
    private _eref: ElementRef,
    private uiService: UIService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    store.subscribe((state: any) => {
      const data = state.cartShop;
      this.customer = data.customer;
      this.customerDefaultAddress = data.customerDefaultAddress;
      this.addressSelected = this.customerDefaultAddress;
    });
  }

  ngAfterViewInit() {
    this.getDefaultAddress();
    this.onResize();
    this.getPlaceAutocomplete();
    this.toggleMenu();
    this.uiService.materialInputEventListener();
  }

  ngOnInit(): void {
  }

  handleLocationError(
    browserHasGeolocation: boolean,
    infoWindow: google.maps.InfoWindow,
    pos: google.maps.LatLng
  ) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? 'Error: The Geolocation service failed.'
        : 'Error: Your browser doesn\'t support geolocation.'
    );
    infoWindow.open(this.map);
  }


  searchLocation = () => {
    this.isChangeLocation = true;
    this.toggleMenu();
  }

  toggleMenu() {
    if (this.isChangeLocation) {
      this.renderer.removeClass(this.menu.nativeElement, 'closeMenu');
      this.renderer.addClass(this.menu.nativeElement, 'openMenu');
    } else {
      this.renderer.addClass(this.menu.nativeElement, 'closeMenu');
      this.renderer.removeClass(this.menu.nativeElement, 'openMenu');
    }
  }

  onClick(event) {
    if (!this._eref.nativeElement.contains(event.target) && this.isChangeLocation) {
      this.isChangeLocation = !this.isChangeLocation;
      this.toggleMenu();
    }
  }

  @HostListener('document: keyup.escape', ['$event'])
  onEsc() {
    if (this.isChangeLocation) {
      this.isChangeLocation = !this.isChangeLocation;
      this.toggleMenu();
    }
  }

  @HostListener('window: resize', ['$event'])
  onResize() {
    this.innerWidth = window.innerWidth;
  }

  getDefaultAddress = () => {
    if (localStorage.temporalDefaultAddress !== undefined) {
      if (localStorage.temporalDefaultAddress.length > 0) {
        this.addressSelected = JSON.parse(localStorage.temporalDefaultAddress).customerAddress1;
        this.locationLabel = JSON.parse(localStorage.temporalDefaultAddress).customerAddress1;
      } else {
        if (this.customerDefaultAddress !== '') {
          this.locationLabel = this.customerDefaultAddress.customerAddress1;
        } else {
          this.locationLabel = 'Select Location'
        }
      }
    } else if (this.customerDefaultAddress !== '') {
      this.locationLabel = this.customerDefaultAddress.customerAddress1;
    } else {
      this.locationLabel = 'Select Location'
    }

    this.changeDetectorRef.detectChanges(); 
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
          this.store.dispatch(new SetDefaultAddress(address));
          this.emitNewLocation(address);
          this.isChangeLocation = !this.isChangeLocation;
          localStorage.temporalDefaultAddress = '';
          this.setStoreCustomer(data.response);
          this.addressSelected = address;
          // this.locationLabel = this.addressSelected
          this.isChangeLocation = false;
          this.toggleMenu();
        } else {
          this.addressSelected = this.customerDefaultAddress;
          // this.locationLabel = this.addressSelected
        }

        this.getDefaultAddress();
      });
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

      localStorage.temporalDefaultAddress = JSON.stringify({
        customerAddressName: this.addressName,
        customerAddress1: this.address,
        customerAddress2: this.secondAddress,
        customerCity: this.city,
        customerState: this.state,
        customerCountry: this.country,
        customerZip: this.postalCode,
      });
      // this.searchLocation();
      this.isChangeLocation = false;
      this.toggleMenu();
      this.getDefaultAddress();
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

  cleanText() {
    this.address = '';
  }

  emitNewLocation = (address) => {
    this.customerDefaultAddressEmit.emit(address);
  }

  isChecked = (currentOption, option) => {
    return currentOption._id === option._id;
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

            if(this.address.includes('undefined')) {
              const part1 = place.formatted_address.split(',')[1];
              const part2 = place.formatted_address.split(',')[2];
              this.address = `${part1} ${part2}`;
            }

            localStorage.temporalDefaultAddress = JSON.stringify({
              customerAddressName: this.addressName,
              customerAddress1: this.address,
              customerAddress2: this.secondAddress,
              customerCity: this.city,
              customerState: this.state,
              customerCountry: this.country,
              customerZip: this.postalCode,
            });
            this.searchLocation();
            this.isChangeLocation = false;
            this.toggleMenu();
            this.getDefaultAddress();
          });
      });
    } else {
      console.log('No support for geolocation');
    }
  }
}
