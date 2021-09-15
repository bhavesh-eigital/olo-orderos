import { Action } from '@ngrx/store';
import { Product } from '../models/product';

export enum ActionTypes {
  // cart products
  Add = '[Product] Add to cart',
  Edit = '[Product] Edit to cart',
  Remove = '[Product] Remove from cart',
  CleanCart = '[Product] Remove all cart',
  SetCart = '[Product] Set cart',
  // store information
  SetStore = '[Product] Set store information',
  // customer
  SetCustomer = '[Customer] Set customer',
  SetTemporalCustomer = '[Customer] Set temporal customer',
  SetTemporalCustomerPhoneDetails = '[Customer] Set Temporal Customer Phone Details',
  // favorites
  SetFavorites = '[Customer] Set Favorites',
  // Placed orders
  AddPlacedOrder = '[Order] Add Placed Orders',
  SetPlacedOrder = '[Order] Set Placed Orders',
  SetPaymentMethods = '[PaymentMethods] Set Payment Methods',
  SetDefaultPaymentMethod = '[DefaultPaymentMethod] Set Default Payment Method',
  SetDefaultAddress = '[SetDefaultAddress] Set Default  Address',
  SetRestaurantsHours = '[SetRestaurantsHours] Set Restaurant hours',
  SetTopProducts = '[SetTopProducts] Set Top Products',
  SetCategories = '[SetCategories] Set Categories',
}

export class SetPaymentMethods implements Action {
  readonly type = ActionTypes.SetPaymentMethods;

  constructor(public payload: any) {
  }
}

export class SetDefaultPaymentMethod implements Action {
  readonly type = ActionTypes.SetDefaultPaymentMethod;

  constructor(public payload: any) {
  }
}

export class SetDefaultAddress implements Action {
  readonly type = ActionTypes.SetDefaultAddress;

  constructor(public payload: any) {
  }
}

export class AddToCart implements Action {
  readonly type = ActionTypes.Add;

  constructor(public payload: Product) {
  }
}

export class EditCart implements Action {
  readonly type = ActionTypes.Edit;

  constructor(public payload: Product) {
  }
}

export class RemoveFromCart implements Action {
  readonly type = ActionTypes.Remove;

  constructor(public payload: Product) {
  }
}

export class ClearCart implements Action {
  readonly type = ActionTypes.CleanCart;

  constructor(public payload: any) {
  }
}

export class SetCart implements Action {
  readonly type = ActionTypes.SetCart;

  constructor(public payload: any) {
  }
}

export class SetStore implements Action {
  readonly type = ActionTypes.SetStore;

  constructor(public payload: any) {
  }
}

export class SetCustomer implements Action {
  readonly type = ActionTypes.SetCustomer;

  constructor(public payload: any) {
  }
}

export class SetTemporalCustomer implements Action {
  readonly type = ActionTypes.SetTemporalCustomer;

  constructor(public payload: any) {
  }
}


export class SetTemporalCustomerPhoneDetails implements Action {
  readonly type = ActionTypes.SetTemporalCustomerPhoneDetails;

  constructor(public payload: any) {
  }
}

export class SetFavorites implements Action {
  readonly type = ActionTypes.SetFavorites;

  constructor(public payload: any) {
  }
}

export class AddPlacedOrder implements Action {
  readonly type = ActionTypes.AddPlacedOrder;

  constructor(public payload: any) {
  }
}

export class SetPlacedOrder implements Action {
  readonly type = ActionTypes.SetPlacedOrder;

  constructor(public payload: any) {
  }
}

export class SetRestaurantHours implements Action {
  readonly type = ActionTypes.SetRestaurantsHours;

  constructor(public payload: any) {
  }
}

export class SetTopProducts implements Action {
  readonly type = ActionTypes.SetTopProducts;

  constructor(public payload: any) {
  }
}

export class SetCategories implements Action {
  readonly type = ActionTypes.SetCategories;

  constructor(public payload: any) {
  }
}


export type ActionsUnion =
  AddToCart
  | EditCart
  | RemoveFromCart
  | ClearCart
  | SetCart
  | SetStore
  | SetCustomer
  | SetTemporalCustomer
  | SetTemporalCustomerPhoneDetails
  | SetFavorites
  | AddPlacedOrder
  | SetPlacedOrder
  | SetPaymentMethods
  | SetDefaultPaymentMethod
  | SetDefaultAddress
  | SetRestaurantHours
  | SetTopProducts
  | SetCategories;
