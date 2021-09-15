import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';

import {select, Store} from '@ngrx/store';
import {CountryISO, SearchCountryField, TooltipLabel} from 'ngx-intl-tel-input';
import {FormControl, Validators} from '@angular/forms';
import {ConfigService} from '../../../services/config.service';

@Component({
  selector: 'app-customer',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
  providers: [MatSnackBar]
})
export class HelpComponent implements OnInit {
  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  isLinear: any;
  firstFormGroup: any;
  secondFormGroup: any;
  issueReason = 0;
  orderId = '';
  customerEmail = '';
  customerPhone = '';
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  favorites: any;
  storeInformation: any;
  customer: any;
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  currentNotes = '';

  constructor(
    private configService: ConfigService,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store<{ favorites: []; storeInformation: any, customer: any }>,
    private snackBar: MatSnackBar) {
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data) => (this.favorites = data.favorites));
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data) => (this.storeInformation = data.storeInformation));
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data) => (this.customer = data.customer));
    this.orderId = this.route.snapshot.paramMap.get('orderId');
  }

  ngOnInit(): void {
  }

  cancel() {
    this.router.navigate(['orders']);
  }

  goBack() {
    this.router.navigate(['home']);
  }

  selectOption(num) {
    this.issueReason = num;
  }


  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 3000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  redirectOrder() {
    this.openSnackBar('Error : required parameters', 2);
    this.router.navigate(['orders']);
  }

  reportIssue = () => {
    const params = {
      customerId: this.customer.customerId,
      orderId: this.orderId,
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      issueType: 1,
      items: [],
      issueReason: this.issueReason,
      contactInfo: {
        email: this.customerEmail,
        phoneNumber: this.customerPhone
      },
      notes: this.currentNotes
    };
    this.configService.reportIssue(params)
      .subscribe((data: any) => {
        if (data.success === 1) {
          this.openSnackBar(data.message, 1);
          this.router.navigate(['orders']);
        } else {
          this.openSnackBar(data.message, 2);
        }
      });
  }

  getCustomerPhoto() {
    return this.customer.customerPhoto ? 'https://' + this.customer.customerPhoto : 'assets/IconsSVG/Account.svg';
  }
}
