import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryOloModalComponent } from './delivery-olo-modal.component';

describe('DeliveryOloModalComponent', () => {
  let component: DeliveryOloModalComponent;
  let fixture: ComponentFixture<DeliveryOloModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeliveryOloModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryOloModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
