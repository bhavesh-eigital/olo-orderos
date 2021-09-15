export interface Order {
  orderServiceCharge: {
    authorizerId: string,
    serviceChargeName: string,
    'serviceChargeValue': number,
    'serviceChargeType': number,
    'serviceChargeId': string,
    'applicableTaxIds': any
  };
  'globalDiscount': {
    'authorizerId': string,
    'discountName': string,
    'discountValue': number,
    'discountType': number,
    'discountId': string
  };
  'guestsNumber': number;
  'splitOrderList': any;
  'parentId': string;
  'orderName': string;
  'orderNumberSuffix': string;
  'tableId': null;
  'serverId': string;
  'serverJobtype': string;
  'orderSellStatus': number;
  'orderServeStatus': number;
  'orderType': number;
  'serviceName': string;
  'serviceId': string;
  'shiftId': string;
  'shiftName': string;
  'serviceType': number;
  'timeOfArrival': number;
  'notes': null;
  'paymentId': string;
  'subTotalAmount': number;
  'refundedAmount': number;
  'actualPaidAmount': number;
  'totalAmount': number;
  'taxAmount': number;
  'serviceChargeAmount': number;
  'discountAmount': number;
  'generalDiscountAmount': number;
  'deliveryAmount': number;
  'receiptEmail': null;
  'receiptPhone': null;
  'revenueCenterId': string;
  'trackerId': null;
  'originId': string;
  'isSyncedMarketMan': number;
  'waitingToBePreparedAt': number;
  'beingPreparedAt': number;
  'readyAt': number;
  'servedAt': number;
  'cancelledAt': number;
  'voidedAt': number;
  'createdEmployeeId': string;
  'updatedEmployeeId': string;
  'status': number;
  'seats': [
    {
      'seatName': string,
      'seatNumber': null,
      'customerId': null,
      'orderProducts': [
        {
          'productDiscount': {
            'authorizerId': string,
            'discountName': string,
            'discountValue': number,
            'discountType': number,
            'discountId': string
          },
          'productCategory': {
            'parentCategoryName': string,
            'parentCategoryId': string,
            'categoryName': string,
            'categoryOrder': number,
            'categoryId': string
          },
          'productSaleCategory': {
            'saleCategoryName': string,
            'saleCategoryOrder': number,
            'saleCategoryId': string
          },
          'orderedProductId': string,
          'splitOrderIds': any,
          'totalVariantNumber': number,
          'isNoTax': number,
          'negativeInventory': number,
          'inventoryTracking': number,
          'productName': string,
          'productId': string,
          'productPrintName': string,
          'courseId': string,
          'coursePosition': number,
          'courseName': string,
          'productVariantName': string,
          'productVariantSKU': string,
          'productVariantId': string,
          'productUnitPrice': number,
          'productTaxValue': number,
          'productServiceChargeValue': number,
          'productOrderDiscountValue': number,
          'productDiscountValue': number,
          'productCalculatedPrice': number,
          'productSellStatus': number,
          'productServeStatus': number,
          'productQuantity': number,
          'productMenuId': string,
          'productMenu': string,
          'productMenuName': string,
          'printerId': any,
          'note': string,
          'waitingToBePreparedAt': number,
          'beingPreparedAt': number,
          'readyAt': number,
          'servedAt': number,
          'cancelledAt': number,
          'voidedAt': number,
          'productTax': [
            {
              'taxApplyFor': {
                'delivery': boolean,
                'here': boolean,
                'pickup': boolean,
                'toGo': boolean,
                'cashRegister': boolean,
                'banquet': boolean,
                'customItem': boolean,
                'serviceCharge': boolean
              },
              'authorizerId': string,
              'taxName': string,
              'taxValue': number,
              'taxType': number,
              'taxId': string
            }
          ],
          'productServiceCharge': any,
          'productModifiers': [
            {
              'modifierId': string,
              'modifierName': string,
              'modifierPrice': number,
              'modifierType': number,
              'modifierGroupId': string,
              'modifierGroupName': string,
              'modifierOptionId': string,
              'modifierOptionName': string,
              'hasMultipleOptions': boolean,
              'orderTypeId': any,
              'isServable': boolean
            },
            {
              'modifierId': string,
              'modifierName': string,
              'modifierPrice': number,
              'modifierType': number,
              'modifierGroupId': string,
              'modifierGroupName': string,
              'modifierOptionId': string,
              'modifierOptionName': string,
              'hasMultipleOptions': boolean,
              'orderTypeId': any,
              'isServable': boolean
            }
          ],
          'productIngredients': [],
          'refundTransactionId': string,
          'refundReason': null
        }
      ],
      '_id': string
    }
  ];
  'updatedAt': number;
  'orderGiftCard': any;
  'storeId': string;
  'createdAt': number;
  'merchantId': string;
  'checkNumber': number;
  'orderId': string;
}
