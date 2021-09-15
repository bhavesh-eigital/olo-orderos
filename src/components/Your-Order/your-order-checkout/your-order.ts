import {AfterViewChecked, AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {findSetting} from '../../../utils/FindSetting';
import {PaymentComponent} from '../../Payment/payment.component';
import {MatDialog} from '@angular/material/dialog';
import {UIService} from 'src/services/ui.service';

@Component({
  selector: 'your-order-checkout',
  templateUrl: './your-order.html',
  styleUrls: ['./your-order.scss']
})
export class YourOrderCheckout implements OnInit, OnChanges, AfterViewChecked, AfterViewInit {

  @Input() tips: any = 0;
  @Input() tipSelectedIndex: any;
  @Input() orderType: any;
  @Input() deliveryFee: any;
  @Output() tipSelected = new EventEmitter<any>();
  @Input() loading;
  @Input() showTips = true;
  @Input() fromCheckout = false;
  @Input() currentOrderType = 2;
  @Input() tipOptions = [];

  cart: any = [];
  storeInformation: any = [];
  customer: any = [];
  currency = localStorage.getItem('currency');
  delivery: any;
  customTip: any = 0;

  constructor(
    private router: Router,
    private store: Store<{ storeInformation: []; cart: [], customer: [] }>,
    private dialog: MatDialog,
    private uiService: UIService
  ) {
    store.subscribe((state: any) => {
      const data = state.cartShop;
      this.cart = data.cart;
      this.storeInformation = data.storeInformation;
      this.customer = data.customer;
    });
  }

  ngAfterViewChecked(): void {
    // this option is when the tips is in this component
    // this.calculateTip();
  }

  ngOnInit(): void {
    this.calculateTip();
  }

  ngAfterViewInit() {
    this.uiService.materialInputEventListener();
  }

  getSubTotalAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.totalAmount * obj.quantity);
    }, 0);
  };

  getDeliveryFee = (delivery) => {
    return parseFloat(delivery).toFixed(2);
  };

  getTaxes = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.taxes * obj.quantity);
    }, 0);
  };

  getTotalAmount = () => {
    if (this.orderType !== 1) {
      this.deliveryFee = 0;
    }
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.totalAmount * obj.quantity);
    }, 0) + parseFloat(this.tips || 0) + this.getTaxes() + parseFloat(String(this.deliveryFee));
  };

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

  calculateTip = () => {
    switch (this.tipSelectedIndex) {
      case 0:
        this.tips = 0;
        return this.tips = parseFloat((Math.round((this.getSubTotalAmount() * (this.tipOptions[0] / 100) * 100)) / 100).toFixed(2));
      case 1:
        this.tips = 0;
        this.emitNewTipSelected(parseFloat((Math.round((this.getSubTotalAmount() * (this.tipOptions[0] / 100) * 100)) / 100).toFixed(2)));
        return this.tips = parseFloat((Math.round((this.getSubTotalAmount() * (this.tipOptions[0] / 100) * 100)) / 100).toFixed(2));
      case 2:
        this.tips = 0;
        this.emitNewTipSelected(parseFloat((Math.round((this.getSubTotalAmount() * (this.tipOptions[1] / 100) * 100)) / 100).toFixed(2)));
        return this.tips = parseFloat((Math.round((this.getSubTotalAmount() * (this.tipOptions[1] / 100) * 100)) / 100).toFixed(2));
      case 3:
        this.tips = 0;
        this.emitNewTipSelected(parseFloat((Math.round((this.getSubTotalAmount() * (this.tipOptions[2] / 100) * 100)) / 100).toFixed(2)));
        return this.tips = parseFloat((Math.round((this.getSubTotalAmount() * (this.tipOptions[2] / 100) * 100)) / 100).toFixed(2));
      case 4:
        this.tips = 0;
        this.emitNewTipSelected(parseFloat((Math.round((this.getSubTotalAmount() * (this.tipOptions[3] / 100) * 100)) / 100).toFixed(2)));
        return this.tips = parseFloat((Math.round((this.getSubTotalAmount() * (this.tipOptions[3] / 100) * 100)) / 100).toFixed(2));
      case 5:
        this.emitNewTipSelected(parseFloat(this.tips));
        this.tips = parseFloat(this.tips);
    }
  };

  ngOnChanges(): void {
    // this option is when the tips is in this component
    // this.calculateTip();
  }

  updateProductCart = () => {
    this.calculateTip();
  };

  selectTip = (tip, index) => {
    this.tipSelectedIndex = index;
    if (this.customTip !== 0 && this.tipSelectedIndex === 5) {
      this.tips = this.customTip;
      this.emitNewTipSelected(this.tips);
    } else {
      this.tips = parseFloat((Math.round((this.getSubTotalAmount() * tip * 100)) / 100).toFixed(2));
      this.emitNewTipSelected(this.tips);
      this.customTip = 0;
    }
  };

  getTips = (tip) => {
    return parseFloat((Math.round((this.getSubTotalAmount() * tip * 100)) / 100).toFixed(2));
  };

  selectCustomTips() {
    this.tips = this.customTip;
  }

  emitNewTipSelected = (tipSelected) => {
    this.tipSelected.emit(tipSelected);
  };
}
