import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrowLeftIconComponent } from './arrow-left-icon.component';

describe('ArrowLeftIconComponent', () => {
  let component: ArrowLeftIconComponent;
  let fixture: ComponentFixture<ArrowLeftIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArrowLeftIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArrowLeftIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
