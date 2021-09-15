import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivePickupComponent } from './active-pickup.component';

describe('ActivePickupComponent', () => {
  let component: ActivePickupComponent;
  let fixture: ComponentFixture<ActivePickupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivePickupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivePickupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
