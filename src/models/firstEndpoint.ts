export interface FirstEndpoint {
  orderName: string;
  serverId: string;
  orderSellStatus: number;
  orderServeStatus: number;
  orderType: number;
  serviceName: string;
  serviceType: number;
  timeOfArrival: number;
  notes: null;
  revenueCenterId: string;
  prepTime: string;
  deliveryUtensils: boolean;
  createdEmployeeId: string;
  updatedEmployeeId: string;
  status: number;
  orderProducts: OrderProduct[];
  storeId: string;
  merchantId: string;
  subTotalAmount: number;
  refundedAmount: number;
  actualPaidAmount: number; // 0
  taxAmount: number;
  deliveryAmount: number;
  onlineOrderType: number;
  customerFirstName: string;
  customerLastName: string;
  customerMobile: string;
  customerEmail: string;
  customerId: string;
  orderId?: string;
  deliveryAddressId?: string;

  onlineOrderServeStatus: number;
  readyTime: number;
  prepareStartAt: number;
}


export interface OrderProduct {
  productDiscount: {
    authorizerId: string,
    discountName: string,
    discountValue: number,
    discountType: number,
    discountId: string
  },
  productCategory: {
    parentCategoryName: string,
    parentCategoryId: string,
    categoryName: string,
    categoryOrder: number,
    categoryId: string
  },
  productSaleCategory: {
    saleCategoryName: string,
    saleCategoryOrder: number,
    saleCategoryId: string
  },
  orderedProductId: string,
  splitOrderIds: any,
  totalVariantNumber: number,
  isNoTax: number,
  negativeInventory: number,
  inventoryTracking: number,
  productName: string,
  productId: string,
  productPrintName: string,
  courseId: string,
  coursePosition: number,
  courseName: string,
  productVariantName: string,
  productVariantSKU: string,
  productVariantId: string,
  productUnitPrice: number,
  productTaxValue: number,
  productServiceChargeValue: number,
  productOrderDiscountValue: number,
  productDiscountValue: number,
  productCalculatedPrice: number,
  productSellStatus: number,
  productServeStatus: number,
  productQuantity: number,
  productMenuId: string,
  productMenu: string,
  productMenuName: string,
  printerId: any,
  note: string,
  waitingToBePreparedAt: number,
  beingPreparedAt: number,
  readyAt: number,
  servedAt: number,
  cancelledAt: number,
  voidedAt: number,
  productTax: [
    {
      taxApplyFor: {
        delivery: boolean,
        here: boolean,
        pickup: boolean,
        toGo: boolean,
        cashRegister: boolean,
        banquet: boolean,
        customItem: boolean,
        serviceCharge: boolean
      },
      authorizerId: string,
      taxName: string,
      taxValue: number,
      taxType: number,
      taxId: string
    }
  ],
  productServiceCharge: any,
  productModifiers: [
    {
      modifierId: string,
      modifierName: string,
      modifierPrice: number,
      modifierType: number,
      modifierGroupId: string,
      modifierGroupName: string,
      modifierOptionId: string,
      modifierOptionName: string,
      hasMultipleOptions: boolean,
      orderTypeId: any,
      isServable: boolean
    },
    {
      modifierId: string,
      modifierName: string,
      modifierPrice: number,
      modifierType: number,
      modifierGroupId: string,
      modifierGroupName: string,
      modifierOptionId: string,
      modifierOptionName: string,
      hasMultipleOptions: boolean,
      orderTypeId: any,
      isServable: boolean
    }
  ],
  productIngredients: [],
  refundTransactionId: string,
  refundReason: null
}
