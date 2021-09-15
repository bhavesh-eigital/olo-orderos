import { ActionsUnion, ActionTypes } from './actions';

export const initialState = {
  cart: [],
  storeInformation: [],
  customer: [],
  temporalCustomer: [],
  favorites: [],
  placedOrders: [],
  paymentMethods: [],
  customerDefaultPaymentMethod: '',
  customerDefaultAddress: '',
  restaurantHours: [],
  topProducts: [],
  categories: [],
};

export function ShopReducer(state = initialState, action: ActionsUnion) {
  switch (action.type) {
    case ActionTypes.Add:
      return {
        ...state,
        cart: [...state.cart, action.payload]
      };

    case ActionTypes.Edit:
      return {
        ...state,
        cart: [
          ...state.cart.filter(item => item.productCartId !== action.payload.productCartId),
          action.payload
        ]
      };

    case ActionTypes.Remove:
      return {
        ...state,
        cart: [...state.cart.filter(item => item.productCartId !== action.payload.productCartId)]
      };

    case ActionTypes.CleanCart:
      return {
        ...state,
        cart: [...state.cart.filter(item => item.productName === 'delete')]
      };

    case ActionTypes.SetCart:
      return {
        ...state,
        cart: action.payload
      };

    case ActionTypes.SetStore:
      return {
        ...state,
        storeInformation: action.payload
      };

    case ActionTypes.SetCustomer:
      return {
        ...state,
        customer: action.payload
      };

    case ActionTypes.SetTemporalCustomer:
      return {
        ...state,
        temporalCustomer: action.payload
      };

      case ActionTypes.SetTemporalCustomerPhoneDetails:
        return {
          ...state,
          temporalCustomer: {...state.temporalCustomer, ...action.payload}
        }

    case ActionTypes.SetFavorites:
      return {
        ...state,
        favorites: action.payload
      };

    case ActionTypes.AddPlacedOrder:
      return {
        ...state,
        placedOrders: [...state.placedOrders, action.payload]
      };

    case ActionTypes.SetPlacedOrder:
      return {
        ...state,
        placedOrders: action.payload
      };

    case ActionTypes.SetPaymentMethods:
      return {
        ...state,
        paymentMethods: action.payload,
      };
    case ActionTypes.SetDefaultPaymentMethod:
      return {
        ...state,
        customerDefaultPaymentMethod: action.payload,
      };

    case ActionTypes.SetDefaultAddress:
      return {
        ...state,
        customerDefaultAddress: action.payload,
      };

    case ActionTypes.SetRestaurantsHours:
      return {
        ...state,
        restaurantHours: action.payload,
      };

    case ActionTypes.SetTopProducts:
      return {
        ...state,
        topProducts: action.payload,
      };

    case ActionTypes.SetCategories:
      return {
        ...state,
        categories: action.payload,
      };

    default:
      return state;
  }
}
