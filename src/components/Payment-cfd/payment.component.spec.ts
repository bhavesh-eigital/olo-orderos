import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PaymentCFDComponent } from './payment.component';

describe('PaymentComponent', () => {
  let component: PaymentCFDComponent;
  let fixture: ComponentFixture<PaymentCFDComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentCFDComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentCFDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
