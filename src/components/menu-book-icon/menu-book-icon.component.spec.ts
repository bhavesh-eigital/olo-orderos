import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuBookIconComponent } from './menu-book-icon.component';

describe('MenuBookIconComponent', () => {
  let component: MenuBookIconComponent;
  let fixture: ComponentFixture<MenuBookIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuBookIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuBookIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
