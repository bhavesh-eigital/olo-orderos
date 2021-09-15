import { AfterViewInit, Component,  EventEmitter, Input, Output, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-collapse-header-checkout-payment',
  templateUrl: './collapse-header-checkout-payment.component.html',
  styleUrls: ['./collapse-header-checkout-payment.component.scss']
})
export class CollapseHeaderCheckoutPaymentComponent implements AfterViewInit {

 
  @Input() title: string = '';
  @Input() showPayments: boolean = false;
  @Output() showPaymentsChange = new EventEmitter<void>();

  constructor(private renderer: Renderer2) {
  }

  ngAfterViewInit(): void {
  }

  handleClick() {
    this.showPaymentsChange.emit();
  }

}
