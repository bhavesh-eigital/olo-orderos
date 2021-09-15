import {ComponentFixture, TestBed} from '@angular/core/testing';

import {OrderSummaryBottomSheetComponent} from './order-summary-bottom-sheet.component';

describe('OrderSummaryBottomSheetComponent', () => {
  let component: OrderSummaryBottomSheetComponent;
  let fixture: ComponentFixture<OrderSummaryBottomSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderSummaryBottomSheetComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderSummaryBottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
