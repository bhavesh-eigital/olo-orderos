import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { ConfigService } from '../../../../../services/config.service';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { DialogAddPaymentMethod } from '../../customer.component';
import { DomSanitizer } from '@angular/platform-browser';
import { SetCustomer } from '../../../../../store/actions';

@Component({
  selector: 'CardConnectAddPaymentMethods',
  templateUrl: 'CardConnect.html',
  styleUrls: ['./CardConnect.scss'],
  providers: [MatSnackBar]
})
export class CardConnectAddPaymentMethods implements OnInit, AfterViewInit {

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  customer: any;
  storeInformation: any;
  paymentMethods: any;
  defaultPaymentMethod: any;
  urlLink: any;
  responseFormCard: any;
  height = 0;

  constructor(
    private sanitizer: DomSanitizer,
    public configService: ConfigService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<DialogAddPaymentMethod>,
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

  ngOnInit() {
    this.getParams();
    window.addEventListener('message', (event) => {
      const token = JSON.parse(event.data);
      this.responseFormCard = token;
    }, true);


    if (window.navigator.userAgent.indexOf('Chrome') === -1 && window.navigator.userAgent.indexOf('Safari') > -1) {
      this.height = 270;
    } else {
      this.height = 250;
    }
  }

  ngAfterViewInit() {
    this.onResize();
  }

  getParams = () => {
    const params = {
      useexpiry: true,
      usemonthnames: true,
      usecvv: true,
      cardnumbernumericonly: true,
      invalidinputevent: true,
      enhancedresponse: true,
      tokenizewheninactive: true,
      inactivityto: true,
      cardinputmaxlength: 19,
      fullmobilekeyboard: true,
      formatinput: true
    };

    const queryString = Object.keys(params).map((key) => {
      return key + '=' + params[key];
    }).join('&');
    this.urlLink = this.sanitizer
      .bypassSecurityTrustResourceUrl(encodeURI('https://boltgw.cardconnect.com:6443/itoke/ajax-tokenizer.html?' + queryString + '&css=label{font-size:18px;margin-top:10px;font-weight:400;text-transform:uppercase;font-family: Montserrat, sans-serif !important;}select{height:48px;width:110px;margin-top:8px;margin-bottom:8px;font-size:15px;border-radius:6px;border-width:1px;border-color:lightgrey;border-style:solid;font-size:18px;padding-left:10px;-moz-outline:none;outline:none}input{width: 100%;margin-top:8px;margin-bottom:8px;vertical-align:middle;font-size:18px;border-radius:6px;border-width:1px;border-color:lightgrey;border-style:solid;height:48px;padding-left:10px;box-sizing:border-box;-moz-outline:none;outline:none}input:last-child{width:80px}'));
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

  saveCard() {
    if (this.responseFormCard.errorCode === '0') {
      this.configService.addCustomerPaymentMethod({
        customerId: this.customer.customerId,
        cardToken: this.responseFormCard.token,
        storeId: this.storeInformation.storeId,
        merchantId: this.storeInformation.merchantId,
        paymentProcessor: localStorage.provider
      }).then((response: any) => {
        if (response.success === 0) {
          this.dialogRef.close();
        } else {
          this.dialogRef.close();
        }
      });
    } else {
      this.openSnackBar(this.responseFormCard.errorMessage, 2);
    }
  }

  @HostListener('window:resize')
  onResize() {
    if(window.innerWidth > 768) {
      this.height = 270;
    }
  }
}
