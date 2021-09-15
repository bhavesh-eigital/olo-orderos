import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-cancel-reason',
  templateUrl: './cancel-reason.component.html',
  styleUrls: ['./cancel-reason.component.scss']
})
export class CancelReasonComponent implements OnInit {

  reasonsToCancel = [
    {id: 1, reason: 'Do not want the order'},
    {id: 2, reason: 'Changed order'},
    {id: 3, reason: 'Driver is delayed'},
    {id: 4, reason: 'Other reasons from Customer'},
    {id: 5, reason: 'Driver has not arrived to the restaurant'},
    {id: 6, reason: 'Restaurant system fail'},
    {id: 7, reason: 'Restaurant can not fulfill the order'},
    {id: 8, reason: 'Other reasons from Restaurant'},
  ];

  reasonSelected: any = {};
  note = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CancelReasonComponent>,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
  }

  setReason(reasonToCancel: any) {
    this.reasonSelected = reasonToCancel;
  }

  isReasonSelected = (reasonToCancel) => {
    return this.reasonSelected.id === reasonToCancel.id;
  }

  clearNote() {
    this.note = '';
  }

  completeCancelOrder = () => {
    const isReasonEmpty = Object.keys(this.reasonSelected).length;
    if (!isReasonEmpty) {
      this.openSnackBar('To confirm canceling your order, please select a reason',2)
      return;
    }
    this.dialogRef.close({...this.reasonSelected, note: this.note });
  }

  closeModal() {
    this.dialogRef.close();
  }
  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 5000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
