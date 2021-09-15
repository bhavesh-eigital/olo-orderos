import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutlinedLikeIconComponent } from './outlined-like-icon.component';

describe('OutlinedLikeIconComponent', () => {
  let component: OutlinedLikeIconComponent;
  let fixture: ComponentFixture<OutlinedLikeIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OutlinedLikeIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OutlinedLikeIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
