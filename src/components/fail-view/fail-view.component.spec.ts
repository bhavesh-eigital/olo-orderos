import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FailViewComponent} from './fail-view.component';

describe('FailViewComponent', () => {
  let component: FailViewComponent;
  let fixture: ComponentFixture<FailViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FailViewComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
