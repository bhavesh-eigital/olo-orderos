import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as io from 'socket.io-client';
import { environment } from '../environments/environment';
import { ConfigService } from './config.service';

@Injectable()
export class WebSocketService {
  private url = 'https://ws.eatos.net';
  socket;
  token = environment.token;

  constructor(
    private configService: ConfigService,
    private router: Router
  ) {
    this.socket = io(this.url);
    this.socket.on('connect', () => {
      console.log('Ininitialized');
    });
  }

  connectSocket(token: string) {
    this.socket.emit('authenticate', { token });
    this.socket.on('authenticated', () => {
        // console.log('conected!!');
      });
    this.socket.on('cfd', data => {
      // console.log('cfd', data);
    });
    this.socket.on('data', data => {
      if(data?.[0]?.model === 'setting') {
        const settings = data[0].data[0];
        const options = {
          OnlineStoreAllowOrderAsGuest: true,
          OnlineStoreAllowOrderWithoutPaying: true,
          OnlineOrderingAcceptCashPayments: true,
        };
        if(options[settings.settingName]) {
          if(settings.settingValue !== localStorage.getItem(settings.settingName)) {
            localStorage.setItem(settings.settingName, settings.settingValue);
            setTimeout(() => window.location.reload(), 500);
          }
        }
      }
    });

    this.socket.on('qr_cancel', data => {
      const orderIdSent = data.orderId;

      if (this.configService.cfdOn && orderIdSent === localStorage.getItem('orderId')) {
        this.router.navigate(['home']);
      } else {
        // console.log('continue');
      }
    })

  }
}
