import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapseHeaderCheckoutPaymentComponent } from './collapse-header-checkout-payment.component';

describe('CollapseHeaderCheckoutPaymentComponent', () => {
  let component: CollapseHeaderCheckoutPaymentComponent;
  let fixture: ComponentFixture<CollapseHeaderCheckoutPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollapseHeaderCheckoutPaymentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollapseHeaderCheckoutPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
