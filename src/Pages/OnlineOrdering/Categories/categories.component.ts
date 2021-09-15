import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnInit,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { PaymentComponent } from '../../../components/Payment/payment.component';
import { ConfigService } from '../../../services/config.service';
import { Store } from '@ngrx/store';
import { findSetting } from '../../../utils/FindSetting';
import {
  SetCart,
  SetCustomer,
  SetDefaultAddress,
  SetFavorites,
  SetPaymentMethods,
  SetStore
} from '../../../store/actions';
import { MatDialog } from '@angular/material/dialog';
import { ThemePalette } from '@angular/material/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { NavbarComponent } from 'src/components/navbar/navbar.component';
import * as smoothscroll from 'smoothscroll-polyfill';
import { getCurrentAddressData } from 'src/utils/getCurrentAddressData';
import { Subscription } from 'rxjs';
import { OnDestroy } from '@angular/core';
import { UIService } from '../../../services/ui.service';

@Component({
  selector: 'app-categoryV2',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  providers: [ConfigService, MatDialog],
})

export class CategoriesV2GeneralComponent implements OnInit, AfterViewChecked, AfterViewInit, OnDestroy {
  autocompleteInput: string;
  addressDefault: any;
  address: any;
  deliveryFee: any = 0;
  establishmentAddress: any;
  formattedAddress: string;
  formattedEstablishmentAddress: string;
  phone: string;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  customerDefaultAddress: any;
  isInRange = true;
  isDineIn = false;

  @ViewChild('widgetsContent', { read: ElementRef }) public widgetsContent: ElementRef<HTMLDivElement>;
  @ViewChild('addresstext') addresstext: any;
  categories: any;
  favoriteStores: any;
  closeSearch = false;
  color: ThemePalette = 'accent';
  loading = true;
  cart: any;
  subdomain: any;
  storeInformation: any;
  popularProducts: any = [];
  menuType = 1;
  error: any;
  textSearch = '';
  searchProduct: any = [];
  newIdCategory: any;
  opened: boolean;
  customer: any;
  customerPhoto: any;
  customerInformation: any;
  tableNumber: any;
  guest: any = 'Guest';
  restaurantHours: any;
  btnEnabled: boolean;
  currentOrderType: any = localStorage.getItem('orderType');
  onClickRight = 0;
  onClickLeft = 0;
  isChangeLocation = false;
  orderTypes;

  currentCategory: string = 'popular';
  tabsScrollLeft = 0;

  openCart = false;
  innerWidth;

  open = false;
  showFooter = true;
  scrolling = false;
  OnlineOrderingEnable = 'true';

  storeSubs$ = new Subscription();

  @ViewChild('navbar') navbar: NavbarComponent;
  @ViewChild('wrapper') wrapper: ElementRef<HTMLDivElement>;
  @ViewChild('popular') popular: ElementRef<HTMLDivElement>;

  constructor(
    public router: Router,
    public zone: NgZone,
    private snackBar: MatSnackBar,
    private configService: ConfigService,
    private dialog: MatDialog,
    private store: Store<{ storeInformation: []; cart: [], customer: [], categories: [] }>,
    public uiService: UIService
  ) {

    smoothscroll.polyfill();

    this.storeSubs$ = store.subscribe((state: any) => {
      const data = state.cartShop;
      this.cart = data.cart;
      this.storeInformation = data.storeInformation;
      this.customer = data.customer;
      this.customerDefaultAddress = data.customerDefaultAddress;
      this.restaurantHours = data.restaurantHours;
      this.popularProducts = data.topProducts;
      this.categories = data.categories;
      if (!this.cart.length && localStorage.getItem('scheduleCategoryId')) {
        localStorage.removeItem('scheduleCategoryId');
      }
      if (!this.popularProducts.length && this.categories?.length) {
        this.currentCategory = this.categories[0]?.categoryName;
      }
      if (this.storeInformation?.length !== 0 && this.restaurantHours.length !== 0) {
        this.loading = false;
        this.OnlineOrderingEnable = findSetting(this.storeInformation, 'OnlineOrderingEnable');
        this.getOrderTypeAvailable();
        setTimeout(() => {
          if (this.popularProducts.length) {
            this.currentCategory = 'popular';
          }
        }, 200);
      } else {
        this.loading = true;
      }
    });

    this.guest = this.customer.length === 0 ? 'Guest' : this.customer.customerFirstName + ' ' + this.customer.customerLastName;
    localStorage.setItem('itemNav', 'home');
  }


  ngOnInit(): void {
    if (localStorage.orderType === '4') {
      this.router.navigate(['dinein']);
    }

    this.tableNumber = localStorage.getItem('tableNumber') === null ? false : localStorage.getItem('tableNumber');
    this.isDineIn = parseInt(localStorage.tableNumber, 10) > 0;
    if (this.customer.length !== 0) {
      this.getFavoriteStore();
      if (localStorage.provider === 'STRIPE') {
        this.getPaymentMethodsStripe();
      } else {
        this.getPaymentMethodsCardConnect();
      }
    }
    if (localStorage.getItem('orderType') === null) {
      localStorage.setItem('orderType', '2');
      this.currentOrderType = parseInt(localStorage.getItem('orderType'), 10);
    } else {
      this.currentOrderType = parseInt(localStorage.getItem('orderType'), 10);
    }
    if (this.customer.length !== 0) {
      this.customerInformation = this.customer;
      if (
        this.customerDefaultAddress === undefined ||
        this.customerDefaultAddress === '' ||
        this.customerDefaultAddress === null
      ) {
        this.setDefaultAddress(this.getCurrentAddressDefault(this.customer.customerDefaultAddressId));
      }
    } else {
      this.customerInformation = [];
    }

  }


  ngAfterViewInit() {
    // this.getPlaceAutocomplete();
    this.onResize();

    if (localStorage.getItem('tableNumber') !== null) {
      localStorage.setItem('orderType', '4');
      this.isInRange = false;
      this.currentOrderType = 4;
      this.deliveryFee = 0;
      this.router.navigate(['/dinein']);
      this.openSnackBar('You have not left the table yet', 2)
    }

    if (this.customer.length !== 0) {

      this.getDynamicDeliveryFee();

    } else if (this.navbar) {
      if (this.navbar.orderTypeSlider) {
        this.navbar.orderTypeSlider.toggleSlider(this.currentOrderType);
      } else {
        this.navbar.orderTypeSlider2.toggleSlider(this.currentOrderType)
      }
    }
  }

  ngAfterViewChecked(): void {
    this.checkScroll();
  }

  @HostListener('window: resize', ['$event'])
  onResize() {
    this.innerWidth = window.innerWidth;
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 5000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  setDefaultAddress(defaultAddress) {
    this.store.dispatch(new SetDefaultAddress(defaultAddress));
  }

  getPaymentMethodsCardConnect() {
    const customerDefaultPaymentMethod = this.customer.customerDefaultPaymentMethod
      ? this.customer.customerDefaultPaymentMethod
      : '';

    const customerIntegrationId = this.customer.stripeAccounts.find((stripeAccount) => {
      return stripeAccount.storeId === this.storeInformation?.storeId;
    });

    const params = {
      storeId: this.storeInformation?.storeId,
      merchantId: this.storeInformation?.merchantId,
      integrationCustomerId: this.customer.integrationCustomerId
    };
  }

  getPaymentMethodsStripe() {
    const customerIntegrationId = this.customer.stripeAccounts.find((stripeAccount) => {
      return stripeAccount.storeId === this.storeInformation?.storeId;
    });

    let customerDefaultPaymentMethod = this.customer.stripeAccounts.find((stripeIntegration) => {
      return stripeIntegration.storeId === this.storeInformation?.storeId;
    });

    customerDefaultPaymentMethod = customerDefaultPaymentMethod === undefined ? '' : customerDefaultPaymentMethod.defaultPaymentMethodId;

    this.configService.getPaymentMethods(this.customer.customerId, this.storeInformation?.storeId, this.storeInformation?.merchantId, localStorage.provider)
      .subscribe((data: any) => {
        if (data.success === 1) {
          this.store.dispatch(new SetPaymentMethods(data.response));
        } else {
          this.openSnackBar('error:' + data.message, 2);
        }
      });
  }

  getCurrentAddressDefault = (addressId) => {
    const addressDefault = this.customer.customerAdresses.find((address) => {
      return address._id === addressId;
    });
    return addressDefault === undefined ? '' : addressDefault;
  }

  update = () => {
    if (!this.scrolling) {
      const popularEl = document.getElementById('popular');
      if (popularEl) {
        const popularPosition = popularEl.getBoundingClientRect();
        if (popularPosition.top < 0 && popularPosition.top > -230) {
          this.currentCategory = 'popular';
          this.widgetsContent.nativeElement.scrollTo({ left: 0, behavior: 'smooth' });
          this.tabsScrollLeft = 0;
        }
      }
      this.categories.map((category, idx) => {
        let categoryEl = document.getElementById(idx.toString());
        if (!categoryEl) return;
        let categoryPosition = categoryEl.getBoundingClientRect();
        if (categoryPosition.top < 20 && categoryPosition.top > -45) {
          this.currentCategory = category.categoryName;
          const children = this.widgetsContent.nativeElement.children;
          let right = 0;
          for (let i = 0; i < children.length; i++) {
            if (this.popularProducts?.length) {
              right += children[i].getBoundingClientRect().width;
            } else {
              if (i > 0) {
                right += children[i + 1].getBoundingClientRect().width;
              }
            }
            if (idx === i) {
              this.widgetsContent.nativeElement.scrollTo({ left: right, behavior: 'smooth' });
              this.tabsScrollLeft = right;
              break;
            }
          }
        }
      });
    }
  }

  checkScroll() {
    if (this.wrapper) {
      this.wrapper.nativeElement.addEventListener('scroll', this.update);
    }
  }

  filterCategories = (categories) => {
    categories = categories.filter((category) => {
      return category.parentCategoryId !== null;
    });
    this.categories = categories;
    return categories;
  }

  getFavoriteStore = () => {
    const params = {
      customerId: this.customer.customerId
    };
    this.configService.getFavoriteStore(params).subscribe((data: any) => {
      this.favoriteStores = data.stores;
    });
  }

  setStoreInformation(currentStore) {
    this.store.dispatch(new SetStore(currentStore));
  }

  setSearchBox = (event) => {
    if (event.key === 'Escape') {
      this.closeSearcher();
      return;
    }
    this.textSearch = event.target.value;
    this.getProductByName(event.target.value);
  }

  getProductByName = (productName) => {
    if (!productName) {
      this.searchProduct = [];
      return;
    }
    this.configService
      .searchProduct(
        this.storeInformation?.merchantId,
        this.storeInformation?.storeId,
        productName,
        0
      )
      .subscribe(
        (data: any) => (this.searchProduct = data.response),
        (error) => (this.error = error)
      );
  }

  closeSearcher() {
    this.textSearch = '';
    this.searchProduct = [];
  }

  redirect() {
    this.router.navigate(['products']);
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

  scrollTo = (category, index) => {
    this.currentCategory = category;
    this.scrolling = true;
    setTimeout(() => {
      this.scrolling = false;
    }, 1100)
    try {
      const element = document.getElementById(index);
      element.scrollIntoView({ block: 'start', behavior: 'smooth' });

    } catch (e) {
    }
  }

  scrollToPopular(element: any) {
    element.scrollIntoView({ behavior: 'smooth' });
  }

  currentCustomerPhoto = () => {
    const link = this.customer.customerPhoto.replace(/^https?:\/\//, '');
    return 'https://' + link;
  }

  closeSearching = () => {
    this.textSearch = '';
    this.closeSearch = !this.closeSearch;
  }

  orderTypeSelected(orderType) {
    if (orderType === 1) {
      if (this.orderTypes?.orderTypeDelivery === 'true' || localStorage.getItem('orderTypeDelivery') === 'true') {
        this.currentOrderType = orderType;
        localStorage.setItem('orderType', orderType);
      } else {
        console.log('This restaurant does not offer delivery pickup as an order type.', 1);
      }
    }

    if (orderType === 2) {
      if (this.orderTypes?.orderTypePickup === 'true' || localStorage.getItem('orderTypePickup')) {
        this.currentOrderType = orderType;
        localStorage.setItem('orderType', orderType);
      } else {
        console.log('This restaurant does not offer pickup as an order type.', 1);
      }
    }

    if (orderType === 3) {
      if (this.orderTypes?.orderTypeCurbside === 'true' || localStorage.getItem('orderTypeCurbside')) {
        this.currentOrderType = orderType;
        localStorage.setItem('orderType', orderType);
      } else {
        console.log('This restaurant does not offer curbside pickup as an order type.', 1);
      }
    }

  }

  isFav(storeId: any) {
    if (this.favoriteStores) {
      return this.favoriteStores.find((store) => {
        return storeId === store.onlineStoreId;
      }
      );
    }
  }

  addFavoritesStore(storeId) {
    const params = {
      customerId: this.customer.customerId,
      merchantId: this.storeInformation?.merchantId,
      storeId
    };
    this.configService.addFavoriteStore(params)
      .subscribe(() => {
        this.getFavoriteStore();
      });
  }

  deleteFavoritesStore(storeId) {
    const params = {
      customerId: this.customer.customerId,
      merchantId: this.storeInformation?.merchantId,
      storeId
    };
    this.configService.deleteFavoriteStore(params)
      .subscribe(() => {
        this.getFavoriteStore();
      });
  }

  scrollLeft() {
    this.onClickLeft = this.onClickLeft + 1;
    this.widgetsContent.nativeElement.scrollTo({
      left: (this.widgetsContent.nativeElement.scrollLeft - 480),
      behavior: 'smooth'
    });
    setTimeout(() => {
      if (this.onClickRight === this.onClickLeft) {
        this.onClickRight = 0;
        this.onClickLeft = 0;
        this.btnEnabled = false;
      }
      this.tabsScrollLeft = this.widgetsContent.nativeElement.scrollLeft;
    }, 300);
  }

  scrollRight() {
    this.btnEnabled = true;
    this.onClickRight = this.onClickRight + 1;
    this.widgetsContent.nativeElement.scrollTo({
      left: (this.widgetsContent.nativeElement.scrollLeft + 480),
      behavior: 'smooth'
    });
    setTimeout(() => this.tabsScrollLeft = this.widgetsContent.nativeElement.scrollLeft, 250);
  }

  searchLocation = () => {
    this.isChangeLocation = !this.isChangeLocation;
  }

  getDynamicDeliveryFee() {
    const { currentAddress, currentCity } = getCurrentAddressData(this.customerDefaultAddress);
    this.configService.getDeliveryFee(`${currentAddress}, ${currentCity}`, this.storeInformation?.storeId)
      .subscribe((data: any) => {
        if (data.success === 1) {
          this.deliveryFee = data.deliveryFee;
          this.isInRange = true;
        } else {
          this.isInRange = false;
          this.currentOrderType = 2;
          localStorage.setItem('orderType', '2');
          this.deliveryFee = 0;
          if (this.navbar.orderTypeSlider) {
            this.navbar.orderTypeSlider.toggleSlider(this.currentOrderType);
          } else if (this.navbar.orderTypeSlider2) {
            this.navbar.orderTypeSlider2.toggleSlider(this.currentOrderType)
          }
        }
      });
  }

  getNewAddressDefault = (address) => {
    this.customerDefaultAddress = address;
    this.getDynamicDeliveryFee();
  }

  getOrderTypeAvailable = () => {

    const orderTypeDelivery = findSetting(this.storeInformation, 'OnlineStoreDelivery');
    const orderTypePickup = findSetting(this.storeInformation, 'OnlineStorePickUp');
    const orderTypeCurbside = findSetting(this.storeInformation, 'OnlineStoreCurbsidePickUp');
    const orderTypeDineIn = findSetting(this.storeInformation, 'OnlineStoreDineIn');

    localStorage.orderTypeDelivery = findSetting(this.storeInformation, 'OnlineStoreDelivery');
    localStorage.orderTypePickup = findSetting(this.storeInformation, 'OnlineStorePickUp');
    localStorage.orderTypeCurbside = findSetting(this.storeInformation, 'OnlineStoreCurbsidePickUp');
    localStorage.orderTypeDineIn = findSetting(this.storeInformation, 'OnlineStoreDineIn');

    this.orderTypes = {
      orderTypeDelivery,
      orderTypePickup,
      orderTypeCurbside,
      orderTypeDineIn
    };

  }

  getCustomerName() {
    if (this.customer.length !== 0) {
      return `${this.customer.customerFirstName} ${this.customer.customerLastName}`
    }
    return null;
  }

  getIndex() {
    return this.popularProducts.length
      ? 'popular'
      : 0;
  }

  showBottomBar() {
    if (!this.showFooter) {
      if (this.innerWidth > 745) {
        return true;
      }
      return false;
    }

    return true;
  }

  ngOnDestroy(): void {
    this.storeSubs$.unsubscribe();
  }

}
