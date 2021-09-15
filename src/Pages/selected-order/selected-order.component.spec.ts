import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SelectedOrderComponent} from './selected-order.component';

describe('SelectedOrderComponent', () => {
  let component: SelectedOrderComponent;
  let fixture: ComponentFixture<SelectedOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectedOrderComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
