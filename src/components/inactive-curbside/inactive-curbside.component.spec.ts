import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveCurbsideComponent } from './inactive-curbside.component';

describe('InactiveCurbsideComponent', () => {
  let component: InactiveCurbsideComponent;
  let fixture: ComponentFixture<InactiveCurbsideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InactiveCurbsideComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InactiveCurbsideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
