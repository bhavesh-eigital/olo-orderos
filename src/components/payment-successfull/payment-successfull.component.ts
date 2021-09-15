import {Component, Input, OnDestroy, Renderer2} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {
  ClearCart,
  SetCustomer,
  SetPlacedOrder,
  SetTemporalCustomer,
  SetTemporalCustomerPhoneDetails
} from 'src/store/actions';

@Component({
  selector: 'app-payment-successfull',
  templateUrl: './payment-successfull.component.html',
  styleUrls: ['./payment-successfull.component.scss']
})
export class PaymentSuccessfullComponent implements OnDestroy {

  @Input() products = [];
  @Input() orderInfo: {
    totalAmount: number,
    subTotalAmount: number,
    tipAmount: number,
    taxAmount: number,
  };

  @Input() show = true;
  cart: any;
  customer: any;
  storeInformation: any;
  origin: string = '';

  constructor(private renderer: Renderer2, private store: Store) {
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data: any) => (
      this.cart = data.cart,
        this.storeInformation = data.storeInformation,
        this.customer = data.customer
    ));

    this.origin = window.location.origin;
  }

  setCustomer(currentStore) {
    this.store.dispatch(new SetCustomer(currentStore));
  }

  cleanCart(currentStore) {
    this.store.dispatch(new ClearCart(currentStore));
  }

  setPlacedOrders(newOrder) {
    this.store.dispatch(new SetPlacedOrder(newOrder));
  }

  setTemporalCustomer() {
    this.store.dispatch(new SetTemporalCustomer([]));
    this.store.dispatch(new SetTemporalCustomerPhoneDetails(null));
  }

  redirectToMenu = () => {
    this.cleanCart([]);
    this.setPlacedOrders([]);
    this.setTemporalCustomer();
    localStorage.setItem('orderType', '2');
    localStorage.removeItem('tableNumber');
    localStorage.removeItem('OnlineStoreAllowOrderWithoutPaying');
    localStorage.removeItem('OnlineOrderingAcceptCashPayments');
    localStorage.removeItem('OnlineStoreAllowOrderAsGuest');
    localStorage.removeItem('provider');
    window.location.href = `${this.origin}/menu`;
  }

  ngOnDestroy() {
    this.redirectToMenu();
  }

}
