import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuBookIconFilledComponent } from './menu-book-icon-filled.component';

describe('MenuBookIconFilledComponent', () => {
  let component: MenuBookIconFilledComponent;
  let fixture: ComponentFixture<MenuBookIconFilledComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuBookIconFilledComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuBookIconFilledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
