import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactivePickupComponent } from './inactive-pickup.component';

describe('InactivePickupComponent', () => {
  let component: InactivePickupComponent;
  let fixture: ComponentFixture<InactivePickupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InactivePickupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InactivePickupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
