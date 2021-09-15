import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-add-tips',
  templateUrl: './add-tips.component.html',
  styleUrls: ['./add-tips.component.scss']
})
export class AddTipsComponent implements OnInit {

  tipSelected = 0;
  tipValue = 10;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddTipsComponent>,
  ) { }

  ngOnInit(): void {
  }

  closeModal() {
    this.dialogRef.close();
  }

  confirmTip = (tips) => {
    if (this.tipSelected === 4) {
      this.dialogRef.close(+tips.value);
    } else {
      this.dialogRef.close(this.tipValue);
    }
  }

  selectTip(tip: number, value?: number) {
    this.tipSelected = tip;
    this.tipValue = value;
  }

  displayFloatTip() {

  }

  getCustomTip($event: Event) {
    const customTip = $event.target as HTMLInputElement;
    this.tipValue = +customTip;
  }
}
