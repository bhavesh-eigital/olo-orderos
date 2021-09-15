import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../environments/environment';
import {catchError} from 'rxjs/operators';
import {BehaviorSubject, Observable, throwError} from 'rxjs';

interface FoundDsp {
  isAvailable: boolean;
  quoteId: string;
  deliveryFee: number;
  deliveryTime: number;
  expires: number;
}

interface FoundDspResponse {
  response: FoundDsp;
  success: number;
  message: string;
}

interface OrderDetail {
  title: string;
  quantity: number;
}

interface OrderAcceptedRes {
  pickupName: string;
  pickupNumber: string;
  dropoffName: string;
  dropoffPhoneNumber: string;
  orderDetails: OrderDetail[];
  reference: string;

  status: string;
  deliveryId: string;
  driverName: string;
  driverMobile: string;
  mobility: string;
  latitude: number;
  longitude: number;
  deliveryTime: number;
}

interface CheckRange {
  isAvailable: boolean;
  mobility: string;
}

export interface DeliveryStatus {
  status: string;
  driverName: string;
  driverMobile: string;
  mobility: string;
  latitude: number;
  longitude: number;
  deliveryTime: number;
  timeArrival: number;
}

export interface Ticket {
  ticketId: number;
  status: string;
  reason: number;
  created: number;
  closed: number;
  refund: RefundTicket;
}
interface RefundTicket {
  orderSubtotal: number;
  tip: number;
  deliveryFee: number;
  orderFee: number;
}


@Injectable({
  providedIn: 'root'
})
export class OloService {

  constructor(private http: HttpClient) { }

  configUrl = environment.globalUrlApi;
  driverDeliveryOLO = new BehaviorSubject<any>(null);

  checkRange = (storeId): Observable<{ response: CheckRange, success: number, message?: string }> => {
    return this.http
      .get<{ response: CheckRange, success: number, message?: string }>(
        this.configUrl + `/olo/checkRange?storeId=${storeId}`
      ).pipe(catchError(error => throwError(error) ));
  }

  searchDsp = (storeId, customerId, customerAddressId, subTotal ): Observable<FoundDspResponse> => {
    return this.http
      .post<FoundDspResponse>(
        this.configUrl + '/olo/searchDsp' ,
        {storeId, customerId, customerAddressId, subTotal}
      ).pipe(catchError(error => throwError(error) ));
  }

  acceptOrder = ( quoteId, customerId, storeId, orderId ): Observable<{response: OrderAcceptedRes, success: number}> => {
    return this.http
      .post<{response: OrderAcceptedRes, success: number}>(
        this.configUrl + '/olo/aceptOrder' ,
        {quoteId, customerId, storeId, orderId}
      ).pipe(catchError(error => throwError(error) ));
  }

  statusDelivery = (deliveryId, storeId): Observable<{ response: DeliveryStatus, success: number, message: string }> => {
    return this.http
      .get<{ response: DeliveryStatus, success: number, message: string }>(
        this.configUrl + `/olo/deliveryTracking?deliveryId=${deliveryId}&storeId=${storeId}`
      ).pipe(catchError(error => throwError(error) ));
  }

  cancelOrder = (deliveryId, reason, note) => {
    return this.http
      .put(
        this.configUrl + `/olo/cancelOrder`,
        {deliveryId, reason, note}
      ).pipe(catchError( err => throwError(err) ));
  }

  addTip = (deliveryId, amount): Observable<{ message: string, response: string, success: number }> => {
    return this.http
      .post<{ message: string, response: any, success: number }>(
        this.configUrl + `/olo/addTips`,
        {deliveryId, amount}
      ).pipe(catchError( err => throwError(err) ));
  }

  createTicket = (customerId, deliveryId, email, ccEmail, reason, note): Observable<{ message: string, response: any, success: number }> => {
    return this.http
      .post<{ message: string, response: any, success: number }>(
        this.configUrl + `/olo/createTicket`,
        {customerId, deliveryId, email, ccEmail, reason, note}
      ).pipe(catchError( err => throwError(err) ));
  }

  getTickets = (orderId, first = 10, after = 1)
    : Observable<{ message: string, response: Ticket[], success: number, hasMore: boolean, totalCount: number }> => {
    return this.http
      .get<{ message: string, response: Ticket[], success: number, hasMore: boolean, totalCount: number }>(
        this.configUrl + `/olo/getTickets?orderId=${orderId}&first=${first}&after=${after}`,
      ).pipe(catchError(err => throwError(err)));
  }

  sendDriverInformation = (driverInfo) => {
    this.driverDeliveryOLO.next(driverInfo);
  }

  public get emitDriverInformation(): any {
    return this.driverDeliveryOLO.value;
  }


}
