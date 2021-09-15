import {Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Router} from '@angular/router';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';
import {ConfigService} from '../../../services/config.service';
import {SetCustomer} from '../../../store/actions';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})
export class VerifyForgetComponent implements OnInit {
  storeInformation: any;
  customerMobile = localStorage.getItem('customerMobile');
  codeSent = false;
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
    this.verifyCode(this.customerMobile,
      (this.code1.toString()));
  }

  goBack() {
    this.router.navigate(['home']);
  }

  verifyCode = (customerMobile, otp) => {
    const params = {
      customerMobile,
      otp
    };
    this.configService.verifyOTP(params).subscribe((data: any) => {
      if (data.success === 0) {
        this.openSnackBar(data.message, 2);
      } else {
        this.setStoreCustomer(data.response);
        this.openSnackBar(data.message, 1);
        this.router.navigate(['reset']);
      }
    });
  }

  reSendCode = () => {
    const params = {
      customerMobile: this.customerMobile
    };
    this.configService.sendOTP(params)
      .subscribe((data: any) => {
        this.openSnackBar(data.message, 1);
      });
  }
}
