import {AfterViewInit, Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild} from '@angular/core';
import {UIService} from '../../services/ui.service';
import {ConfigService} from '../../services/config.service';
import {select, Store} from '@ngrx/store';
import {map} from 'rxjs/operators';
import {Reorder} from "../../services/reorder.service";
import { findSetting } from 'src/utils/FindSetting';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-orders-history2',
  templateUrl: './orders-history2.component.html',
  styleUrls: ['./orders-history2.component.scss']
})
export class OrdersHistory2Component implements OnInit, AfterViewInit {

  open = false;
  currentTab = 0;
  customer: any;
  customerName: string;
  pastOrders = [];
  currentOrders = [];
  loading = false;
  showTitle = true;
  storeInformation: any;
  OnlineStoreDineIn = 'true';
  @ViewChild('indicator') indicator: ElementRef;


  constructor(
    private renderer: Renderer2,
    public uiService: UIService,
    private reorder: Reorder,
    private configService: ConfigService,
    private store: Store,
    private snackBar: MatSnackBar
  ) {
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data: any) => {
      this.storeInformation = data.storeInformation;
      this.customer = data.customer;
      this.customerName = this.customer.customerFirstName + ' ' + this.customer.customerLastName
    });
  }

  ngOnInit(): void {
    this.getCustomerOrders();
    this.OnlineStoreDineIn = findSetting(this.storeInformation, 'OnlineStoreDineIn');

    this.loading = true;
  }

  ngAfterViewInit() {
    this.onResize();
  }

  switchTab(tabNumber: number) {
    if (tabNumber === 0) {
      this.renderer.removeClass(this.indicator.nativeElement, 'right');
      this.renderer.addClass(this.indicator.nativeElement, 'left');
    } else {
      this.renderer.removeClass(this.indicator.nativeElement, 'left');
      this.renderer.addClass(this.indicator.nativeElement, 'right');
    }
    this.currentTab = tabNumber;
  }

  getStatus(status) {
    switch (status) {
      case 1:
        return 'Unconfirmed';
      case 2:
        return 'accepted';
      case 3:
        return 'Cancelled';
      case 4:
        return 'Preparing';
      case 5:
        return 'Prepared';
      case 6:
        return 'Picking-up';
      case 7:
        return 'Completed';
      case 8:
        return 'Cancelled';
      default:
        return
    }
  }


  getCustomerOrders() {
    this.loading = true;
    this.configService.getCustomerOrders(this.customer.customerId, this.storeInformation.storeId).pipe(
      map(({ orders }: any) => {
        this.currentOrders = orders.current;
        this.pastOrders = orders.past;
        this.loading = false;
      })
    ).subscribe();
  }

  getOrderType() {
    return this.currentTab === 0 ? 'past' : 'current'
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth < 365) {
      this.showTitle = false;
    } else {
      this.showTitle = true;
    }
  }

  reOrder(orderId: any) {
    if (this.OnlineStoreDineIn === 'false') {
      this.snackBar.open('This store has disabled the option to order from Dinein', '', {
        duration: 5000,
        panelClass: ['red-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }
    this.reorder.reorderByOrderId(this.storeInformation.merchantId, orderId);
  }
}
