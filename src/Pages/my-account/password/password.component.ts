import {AfterViewInit, Component, HostListener, OnInit} from '@angular/core';
import {FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {ConfigService} from 'src/services/config.service';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements OnInit, AfterViewInit {

  open = false;


  oldPasswordShown = false;
  newPasswordShown = false;
  confirmPasswordShown = false;

  newPassword = '';
  currentPassword = '';
  newPasswordConfirm = '';

  customer: any;
  showTitle = true;


  formPass = new FormGroup({
    currentPasswordFormControl: new FormControl('', [
      Validators.required,
      Validators.minLength(7),
    ]),
    newPasswordFormControl: new FormControl('', [
      Validators.required,
      PasswordValidator.strong,
      Validators.minLength(7),
    ]),
    confirmPasswordFormControl: new FormControl('', [
      Validators.required,
      PasswordValidator.strong,
      this.areEquals(),
      Validators.minLength(7),
    ]),
  });

  constructor(
    private snackBar: MatSnackBar,
    private configService: ConfigService,
    private store: Store,
    private router: Router
  ) {
    store.subscribe((state: any) => {
      this.customer = state.cartShop.customer;
    });
  }

  ngOnInit(): void {
    if (this.customer.length > 0) {
      this.router.navigate(['/signin']);
    }
  }

  ngAfterViewInit() {
    this.onResize();
  }

  areEquals(): ValidatorFn {
    return (control: FormControl): { [key: string]: boolean | null } => {
      return this.newPassword !== control.value
        ? {areEquals: true}
        : null;
    };
  }

  generatePassword() {
    if (this.currentPassword === '' || this.newPassword === '' || this.newPasswordConfirm === '') {
      this.openSnackBar('Complete all the fields', 2);
    } else {
      if (this.newPassword.toString() === this.newPasswordConfirm.toString()) {
        const params = {
          currentPassword: this.currentPassword,
          newPassword: this.newPassword,
          customerId: this.customer.customerId
        };
        this.configService.updatePasswordCustomer(params).subscribe((data: any) => {
          if (data.success === 0) {
            this.openSnackBar(data.message, 2);
          } else {
            this.openSnackBar(data.message, 1);
          }
        });
      } else {
        this.openSnackBar('Passwords do not match', 2);
      }
    }
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 5000,
      panelClass: [status === 1 ? 'green-snackbar' : 'rebar'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
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
