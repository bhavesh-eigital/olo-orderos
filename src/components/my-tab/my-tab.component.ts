import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-my-tab',
  templateUrl: './my-tab.component.html',
  styleUrls: ['./my-tab.component.scss']
})
export class MyTabComponent implements OnInit {

  liked = false;
  product:any;
  subTotalAmount = 0;

  constructor(
    private dialogRef: MatDialogRef<MyTabComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.product = data.product;
    this.subTotalAmount = data.subTotalAmount;
  }

  ngOnInit(): void { }

  close() {
    this.dialogRef.close();
  }

}
