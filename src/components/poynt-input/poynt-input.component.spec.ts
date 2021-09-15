import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoyntInputComponent } from './poynt-input.component';

describe('PoyntInputComponent', () => {
  let component: PoyntInputComponent;
  let fixture: ComponentFixture<PoyntInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoyntInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PoyntInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
