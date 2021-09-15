import { Component, Input, OnChanges, OnInit, Output, SimpleChanges, EventEmitter, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../services/config.service';
import { AddressMobileList } from '../Address-location-mobile/AddressMobileList';
import { MatDialog } from '@angular/material/dialog';
moment.extend(LocalizedFormat)
import * as LocalizedFormat from 'dayjs/plugin/localizedFormat';
import * as moment from 'dayjs';
import { YelpReviewsComponent } from '../yelp-reviews/yelp-reviews.component';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'Cover-Page',
  templateUrl: './CoverPage.html',
  styleUrls: ['./CoverPage.scss']
})
export class CoverPage implements OnInit, OnChanges, OnDestroy {

  customerDefaultAddress: any;
  storeInformation: any;
  favoriteStores: any;
  customer: any;
  @Input() deliveryFee: any;
  @Input() isInRage = false;
  @Input() orderType;
  isClosed = true;
  restaurantHours: any;
  tableNumber: any;
  openRestaurantHours: any;
  closeRestaurantHours: any;
  orderTypeName: string;

  storeSub$ = new Subscription();

  rating = 0;
  yelpReviews: Review[] = [];
  totalReviews = 0;
  yelpUrl: string;
  yelpIsIntegrated = false;


  constructor(
    private router: Router,
    public dialog: MatDialog,
    private configService: ConfigService,
    private store: Store<{ storeInformation: []; cart: [], customer: [], restaurantHours: [] }>
  ) {
    this.storeSub$ = store.subscribe((state: any) => {
      const data = state.cartShop;
      this.storeInformation = data.storeInformation;
      this.customer = data.customer;
      this.customerDefaultAddress = data.customerDefaultAddress;
      this.restaurantHours = data.restaurantHours;
    });
  }

  ngOnInit(): void {

    if (this.customer.length !== 0) {
      this.getFavoriteStore();
    }


    if (localStorage.getItem('tableNumber') !== null) {
      this.orderType = 4;
      this.getRestaurantHours();
      this.tableNumber = localStorage.getItem('tableNumber');
      this.getOrderTypeName(this.orderType);
    } else {
      this.getRestaurantHours();
      this.tableNumber = false;
    }

    this.getYelpReviews();
  }

  isYelpIntegrated = () => {
    const yelp = this.storeInformation.integrations.find((integration) => {
      return integration.name === 'YELP';
    });

    return yelp ? yelp.enabled : false;
    
  }

  getYelpReviews = () => {
    const isYelpIntegrated = this.isYelpIntegrated();
    if (isYelpIntegrated) {
      this.configService.getYelpReviews(this.storeInformation.storeId).pipe(
        tap((resp) => {
          if (resp.success) {
            this.rating = resp.response.rating;
            this.yelpReviews = resp.response.reviews;
            this.totalReviews = resp.response.review_count;
            this.yelpUrl = resp.response.url;
          }
        })
      ).subscribe();
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
      return this.favoriteStores.find((store) => {
        return storeId === store.onlineStoreId;
      });
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

  handleFavoriteClick() {
    if (!this.isFav(this.storeInformation?.storeId)) {
      this.addFavoritesStore(this.storeInformation?.storeId);
    } else {
      this.deleteFavoritesStore(this.storeInformation?.storeId);
    }
  }

  getRestaurantHours = () => {
    if (this.orderType === 1) {
      const RestaurantInfo = this.restaurantHours?.find((restaurantDineIn) => {
        return restaurantDineIn.kind === 'DELIVERY';
      });
      if (!RestaurantInfo || RestaurantInfo?.status === 'CLOSED') {
        this.isClosed = true;
      } else {
        this.openRestaurantHours = RestaurantInfo.schedule.from;
        this.closeRestaurantHours = RestaurantInfo.schedule.to;
        this.isClosed = false;
      }
    }
    if (this.orderType === 2) {
      const RestaurantInfo = this.restaurantHours?.find((restaurantDineIn) => {
        return restaurantDineIn.kind === 'PICKUP';
      });
      if (RestaurantInfo?.status === 'CLOSED') {
        this.isClosed = true;
      } else {
        this.openRestaurantHours = RestaurantInfo?.schedule.from;
        this.closeRestaurantHours = RestaurantInfo?.schedule.to;
        this.isClosed = false;
      }
    }
    if (this.orderType === 3) {
      const RestaurantInfo = this.restaurantHours?.find((restaurantDineIn) => {
        return restaurantDineIn?.kind === 'CURBSIDE';
      });
      if (RestaurantInfo?.status === 'CLOSED') {
        this.isClosed = true;
      } else {
        this.openRestaurantHours = RestaurantInfo?.schedule.from;
        this.closeRestaurantHours = RestaurantInfo?.schedule.to;
        this.isClosed = false;
      }
    }
    if (this.orderType === 4) {
      const RestaurantInfo = this.restaurantHours?.find((restaurantDineIn) => {
        return restaurantDineIn?.kind === 'DINE_IN';
      });
      if (RestaurantInfo?.status === 'CLOSED') {
        this.isClosed = true;
      } else {
        this.openRestaurantHours = RestaurantInfo?.schedule.from;
        this.closeRestaurantHours = RestaurantInfo?.schedule.to;
        this.isClosed = false;
      }
    }
  }

  getDefaultAddress = () => {
    if (localStorage.temporalDefaultAddress !== undefined) {
      if (localStorage.temporalDefaultAddress.length > 0) {
        return JSON.parse(localStorage.temporalDefaultAddress).customerAddress1;
      } else {
        if (this.customerDefaultAddress !== '') {
          return this.customerDefaultAddress.customerAddress1;
        } else {
          return 'Select Location';
        }
      }
    } else if (this.customerDefaultAddress !== '') {
      return this.customerDefaultAddress.customerAddress1;
    } else {
      return 'Select Location';
    }
  }

  openLocationModal = () => {
    this.dialog.open(AddressMobileList);
  }

  getOrderTypeName = (orderType) => {
    if (orderType === 1) {
      this.orderTypeName = 'Delivery Time';
    }
    if (orderType === 2) {
      this.orderTypeName = 'PickUp';
    }
    if (orderType === 3) {
      this.orderTypeName = 'Curbside';
    }
    if (orderType === 4) {
      this.orderTypeName = 'Dine-in';
    }
  }

  changeFormatHours = (restaurantHour) => {
    if (restaurantHour) {
      const resultHour = moment().set('hour', restaurantHour.replace(':00', '')).set('minute', 0);
      return moment(resultHour).format('LT');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getOrderTypeName(this.orderType);
    this.getRestaurantHours();
  }

  getAddress() {
    const fromIndex = this.storeInformation.storeFrontAddress1.indexOf(',');
    return this.storeInformation.storeFrontAddress1.slice(0, fromIndex);
  }

  openYelpReviews() {
    if(!this.totalReviews) return;
    this.dialog.open(YelpReviewsComponent, {
      data: {
        reviews: this.yelpReviews,
        totalReviews: this.totalReviews,
        yelpUrl: this.yelpUrl
      },
      panelClass: 'full-screen-modal',
      maxWidth: 500
    });
  }

  ngOnDestroy() {
    this.storeSub$.unsubscribe();
  }

}


export interface Review {
  id: string;
  url: string;
  text: string;
  rating: number;
  time_created: Date;
  user: {
    id: string;
    profile_url: string;
    image_url: string;
    name: string;
  };
}