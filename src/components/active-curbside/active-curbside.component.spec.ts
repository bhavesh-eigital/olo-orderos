import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveCurbsideComponent } from './active-curbside.component';

describe('ActiveCurbsideComponent', () => {
  let component: ActiveCurbsideComponent;
  let fixture: ComponentFixture<ActiveCurbsideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveCurbsideComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveCurbsideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
