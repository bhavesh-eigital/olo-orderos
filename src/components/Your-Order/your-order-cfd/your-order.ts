import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {findSetting} from '../../../utils/FindSetting';
import {PaymentComponent} from '../../Payment/payment.component';
import {MatDialog} from '@angular/material/dialog';
import {ConfigService} from '../../../services/config.service';

@Component({
  selector: 'your-order-cfd',
  templateUrl: './your-order.html',
  styleUrls: ['./your-order.scss']
})
export class YourOrderCfd implements OnInit, OnChanges {

  @Input() tips: any;
  @Input() orderType: any;
  @Input() order: any;
  cart: any = [];
  storeInformation: any = [];
  customer: any = [];
  deliveryFee = 0.00;
  paymentInfo: any;
  currency = localStorage.getItem('currency');
  @Input() finalAmount: any;
  productList: [];

  constructor(private router: Router,
              private configService: ConfigService,
              private store: Store<{ storeInformation: []; cart: [], customer: [] }>,
              private dialog: MatDialog) {
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data) => (this.cart = data.cart));
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data) => (this.storeInformation = data.storeInformation));
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data) => (this.customer = data.customer));
  }

  ngOnInit(): void {
    this.deliveryFee = findSetting(this.storeInformation, 'OnlineStoreDeliveryFee') === 'false'
      ? 0
      : findSetting(this.storeInformation, 'OnlineStoreDeliveryFee');
    this.productList = this.order.seats.flatMap((product) => {
      return product.orderProducts;
    });
  }

  getSubTotalAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.totalAmount * obj.quantity);
    }, 0);
  }

  getDeliveryFee = (delivery) => {
    return parseFloat(delivery).toFixed(2);
  }

  getTaxes = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.taxes * obj.quantity);
    }, 0);
  }

  getTotalAmount = () => {
    if (this.orderType !== 1) {
      this.deliveryFee = 0;
    }
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.totalAmount * obj.quantity);
    }, 0) + this.tips + this.getTaxes() + parseFloat(String(this.deliveryFee));
  }

  checkout() {
    const orderGuest = findSetting(this.storeInformation, 'OnlineStoreAllowOrderAsGuest');

    if (this.customer !== '[]') {
      this.dialog.open(PaymentComponent, {
        panelClass: 'my-class',
      });
    } else {
      if (orderGuest === 'false') {
        this.router.navigate(['login']);
      } else {
        this.dialog.open(PaymentComponent, {
          panelClass: 'my-class',
        });
      }
    }
  }

  ngOnChanges(): void {
  }

}
