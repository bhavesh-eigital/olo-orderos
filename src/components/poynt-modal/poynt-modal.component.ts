import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PoyntService } from '../../services/poynt.service';
import { Store } from '@ngrx/store';
import { ConfigService } from '../../services/config.service';
import { UIService } from '../../services/ui.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-poynt-modal',
  templateUrl: './poynt-modal.component.html',
  styleUrls: ['./poynt-modal.component.scss']
})
export class PoyntModalComponent implements AfterViewInit, OnDestroy {

  customer: any;
  storeInformation: any;
  paymentMethods: any;
  defaultPaymentMethod: any;

  error: string;

  constructor(
    private dialogRef: MatDialogRef<PoyntModalComponent>,
    private poyntService: PoyntService,
    private configService: ConfigService,
    private uiService: UIService,
    private router: Router,
    private store: Store<{
      storeInformation: [];
      cart: [];
      customer: [];
      favorites: [];
    }>
  ) {
    store.subscribe((state: any) => {
      const data = state.cartShop;
      this.customer = data.customer;
      this.storeInformation = data.storeInformation;
      this.paymentMethods = data.paymentMethods;
      this.defaultPaymentMethod = data.customerDefaultPaymentMethod;
    });
  }


  ngAfterViewInit() {
    this.poyntService.createPoyntScript(
      "poyntModal",
      this.storeInformation,
      this.onReady,
      this.onGetNonce,
      this.onError,
      this.customer
    );
  }

  addPayment() {
    this.poyntService.getNonce();
  }

  close(paymentMethod?) {
    this.dialogRef.close(paymentMethod);
  }

  onReady = (ev: any) => console.log(ev);

  onGetNonce = (ev: any) => {
    console.log(ev);
    if (ev) {
      this.saveCard(ev);
    } else {
      this.uiService.openSnackBar(this.error, 2);
    }
  }

  onError = (ev: any) => {
    this.error = ev?.data?.error?.message?.message
    if (ev?.data?.error?.source === 'submit') {
      this.uiService.openSnackBar(this.error, 2);
    }
    console.log(ev);
  };


  saveCard(ev) {

    this.configService.addCustomerPaymentMethod({
      customerId: this.customer.customerId,
      cardToken: ev.data.nonce,
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      paymentProcessor: 'POYNT'
    }).then((response: any) => {

      console.log(response);

      if (response.success === 0) {
        this.dialogRef.close();
        this.uiService.openSnackBar(response.message, 2);
      } else {
        this.dialogRef.close(response.response);
      }
    });

  }

  ngOnDestroy() {
    if (!this.router.url.includes('order-summary')) {
      this.poyntService.destroyPoyntScript();
    }
  }
}
