import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoyntModalComponent } from './poynt-modal.component';

describe('PoyntModalComponent', () => {
  let component: PoyntModalComponent;
  let fixture: ComponentFixture<PoyntModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoyntModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PoyntModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
