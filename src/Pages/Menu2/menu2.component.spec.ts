import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ConfigService } from 'src/services/config.service';
import { initialState } from 'src/store/reducer';

import { Menu2Component } from './menu2.component';

const mockStoreInformation = {
  cartShop: {
    ...initialState,
    storeInformation: {
      settings: [
        {
          settingName: "OnlineStoreDineIn",
          settingValue: "true"
        }
      ]
    }
  }
}

describe('Menu2Component', () => {
  let component: Menu2Component;
  let fixture: ComponentFixture<Menu2Component>;
  let store: MockStore;
  let router: Router

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Menu2Component],
      providers: [
        provideMockStore({ initialState: { ...mockStoreInformation } }),
        ConfigService
      ],
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientModule
      ]
    })
      .compileComponents();

    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
    // spyOn(component, 'OnlineStoreDineIn')
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Menu2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
