import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {SearchProductsV2Component} from './searchProducts.component';

describe('CategoriesComponent', () => {
  let component: SearchProductsV2Component;
  let fixture: ComponentFixture<SearchProductsV2Component>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SearchProductsV2Component]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchProductsV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
