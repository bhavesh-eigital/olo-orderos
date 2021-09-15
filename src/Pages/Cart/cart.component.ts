import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PaymentMethodModalComponent } from '../Payment-method-modal/payment-method-modal.component';
import { select, Store } from '@ngrx/store';
import { Product } from '../../models/product';
import { AddPlacedOrder, ClearCart, RemoveFromCart } from '../../store/actions';
import { PaymentModalComponent } from '../../components/payment-modal/payment-modal.component';
import { PaymentService } from '../../services/payment.service';
import { findSetting } from '../../utils/FindSetting';
import ObjectID from 'bson-objectid';
import { ConfigService } from '../../services/config.service';
import { map, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { GuestInformationModalComponent } from 'src/components/guest-information-modal/guest-information-modal.component';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  cart = [];
  isEmpty = true;
  items = [];
  paymentAdded = false;
  showSuccessView = false;
  failed = false;
  placedOrders: any;
  storeInformation: any;
  customer: any;
  customerInformation: any;
  customerMobile: any;
  autoAcceptOrder = localStorage.getItem('autoAcceptDineIn');
  pauseOrder = localStorage.getItem('pauseOrder');
  order: any;
  orderComplete: any;
  deliveryFee = 0.00;
  notes: '';
  prepDay: any = '';
  prepTime: any = '';
  onlineStorePrepTime: any;
  loading = false;
  seats: any = [];
  seatsCount: number;
  newCustomerInformation: any = {
    customerEmail: '',
    customerFirstName: 'Guest',
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
  currentOrderType = parseInt(localStorage.getItem('orderType'), 10);
  totals: any;
  tipSelected: any = 0.00;

  open = false;
  tableNumber = localStorage.tableNumber ? localStorage.tableNumber : 0;
  customerName = 'Guest';
  setTexButtonAction = 'Loading...';
  paymentMethods = [];
  cartSub$ = new Subscription();
  customerInfoSub$ = new Subscription();

  constructor(
    private dialog: MatDialog,
    private store: Store,
    private router: Router,
    private configService: ConfigService,
    private paymentService: PaymentService,
  ) {
    // @ts-ignore
    this.cartSub$ = store.pipe(select('cartShop')).subscribe((data: any) => {
      this.cart = data.cart,
        this.placedOrders = data.placedOrders,
        this.storeInformation = data.storeInformation,
        this.customer = data.customer,
        this.customer.length !== 0 ? this.customerName = this.customer.customerFirstName + ' ' + this.customer.customerLastName : 'Guest',
        this.paymentMethods = data.paymentMethods;
      this.newCustomerInformation.customerEmail = data.temporalCustomer.customerEmail || '';
      this.newCustomerInformation.customerFirstName = data.temporalCustomer.customerFirstName || '';
      this.newCustomerInformation.customerLastName = data.temporalCustomer.customerLastName || '';
      this.newCustomerInformation.customerMobile = data.temporalCustomer.customerMobile || '';

    });
  }

  ngOnInit(): void {
    this.setNextAction();
    this.isEmpty = this.cart.length === 0;
    this.calculateTotalQuantity();
    this.customer.length === 0
      ? this.customerInformation = this.newCustomerInformation
      : this.customerInformation = this.setCustomer(this.customer);
    this.deliveryFee = findSetting(this.storeInformation, 'OnlineStoreDeliveryFee') === 'false'
      ? 0
      : parseFloat(findSetting(this.storeInformation, 'OnlineStoreDeliveryFee'));

    if (this.currentOrderType !== 1) {
      this.deliveryFee = 0;
    } else {
      this.deliveryFee = this.deliveryFee === null || '' ? 0 : parseFloat(String(this.deliveryFee));
    }
    this.totals = this.getTotalPlacedOrders();


    this.paymentService.paymentAdded.pipe(
      tap(() => this.paymentAdded = true)
    ).subscribe();
  }

  removeProduct(item: Product) {
    this.store.dispatch(new RemoveFromCart(item));
  }

  openPaymentModal() {
    this.dialog.open(PaymentMethodModalComponent, {
      width: '100%'
    });
  }

  editProduct(item: Product) {
    this.dialog.open(PaymentModalComponent, {
      data: { product: item, action: 'edit' }, panelClass: 'full-screen-modal'
    });
  }

  handleClick() {
    if (!this.paymentAdded) {
      this.showSuccessView = false;
      this.generateOrderMobile(false);
    } else {
      this.showSuccessView = true;
    }
  }

  setCustomer = (customer) => {
    return {
      customerEmail: customer.customerEmail,
      customerFirstName: customer.customerFirstName,
      customerLastName: customer.customerLastName,
      customerMobile: customer.customerMobile,
      customerAdresses: {
        customerAddress1: customer.customerAdresses[0]?.customerAddress1,
        customerAddress2: customer.customerAdresses[0]?.customerAddress2,
        customerCity: customer.customerAdresses[0]?.customerCity,
        customerCountry: customer.customerAdresses[0]?.customerCountry,
        customerState: customer.customerAdresses[0]?.customerState,
        customerZip: customer.customerAdresses[0]?.customerZip
      }
    };
  }

  getServeId = () => {
    return this.storeInformation.settings.filter((setting) => {
      return setting.settingName === 'OnlineStoreAssignedEmployee';
    });
  }

  getSubTotalAmount = () => {
    return Math.round(this.cart.reduce((acc, obj) => {
      return acc + (obj.totalAmount * obj.quantity);
    }, 0));
  }

  getTotalAmount = () => {
    return this.cart.reduce((acc, obj) => {
      return acc + (obj.totalAmount * obj.quantity);
    }, 0) + this.getTaxes() + parseFloat(String(this.deliveryFee));
  }

  getTaxes = () => {
    return this.cart.reduce((acc, obj) => {
      return Math.round(acc + (obj.taxes * obj.quantity));
    }, 0);
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

  getTotalPlacedOrders = () => {
    const placedOrdersTotalAmount = this.placedOrders.reduce((acc, obj) => {
      return acc + (obj.totalAmount);
    }, 0);

    const placedOrdersSubTotalAmount = this.placedOrders.reduce((acc, obj) => {
      return acc + (obj.subTotalAmount);
    }, 0);

    const placedOrdersTaxes = this.placedOrders.reduce((acc, obj) => {
      return acc + (obj.taxAmount);
    }, 0);
    const currentCartSubtotalAmount = this.getSubTotalAmount();
    const currentCartTax = this.getTaxes();
    const currentCartTotalAmountCart = this.getTotalAmount();
    const currentCartQuantity = this.cart.length;

    return {
      placedOrdersTotalAmount,
      placedOrdersSubTotalAmount,
      placedOrdersTaxes,
      currentCartSubtotalAmount,
      currentCartTax,
      currentCartTotalAmountCart,
      finalQuantity: currentCartQuantity,
      finalTax: placedOrdersTaxes + currentCartTax,
      finalSubTotalAmount: placedOrdersSubTotalAmount + currentCartSubtotalAmount,
      tipSelected: this.tipSelected,
      finalTotalAmount: placedOrdersTotalAmount + Math.round(currentCartTotalAmountCart * 100) / 100 + this.tipSelected,
    };
  }


  calculateTotalQuantity = () => {
    const orderInformations = this.placedOrders.flatMap((order) => {
      return order.seats[0].orderProducts;
    }
    );
    const totalCart = this.cart.reduce((acc, obj) => {
      return acc + obj.quantity;
    }, 0);
    const totalPlaced = orderInformations.reduce((acc, obj) => {
      return acc + obj.productQuantity;
    }, 0);

    return totalCart + totalPlaced;
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
      productModifiers: this.getModifiers(productSelected), // cart
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
      customerMobile: this.customerInformation.customerMobile.e164Number
        ? this.customerInformation.customerMobile.e164Number
        : this.customerInformation.customerMobile,
      customerEmail: this.customerInformation.customerEmail,
      orderNumberSuffix: '',
      tableId: localStorage.tableId,
      serverId: findSetting(this.storeInformation, 'OnlineStoreAssignedEmployee'),
      serverJobType: '',
      orderSellStatus: 1,
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
      notes: this.notes,
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

  addPlacedOrders(newOrder) {
    this.store.dispatch(new AddPlacedOrder(newOrder));
  }

  setOrderIdInTable(orderId) {
    const params = {
      tableNumber: localStorage.tableNumber,
      storeId: this.storeInformation.storeId,
      orderId
    };
    this.configService.setOrderInTable(params)
      .subscribe((data: any) => {
        if (data.success === 0) {
          // this.openSnackBar(data.message, 2);
        }
      });
  }

  setNextAction = () => {
    if (localStorage.OnlineStoreAllowOrderWithoutPaying === 'true') {
      if (localStorage.OnlineStoreAllowOrderAsGuest === 'true') {
        this.setTexButtonAction = 'SEND TO KITCHEN';
      } else {
        if (this.customer.length === 0) {
          this.setTexButtonAction = 'SIGN IN';
        } else {
          this.setTexButtonAction = 'SEND TO KITCHEN';
        }
      }
    } else {
      if (localStorage.OnlineStoreAllowOrderAsGuest === 'false') {
        if (this.customer.length === 0) {
          this.setTexButtonAction = 'SIGN IN';
        } else {
          this.setTexButtonAction = 'PAY AND SEND TO KITCHEN';
        }
      } else {
        this.setTexButtonAction = 'PAY AND SEND TO KITCHEN';
      }
    }
  }

  setButtonAction = () => {
    if (localStorage.OnlineStoreAllowOrderWithoutPaying === 'true' && this.customer.length === 0 && localStorage.OnlineStoreAllowOrderAsGuest === 'true') {
      if (
        !this.newCustomerInformation.customerEmail ||
        !this.newCustomerInformation.customerFirstName ||
        !this.newCustomerInformation.customerLastName ||
        !this.newCustomerInformation.customerMobile) {
        const dialogRef = this.dialog.open(GuestInformationModalComponent, {
          panelClass: 'full-screen-modal',
          data: { storeInformation: this.storeInformation }
        });
        this.customerInfoSub$ = dialogRef.afterClosed().pipe(
          map(result => {
            if (!result) {
              return;
            }
            this.newCustomerInformation.customerEmail = result.customerEmail;
            this.newCustomerInformation.customerFirstName = result.customerFirstName;
            this.newCustomerInformation.customerLastName = result.customerLastName;
            this.newCustomerInformation.customerMobile = result.customerMobile;
          })
        ).subscribe();
        return;
      }
    }
    if (localStorage.OnlineStoreAllowOrderWithoutPaying === 'true' && localStorage.OnlineStoreAllowOrderAsGuest === 'true') {
      this.showSuccessView = false;
      this.generateOrderMobile(false);
    }
    if (localStorage.OnlineStoreAllowOrderWithoutPaying === 'true' && localStorage.OnlineStoreAllowOrderAsGuest === 'false') {
      if (this.customer.length === 0) {
        this.router.navigate(['signin']);
      } else {
        this.showSuccessView = false;
        this.generateOrderMobile(false);
      }
    }
    if (localStorage.OnlineStoreAllowOrderWithoutPaying === 'false' && localStorage.OnlineStoreAllowOrderAsGuest === 'true') {
      this.router.navigate(['checkoutGuest']);
    }
    if (localStorage.OnlineStoreAllowOrderWithoutPaying === 'false' && localStorage.OnlineStoreAllowOrderAsGuest === 'false') {
      if (this.customer.length === 0) {
        this.router.navigate(['signin']);
      } else {
        this.router.navigate(['order-summary']);
      }
    }

    if (localStorage.OnlineStoreAllowOrderWithoutPaying === 'false' && this.customer.length !== 0 && localStorage.OnlineStoreAllowOrderAsGuest !== 'false') {
      this.router.navigate(['order-summary']);
    }
  }

  generateOrderMobile = (isPay) => {
    this.loading = true;
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
            // this.getSecretKey();
            this.setOrderIdInTable(this.orderComplete._id);
          } else {
            this.store.dispatch(new ClearCart([]));
            this.setOrderIdInTable(this.orderComplete._id);

            this.showSuccessView = true;
            this.loading = !this.loading;
          }
        }
      );
    }, 1000);
  }

  getIngredientsAndModifiers(item) {
    let words = '';
    item.ingredients.map((ingredient: any, i: number) => {
      words += ingredient.ingredientName;
      if (i < item.ingredients.length - 1) {
        words += ', ';
      } else if (i === item.ingredients.length - 1 && ((!item.diselectedIngredients || !item.diselectedIngredients.length) && (!item.modifiers || !item.modifiers.length))) {
        words += '';
      } else {
        words += ', ';
      }
    });

    if (item.diselectedIngredients) {
      item?.diselectedIngredients?.map((ingredient: any, i: number) => {
        words += `NO ${ingredient.ingredientName}`;
        if (i < item.diselectedIngredients.length - 1) {
          words += ', ';
        } else if (i === item.diselectedIngredients.length - 1 && (!item.modifiers || !item.modifiers.length)) {
          words += '';
        } else {
          words += ', ';
        }
      });
    }

    item.modifiers.map((modifier: any, i: number) => {
      words += modifier.modifierName;
      if (i < item.modifiers.length - 1) {
        words += ', ';
      }
    });

    return words;
  }

  ngOnDestroy(): void {
    this.cartSub$.unsubscribe();
    this.customerInfoSub$.unsubscribe();
  }
}
