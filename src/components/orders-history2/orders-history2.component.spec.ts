import {ComponentFixture, TestBed} from '@angular/core/testing';

import {OrdersHistory2Component} from './orders-history2.component';

describe('OrdersHistory2Component', () => {
  let component: OrdersHistory2Component;
  let fixture: ComponentFixture<OrdersHistory2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrdersHistory2Component]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersHistory2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
