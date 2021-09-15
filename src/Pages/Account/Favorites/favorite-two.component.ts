import { Component, ElementRef, HostListener, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { ConfigService } from '../../../services/config.service';
import { SetCustomer, SetFavorites } from '../../../store/actions';

@Component({
  selector: 'app-favorite-two',
  templateUrl: './favorite-two.component.html',
  styleUrls: ['./favorite-two.component.scss']
})
export class FavoriteTwoComponent implements OnInit, OnDestroy {

  cart: any;
  storeInformation: any;
  customer: any;
  products = [];
  favorites = [];
  generalFavorites: any;
  loading = true;
  orderedProducts = [];
  openMobileSearcher = false;
  productsBackup = [];
  orderedProductsBackup = [];
  favoritesRestaurantsBackup = [];
  searchText$ = new Subscription();
  selectedTab = 0;
  placeHolder: string;
  openCart = false;
  currentOrderType: any = localStorage.getItem('orderType');
  open = false;

  storeSub$ = new Subscription();

  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;
  @ViewChild('mobileSearchInput') mobileSearchInput: ElementRef<HTMLInputElement>;

  constructor(
    private router: Router,
    private store: Store<{ storeInformation: []; cart: [], customer: [] }>,
    public configService: ConfigService
  ) {
    // @ts-ignore
    this.storeSub$ = store.pipe(select('cartShop'))
      .subscribe((data: any) => (this.cart = data.cart, this.storeInformation = data.storeInformation, this.customer = data.customer));
  }

  ngOnInit(): void {
    if (this.customer.length === 0) {
      this.router.navigate(['login']);
      return;
    }
    this.getFavorites();
    this.getGeneralFavorites();
  }


  activateSearcher() {
    this.placeHolder = 'Search Restaurant...';
    fromEvent<any>(this.searchInput?.nativeElement, 'keyup').pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      tap(ev => {
        if (this.selectedTab) {
          this.searchProduct(ev.target.value);
        } else {
          this.searchRestaurant(ev.target.value);
        }
      })
    ).subscribe();
  }

  getCustomerPhoto = () => {
    return this.customer.customerPhoto ? 'https://' + this.customer.customerPhoto : 'assets/IconsSVG/Account.svg';
  }

  setFavoritesCustomer(currentFavorites) {
    this.store.dispatch(new SetFavorites(currentFavorites));
  }

  setCustomer(currentCustomer) {
    this.store.dispatch(new SetCustomer(currentCustomer));
  }

  getProducts = (favorites) => {
    favorites.map((favoriteId) => {
      return this.getProductByID(favoriteId);
    });
  }

  getProductByID = (productId) => {
    this.configService.getProductById(this.storeInformation.merchantId, this.storeInformation.storeId, productId)
      .subscribe((data: any) => {
        if (data.response && data.response.productId) {
          this.products.push(data.response);
        }
        return;
      });
  }

  getFavorites = () => {
    this.configService
      .getCustomerFavoritesProducts(this.storeInformation.storeId, this.storeInformation.merchantId, this.customer.customerId)
      .subscribe((data: any) => {
        this.setCustomer(data.response);
        this.setFavoritesCustomer(data.response.customerFavoriteProducts);
        this.getProducts(data.response.customerFavoriteProducts);
      });
  }

  getGeneralFavorites = () => {
    const params = {
      customerId: this.customer.customerId,
      storeId: this.storeInformation.storeId
    };
    this.configService
      .getFavorites(params)
      .subscribe((data: any) => {
        this.orderedProducts = [];
        this.orderedProductsBackup = [];
        this.generalFavorites = data.response;
        this.loading = false;
        this.orderProductByCategorie();
        this.productsBackup = [...this.generalFavorites.products];
        this.orderedProductsBackup = [...this.orderedProducts];
        this.favoritesRestaurantsBackup = [...this.generalFavorites.stores];
        setTimeout(() => this.activateSearcher(), 1000)
      });
  }

  deleteFavorites = (product) => {
    if (this.customer) {
      const params = {
        storeId: this.storeInformation.storeId,
        merchantId: this.storeInformation.merchantId,
        productId: product.productId,
        customerId: this.customer.customerId
      };
      this.configService.removeFavoriteCustomer(params).subscribe((data: any) => {
        this.getFavorites();
        this.getGeneralFavorites();
      });
    }
  }

  deleteRestaurant = (store) => {
    if (this.customer) {
      const params = {
        storeId: store.onlineStoreId,
        merchantId: this.storeInformation.merchantId,
        onlineStoreId: store.onlineStoreId,
        customerId: this.customer.customerId
      };
      this.configService.deleteFavoriteStore(params).subscribe((data: any) => {
        this.getGeneralFavorites();
      });
    }
  }

  goBack() {
    this.router.navigate(['home']);
  }

  openProduct(productId) {
    this.router.navigate(['product/' + productId]);
  }

  openStore(store) {
    window.open(store);
  }


  orderProductByCategorie() {
    let productsCategories = []

    this.generalFavorites?.products.map(prod => {
      if (!productsCategories.includes(prod.productCategory[0])) {
        productsCategories.push(prod.productCategory[0]);
        this.orderedProducts.push({ category: prod.productCategory[0], products: [] });
      }
    });

    productsCategories.map((category, idx) => this.generalFavorites?.products.map((prod) => {
      if (prod.productCategory[0] === category) {
        this.orderedProducts[idx].products.push(prod);
      }
    }));

  }

  searchProduct(search: string) {
    if (search) {
      this.generalFavorites.products = this.generalFavorites.products.filter((product => product.productName.toLowerCase().includes(search.toLowerCase())));
      this.orderedProducts = [];
      this.orderProductByCategorie();
    } else {
      this.generalFavorites.products = this.productsBackup;
      this.orderedProducts = this.orderedProductsBackup;
    }
  }

  searchRestaurant(search: string) {
    if (search) {
      this.generalFavorites.stores = this.generalFavorites?.stores.filter((restaurant =>
        restaurant.onlineStoreName.toLowerCase().includes(search.toLowerCase())
      ));

    } else {
      this.generalFavorites.stores = this.favoritesRestaurantsBackup;
    }
  }

  openSearcher() {
    this.openMobileSearcher = true;
    setTimeout(() => {
      this.mobileSearchInput.nativeElement.focus();
      this.searchText$ = fromEvent<any>(this.mobileSearchInput.nativeElement, 'keyup').pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        tap((ev) => {
          if (this.selectedTab) {
            this.searchProduct(ev.target.value);
          } else {
            this.searchRestaurant(ev.target.value);
          }
        })
      ).subscribe();
    }, 150);
  }

  closeSearcher() {
    this.openMobileSearcher = false;
    this.searchText$.unsubscribe();
    if (this.selectedTab) {
      this.searchProduct('');
    } else {
      this.searchRestaurant('');
    }
  }

  @HostListener('window:keyup.escape', ['$event'])
  onEscapePressed() {
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
      if (this.selectedTab) {
        this.searchProduct('');
      } else {
        this.searchRestaurant('');
      }
    }

    if (this.mobileSearchInput) {
      this.mobileSearchInput.nativeElement.value = '';
      this.closeSearcher();
    }
  }

  onTabChanged(ev) {
    this.onEscapePressed();
    if (ev === 0) {
      this.placeHolder = 'Search Restaurant...'
    } else {
      this.placeHolder = 'Search Menu...';
    }
  }

  @HostListener('window:resize')
  onResize() {
    if(window.innerWidth > 576 && this.searchInput) {
      this.activateSearcher();
    }
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

  ngOnDestroy() {
    this.storeSub$ = new Subscription();
  }
}
