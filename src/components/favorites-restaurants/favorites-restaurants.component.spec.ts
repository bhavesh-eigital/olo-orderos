import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FavoritesRestaurantsComponent} from './favorites-restaurants.component';

describe('FavoritesRestaurantsComponent', () => {
  let component: FavoritesRestaurantsComponent;
  let fixture: ComponentFixture<FavoritesRestaurantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FavoritesRestaurantsComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FavoritesRestaurantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
