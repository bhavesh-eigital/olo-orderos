import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FillLikeIconComponent } from './fill-like-icon.component';

describe('FillLikeIconComponent', () => {
  let component: FillLikeIconComponent;
  let fixture: ComponentFixture<FillLikeIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FillLikeIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FillLikeIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
