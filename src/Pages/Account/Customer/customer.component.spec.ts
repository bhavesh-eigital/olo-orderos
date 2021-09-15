import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {Customer} from './customer.component';

describe('HelpComponent', () => {
  let component: Customer;
  let fixture: ComponentFixture<Customer>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [Customer]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Customer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
