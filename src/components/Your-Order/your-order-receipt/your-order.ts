import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {findSetting} from '../../../utils/FindSetting';
import {PaymentComponent} from '../../Payment/payment.component';
import {MatDialog} from '@angular/material/dialog';
import {ConfigService} from '../../../services/config.service';
import { UIService } from 'src/services/ui.service';

@Component({
    selector: ' your-order-receipt',
    templateUrl: './your-order.html',
    styleUrls: ['./your-order.scss']
})
export class YourOrderReceipt implements OnInit {

    @Input() tips: any = 0;
    @Input() orderType: any;
    @Input() showTips = true;
    @Input() paymentInfo: any;
    loading = true;
    cart: any = [];
    storeInformation: any = [];
    customer: any = [];
    order: any;
    orderId = localStorage.getItem('orderId');
    deliveryFee = 0.00;
    currency = localStorage.getItem('currency');
    productList = [];

    constructor(
        private router: Router,
        private configService: ConfigService,
        private store: Store<{ storeInformation: []; cart: [], customer: [] }>,
        private dialog: MatDialog,
        public uiService: UIService
    ) {
        // @ts-ignore
        store.pipe(select('cartShop')).subscribe((data) => (this.storeInformation = data.storeInformation));
        // @ts-ignore
        store.pipe(select('cartShop')).subscribe((data) => (this.customer = data.customer));

    this.cart = JSON.parse(localStorage.getItem('currentOrderCart')) || [];
  }

    ngOnInit(): void {
        this.getOrderPaymentsInformation();
        this.getOrderInformation();
        this.deliveryFee = findSetting(this.storeInformation, 'OnlineStoreDeliveryFee') === 'false'
            ? 0
            : findSetting(this.storeInformation, 'OnlineStoreDeliveryFee');
    }

  getSubTotalAmount = () => {
    if (this.cart.length !== 0) {
      return this.cart.reduce((acc, obj) => {
        return acc + (obj.totalAmount * obj.quantity);
      }, 0);
    } else {
      return this.order.subTotalAmount;
    }
  }

    getTotalAmount = () => {
        if (this.orderType !== 1) {
            this.deliveryFee = 0;
        }
        return this.cart.reduce((acc, obj) => {
            return acc + (obj.totalAmount * obj.quantity);
        }, 0) + this.tips || 0 + this.getTaxes() + parseFloat(String(this.deliveryFee));
    }

    getTaxes = () => {
        if (this.cart.length !== 0) {
            return this.cart.reduce((acc, obj) => {
                return acc + (obj.taxes * obj.quantity);
            }, 0);
        } else {
            return this.order.taxAmount;
        }
    }

    getTotalPaymentAmount = (transactionIds) => {
        return transactionIds.reduce((acc, obj) => {
            return acc + obj.transactionAmount;
        }, 0);
    }

  getOrderPaymentsInformation = () => {
    this.configService.getOrderPayments(this.storeInformation.merchantId, this.storeInformation.storeId, localStorage.getItem('orderId'))
      .subscribe((data: any) => {
        this.paymentInfo = data.response[0];
        this.loading = !this.loading;
      });
  }

    getOrderInformation = () => {
        this.configService.getOrder(this.storeInformation.merchantId, this.orderId)
            .subscribe((data: any) => {
                this.order = data.response;
                this.productList = this.order.seats.flatMap((product) => {
                    return product.orderProducts;
                });
            });
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

}
