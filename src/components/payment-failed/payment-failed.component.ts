import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-payment-failed',
  templateUrl: './payment-failed.component.html',
  styleUrls: ['./payment-failed.component.scss']
})
export class PaymentFailedComponent implements OnInit {

  @Output() back = new EventEmitter<void>();

  constructor() {
  }

  ngOnInit(): void {
  }

}
