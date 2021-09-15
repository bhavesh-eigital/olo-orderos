import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UncheckedCheckboxComponent } from './unchecked-checkbox.component';

describe('UncheckedCheckboxComponent', () => {
  let component: UncheckedCheckboxComponent;
  let fixture: ComponentFixture<UncheckedCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UncheckedCheckboxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UncheckedCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
