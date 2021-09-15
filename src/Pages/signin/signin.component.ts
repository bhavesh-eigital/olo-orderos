import { AfterViewInit, Component, OnInit } from '@angular/core';
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
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit, AfterViewInit {

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
  typeOfOrder = 0
  OnlineStoreAllowOrderAsGuest;
  placedOrders: any;

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
        this.placedOrders = data.placedOrders;
      })
    ).subscribe();

    if (this.customer.length !== 0) {
      this.router.navigate(['dinein']);
    }
  }

  ngOnInit(): void {
    this.OnlineStoreAllowOrderAsGuest = localStorage.getItem('OnlineStoreAllowOrderAsGuest');
  }

  ngAfterViewInit() {
    this.uiService.materialInputEventListener();
    this.selectOrderType(0);
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
          let snackTitle = 'Login Complete';
          let snackStatus = 1;
          localStorage.setItem("expirationDate", JSON.stringify(moment().add(2, 'days').unix()));

          if (localStorage.orderType == '2') {
            if (!this.placedOrders || !this.placedOrders.length) {
              localStorage.removeItem('tableNumber');
            } else {
              localStorage.setItem('orderType', '4');
              snackTitle = 'You must pay your orders before leaving dinein';
              snackStatus = 2;
            }

          }
          this.openSnackBar(snackTitle, snackStatus);
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

  selectOrderType(typeNumber: number) {
    if (typeNumber === 0) {
      this.typeOfOrder = typeNumber;
      localStorage.setItem('orderType', '4');
    } else {
      this.typeOfOrder = typeNumber;
      localStorage.setItem('orderType', '2');
    }
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

  redirectForgetPassword() {
    this.router.navigate(['forgetPassword']);
  }

  getOrCondition() {
    if (this.typeOfOrder) {
      return true;
    } else if (!this.typeOfOrder) {
      if (this.OnlineStoreAllowOrderAsGuest === 'false') {
        return false;
      }
      return true;
    }
  }

}
