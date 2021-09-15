import {AfterViewInit, Component, HostListener, OnInit} from '@angular/core';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';
import {Store} from '@ngrx/store';
import {Router} from '@angular/router';
import {ConfigService} from 'src/services/config.service';
import {SetDefaultPaymentMethod, SetPaymentMethods} from 'src/store/actions';
import {getCardLogo} from '../../../utils/GetCardLogo';
import {CardConnectAddPaymentMethods} from "../../Account/Customer/AddPaymenMetods/CardConnect/CardConnect";
import {DialogAddPaymentMethod} from "../../Account/Customer/customer.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit, AfterViewInit {

  open = false;

  storeInformation: any;
  customer: any;
  cart: any;

  paymentMethods: any[];
  // customerPaymentMethods: any[];
  defaultPaymentMethod = '';
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  showTitle = true;

  constructor(
    private store: Store,
    public dialog: MatDialog,
    private configService: ConfigService,
    private snackBar: MatSnackBar,
    private snackbar: MatSnackBar,
    private router: Router
  ) {
    store.subscribe((state: any) => {
      const data = state.cartShop;
      this.customer = data.customer;
      this.storeInformation = data.storeInformation;
      this.paymentMethods = data.paymentMethods;
      this.defaultPaymentMethod = data.customerDefaultPaymentMethod;
    });
  }

  ngOnInit(): void {
    if (this.customer.length > 0) {
      this.router.navigate(['/signin']);
    }
    this.getPaymentMethods();
  }

  ngAfterViewInit() {
    this.onResize();
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 3000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  setPaymentMethod = (paymentMethods) => {
    const paymentDefault = paymentMethods.find((paymentMethod) => {
      return paymentMethod.isDefault === true;
    });
    if (paymentDefault !== undefined) {
      this.store.dispatch(new SetDefaultPaymentMethod(paymentDefault.id));
    }
  }

  setDefaultCard = (paymentMethod) => {
    if (this.defaultPaymentMethod !== paymentMethod.id) {
      this.configService
        .setDefaultPaymentMethod({
          paymentMethodId: paymentMethod.id,
          customerId: this.customer.customerId,
          merchantId: this.storeInformation.merchantId,
          storeId: this.storeInformation.storeId,
          paymentProcessor: localStorage.provider
        }).subscribe((data: any) => {
          if (data.success === 1) {
            this.store.dispatch(new SetDefaultPaymentMethod(paymentMethod.id));
            this.getPaymentMethods();
          } else {
            this.openSnackBar(data.message, 2);
          }
        });
    }
  }

  openDialog() {
    if (localStorage.provider === 'STRIPE') {
      this.dialog.open(DialogAddPaymentMethod, {
        maxWidth: '540px',
        width: '100%',
        minWidth: '320px',
      }).afterClosed().subscribe(() => {
        this.getPaymentMethods();
      });
    } else {
      this.dialog.open(CardConnectAddPaymentMethods, {
        maxWidth: '540px',
        width: '100%',
        minWidth: '320px',
      }).afterClosed().subscribe(() => {
        this.getPaymentMethods();
      });
    }
  }


  getPaymentMethods() {
    this.configService
      .getPaymentMethods(
        this.customer.customerId, this.storeInformation.storeId, this.storeInformation.merchantId, localStorage.provider)
      .subscribe((data: any) => {
        if (data.success === 1) {
          this.store.dispatch(new SetPaymentMethods(data.response));
          this.setPaymentMethod(data.response);
        } else {
          this.openSnackBar('error:' + data.message, 2);
        }
      });
  }

  returnCardLogo = (cardType) => {
    return getCardLogo(cardType);
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth < 360) {
      this.showTitle = false;
    } else {
      this.showTitle = true;
    }
  }
}
