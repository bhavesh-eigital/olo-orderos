import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {findSetting} from '../../../utils/FindSetting';
import {PaymentComponent} from '../../Payment/payment.component';
import {MatDialog} from '@angular/material/dialog';
import {ConfigService} from '../../../services/config.service';
import {Product} from '../../../models/product';
import {RemoveFromCart} from '../../../store/actions';
import {ProductModal} from '../../Product/product-modal';

@Component({
  selector: 'your-order-checkout-refund',
  templateUrl: './your-order.html',
  styleUrls: ['./your-order.scss']
})
export class YourOrderCheckoutRefund implements OnInit, OnChanges {

  @Input() tips: any;
  @Input() orderType: any;
  @Input() paymentInfo: any;
  cart: any = [];
  storeInformation: any = [];
  customer: any = [];
  orderRefunded: any;
  orderInformation: any;
  currency = localStorage.getItem('currency');
  orderId = localStorage.orderId;
  totalAmountRefund = 0;
  subTotalAmountRefund = 0;
  loading = true;

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
    this.getOrderRefund(this.orderId);
  }

  getSubTotalAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.totalAmount * obj.quantity);
    }, 0);
  }

  getTotalAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return ((obj.totalAmount * obj.quantity) + acc);
    }, 0) + this.getTotalTaxesAmount() + this.orderRefunded.order.deliveryAmount;
  }

  getTaxes = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.taxes * obj.quantity);
    }, 0);
  }

  getTotalTaxesAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.taxes * obj.quantity);
    }, 0);
  }

  getOrderRefund = (orderId) => {
    this.configService.getOrderRefund(orderId)
      .subscribe((data: any) => {
        this.orderRefunded = data.response;
        this.getTotalsOrderRefund(this.orderId);
        this.loading = !this.loading;
      });
  }

  getTotalPaymentAmount = (transactionIds) => {
    return transactionIds.reduce((acc, obj) => {
      return acc + obj.transactionAmount;
    }, 0);
  }

  removeProduct(item: Product) {
    this.store.dispatch(new RemoveFromCart(item));
  }

  editProduct(item: Product) {
    this.dialog.open(ProductModal, {
      data: {product: item, action: 'edit'}, panelClass: 'full-screen-modal'
    });
  }

    getTotalAmountRefund = () => {
      return this.orderRefunded.removedProducts.reduce((acc, obj) => {
        return acc + obj.productTotal;
      }, 0);
    }

  getSubTotalAmountRefund = () => {
    return this.orderRefunded.removedProducts.reduce((acc, obj) => {
      return acc + obj.productUnitPrice;
    }, 0);
  }

  getTotalsOrderRefund = (orderId) => {
    this.configService.getOrderRefund(orderId)
      .subscribe((data: any) => {
        this.orderRefunded = data.response;
        this.totalAmountRefund = this.getTotalAmountRefund();
        this.subTotalAmountRefund = this.getSubTotalAmountRefund();
      });
  }

  refundCartDifferenceTaxes = () => {
    if (this.cart.length === 0) {
      return this.orderRefunded.order.taxAmount;
    } else {
      return parseFloat((this.getTotalTaxesAmount()));
    }
  }

  refundCartDifferenceSubTotalAmount = () => {
    if (this.cart.length === 0) {
      return this.orderRefunded.order.subTotalAmount;
    } else {
      return this.getSubTotalAmount() - this.getTotalAmountRefund();
    }
  }

  refundCartDifference = () => {
    if (this.cart.length === 0) {
      return this.getTotalPaymentAmount(this.paymentInfo.transactionIds);
    } else {
      return parseFloat((this.getTotalAmount() - this.totalAmountRefund).toFixed(2));
    }
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

  removeCancelElements = (productList) => {
    return productList.filter((product) => {
      return product.productSellStatus !== 7;
    });
  }

  ngOnChanges(): void {
  }

}
