import {Component, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {PaymentService} from '../../services/payment.service';

@Component({
  selector: 'app-payment-method-modal',
  templateUrl: './payment-method-modal.component.html',
  styleUrls: ['./payment-method-modal.component.scss']
})
export class PaymentMethodModalComponent implements OnInit {
  defaultPayment: boolean = false;


  constructor(
    private dialogRef: MatDialogRef<PaymentMethodModalComponent>,
    private paymentService: PaymentService
  ) {
  }

  ngOnInit(): void {
  }

  handleSubmit(f: NgForm) {
    if (f.valid) {
      this.paymentService.paymentAdded.emit();
      this.dialogRef.close();
    }
  }
}
