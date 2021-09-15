import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { ConfigService } from '../../../services/config.service';
import { SetCustomer } from '../../../store/actions';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit {
  storeInformation: any;
  phoneNumber: any;
  codeSent = false;
  temporalCustomer = JSON.parse(localStorage.getItem('temporalCustomer'));
  code1: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(
    private store: Store<{ storeInformation: []; cart: [], customer: [], }>,
    private router: Router,
    private snackBar: MatSnackBar,
    public configService: ConfigService) {
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data) => (this.storeInformation = data.storeInformation));
    this.phoneNumber = this.temporalCustomer.customerMobile;
  }

  ngOnInit(): void {
  }

  setStoreCustomer(currentCustomer) {
    this.store.dispatch(new SetCustomer(currentCustomer));
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 5000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  submit() {
    this.codeSent = !this.codeSent;
  }

  verify() {
    this.verifyCode(this.temporalCustomer.customerId,
      (this.code1.toString()));
  }

  goBack() {
    this.router.navigate(['home']);
  }

  verifyCode = (customerId, otp) => {
    const params = {
      customerId,
      otp,
    };
    this.configService.verifyOTP(params).subscribe((otpResponse: any) => {
      if (otpResponse.success === 0) {
        this.openSnackBar(otpResponse.message, 2);
      } else {
        this.openSnackBar('Code successfully verified', 2);
        localStorage.setItem('orderType', '2');
        this.router.navigate(['login']);
      }
    });
  }

  reSendCode = () => {
    const params = {
      customerId: this.temporalCustomer.customerId
    };
    this.configService.sendOTP(params)
      .subscribe((data: any) => {
        this.openSnackBar(data.message, 1);
      });
  }
}
