import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-order-summary-items',
  templateUrl: './order-summary-items.component.html',
  styleUrls: ['./order-summary-items.component.scss']
})
export class OrderSummaryItemsComponent implements OnInit {

  @Input() items = [];

  constructor() {
  }

  ngOnInit(): void { }

  getIngredientsAndModifiers(item) {
    let words = '';
    if (item && item.productIngredients) {
      item.productIngredients.map((ingredient: any, i: number) => {
        words += ingredient.ingredientName;
        if (i < item.productIngredients.length - 1 && (!item.productModifiers || !item.productModifiers.length)) {
          words += ', ';
        }
      }); ``
    }

    if (item && item.productModifiers) {
      item.productModifiers.map((modifier: any, i: number) => {
        words += modifier.modifierName;
        if (i < item.productModifiers.length - 1) {
          words += ', ';
        }
      }); ``
    }
    return words;
  }


}
