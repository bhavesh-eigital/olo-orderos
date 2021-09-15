import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutPoyntComponent } from './checkout-poynt.component';

describe('CheckoutPoyntComponent', () => {
  let component: CheckoutPoyntComponent;
  let fixture: ComponentFixture<CheckoutPoyntComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckoutPoyntComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutPoyntComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
