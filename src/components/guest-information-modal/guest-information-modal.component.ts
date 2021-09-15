import { Component, Inject, EventEmitter, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { CountryISO, SearchCountryField, TooltipLabel } from 'ngx-intl-tel-input';
import { ConfigService } from '../../services/config.service';
import { SetTemporalCustomer, SetTemporalCustomerPhoneDetails } from 'src/store/actions';
import { filter, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UIService } from 'src/services/ui.service';

@Component({
  selector: 'app-guest-information-modal',
  templateUrl: './guest-information-modal.component.html',
  styleUrls: ['./guest-information-modal.component.scss']
})
export class GuestInformationModalComponent implements AfterViewInit {

  storeInformation: any;
  guestFirstname: string = '';
  guestLastname: string = '';
  guestEmail: string = '';
  guestPhone: any = {};

  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];


  constructor(
    public dialogRef: MatDialogRef<GuestInformationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private configService: ConfigService,
    private store: Store,
    private router: Router,
    private uiService: UIService
  ) {
    this.storeInformation = data.storeInformation;
    // @ts-ignore
    store.pipe(select('cartShop')).pipe(
      map((data: any) => {
        this.guestFirstname = data.temporalCustomer.customerFirstName || '';
        this.guestLastname = data.temporalCustomer.customerLastName || '';
        this.guestEmail = data.temporalCustomer.customerEmail || '';
        this.guestPhone.e164Number = data.temporalCustomer.customerMobile || ''
      })
    ).subscribe();
    this.store.subscribe();
  }

  ngAfterViewInit() {
    this.uiService.materialInputEventListener();
  }

  beginOrder() {
    const params = {
      customerFirstName: this.guestFirstname,
      customerLastName: this.guestLastname,
      customerEmail: this.guestEmail,
      customerMobile: this.guestPhone.e164Number,
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
      customerPhoneCode: this.guestPhone.dialCode,
      customerMobile: this.guestPhone.e164Number,
      customerISOCode: this.guestPhone.countryCode,
    }
    this.configService.dineInTemporalSignup(params).subscribe(
      (data: any) => {
        if (data.success === 1) {
          this.dialogRef.close({
            customerFirstName: this.guestFirstname,
            customerLastName: this.guestLastname,
            customerEmail: this.guestEmail,
            customerMobile: this.guestPhone.e164Number,
          });
          this.store.dispatch(new SetTemporalCustomer(data.response));
          this.store.dispatch(new SetTemporalCustomerPhoneDetails(payload));
        }
      },
      (error) => console.log(error)
    );
  }

  setPhoneNumber(ev) {
    this.guestPhone = ev;
  }

  goToLoginAndCloseModal(path: 'signin' | 'signup') {
    this.dialogRef.close();
    this.router.navigate([path]);
  }
}
