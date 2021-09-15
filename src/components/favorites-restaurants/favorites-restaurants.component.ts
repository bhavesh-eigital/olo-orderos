import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-favorites-restaurants',
  templateUrl: './favorites-restaurants.component.html',
  styleUrls: ['./favorites-restaurants.component.scss']
})
export class FavoritesRestaurantsComponent implements OnInit, OnChanges {

  @Input() favorites = [];
  @Input() search = '';
  @Output() deleteRestaurant = new EventEmitter<any>();
  favoritesBackup = [];

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes && changes.favorites && !changes.favorites.previousValue && changes.favorites.currentValue && changes.favorites.currentValue.length) {
      this.favoritesBackup = [...this.favorites];
    }

    if (changes && changes.search) {
      this.searchRestaurant();
    }
  }

  openStore(store) {
    window.open(store);
  }

  removeRestaurant(store) {
    this.deleteRestaurant.emit(store);
  }

  searchRestaurant() {
    if (this.search) {
      this.favorites = this.favorites.filter((restaurant => restaurant.onlineStoreName.toLowerCase().includes(this.search.toLowerCase())));
    } else {
      this.favorites = this.favoritesBackup;
    }
  }
}
