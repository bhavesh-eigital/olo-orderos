import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NearMeIconComponent } from './near-me-icon.component';

describe('NearMeIconComponent', () => {
  let component: NearMeIconComponent;
  let fixture: ComponentFixture<NearMeIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NearMeIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NearMeIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
