import { AfterViewInit, Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { ConfigService } from '../../../services/config.service';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { OrderSummary } from '../../../components/Order-Summary/order-summary';
import { CurbsideModal } from '../../../components/Curbside-modal/curbside-modal';
import { SendReceipt } from '../../../components/SendReceipt/SendReceipt';
import * as LocalizedFormat from 'dayjs/plugin/localizedFormat';
import * as moment from 'dayjs';
moment.extend(LocalizedFormat)
import { Subscription } from 'rxjs';

@Component({
  selector: 'orders',
  templateUrl: './orders.html',
  styleUrls: ['./orders.scss'],
  providers: [MatSnackBar]
})
export class Orders implements OnInit, AfterViewInit, OnDestroy {

  customer: any;
  customerPhoto: any;
  orders: any = [];
  customerOrders: any = [];
  orderQuantity: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  storeInformation: any;
  orderSelected: any;
  fullScreen: boolean;
  loading = true;
  pastOrder: any;
  haveCurbsideOrder: any;
  tabSelected = 0;
  curbsideOrderId = localStorage.orderIdCurbside;
  open = false;
  innerWidth = 0;
  cartShopSub$ = new Subscription();
  orderTime = '';

  constructor(
    private store: Store<{ storeInformation: []; customer: []; }>,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<OrderSummary>,
    public configService: ConfigService) {
    // @ts-ignore
    this.cartShopSub$ = store.pipe(select('cartShop')).subscribe((data: any) => {
      this.storeInformation = data.storeInformation;
      this.customer = data.customer
    });
  }

  ngOnInit(): void {
    if (this.customer.length === 0) {
      this.router.navigate(['login']);
      return;
    }
    this.getCustomerOrders();
    this.getCustomerPhoto();
  }

  ngAfterViewInit() {
    this.onResize();
  }

  getCustomerPhoto = () => {
    if (this.customer.length !== 0) {
      return this.customerPhoto = 'https://' + this.customer.customerPhoto;
    }
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 5000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  goBack() {
    this.router.navigate(['home']);
  }

  orderTypeStyle = (orderType) => {
    // tslint:disable-next-line:prefer-const
    let ordeTypeSelected;

    switch (orderType) {
      case 1:
        ordeTypeSelected = 'unconfirmed';
        break;
      case 2:
        ordeTypeSelected = 'accepted';
        break;
      case 3:
        ordeTypeSelected = 'Cancelled';
        break;
      case 4:
        ordeTypeSelected = 'Preparing';
        break;
      case 5:
        ordeTypeSelected = 'Prepared';
        break;
      case 6:
        ordeTypeSelected = 'Picking-up';
        break;
      case 7:
        ordeTypeSelected = 'Completed';
        break;
      case 8:
        ordeTypeSelected = 'Cancelled';
        break;
    }
    return ordeTypeSelected;
  }

  getOrders = () => {
    this.configService.getOrdersForCustomerId(this.storeInformation.merchantId, this.storeInformation.storeId, this.customer.customerId).subscribe(
      (data: any) => {
        this.orders = data.response.sort((a: any, b: any) =>
          b.created_at - a.created_at
        );
      },
    );
  }

  getCustomerOrders = () => {
    this.configService.getCustomerOrders(this.customer.customerId, this.storeInformation.storeId).subscribe(
      (data: any) => {
        this.customerOrders = data.orders;
        this.orderQuantity = data.total;
        this.pastOrder = this.customerOrders.past;
        this.loading = false;
        this.isCurbsideOrderPending();
      },
    );
  }

  getTime = (date) => {
    return moment((date * 1000)).format('MMMM Do YYYY, h:mm:ss a');
  }

  selectOrder(order, time) {
    this.orderSelected = order;
    this.orderTime = time;
    if (this.innerWidth < 1088) {
      this.fullScreen = false;
      this.openModal();
    } else {
      this.fullScreen = true;
    }
  }

  openModal() {
    this.dialog.open(OrderSummary, { panelClass: 'full-screen-modal', data: { orderSelected: this.orderSelected } });
  }

  isCurbsideOrderPending = () => {
    let onlineOrderType: any;
    this.configService.getOrder(this.storeInformation.merchantId, this.curbsideOrderId)
      .subscribe((data: any) => {
        onlineOrderType = data.response.onlineOrderType;
        this.haveCurbsideOrder = this.customerOrders.current.find((order) => {
          return order.orderId === this.curbsideOrderId;
        });
        if (this.haveCurbsideOrder && onlineOrderType === 3) {
          this.tabSelected = 1;
          this.dialog.open(CurbsideModal, {
            panelClass: 'curbside-modal', data: this.curbsideOrderId
          });
        }
      });
  }

  goReportIssue(orderId) {
    this.router.navigate(['help/' + orderId]);
  }

  openSendReceipt = (order) => {
    this.dialog.open(SendReceipt, { data: { orderSelected: order } });
  }

  getCustomerName() {
    if (this.customer.length !== 0) {
      return `${this.customer.customerFirstName} ${this.customer.customerLastName}`
    }
    return null;
  }

  openSidebar() {
    if (window.innerWidth <= 576) {
      this.open = true;
    }
  }


  @HostListener('window:resize', ['$event'])
  onResize() {
    this.innerWidth = window.innerWidth;
    if (this.innerWidth < 1088) {
      this.fullScreen = false;
    } else {
      this.fullScreen = true;
    }
  }

  ngOnDestroy() {
    this.cartShopSub$.unsubscribe();
  }
}
