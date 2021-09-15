import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemePalette } from '@angular/material/core';
import { SetFavorites } from '../../store/actions';
import { select, Store } from '@ngrx/store';
import { ConfigService } from '../../services/config.service';
import { MatDialog } from '@angular/material/dialog';
import { PaymentModalComponent } from '../payment-modal/payment-modal.component';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-categoriesV2',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  providers: [MatDialog]
})
export class CategoriesV2Component implements OnInit, OnDestroy {
  color: ThemePalette = 'accent';
  favorites: any;
  storeInformation: any;
  customer: any;
  productId: any;
  currency = localStorage.getItem('currency');

  favoritesSub$ = new Subscription();
  storeInfoSub$ = new Subscription();
  customerSub$ = new Subscription();

  @Input() categories: any;
  @Input() fromRefundComponent = false;
  @Input() orderType = localStorage.getItem('orderType');
  @Input() OnlineOrderingEnable = 'true';
  @Input() areTherePopularProducts: boolean = false;
  @Output() productModalIsOpened = new EventEmitter<boolean>();

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store<{ favorites: []; }>,
    public configService: ConfigService,
    private snackBar: MatSnackBar
  ) {
    // @ts-ignore
    this.favoritesSub$ = store.pipe(select('cartShop')).subscribe((data: any) => (this.favorites = data.favorites));
    // @ts-ignore
    this.storeInfoSub$ = store.pipe(select('cartShop')).subscribe((data: any) => (this.storeInformation = data.storeInformation));
    // @ts-ignore
    this.customerSub$ = store.pipe(select('cartShop')).subscribe((data: any) => (this.customer = data.customer));
    this.guest = this.customer.length === 0 ? 'Guest' : this.customer.customerFirstName + ' ' + this.customer.customerLastName;
    this.productId = this.route.snapshot.paramMap.get('productId');
  }

  guest: any = 'Guest';

  ngOnInit(): void {
    if (this.customer.length !== 0) {
      this.getFavorites();
    }
    setTimeout(() => {
      this.getProduct(this.productId);
    }, 1000);
  }

  redirect(ind, categorySelected, productId) {
    localStorage.setItem('categorySelected', categorySelected);
    localStorage.setItem('categorySelectedId', ind);
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

  isFav = (productId) => {
    if (this.favorites) {
      return this.favorites.find((product) => {
        return productId === product;
      }
      );
    }
  }

  getProduct = (productId) => {
    if (productId !== null) {
      const products = this.categories.flatMap((categories) => {
        return categories.products;
      });

      const productSelected = products.find((product) => {
        return product.productId === productId;
      });

      if (productSelected !== undefined) {
        this.openProduct(productSelected);
      }
    }
  }

  openProduct(product, categoryIndex?: number) {
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
      data: { product, orderType: this.orderType, action: 'add', scheduleCategory: this.categories[categoryIndex] }
    });

    dialogRef.afterOpened().pipe(
      tap(() => this.productModalIsOpened.emit(true))
    ).subscribe();
    dialogRef.afterClosed().pipe(
      tap(() => this.productModalIsOpened.emit(false))
    ).subscribe();
  }


  handleFavoriteClick(product) {
    if (!this.isFav(product.productId)) {
      this.addFavorites(product);
    } else {
      this.deleteFavorites(product);
    }
  }

  ngOnDestroy(): void {
    this.favoritesSub$.unsubscribe();
    this.storeInfoSub$.unsubscribe();
    this.customerSub$.unsubscribe();
  }
}
