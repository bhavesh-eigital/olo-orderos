import {AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {CountryISO, SearchCountryField, TooltipLabel} from 'ngx-intl-tel-input';
import {map} from 'rxjs/operators';
import {SetCustomer, SetFavorites} from 'src/store/actions';
import {ConfigService} from '../../services/config.service';

@Component({
  selector: 'app-login-signup',
  templateUrl: './login-signup.component.html',
  styleUrls: ['./login-signup.component.scss']
})
export class LoginSignupComponent implements OnInit, AfterViewInit {

  email: string = '';
  password: string = '';

  passwordShown = false;

  open = false;
  currentTab = 0;
  showLoginForm = false;
  showSignupForm = false;

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

  @ViewChild('indicator') indicator: ElementRef;

  constructor(
    private renderer: Renderer2,
    private store: Store,
    private router: Router,
    private configService: ConfigService,
    private snackBar: MatSnackBar,
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
    this.showForm();
  }

  ngAfterViewInit() {
    this.materialInputEventListener();
  }

  switchTab(tabNumber: number) {
    if (tabNumber === 0) {
      this.renderer.removeClass(this.indicator.nativeElement, 'right');
      this.renderer.addClass(this.indicator.nativeElement, 'left');
    } else {
      this.renderer.removeClass(this.indicator.nativeElement, 'left');
      this.renderer.addClass(this.indicator.nativeElement, 'right');
    }
    this.currentTab = tabNumber;
    this.showForm();
    this.materialInputEventListener();
  }

  showForm() {
    if (!this.currentTab) {
      this.showSignupForm = false;
      this.showLoginForm = true;
    } else {
      this.showLoginForm = false;
      this.showSignupForm = true;
    }
  }

  login() {
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
          this.setStoreCustomer(data.response);
          this.openSnackBar('Login Complete', 1);
          this.getFavorites();
          this.router.navigate(['/dinein']);
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
        this.router.navigate(['dinein']);
      });
  }

  setFavoritesCustomer(currentFavorites) {
    this.store.dispatch(new SetFavorites(currentFavorites));
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

  selectOrderType(typeNumber: number) {
    if (typeNumber === 0) {
      this.typeOfOrder = typeNumber;
      localStorage.setItem('orderType', '4');
    } else {
      this.typeOfOrder = typeNumber;
      localStorage.setItem('orderType', '1');
    }
  }

  materialInputEventListener() {
    const materialInputs = document.querySelectorAll('.materialInput');
    materialInputs.forEach((input: HTMLInputElement) => {
      const label = input.previousElementSibling;
      const wrapper = input.parentElement;

      if(input.value) {
        label.classList.add('labelSizeOnInputFocus');
        wrapper.classList.add('borderColorOnInputFocus');
      }

      input.addEventListener('focus', () => {
        label.classList.add('labelSizeOnInputFocus');
        wrapper.classList.add('borderColorOnInputFocus');
      });

      input.addEventListener('blur', () => {
        if(!input.value) {
          label.classList.remove('labelSizeOnInputFocus');
        }
        wrapper.classList.remove('borderColorOnInputFocus');
      })
    });
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
