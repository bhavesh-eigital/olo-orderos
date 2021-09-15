import { Component, ElementRef, HostListener, Inject, OnInit, Renderer2, ViewChild, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfigService } from '../../services/config.service';
import { select, Store } from '@ngrx/store';
import ObjectID from 'bson-objectid';
import { Product } from '../../models/product';
import { AddToCart, EditCart, SetFavorites } from '../../store/actions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap, map } from 'rxjs/operators';
import { findSetting } from 'src/utils/FindSetting';
import * as numberTwoWords from 'number-to-words'

@Component({
  selector: 'app-product',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss']
})
export class PaymentModalComponent implements OnInit, AfterViewInit {

  storeInformation: any;
  currency = localStorage.getItem('currency');
  product: any;
  productEdit: any;
  variantSelected: any = {};
  modifiersSelected: any = [];
  modifiersTotalAmount: any = [];
  ingredients: any = [];
  subTotalAmount = 0;
  quantity = 1;
  currentCart: any;
  note = '';
  tax: any;
  taxes: any = 0;
  currentTaxes: any;
  loading = true;
  addOnsDescription = "Deselect to remove ingredients";
  especialRequest = '';
  restaurantHours: any;
  openRestaurantHours;
  closeRestaurantHours;

  customer;
  showLikeIcon = false;
  isClosed = true;
  isDisabled = true;
  inputsDisabled = false;

  favorites = [];

  diselectedIngredients = [];
  allowScheduledOrders: string;

  modifiersGroupValidationArr = [];

  showDefaultModal = true;
  showScheduleModal = false;
  showCloseModal = false;
  innerWidth = 0;

  @ViewChild('itemImage') itemImage: ElementRef<HTMLElement>;

  cart = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public currentProduct: any,
    public configService: ConfigService,
    public dialogRef: MatDialogRef<PaymentModalComponent>,
    private store: Store<{ storeInformation: [] }>,
    private renderer: Renderer2,
    private snackBar: MatSnackBar
  ) {
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data: any) => {
      this.storeInformation = data.storeInformation;
      this.restaurantHours = data.restaurantHours;
      this.customer = data.customer;
      this.favorites = data.favorites;
      this.cart = data.cart;
      this.allowScheduledOrders = findSetting(this.storeInformation, 'OnlineStoreAllowScheduledOrders');
    });
  }

  ngOnInit(): void {
    this.getProduct(this.currentProduct.action, this.currentProduct.product.productId);
    if (!this.currentProduct.orderType) {
      this.currentProduct.orderType = localStorage.getItem('orderType');
    }
    this.getRestaurantHours();

    if (localStorage.orderType == 4) {
      localStorage.removeItem('scheduleCategoryId');
    }
  }

  ngAfterViewInit() {
    this.onResize();
  }

  getTaxes = () => {
    this.configService
      .getTaxes(this.storeInformation.merchantId, this.storeInformation.storeId, this.product.productId)
      .subscribe(
        (data: any) => {
          this.currentTaxes = data.response;
        });
  }

  getSubTotalAmount = () => {
    const modifiersTotals =
      this.modifiersSelected === []
        ? 0
        : this.modifiersSelected.flatMap((modifier) => {
          return modifier.modifierOptions;
        });

    this.modifiersTotalAmount = modifiersTotals.reduce((acc, obj) => {
      return acc + obj.modifierOptionsValue;
    }, 0);

    this.subTotalAmount = this.variantSelected.variantValue + this.modifiersTotalAmount;
  }

  getProduct = (action, productId) => {
    this.configService.getProductById(this.storeInformation.merchantId, this.storeInformation.storeId, productId)
      .subscribe((data: any) => {
        this.product = action === 'add' ? data.response : this.currentProduct.product.generalInformation;
        this.productEdit = action === 'add' ? {} : this.currentProduct.product;
        this.variantSelected = action === 'add' ? {} : this.productEdit.variant;
        this.modifiersSelected = action === 'add' ? [] : this.productEdit.modifiers;
        this.ingredients = action === 'add' ? this.product?.ingredients : this.productEdit.ingredients;
        this.quantity = action === 'add' ? 1 : this.productEdit.quantity;
        this.variantSelected = action === 'add' ? this.product?.variants[0] : this.productEdit.variant;
        this.note = action === 'edit' ? this.productEdit.note : '';
        this.diselectedIngredients = action === 'edit' ? this.productEdit.diselectedIngredients : [];
        this.getTaxes();
        this.getSubTotalAmount();
        this.loading = false;

        this.updateModifiersGroupValidationArr();
        this.setInputsStatus();

      }
      );
  }

  setInputsStatus() {
    this.product.modifierGroups.forEach(modifierGroup => {
      let selectedQty = 0;
      modifierGroup.selectedModifiers.map(selectedM => {
        const isModifierSelected = this.isModifiersSelected(selectedM, modifierGroup);
        if (isModifierSelected) {
          selectedQty += 1;
        }
      });
      
      if(modifierGroup.mustSelect && selectedQty === modifierGroup.mustQuantity) {
        this.inputsDisabled = true;
        return
      } 

      if(selectedQty === modifierGroup.canQuantity) {
        this.inputsDisabled = true;
        return;
      }

      this.inputsDisabled = false;
    })
  }

  updateModifiersGroupValidationArr() {
    this.modifiersGroupValidationArr = this.product.modifierGroups.map(modifierGroup => ({
      modifierGroupName: modifierGroup.modifierGroupName,
      isValid: this.isModifierGroupValid(modifierGroup)
    }));

    this.setButtonEnableStatus();
  }

  isModifierGroupValid(modifierGroup) {
    let selectedQty = 0;
    modifierGroup.selectedModifiers.map(selectedM => {
      const isModifierSelected = this.isModifiersSelected(selectedM, modifierGroup);

      if (isModifierSelected) {
        selectedQty += 1;
      }
    });

    if (modifierGroup.mustSelect) {
      if (selectedQty < modifierGroup.mustQuantity || selectedQty > modifierGroup.canQuantity) {
        return false;
      }
      return true;
    }

    if (modifierGroup.canQuantity === null || modifierGroup.canQuantity === undefined) {
      return true;
    }

    return selectedQty <= modifierGroup.canQuantity;
  }


  setButtonEnableStatus() {
    const areAllModifierGroupsValid = this.modifiersGroupValidationArr.every(group => group.isValid);
    this.isDisabled = !areAllModifierGroupsValid;
  }

  addOrRemove(action: string) {
    if (action === 'add') {
      this.quantity += 1;
    } else {
      this.quantity -= 1;
    }
  }

  close() {
    this.dialogRef.close();
  }

  setVariant = (variant) => {
    this.variantSelected = variant;
    this.getSubTotalAmount();
  }

  setIngredients = (ingredient) => {
    const isInList = this.ingredients.find((item) => {
      return item === ingredient;
    });

    if (isInList === undefined) {
      this.ingredients.push(ingredient);
      this.diselectedIngredients = this.diselectedIngredients.filter(item => item.ingredientId !== ingredient.ingredientId);
    } else {
      this.diselectedIngredients.push(ingredient);
      ;
      this.ingredients = this.ingredients.filter((item) => {
        return item !== ingredient;
      });
    }
  }

  setModifiers = (modifiersSelected) => {
    this.modifiersSelected = modifiersSelected;
    this.setInputsStatus();
    this.updateModifiersGroupValidationArr();
    this.getSubTotalAmount();
  }

  isVariantSelected = (variantOption) => {
    return this.variantSelected._id === variantOption._id;
  }

  isModifiersSelected = (modifiersOption, modifiersGroup) => {
    const isCheck = this.modifiersSelected.find((modifier) => {
      return (modifier.modifierId === modifiersOption.modifierId) && (modifier.modifierGroupName === modifiersGroup.modifierGroupName);
    });

    return isCheck !== undefined;
  }

  isIngredientSelected = (ingredientOption) => {
    const isCheck = this.ingredients.find((item) => {
      return item === ingredientOption;
    });

    return isCheck !== undefined;
  }

  getTaxesPrice = (subTotalAmount) => {
    this.taxes = this.currentTaxes.reduce((acc, obj) => {
      return acc + ((obj.taxValue * subTotalAmount) / 100);
    }, 0);
  }

  productToCart(item: Product) {
    this.store.dispatch(new AddToCart(item));
  }

  editProduct(item: Product) {
    this.store.dispatch(new EditCart(item));
  }

  closeModal() {
    this.dialogRef.close();
  }

  addToCart = () => {
    const scheduleCategoryId = localStorage.getItem('scheduleCategoryId');
    if (scheduleCategoryId) {
      if (this.currentProduct?.scheduleCategory?.categoryId !== scheduleCategoryId) {
        this.openSnackBar(`You can only schedule products from ${this.currentProduct?.scheduleCategory?.categoryName} category`, 1);
        return
      }
    } else if (this.currentProduct?.scheduleCategory?.scheduleCategory) {
      if (!this.cart.length) {
        localStorage.setItem('scheduleCategoryId', this.currentProduct.scheduleCategory.categoryId)
      } else {
        this.openSnackBar('You should order scheduled products separetaly', 1);
        return;
      }
    }
    this.getTaxesPrice(this.subTotalAmount);
    this.currentCart = {
      createAt: Math.round(new Date().getTime() / 1000),
      productCartId: new ObjectID().toHexString(),
      generalInformation: this.product,
      productCategory: this.product.productCategory,
      productName: this.product.productName,
      productId: this.product.productId,
      productPrinterName: this.product.productPrinterName,
      productMenuName: this.product.productMenuName,
      categoryInformation: this.product.productCategory,
      variant: this.variantSelected,
      ingredients: this.ingredients,
      diselectedIngredients: this.diselectedIngredients,
      modifiers: this.modifiersSelected,
      quantity: this.quantity,
      currentTaxes: this.currentTaxes,
      taxes: this.taxes === [] ? 0 : this.taxes * 100 / 100,
      notes: this.note,
      subTotalAmount: this.subTotalAmount,
      totalAmount: this.subTotalAmount,
      note: this.note
    };
    this.productToCart(this.currentCart);
    this.closeModal();
  }

  editCart = () => {
    this.getTaxesPrice(this.subTotalAmount);
    this.currentCart = {
      createAt: this.productEdit.createAt,
      productCartId: this.productEdit.productCartId,
      generalInformation: this.product,
      productCategory: this.product.productCategory,
      productName: this.product.productName,
      productId: this.product.productId,
      productPrinterName: this.product.productPrinterName,
      productMenuName: this.product.productMenuName,
      categoryInformation: this.product.productCategory,
      variant: this.variantSelected,
      ingredients: this.ingredients,
      diselectedIngredients: this.diselectedIngredients,
      modifiers: this.modifiersSelected,
      quantity: this.quantity,
      currentTaxes: this.currentTaxes,
      taxes: this.taxes === [] ? 0 : this.taxes * 100 / 100,
      notes: this.note,
      subTotalAmount: this.subTotalAmount,
      totalAmount: this.subTotalAmount,
      note: this.note
    };
    this.editProduct(this.currentCart);
    this.closeModal();
  }

  productAction() {
    this.currentProduct.action === 'add' ? this.addToCart() : this.editCart();
  }

  getRestaurantHours = () => {
    this.currentProduct.orderType = parseInt(this.currentProduct.orderType);
    if (this.currentProduct.orderType === 1) {
      const RestaurantInfo = this.restaurantHours.find((restaurantDineIn) => {
        return restaurantDineIn.kind === 'DELIVERY';
      });
      if (!RestaurantInfo || RestaurantInfo?.status === 'CLOSED') {
        this.isClosed = true;
        this.openCloseModal();
      } else {
        this.openRestaurantHours = RestaurantInfo.schedule.from;
        this.closeRestaurantHours = RestaurantInfo.schedule.to;
        this.isClosed = false;
        this.openDefaultModal();
      }
    }
    if (this.currentProduct.orderType === 2) {
      const RestaurantInfo = this.restaurantHours.find((restaurantDineIn) => {
        return restaurantDineIn.kind === 'PICKUP';
      });
      if (RestaurantInfo.status === 'CLOSED') {
        if (localStorage.orderType !== "2") {
          this.isClosed = true;
          this.openCloseModal();
        } else {
          if (this.allowScheduledOrders === 'true') {
            this.isClosed = false;
            this.openScheduleModal();
          } else {
            this.isClosed = true;
            this.openCloseModal();
          }
        }
      } else {
        this.openRestaurantHours = RestaurantInfo.schedule.from;
        this.closeRestaurantHours = RestaurantInfo.schedule.to;
        this.isClosed = false;

        this.openDefaultModal();
      }
    }
    if (this.currentProduct.orderType === 3) {
      const RestaurantInfo = this.restaurantHours.find((restaurantDineIn) => {
        return restaurantDineIn.kind === 'CURBSIDE';
      });
      if (RestaurantInfo.status === 'CLOSED') {
        this.isClosed = true;

        this.openCloseModal();
      } else {
        this.openRestaurantHours = RestaurantInfo.schedule.from;
        this.closeRestaurantHours = RestaurantInfo.schedule.to;
        this.isClosed = false;

        this.openDefaultModal();
      }
    }
    if (this.currentProduct.orderType === 4) {
      const RestaurantInfo = this.restaurantHours.find((restaurantDineIn) => {
        return restaurantDineIn.kind === 'DINE_IN';
      });
      if (RestaurantInfo.status === 'CLOSED') {
        this.isClosed = true;
        this.showDefaultModal = false;
        this.openCloseModal();
      } else {
        this.openRestaurantHours = RestaurantInfo.schedule.from;
        this.closeRestaurantHours = RestaurantInfo.schedule.to;
        this.isClosed = false;
      }
    }

    if (localStorage.isRefundOrder === 'true') {
      this.isClosed = false;
    }
  }

  openDefaultModal() {
    this.showCloseModal = false;
    this.showScheduleModal = false;
    this.showDefaultModal = true;
  }

  openScheduleModal() {
    this.showCloseModal = false;
    this.showDefaultModal = false;
    this.showScheduleModal = true;
  }

  openCloseModal() {
    this.showScheduleModal = false;
    this.showDefaultModal = false;
    this.showCloseModal = true;
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 5000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  addFavoriteProduct(product) {
    if (this.customer) {
      const params = {
        storeId: this.storeInformation.storeId,
        merchantId: this.storeInformation.merchantId,
        productId: product.productId,
        customerId: this.customer.customerId
      };
      this.configService.addFavoriteCustomer(params).pipe(
        tap(() => this.getFavorites())
      ).subscribe();
    }
  }

  deleteFavoriteProduct(product) {
    if (this.customer) {
      const params = {
        storeId: this.storeInformation.storeId,
        merchantId: this.storeInformation.merchantId,
        productId: product.productId,
        customerId: this.customer.customerId
      };
      this.configService.removeFavoriteCustomer(params).pipe(
        tap(() => this.getFavorites())
      ).subscribe();
    }
  }

  getFavorites = () => {
    this.configService
      .getCustomerFavoritesProducts(this.storeInformation.storeId, this.storeInformation.merchantId, this.customer.customerId)
      .subscribe((data: any) => {
        this.setFavoritesCustomer(data.response.customerFavoriteProducts);
      });
  }

  setFavoritesCustomer(currentFavorites) {
    this.store.dispatch(new SetFavorites(currentFavorites));
  }

  isFav = (productId) => {
    if (this.favorites) {
      return this.favorites.find((product) => productId === product);
    }
  }

  getFavoriteStore = () => {
    const params = {
      customerId: this.customer.customerId
    };
    this.configService.getFavoriteStore(params).subscribe();
  }

  clearNote() {
    this.note = '';
  }

  getModifierLabel(modifierGroup) {
    if (modifierGroup.mustSelect) {
      if (modifierGroup.mustQuantity === null) {
        modifierGroup.mustQuantity = 1;
      }

      if (modifierGroup.mustQuantity === modifierGroup.canQuantity) {
        if (modifierGroup.mustQuantity === 1) {
          return 'Please choose one';
        }
        return `Please select ${numberTwoWords.toWords(modifierGroup.mustQuantity)} choises`;


      } else if (modifierGroup.mustQuantity === 1) {

        return `Please choose up to ${numberTwoWords.toWords(modifierGroup.canQuantity)}`;

      } else {
        return `Please choose up ${numberTwoWords.toWords(modifierGroup.canQuantity)} (minimun ${modifierGroup.mustQuantity})`
      }
    } else {
      if (modifierGroup.canQuantity === null) {
        return "Select as many add ons as you'd like";
      } else {
        return `You may add up to ${numberTwoWords.toWords(modifierGroup.canQuantity)}`
      }
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.innerWidth = window.innerWidth;
  }

}
