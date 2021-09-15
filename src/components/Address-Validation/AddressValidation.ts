import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ClearCart} from '../../store/actions';
import {Store} from '@ngrx/store';
import {Router} from '@angular/router';
import {AddressDialog} from '../../Pages/Account/Customer/customer.component';

@Component({
  selector: 'AddressValidation',
  templateUrl: './AddressValidation.html',
  styleUrls: ['./AddressValidation.scss']
})
export class AddressValidation implements OnInit {

  @Output() newOrderType = new EventEmitter<any>();
  @Output() changeDefaultAddress = new EventEmitter<any>();

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private store: Store<{ storeInformation: []; cart: []; customer: [] }>,
    private dialogRef: MatDialogRef<AddressValidation>
  ) {
  }

  ngOnInit(): void {
  }

  cleanCart = () => {
    this.store.dispatch(new ClearCart([]));
    this.router.navigate(['home']);
    this.dialogRef.close();
  }

  changeOrderType(orderType) {
    localStorage.orderType = orderType;
    window.location.reload();
  }


  AddNewAddress = () => {
    this.router.navigate(['customer']);
    this.dialogRef.close();
  }
}
