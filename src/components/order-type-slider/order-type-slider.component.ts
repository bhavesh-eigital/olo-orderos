import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  Renderer2,
  SimpleChange,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { ConfigService } from 'src/services/config.service';
import { getCurrentAddressData } from '../../utils/getCurrentAddressData';
import { UIService } from '../../services/ui.service';
import {OloService} from '../../services/olo.service';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'app-order-type-slider',
  templateUrl: './order-type-slider.component.html',
  styleUrls: ['./order-type-slider.component.scss']
})
export class OrderTypeSliderComponent implements AfterViewInit, OnChanges {

  @Input() currentOrderType = 2;
  @Input() largeSize = false;
  @Output() currentOrderTypeChange = new EventEmitter<number>();
  @Output() previousValue = new EventEmitter<number>();
  @ViewChild('indicator') indicator: ElementRef<HTMLElement>
  @ViewChild('slider') slider: ElementRef<HTMLElement>;

  @ViewChild('delivery') delivery: ElementRef<HTMLDivElement>;
  @ViewChild('pickup') pickup: ElementRef<HTMLDivElement>;
  @ViewChild('curbside') curbside: ElementRef<HTMLDivElement>;

  deliveryIsDisabled = false;
  pickUpIsDisabled = false;
  curbsideIsDisabled = false;
  indicatorSize = 0;
  innerWidth = 0;
  storeInformation: any;
  customerDefaultAddress: any;
  isInRange: any;
  isOloIntegrated = localStorage.getItem('isOloIntegrated') === 'true';

  constructor(
    private renderer: Renderer2,
    private configService: ConfigService,
    private store: Store<{ storeInformation: []; cart: []; customer: [] }>,
    private snackbar: MatSnackBar,
    private oloService: OloService,
    public uiService: UIService
  ) {
    store.subscribe((state: any) => {
      const data = state.cartShop;
      this.storeInformation = data.storeInformation;
      this.customerDefaultAddress = data.customerDefaultAddress;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.currentOrderType?.previousValue) {
      this.previousValue.emit(changes.currentOrderType?.previousValue);
    }
  }

  ngAfterViewInit() {
    this.onResize();
    this.deliveryIsDisabled = localStorage.getItem('orderTypeDelivery') === 'false' ? true : false;
    this.pickUpIsDisabled = localStorage.getItem('orderTypePickup') === 'false' ? true : false;
    this.curbsideIsDisabled = localStorage.getItem('orderTypeCurbside') === 'false' ? true : false;
    this.calculateIndicatorSize();
  }

  calculateIndicatorSize() {
    let operand = 0;
    if (!this.deliveryIsDisabled) {
      operand += 1;
    }

    if (!this.pickUpIsDisabled) {
      operand += 1;
    }

    if (!this.curbsideIsDisabled) {
      operand += 1;
    }

    this.indicatorSize = 100 / operand;
  }

  orderTypeSelected(typeSelected: number) {
    this.toggleSlider(typeSelected);
  }

  toggleSlider(typeSelected: number) {
    if (typeSelected === 1) {
      if (this.isOloIntegrated) {
        this.isOLOInRange();
      } else {
        this.isUserInRange();
      }
    } else if (typeSelected === 2) {
      this.handleIndicator(typeSelected);
      if (!this.pickUpIsDisabled) {
        if (this.curbside) {
          this.renderer.removeClass(this.curbside.nativeElement, 'activated');
          this.renderer.setStyle(this.curbside.nativeElement, 'color', '#212121');
        }

        if (this.delivery) {
          this.renderer.removeClass(this.delivery.nativeElement, 'activated');
          this.renderer.setStyle(this.delivery.nativeElement, 'color', '#212121');
        }

        if (this.pickup) {
          this.renderer.addClass(this.pickup.nativeElement, 'activated');
          this.renderer.setStyle(this.pickup.nativeElement, 'color', 'var(--theme-global-var)');
        }
        this.currentOrderTypeChange.emit(typeSelected);
      } else if (!this.curbsideIsDisabled) {
        this.toggleSlider(3);

      } else if (!this.delivery) {
        this.toggleSlider(1);
      }
    } else if (typeSelected === 3) {
      this.handleIndicator(typeSelected);

      if (this.pickup) {
        this.renderer.removeClass(this.pickup.nativeElement, 'activated');
        this.renderer.setStyle(this.pickup.nativeElement, 'color', '#212121');
      }

      if (this.delivery) {
        this.renderer.removeClass(this.delivery.nativeElement, 'activated');
        this.renderer.setStyle(this.delivery.nativeElement, 'color', '#212121');
      }

      if (this.curbside) {
        this.renderer.addClass(this.curbside.nativeElement, 'activated');
        this.renderer.setStyle(this.curbside.nativeElement, 'color', 'var(--theme-global-var)');
      }
      this.currentOrderTypeChange.emit(typeSelected);
    }
  }

  onDeliverySelected() {
    this.handleIndicator(1);
    if (this.pickup) {
      this.renderer.removeClass(this.pickup.nativeElement, 'activated');
      this.renderer.setStyle(this.pickup.nativeElement, 'color', '#212121');
    }
    if (this.curbside) {
      this.renderer.removeClass(this.curbside.nativeElement, 'activated');
      this.renderer.setStyle(this.curbside.nativeElement, 'color', '#212121');
    }
    if (this.delivery) {
      this.renderer.addClass(this.delivery.nativeElement, 'activated');
      this.renderer.setStyle(this.delivery.nativeElement, 'color', 'var(--theme-global-var)');
    }
    this.currentOrderTypeChange.emit(1);
  }

  handleIndicator(typeSelected: number) {
    if (!this.deliveryIsDisabled && !this.pickUpIsDisabled && !this.curbsideIsDisabled) {
      if (typeSelected === 1) {
        this.renderer.removeClass(this.indicator.nativeElement, 'middle');
        this.renderer.removeClass(this.indicator.nativeElement, 'right');
        this.renderer.addClass(this.indicator.nativeElement, 'left');

      } else if (typeSelected === 2) {
        this.renderer.removeClass(this.indicator.nativeElement, 'left');
        this.renderer.removeClass(this.indicator.nativeElement, 'right');
        this.renderer.addClass(this.indicator.nativeElement, 'middle');

      } else if (typeSelected === 3) {
        this.renderer.removeClass(this.indicator.nativeElement, 'left');
        this.renderer.removeClass(this.indicator.nativeElement, 'middle');
        this.renderer.addClass(this.indicator.nativeElement, 'right');
      }

    } else if (!this.deliveryIsDisabled && !this.pickUpIsDisabled && this.curbsideIsDisabled) {
      if (typeSelected === 1) {
        this.renderer.removeClass(this.indicator.nativeElement, 'middle');
        this.renderer.addClass(this.indicator.nativeElement, 'left');

      } else if (typeSelected === 2) {
        this.renderer.removeClass(this.indicator.nativeElement, 'left');
        this.renderer.addClass(this.indicator.nativeElement, 'middle');

      }

    } else if (!this.deliveryIsDisabled && this.pickUpIsDisabled && !this.curbsideIsDisabled) {
      if (typeSelected === 1) {
        this.renderer.removeClass(this.indicator.nativeElement, 'middle');
        this.renderer.addClass(this.indicator.nativeElement, 'left');
      }

      else if (typeSelected === 2) {
        this.toggleSlider(3);

      } else if (typeSelected === 3) {
        this.renderer.removeClass(this.indicator.nativeElement, 'left');
        this.renderer.addClass(this.indicator.nativeElement, 'middle');
      }

    } else if (this.deliveryIsDisabled && !this.pickUpIsDisabled && !this.curbsideIsDisabled) {
      if (typeSelected === 2) {
        this.renderer.removeClass(this.indicator.nativeElement, 'middle');
        this.renderer.addClass(this.indicator.nativeElement, 'left');

      } else if (typeSelected === 3) {
        this.renderer.removeClass(this.indicator.nativeElement, 'left');
        this.renderer.addClass(this.indicator.nativeElement, 'middle');
      }

    } else if (
      !this.deliveryIsDisabled && this.pickUpIsDisabled && this.curbsideIsDisabled ||
      this.deliveryIsDisabled && !this.pickUpIsDisabled && this.curbsideIsDisabled ||
      this.deliveryIsDisabled && this.pickUpIsDisabled && !this.curbsideIsDisabled
    ) {
      if (!this.deliveryIsDisabled && this.pickUpIsDisabled && this.curbsideIsDisabled) {
        this.deactiveSlider();
        return
      }

      this.renderer.removeClass(this.indicator.nativeElement, 'right');
      this.renderer.removeClass(this.indicator.nativeElement, 'left');
      this.renderer.addClass(this.indicator.nativeElement, 'left');
    }
  }

  deactiveSlider() {
    this.indicatorSize = 0;
    this.renderer.setStyle(this.indicator.nativeElement, 'display', 'none');
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.innerWidth = window.innerWidth
  }

  isUserInRange() {
    const { currentAddress, currentCity } = getCurrentAddressData(this.customerDefaultAddress);
    if (!currentAddress) {
      this.validateLocation();
      return;
    }
    this.configService.getDeliveryDistance(this.storeInformation.storeId, currentAddress, currentCity)
      .subscribe((distanceResponse: any) => {
        this.isInRange = distanceResponse.inRange;
        if (this.isInRange) {
          this.onDeliverySelected();
        } else {
          if (!this.pickUpIsDisabled) {
            localStorage.orderType = 2;
            this.toggleSlider(2);
          } else if (!this.curbsideIsDisabled) {
            localStorage.orderType = 3;
            this.toggleSlider(3);
          } else {
            localStorage.removeItem('orderType');
            this.deactiveSlider();
          }
          this.snackbar.open('Your address is too far away to deliver', 'OK', {
            duration: 5000,
            panelClass: ['red-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      });
  }

  // Since OLO has his own estimate time, we are not longer using google maps time

  isOLOInRange() {
    const { currentAddress } = getCurrentAddressData(this.customerDefaultAddress);
    if (!currentAddress) {
      this.validateLocation();
      return;
    }
    this.oloService.checkRange(this.storeInformation.storeId).pipe(
      tap( ({success, response, message}) => {
        if (success === 1) {
          if (response.isAvailable) {
            this.isInRange = response.isAvailable;
            this.onDeliverySelected();
          } else {
            if (!this.pickUpIsDisabled) {
              localStorage.orderType = 2;
              this.toggleSlider(2);
            } else if (!this.curbsideIsDisabled) {
              localStorage.orderType = 3;
              this.toggleSlider(3);
            } else {
              localStorage.removeItem('orderType');
              this.deactiveSlider();
            }
            this.snackbar.open('Your address is too far to deliver', 'OK', {
              duration: 5000,
              panelClass: ['red-snackbar'],
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          }
        } else {
          this.snackbar.open( message , 'OK', {
            duration: 5000,
            panelClass: ['red-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      } )
    ).subscribe();
  }

  validateLocation(){
    this.snackbar.open('Please insert your address to deliver', 'OK', {
      duration: 5000,
      panelClass: ['red-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
