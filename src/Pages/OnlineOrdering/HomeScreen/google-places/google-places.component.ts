import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
// @ts-ignore
import { } from '@types/googlemaps';
import { tap } from 'rxjs/operators';
import { ConfigService } from '../../../../services/config.service';

@Component({
  selector: 'AutocompleteComponent',
  styleUrls: ['../home.component.scss'],
  template: `
    <input class="input-search"
           type="text"
           [(ngModel)]="autocompleteInput"
           #addresstext style="padding: 12px 20px; border: 1px solid #ccc;"
    >
  `,
})
export class AutoCompleteComponent implements OnInit, AfterViewInit {
  @Input() adressType: string;
  @Output() setAddress: EventEmitter<any> = new EventEmitter();
  @ViewChild('addresstext') addresstext: any;

  autocompleteInput: string;
  queryWait: boolean;

  constructor(public configService: ConfigService) {
    this.configService.getCurrentLocation$.pipe(
      tap(() => {
        this.getLocation();
      })
    ).subscribe();
  }

  ngOnInit() {
    this.getLocation();
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
      this.invokeEvent(place);
    });
  }

  invokeEvent(place: any) {
    this.setAddress.emit(place);
  }


  getLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const longitude = position.coords.longitude;
        const latitude = position.coords.latitude;
        this.configService.getAddressByLocation(latitude + ',' + longitude)
          .subscribe((data: any) => {
            this.addresstext = data.results[0];
            this.autocompleteInput = data.results[0].formatted_address;
            this.invokeEvent(this.addresstext);
          });
      });
    } else {
      console.log('No support for geolocation');
    }
  }
}
