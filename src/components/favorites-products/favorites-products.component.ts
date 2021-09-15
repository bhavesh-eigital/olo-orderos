import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-favorites-products',
  templateUrl: './favorites-products.component.html',
  styleUrls: ['./favorites-products.component.scss']
})
export class FavoritesProductsComponent implements OnInit, OnChanges {

  @Input() products = [];
  @Input() search = '';
  @Output() deleteProduct = new EventEmitter<any>();
  productsBackup = [];
  orderedProducts = [];
  orderedProductsBackup = [];

  constructor(private router: Router) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes && changes.products) {
      this.orderProductByCategorie();
      this.productsBackup = [...this.products];
      this.orderedProductsBackup = [...this.orderedProducts];
    }

    if (changes && changes.search) {
      this.searchProduct();
    }
  }

  openProduct(productId) {
    this.router.navigate(['product/' + productId]);
  }

  removeProduct(product) {
    this.deleteProduct.emit(product);
  }


  searchProduct() {
    if (this.search) {
      this.products = this.products.filter((product => product.productName.toLowerCase().includes(this.search.toLowerCase())));
      this.orderedProducts = [];
      this.orderProductByCategorie();
    } else {
      this.products = this.productsBackup;
      this.orderedProducts = this.orderedProductsBackup;
    }
  }

  orderProductByCategorie() {
    let productsCategories = [];
    this.orderedProducts = [];

    this.products.map(prod => {
      if (!productsCategories.includes(prod.productCategory[0])) {
        productsCategories.push(prod.productCategory[0]);
        this.orderedProducts.push({ category: prod.productCategory[0], products: [] });
      }
    });

    productsCategories.map((category, idx) => this.products.map((prod) => {
      if (prod.productCategory[0] === category) {
        this.orderedProducts[idx].products.push(prod);
      }
    }));

  }
}
