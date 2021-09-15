import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { OrderSummaryBottomSheetComponent } from '../order-summary-bottom-sheet/order-summary-bottom-sheet.component';
import { select, Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { findSetting } from 'src/utils/FindSetting';

@Component({
  selector: 'app-order-summary2',
  templateUrl: './order-summary2.component.html',
  styleUrls: ['./order-summary2.component.scss']
})
export class OrderSummary2Component implements OnInit, AfterViewInit {

  @Output() back = new EventEmitter<void>();
  @Input() currentOrders;
  hiddeBottomBar = false;
  processing = false;
  success = false;
  failed = false;
  tipSelected = 0;
  tableNumber = localStorage.tableNumber ? localStorage.tableNumber : 0;
  customerName = '';
  tipSelectedValue = 0;
  placeOrders: any;
  pendingProducts: any = [];
  orderInfo: {
    totalAmount: number,
    subTotalAmount: number,
    tipAmount: number,
    taxAmount: number,
  };
  customer: any;

  customAmount = 0;
  cart: any;
  setMinHeight = false;
  allowGratuity: string;

  @ViewChild('customTipInput') customTipInput: ElementRef<HTMLElement>;
  @ViewChild('mainContent') mainContent: ElementRef<HTMLInputElement>;

  currency = localStorage.getItem('currency');
  customTip: any = '';

  constructor(
    private bottomSheet: MatBottomSheet,
    private store: Store,
    private router: Router,
    private renderer: Renderer2
  ) {
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data: any) => {
      if (localStorage.orderType !== '4') {
        this.router.navigate(['home'])
      }
      this.allowGratuity = findSetting(data.storeInformation, 'OnlineStoreAllowGratuity');
      this.customer = data.customer;
      this.customer.length !== 0
        ? this.customerName = this.customer.customerFirstName + ' ' + this.customer.customerLastName
        : this.customerName = 'Guest';
      this.placeOrders = data.placeOrders;
      this.cart = data.cart;
    });
  }

  ngOnInit(): void {
    if (!this.allowGratuity || this.allowGratuity === 'false') {
      this.tipSelected = null;
      this.tipSelectedValue = 0.00;
    } else {
      this.selectTip(0);
    }
    this.getPendingProducts();
  }

  ngAfterViewInit() {
    this.onResize(null);
  }

  getPendingProducts = () => {
    if (this.currentOrders) {
      this.pendingProducts = this.currentOrders.flatMap((orders) => {
        return orders.products;
      });
    } else {
      this.pendingProducts = this.cart.map((product) => {
        return {
          productQuantity: product.quantity,
          productName: product.productName,
          description: '',
          productPrice: product.subTotalAmount
        };
      });
    }
    if (!this.pendingProducts || !this.pendingProducts.length) {
      this.router.navigate(['/dinein']);
    }
  }

  getSubtotalAmount = () => {
    if (this.currentOrders) {
      return this.currentOrders.reduce((acc, obj) => {
        return acc + (obj.subTotalAmount);
      }, 0);
    } else {
      return this.cart.reduce((acc, obj) => {
        return acc + (obj.subTotalAmount) * obj.quantity;
      }, 0);
    }
  }

  getTaxAmount = () => {
    if (this.currentOrders) {
      return this.currentOrders.reduce((acc, obj) => {
        return acc + (obj.taxAmount);
      }, 0);
    } else {
      return this.cart.reduce((acc, obj) => {
        return acc + (obj.taxes) * obj.quantity;
      }, 0);
    }
  }

  getTotalAmount = () => {
    if (this.currentOrders) {
      return this.currentOrders.reduce((acc, obj) => {
        return acc + (obj.totalAmount);
      }, 0);
    } else {
      return this.cart.reduce((acc, obj) => {
        return acc + (obj.totalAmount) * obj.quantity;
      }, 0) + this.getTaxAmount();
    }
  }

  selectTip = (tipSelected) => {
    this.tipSelected = tipSelected;
    switch (tipSelected) {
      case 0:
        this.tipSelectedValue = parseFloat((this.getSubtotalAmount() * 0.10).toFixed(2));
        this.customTip = '';
        break;
      case 1:
        this.tipSelectedValue = parseFloat((this.getSubtotalAmount() * 0.15).toFixed(2));
        this.customTip = '';
        break;
      case 2:
        this.tipSelectedValue = parseFloat((this.getSubtotalAmount() * 0.18).toFixed(2));
        this.customTip = '';
        break;
      case 3:
        this.tipSelectedValue = parseFloat((this.getSubtotalAmount() * 0.20).toFixed(2));
        this.customTip = '';
        break;
      case 4:
        // this.tipSelectedValue = 0;
        this.customTipInput.nativeElement.focus();
        this.tipSelectedValue = 0;
        break;
    }
  }


  showBottomSheet() {
    if (this.customer.length === 0) {
      this.router.navigate(['checkoutGuest']);
    } else {
      this.orderInfo = {
        taxAmount: this.getTaxAmount(),
        tipAmount: this.tipSelectedValue,
        subTotalAmount: this.getSubtotalAmount(),
        totalAmount: this.getTotalAmount()
      };
      const bottomSheetRef = this.bottomSheet.open(OrderSummaryBottomSheetComponent, {
        data: {
          taxAmount: this.getTaxAmount(),
          tipsAmount: this.tipSelectedValue,
          subTotalAmount: this.getSubtotalAmount(),
          totalAmount: this.getTotalAmount(),
        }
      });
      bottomSheetRef.afterDismissed().pipe(
        tap({
          next: (resp) => {
            if (resp) {
              this.processing = true;
            }
          }
        })
      ).subscribe((paymentStatus) => {
        if (paymentStatus) {
          this.success = paymentStatus;
          this.processing = false;
        }
      });
    }
  }

  goBack() {
    if (this.router.url.includes('order-summary')) {
      this.router.navigate(['/tabs']);
    } else {
      this.back.emit();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(ev) {
    if (window.innerHeight <= 583) {
      this.setMinHeight = true;
    } else {
      this.setMinHeight = false;
    }
  }

  displayFloatTip() {
    this.customTip = parseFloat(this.customTip).toFixed(2);
  }

  selectCustomTips(event) {
    if(!event) {
      this.tipSelectedValue = 0;
      return;
    }
    this.tipSelectedValue = parseFloat(event);
  }

}
