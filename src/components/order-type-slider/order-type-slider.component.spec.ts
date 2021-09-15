import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderTypeSliderComponent } from './order-type-slider.component';

describe('OrderTypeSliderComponent', () => {
  let component: OrderTypeSliderComponent;
  let fixture: ComponentFixture<OrderTypeSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderTypeSliderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderTypeSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
