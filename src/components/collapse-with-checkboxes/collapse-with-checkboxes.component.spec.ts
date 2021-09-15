import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CollapseWithCheckboxesComponent} from './collapse-with-checkboxes.component';

describe('CollapseWithCheckboxesComponent', () => {
  let component: CollapseWithCheckboxesComponent;
  let fixture: ComponentFixture<CollapseWithCheckboxesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollapseWithCheckboxesComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollapseWithCheckboxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
