import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-re-request-olo-modal',
  templateUrl: './re-request-olo-modal.component.html',
  styleUrls: ['./re-request-olo-modal.component.scss']
})
export class ReRequestOloModalComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ReRequestOloModalComponent>,
  ) { }

  ngOnInit(): void {
  }

  closeModal() {
    this.dialogRef.close();
  }

  confirmReRequest() {
    this.dialogRef.close(1);
  }
}
