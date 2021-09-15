import {AfterViewInit, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ConfigService} from '../../services/config.service';
import {select, Store} from '@ngrx/store';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';

@Component({
  selector: 'curbsideModal',
  templateUrl: './curbside-modal.html',
  styleUrls: ['./curbside-modal.scss'],
  providers: [MatSnackBar]
})
export class CurbsideModal implements OnInit, AfterViewInit {
  currency = localStorage.getItem('currency');
  note: ' ';
  storeInformation: any;
  orderInformation: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(
    public configService: ConfigService,
    private snackBar: MatSnackBar,
    private store: Store<{ storeInformation: []; }>,
    @Inject(MAT_DIALOG_DATA) public currentOrder: any,
    private dialogRef: MatDialogRef<CurbsideModal>,
  ) {
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data) => (this.storeInformation = data.storeInformation));
  }

  ngAfterViewInit(): void {
    this.getOrderInformation();
  }

  ngOnInit(): void {

  }

  closeModal() {
    this.dialogRef.close();
  }

  getOrderInformation = () => {
    this.configService.getOrder(this.storeInformation.merchantId, this.currentOrder).subscribe((data: any) => {
      if (data.success === 1) {
        this.orderInformation = data.response;
        this.note = this.orderInformation.curbsideNotes;
      } else {
        this.openSnackBar(data.message, 2);
      }
    });
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 5000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  sendCurbsideNote = () => {
    const params = {
      _id: this.currentOrder,
      curbsideNotes: this.note,
    };

    this.configService.generateOrderDineIn(params).subscribe((response: any) => {
      if (response.error === false) {
        this.closeModal();
      } else {
        this.openSnackBar(response.message, 2);
      }
    });
  }

}
