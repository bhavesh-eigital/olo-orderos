import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {PaymentRequestCDFComponent} from './payment-request.component';

describe('PaymentRequestComponent', () => {
  let component: PaymentRequestCDFComponent;
  let fixture: ComponentFixture<PaymentRequestCDFComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentRequestCDFComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentRequestCDFComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
