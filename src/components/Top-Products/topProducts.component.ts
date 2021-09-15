import { Component, EventEmitter, Input, OnInit, Output, Renderer2, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { SetFavorites } from '../../store/actions';
import { ConfigService } from '../../services/config.service';
import { MatDialog } from '@angular/material/dialog';
import { PaymentModalComponent } from '../payment-modal/payment-modal.component';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'top-productsV2',
  templateUrl: './topProducts.component.html',
  styleUrls: ['./topProducts.component.scss'],
})
export class TopProductsV2Component implements OnInit, OnDestroy {
  favorites: any;
  storeInformation: any;
  currency = localStorage.getItem('currency');
  customer: any;
  guest: any = 'Guest';
  favoritesSelected: any = JSON.parse(localStorage.getItem('favorites')) === null
    ? []
    : JSON.parse(localStorage.getItem('favorites'));

  itemsPerSlide = 1;
  singleSlideOffset = false;
  noWrap = false;

  slidesChangeMessage = '';

  favoritesSub$ = new Subscription();
  storeInfoSub$ = new Subscription();
  customerSub$ = new Subscription();

  @Input() topProducts: any;
  @Input() fromRefundComponent = false;
  @Input() orderType = localStorage.getItem('orderType');
  @Input() OnlineOrderingEnable = "true";
  @Output() productModalIsOpened = new EventEmitter<boolean>();

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private store: Store<{ favorites: []; }>,
    public configService: ConfigService,
    private renderer: Renderer2,
    private snackBar: MatSnackBar
  ) {
    // @ts-ignore
    this.favoritesSub$ = store.pipe(select('cartShop')).subscribe((data) => (this.favorites = data.favorites));
    // @ts-ignore
    this.storeInfoSub$ = store.pipe(select('cartShop')).subscribe((data) => (this.storeInformation = data.storeInformation));
    // @ts-ignore
    this.customerSub$ = store.pipe(select('cartShop')).subscribe((data) => (this.customer = data.customer));
    this.guest = this.customer.length === 0 ? 'Guest' : this.customer.customerFirstName + ' ' + this.customer.customerLastName;
  }

  ngOnInit(): void {
    if (this.customer.length !== 0)
      this.getFavorites();
  }

  redirect(productId) {
    this.router.navigate(['products/' + productId]);
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

  handleFavoriteClick(product) {
    if (!this.isFav(product.productId)) {
      this.addFavorites(product);
    } else {
      this.deleteFavorites(product);
    }
  }

  addFavorites = (product) => {
    if (this.customer) {
      const params = {
        storeId: this.storeInformation.storeId,
        merchantId: this.storeInformation.merchantId,
        productId: product.productId,
        customerId: this.customer.customerId
      };
      this.configService.addFavoriteCustomer(params).subscribe((data: any) => {
        this.getFavorites();
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
      });
    }
  }

  onSlideRangeChange(indexes: number[]): void {
    this.slidesChangeMessage = `Slides have been switched: ${indexes}`;
  }


  isFav = (productId) => {
    if (this.favorites && this.favorites?.length) {
      return this.favorites.find((product) => {
        return productId === product;
      }
      );
    }
  }

  openProduct(product) {
    if (this.OnlineOrderingEnable === 'false') {
      this.snackBar.open('This store has deactivated orders for the moment. Please, try later', '', {
        duration: 5000,
        panelClass: ['red-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }
    const dialogRef = this.dialog.open(PaymentModalComponent, {
      panelClass: 'full-screen-modal-product',
      autoFocus: false,
      data: { product, orderType: this.orderType, action: 'add' }
    });

    dialogRef.afterOpened().pipe(
      tap(() => this.productModalIsOpened.emit(true))
    ).subscribe();
    dialogRef.afterClosed().pipe(
      tap(() => this.productModalIsOpened.emit(false))
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.favoritesSub$.unsubscribe();
    this.storeInfoSub$.unsubscribe();
    this.customerSub$.unsubscribe();
  }
}
