import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { ConfigService } from './config.service';
import { Product } from '../models/product';
import { AddToCart } from '../store/actions';
import { Store } from '@ngrx/store';
import ObjectID from 'bson-objectid';
import { Router } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class Reorder {

  configUrl = environment.globalUrlApi;
  googleApiKey = environment.googleMapKey;
  currentOrder: any;
  currentCart: any;
  storeInformation: any;
  private currentTaxes: any[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private configService: ConfigService,
    private store: Store<{ storeInformation: [] }>) {

    store.subscribe((state: any) => {
      const data = state.cartShop;
      this.storeInformation = data.storeInformation;
    });
  }

  reorderByOrderId = (merchantId, orderId) => {
    this.configService.getOrder(merchantId, orderId).pipe(
      switchMap((data: any) => {
        this.currentOrder = data.response;
        let productsIds = data.response.seats[0].orderProducts.map(product => product.productId);
        return this.getTaxes(productsIds, merchantId).pipe(
          map((taxData: any) => {
            this.currentTaxes = taxData.response;
            this.currentOrder.seats[0].orderProducts.map((product, index) => {
              this.currentOrder.seats[0].orderProducts[index].productTaxValue = this.getProductTaxValue(product.productId);
              this.addToCart(product);
              if (index === this.currentOrder.seats[0].orderProducts.length - 1) {
                if (localStorage.orderType !== '4') {
                  setTimeout(() => {
                    this.router.navigate(['checkout']);
                  }, 900);

                } else {
                  setTimeout(() => {
                    this.router.navigate(['cart']);
                  }, 900);
                }
              }
            });
          })
        )
      })
    ).subscribe();
  }

  getTaxes(productsIds: string[], merchantId: string) {
    return this.configService.getTaxes(merchantId, this.storeInformation.storeId, productsIds);
  }

  getProductTaxValue(productId: string) {
    let taxValue = 0;
    this.currentTaxes.map((tax: any) => tax.products.map(prod => {
      if (prod === productId) {
        taxValue += tax.taxValue;
      }
    }));
    return taxValue;
  }

  productToCart(item: Product) {
    this.store.dispatch(new AddToCart(item));
  }

  addToCart = (product) => {
    this.configService.getProductById(this.storeInformation.merchantId, this.storeInformation.storeId, product.productId)
      .subscribe((productResponse: any) => {
        const getModifiersSelected = [];
        let findModifiers;
        const getModifiers = productResponse.response.modifierGroups.flatMap((modifiers) => {
          return modifiers.selectedModifiers;
        });

        product.productModifiers.map((modifier) => {
          findModifiers = getModifiers.find((option) => {
            return modifier.modifierId === option.modifierId;
          });
          if (findModifiers !== undefined) {
            findModifiers = {
             ...findModifiers,
             modifierOptions: findModifiers.modifierOptions.filter( options => options._id === modifier.modifierOptionId)
            };
            getModifiersSelected.push(findModifiers);
          }
        });

        this.currentCart = {
          createAt: Math.round(new Date().getTime() / 1000),
          productCartId: new ObjectID().toHexString(),
          generalInformation: productResponse.response,
          productCategory: product.productCategory,
          productName: product.productName,
          productId: product.productId,
          productPrinterName: product.productPrinterName,
          productMenuName: product.productName,
          categoryInformation: product.productCategory,
          variant: productResponse.response.variants.find((variant) => {
            return variant.variantName === product.productVariantName;
          }),
          ingredients: [],
          diselectedIngredients: product.productIngredients,
          modifiers: getModifiersSelected,
          quantity: product.productQuantity,
          currentTaxes: product.productTax,
          taxes: (product.productTaxValue * (product.productCalculatedPrice / product.productQuantity)) / 100,
          note: product.note,
          subTotalAmount: product.productCalculatedPrice / product.productQuantity,
          totalAmount: product.productCalculatedPrice / product.productQuantity,
        };
        this.productToCart(this.currentCart);
      });
  }
}
