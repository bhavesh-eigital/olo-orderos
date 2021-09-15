import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { select, Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { MyTabComponent } from '../../components/my-tab/my-tab.component';
import { Router } from '@angular/router';
import { PaymentModalComponent } from 'src/components/payment-modal/payment-modal.component';
import { tap } from 'rxjs/operators';
import { SetPlacedOrder } from 'src/store/actions';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnInit {
  now = Date.now();
  tabs = [];
  customerOrders: any;
  orderQuantity: any;
  loading = true;
  customer: any;
  tableNumber = localStorage.tableNumber ? localStorage.tableNumber : 0;
  open = false;
  hiddeBottomBar = false;
  customerName = '';
  showSummary = false;
  placeOrders = [];
  storeInformation: any;

  constructor(
    private configService: ConfigService,
    private store: Store,
    private router: Router,
    private dialog: MatDialog
  ) {
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data: any) => {
      this.customer = data.customer;
      this.placeOrders = data.placedOrders;
      this.storeInformation = data.storeInformation;
      this.customer.length !== 0
        ? this.customerName = this.customer.customerFirstName + ' ' + this.customer.customerLastName
        : this.customerName = 'Guest';
    });
  }

  ngOnInit(): void {

    this.customerOrders = this.placeOrders.map((order) => {
      return {
        onlineOrderServeStatus: order.onlineOrderServeStatus,
        orderId: order._id,
        orderSellStatus: order.orderSellStatus,
        products: order.seats[0].orderProducts,
        subTotalAmount: order.subTotalAmount,
        taxAmount: order.taxAmount,
        totalAmount: order.totalAmount,
        updatedAt: order.updatedAt,
      };
    });
    this.loading = false;

    if (this.customer.length !== 0) {
      this.getUnpaidOrders();
    }
  }

  getUnpaidOrders() {
    this.configService.getUnpaidOrders(this.customer.customerId, this.storeInformation.storeId).pipe(
      tap((resp: any) => {
        if (resp.success === 1) {
          const filteredOrders = [];
          resp.orders.forEach(order => {
            let orderExists = this.customerOrders.some(customerOrder => customerOrder.orderId === order.orderId);
            if (!orderExists) {
              filteredOrders.push(order);
            }
          });

          this.customerOrders = [...this.customerOrders, ...filteredOrders];
          this.setPlacedOrders(this.createPlacedOrders());
        }
        this.loading = false;
      })
    ).subscribe();
  }

  getCustomerOrders = () => {
    this.configService.getCustomerOrders(this.customer.customerId, this.storeInformation.storeId).subscribe(
      (data: any) => {
        this.customerOrders = data.orders.current.filter((order) => {
          return order.orderSellStatus < 4;
        });
        this.orderQuantity = data.total;
        this.loading = false;
      },
    );
  }

  createPlacedOrders() {
    let placedOrders = [];
    this.customerOrders.forEach(order => {
      placedOrders.push({
        onlineOrderServeStatus: order.onlineOrderServeStatus,
        _id: order.orderId,
        orderSellStatus: order.orderSellStatus,
        seats: [{
          orderProducts: order.products,
          customerId: this.customer.customerId,
          customerName: this.customer.customerName,
          seatName: 'Online Ordering',
        }],
        subTotalAmount: order.subTotalAmount,
        taxAmount: order.taxAmount,
        totalAmount: order.totalAmount,
        updatedAt: order.updatedAt,
        customerEmail: this.customer.customerEmail,
        customerFirstName: this.customer.customerFirstName,
        customerId: this.customer.customerId,
        customerLastName: this.customer.customerLastName,
        customerMobile: this.customer.customerMobile,
        merchantId: this.storeInformation.merchantId
      });
    })
    return placedOrders;
  }

  setPlacedOrders(currentOrders) {
    this.store.dispatch(new SetPlacedOrder(currentOrders));
  }

  viewDetails(product, subTotalAmount: number) {
    this.dialog.open(MyTabComponent, {
      panelClass: 'full-screen-modal',
      data: { product, subTotalAmount }
    });
  }

  getProductServeStatus = (productSeverStatus) => {
    switch (productSeverStatus) {
      case 1:
        return 'Ordering';
      case 2:
        return 'Payment in Process';
      case 3:
        return 'Paid';
      case 4:
        return 'Completed';
      case 5:
        return 'Partial Refund';
      case 6:
        return 'Refunded';
      case 7:
        return 'Cancelled';
    }
  }

  getIngredientsAndModifiers(item) {
    let words = '';
    item.productIngredients.map((ingredient: any, i: number) => {
      words += ingredient.ingredientName;
      if (i < item.productIngredients.length - 1 && (!item.productModifiers || !item.productModifiers.length)) {
        words += ', ';
      }
    });

    item.productModifiers.map((modifier: any, i: number) => {
      words += modifier.modifierName;
      if (i < item.productModifiers.length - 1) {
        words += ', ';
      }
    });
    return words;
  }

  isGuestPayment = () => {
    if (this.customer.length !== 0) {
      this.showSummary = true;
    } else {
      this.router.navigate(['checkoutGuest']);
    }
  }

  reorder(item) {
    this.dialog.open(PaymentModalComponent, {
      data: { product: item, action: 'add' }, panelClass: 'full-screen-modal'
    });
  }
}
