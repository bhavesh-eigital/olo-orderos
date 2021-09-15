import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReRequestOloModalComponent } from './re-request-olo-modal.component';

describe('ReRequestOloModalComponent', () => {
  let component: ReRequestOloModalComponent;
  let fixture: ComponentFixture<ReRequestOloModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReRequestOloModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReRequestOloModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
