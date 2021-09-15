import {AfterViewInit, Component, Input, ViewChild} from '@angular/core';
import {PaymentService} from '../../../services/payment.service';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-payment--CDF-request',
  templateUrl: './payment-request.component.html',
  styleUrls: ['./payment-request.component.scss'],
  providers: [PaymentService],
})
export class PaymentRequestCDFComponent implements AfterViewInit {

  @Input() AMOUNT: any;

  elements: any;
  paymentRequest: any;
  prButton: any;
  @ViewChild('payElement') payElement;

  constructor(private pmt: PaymentService, private httpClient: HttpClient) {
  }

  ngAfterViewInit(): void {
    this.paymentRequest = this.pmt.stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        amount: this.AMOUNT,
        label: 'Pizza',
      },
    });
    this.elements = this.pmt.stripe.elements();
    // this.paymentRequest.on('source', async (event) => {
    //     console.log({ source: event });
    //     // setTimeout(() => {}, 2000);
    // });
    this.paymentRequest.on('paymentmethod', async (event) => {
      const response: any = await this.httpClient
        .post('https://d.browserapi.eatos.co/stripe/payment/intent', {
          amount: 2000,
        })
        .toPromise();
      this.pmt.stripe
        .confirmCardPayment(
          response.data.client_secret,
          {payment_method: event.paymentMethod.id},
          {handleActions: false}
        )
        .then((confirmResult) => {
          if (confirmResult.error) {
            event.complete('fail');
          } else {
            event.complete('success');
            this.pmt.stripe
              .confirmCardPayment(response.data.client_secret)
              .then((result) => {
                if (result.error) {
                  // The Payment failed -- ask your customer for a new Payment method.
                  console.log('Payment failed, ask customer');
                } else {
                  // The Payment has succeeded.
                  console.log('Payment success');
                }
              });
          }
        });
    });
    // this.prButton = this.elements.create('paymentRequestButton', {
    //     paymentRequest: this.paymentRequest,
    //     style: {
    //         paymentRequestButton: {
    //             type: 'buy',
    //             theme: 'dark',
    //         },
    //     },
    // });
    this.mountButton();
  }

  async mountButton() {
    const result = await this.paymentRequest.canMakePayment();
    if (result) {
      // this.prButton.mount(this.payElement.nativeElement);
      const button = document.getElementById('Payment-request-button');
      button.addEventListener('click', this.paymentRequest.show);
    } else {
      console.log('Your browser is old school');
    }
  }
}
