import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationOnIconComponent } from './location-on-icon.component';

describe('LocationOnIconComponent', () => {
  let component: LocationOnIconComponent;
  let fixture: ComponentFixture<LocationOnIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocationOnIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationOnIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
