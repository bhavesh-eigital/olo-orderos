import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap } from 'rxjs/operators';
import { PaymentModalComponent } from '../payment-modal/payment-modal.component';

@Component({
  selector: 'app-menu-section',
  templateUrl: './menu-section.component.html',
  styleUrls: ['./menu-section.component.scss']
})
export class MenuSectionComponent implements OnInit {

  @Input() isPopular: boolean;
  @Input() items: any;
  @Input() sectionId = '';
  @Input() categoryName: string = '';
  @Input() index = 0;
  @Input() isSearchResult = false;
  @Input() favorites = [];
  @Input() OnlineStoreDineIn: string = 'true';
  @Input() thereArePopular: boolean;
  @Output() addFavorite = new EventEmitter<any>();
  @Output() productModalIsOpened = new EventEmitter<boolean>();
  @Output() deleteFavorite = new EventEmitter<any>();
  @ViewChild('section') section: ElementRef<HTMLElement>;

  constructor(
    private dialog: MatDialog,
    private renderer: Renderer2,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void { }

  openDialog(currentProduct): void {

    if (this.OnlineStoreDineIn === 'false') {
      this.snackBar.open('This store has disabled the option to order from Dinein', '', {
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
      data: { product: currentProduct, action: 'add' }
    });

    dialogRef.afterOpened().pipe(
      tap(() => this.productModalIsOpened.emit(true))
    ).subscribe();
    dialogRef.afterClosed().pipe(
      tap(() => this.productModalIsOpened.emit(false))
    ).subscribe();
  }

  isFav = (productId) => {
    if (this.favorites) {
      return this.favorites.find((product) => productId === product);
    }
  }

  handleFavoriteClick(product) {
    if (!this.isFav(product.productId)) {
      this.addFavorite.emit(product);
    } else {
      this.deleteFavorite.emit(product);
    }
  }

}
