import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { CountryISO, SearchCountryField, TooltipLabel } from 'ngx-intl-tel-input';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ConfigService } from 'src/services/config.service';
import { UIService } from 'src/services/ui.service';
import { SetCustomer, SetFavorites } from 'src/store/actions';
import * as LocalizedFormat from 'dayjs/plugin/localizedFormat';
import * as isoWeek from 'dayjs/plugin/isoWeek';
import * as moment from 'dayjs';
moment.extend(LocalizedFormat)
moment.extend(isoWeek);

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, AfterViewInit {

  configUrl = environment.globalUrlApi;

  email: string = '';
  password: string = '';

  passwordShown = false;

  open = false;
  currentTab = 0;

  customer: any;
  storeInformation: any;

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  error;

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

  temporalCustomer;

  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];

  currentPasswordFormControl = new FormControl('', [
    Validators.required,
    PasswordValidator.strong,
    Validators.minLength(7),
  ]);

  typeOfOrder = 0;
  agreeToTheTerms = true;

  constructor(
    private store: Store,
    private router: Router,
    private configService: ConfigService,
    private snackBar: MatSnackBar,
    private uiService: UIService
  ) {
    // @ts-ignore
    store.pipe(select('cartShop')).pipe(
      map((data: any) => {
        this.customer = data.customer;
        this.storeInformation = data.storeInformation;
      })
    ).subscribe();

    if (this.customer.length !== 0) {
      this.router.navigate(['dinein']);
    }
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.selectOrderType(0);
    this.uiService.materialInputEventListener();
  }

  selectOrderType(typeNumber: number) {
    if (typeNumber === 0) {
      this.typeOfOrder = typeNumber;
      localStorage.setItem('orderType', '4');
    } else {
      this.typeOfOrder = typeNumber;
      localStorage.setItem('orderType', '2');
    }
  }


  register() {
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
          customerCountry: '',
          customerZip: this.newCustomer.customerZip
        }
      ]
    };

    this.configService.dineInSignup(params).subscribe(
      (data: any) => {
        if (data.success === 1) {
          localStorage.token = data.accessToken;
          this.customer = data.response;
          if (localStorage.orderType == '1') {
            localStorage.removeItem('tableNumber');
          }
          this.setStoreCustomer(data.response);
          this.openSnackBar('Login Complete', 1);
          localStorage.setItem("expirationDate", JSON.stringify(moment().add(2, 'days').unix()))
          this.getFavorites();
        } else {
          this.openSnackBar(data.message, 2);
        }
      },
      (error) => {
        this.error = error;
        console.log(error);
      }
    );
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 5000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  setStoreCustomer(currentCustomer) {
    this.store.dispatch(new SetCustomer(currentCustomer));
  }

  getFavorites = () => {
    this.configService
      .getCustomerFavoritesProducts(this.storeInformation.storeId, this.storeInformation.merchantId, this.customer.customerId)
      .subscribe((data: any) => {
        this.setFavoritesCustomer(data.response.customerFavoriteProducts);
        if (localStorage.orderType == '2') {
          this.router.navigate(['home']);
        } else {
          this.router.navigate(['dinein']);
        }
      });
  }

  setFavoritesCustomer(currentFavorites) {
    this.store.dispatch(new SetFavorites(currentFavorites));
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
