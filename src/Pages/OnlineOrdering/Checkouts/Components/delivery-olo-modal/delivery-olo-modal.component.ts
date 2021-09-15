import {Component, Inject, OnInit, Output, EventEmitter, AfterViewInit, OnDestroy} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {OloService} from '../../../../../services/olo.service';
import {catchError, tap} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material/snack-bar';
import {throwError} from 'rxjs';

@Component({
  selector: 'app-delivery-olo-modal',
  templateUrl: './delivery-olo-modal.component.html',
  styleUrls: ['./delivery-olo-modal.component.scss']
})
export class DeliveryOloModalComponent implements OnInit, AfterViewInit, OnDestroy {

  loadingOLODelivery = true;
  foundDSP: any;
  @Output() acceptedDSP: EventEmitter<number> = new EventEmitter();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private oloService: OloService,
    private dialogRef: MatDialogRef<DeliveryOloModalComponent>,
    private snackbar: MatSnackBar,
  ) { }

  ngAfterViewInit(): void {
    if (this.data) {
      const { storeId, customerId, currentAddressId, subTotalAmount }  = this.data;
      this.oloService.searchDsp(storeId, customerId, currentAddressId, subTotalAmount).pipe(
        catchError(err => {
          return  throwError(err);
        }),
        tap(({response, success, message}) => {
          if (success === 1) {
            setTimeout(() => {
              this.dialogRef.close(response);
            }, 3000);
          } else {
            this.snackbar.open(message, 'OK', {
              duration: 5000,
              panelClass: ['red-snackbar'],
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
            this.closeDeliveryModal();
          }
        })
      ).subscribe();
    }
    }

  ngOnInit(): void {
  }



  closeDeliveryModal() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
  }
}
