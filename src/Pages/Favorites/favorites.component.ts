import {ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {SetCustomer, SetFavorites} from '../../store/actions';
import {ConfigService} from '../../services/config.service';


@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {

  currentTab = 0;
  open = false;
  placeholder = 'Search favorites restaurants...';
  cart: any;
  storeInformation: any;
  customer: any;
  products = [];
  favorites = [];
  generalFavorites: any;
  loading = true;
  restaurantSearch = '';
  productsSearch = '';

  @ViewChild('indicator') indicator: ElementRef<HTMLElement>;

  constructor(
    private renderer: Renderer2,
    private store: Store<{ cartShop: { storeInformation: []; cart: [], customer: [] } }>,
    private configService: ConfigService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
  ) {
    store.pipe(select('cartShop'))
      .subscribe((data: any) => (
        this.cart = data.cart,
          this.storeInformation = data.storeInformation,
          this.customer = data.customer
      ));
  }

  ngOnInit() {
    if (this.customer.length === 0) {
      this.router.navigate(['signin']);
      return;
    }
    this.getFavorites();
    this.getGeneralFavorites();
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
        this.generalFavorites = data.response;
        this.loading = false;
        this.cdRef.detectChanges();
      });
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

  switchTab(tabNumber: number) {
    if (tabNumber === 0) {
      this.renderer.removeClass(this.indicator.nativeElement, 'right');
      this.renderer.addClass(this.indicator.nativeElement, 'left');
      this.placeholder = 'Search favorites restaurants...'
    } else {
      this.renderer.removeClass(this.indicator.nativeElement, 'left');
      this.renderer.addClass(this.indicator.nativeElement, 'right');
      this.placeholder = 'Search favorites products...'
    }

    this.currentTab = tabNumber;
  }

  searchItem(ev) {
    if(this.currentTab === 0) {
      this.restaurantSearch = ev;
    } else {
      this.productsSearch = ev;
    }
  }

}
