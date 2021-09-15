import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {LoginComponentV2} from './login.component';

describe('ResetPassComponent', () => {
  let component: LoginComponentV2;
  let fixture: ComponentFixture<LoginComponentV2>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LoginComponentV2]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponentV2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
