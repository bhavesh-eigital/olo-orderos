import { AfterViewInit, Component, EventEmitter, HostListener, Inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { ConfigService } from '../../services/config.service';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CountryISO, SearchCountryField, TooltipLabel } from 'ngx-intl-tel-input';
import { Reorder } from '../../services/reorder.service';
import * as LocalizedFormat from 'dayjs/plugin/localizedFormat';
import * as moment from 'dayjs';
import { TicketComponent } from '../ticket/modal/ticket.component';
import { tap } from 'rxjs/operators';
moment.extend(LocalizedFormat)


@Component({
  selector: 'order-summary',
  templateUrl: './order-summary.html',
  styleUrls: ['./order-summary.scss'],
  providers: [MatSnackBar, Reorder]
})
export class OrderSummary implements OnInit, OnChanges, AfterViewInit {

  @Input() orderSelected: any;
  @Input() orderTime: any;
  customer: any;
  order: any = [];
  currentModifiers = [];
  modifiers = [];
  paymentInfo: any = false;
  showPayments = false;
  payment: any;
  numberPhone: any;
  email: any;
  customerOrders: any = [];
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  storeInformation: any;
  hide: boolean;
  variant: any;
  loading = true;
  panelOpenState = false;
  error: any;

  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  @Output() hideChange = new EventEmitter();

  constructor(
    private store: Store<{ storeInformation: []; customer: []; }>,
    private router: Router,
    private reorder: Reorder,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<OrderSummary>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public configService: ConfigService) {
    // @ts-ignore
    // tslint:disable-next-line:no-shadowed-variable
    store.pipe(select('cartShop')).subscribe((data: any) => (this.storeInformation = data.storeInformation, this.customer = data.customer));
    this.hide = false;
    this.email = this.customer.customerEmail;
    this.numberPhone = this.customer.customerMobile;

    if (data === []) {
      this.getOrderById();
      this.getOrderPaymentsInformation();
    } else {
      this.orderSelected = this.data.orderSelected;
    }
  }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.getOrderById();
    this.hide = false;
  }

  ngOnChanges(changes:SimpleChanges) {
    this.getOrderById();
    this.hide = false;
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

  goReportIssue(orderId) {
    this.router.navigate(['help/' + orderId]);
    this.dialogRef.close();
  }

  getOrderById = () => {
    this.loading = true;
    this.configService.getOrder(this.storeInformation.merchantId, this.orderSelected.orderId)
      .subscribe((data: any) => {
        this.order = data.response;
        this.variant = this.order.seats[0].orderProducts[0].productUnitPrice;
        this.currentModifiers = this.order.seats[0].orderProducts[0].productModifiers;
        this.getModifiers();
        this.getOrderPaymentsInformation();
      });
  }

  getOrderPaymentsInformation = () => {
    this.paymentInfo = [];
    this.configService.getOrderPayments(this.order.merchantId, this.order.storeId, this.order.orderId)
      .subscribe((data: any) => {
        this.paymentInfo = data.response[0];
        this.paymentInfo === undefined ? this.showPayments = false : this.showPayments = true;
        this.loading = false;
      });
  }

  getTime = (date) => {
    return moment((date * 1000)).format('ll');
  }

  changeTimeFormat = (date) => {
    return moment((date * 1000)).format('h:mm:ss a');
  }

  getTotalPaymentAmount = (transactionIds) => {
    return transactionIds.reduce((acc, obj) => {
      return acc + obj.transactionAmount;
    }, 0);
  }

  getModifiers = () => {
    this.modifiers = [];
    this.currentModifiers.map((modifier) => {
      return this.modifiers.push({
        modifierName: modifier.modifierName,
        modifierPrice: modifier.modifierPrice
      });
    });
  }

  closeDialog(): void {
    if (screen.width < 500
    ) {
      this.dialogRef.close();
    } else {
      this.hide = true;
      this.hideChange.emit();
    }
  }


  sendReceiptMobile = () => {
    const paramsMobile = {
      orderId: this.orderSelected.orderId,
      mobile: this.numberPhone.e164Number,
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId
    };

    this.configService.sendReceipt(paramsMobile).subscribe(
      (data: any) => {
        if (data.success === 1) {
          this.openSnackBar(data.message, 1);
        } else {
          this.openSnackBar(data.message, 0);
        }
      },
      (error) => (this.error = error)
    );
  }

  sendReceipt = () => {
    const paramsEmail = {
      orderId: this.orderSelected.orderId,
      email: this.email,
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId
    };

    this.configService.sendReceipt(paramsEmail).subscribe(
      (data: any) => {
        if (data.success === 1) {
          this.openSnackBar(data.message, 1);
        } else {
          this.openSnackBar(data.message, 0);
        }
      },
      (error) => (this.error = error)
    );
  }

  sendReceiptMobileResponsive = () => {
    const paramsMobile = {
      orderId: this.orderSelected.orderId,
      mobile: this.numberPhone.e164Number,
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId
    };

    this.configService.sendReceipt(paramsMobile).subscribe(
      (data: any) => {
        if (data.success === 1) {
          this.openSnackBar(data.message, 1);
        } else {
          this.openSnackBar(data.message, 0);
        }
      },
      (error) => (this.error = error)
    );
  }

  getOnlineOrderType = (orderTypeNumber) => {
    let orderType = '';
    switch (orderTypeNumber) {
      case 1:
        orderType = 'Delivery';
        break;
      case 2:
        orderType = 'Pick Up';
        break;
      case 3:
        orderType = 'Curbside';
        break;
    }
    return orderType;
  }

  reOrder(orderId) {
    this.reorder.reorderByOrderId(this.storeInformation.merchantId, orderId);
    this.dialogRef.close();
  }

  @HostListener('window:resize')
  onResize() {
    if(window.innerWidth >= 1088 && Object.keys(this.dialogRef).length) {
      this.dialogRef.close();
    }
  }

  goToDeliveryTracker(order) {
    localStorage.setItem('orderId', order.orderId);
    this.router.navigate(['delivery/state'], {queryParams: {orderId: order.orderId, deliveryId: order.olo.delivery}});
  }

  openCreateTicket(order) {
    this.dialog.open(TicketComponent, {
      data: {
        customerId: this.customer.customerId,
        deliveryId: order.olo.delivery
      }
    } ).afterClosed().pipe(
    ).subscribe();
  }

  seeTicket(order) {
    this.router.navigate(['tickets'], {queryParams: {orderId: order.orderId}});
  }
}
