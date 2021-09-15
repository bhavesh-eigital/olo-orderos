import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckedRadioButtonComponent } from './checked-radio-button.component';

describe('CheckedRadioButtonComponent', () => {
  let component: CheckedRadioButtonComponent;
  let fixture: ComponentFixture<CheckedRadioButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckedRadioButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckedRadioButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
