import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Store } from '@ngrx/store';
import { getCardLogo } from '../../utils/GetCardLogo';
import {
  AddPlacedOrder,
  ClearCart,
  SetDefaultPaymentMethod,
  SetPaymentMethods,
  SetPlacedOrder
} from '../../store/actions';
import { ConfigService } from '../../services/config.service';
import { findSetting } from '../../utils/FindSetting';
import { MatDialog } from '@angular/material/dialog';
import ObjectID from 'bson-objectid';
import { DialogAddPaymentMethod } from '../../Pages/Account/Customer/customer.component';
import { CardConnectAddPaymentMethods } from '../../Pages/Account/Customer/AddPaymenMetods/CardConnect/CardConnect';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap } from 'rxjs/operators';
import { PoyntModalComponent } from '../poynt-modal/poynt-modal.component';
import { PoyntService } from '../../services/poynt.service';

@Component({
  selector: 'app-order-summary-bottom-sheet',
  templateUrl: './order-summary-bottom-sheet.component.html',
  styleUrls: ['./order-summary-bottom-sheet.component.scss']
})
export class OrderSummaryBottomSheetComponent implements OnInit, AfterViewInit {

  currentCard = 1;
  cardsView = true;
  paymentDetailView = false;
  paymentMethods: any[];
  cart: any;
  storeInformation: any;
  defaultPaymentMethod: '';
  customer: any;
  loading = false;
  disabledButton = false;
  customerPaymentAuth: any;
  placedOrders: any;
  paymentIntentId: any;
  orderComplete: any;
  order: any;
  seats: any = [];
  secretKeyStripe;
  customerInformation: any;
  newCustomerInformation: any = {
    customerEmail: '',
    customerFirstName: '',
    customerLastName: '',
    customerMobile: '',
    customerAdresses: {
      customerAddress1: '',
      customerAddress2: '',
      customerCity: '',
      customerCountry: '',
      customerState: '',
      customerZip: ''
    }
  };
  customerMobile: any;
  autoAcceptOrder = localStorage.getItem('autoAcceptDineIn');
  onlineStorePrepTime: any;
  prepTime: any = '';
  deliveryFee = 0.00;
  seatsCount: number;
  stripeMerchant: any;

  constructor(private bottomSheetRef: MatBottomSheetRef<OrderSummaryBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public dataOrder: {
      taxAmount: number,
      tipsAmount: number,
      subTotalAmount: number,
      totalAmount: number,
    },
    private store: Store,
    private configService: ConfigService,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private snackbar: MatSnackBar,
    private poyntService: PoyntService
  ) {
  }

  getAccountIntegrationId = () => {
    return this.storeInformation.integrations.find((integration) => {
      return integration.name === 'STRIPE';
    });
  }

  ngAfterViewInit(): void {

    this.poyntService.options.iFrame.height = '100px'

    setTimeout(() => {
      this.stripeMerchant = Stripe('pk_test_TTF68ceJV8AKZCuq3ho4vrjY00iIHqHUZO', {
        stripeAccount: this.getAccountIntegrationId().accountId
      });
    }, 200);
  }

  ngOnInit(): void {
    this.store.subscribe((state: any) => {
      const data = state.cartShop;
      this.cart = data.cart;
      this.storeInformation = data.storeInformation;
      this.customer = data.customer;
      this.defaultPaymentMethod = data.customerDefaultPaymentMethod;
      this.paymentMethods = data.paymentMethods;
      this.placedOrders = data.placedOrders;
      this.customerMobile = this.customer.customerMobile;
      this.onlineStorePrepTime = parseInt(findSetting(this.storeInformation, 'OnlineStorePrepTime'), 10);
      this.cdRef.detectChanges();
    });
    this.customer.length === 0
      ? this.customerInformation = this.newCustomerInformation
      : this.customerInformation = this.setCustomer(this.customer);
    this.getPaymentMethods();
  }

  setCustomer = (customer) => {
    return {
      customerEmail: customer.customerEmail,
      customerFirstName: customer.customerFirstName,
      customerLastName: customer.customerLastName,
      customerMobile: customer.customerMobile,
      customerAdresses: {
        customerAddress1: customer.customerAdresses[0].customerAddress1,
        customerAddress2: customer.customerAdresses[0].customerAddress2,
        customerCity: customer.customerAdresses[0].customerCity,
        customerCountry: customer.customerAdresses[0].customerCountry,
        customerState: customer.customerAdresses[0].customerState,
        customerZip: customer.customerAdresses[0].customerZip
      }
    };
  }

  close(status) {
    this.bottomSheetRef.dismiss(status);
  }

  returnCardLogo = (cardType) => {
    return getCardLogo(cardType);
  }

  setDefaultCard = (paymentMethod) => {
    this.configService
      .setDefaultPaymentMethod({
        paymentMethodId: paymentMethod.id,
        customerId: this.customer.customerId,
        merchantId: this.storeInformation.merchantId,
        storeId: this.storeInformation.storeId,
        paymentProcessor: localStorage.provider
      }).subscribe((data: any) => {
        if (data.success === 1) {
          this.store.dispatch(new SetDefaultPaymentMethod(paymentMethod.id));
          this.getPaymentMethods();
          this.cardsView = false;
          this.paymentDetailView = true;
          this.cdRef.detectChanges();
        } else {
          this.cardsView = false;
          this.paymentDetailView = true;
          this.loading = false;
        }
      });
  }

  getDefaultPaymentMethod = () => {
    return this.paymentMethods.find((paymentMethod) => {
      return paymentMethod.id === this.defaultPaymentMethod;
    });
  }

  onCardSelected(cardNumber: number) {
    this.currentCard = cardNumber;
    this.cardsView = false;
    this.paymentDetailView = true;
  }

  goBackToCards() {
    this.paymentDetailView = false;
    this.cardsView = true;
  }

  setPlacedOrders(newOrder) {
    this.store.dispatch(new SetPlacedOrder(newOrder));
  }

  addPlacedOrders(newOrder) {
    this.store.dispatch(new AddPlacedOrder(newOrder));
  }

  getServeId = () => {
    return this.storeInformation.settings.filter((setting) => {
      return setting.settingName === 'OnlineStoreAssignedEmployee';
    });
  }

  getSubTotalAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.totalAmount * obj.quantity);
    }, 0);
  }

  getTotalAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.totalAmount * obj.quantity);
    }, 0) + this.getTaxes() + parseFloat(String(this.deliveryFee));
  }

  getTaxes = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.taxes * obj.quantity);
    }, 0);
  }

  setOrder = () => {
    return {
      orderServiceCharge: {
        authorizerId: '',
        serviceChargeName: '',
        serviceChargeValue: 0,
        serviceChargeType: 0,
        serviceChargeId: '',
        applicableTaxIds: [],
      },
      globalDiscount: {
        authorizerId: '',
        discountName: '',
        discountValue: 0,
        discountType: 1,
        discountId: '',
      },
      guestsNumber: 1,
      splitOrderList: [],
      parentId: '',
      updateWS: false,
      orderName: `QR Table ${localStorage.tableNumber}`,
      customerId: this.customer.customerId,
      customerName: this.customerInformation.customerFirstName + this.customerInformation.customerLastName,
      customerFirstName: this.customerInformation.customerFirstName,
      customerLastName: this.customerInformation.customerLastName,
      customerMobile: this.customerMobile.e164Number,
      customerEmail: this.customerInformation.customerEmail,
      orderNumberSuffix: '',
      tableId: localStorage.tableId,
      serverId: findSetting(this.storeInformation, 'OnlineStoreAssignedEmployee'),
      serverJobType: '',
      orderSellStatus: 2,
      orderServeStatus: 1,
      onlineOrderType: 4,
      orderType: 8,
      onlineOrderServeStatus: this.autoAcceptOrder === 'true' ? 2 : 1,
      serviceName: 'others',
      serviceId: '',
      shiftId: '',
      shiftName: '',
      serviceType: 1,
      timeOfArrival: Math.round(new Date().getTime() / 1000),
      notes: '',
      paymentId: '',
      subTotalAmount: this.getSubTotalAmount(),
      refundedAmount: 0,
      // actualPaidAmount: this.getTotalAmount(),
      actualPaidAmount: 0,
      totalAmount: this.getTotalAmount(),
      taxAmount: this.getTaxes(),
      // serviceChargeAmount: this.serviceCharge === 0 ? 0 : this.serviceCharge.serviceChargeValue,
      serviceChargeAmount: 0,
      discountAmount: 0,
      generalDiscountAmount: 0,
      deliveryAmount: parseFloat(String(this.deliveryFee)),
      receiptEmail: '',
      receiptPhone: '',
      revenueCenterId: findSetting(this.storeInformation, 'OnlineOrderingRevenueCenter'),
      trackerId: '',
      originId: '',
      isSyncedMarketMan: 0,
      waitingToBePreparedAt: 0,
      beingPreparedAt: 0,
      readyAt: 0,
      prepTime: this.prepTime === '' ? '' : this.prepTime,
      readyTime: this.autoAcceptOrder === 'true' ? this.onlineStorePrepTime * 60 : 0,
      prepareStartAt: this.autoAcceptOrder === 'true' ? Math.round(new Date().getTime() / 1000) : 0,
      servedAt: 0,
      cancelledAt: 0,
      voidedAt: 0,
      createdEmployeeId: this.getServeId()[0].createdEmployeeId,
      updatedEmployeeId: this.getServeId()[0].updatedEmployeeId,
      status: 1,
      seats: [
        {
          seatName: 'online Ordering',
          seatNumber: null,
          customerId: this.customer.customerId,
          customerName: this.customer.customerFirstName,
          orderProducts: this.seats,
        },
      ],
      updatedAt: Math.round(new Date().getTime() / 1000),
      orderGiftCard: [],
      storeId: this.storeInformation.storeId,
      createdAt: Math.round(new Date().getTime() / 1000),
      merchantId: this.storeInformation.merchantId,
    };
  }

  getModifiers = (product) => {
    return product.modifiers.map(modifier => {
      return {
        modifierId: modifier.modifierId,
        modifierName: modifier.modifierName,
        modifierPrice: modifier.modifierOptions[0].modifierOptionsValue,
        modifierType: modifier.modifierType,
        modifierGroupId: modifier.modifierGroupId,
        modifierGroupName: 'Modifications',
        modifierOptionId: modifier.modifierOptions[0]._id,
        modifierOptionName: 'Normal',
        hasMultipleOptions: false,
        orderTypeId: modifier.orderTypeId,
        isServable: modifier.isServable
      };
    });
  }


  setSeats = (productSelected) => {
    return {
      productDiscount: {
        authorizerId: '',
        discountName: '',
        discountValue: 0,
        discountType: 0,
        discountId: '',
      },
      productCategory: {
        parentCategoryName: productSelected.categoryInformation.parentCategory,
        parentCategoryId: productSelected.categoryInformation.parentCategoryId,
        categoryName: productSelected.categoryInformation.categoryName,
        categoryOrder: productSelected.categoryInformation.categoryOrder,
        categoryId: productSelected.categoryInformation.categoryId,
      },
      productSaleCategory: {
        saleCategoryName: '',
        saleCategoryOrder: 0,
        saleCategoryId: '',
      },
      orderedProductId: new ObjectID().toHexString(),
      splitOrderIds: [],
      totalVariantNumber: 1,
      isNoTax: 0,
      negativeInventory: 0,
      inventoryTracking: 0,
      productName: productSelected.productName,
      productId: productSelected.productId, // productId
      productPrintName: productSelected.productPrinterName, // cart
      courseId: '',
      coursePosition: -1,
      courseName: '',
      productVariantName: productSelected.variant.variantName, // cart
      productVariantSKU: productSelected.variant.SKU, // cart
      productVariantId: '', // cart
      productUnitPrice: productSelected.variant.variantValue, // cart
      productTaxValue: productSelected.taxes * productSelected.quantity, // cart
      productServiceChargeValue: 0,
      productOrderDiscountValue: 0,
      productDiscountValue: 0,
      productCalculatedPrice: productSelected.subTotalAmount * productSelected.quantity, // cart + tax
      productSellStatus: 1,
      productServeStatus: 1,
      productQuantity: productSelected.quantity, // cart
      productMenuId: '',
      productMenu: '',
      productMenuName: productSelected.productMenuName, // cart
      printerId: [],
      note: productSelected.notes,  // cart
      waitingToBePreparedAt: 0,
      beingPreparedAt: 0,
      readyAt: 0,
      servedAt: 0,
      cancelledAt: 0,
      voidedAt: 0,
      productTax: [
        {
          taxApplyFor: {
            delivery: true,
            here: true,
            pickup: true,
            toGo: true,
            cashRegister: true,
            banquet: true,
            customItem: true,
            serviceCharge: false,
            onlineOrdering: true
          },
          authorizerId: findSetting(this.storeInformation, 'OnlineStoreAssignedEmployee'),
          taxName: 'Sales Tax',
          taxValue: 9.5,
          taxType: 1,
          taxId: '5de6b511546335001dcd3f58',
        },
      ],
      productServiceCharge: [],
      productModifiers: this.getModifiers(productSelected), // car
      productIngredients: productSelected.diselectedIngredients, // cart
      refundTransactionId: '',
      refundReason: null,
    };
  }


  getSeats = () => {
    this.cart.map((product => {
      return this.seats.push(this.setSeats(product));
    }));
    this.seatsCount = this.seats.length;
  }


  generateOrderMobile = (isPay) => {
    setTimeout(() => {
      if (this.cart !== []) {
        this.order = this.setOrder();
        this.getSeats();
      }
      const params = {
        ...this.order,
      };
      this.configService.generateOrderDineIn(params).subscribe(
        (data: any) => {
          this.orderComplete = data.data;
          localStorage.setItem('orderId', this.orderComplete._id);
          this.addPlacedOrders(data.data);
          if (isPay === true) {
            this.paymentWithPaymentMethod();
            this.setOrderIdInTable(this.orderComplete._id);
          } else {
            this.store.dispatch(new ClearCart([]));
            this.setOrderIdInTable(this.orderComplete._id);
          }
        }
      );
    }, 1000);
  }


  payOrders = () => {
    this.loading = true;
    if (this.cart.length > 0) {
      this.generateOrderMobile(true);
    } else {
      this.paymentWithPaymentMethod();
    }
  }

  paymentWithPaymentMethod = () => {
    let params;

    if (localStorage.provider === 'POYNT') {

      const poyntAccount = this.customer.poynt.find(acc => acc.storeId === this.storeInformation.storeId);
      const processorCustomerId = poyntAccount.customerId;

      params = {
        amount: (this.dataOrder.totalAmount * 100 + this.dataOrder.tipsAmount * 100) / 100,
        processorCustomerId,
        storeId: this.storeInformation.storeId,
        merchantId: this.storeInformation.merchantId,
        paymentProcessor: 'POYNT',
        paymentMethodId: this.defaultPaymentMethod,
        customerName: this.customerInformation.customerFirstName + ' ' + this.customerInformation.customerLastName,
      };

    } else if (localStorage.provider === 'STRIPE') {
      const stripeAccount = this.customer.stripe.accounts.find(acc => acc.storeId === this.storeInformation.storeId);
      const processorCustomerId = stripeAccount.customerId;
      params = {
        amount: (this.dataOrder.totalAmount * 100 + this.dataOrder.tipsAmount * 100) / 100,
        processorCustomerId,
        storeId: this.storeInformation.storeId,
        merchantId: this.storeInformation.merchantId,
        paymentProcessor: 'STRIPE',
        paymentMethodId: this.defaultPaymentMethod,
        customerName: this.customerInformation.customerFirstName + ' ' + this.customerInformation.customerLastName,
      };
    } else {
      params = {
        amount: (this.dataOrder.totalAmount * 100 + this.dataOrder.tipsAmount * 100) / 100,
        paymentMethodId: this.defaultPaymentMethod,
        storeId: this.storeInformation.storeId,
        merchantId: this.storeInformation.merchantId,
        paymentProcessor: 'CARDCONNECT',
        customerName: this.customerInformation.customerFirstName + ' ' + this.customerInformation.customerLastName,
      };
    }

    if (localStorage.provider === 'STRIPE') {
      this.configService.paymentAuth(params).subscribe((response: any) => {
        if (response.success === 1) {
          this.customerPaymentAuth = response.data;
          this.paymentIntentId = response.data.id;
          this.secretKeyStripe = response.data.secret;
          this.stripeMerchant.confirmCardPayment(
            this.secretKeyStripe,
            {
              payment_method: this.defaultPaymentMethod,
            })
            .then((result) => {
              try {
                if (result.paymentIntent.id) {
                  this.generatePayment();
                }
              } catch (e) {

                this.snackbar.open(result.error.code || 'Something went wrong', '', {
                  duration: 5000,
                  panelClass: ['red-snackbar'],
                  horizontalPosition: 'center',
                  verticalPosition: 'top',
                });
                this.loading = !this.loading;
              }
            });
        } else {
          this.loading = false;
          this.disabledButton = false;
          this.snackbar.open(response.message || 'Something went wrong', '', {
            duration: 5000,
            panelClass: ['red-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.close(false);
        }
      });
    } else {
      this.configService.paymentAuth(params).subscribe((response: any) => {
        if (response.success === 1) {
          this.customerPaymentAuth = response.data;
          this.paymentIntentId = response.data.id;
          this.generatePayment();
        } else {
          this.loading = false;
          this.disabledButton = false;
          this.snackbar.open(response.message || 'Something went wrong', '', {
            duration: 5000,
            panelClass: ['red-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.close(false);
        }
      });
    }
  }

  getOrderForPayments = () => {
    const ordersArray = [];
    this.placedOrders.map((order, index) => {
      ordersArray.push({
        orderId: order._id,
        amount: this.placedOrders.length === index + 1
          ? (order.totalAmount * 100 + this.dataOrder.tipsAmount * 100) / 100
          : order.totalAmount,
        tipAmount: this.placedOrders.length === index + 1 ? this.dataOrder.tipsAmount : 0
      });
    });
    return ordersArray;
  }

  generatePayment = () => {
    const params = {
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId,
      orders: this.getOrderForPayments(),
      employeeId: findSetting(this.storeInformation, 'OnlineStoreAssignedEmployee'),
      paymentIntentId: this.customerPaymentAuth.id,
      card: this.customerPaymentAuth.card,
      paymentProcessor: localStorage.provider,
    };

    this.configService.generateCardconnectPayments(params).subscribe((data: any) => {
      if (data.success === 1) {
        localStorage.setItem('ordersPayments', JSON.stringify(this.getOrderForPayments()));
        this.setPlacedOrders([]);
        this.store.dispatch(new ClearCart([]));
        this.loading = false;
        this.sendReceipt();
        this.sendReceiptMobile();
        this.close(true);
      } else {
        this.store.dispatch(new ClearCart([]));
        console.log(data.message);
        this.loading = false;
        this.disabledButton = false;
        this.close(false);
      }
    });
  }

  openPaymentModal() {

    if (localStorage.provider === 'POYNT') {
      this.dialog.open(PoyntModalComponent, {
        width: '100%',
        minWidth: '320px',
        maxWidth: '450px',
        panelClass: 'poyntModal',
      }).afterClosed().pipe(
        tap((payment) => {
          console.log({ payment })
          if (payment) {
            this.store.dispatch(new SetPaymentMethods([...this.paymentMethods, payment]));
            this.setDefaultCard(payment);
          }
        })
      ).subscribe();
    } else if (localStorage.provider === 'STRIPE') {
      this.dialog.open(DialogAddPaymentMethod, {
        maxWidth: '540px',
        width: '100%',
        minWidth: '320px',
      });
    } else {
      this.dialog.open(CardConnectAddPaymentMethods, {
        maxWidth: '540px',
        width: '100%',
        minWidth: '320px',
      }).afterClosed().pipe(
        tap(() => this.getPaymentMethods())
      ).subscribe();
    }
  }

  setOrderIdInTable(orderId) {
    const params = {
      tableNumber: localStorage.tableNumber,
      storeId: this.storeInformation.storeId,
      orderId
    };
    this.configService.setOrderInTable(params)
      .subscribe((data: any) => {
        // console.log(data);
        if (data.success === 0) {
          // this.openSnackBar(data.message, 2);
        }
      });
  }


  getPaymentMethods() {
    this.configService
      .getPaymentMethods(
        this.customer.customerId, this.storeInformation.storeId, this.storeInformation.merchantId, localStorage.provider)
      .subscribe((data: any) => {
        if (data.success === 1) {
          this.store.dispatch(new SetPaymentMethods(data.response));
        } else {
          console.log('error:' + data.message, 2);
        }
      });
  }

  sendReceipt = () => {
    const paramsEmail = {
      orderId: localStorage.orderId,
      email: this.customer.customerEmail,
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId
    };

    this.configService.sendReceipt(paramsEmail).subscribe(
      (data: any) => {
        if (data.success === 1) {
          console.log(data.message, 1);
        } else {
          console.log(data.message, 0);
        }
      },
      (error) => (console.log(error))
    );
  }

  sendReceiptMobile = () => {
    const paramsMobile = {
      orderId: localStorage.orderId,
      mobile: this.customer.customerMobile,
      storeId: this.storeInformation.storeId,
      merchantId: this.storeInformation.merchantId
    };

    this.configService.sendReceipt(paramsMobile).subscribe(
      (data: any) => {
        if (data.success === 1) {
          console.log(data.message, 1);
        } else {
          console.log(data.message, 0);
        }
      },
      (error) => (console.log(error))
    );
  }
}



