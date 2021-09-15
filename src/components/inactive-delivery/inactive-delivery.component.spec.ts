import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveDeliveryComponent } from './inactive-delivery.component';

describe('InactiveDeliveryComponent', () => {
  let component: InactiveDeliveryComponent;
  let fixture: ComponentFixture<InactiveDeliveryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InactiveDeliveryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InactiveDeliveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
