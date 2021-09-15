import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {findSetting} from '../../utils/FindSetting';
import {MatDialog} from '@angular/material/dialog';
import {SignInModal} from '../SignIn/sigIn';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';

@Component({
  selector: 'checkout-mobile',
  templateUrl: './checkout-mobile.html',
  styleUrls: ['./checkout-mobile.scss'],
  providers: [MatDialog]
})

export class CheckoutMobile implements OnInit {

  @Input() isRefund: any;
  customer: any;
  storeInformation: any;
  cart: any;
  placedOrders: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private store: Store<{ customer: []; cart: [] }>) {
    // @ts-ignore
    store.pipe(select('cartShop'))
      .subscribe((data: any) => (
        this.customer =
          data.customer, this.cart = data.cart, this.storeInformation = data.storeInformation, this.placedOrders = data.placedOrders));
  }

  ngOnInit(): void {
  }

  isEnabled = () => {
    const pauseDineIn = findSetting(this.storeInformation, 'OnlineStoreDineInPauseOrder');
    return pauseDineIn !== 'false';
  }

  getTotalAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.totalAmount * obj.quantity);
    }, 0);
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 3000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  checkout() {
    const orderGuest = findSetting(this.storeInformation, 'OnlineStoreAllowOrderAsGuest');
    const tableNumber = localStorage.tableNumber;


    if (parseInt(tableNumber, 10) > 0) { // validate if working in dine in
      if (this.cart.length === 0 && this.placedOrders.length === 0) { // validate if no have products selected
        this.openSnackBar('No product in the Checkout', 2);
      } else {
        if ((this.customer.length === 0)) {
          this.dialog.open(SignInModal, {
            panelClass: 'login-modal'
          });
        }
      }
    }

    if (tableNumber === null || tableNumber === undefined) { // validate if working in online ordering
      if ((this.customer.length !== 0)) {
        if (this.isRefund === true) {
          this.router.navigate(['checkout-refund']);
        } else {
          this.router.navigate(['checkout']);
        }
      }

      if ((this.customer.length === 0)) {
        this.router.navigate(['login']);
      }
    }
  }

  validateCheckout = () => {
    if (parseInt(localStorage.tableNumber, 10) > 0) {
      return true;
    } else {
      if (this.cart.length === 0) {
        return false;
      } else {
        return true;
      }
    }
  }
}
