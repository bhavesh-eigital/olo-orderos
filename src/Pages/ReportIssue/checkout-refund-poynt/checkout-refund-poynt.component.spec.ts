import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutRefundPoyntComponent } from './checkout-refund-poynt.component';

describe('CheckoutRefundPoyntComponent', () => {
  let component: CheckoutRefundPoyntComponent;
  let fixture: ComponentFixture<CheckoutRefundPoyntComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckoutRefundPoyntComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutRefundPoyntComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
