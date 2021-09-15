import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineOrderingFooterComponent } from './online-ordering-footer.component';

describe('OnlineOrderingFooterComponent', () => {
  let component: OnlineOrderingFooterComponent;
  let fixture: ComponentFixture<OnlineOrderingFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnlineOrderingFooterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineOrderingFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
