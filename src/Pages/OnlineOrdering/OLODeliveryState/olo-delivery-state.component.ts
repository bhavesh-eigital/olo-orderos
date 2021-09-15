import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {ConfigService} from '../../../services/config.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DeliveryStatus, OloService} from '../../../services/olo.service';
import {Subscription, from, timer, of} from 'rxjs';
import {map, tap, delay} from 'rxjs/operators';
import {concatMap} from 'rxjs/internal/operators';
import {MapsAPILoader} from '@agm/core';
import {OloSocketService} from '../../../services/olo.socket.service';
import {MatDialog} from '@angular/material/dialog';
import {CancelReasonComponent} from './Components/cancel-reason/cancel-reason.component';
import {AddTipsComponent} from './Components/add-tips/add-tips.component';

@Component({
  selector: 'app-olo-delivery-state',
  templateUrl: './olo-delivery-state.component.html',
  styleUrls: ['./olo-delivery-state.component.scss'],
  providers: [OloSocketService]
})
export class OloDeliveryStateComponent implements OnInit, OnDestroy {

  customer: any = [];
  guest: any = 'Guest';
  storeInformation: any;
  paymentInfo: any;
  loading = true;

  customerSub$ = new Subscription();
  storeInfoSub$ = new Subscription();

  stateOrder: any;
  emitState = new Subscription();
  isDeliveryCancel = false;
  lat = 51.678418;
  lng = 7.809007;
  points = [ {
    lat: 50.082730,
    lng: 14.431697
    },
    {
      lat: 50.083202,
      lng: 14.430994
    } ];

  intervalId: any;
  isAssigned = false;
  isListeningSocket = false;
  driverInfo: DeliveryStatus;
  deliveryId: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private configService: ConfigService,
    public oloService: OloService,
    private snackBar: MatSnackBar,
    private mapsAPILoader: MapsAPILoader,
    public oloSocket: OloSocketService,
    public dialog: MatDialog,
    private store: Store<{ storeInformation: []; cart: [], customer: [] }>,
  ) {
    // @ts-ignore
    this.customerSub$ = store.pipe(select('cartShop')).subscribe((data) => (this.storeInformation = data.storeInformation));
    // @ts-ignore
    this.storeInfoSub$ = store.pipe(select('cartShop')).subscribe((data) => (this.customer = data.customer));
    this.guest = this.customer.length === 0 ? 'Guest' : this.customer.customerFirstName + ' ' + this.customer.customerLastName;
  }

  ngOnDestroy(): void {
    this.emitState.unsubscribe();
    this.oloSocket.deliveryTracker.unsubscribe();
    this.oloSocket.closeSocket();
  }

  ngOnInit(): void {
    this.getOrderPaymentsInformation(this.storeInformation);
    const arraySource = from([1, 2, 3, 4, 5, 6, 7]).pipe(
      concatMap( item => of(item).pipe( delay( 1500 ) ))
    );
    this.deliveryId = this.route.snapshot.queryParams.deliveryId;
    const orderId = this.route.snapshot.queryParams.orderId;
    // this.emitState = arraySource.pipe(
    //   tap(val => this.stateOrder = val)
    // ).subscribe();
    this.getDeliveryStatus(this.deliveryId, this.storeInformation.storeId);
    this.generateOLOToken(this.storeInformation.storeId, orderId, this.storeInformation.merchantId);
    this.listenedSocket();
    // this.intervalId = setInterval(() => {
    //   this.getDeliveryStatus(deliveryId, this.storeInformation.storeId);
    // }, 5000);
  }

  getOrderPaymentsInformation = (storeInformation) => {
    this.configService.getOrderPayments(storeInformation.merchantId, storeInformation.storeId, localStorage.getItem('orderId'))
      .subscribe((data: any) => {
        this.paymentInfo = data.response[0];
        this.loading = !this.loading;
      });
  }

  getDeliveryStatus = (deliveryId, storeId) => {
    this.oloService.statusDelivery(deliveryId, storeId).pipe(
      tap( ({success, response}) => {
        if (success === 1) {
          if (response.status === 'Pending') {
            this.stateOrder = 2;
          }
          if (response.status === 'Assigned') {
            this.driverInfo = response;
            this.isAssigned = true;
            this.stateOrder = 3;
          }
          if (response.status === 'InTransit') {
            this.driverInfo = response;
            this.isAssigned = true;
            this.stateOrder = 4;
          }
          if (response.status === 'AtDestination') {
            this.driverInfo = response;
            this.isAssigned = true;
            this.stateOrder = 5;
          }
          if (response.status === 'Delivered') {
            this.driverInfo = response;
            this.isAssigned = true;
            this.stateOrder = 6;
            this.isListeningSocket = false;
            this.oloSocket.closeSocket();
            clearInterval(this.intervalId);
          }
          if (response.status === 'Canceled') {
            this.driverInfo = response;
            this.isAssigned = true;
            this.oloSocket.closeSocket();
            this.isDeliveryCancel = true;
          }
        }
      } )
    ).subscribe();
  }

  goBack() {
    this.router.navigate(['home']);
  }

  getLocation(address) {
    this.mapsAPILoader.load().then(() => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({'address': address}, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          const lat = results[0].geometry.location.lat();
          const long = results[0].geometry.location.lng();
          this.lat = lat;
          this.lng = long;
        }
      });
    });
  }

  cancelOrder() {
    // this.emitState.unsubscribe();
    this.oloSocket.deliveryTracker.unsubscribe();
    // this.stateOrder = 8;
    // this.isDeliveryCancel = !this.isDeliveryCancel;
    this.dialog.open(CancelReasonComponent).afterClosed().pipe(
      tap((reasonCancel) => {
        if (reasonCancel) {
          this.oloService.cancelOrder(this.deliveryId, reasonCancel.id, reasonCancel.note ).pipe(
            tap((cancelRes: any) => {
              if (cancelRes.success === 1) {
                this.isDeliveryCancel = true;
                this.openSnackBar(cancelRes.response.message, 1);
              } else {
                this.openSnackBar('An error occurred', 2);
              }
            })
          ).subscribe();
        }
      })
    ).subscribe();
  }

  generateOLOToken = (storeId, orderId, merchantId )  => {
    this.configService.getTokenStore({type: 'olo', storeId, orderId, merchantId}).pipe(
      tap((res: any) => {
        if (res.success === 1) {
          this.oloSocket.connectOLOSocket(res.data.token);
        }
      })
    ).subscribe();
  }


  listenedSocket() {
    this.oloSocket.deliveryTracker.pipe(
      tap((socketRes) => {
        if (socketRes?.data.status === 'Pending') {
          this.isListeningSocket = true;
          this.stateOrder = 2;
        }
        if (socketRes?.data.status === 'Assigned') {
          this.isListeningSocket = true;
          this.isAssigned = true;
          this.driverInfo = socketRes.data;
          this.stateOrder = 3;
        }
        if (socketRes?.data.status === 'InTransit') {
          this.isListeningSocket = true;
          this.isAssigned = true;
          this.stateOrder = 4;
        }
        if (socketRes?.data.status === 'AtDestination') {
          this.isListeningSocket = true;
          this.isAssigned = true;
          this.stateOrder = 5;
        }
        if (socketRes?.data.status === 'Delivered') {
          this.isListeningSocket = true;
          this.isAssigned = true;
          this.stateOrder = 6;
          this.oloSocket.closeSocket();
        }
        if (socketRes?.data.status === 'Canceled') {
          this.isDeliveryCancel = true;
          this.oloSocket.closeSocket();
        }
    })
    ).subscribe();
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 5000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  goToReceipt() {
    this.router.navigate(['receipt']);
  }

  openTipModal() {
    if (this.stateOrder <  3) {
      this.openSnackBar(`Diver hasn't been assigned yet`, 1);
      return;
    }
    this.dialog.open(AddTipsComponent, {
      data: { driverName: this.driverInfo.driverName }
    }).afterClosed().pipe(
      tap( value => {
        if (value) {
          this.oloService.addTip(this.deliveryId, value).pipe(
            tap( ({success, response, message}) => {
              if (success === 1) {
                this.openSnackBar(message, 1);
              } else {
                this.openSnackBar(message, 2);
              }
            } )
          ).subscribe();
        }
      })
    ).subscribe();
  }
}
