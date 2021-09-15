import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CollapseHeaderComponent} from './collapse-header.component';

describe('CollapseHeaderComponent', () => {
  let component: CollapseHeaderComponent;
  let fixture: ComponentFixture<CollapseHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollapseHeaderComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollapseHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
