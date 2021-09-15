import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Product } from '../../../models/product';
import { EditCart, RemoveFromCart } from '../../../store/actions';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PaymentModalComponent } from 'src/components/payment-modal/payment-modal.component';
import { findSetting } from '../../../utils/FindSetting';
import * as moment from 'moment/moment';
import { Subscription } from 'rxjs';


@Component({
  selector: 'your-product',
  templateUrl: './your-product.html',
  styleUrls: ['./your-product.scss'],
  host: {
    '(document:click)': 'onClick($event)'
  }
})
export class YourProduct implements OnInit, OnDestroy {

  @Output() newItemEvent = new EventEmitter<string>();
  @Input() product: Product;
  @Input() fromCheckout = false;
  @Input() currentOrderType = 2;
  quantities = [
    { number: 1 },
    { number: 2 },
    { number: 3 },
    { number: 4 },
    { number: 5 },
    { number: 6 },
    { number: 7 },
    { number: 8 },
    { number: 9 },
    { number: 10 },
  ];
  currency = localStorage.getItem('currency');
  cart: any;

  openQtyMenu = false;
  scheduleProduct = false;
  storeInformation: any;
  isClosed = true;
  optionsHours = [];
  openRestaurantHours: any;
  storeSub$ = new Subscription();
  closeRestaurantHours: any;
  currentTime = moment().unix();
  prepDay: any = '';
  prepDaySelected: any = '';
  prepTime: any = '';
  optionsDays = [];
  prepTimeSelected: any = '';
  OnlineStoreOrderAhead: number;

  constructor(
    private store: Store<{ storeInformation: []; cart: [], customer: [] }>,
    private router: Router,
    private dialog: MatDialog,
    private _eref: ElementRef,
  ) {
    this.storeSub$ = this.store.subscribe((data: any) => {
      this.cart = data.cartShop.cart;
      this.storeInformation = data.cartshop?.storeInformation;

      this.optionsDays = this.getOptionDays();
      this.OnlineStoreOrderAhead = parseInt(findSetting(this.storeInformation, 'OnlineStoreOrderAhead'), 10);
      this.optionsDays = this.optionsDays.slice(0, localStorage.provider === 'STRIPE' ? this.OnlineStoreOrderAhead : 2);
    });
  }

  ngOnInit(): void {
    if (this.product.quantity > this.quantities.length) {
      this.quantities = [];
      for (let number = 1; number <= this.product.quantity; number++) {
        this.quantities.push({ number });
      }
    }
  }

  editProduct() {
    this.dialog.open(PaymentModalComponent, {
      data: { product: this.product, action: 'edit' }, panelClass: 'full-screen-modal',
      autoFocus: false
    });
  }

  removeProduct(ev: MouseEvent, item: Product) {
    ev.preventDefault();
    ev.stopPropagation();
    this.store.dispatch(new RemoveFromCart(item));
    this.newItemEvent.emit('remove');
    if (this.cart.length === 0) {
      this.router.navigate(['home']);
    }
  }

  editProductCart(item: any) {
    this.store.dispatch(new EditCart(item));
    this.newItemEvent.emit('edit');
  }

  updateQuantity = (productEdit, quantity) => {
    const currentCart = {
      createAt: productEdit.createAt,
      productCartId: productEdit.productCartId,
      generalInformation: productEdit.generalInformation,
      productCategory: productEdit.productCategory,
      productName: productEdit.productName,
      productId: productEdit.productId,
      productPrinterName: productEdit.productPrinterName,
      productMenuName: productEdit.productMenuName,
      categoryInformation: productEdit.categoryInformation,
      variant: productEdit.variant,
      ingredients: productEdit.ingredients,
      modifiers: productEdit.modifiers,
      quantity,
      currentTaxes: productEdit.currentTaxes,
      taxes: productEdit.taxes,
      notes: productEdit.notes,
      subTotalAmount: productEdit.subTotalAmount,
      totalAmount: productEdit.totalAmount,
    };
    this.editProductCart(currentCart);
  }

  getNameIngredientsAndModifiers = (product) => {
    const modifiersNames = product.modifiers.map((modifiers, idx) => {
      return idx === product.modifiers.length - 1 && !product.ingredients?.length ? modifiers.modifierName : modifiers.modifierName + ', ';
    });

    const ingredientsName = product.ingredients.map((ingredients, idx) => {
      return idx === product.ingredients.length - 1 && !product.diselectedIngredients?.length ? ingredients.ingredientName + '' : ingredients.ingredientName + ', ';
    });

    let diselectedIngredients;

    if (product.diselectedIngredients) {

      diselectedIngredients = product.diselectedIngredients.map((ingredients, idx) => {
        return idx === product.diselectedIngredients?.length - 1 ? `NO ${ingredients.ingredientName}` + '' : `NO ${ingredients.ingredientName}, `
      })
    } else {
      diselectedIngredients = [];
    }


    return modifiersNames.concat(ingredientsName).concat(diselectedIngredients).join(' ');
  }

  @HostListener('window:keyup.escape', ['$event'])
  onEscape() {
    this.openQtyMenu = false;
  }

  onClick(event) {
    if (!this._eref.nativeElement.contains(event.target) && this.openQtyMenu) {
      this.openQtyMenu = false;
    }
  }

  select(optionDay) {
    this.prepDaySelected = optionDay.value;
    this.getPrepTimeHours(this.currentOrderType, optionDay.value);
    this.compareTime();
  }

  getPrepTimeHours(orderType, daySelected) {
    const OnlineOrderingRestaurantPickupHours = JSON.parse(findSetting(this.storeInformation, 'OnlineOrderingRestaurantPickupHours'));
    const OnlineOrderingRestaurantCurbsidePickupHours = JSON.parse(findSetting(this.storeInformation, 'OnlineOrderingRestaurantCurbsidePickupHours'));
    const OnlineOrderingRestaurantDeliveryHours = JSON.parse(findSetting(this.storeInformation, 'OnlineOrderingRestaurantDeliveryHours'));


    if (orderType === 1) {
      switch (daySelected) {
        case 1:
          const mondayInfo = OnlineOrderingRestaurantDeliveryHours.find((data) => {
            return data.day === 'Monday';
          });
          if (mondayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(mondayInfo);
          }
          break;
        case 2:
          const tuesdayInfo = OnlineOrderingRestaurantDeliveryHours.find((data) => {
            return data.day === 'Tuesday';
          });
          if (tuesdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(tuesdayInfo);
          }
          break;
        case 3:
          const wednesdayInfo = OnlineOrderingRestaurantDeliveryHours.find((data) => {
            return data.day === 'Wednesday';
          });
          if (wednesdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(wednesdayInfo);
          }
          break;
        case 4:
          const thursdayInfo = OnlineOrderingRestaurantDeliveryHours.find((data) => {
            return data.day === 'Thursday';
          });
          if (thursdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(thursdayInfo);
          }
          break;
        case 5:
          const fridayInfo = OnlineOrderingRestaurantDeliveryHours.find((data) => {
            return data.day === 'Friday';
          });
          if (fridayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(fridayInfo);
          }
          break;
        case 6:
          const saturdayInfo = OnlineOrderingRestaurantDeliveryHours.find((data) => {
            return data.day === 'Saturday';
          });
          if (saturdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(saturdayInfo);
          }
          break;
        case 7:
          const sundayInfo = OnlineOrderingRestaurantDeliveryHours.find((data) => {
            return data.day === 'Sunday';
          });
          if (sundayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(sundayInfo);
          }
          break;
      }
    }
    if (orderType === 3) {
      switch (daySelected) {
        case 1:
          const mondayInfo = OnlineOrderingRestaurantCurbsidePickupHours.find((data) => {
            return data.day === 'Monday';
          });
          if (mondayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(mondayInfo);
          }
          break;
        case 2:
          const tuesdayInfo = OnlineOrderingRestaurantCurbsidePickupHours.find((data) => {
            return data.day === 'Tuesday';
          });
          if (tuesdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(tuesdayInfo);
          }
          break;
        case 3:
          const wednesdayInfo = OnlineOrderingRestaurantCurbsidePickupHours.find((data) => {
            return data.day === 'Wednesday';
          });
          if (wednesdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(wednesdayInfo);
          }
          break;
        case 4:
          const thursdayInfo = OnlineOrderingRestaurantCurbsidePickupHours.find((data) => {
            return data.day === 'Thursday';
          });
          if (thursdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(thursdayInfo);
          }
          break;
        case 5:
          const fridayInfo = OnlineOrderingRestaurantCurbsidePickupHours.find((data) => {
            return data.day === 'Friday';
          });
          if (fridayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(fridayInfo);
          }
          break;
        case 6:
          const saturdayInfo = OnlineOrderingRestaurantCurbsidePickupHours.find((data) => {
            return data.day === 'Saturday';
          });
          if (saturdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(saturdayInfo);
          }
          break;
        case 7:
          const sundayInfo = OnlineOrderingRestaurantCurbsidePickupHours.find((data) => {
            return data.day === 'Sunday';
          });
          if (sundayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(sundayInfo);
          }
          break;
      }
    }

    if (orderType === 2) {
      switch (daySelected) {
        case 1:
          const mondayInfo = OnlineOrderingRestaurantPickupHours.find((data) => {
            return data.day === 'Monday';
          });
          if (mondayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(mondayInfo);
          }
          break;
        case 2:
          const tuesdayInfo = OnlineOrderingRestaurantPickupHours.find((data) => {
            return data.day === 'Tuesday';
          });
          if (tuesdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(tuesdayInfo);
          }
          break;
        case 3:
          const wednesdayInfo = OnlineOrderingRestaurantPickupHours.find((data) => {
            return data.day === 'Wednesday';
          });
          if (wednesdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(wednesdayInfo);
          }
          break;
        case 4:
          const thursdayInfo = OnlineOrderingRestaurantPickupHours.find((data) => {
            return data.day === 'Thursday';
          });
          if (thursdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(thursdayInfo);
          }
          break;
        case 5:
          const fridayInfo = OnlineOrderingRestaurantPickupHours.find((data) => {
            return data.day === 'Friday';
          });
          if (fridayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(fridayInfo);
          }
          break;
        case 6:
          const saturdayInfo = OnlineOrderingRestaurantPickupHours.find((data) => {
            return data.day === 'Saturday';
          });
          if (saturdayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(saturdayInfo);
          }
          break;
        case 7:
          const sundayInfo = OnlineOrderingRestaurantPickupHours.find((data) => {
            return data.day === 'Sunday';
          });
          if (sundayInfo.isActive === false) {
            this.isClosed = true;
          } else {
            this.setRestaurantHours(sundayInfo);
          }
          break;
      }
    }
  }

  setRestaurantHours(dayInfo) {
    localStorage.setItem('prepTimeHoursOpen', moment(dayInfo.startTimeFormat * 1000).format('LT'));
    localStorage.setItem('prepTimeHoursClose', moment(dayInfo.endTimeFormat * 1000).format('LT'));
    this.isClosed = moment().set('hour', dayInfo.endTime).set('minute', 0).unix() < moment().unix()
      || moment().set('hour', dayInfo.startTime).set('minute', 0).unix() > moment().unix();
  }

  compareTime = () => {
    this.optionsHours = [
      { viewValue: '00:00am  - 00:30am', value: moment().set('hour', 0).set('minute', 0) },
      { viewValue: '00:30am  - 01:00am', value: moment().set('hour', 0).set('minute', 30) },
      { viewValue: '01:00am  - 01:30am', value: moment().set('hour', 1).set('minute', 0) },
      { viewValue: '01:30am  - 02:00am', value: moment().set('hour', 1).set('minute', 30) },
      { viewValue: '02:00am  - 02:30am', value: moment().set('hour', 2).set('minute', 0) },
      { viewValue: '02:30am  - 03:00am', value: moment().set('hour', 2).set('minute', 30) },
      { viewValue: '03:00am  - 03:30am', value: moment().set('hour', 3).set('minute', 0) },
      { viewValue: '03:30am  - 04:00am', value: moment().set('hour', 3).set('minute', 30) },
      { viewValue: '04:00am  - 04:30am', value: moment().set('hour', 4).set('minute', 0) },
      { viewValue: '04:30am  - 05:00am', value: moment().set('hour', 4).set('minute', 30) },
      { viewValue: '05:00am  - 05:30am', value: moment().set('hour', 5).set('minute', 0) },
      { viewValue: '05:30am  - 06:00am', value: moment().set('hour', 5).set('minute', 30) },
      { viewValue: '06:00pm  - 06:30pm', value: moment().set('hour', 6).set('minute', 0) },
      { viewValue: '06:30am  - 07:00am', value: moment().set('hour', 6).set('minute', 30) },
      { viewValue: '07:00am  - 07:30am', value: moment().set('hour', 7).set('minute', 0) },
      { viewValue: '07:30am  - 08:00am', value: moment().set('hour', 7).set('minute', 30) },
      { viewValue: '08:00am  - 08:30am', value: moment().set('hour', 8).set('minute', 0) },
      { viewValue: '08:30am  - 09:00am', value: moment().set('hour', 8).set('minute', 30) },
      { viewValue: '09:00am  - 09:30am', value: moment().set('hour', 9).set('minute', 0) },
      { viewValue: '09:30am  - 10:00am', value: moment().set('hour', 9).set('minute', 30) },
      { viewValue: '10:00am  - 10:30am', value: moment().set('hour', 10).set('minute', 0) },
      { viewValue: '10:30am  - 11:00am', value: moment().set('hour', 10).set('minute', 30) },
      { viewValue: '11:00am  - 11:30am', value: moment().set('hour', 11).set('minute', 0) },
      { viewValue: '11:30am  - 12:00am', value: moment().set('hour', 11).set('minute', 30) },
      { viewValue: '12:00pm  - 12:30pm', value: moment().set('hour', 12).set('minute', 0) },

      { viewValue: '12:30pm  - 01:00pm', value: moment().set('hour', 12).set('minute', 30) },
      { viewValue: '01:00pm  - 01:30pm', value: moment().set('hour', 13).set('minute', 0) },
      { viewValue: '01:30pm  - 02:00pm', value: moment().set('hour', 13).set('minute', 30) },
      { viewValue: '02:00pm  - 02:30pm', value: moment().set('hour', 14).set('minute', 0) },
      { viewValue: '02:30pm  - 03:00pm', value: moment().set('hour', 14).set('minute', 30) },
      { viewValue: '03:00pm  - 03:30pm', value: moment().set('hour', 15).set('minute', 0) },
      { viewValue: '03:30pm  - 04:00pm', value: moment().set('hour', 15).set('minute', 30) },
      { viewValue: '04:00pm  - 04:30pm', value: moment().set('hour', 16).set('minute', 0) },
      { viewValue: '04:30pm  - 05:00pm', value: moment().set('hour', 16).set('minute', 30) },
      { viewValue: '05:00pm  - 05:30pm', value: moment().set('hour', 17).set('minute', 0) },
      { viewValue: '05:30pm  - 06:00pm', value: moment().set('hour', 17).set('minute', 30) },
      { viewValue: '06:00pm  - 06:30pm', value: moment().set('hour', 18).set('minute', 0) },
      { viewValue: '06:30pm  - 07:00pm', value: moment().set('hour', 18).set('minute', 30) },
      { viewValue: '07:00pm  - 07:30pm', value: moment().set('hour', 19).set('minute', 0) },
      { viewValue: '07:30pm  - 08:00pm', value: moment().set('hour', 19).set('minute', 30) },
      { viewValue: '08:00pm  - 08:30pm', value: moment().set('hour', 20).set('minute', 0) },
      { viewValue: '08:30pm  - 09:00pm', value: moment().set('hour', 20).set('minute', 30) },
      { viewValue: '09:00pm  - 09:30pm', value: moment().set('hour', 21).set('minute', 0) },
      { viewValue: '09:30pm  - 10:00pm', value: moment().set('hour', 21).set('minute', 30) },
      { viewValue: '10:00pm  - 10:30pm', value: moment().set('hour', 22).set('minute', 0) },
      { viewValue: '10:30pm  - 11:00pm', value: moment().set('hour', 22).set('minute', 30) },
      { viewValue: '11:00pm  - 11:30pm', value: moment().set('hour', 23).set('minute', 0) },
      { viewValue: '11:30pm  - 12:00am', value: moment().set('hour', 23).set('minute', 30) },
      { viewValue: '12:00am  - 12:30am', value: moment().set('hour', 24).set('minute', 0) },
    ];

    this.openRestaurantHours = localStorage.getItem('prepTimeHoursOpen')
      ? localStorage.getItem('prepTimeHoursOpen')
      : this.openRestaurantHours;

    this.closeRestaurantHours = localStorage.getItem('prepTimeHoursClose')
      ? localStorage.getItem('prepTimeHoursClose')
      : this.openRestaurantHours;

    const startHour = this.openRestaurantHours.split(':')[0];
    const startHourTime = this.openRestaurantHours.split(' ')[1];

    const endHour = this.closeRestaurantHours.split(':')[0];
    const endHourTime = this.closeRestaurantHours.split(' ')[1];

    const startTime = moment()
      .set('hour', (startHourTime === 'AM' ? parseInt(startHour, 10) : parseInt(startHour, 10) + 12)).unix();
    const endTime = moment()
      .set('hour', (endHourTime === 'PM' ? parseInt(endHour, 10) + 12 : parseInt(endHour, 10)) - 1).unix();

    this.optionsHours = this.optionsHours.filter((option) => {
      return moment(option.value).unix() >= startTime && moment(option.value).unix() <= endTime;
    });

    if (this.prepDaySelected === moment().isoWeekday()) {
      this.optionsHours = this.optionsHours.filter((option) => {
        return moment(option.value).unix() >= this.currentTime;
      });
    }
  };

  getOptionDays() {
    if (localStorage.provider === 'STRIPE') {
      return [
        { value: moment().isoWeekday(), viewValue: moment().format('dddd, ll') },
        { value: moment().add(1, 'days').isoWeekday(), viewValue: moment().add(1, 'days').format('dddd, ll') },
        { value: moment().add(2, 'days').isoWeekday(), viewValue: moment().add(2, 'days').format('dddd, ll') },
        { value: moment().add(3, 'days').isoWeekday(), viewValue: moment().add(3, 'days').format('dddd, ll') },
        { value: moment().add(4, 'days').isoWeekday(), viewValue: moment().add(4, 'days').format('dddd, ll') },
        { value: moment().add(5, 'days').isoWeekday(), viewValue: moment().add(5, 'days').format('dddd, ll') },
        { value: moment().add(6, 'days').isoWeekday(), viewValue: moment().add(6, 'days').format('dddd, ll') },
        { value: moment().add(7, 'days').isoWeekday(), viewValue: moment().add(7, 'days').format('dddd, ll') },
      ];
    } else {
      return [
        { value: moment().isoWeekday(), viewValue: moment().format('dddd, ll') },
        { value: moment().add(1, 'days').isoWeekday(), viewValue: moment().add(1, 'days').format('dddd, ll') },
        { value: moment().add(2, 'days').isoWeekday(), viewValue: moment().add(2, 'days').format('dddd, ll') },
      ];
    }
  }

  changePrepTime = (value) => {
    const day = moment(value);

    this.prepTimeSelected = day.set({
      'year': moment(this.prepDay.viewValue).year(),
      'month': moment(this.prepDay.viewValue).month(),
      'date': moment(this.prepDay.viewValue).date()
    }).unix();
    this.prepTimeSelected = this.prepTimeSelected * 1000;

  };

  ngOnDestroy() {
    this.storeSub$.unsubscribe();
  }
}
