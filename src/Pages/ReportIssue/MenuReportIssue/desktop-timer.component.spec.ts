import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FooterComponent } from 'src/components/Footer/footer.component';

// @ts-ignore
import {DesktopTimer} from './desktop-timer.component';

describe('FooterComponent', () => {
  let component: DesktopTimer;
  let fixture: ComponentFixture<DesktopTimer>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DesktopTimer, FooterComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesktopTimer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
