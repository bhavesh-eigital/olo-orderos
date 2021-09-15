import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../../../models/product';
import { RemoveFromCart } from '../../../store/actions';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { ProductModal } from '../../Product/product-modal';

@Component({
  selector: 'your-product-cfd',
  templateUrl: './your-product.html',
  styleUrls: ['./your-product.scss']
})
export class YourProductCfd implements OnInit {

  @Input() product: any;
  cart: any;
  storeInformation: any;
  customer: any;
  paymentInfo: any;
  currency = localStorage.getItem('currency');

  constructor(
    private store: Store<{ storeInformation: []; cart: [], customer: [] }>,
    private dialog: MatDialog) {
  }

  ngOnInit(): void { }

  removeProduct(item: Product) {
    this.store.dispatch(new RemoveFromCart(item));
  }

  editProduct = () => {
    this.dialog.open(ProductModal, {
      data: { product: this.product, action: 'edit' }, panelClass: 'full-screen-modal'
    });
  }
}
