import {ComponentFixture, TestBed} from '@angular/core/testing';

import {OrderSummary2Component} from './order-summary2.component';

describe('OrderSummary2Component', () => {
  let component: OrderSummary2Component;
  let fixture: ComponentFixture<OrderSummary2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderSummary2Component]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderSummary2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
