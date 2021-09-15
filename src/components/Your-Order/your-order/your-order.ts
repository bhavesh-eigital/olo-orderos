import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { findSetting } from '../../../utils/FindSetting';
import { MatDialog } from '@angular/material/dialog';
// import { orderBy } from 'lodash';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { ConfigService } from '../../../services/config.service';
import { AfterLoginViews, UIService } from 'src/services/ui.service';
import { getCurrentAddressData } from 'src/utils/getCurrentAddressData';
import orderBy from 'lodash.orderby';
import { Subscription } from 'rxjs';
import { OnDestroy } from '@angular/core';

@Component({
  selector: 'your-order',
  templateUrl: './your-order.html',
  styleUrls: ['./your-order.scss']
})
export class YourOrder implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  isClosed = true;
  @Input() currentOrderType: any;
  cart: any = [];
  storeInformation: any = [];
  customer: any = [];
  isPause = localStorage.getItem('pauseOrder');
  currency = localStorage.getItem('currency');
  isOloIntegrated = localStorage.getItem('isOloIntegrated') === 'true';
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  addressDefault = localStorage.addressDefault ? JSON.parse(localStorage.addressDefault) : null;
  customerDefaultAddress: any;
  restaurantHours: any;

  storeSub$ = new Subscription();

  @Input() open: boolean = false;
  @Output() openChange = new EventEmitter<boolean>();
  @ViewChild('sidebar') sidebar: ElementRef<HTMLDivElement>;
  @ViewChild('sidebarLayer') layer: ElementRef<HTMLDivElement>;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    public configService: ConfigService,
    private store: Store<{ storeInformation: []; cart: [], customer: [] }>,
    private dialog: MatDialog,
    private renderer: Renderer2,
    private uiService: UIService
  ) {
    this.storeSub$ = store.subscribe((state: any) => {
      const data = state.cartShop;
      this.customer = data.customer;
      this.cart = data.cart;
      this.storeInformation = data.storeInformation;
      this.restaurantHours = data.restaurantHours;
      this.customerDefaultAddress = data.customerDefaultAddress;
    });
  }

  ngOnInit(): void {
    this.isRestaurantOpen();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isRestaurantOpen();
    if (this.layer && this.sidebar) {
      if (changes.open?.currentValue) {
        this.openSidebar();
      } else {
        this.closeSidebar();
      }
    }
  }

  ngAfterViewInit() {
    this.uiService.materialInputEventListener();
  }

  openSidebar() {
    this.open = true
    this.renderer.addClass(this.layer.nativeElement, 'layer-active');
    this.renderer.addClass(this.sidebar.nativeElement, 'open');
  }


  closeSidebar() {
    this.open = false;
    this.openChange.emit(false);
    this.renderer.removeClass(this.layer.nativeElement, 'layer-active');
    this.renderer.removeClass(this.sidebar.nativeElement, 'open');
  }

  @HostListener('window: keyup.escape', ['$event'])
  onEscapePressed() {
    if (this.open) {
      this.closeSidebar();
    }
  }


  getTotalAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.totalAmount) * obj.quantity;
    }, 0) + this.getTaxAmount();
  }


  getSubtotalAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.subTotalAmount) * obj.quantity;
    }, 0);
  }

  getTaxAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.taxes) * obj.quantity;
    }, 0);
  }

  calculateTaxPercentage = () => (this.getTaxAmount() * 100 / this.getSubtotalAmount()).toFixed(2) + "%"


  openSnackBar(message, status) {
    this.snackBar.open(message, 'OK', {
      duration: 5000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }


  validateDeliveryDistance() {
    if (!this.customerDefaultAddress && !localStorage.temporalDefaultAddress) {
      this.openSnackBar('Please Select a location', 1);
      return;
    }
    const { currentAddress, currentCity } = getCurrentAddressData(this.customerDefaultAddress);
    this.configService.getDeliveryDistance(this.storeInformation.storeId, currentAddress, currentCity)
      .subscribe((data: any) => {
        if (data.inRange === true) {
          this.router.navigate(['checkout']);
        } else {
          this.openSnackBar('The address is not in the delivery range, please choose another address.', 2);
        }
      });
  }

  checkout() {
    const orderGuest = findSetting(this.storeInformation, 'OnlineStoreAllowOrderAsGuest');
    if (orderGuest === 'true' && localStorage.tableNumber > 0) {
      this.router.navigate(['dinein']);
    } else {
      if (this.customer.length === 0) {
        this.uiService.afterLogin = AfterLoginViews.TO_CHECK_OUT
        this.router.navigate(['login']);
        return;
      }
      if (this.customer !== '[]') {
        if (localStorage.orderType === '1') {
          if (this.isOloIntegrated) {
            this.router.navigate(['checkout']);
          } else {
            this.validateDeliveryDistance();
          }
        } else {
          this.router.navigate(['checkout']);
        }
      } else {
        if (orderGuest === 'false') {
          this.router.navigate(['login']);
        } else {
          this.router.navigate(['checkout']);
        }
      }
    }
  }

  isDisabled() {
    return this.isPause === 'true' || this.cart.length === 0 || this.isClosed === true;
  }

  orderByDate = (cart) => {
    return orderBy(cart, 'createAt');
  }

  isRestaurantOpen() {
    if (this.currentOrderType === 1) {
      const RestaurantInfo = this.restaurantHours.find((restaurantDineIn) => {
        return restaurantDineIn.kind === 'DELIVERY';
      });
      RestaurantInfo?.status === 'CLOSED' ? this.isClosed = true : this.isClosed = false;
    }
    if (this.currentOrderType === 2) {
      const RestaurantInfo = this.restaurantHours.find((restaurantDineIn) => {
        return restaurantDineIn.kind === 'PICKUP';
      });
      RestaurantInfo?.status === 'CLOSED' ? this.isClosed = true : this.isClosed = false;
    }
    if (this.currentOrderType === 3) {
      const RestaurantInfo = this.restaurantHours.find((restaurantDineIn) => {
        return restaurantDineIn.kind === 'CURBSIDE';
      });
      RestaurantInfo?.status === 'CLOSED' ? this.isClosed = true : this.isClosed = false;
    }
    if (this.currentOrderType === 4) {
      const RestaurantInfo = this.restaurantHours.find((restaurantDineIn) => {
        return restaurantDineIn.kind === 'DINE_IN';
      });
      RestaurantInfo?.status === 'CLOSED' ? this.isClosed = true : this.isClosed = false;
    }
  }

  handleEmptyStateButtonClick() {
    this.closeSidebar();
    if (!this.router.url.includes('menu')) {
      this.router.navigate(['home']);
    }
  }

  getTotalItemsQuantity() {
    return this.cart.reduce((acc, cur) => acc + (1 * cur.quantity), 0);
  }

  ngOnDestroy(): void {
    this.storeSub$ = new Subscription();
  }
}
