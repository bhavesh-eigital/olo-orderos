import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import * as io from 'socket.io-client';
import {environment} from '../environments/environment';
import {ConfigService} from './config.service';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class OloSocketService {
  private url = 'https://ws.eatos.net';
  socket;
  token = environment.token;
  deliveryTracker = new BehaviorSubject<any>(null);

  constructor(
    private configService: ConfigService,
    private router: Router
  ) {
    this.socket = io(this.url);
    this.socket.on('connect', () => {
      console.log('Ininitialized OLO');
    });
  }

  connectOLOSocket(token: string) {
    this.socket.emit('authenticate', {token});
    this.socket.on('authenticated', () => {
      console.log('conected OLO');
    });
    this.socket.on('olo', data => {
      this.deliveryTracker.next(data);
      console.log('olo', data);
    });
  }

  closeSocket = () => {
    this.socket.close();
    console.log('olo socket off');
  }


}
