import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrowRightIconComponent } from './arrow-right-icon.component';

describe('ArrowRightIconComponent', () => {
  let component: ArrowRightIconComponent;
  let fixture: ComponentFixture<ArrowRightIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArrowRightIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArrowRightIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
