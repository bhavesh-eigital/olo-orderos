import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UncheckedRadioButtonComponent } from './unchecked-radio-button.component';

describe('UncheckedRadioButtonComponent', () => {
  let component: UncheckedRadioButtonComponent;
  let fixture: ComponentFixture<UncheckedRadioButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UncheckedRadioButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UncheckedRadioButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
