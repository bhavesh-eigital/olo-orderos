import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCardConnectComponent } from './form-card-connect.component';

describe('FormCardConnectComponent', () => {
  let component: FormCardConnectComponent;
  let fixture: ComponentFixture<FormCardConnectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormCardConnectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormCardConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
