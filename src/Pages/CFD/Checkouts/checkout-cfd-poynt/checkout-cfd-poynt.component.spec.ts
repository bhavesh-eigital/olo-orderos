import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutCfdPoyntComponent } from './checkout-cfd-poynt.component';

describe('CheckoutCfdPoyntComponent', () => {
  let component: CheckoutCfdPoyntComponent;
  let fixture: ComponentFixture<CheckoutCfdPoyntComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckoutCfdPoyntComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutCfdPoyntComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
