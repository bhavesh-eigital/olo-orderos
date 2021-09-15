import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YelpReviewsComponent } from './yelp-reviews.component';

describe('YelpReviewsComponent', () => {
  let component: YelpReviewsComponent;
  let fixture: ComponentFixture<YelpReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YelpReviewsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(YelpReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
