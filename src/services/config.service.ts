import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { FirstEndpoint } from '../models/firstEndpoint';
import { SecondEndpoint } from '../models/secondEndpoint';


@Injectable()
export class ConfigService {

  getCurrentLocation$ = new EventEmitter<void>();
  public cfdOn = false;

  constructor(private http: HttpClient) {
  }

  configUrl = environment.globalUrlApi;
  googleApiKey = environment.googleMapKey;

  private static handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.message);
    } else {
      console.error(
        ` Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    return throwError('Something bad happened; please try again later.');
  }

  getStores = () => {
    return this.http
      .get(this.configUrl + '/store')
      .pipe(catchError(ConfigService.handleError));
  }

  getStore = (subdomain) => {
    let query;
    const hostname = window.location.hostname;
    // const regex = /.orderos/g; // use this for the deploy version
    const regex = /.lvh/g; // use this for development/
    const found = hostname.match(regex);
    if (found) {
      if (hostname.indexOf('.') < 0 || hostname.split('.')[0] === 'www') {
        query = `storeFrontSubdomain=""`;
      } else {
        if (hostname.split('.')[0].length === 2) {
          query = `storeFrontSubdomain=${hostname.split('.')[1]}`;
        } else {
          query = `storeFrontSubdomain=${hostname.split('.')[0]}`;
        }
      }
    } else {
      query = `storeFrontDomain=${hostname}`;
    }

    return this.http.get(`${this.configUrl}/store?${query}`);
  }

  getCategories = (storeId, merchantId) => {
    const isDineIn = (parseInt(localStorage.tableNumber, 10) > 0) ? 1 : 0;
    return this.http
      .get(
        this.configUrl +
        '/category?merchantId=' +
        merchantId +
        '&storeId=' +
        storeId +
        '&menuType=' + isDineIn)
      .pipe(catchError(ConfigService.handleError));
  }

  getProductById = (merchantId, storeId, productId) => {
    const isDineIn = (parseInt(localStorage.tableNumber, 10) > 0) ? 1 : 0;
    return this.http
      .get(
        this.configUrl +
        '/product?merchantId=' +
        merchantId +
        '&storeId=' +
        storeId +
        '&productId=' +
        productId +
        '&menuType=' +
        +isDineIn
      )
      .pipe(catchError(ConfigService.handleError));
  }


  getTaxes = (merchantId, storeId, productId) => {
    return this.http
      .get(
        this.configUrl +
        '/tax?merchantId=' +
        merchantId +
        '&storeId=' +
        storeId +
        '&productIds=' +
        productId
      )
      .pipe(catchError(ConfigService.handleError));
  }

  getPopularProducts = (merchantId, storeId, menuType) => {
    const isDineIn = (parseInt(localStorage.tableNumber, 10) > 0) ? 1 : 0;
    return this.http
      .get(
        this.configUrl +
        '/getTopProducts?merchantId=' +
        merchantId +
        '&storeId=' +
        storeId +
        '&menuType=' +
        isDineIn
      )
      .pipe(catchError(ConfigService.handleError));
  }

  searchProduct = (merchantId, storeId, productName, menuType) => {
    return this.http
      .get(
        this.configUrl +
        '/product?merchantId=' +
        merchantId +
        '&storeId=' +
        storeId +
        '&productName=' +
        productName +
        '&menuType=' +
        menuType
      )
      .pipe(catchError(ConfigService.handleError));
  }

  generateOrder = (params: any) => {
    return this.http
      .post(
        this.configUrl + '/order/save', params
      ).pipe(catchError(ConfigService.handleError));
  }

  generateOrderDineIn = (params: any) => {
    return this.http
      .post(
        this.configUrl + '/order/online', params
      ).pipe(catchError(ConfigService.handleError));
  }

  getOrder = (merchantId, orderId) => {
    return this.http
      .get(
        this.configUrl +
        '/order?merchantId=' +
        merchantId +
        '&orderId=' +
        orderId
      )
      .pipe(catchError(ConfigService.handleError));
  }

  loginCustomer = (params: any) => {
    return this.http
      .post(
        this.configUrl + '/customer/login', params
      ).pipe(catchError(ConfigService.handleError));
  }

  registerCustomer = (params: any) => {
    return this.http
      .post(
        this.configUrl + '/customer/register', params
      ).pipe(catchError(ConfigService.handleError));
  }

  dineInTemporalSignup = (params: any) => {
    return this.http.post(`${this.configUrl}/customer/dinein/guest`, params).pipe(catchError(ConfigService.handleError));
  }

  dineInSignup = (params: any) => {
    return this.http.post(`${this.configUrl}/customer/dinein/register`, params).pipe(catchError(ConfigService.handleError));
  }

  generatePayment = (params: any) => {
    return this.http
      .post(
        this.configUrl + '/stripe/payment', params
      ).pipe(catchError(ConfigService.handleError));
  }

  generateCardconnectPayment = (params: any) => {
    return this.http
      .post(
        this.configUrl + '/op/payments', params
      ).pipe(catchError(ConfigService.handleError));
  }

  generateCardconnectPayments = (params: any) => {
    return this.http
      .post(
        this.configUrl + '/op/payments/many', params
      ).pipe(catchError(ConfigService.handleError));
  }

  generatePayments = (params: any) => {
    return this.http
      .post(
        this.configUrl + '/stripe/payments', params
      ).pipe(catchError(ConfigService.handleError));
  }

  getFavoriteCustomer = (merchantId, storeId, customerId) => {
    return this.http
      .get(
        this.configUrl +
        '/customer?merchantId=' +
        merchantId +
        '&storeId=' +
        storeId +
        '&customerId=' +
        customerId
      ).pipe(catchError(ConfigService.handleError));
  }

  getOrdersForCustomerId = (merchantId, storeId, customerId) => {
    return this.http
      .get(
        this.configUrl +
        '/order?merchantId=' +
        merchantId +
        '&storeId=' +
        storeId +
        '&customerId=' +
        customerId
      ).pipe(catchError(ConfigService.handleError));
  }


  getCustomerFavoritesProducts = (storeId, merchantId, customerId) => {
    return this.http.get(this.configUrl +
      '/customer?merchantId=' +
      merchantId +
      '&storeId=' +
      storeId +
      '&customerId=' +
      customerId).pipe(catchError(ConfigService.handleError));
  }

  addFavoriteCustomer = (params) => {
    return this.http
      .post(this.configUrl + '/customer/addFavoriteProduct', params)
      .pipe(catchError(ConfigService.handleError));
  }

  removeFavoriteCustomer = (params) => {
    return this.http
      .post(this.configUrl + '/customer/removeFavoriteProduct', params)
      .pipe(catchError(ConfigService.handleError));
  }

  getServiceCharge = (merchantId, storeId, serviceChargeId) => {
    return this.http
      .get(
        this.configUrl +
        '/serviceCharge?merchantId=' +
        merchantId +
        '&storeId=' +
        storeId +
        '&serviceChargeId=' +
        serviceChargeId
      ).pipe(catchError(ConfigService.handleError));
  }

  getOrderPayments = (merchantId, storeId, orderId) => {
    return this.http
      .get(
        this.configUrl +
        '/payment?merchantId=' +
        merchantId +
        '&storeId=' +
        storeId +
        '&orderId=' +
        orderId
      ).pipe(catchError(ConfigService.handleError));
  }

  getOrderPaymentsRefund = (merchantId, storeId, orderId) => {
    return this.http
      .get(
        this.configUrl +
        '/payment?merchantId=' +
        merchantId +
        '&storeId=' +
        storeId +
        '&orderId=' +
        orderId +
        '&status=0'
      ).pipe(catchError(ConfigService.handleError));
  }


  sendReceipt = (params) => {
    return this.http
      .post(this.configUrl + '/receipt', params)
      .pipe(catchError(ConfigService.handleError));
  }

  reportIssue = (params) => {
    return this.http
      .post(this.configUrl + '/issues', params)
      .pipe(catchError(ConfigService.handleError));
  }

  createGuest = (params) => {
    return this.http
      .post(this.configUrl + '/customer/guest', params)
      .pipe(catchError(ConfigService.handleError));
  }

  updateCustomer = (params) => {
    return this.http
      .put(this.configUrl + '/customer', params)
      .pipe(catchError(ConfigService.handleError));
  }

  setImageInStorage = (image) => {
    const headers = {
      headers: new HttpHeaders({ enctype: 'multipart/form-data', Authorization: environment.token }),
      params: image
    };
    return this.http
      .put(this.configUrl + '/upload?path=images/online-ordering/', image, headers)
      .pipe(catchError(ConfigService.handleError));
  }

  getTokenStore = (params) => {
    return this.http
      .post(this.configUrl + '/store/token', params)
      .pipe(catchError(ConfigService.handleError));
  }

  updatePasswordCustomer = (params) => {
    return this.http
      .post(this.configUrl + '/customer/generatePassword', params)
      .pipe(catchError(ConfigService.handleError));
  }

  resetPasswordCustomer = (params) => {
    return this.http
      .post(this.configUrl + '/customer/changePassword', params)
      .pipe(catchError(ConfigService.handleError));
  }


  getCustomerOrders = (customerId: string, storeId: string) => {
    return this.http
      .get(this.configUrl + `/getCustomerOrders?customerId=${customerId}&storeId=${storeId}`)
      .pipe(catchError(ConfigService.handleError));
  }


  getFavorites = (params) => {
    return this.http
      .post(this.configUrl + '/customer/getFavorites', params)
      .pipe(catchError(ConfigService.handleError));
  }

  getFavoriteStore = (params) => {
    return this.http
      .post(this.configUrl + '/customer/getFavoriteStores', params)
      .pipe(catchError(ConfigService.handleError));
  }

  addFavoriteStore = (params) => {
    return this.http
      .post(this.configUrl + '/customer/addFavoriteStore', params)
      .pipe(catchError(ConfigService.handleError));
  }


  deleteFavoriteStore = (params) => {
    return this.http
      .post(this.configUrl + '/customer/removeFavoriteStore', params)
      .pipe(catchError(ConfigService.handleError));
  }


  sendOTP = (params) => {
    return this.http
      .post(this.configUrl + '/customer/sendOTP', params)
      .pipe(catchError(ConfigService.handleError));
  }

  verifyOTP = (params) => {
    return this.http
      .post(this.configUrl + '/customer/verifyOTP', params)
      .pipe(catchError(ConfigService.handleError));
  }

  // get info refund

  getOrderRefund = (orderId) => {
    return this.http
      .get(this.configUrl + '/onlineorder/issue?orderId=' + orderId)
      .pipe(catchError(ConfigService.handleError));
  }

  createRefundPartialOrComplete = (params) => {
    return this.http
      .post(this.configUrl + '/onlineorder/cancel', params)
      .pipe(catchError(ConfigService.handleError));
  }

  createRefund = (params) => {
    return this.http
      .post(this.configUrl + '/stripe/payment/refund', params)
      .pipe(catchError(ConfigService.handleError));
  }

  forgetPassword = (params) => {
    return this.http
      .post(this.configUrl + '/customer/changePassword', params)
      .pipe(catchError(ConfigService.handleError));
  }
  paymentIntent = (params) => {
    return this.http
      .post(this.configUrl + '/stripe/payment/intent', params)
      .pipe(catchError(ConfigService.handleError));
  }

  paymentAuth = (params) => {
    return this.http
      .post(this.configUrl + '/op/payments/intent', params)
      .pipe(catchError(ConfigService.handleError));
  }

  loginGoogle = (params) => {
    return this.http
      .post(this.configUrl + '/customer/google/login', params)
      .pipe(catchError(ConfigService.handleError));
  }

  loginFacebook = (params) => {
    return this.http
      .post(this.configUrl + '/customer/facebook/login', params)
      .pipe(catchError(ConfigService.handleError));
  }

  getDeliveryDistance = (storeId, customerAddress, customerCity) => {
    return this.http
      .get(this.configUrl + '/store/delivery/routeInfo?storeId=' + storeId + '&customerAddress=' + `${customerAddress}, ${customerCity}`)
      .pipe(catchError(ConfigService.handleError));
  }

  addPaymentMethod = (params) => {
    return this.http.post(this.configUrl + '/op/payment-methods/create', params).toPromise();
  }

  removePaymentMethod = (params) => {
    return this.http
      .post(this.configUrl + '/op/payment-methods/remove', params)
      .pipe(catchError(ConfigService.handleError));
  }

  getPaymentMethods = (customerId, storeId, merchantId, provider) => {
    return this.http
      .get(this.configUrl + '/customers/payment_methods?customerId=' + customerId + '&storeId=' + storeId + '&merchantId=' + merchantId + '&paymentProcessor=' + provider)
      .pipe(catchError(ConfigService.handleError));
  }

  getDeliveryFee = (address, storeId) => {
    return this.http
      .get(this.configUrl + '/store/deliveryFee?storeId=' + storeId + '&customerAddress=' + address)
      .pipe(catchError(ConfigService.handleError));
  }

  setDefaultCardPayment = (params) => {
    return this.http
      .put(this.configUrl + '/customer/default-payment-method', params)
      .pipe(catchError(ConfigService.handleError));
  }

  getGetRestaurantHours = (storeId) => {
    return this.http
      .get(this.configUrl + '/onlineStore/orderingInfo?storeId=' + storeId)
      .pipe(catchError(ConfigService.handleError));
  }

  getAddressByLocation = (location) => {
    return this.http
      .get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + location + '&key=' + this.googleApiKey)
      .pipe(catchError(ConfigService.handleError));
  }

  setOrderInTable = (params) => {
    return this.http
      .put(this.configUrl + '/table/order', params)
      .pipe(catchError(ConfigService.handleError));
  }

  validateTable = (tableNumber: string, storeId: string) => {
    return this.http.get(`${this.configUrl}/table?tableNumber=${tableNumber}&storeId=${storeId}`)
      .pipe(catchError(ConfigService.handleError));
  }

  setDefaultPaymentMethod = (params) => {
    return this.http
      .post(this.configUrl + '/customers/payment_methods/default', params)
      .pipe(catchError(ConfigService.handleError));
  }

  deletePaymentMethods = (options) => {
    return this.http.delete(this.configUrl + '/customers/payment_methods', options)
      .pipe(catchError(ConfigService.handleError)).toPromise();
  }


  addCustomerPaymentMethod = (params) => {
    return this.http
      .post(this.configUrl + '/customers/payment_methods', params)
      .pipe(catchError(ConfigService.handleError)).toPromise();
  }

  voidPayment = (params) => {
    return this.http
      .post(this.configUrl + '/op/payments/voids', params)
      .pipe(catchError(ConfigService.handleError)).toPromise();
  }

  voidPaymentObs = (params) => {
    return this.http
      .post(this.configUrl + '/op/payments/voids', params)
      .pipe(catchError(ConfigService.handleError));
  }

  captureOrder = (params) => {
    return this.http
      .post(this.configUrl + '/op/payments/capture', params)
      .pipe(catchError(ConfigService.handleError));
  }

  orderValidation(params: FirstEndpoint) {
    return this.http.post(this.configUrl + '/order/validate', params).pipe(
      catchError(ConfigService.handleError)
    );
  }

  paymentValidation(params: SecondEndpoint) {
    return this.http.post(this.configUrl + '/op/payments/validate', params).pipe(
      catchError(ConfigService.handleError)
    );
  }

  cratePaymentInProcessNotification(params) {
    return this.http.post(this.configUrl + '/op/payments/cfd', params).pipe(
      catchError(ConfigService.handleError)
    );
  }

  getUnpaidOrders(customerId: string, storeId: string) {
    return this.http.get(`${this.configUrl}/getOrders/online?customerId=${customerId}&storeId=${storeId}&orderSellStatus=2`).pipe(
      catchError(ConfigService.handleError)
    )
  }

  generatePoyntToken(params) {
    return this.http.post(`${this.configUrl}/op/payments/token`, params).pipe(
      catchError(ConfigService.handleError)
    );
  }

  getTemporalAddressID(params: TemportalAddressIdParams) {
    return this.http.post<TemportalAddressIdResponse>(`${this.configUrl}/customer/adresses`, params).pipe(
      catchError(ConfigService.handleError)
    );
  }

  getYelpReviews(storeId: string) {
    return this.http.get<YelpReviewResponse>(
      `${this.configUrl}/yelp/reviews?storeId=${storeId}`
    );
  }
}

interface TemportalAddressIdParams {
  customerId: string;
  customerAddress1: string;
  customerCity: string;
  customerCountry: string;
  customerState: string;
  customerZip: string;
}

export interface TemportalAddressIdResponse {
  success: number;
  response: string;
  message: string;
}

export interface YelpReviewResponse {
  success: 0 | 1;
  response: {
    rating: number;
    url: string;
    review_count: number;
    reviews: {
      id: string;
      url: string;
      text: string;
      rating: number;
      time_created: Date;
      user: {
        id: string;
        profile_url: string;
        image_url: null | string;
        name: string;
      };
    }[]
  }
}
