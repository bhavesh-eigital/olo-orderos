import { AfterViewChecked, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { ConfigService } from '../../services/config.service';
import { map, tap } from 'rxjs/operators';
import { ClearCart, SetCustomer, SetFavorites, SetPlacedOrder, SetTemporalCustomer, SetTemporalCustomerPhoneDetails } from 'src/store/actions';
import { Router } from '@angular/router';
import { findSetting } from '../../utils/FindSetting';
import * as smoothscroll from "smoothscroll-polyfill";
import * as LocalizedFormat from 'dayjs/plugin/localizedFormat';
import * as moment from 'dayjs';
moment.extend(LocalizedFormat)

@Component({
  selector: 'app-menu2',
  templateUrl: './menu2.component.html',
  styleUrls: ['./menu2.component.scss']
})
export class Menu2Component implements OnInit, AfterViewChecked {
  cart: any;
  storeInformation: any;
  customer: any;
  customerDefaultAddress: any;
  restaurantHours: any;
  popularProducts: any;
  categories: any;
  openRestaurantHours: any;
  closeRestaurantHours: any;

  currentCategory: string = 'popular';

  liked: boolean = false;

  open = false;

  searchResults = [];

  favorites = [];
  favoriteStores = [];
  OnlineStoreDineIn = 'true';
  showBottomBar = true;
  scrolling = false;
  @ViewChild('main') main: ElementRef<HTMLDivElement>;
  @ViewChild('menu') menu: ElementRef<HTMLElement>;
  @ViewChild('tabsWrapper') tabsWrapper: ElementRef<HTMLElement>;


  constructor(
    private store: Store<{ storeInformation: []; cart: [], customer: [], categories: [] }>,
    private router: Router,
    private configService: ConfigService,
  ) {

    smoothscroll.polyfill();

    store.subscribe((state: any) => {
      const data = state.cartShop;
      this.cart = data.cart;
      this.storeInformation = data.storeInformation;
      this.customer = data.customer;
      this.customerDefaultAddress = data.customerDefaultAddress;
      this.restaurantHours = data.restaurantHours;
      this.popularProducts = data.topProducts;
      this.categories = data.categories;
      this.favorites = data.favorites;

      this.currentCategory = this.popularProducts.length ? 'popular' : (this.categories.length ? this.categories[0]?.categoryName : '');
    });
  }

  ngOnInit(): void {
    if (!localStorage.tableNumber || localStorage.tableNumber.length < 0) {
      this.router.navigate(['scanner-table']);
    } else {
      this.getDineInHours();
      if (this.customer.length !== 0) {
        this.getFavorites();
        this.getFavoriteStore();
      }
    }

    this.OnlineStoreDineIn = findSetting(this.storeInformation, 'OnlineStoreDineIn');
    this.clearLocalStorage();
  }

  ngAfterViewChecked() {
    this.checkScroll();
  }

  getDineInHours() {
    const RestaurantInfo = this.restaurantHours.find((restaurantDineIn) => {
      return restaurantDineIn.kind === 'DINE_IN';
    });
    if (RestaurantInfo.status === 'CLOSED') {
      console.log('Restaurant close');
    } else {
      this.openRestaurantHours = RestaurantInfo.schedule.from;
      this.closeRestaurantHours = RestaurantInfo.schedule.to;
    }
  }

  changeFormatHours = (restaurantHour) => {
    if (restaurantHour) {
      const resultHour = moment().set('hour', restaurantHour.replace(':00', '')).set('minute', 0);
      return moment(resultHour).format('LT');
    }
  }

  scrollInToView(categoryName: string, index: number) {
    this.scrolling = true;
    setTimeout(() => this.scrolling = false, 1100);
    const elementId = categoryName === 'popular' ? categoryName : index.toString();
    this.currentCategory = categoryName;
    const element = document.getElementById(elementId);
    element.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  setSearchBox = (event) => {
    if (event.target.value) {
      this.getProductByName(event.target.value);
    } else {
      this.searchResults = [];
    }
  }

  getProductByName = (productName) => {
    this.configService
      .searchProduct(
        this.storeInformation.merchantId,
        this.storeInformation.storeId,
        productName,
        1
      ).pipe(
        map((resp: any) => {
          this.searchResults = resp.response;
        })
      ).subscribe();
  }

  setFavoritesCustomer(currentFavorites) {
    this.store.dispatch(new SetFavorites(currentFavorites));
  }

  getFavorites = () => {
    this.configService
      .getCustomerFavoritesProducts(this.storeInformation.storeId, this.storeInformation.merchantId, this.customer.customerId)
      .subscribe((data: any) => {
        this.setFavoritesCustomer(data.response.customerFavoriteProducts);
      });
  }

  addFavoriteProduct(product) {
    if (this.customer) {
      const params = {
        storeId: this.storeInformation.storeId,
        merchantId: this.storeInformation.merchantId,
        productId: product.productId,
        customerId: this.customer.customerId
      };
      this.configService.addFavoriteCustomer(params).pipe(
        tap(() => this.getFavorites())
      ).subscribe();
    }
  }

  deleteFavoriteProduct(product) {
    if (this.customer) {
      const params = {
        storeId: this.storeInformation.storeId,
        merchantId: this.storeInformation.merchantId,
        productId: product.productId,
        customerId: this.customer.customerId
      };
      this.configService.removeFavoriteCustomer(params).pipe(
        tap(() => this.getFavorites())
      ).subscribe();
    }
  }

  clearLocalStorage() {
    if (parseInt(localStorage.getItem('expirationDate')) <= moment().unix()) {
      this.setCustomer([]);
      this.cleanCart([]);
      this.setPlacedOrders([]);
      this.setTemporalCustomer();
      localStorage.removeItem('tableNumber');
      this.router.navigate(['/scanner-table']);
    }
  }

  getFavoriteStore = () => {
    const params = {
      customerId: this.customer.customerId
    };
    this.configService.getFavoriteStore(params).subscribe((data: any) => {
      this.favoriteStores = data.stores;
    });
  }

  isFav(storeId: any) {
    if (this.favoriteStores) {
      return this.favoriteStores.find((store) => storeId === store.onlineStoreId);
    }
  }

  addFavoritesStore(storeId) {
    const params = {
      customerId: this.customer.customerId,
      merchantId: this.storeInformation.merchantId,
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
      merchantId: this.storeInformation.merchantId,
      storeId
    };
    this.configService.deleteFavoriteStore(params)
      .subscribe(() => {
        this.getFavoriteStore();
      });
  }

  update = (ev) => {
    if (!this.scrolling) {
      const popularEl = document.getElementById('popular');
      if (popularEl) {
        const popularPosition = popularEl.getBoundingClientRect();
        if (popularPosition.top < 0 && popularPosition.top > -45) {
          this.currentCategory = 'popular';
          this.tabsWrapper.nativeElement.scrollTo({ left: 0, behavior: 'smooth' });
          return;
        }
      }
      this.categories.map((category, idx) => {

        let categoryEl = document.getElementById(idx.toString());
        let categoryPosition = categoryEl.getBoundingClientRect();
        if (categoryPosition.top < 20 && categoryPosition.top > -45) {
          this.currentCategory = category.categoryName;
          const children = this.tabsWrapper.nativeElement.children;
          let right = 0;
          for (let i = 0; i < children.length; i++) {
            right += children[i].getBoundingClientRect().width;
            if (idx === i && this.popularProducts.length) {
              this.tabsWrapper.nativeElement.scrollTo({ left: right, behavior: 'smooth' });
              break;
            } else if (idx === i && !this.popularProducts.length) {
              right -= children[i].getBoundingClientRect().width;
              this.tabsWrapper.nativeElement.scrollTo({ left: right, behavior: 'smooth' });
              break;
            }
          }
        }
      });
    }
  }

  checkScroll() {
    this.menu.nativeElement.addEventListener('scroll', this.update);
  }

  setCustomer(currentStore) {
    this.store.dispatch(new SetCustomer(currentStore));
  }

  cleanCart(currentStore) {
    this.store.dispatch(new ClearCart(currentStore));
  }

  setPlacedOrders(newOrder) {
    this.store.dispatch(new SetPlacedOrder(newOrder));
  }

  setTemporalCustomer() {
    this.store.dispatch(new SetTemporalCustomer([]));
    this.store.dispatch(new SetTemporalCustomerPhoneDetails(null));
  }

  handleFavoriteClick() {
    if (!this.isFav(this.storeInformation?.storeId)) {
      this.addFavoritesStore(this.storeInformation?.storeId)
    } else {
      this.deleteFavoritesStore(this.storeInformation?.storeId);
    }
  }

}
