import {EventEmitter, Injectable, Output} from '@angular/core';

@Injectable({providedIn: 'root'})
export class PaymentService {
  @Output() paymentAdded = new EventEmitter<void>();
  stripe = Stripe('pk_test_TTF68ceJV8AKZCuq3ho4vrjY00iIHqHUZO');

  constructor() {
  }
}
