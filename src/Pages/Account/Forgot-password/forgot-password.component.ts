import {Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Router} from '@angular/router';
import {CountryISO, SearchCountryField, TooltipLabel} from 'ngx-intl-tel-input';
import {ConfigService} from '../../../services/config.service';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponentV2 implements OnInit {

  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  customerMobile: any;
  storeInformation: any;
  phoneNumber: any;
  codeSent = false;
  code: any;
  code1: any;
  code2: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(private store: Store<{ storeInformation: []; cart: [], customer: [] }>,
              private router: Router,
              private snackBar: MatSnackBar,
              public configService: ConfigService) {
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data) => (this.storeInformation = data.storeInformation));
  }

  ngOnInit(): void {

  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 5000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }


  sendOTP = () => {
    const params = {
      customerMobile: this.phoneNumber.e164Number
    };
    this.configService.sendOTP(params).subscribe((data: any) => {
      if (data.success === 1) {
        this.openSnackBar(data.message, 1);
        localStorage.setItem('customerMobile', this.phoneNumber.e164Number);
        this.router.navigate(['verify-reset']);
      } else {
        this.openSnackBar(data.message, 2);
      }
    });
  }

  goBack() {
    this.router.navigate(['login']);
  }

  goHome() {
    this.router.navigate(['home']);
  }

  goVerify() {
    this.router.navigate(['verify']);
  }
}
