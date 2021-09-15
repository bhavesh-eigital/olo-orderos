import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckedCheckboxComponent } from './checked-checkbox.component';

describe('CheckedCheckboxComponent', () => {
  let component: CheckedCheckboxComponent;
  let fixture: ComponentFixture<CheckedCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckedCheckboxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckedCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
