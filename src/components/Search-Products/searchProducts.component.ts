import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ProductModal } from '../Product/product-modal';
import { MatDialog } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { PaymentModalComponent } from '../payment-modal/payment-modal.component';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'search-productsV2',
  templateUrl: './searchProducts.component.html',
  styleUrls: ['./searchProducts.component.scss'],
})
export class SearchProductsV2Component implements OnInit, OnDestroy {
  currency = localStorage.getItem('currency');
  customer: any;
  guest: any = 'Guest';
  empty = false;
  favoritesSelected: any = JSON.parse(localStorage.getItem('favorites')) === null
    ? []
    : JSON.parse(localStorage.getItem('favorites'));

  storeSub$ = new Subscription();

  @Input() searchProducts: any;
  @Input() orderType = localStorage.getItem('orderType');
  @Input() OnlineOrderingEnable = "true";
  @Output() productModalIsOpened = new EventEmitter<boolean>();

  constructor(private dialog: MatDialog,
    private router: Router,
    private store: Store<{ customer: [] }>,
    private snackBar: MatSnackBar
  ) {
    // @ts-ignore
    this.storeSub$ = store.pipe(select('cartShop')).subscribe((data) => (this.customer = data.customer));
    this.guest = this.customer.length === 0 ? 'Guest' : this.customer.customerFirstName + ' ' + this.customer.customerLastName;
  }

  ngOnInit(): void {
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngAfterViewChecked(): void {
    if (this.searchProducts.toString().length === 0) {
      this.empty = true;
    } else {
      this.empty = false;
    }
  }

  redirect(productId) {
    this.router.navigate(['products/' + productId]);
  }

  handleFavoriteClick(product) {
    if (!this.isFav(product.productId)) {
      this.addFavorites(product);
    } else {
      this.deleteFavorites(product);
    }
  }

  addFavorites = (product) => {
    const isFav = this.favoritesSelected.find((productFav) => {
      return productFav.productId === product.productId;
    });

    if (isFav === undefined) {
      this.favoritesSelected.push(product);
    } else {
      this.favoritesSelected = this.favoritesSelected.filter((productFav) => {
        return productFav.productId !== product.productId
      });
    }
    localStorage.setItem('favorites', JSON.stringify(this.favoritesSelected))
  }

  isFav = (productId) => {
    return this.favoritesSelected.find((product) => {
      return productId === product.productId
    }
    );
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

  deleteFavorites(product: any) {

  }

  ngOnDestroy() {
    this.storeSub$.unsubscribe();
  }
}
