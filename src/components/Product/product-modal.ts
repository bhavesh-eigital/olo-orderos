import {AfterViewInit, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Product} from '../../models/product';
import {AddToCart, EditCart} from '../../store/actions';
import {select, Store} from '@ngrx/store';
import ObjectID from 'bson-objectid';
import {ConfigService} from '../../services/config.service';
import {getTaxesByName} from '../../utils/getTaxes';

@Component({
  selector: 'productModal',
  templateUrl: './product-modal.html',
  styleUrls: ['./product-modal.scss']
})
export class ProductModal implements OnInit, AfterViewInit {
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
  note: ' ';
  storeInformation: any;
  tax: any;
  taxes: any = 0;
  currentTaxes: any;
  loading = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public currentProduct: any,
    private dialogRef: MatDialogRef<ProductModal>,
    private store: Store<{ storeInformation: []; cart: [] }>,
    private configService: ConfigService) {
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data: any) => (this.storeInformation = data.storeInformation));
  }

  ngAfterViewInit(): void {
    this.getProduct(this.currentProduct.action, this.currentProduct.product.productId);
  }

  ngOnInit(): void {
  }

  addQuantity() {
    this.quantity = this.quantity + 1;
  }

  subtractQuantity() {
    if (this.quantity !== 1) {
      this.quantity = this.quantity - 1;
    }
  }

  getTaxes = () => {
    this.configService
      .getTaxes(this.storeInformation.merchantId, this.storeInformation.storeId, this.product.productId)
      .subscribe(
        (data: any) => {
          this.currentTaxes = data.response.filter( tax => tax.taxApplyFor.onlineOrdering === true);
        });
  }

  setVariant = (variant) => {
    this.variantSelected = variant;
    this.getSubTotalAmount();
  }

  setModifiers = (modifierSelected, modifiersGroup) => {
    const isSelected = this.modifiersSelected.find((modifier) => {
      return modifier.modifierId === modifierSelected.modifierId && modifier.modifierGroupName === modifiersGroup.modifierGroupName;
    });

    if (isSelected === undefined) {
      this.modifiersSelected.push({
        ...modifierSelected,
        modifiersTemporalId: new ObjectID().toHexString(),
        modifierGroupId: modifiersGroup.modifierGroupId,
        modifierGroupName: modifiersGroup.modifierGroupName
      });
    } else {
      this.modifiersSelected = this.modifiersSelected.filter((modifier) => {
        return (modifier.modifierId !== modifierSelected.modifierId);
      });
    }
    this.getSubTotalAmount();
  }

  setIngredients = (ingredient) => {
    const isInList = this.ingredients.find((item) => {
      return item === ingredient;
    });

    if (isInList === undefined) {
      this.ingredients.push(ingredient);
    } else {
      this.ingredients = this.ingredients.filter((item) => {
        return item !== ingredient;
      });
    }
  }

  getTaxesPrice = (subTotalAmount) => {
    this.taxes = this.currentTaxes.reduce((acc, obj) => {
      return acc + ((obj.taxValue * subTotalAmount) / 100);
    }, 0);
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

  productToCart(item: Product) {
    this.store.dispatch(new AddToCart(item));
  }

  editProduct(item: Product) {
    this.store.dispatch(new EditCart(item));
  }

  addToCart = () => {
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
      modifiers: this.modifiersSelected,
      quantity: this.quantity,
      currentTaxes: this.currentTaxes,
      taxes: this.taxes === [] ? 0 : Math.round(this.taxes * 100) / 100,
      notes: this.note,
      subTotalAmount: this.subTotalAmount,
      totalAmount: this.subTotalAmount,
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
      modifiers: this.modifiersSelected,
      quantity: this.quantity,
      currentTaxes: this.currentTaxes,
      taxes: this.taxes === [] ? 0 : Math.round(this.taxes * 100) / 100,
      notes: this.note,
      subTotalAmount: this.subTotalAmount,
      totalAmount: this.subTotalAmount,
    };
    this.editProduct(this.currentCart);
    this.closeModal();
  }

  productAction() {
    this.currentProduct.action === 'add' ? this.addToCart() : this.editCart();
  }

  closeModal() {
    this.dialogRef.close();
  }

  getProduct = (action, productId) => {
    this.configService.getProductById(this.storeInformation.merchantId, this.storeInformation.storeId, productId)
      .subscribe((data: any) => {
          this.product = action === 'add' ? data.response : this.currentProduct.product.generalInformation;
          this.productEdit = action === 'add' ? {} : this.currentProduct.product;
          this.variantSelected = action === 'add' ? {} : this.productEdit.variant;
          this.modifiersSelected = action === 'add' ? [] : this.productEdit.modifiers;
          this.ingredients = action === 'add' ? this.product.ingredients : this.productEdit.ingredients;
          this.quantity = action === 'add' ? 1 : this.productEdit.quantity;
          this.variantSelected = action === 'add' ? this.product.variants[0] : this.productEdit.variant;
          this.note = data.response.notes;
          this.getTaxes();
          this.getSubTotalAmount();
          this.loading = false;
        }
      );
  }

  isPositiveValue = (modifiersValue) => {
    return modifiersValue > 0 ? this.currency + modifiersValue.toFixed(2) : '';
  }

}
