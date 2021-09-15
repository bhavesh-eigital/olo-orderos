import { Component, OnChanges, OnInit } from '@angular/core';
import { ConfigService } from '../services/config.service';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterEvent } from '@angular/router';
import {
  SetCart,
  SetCategories,
  SetCustomer,
  SetDefaultAddress,
  SetDefaultPaymentMethod,
  SetPaymentMethods,
  SetPlacedOrder,
  SetRestaurantHours,
  SetStore,
  SetTemporalCustomer,
  SetTopProducts
} from '../store/actions';
import { select, Store } from '@ngrx/store';
import { Location } from '@angular/common';
import { WebSocketService } from '../services/socket.service';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { orderServeType } from '../utils/OrderServeType';
import { findSetting } from '../utils/FindSetting';
import { Reorder } from "../services/reorder.service";
import { UIService } from '../services/ui.service';
import { switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [ConfigService, WebSocketService, MatSnackBar, Reorder],
})
export class AppComponent implements OnInit, OnChanges {
  loading: boolean;
  currentStore = JSON.parse(localStorage.getItem('cartShop'));
  orderObj: any;
  customer: any;
  tableNumber = '';
  orderId: any;
  customerRefundId: any;
  storeInformation: any;
  cart: any;
  error: any;
  subdomain = '';
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  paymentInfo: any;
  paymentMethods: any[];
  defaultPaymentMethod: '';
  customerDefaultAddress: any;
  topProducts: any;
  categories: any;
  menuType = 1;

  constructor(
    private store: Store<{ storeInformation: []; cart: []; customer: []; placedOrders: [] }>,
    private actRoute: ActivatedRoute,
    private configService: ConfigService,
    private reorder: Reorder,
    private webSocket: WebSocketService,
    private location: Location,
    private snackBar: MatSnackBar,
    private router: Router,
    private uiService: UIService
  ) {

    this.setThemeColor(localStorage.themeColor);

    router.events.subscribe((event: RouterEvent): void => {
      if (event instanceof NavigationStart) {
        this.loading = true;
      } else if (event instanceof NavigationEnd) {
        this.loading = false;
      }
    });
    // @ts-ignore
    // tslint:disable-next-line:no-shadowed-variable
    store.pipe(select('cartShop')).subscribe((data) => (this.customer = data.customer));

    store.subscribe((state: any) => {
      const data = state.cartShop;
      this.defaultPaymentMethod = data.customerDefaultPaymentMethod;
      this.paymentMethods = data.paymentMethods;
      this.customerDefaultAddress = data.customerDefaultAddress;
    });
    try {
      this.webSocket.socket.on('data', (data) => {
        const isSetting = data[0].model === 'setting';
        const setting = data[0].data[0];

        if (isSetting === true) {
          if (setting.settingName === 'OnlineStorePauseOrder') {
            localStorage.setItem('pauseOrder', setting.settingValue);
          }
          if (setting.settingName === 'OnlineStoreAutoAccept') {
            localStorage.setItem('autoAccept', setting.settingValue);
          }
          if (setting.settingName === 'OnlineStoreDineInAutoAccept') {
            localStorage.setItem('autoAcceptDineIn', setting.settingValue);
          }
          if (setting.settingName === 'OnlineStoreDineInPauseOrder') {
            localStorage.setItem('OnlineStoreDineInPauseOrder', setting.settingValue)
          }
        }

        const isOrder = data[0].model === 'order';
        const orderServeStatus = data[0].data[0].onlineOrderServeStatus;
        let isCustomer = '';

        try {
          isCustomer = data[0].data[0].seats[0].customerId;
        } catch (e) {
          // console.log(e);
        }

        if (isCustomer === this.customer.customerId) {
          if (isOrder === true || orderServeStatus !== undefined) {
            if (orderServeStatus > 1) {
              if (orderServeStatus !== 1) {
                this.openSnackBar(
                  orderServeType(orderServeStatus),
                  orderServeStatus === 8 ? 2 : 1
                );
              }
            }
          }
        }
      });
    } catch (e) {
      console.log(e);
    }


    this.actRoute.queryParamMap.subscribe((params) => {
      this.orderObj = { ...params };
      this.getDataFromRedirectLink(this.orderObj.params.type);
    });
    if (localStorage.getItem('tableNumber') !== null) {
      localStorage.setItem('orderType', '4');
    }
  }

  ngOnChanges(): void {
    if (this.currentStore !== null) {
      this.setCart(this.currentStore.cart);
      this.setStoreInformation(this.currentStore.storeInformation);
      this.setCustomer(this.currentStore.customer);
      this.setPlacedOrders(this.currentStore.placedOrders);
      this.setPaymentMethods(this.currentStore.paymentMethods);
      this.setDefaultPaymentMethod(this.currentStore.customerDefaultPaymentMethod);
      this.setDefaultAddress(this.getCurrentAddressDefault(this.customer.customerDefaultAddressId));
      this.setRestaurantHours(this.currentStore.restaurantHours);
      this.setTopProducts(this.currentStore.topProducts);
      this.setCategories(this.currentStore.categories);
      this.setTemporalCustomer(this.currentStore.temporalCustomer)
    }
    const subdomains = window.location.hostname;

    if (subdomains.indexOf('.') < 0 || subdomains.split('.')[0] === 'www') {
      this.subdomain = '';
    } else {
      if (subdomains.split('.')[0].length === 2) {
        this.subdomain = subdomains.split('.')[1];
      } else {
        this.subdomain = subdomains.split('.')[0];
      }
    }
    this.getStore();
  }

  getDataFromRedirectLink = (type) => {
    if (type === 'cfd-checkout') {
      return this.loadCheckoutCdf();
    }
    if (type === 'qr-at-table') {
      this.loadQrAtTable();
      localStorage.setItem('orderType', '4');
    }
    if (type === 'customer') {
      return this.loadCustomer();
    }
    if (type === 'refund') {
      return this.loadRefund();
    }
    if (type === 'curbside') {
      return this.loadCurbside();
    }
    if (type === 'loginMedia') {
      return this.loadLoginCustomer();
    }
  }

  loadCheckoutCdf = () => {
    this.orderId = this.orderObj.params.orderId;
    localStorage.setItem('orderId', this.orderId);
    localStorage.setItem('token', this.orderObj.params.accessToken);
    this.configService.getStore(this.subdomain).subscribe(
      (data: any) => {
        this.setStoreInformation(data.response);
        this.getOrderPaymentsInformation(data.response);
      },
      (error) => (this.error = error)
    );
  }


  validateTable = (tableNumber: string, storeId: string) => {
    return this.configService.validateTable(tableNumber, storeId);
  }

  loadQrAtTable = () => {
    this.tableNumber = this.orderObj.params.tableNumber;
    const storeId = this.orderObj.params.storeId;
    this.validateTable(this.tableNumber, storeId).pipe(
      switchMap((resp: any) => {
        if(resp.success === 1) {
          localStorage.setItem('tableId', resp.response.tableId);
          localStorage.setItem('tableNumber', this.tableNumber);
          return this.getStoreData();
        }
        return of(this.goBackToScan('Table does not Exist'));
      })
    ).subscribe({error: error => this.error = error});
  }

  goBackToScan = (message: string) => {
    this.openSnackBar(message, 1);
    this.router.navigate(['/scanner-table']);
  }

  getStoreData() {
    return this.configService.getStore(this.subdomain).pipe(
      tap((data: any) => {
        this.setStoreInformation(data.response);
        localStorage.setItem('orderType', '4');
        localStorage.OnlineStoreAllowOrderWithoutPaying = findSetting(data.response, 'OnlineStoreAllowOrderWithoutPaying') || 'false';
        localStorage.OnlineOrderingAcceptCashPayments = findSetting(data.response, 'OnlineOrderingAcceptCashPayments') || 'false';
        localStorage.OnlineStoreAllowOrderAsGuest = findSetting(data.response, 'OnlineStoreAllowOrderAsGuest') || 'false';
        localStorage.OnlineStoreDineInPauseOrder = findSetting(data.response, 'OnlineStoreDineInPauseOrder');
        this.router.navigate(['dinein']);
      })
    )
  }

  loadCustomer = () => {
    this.configService.getStore(this.subdomain).subscribe(
      (data: any) => {
        this.setStoreInformation(data.response);
        this.configService
          .getCustomerFavoritesProducts(
            data.response.storeId,
            data.response.merchantId,
            this.orderObj.params.customerId
          ).subscribe((dataFavorites: any) => {
            this.setCustomer(dataFavorites.response);
            this.router.navigate(['orderHistory']);
          });
      },
      (error) => (this.error = error)
    );
  }

  loadRefund = () => {
    this.orderId = this.orderObj.params.orderId;
    localStorage.setItem('orderId', this.orderId);
    localStorage.setItem('token', this.orderObj.params.accessToken);
    localStorage.setItem('isRefundOrder', 'true');
    this.configService.getStore(this.subdomain).subscribe(
      (data: any) => {
        this.setStoreInformation(data.response);
        this.configService.getFavoriteCustomer(data.response.merchantId, data.response.storeId, this.orderObj.params.customerId)
          .subscribe((dataCustomer: any) => {
            this.setCustomer(dataCustomer.response);
            this.setDefaultAddress(this.getCurrentAddressDefault(dataCustomer.response.customerDefaultAddressId));
            this.router.navigate(['refundRequest']);
          });
      },
      (error) => (this.error = error)
    );
  }

  loadCurbside = () => {
    this.orderId = this.orderObj.params.orderId;
    localStorage.setItem('orderIdCurbside', this.orderId);
    this.router.navigate(['orders']);
  }

  loadLoginCustomer = () => {
    const customerId = this.orderObj.params.customerId;
    const isNew = this.orderObj.params.isNew;
    localStorage.token = this.orderObj.params.accessToken;
    this.configService.getStore(this.subdomain).subscribe(
      (data: any) => {
        this.setStoreInformation(data.response);
        this.configService.getFavoriteCustomer(data.response.merchantId, data.response.storeId, customerId)
          .subscribe((dataCustomer: any) => {
            this.setCustomer(dataCustomer.response);
            this.setDefaultAddress(this.getCurrentAddressDefault(dataCustomer.response.customerDefaultAddressId));
            if (isNew === 'true') {
              this.router.navigate(['customer']);
            } else {
              this.router.navigate(['home']);
            }
          });
      },
      (error) => (this.error = error)
    );
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 5000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  getOrderPaymentsInformation = (storeInformation) => {
    this.configService
      .getOrderPayments(
        storeInformation?.merchantId,
        storeInformation?.storeId,
        localStorage.getItem('orderId')
      )
      .subscribe((data: any) => {
        this.paymentInfo = data.response;
        if (this.paymentInfo.length === 0) {
          this.router.navigate(['checkout/cdf']);
        } else {
          this.router.navigate(['receipt-cfd']);
        }
      });
  }

  ngOnInit(): void {
    if (this.currentStore !== null) {
      this.setCart(this.currentStore.cart);
      this.setStoreInformation(this.currentStore.storeInformation);
      this.setCustomer(this.currentStore.customer);
      this.setCustomer(this.currentStore.customer);
      this.setPlacedOrders(this.currentStore.placedOrders);
      this.setPaymentMethods(this.currentStore.paymentMethods);
      this.setDefaultPaymentMethod(this.currentStore.customerDefaultPaymentMethod);
      this.setRestaurantHours(this.currentStore.restaurantHours);
      this.setTopProducts(this.currentStore.topProducts);
      this.setCategories(this.currentStore.categories);
      this.setTemporalCustomer(this.currentStore.temporalCustomer);
      // this.setDefaultAddress(this.getCurrentAddressDefault(this.customer));
    }
    const subdomains = window.location.hostname;
    if (subdomains.indexOf('.') < 0 || subdomains.split('.')[0] === 'www') {
      this.subdomain = '';
    } else {
      if (subdomains.split('.')[0].length === 2) {
        this.subdomain = subdomains.split('.')[1];
      } else {
        this.subdomain = subdomains.split('.')[0];
        localStorage.subdomain = this.subdomain;
      }
    }
    this.getStore();
  }

  setCart(currentCart) {
    this.store.dispatch(new SetCart(currentCart));
  }

  setStoreInformation(currentStore) {
    this.store.dispatch(new SetStore(currentStore));
  }

  setCustomer(currentStore) {
    this.store.dispatch(new SetCustomer(currentStore));
  }

  setPlacedOrders(currentOrders) {
    this.store.dispatch(new SetPlacedOrder(currentOrders));
  }

  setPaymentMethods(paymentMethods) {
    this.store.dispatch(new SetPaymentMethods(paymentMethods));
  }

  setDefaultPaymentMethod(defaultPaymentMethods) {
    this.store.dispatch(new SetDefaultPaymentMethod(defaultPaymentMethods));
  }

  setDefaultAddress(defaultAddress) {
    this.store.dispatch(new SetDefaultAddress(defaultAddress));
  }

  setRestaurantHours(restaurantHours) {
    this.store.dispatch(new SetRestaurantHours(restaurantHours));
  }

  setTopProducts(topProducts) {
    this.store.dispatch(new SetTopProducts(topProducts));
  }

  setCategories(categories) {
    this.store.dispatch(new SetCategories(categories));
  }

  setTemporalCustomer(customer) {
    this.store.dispatch(new SetTemporalCustomer(customer))
  }

  getStore = () => {
    this.configService.getStore(this.subdomain).subscribe(
      (data: any) => {
        if (data.success === 1) {
          localStorage.setItem('themeColor', data.response)
          this.setThemeColor(data.response.storeFrontTheme);
          this.setStoreInformation(data.response);
          this.getTokenStore(data.response);
          this.getRestaurantHours(data.response.storeId);
          this.getTopProducts(data.response.storeId, data.response.merchantId);
          this.getCategories(data.response.storeId, data.response.merchantId);
          // config store
          localStorage.setItem('currency', this.getCurrency(data.response));
          localStorage.setItem('autoAccept', findSetting(data.response, 'OnlineStoreAutoAccept') || 'false');
          localStorage.setItem('pauseOrder', findSetting(data.response, 'OnlineStorePauseOrder') || 'false');
          localStorage.setItem('autoAcceptDineIn', findSetting(data.response, 'OnlineStoreDineInAutoAccept') || 'false');
          localStorage.setItem('provider', findSetting(data.response, 'OnlineStorePaymentProvider'));
          localStorage.setItem('isOloIntegrated', findSetting(data.response, 'OnlineOloDelivery') );
        } else {
          this.router.navigate(['noFound']);
        }
      },
      (error) => (this.error = error)
    );
  }

  getTokenStore = (storeInformation) => {
    const params = {
      storeId: storeInformation?.storeId,
      merchantId: storeInformation?.merchantId,
      type: 'online_ordering',
    };
    this.configService.getTokenStore(params).subscribe((data: any) => {
      sessionStorage.setItem('token', data.data.token);
      this.webSocket.connectSocket(data.data.token);
    });
  }

  getCurrency = (storeInformation) => {
    const currentCurrency = findSetting(storeInformation, 'Currency');
    const currency = currentCurrency.split('-');
    return currency[1];
  }

  setThemeColor = (themeColor) => {
    const color = themeColor ? themeColor : '#E91E63';
    this.uiService.setGlobalThemeColor(color);
  }

  getCurrentAddressDefault = (addressId) => {
    const addressDefault = this.customer.customerAdresses.find((address) => {
      return address._id === addressId;
    });
    return addressDefault === undefined ? '' : addressDefault;
  }

  getRestaurantHours = (storeId) => {
    this.configService.getGetRestaurantHours(storeId)
      .subscribe((data: any) => {
        if (data.success === 1) {
          this.setRestaurantHours(data.response.orderingInfo);
        } else {
          this.openSnackBar(data.message, 2);
        }
      });
  }

  getTopProducts = (storeId, merchantId) => {
    this.configService
      .getPopularProducts(merchantId, storeId, this.menuType)
      .subscribe(
        (response: any) => {
          this.topProducts = response.response;
          this.setTopProducts(response.response);
        },
        (error) => (this.error = error)
      );
  }

  filterCategories = (categories) => {
    categories = categories.filter((category) => {
      return category.parentCategoryId !== null;
    });
    this.categories = categories;
    return categories;
  }

  getCategories = (storeId, merchantId) => {
    this.configService.getCategories(storeId, merchantId).subscribe(
      (data: any) => {
        this.setCategories(this.filterCategories(data.response));
      },
      (error) => (this.error = error)
    );
  }
}
