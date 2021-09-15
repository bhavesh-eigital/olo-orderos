import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { PaymentComponent } from '../../../components/Payment/payment.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfigService } from '../../../services/config.service';
import { select, Store } from '@ngrx/store';
import { findSetting } from '../../../utils/FindSetting';
import {
  RemoveFromCart,
  SetCart,
  SetCustomer,
  SetFavorites,
} from '../../../store/actions';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ThemePalette } from '@angular/material/core';
import { ProductModal } from '../../../components/Product/product-modal';
import { Product } from '../../../models/product';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
// @ts-ignore
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/map';
import * as LocalizedFormat from 'dayjs/plugin/localizedFormat';
import * as isoWeek from 'dayjs/plugin/isoWeek';
import * as moment from 'dayjs';
moment.extend(LocalizedFormat);
moment.extend(isoWeek);

@Component({
  selector: 'desktop-timer',
  templateUrl: './desktop-timer.component.html',
  styleUrls: ['./desktop-timer.component.scss'],
  providers: [ConfigService],
})
export class DesktopTimer implements OnInit, AfterViewChecked, AfterViewInit {
  constructor(
    private router: Router,
    private modalService: NgbModal,
    private snackBar: MatSnackBar,
    private configService: ConfigService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ActionsPopup>,
    private store: Store<{ storeInformation: []; cart: []; customer: [] }>
  ) {
    // @ts-ignore
    store.subscribe((state: any) => {
      const data = state.cartShop;
      this.cart = data.cart;
      this.storeInformation = data.storeInformation;
      this.customer = data.customer;
      this.restaurantHours = data.restaurantHours;
      this.popularProducts = data.topProducts;
      this.categories = data.categories;
      if(this.categories.length) {
        this.categorySelected = this.categories[0].categoryName;
      }

      this.guest =
        this.customer.length === 0
          ? 'Guest'
          : this.customer.customerFirstName +
            ' ' +
            this.customer.customerLastName;
      localStorage.setItem('itemNav', 'home');
    });
  }

  categories: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'left';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  closeSearch = false;
  color: ThemePalette = 'accent';
  loading = true;
  cart: any;
  subdomain: any;
  storeInformation: any;
  popularProducts: any;
  menuType = 1;
  error: any;
  textSearch = '';
  orderRefunded: any;
  searchProduct: any = [];
  idCategory: any = 0;
  newIdCategory: any;
  opened: boolean;
  customer: any;
  tableNumber = localStorage.getItem('tableNumber');
  guest: any = 'Guest';
  restaurantHours: any;
  categorySelected = 'popular';
  popular: HTMLElement;
  orderId = localStorage.getItem('orderId');
  currentOrderType = 2;
  totalAmountRefund = 0;
  subTotalAmountRefund = 0;
  scrolling = false;

  @ViewChild('tabs1') tabs1: ElementRef<HTMLDivElement>;
  @ViewChild('wrapper') wrapper: ElementRef<HTMLElement>;
  @ViewChild('popular') popularDiv: ElementRef<HTMLDivElement>;

  ngAfterViewInit() {
    // this.checkScroll();
  }

  ngAfterViewChecked(): void {
    this.checkScroll();
    if (this.newIdCategory) {
      this.goToNewCategory();
    }

    if (localStorage.getItem('categorySelected') !== null) {
      this.scrollTo(
        localStorage.getItem('categorySelected'),
        localStorage.getItem('categorySelectedId')
      );
      setTimeout(() => {
        localStorage.removeItem('categorySelected');
        localStorage.removeItem('categorySelectedId');
      }, 2000);
    }
  }

  ngOnInit(): void {
    this.getOrderRefund(this.orderId);
  }

  update = () => {
    if (!this.scrolling) {
      const popularEl = document.getElementById('popular');
      // if (popularEl) {
      //   const popularPosition = popularEl.getBoundingClientRect();
      //   if (popularPosition.top < 0 && popularPosition.top > -90) {
      //     this.categorySelected = 'popular';
      //     const tabsCollection = document.querySelectorAll('#tabs-1');
      //     tabsCollection.forEach(tabs => tabs.scrollTo({ left: 0, behavior: 'smooth' }));
      //     return;
      //   }
      // }
      this.categories.map((category, idx) => {
        if (idx === 0) {
          const popularPosition = popularEl.getBoundingClientRect();
          if (popularPosition.top < 0 && popularPosition.top > -90) {
            this.categorySelected = category.categoryName;
            const tabsCollection = document.querySelectorAll('#tabs-1');
            tabsCollection.forEach((tabs) =>
              tabs.scrollTo({ left: 0, behavior: 'smooth' })
            );
            return;
          }
        }
        let categoryEl = document.getElementById(idx.toString());
        if (!categoryEl) return;
        let categoryPosition = categoryEl.getBoundingClientRect();
        if (categoryPosition.top < 20 && categoryPosition.top > -45) {
          this.categorySelected = category.categoryName;
          const tabsCollection = document.querySelectorAll('#tabs-1');
          tabsCollection.forEach((tabs) => {
            const children = tabs.children;
            let right = 0;

            for (let i = 0; i < children.length; i++) {
              right += children[i].clientWidth + 20;
              if (idx === i) {
                tabs.scrollTo({ left: right - children[i].clientWidth - 20, behavior: 'smooth' });
              }
            }
          });
        }
      });
    }
  };

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 10000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  checkScroll() {
    const wrapper = document.getElementById('itemsWrapper');
    if (wrapper) {
      wrapper.addEventListener('scroll', this.update);
    }
  }

  setSearchBox = (event) => {
    this.textSearch = event.target.value;
    this.getProductByName(event.target.value);
  };

  getProductByName = (productName) => {
    this.configService
      .searchProduct(
        this.storeInformation.merchantId,
        this.storeInformation.storeId,
        productName,
        1
      )
      .subscribe(
        (data: any) => (this.searchProduct = data.response),
        (error) => (this.error = error)
      );
  };

  getRestaurantHours = () => {
    let dayOfTheWeek = '';
    switch (moment().isoWeekday()) {
      case 1:
        dayOfTheWeek = 'OnlineOrderingMondayHours';
        break;
      case 2:
        dayOfTheWeek = 'OnlineOrderingTuesdayHours';
        break;
      case 3:
        dayOfTheWeek = 'OnlineOrderingWednesdayHours';
        break;
      case 4:
        dayOfTheWeek = 'OnlineOrderingThursdayHours';
        break;
      case 5:
        dayOfTheWeek = 'OnlineOrderingFridayHours';
        break;
      case 6:
        dayOfTheWeek = 'OnlineOrderingSaturdayHours';
        break;
      case 7:
        dayOfTheWeek = 'OnlineOrderingSundayHours';
        break;
    }
    return (this.restaurantHours = findSetting(
      this.storeInformation,
      dayOfTheWeek
    ).split('|'));
  };

  redirect() {
    this.router.navigate(['products']);
  }

  checkout() {
    const orderGuest = findSetting(
      this.storeInformation,
      'OnlineStoreAllowOrderAsGuest'
    );

    if (this.customer !== '[]') {
      this.router.navigate(['checkout-refund']);
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

  goToNewCategory = () => {
    const prevId = this.idCategory;
    const index = this.newIdCategory;
    if (prevId !== index) {
      const newElement = document.getElementById(index);
      const name = this.categories[index - 1].categoryName;
      newElement.scrollIntoView({ block: 'start' });
      this.categorySelected = name;
      this.idCategory = index;
    }
    this.newIdCategory = '';
  };

  goToCategory(id: number) {
    this.newIdCategory = id;
    this.goToNewCategory();
    this.opened = true;
  }

  redirectMenu() {
    this.router.navigate(['home']);
  }

  redirectCustomer() {
    if (this.customer.length === 0) {
      this.router.navigate(['login']);
    } else {
      this.router.navigate(['customer']);
    }
  }

  redirectOrders() {
    this.router.navigate(['orderHistory']);
  }

  setCustomer(currentStore) {
    this.store.dispatch(new SetCustomer(currentStore));
  }

  setCart(currentCart) {
    this.store.dispatch(new SetCart(currentCart));
  }

  setFavorites(currentFavorites) {
    this.store.dispatch(new SetFavorites(currentFavorites));
  }

  redirectLogin() {
    this.setCustomer([]);
    this.setCart([]);
    this.setFavorites([]);
    localStorage.setItem('favorites', JSON.stringify([]));
    this.router.navigate(['login']);
  }

  selectCategory(category) {
    this.categorySelected = category;
  }

  scrollTo = (category, index) => {
    this.scrolling = true;
    setTimeout(() => {
      this.scrolling = false;
    }, 1100);

    if (index === 0) {
      this.categorySelected = this.categories[0].categoryName;
      this.popularDiv.nativeElement.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    try {
      const element = document.getElementById(index);
      element.scrollIntoView({ block: 'start', behavior: 'smooth' });
      this.categorySelected = category;
      this.idCategory = index;
    } catch (e) {}
  };

  scrollToPopular(element: any) {
    this.scrolling = true;
    setTimeout(() => {
      this.scrolling = false;
    }, 1100);
    this.idCategory = 0;
    element.scrollIntoView({ behavior: 'smooth' });
    this.selectCategory('popular');
  }

  closeSearching = () => {
    this.textSearch = '';
    this.closeSearch = !this.closeSearch;
  };

  orderTypeSelected(orderType) {
    this.currentOrderType = orderType;
  }

  isFav(productId: any) {}

  addFavorites(product: any) {}

  deleteFavorites(product: any) {}

  removeProduct(item: Product) {
    this.store.dispatch(new RemoveFromCart(item));
  }

  editProduct(item: Product) {
    this.dialog.open(ProductModal, {
      data: { product: item, action: 'edit' },
      panelClass: 'full-screen-modal',
    });
  }

  getTotalAmount() {
    return this.cart.reduce((acc, obj) => {
      return acc + obj.totalAmount * obj.quantity;
    }, 0);
  }

  getOrderRefund = (orderId) => {
    this.configService.getOrderRefund(orderId).subscribe((data: any) => {
      if (data.success === 0) {
        this.openSnackBar(data.message, 2);
        this.router.navigate(['home']);
      } else {
        if (data.response.isRefunded === true) {
          this.router.navigate(['home']);
          this.dialogRef.close();
        }
        this.orderRefunded = data.response;
        const product = this.cart[0];
        this.dialog.open(ActionsPopup, {
          width: '335px',
          height: '482px',
          data: { product, action: 'add' },
          disableClose: true,
        });
        this.getTotalsOrderRefund(this.orderId);
      }
    });
  };

  getSubTotalAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + obj.totalAmount * obj.quantity;
    }, 0);
  };

  getTotalAmountRefund = () => {
    return this.orderRefunded.removedProducts.reduce((acc, obj) => {
      return acc + obj.productTotal;
    }, 0);
  };

  getSubTotalAmountRefund = () => {
    return this.orderRefunded.removedProducts.reduce((acc, obj) => {
      return acc + obj.productUnitPrice;
    }, 0);
  };

  getTotalsOrderRefund = (orderId) => {
    this.configService.getOrderRefund(orderId).subscribe((data: any) => {
      this.orderRefunded = data.response;
      this.totalAmountRefund = this.getTotalAmountRefund();
      this.subTotalAmountRefund = this.getSubTotalAmountRefund();
      this.loading = false;
    });
  };

  refundCartDifference = () => {
    return this.getSubTotalAmount() - this.totalAmountRefund;
  };
}

@Component({
  selector: 'actions-popup',
  templateUrl: './actions-popup.html',
  styleUrls: ['./actions-popup.component.scss'],
  providers: [ConfigService, MatSnackBar],
})
export class ActionsPopup implements OnInit {
  @Input() product: any;
  cart: any;
  loading = true;
  storeInformation: any;
  optionSelected: boolean;
  horizontalPosition: MatSnackBarHorizontalPosition = 'left';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  amountRefunded = 0;
  countdown: any;
  refundType: any;
  totalAmountRefund = 0;
  subTotalAmountRefund = 0;
  orderId = localStorage.getItem('orderId');
  orderRefunded: any;
  clicked = false;

  constructor(
    private store: Store<any>,
    private router: Router,
    private configService: ConfigService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ActionsPopup>
  ) {
    // @ts-ignore
    store
      .pipe(select('cartShop'))
      .subscribe(
        (data) => (
          (this.cart = data.cart),
          (this.storeInformation = data.storeInformation)
        )
      );
  }

  ngOnInit(): void {
    this.getOrderRefund(this.orderId);
  }

  getOrderRefund = (orderId) => {
    this.configService.getOrderRefund(orderId).subscribe((data: any) => {
      if (data.success === 0) {
        this.dialogRef.close();
        this.openSnackBar(data.message, 2);
        this.router.navigate(['home']);
      } else {
        if (data.response.isRefunded === false) {
          this.orderRefunded = data.response;
          this.totalAmountRefund = this.getTotalAmountRefund();
          this.subTotalAmountRefund = this.getSubTotalAmountRefund();
          this.loading = false;
        } else {
          this.router.navigate(['home']);
        }
      }
    });
  };

  startCountdown(seconds) {
    this.countdown = seconds;
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown < 0) {
        clearInterval(interval);
      }
    }, 1000);
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 10000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  refundOrder(type) {
    if (type === 'partial') {
      this.refundType = 0;
      this.amountRefunded = this.totalAmountRefund;
    } else {
      this.refundType = 1;
      this.amountRefunded = this.orderRefunded.paidAmount;
    }
    this.optionSelected = true;
  }

  refundPartialOrComplete = () => {
    this.clicked = true;
    const params = {
      orderId: this.orderId,
      cancelType: this.refundType,
    };
    this.configService
      .createRefundPartialOrComplete(params)
      .subscribe((data: any) => {
        if (data.success === 1) {
          this.openSnackBar(data.message, 1);
          localStorage.setItem('isRefundOrder', 'false');
          this.dialogRef.close();
          this.router.navigate(['refund']);
          this.clicked = false;
        } else {
          this.openSnackBar(data.message, 2);
          localStorage.setItem('isRefundOrder', 'false');
          this.dialogRef.close();
          this.router.navigate(['home']);
          this.clicked = false;
        }
      });
  };

  refund = () => {
    const params = {
      orderId: this.orderId,
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      reason: 'No reason',
      // amount: this.amountRefunded
      refundType: this.refundType,
    };
    this.configService.createRefund(params).subscribe((data: any) => {
      if (data.success === 1) {
        this.updateOrder(this.refundType);
      } else {
        this.openSnackBar(data.message, 2);
      }
    });
  };

  updateOrder = (orderType) => {
    const paramsPartial = {
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      _id: this.orderRefunded.order.orderId,
      orderSellStatus: 4,
      status: 1,
      isReplaced: false,
    };

    const paramsComplete = {
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      orderSellStatus: 6,
      onlineOrderServeStatus: 8,
      _id: this.orderRefunded.order.orderId,
      status: 1,
      isReplaced: false,
    };

    this.configService
      .generateOrder(orderType === 'partial' ? paramsPartial : paramsComplete)
      .subscribe((data: any) => {
        this.dialogRef.close();
        this.router.navigate(['home']);
      });
  };

  cancel() {
    this.optionSelected = false;
  }

  onSubmit() {
    this.dialogRef.close();
    setTimeout(() => {
      this.goToReceived();
    }, 1200);
  }

  goToReceived() {
    this.router.navigate(['refund']);
    this.optionSelected = false;
  }

  isCompleteRefund = () => {
    if (this.orderRefunded) {
      return (
        this.orderRefunded.order.seats[0].orderProducts.length ===
          this.orderRefunded.removedProducts.length || false
      );
    } else {
      return false;
    }
  };

  closeModal = () => {
    this.dialogRef.close();
  };

  getSubTotalAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + obj.totalAmount * obj.quantity;
    }, 0);
  };

  getSubTotalAmountRefund = () => {
    return this.orderRefunded.removedProducts.reduce((acc, obj) => {
      return acc + obj.productUnitPrice;
    }, 0);
  };

  getTotalAmountRefund = () => {
    return this.orderRefunded.removedProducts.reduce((acc, obj) => {
      return acc + obj.productTotal;
    }, 0);
  };

  refundCartDifference = () => {
    return this.getSubTotalAmount() - this.totalAmountRefund;
  };
}
