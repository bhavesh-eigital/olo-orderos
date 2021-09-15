import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OloDeliveryStateComponent } from './olo-delivery-state.component';

describe('OloDeliveryStateComponent', () => {
  let component: OloDeliveryStateComponent;
  let fixture: ComponentFixture<OloDeliveryStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OloDeliveryStateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OloDeliveryStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
