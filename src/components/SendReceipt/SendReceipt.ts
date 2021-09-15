import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatAccordion} from '@angular/material/expansion';
import {CountryISO, SearchCountryField, TooltipLabel} from 'ngx-intl-tel-input';
import {Store} from '@ngrx/store';
import {ConfigService} from '../../services/config.service';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'SendReceipt',
  templateUrl: './SendReceipt.html',
  styleUrls: ['./SendReceipt.scss'],
  providers: [MatSnackBar]
})
export class SendReceipt implements OnInit {
  numberPhone: any;
  email: any;
  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  storeInformation: any;
  error: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  @ViewChild(MatAccordion) accordion: MatAccordion;

  constructor(
    private configService: ConfigService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public orderSelected,
    private store: Store<{ storeInformation: []; cart: []; customer: []; placedOrders: [] }>,
  ) {
    store.subscribe((state: any) => {
      const data = state.cartShop;
      this.storeInformation = data.storeInformation;
    });
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

  sendReceiptMobileResponsive = () => {
    const paramsMobile = {
      orderId: this.orderSelected.orderSelected.orderId,
      mobile: this.numberPhone.e164Number,
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId
    };

    this.configService.sendReceipt(paramsMobile).subscribe(
      (data: any) => {
        if (data.success === 1) {
          this.openSnackBar(data.message, 1);
        } else {
          this.openSnackBar(data.message, 0);
        }
      },
      (error) => (this.error = error)
    );
  }

  sendReceipt = () => {
    const paramsEmail = {
      orderId: this.orderSelected.orderSelected.orderId,
      email: this.email,
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId
    };

    this.configService.sendReceipt(paramsEmail).subscribe(
      (data: any) => {
        if (data.success === 1) {
          this.openSnackBar(data.message, 1);
        } else {
          this.openSnackBar(data.message, 0);
        }
      },
      (error) => (this.error = error)
    );
  }

}
