import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { MatDialogRef } from '@angular/material/dialog';
import { SetCustomer, SetFavorites } from '../../store/actions';
import { CountryISO, SearchCountryField, TooltipLabel } from 'ngx-intl-tel-input';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { ConfigService } from '../../services/config.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-login',
  templateUrl: './signIn.html',
  styleUrls: ['./signIn.scss']
})
export class SignInModal implements OnInit, OnDestroy {
  constructor(
    public configService: ConfigService,
    private router: Router,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<SignInModal>,
    private store: Store<{ storeInformation: []; cart: [], customer: [] }>,
  ) {
    // @ts-ignore
    this.customerSub$ = store.pipe(select('cartShop')).subscribe((data) => (this.customer = data.customer));
    // @ts-ignore
    this.storeInfoSub$ = store.pipe(select('cartShop')).subscribe((data) => (this.storeInformation = data.storeInformation));

    if (this.customer.length !== 0) {
      this.router.navigate(['home']);
    }
  }

  customerSub$ = new Subscription();
  storeInfoSub$ = new Subscription();
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
    this.dialogRef.close();
    setTimeout(() => {
      this.router.navigate(['home']);
    }, 1000);

  }

  setEmail = (event) => {
    this.email = event.target.value;
  }

  setPassword = (event) => {
    this.password = event.target.value;
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 5000,
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
          this.customer = data.response.customer;
          localStorage.token = data.accessToken;
          this.openSnackBar('Login Complete', 1);
          this.setStoreCustomer(this.customer);
          this.getFavorites();
        } else {
          this.openSnackBar(data.message, 0);
          return;
        }
      },
      (error) => (this.error = error)
    );
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
    this.dialogRef.close();
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
          customerCountry: '',
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

  closeModal() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.customerSub$.unsubscribe();
    this.storeInfoSub$.unsubscribe();
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
