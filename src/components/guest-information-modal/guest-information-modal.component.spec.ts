import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GuestInformationModalComponent } from './guest-information-modal.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { initialState } from '../../store/reducer';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('GuestInformationModalComponent', () => {
  let component: GuestInformationModalComponent;
  let fixture: ComponentFixture<GuestInformationModalComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GuestInformationModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        provideMockStore({ initialState: { cartShop: { ...initialState } } })
      ]
    })
      .compileComponents();

    store = TestBed.inject(MockStore);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GuestInformationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
