import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { CountryISO, SearchCountryField, TooltipLabel } from 'ngx-intl-tel-input';
import { AddressDialog } from 'src/Pages/Account/Customer/customer.component';
import { CreateAccountModal } from 'src/components/create-account/create-account-modal'
import { SetCustomer, SetDefaultAddress } from 'src/store/actions';
import { ConfigService } from 'src/services/config.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, AfterViewInit {

  open = false;

  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];

  storeInformation: any;
  customer: any;
  customerInformation: any;
  customerPhoto: any;
  customerDefaultAddress: any;
  newCustomerInformation: any = {
    customerEmail: '',
    customerFirstName: '',
    customerLastName: '',
    customerMobile: '',
    customerPhoto: '',
    customerAdresses: [{
      customerAddress1: '',
      customerAddress2: '',
      customerCity: '',
      customerState: '',
      customerCountry: '',
      customerZip: ''
    }],
  };
  photoU = false;
  cart: any;
  changes: any;
  dataUpdated: boolean;
  showTitle = true;

  constructor(
    private dialog: MatDialog,
    private store: Store,
    private router: Router,
    private configService: ConfigService,
    private snackBar: MatSnackBar
  ) {
    store.subscribe((state: any) => {
      const data = state.cartShop;
      this.cart = data.cart;
      this.storeInformation = data.storeInformation;
      this.customerDefaultAddress = data.customerDefaultAddress;
      this.customer = data.customer;
    });
  }

  ngOnInit(): void {
    if (this.customer.length === 0) {
      this.router.navigate(['sigin']);
      return;
    }

    this.customerInformation = this.customer.length! ? this.newCustomerInformation : this.customer

    if (
      this.customer.customerAdresses.length === 0 ||
      this.customer.customerMobile === '' ||
      this.customer.customerMobile === null ||
      this.customer.isVerified === false
    ) {
      this.dialog.open(CreateAccountModal, {
        panelClass: 'create-account-modal',
        disableClose: true
      });
    } else {
      this.setDefaultAddress(this.getCurrentAddressDefault(this.customer.customerDefaultAddressId));
    }

  }

  ngAfterViewInit() {
    this.onResize();
  }

  openCustomerAddressDialog = (isEditable, currentAddress) => {
    const isNewAddress = isEditable === true
      ? {
        address: currentAddress,
        edit: isEditable,
        isDeletable: this.customer.customerAdresses.length > 1
      }
      : {
        edit: isEditable
      };

    this.dialog.open(AddressDialog, {
      data: isNewAddress,
      panelClass: 'full-screen-modal'
    });
  }

  setDefaultAddress = (address) => {
    this.store.dispatch(new SetDefaultAddress(address));
  }

  getCurrentAddressDefault = (addressId) => {
    const addressDefault = this.customer.customerAdresses.find((address) => {
      return address._id === addressId;
    });
    return addressDefault === undefined ? '' : addressDefault;
  }

  setChanges = (event) => {
    this.changes = event.target.value;
    this.dataUpdated = true;
  }

  updateAndSetAddress = (address) => {
    this.configService
      .updateCustomer({
        customerId: this.customer.customerId,
        customerDefaultAddressId: address._id,
      }).subscribe((data: any) => {
        if (data.success === 1) {
          this.setStoreCustomer(data.response);
          this.setDefaultAddress(this.getCurrentAddressDefault(this.customer.customerDefaultAddressId));
        } else {
          this.openSnackBar(data.message, 2);
          // this.openSnackBar(data.message, 2);
        }
      });
  }

  updateCustomerPhoto(photoUrl: string) {
    return this.configService.updateCustomer({
      customerId: this.customer.customerId,
      customerPhoto: photoUrl
    }).pipe(
      tap((data: any) => {
        if (data.success === 1) {
          this.setStoreCustomer(data.response);
        } else {
          this.openSnackBar(data.message, 2);
        }
      })
    )
  }

  setStoreCustomer(currentCustomer) {
    this.store.dispatch(new SetCustomer(currentCustomer));
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 5000,
      panelClass: [status === 1 ? 'green-snackbar' : 'rebar'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  getCustomerPhoto() {
    const link = this.customer.customerPhoto.replace(/^https?:\/\//, '');
    return this.customer.customerPhoto ? 'https://' + link : 'assets/profile/profile.png';
  }


  uploadImage = (fileInputEvent) => {
    const file = fileInputEvent.target.files[0];
    if (file.type.indexOf('image') < 0) {
      this.openSnackBar('Only jpg images are allowed', 2);
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    this.configService.setImageInStorage(formData).pipe(
      tap((data: any) => this.customerInformation.customerPhoto = data.response),
      switchMap((data: any) => this.updateCustomerPhoto(data.response))
    ).subscribe();
  }

  updateCustomer = () => {
    const validateField = (
      this.customerInformation.customerFirstName &&
      this.customerInformation.customerLastName &&
      this.customerInformation.customerEmail &&
      this.customerInformation.customerMobile !== null &&
      this.customerInformation.customerMobile.e164Number.length > 5
    );

    if (validateField === true) {
      const params = {
        storeId: this.storeInformation.storeId,
        merchantId: this.storeInformation.merchantId,
        customerId: this.customer.customerId,
        customerFirstName: this.customerInformation.customerFirstName,
        customerLastName: this.customerInformation.customerLastName,
        customerEmail: this.customerInformation.customerEmail,
        customerMobile: this.customerInformation.customerMobile.e164Number,
        customerAnniversary: this.customerInformation.customerAnniversary,
        customerPhoto: this.customerInformation.customerPhoto,
        customerDOB: this.customerInformation.customerDOB,
      };

      this.configService.updateCustomer(params).subscribe((data: any) => {
        if (data.success === 1) {
          this.customer = data.response;
          this.setStoreCustomer(this.customer);
          this.setDefaultAddress(this.getCurrentAddressDefault(this.customer.customerDefaultAddressId));
          this.openSnackBar('Customer Updated', 1);
        } else {
          this.openSnackBar(data.message, 0);
          return;
        }
      });
    } else {
      this.openSnackBar('Please complete all the fields.', 2);
    }
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
