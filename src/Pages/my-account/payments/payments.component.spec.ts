import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentsComponent } from './payments.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { initialState } from '../../../store/reducer';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ConfigService } from 'src/services/config.service';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('PaymentsComponent', () => {
  let component: PaymentsComponent;
  let fixture: ComponentFixture<PaymentsComponent>;
  let store: MockStore;
  let loader: HarnessLoader;
  let router: Router
  const storeInitialState = { cartShop: { ...initialState } }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentsComponent],
      imports: [
        MatDialogModule,
        HttpClientModule,
        MatSnackBarModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        ConfigService,
        provideMockStore({ initialState: storeInitialState }),
        { provide: MatDialog, useValue: {} }
      ],
    })
      .compileComponents();

    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router)

  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentsComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('openDialog', () => {})
});
