import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveDeliveryComponent } from './active-delivery.component';

describe('ActiveDeliveryComponent', () => {
  let component: ActiveDeliveryComponent;
  let fixture: ComponentFixture<ActiveDeliveryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveDeliveryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveDeliveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
