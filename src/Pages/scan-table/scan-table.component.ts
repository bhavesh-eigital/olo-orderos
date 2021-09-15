import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { UIService } from '../../services/ui.service';
import * as ZXING from '@zxing/browser';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-scan-table',
  templateUrl: './scan-table.component.html',
  styleUrls: ['./scan-table.component.scss']
})
export class ScanTableComponent implements OnInit, AfterViewInit, OnDestroy {

  currentScreen = 0;
  deviceId: string;
  cameraContrl: ZXING.IScannerControls;
  cameras: MediaDeviceInfo[] = [];
  origin: string = '';
  tableNumber: number = 1;

  storeId: string;

  @ViewChild('indicator') indicator: ElementRef<HTMLElement>
  @ViewChild('scannerButton') scannerButton: ElementRef<HTMLElement>;
  @ViewChild('tableButton') tableButton: ElementRef<HTMLElement>;
  @ViewChild('slider') slider: ElementRef<HTMLElement>;
  @ViewChild('mainWrapper') mainWrapper: ElementRef<HTMLDivElement>;

  constructor(
    private renderer: Renderer2,
    private uiService: UIService,
    private router: Router,
    private store: Store<{ storeInformation: [] }>,
    private config: ConfigService
  ) {
    this.store.pipe(
      tap((state: any) => {
        this.storeId = state.cartShop.storeInformation.storeId;
      })
    ).subscribe();
  }

  ngOnInit() {
    this.origin = window.location.origin;
  }

  ngAfterViewInit() {
    this.uiService.materialInputEventListener();
    if (this.uiService.showTables) {
      this.toggleSlider(1);
      this.uiService.showTables = false;
    }

    setTimeout(() => this.setCamera, 1000);
    this.setCamera();
  }

  toggleSlider(screenNumber: number) {
    if (!screenNumber) {
      this.renderer.removeClass(this.indicator.nativeElement, 'right');
      this.renderer.addClass(this.indicator.nativeElement, 'left');
      this.renderer.removeClass(this.scannerButton.nativeElement, 'deactivated');
      this.renderer.addClass(this.scannerButton.nativeElement, 'activated');
      this.renderer.removeClass(this.tableButton.nativeElement, 'activated');
      this.renderer.addClass(this.tableButton.nativeElement, 'deactivated');
      this.renderer.setStyle(this.slider.nativeElement, 'background-color', 'rgba(224, 224, 224, 0.6)');
      this.setCamera();
    } else {
      this.renderer.removeClass(this.indicator.nativeElement, 'left');
      this.renderer.addClass(this.indicator.nativeElement, 'right');
      this.renderer.removeClass(this.tableButton.nativeElement, 'deactivated');
      this.renderer.addClass(this.tableButton.nativeElement, 'activated');
      this.renderer.removeClass(this.scannerButton.nativeElement, 'activated');
      this.renderer.addClass(this.scannerButton.nativeElement, 'deactivated');
      this.renderer.setStyle(this.slider.nativeElement, 'background-color', 'rgba(224, 224, 224, 0.6)');
      if (this.cameraContrl) {
        this.cameraContrl.stop();
      }
      setTimeout(() => this.uiService.materialInputEventListener(), 100);
    }

    this.currentScreen = screenNumber;
  }


  async setCamera(camera?: MediaDeviceInfo) {
    const codeReader = new ZXING.BrowserQRCodeReader();
    this.cameras = await ZXING.BrowserCodeReader.listVideoInputDevices();

    this.cameras.map(device => {
      if (device.label.includes('back')) {
        this.deviceId = device.deviceId;
      } else {
        this.deviceId = this.cameras[1] ? this.cameras[1].deviceId : this.cameras[0].deviceId;
      }
    });

    // if (!camera) {
    //   this.deviceId = this.cameras[1] ? this.cameras[1].deviceId : this.cameras[0].deviceId;
    // } else {
    //   this.deviceId = camera.deviceId;
    // }

    codeReader.decodeFromVideoDevice(this.deviceId, 'video', (result, error, control) => {
      this.cameraContrl = control;
      if (result) {
        location.href = result.getText();
        control.stop();
      }
    });
  }

  enterTable() {
    location.href = `${this.origin}/redirect?type=qr-at-table&tableNumber=${this.tableNumber}&storeId=${this.storeId}`;
  }

  switchCamera(camera: MediaDeviceInfo) {
    if (this.cameraContrl) {
      this.cameraContrl.stop();
      this.setCamera(camera);
    }
  }

  compareWidth(camera1: MediaDeviceInfo, camera2: MediaDeviceInfo) {
    return camera1.deviceId === camera2.deviceId
  }

  goToDinein() {
    if (!localStorage.tableNumber) {
      localStorage.orderType = 2;
      this.router.navigate(['home']);
    } else {
      this.router.navigate(['/dinein']);
    }
  }

  ngOnDestroy() {
    if (this.cameraContrl) {
      this.cameraContrl.stop();
    }
  }
}
