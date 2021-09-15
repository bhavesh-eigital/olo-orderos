import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ConfigService} from '../../../services/config.service';
import {SetCustomer} from '../../../store/actions';
import {select, Store} from '@ngrx/store';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition,} from '@angular/material/snack-bar';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-reset',
  templateUrl: './reset-pass.html',
  styleUrls: ['./reset-pass.component.scss'],
  providers: [ConfigService, MatSnackBar],
})
export class ResetPassComponent implements OnInit {

  constructor(
    public configService: ConfigService,
    private router: Router,
    private snackBar: MatSnackBar,
    private store: Store<{ storeInformation: []; cart: [], customer: [] }>,
  ) {
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data) => (this.customer = data.customer));
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data) => (this.storeInformation = data.storeInformation));
  }

  email: any;
  password: any;
  storeInformation: any;
  customer: any;
  error: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  passwordShown: boolean;
  newPass: any;
  formPass = new FormGroup({
    newPasswordFormControl: new FormControl('', [
      Validators.required,
      Validators.minLength(7),
    ]),
    confirmPasswordFormControl: new FormControl('', [
      Validators.required,
      PasswordValidator.strong,
      Validators.minLength(7),
    ]),
  });
  hideNewPass = true;
  hideConfirmNewPass = true;
  newPasswordConfirm: any = '';
  newPassword: any = '';

  ngOnInit(): void {
    if (this.customer.length === 0) {
      this.router.navigate(['login']);
      return;
    }
  }

  setStoreCustomer(currentCustomer) {
    this.store.dispatch(new SetCustomer(currentCustomer));
  }

  redirectRegister() {
    this.router.navigate(['register']);
  }

  redirect() {
    this.router.navigate(['home']);
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
      merchantId: this.storeInformation.merchantId
    };
    this.configService.loginCustomer(params).subscribe(
      (data: any) => {
        if (data.success === 1) {
          this.customer = data.response;
          this.openSnackBar('Login Complete', 1);
          this.setStoreCustomer(this.customer);
          this.redirect();
        } else {
          this.openSnackBar(data.message, 0);
          return;
        }
      },
      (error) => (this.error = error)
    );
  }

  redirectFpassword() {
    this.router.navigate(['forgetPassword']);
  }

  resetPass() {

  }

  validateFieldsForNewPassword() {
    if (this.newPassword === '' || this.newPasswordConfirm === '') {
      return 'btn-disabled';
    } else {
      return 'btn-active';
    }
  }

  hiddenEmail = (email) => {

    const hide = email.split('@')[0].length - 2;

    const r = new RegExp('.{' + hide + '}@', 'g');

    return email.replace(r, '***@');
  }

  generatePassword() {
    if (this.newPassword === '' || this.newPasswordConfirm === '') {
      this.openSnackBar('Complete all the fields', 2);
    } else {
      if (this.newPassword.toString() === this.newPasswordConfirm.toString()) {
        const params = {
          newPassword: this.newPassword,
          customerId: this.customer.customerId
        };
        this.configService.resetPasswordCustomer(params).subscribe((data: any) => {
          if (data.success === 0) {
            this.openSnackBar(data.message, 2);
          } else {
            this.openSnackBar(data.message, 1);
            this.setStoreCustomer([]);
            localStorage.clear();
            this.router.navigate(['login']);
          }
        });
      } else {
        this.openSnackBar('Passwords do not match', 2);
      }
    }
  }

  goBack() {
    this.router.navigate(['home']);
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
      return {errors: [], valid: false, strong: true};
    }
    return null;
  }
}
