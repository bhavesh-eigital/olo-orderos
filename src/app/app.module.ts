import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {PaymentComponent, ScheduleComponent} from '../components/Payment/payment.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {AddressDialog, Customer, DialogAddPaymentMethod} from '../Pages/Account/Customer/customer.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {ReceiptComponent} from '../Pages/OnlineOrdering/Receipt/receipt.component';
import {MatDividerModule} from '@angular/material/divider';
import {NoFoundComponent} from '../Pages/NoFound/noFound.component';
import {MatInputModule} from '@angular/material/input';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {localStorageSync} from 'ngrx-store-localstorage';
import {ActionReducer, MetaReducer, StoreModule} from '@ngrx/store';
import {ShopReducer} from '../store/reducer';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule, MatRippleModule} from '@angular/material/core';
import {NgxStripeModule} from 'ngx-stripe';
import {PaymentRequestComponent} from '../components/Payment/payment-request/payment-request.component';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';
import {NgxIntlTelInputModule} from 'ngx-intl-tel-input';
import {PaymentCFDComponent, ScheduleCFDComponent} from '../components/Payment-cfd/payment.component';
import {PaymentRequestCDFComponent} from '../components/Payment-cfd/payment-request/payment-request.component';
import {ForgotPasswordComponentV2} from '../Pages/Account/Forgot-password/forgot-password.component';
import {LoadingComponent} from '../components/Loading/loading.component';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {CategoriesV2GeneralComponent} from '../Pages/OnlineOrdering/Categories/categories.component';
import {TopProductsV2Component} from '../components/Top-Products/topProducts.component';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {SearchProductsV2Component} from '../components/Search-Products/searchProducts.component';
import {CarouselModule} from 'ngx-bootstrap/carousel';
import {YourOrder} from '../components/Your-Order/your-order/your-order';
import {YourProduct} from '../components/Your-Order/your-order-product/your-product';
import {ProductModal} from '../components/Product/product-modal';
import {FavoriteTwoComponent} from '../Pages/Account/Favorites/favorite-two.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTabsModule} from '@angular/material/tabs';
import {YourOrderCheckout} from '../components/Your-Order/your-order-checkout/your-order';
import {MatMenuModule} from '@angular/material/menu';
import {Account} from '../components/Account/account';
import {Orders} from '../Pages/Account/Orders/orders';
import {AccountMobile} from '../components/Account-mobile/account';
import {CheckoutMobile} from '../components/Checkout-Mobile/checkout-mobile';
import {OrderSummary} from '../components/Order-Summary/order-summary';
import {MatStepperModule} from '@angular/material/stepper';
import {ActionsPopup, DesktopTimer} from '../Pages/ReportIssue/MenuReportIssue/desktop-timer.component';
import {YourOrderReceipt} from '../components/Your-Order/your-order-receipt/your-order';
import {YourProductReceipt} from '../components/Your-Order/your-product-receipt/your-product';
import {CheckoutRefund} from '../Pages/ReportIssue/Checkout-Refund/checkout';
import {YourOrderCheckoutRefund} from '../components/Your-Order/your-order-checkout-refund/your-order';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {CategoriesV2Component} from '../components/Categories/categories.component';
import {CountdownModule} from 'ngx-countdown';
import {YourOrderCfd} from '../components/Your-Order/your-order-cfd/your-order';
import {YourProductCfd} from '../components/Your-Order/your-order-product-cfd/your-product';
import {ReceiptCfdComponent} from '../Pages/CFD/Receipt-cfd/receipt.component';
import {SignInModal} from '../components/SignIn/sigIn';
import {ReceiptDineInComponent} from '../Pages/DineIn/Receipt-DineIn/receipt.component';
import {CurbsideModal} from '../components/Curbside-modal/curbside-modal';
import {CreateAccountModal} from '../components/create-account/create-account-modal';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';
import {ConfigService} from '../services/config.service';
import {FooterComponent} from '../components/Footer/footer.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {CurrentLocation} from '../components/Current-Location/CurrentLocation';
import {CoverPage} from '../components/Cover-Page/CoverPage';
import {AddressMobileList} from '../components/Address-location-mobile/AddressMobileList';
import {AddressValidation} from '../components/Address-Validation/AddressValidation';
import {LogoNavBar} from '../components/Logo-navbar/Logo-NavBar';
import {AuthInterceptorService} from '../auth/auth-interceptor.service';
import {SendReceipt} from '../components/SendReceipt/SendReceipt';
import {AutoCompleteComponent} from '../Pages/OnlineOrdering/HomeScreen/google-places/google-places.component';
import {RefundReceived} from '../Pages/ReportIssue/Refund/refund-received';
import {VerifyForgetComponent} from '../Pages/Account/Verify-Forget/verify.component';
import {HelpComponent} from '../Pages/Account/Help/help.component';
import {VerifyComponent} from '../Pages/Account/Verify/verify.component';
import {HomeScreenComponent} from '../Pages/OnlineOrdering/HomeScreen/home.component';
import {ResetPassComponent} from '../Pages/Account/Reset-Password/reset-pass.component';
import {LoginComponentV2} from '../Pages/Account/Login/login.component';
import {OrderHistoryCardComponent} from '../Pages/Account/orders-history/order-history-card/order-history-card.component';
import {OrdersHistoryComponent} from '../Pages/Account/orders-history/orders-history.component';
import {CheckoutCardConnect} from '../Pages/OnlineOrdering/Checkouts/Checkout-CardConnect/checkout';
import {CheckoutGuestDineInStripe} from '../Pages/DineIn/Checkouts/Checkout-DinieIn-Stripe/checkout';
import {FormCardConnectComponent} from '../Pages/DineIn/Components/form-card-connect/form-card-connect.component';
import {CardConnectAddPaymentMethods} from '../Pages/Account/Customer/AddPaymenMetods/CardConnect/CardConnect';
import {CheckoutDineInCardConnect} from '../Pages/DineIn/Checkouts/Checkout-DinieIn-CardConnect/checkout';
import {CheckoutCfdStripe} from '../Pages/CFD/Checkouts/Checkout-cfd-stripe/checkout';
import {CheckoutCfdCardConnect} from '../Pages/CFD/Checkouts/Checkout-cfd-CardConnect/checkout';
import {CheckoutRefundCardConnect} from '../Pages/ReportIssue/Checkout-Refund-CardConnect/checkout';
import {Menu2Component} from '../Pages/Menu2/menu2.component';
import {MatBadgeModule} from '@angular/material/badge';
import {BottomBarComponent} from '../components/bottom-bar/bottom-bar.component';
import {HeaderComponent} from '../components/header/header.component';
import {MenuSectionComponent} from '../components/menu-section/menu-section.component';
import {PaymentModalComponent} from '../components/payment-modal/payment-modal.component';
import {CollapseComponent} from '../components/collapse/collapse.component';
import {CollapseWithCheckboxesComponent} from '../components/collapse-with-checkboxes/collapse-with-checkboxes.component';
import {CartComponent} from '../Pages/Cart/cart.component';
import {PaymentMethodModalComponent} from '../Pages/Payment-method-modal/payment-method-modal.component';
import {SuccessViewComponent} from '../components/success-view/success-view.component';
import {FailViewComponent} from '../components/fail-view/fail-view.component';
import {FavoritesComponent} from '../Pages/Favorites/favorites.component';
import {FavoritesProductsComponent} from '../components/favorites-products/favorites-products.component';
import {FavoritesRestaurantsComponent} from '../components/favorites-restaurants/favorites-restaurants.component';
import {TabsComponent} from '../Pages/Tabs/tabs.component';
import {OrderSummary2Component} from '../components/order-summary2/order-summary2.component';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {OrderSummaryBottomSheetComponent} from '../components/order-summary-bottom-sheet/order-summary-bottom-sheet.component';
import {ProcessingPaymentComponent} from '../components/processing-payment/processing-payment.component';
import {PaymentSuccessfullComponent} from '../components/payment-successfull/payment-successfull.component';
import {OrderSummaryItemsComponent} from '../components/order-summary-items/order-summary-items.component';
import {SidebarComponent} from '../components/sidebar/sidebar.component';
import {LoginSignupComponent} from '../Pages/login-signup/login-signup.component';
import {NotFoundComponent} from '../Pages/not-found/not-found.component';
import {ScanTableComponent} from '../Pages/scan-table/scan-table.component';
import {PaymentFailedComponent} from '../components/payment-failed/payment-failed.component';
import {OrdersHistory2Component} from '../components/orders-history2/orders-history2.component';
import {MyTabComponent} from '../components/my-tab/my-tab.component';
import {SelectedOrderComponent} from '../Pages/selected-order/selected-order.component';
import {CheckoutComponent} from '../Pages/checkout/checkout.component';
import {CollapseHeaderComponent} from '../components/collapse-header/collapse-header.component';
import {GuestModalComponent} from '../Pages/guest-modal/guest-modal.component';
import {GuestInformationModalComponent} from '../components/guest-information-modal/guest-information-modal.component';
import {ProfileComponent} from '../Pages/my-account/profile/profile.component';
import {AccountFooterComponent} from '../Pages/my-account/account-footer/account-footer.component';
import {PaymentsComponent} from '../Pages/my-account/payments/payments.component';
import {PasswordComponent} from '../Pages/my-account/password/password.component';
import {MaterialInputComponent} from '../components/Account-mobile/material-input/material-input.component';
import {SigninComponent} from '../Pages/signin/signin.component';
import {SignupComponent} from '../Pages/signup/signup.component';
import {NavbarComponent} from '../components/navbar/navbar.component';
import {OrderTypeSliderComponent} from '../components/order-type-slider/order-type-slider.component';
import {OnlineOrderingFooterComponent} from '../components/online-ordering-footer/online-ordering-footer.component';
import {CollapseHeaderCheckoutPaymentComponent} from '../components/collapse-header-checkout-payment/collapse-header-checkout-payment.component';
import {MobileSidebarComponent} from '../components/mobile-sidebar/mobile-sidebar.component';
import {CheckoutGuestStripeComponent} from '../Pages/checkout-guest-stripe/checkout.component';
import {ConditionalFooterDirective} from '../directives/conditional-footer/conditional-footer.directive';
import {ReorderComponent} from '../shared/Reorder/reorder.component';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import { CheckedCheckboxComponent } from '../components/checked-checkbox/checked-checkbox.component';
import { UncheckedCheckboxComponent } from '../components/unchecked-checkbox/unchecked-checkbox.component';
import { UncheckedRadioButtonComponent } from '../components/unchecked-radio-button/unchecked-radio-button.component';
import { CheckedRadioButtonComponent } from '../components/checked-radio-button/checked-radio-button.component';
import { DecrementButtonComponent } from '../components/decrement-button/decrement-button.component';
import { IncrementButtonComponent } from '../components/increment-button/increment-button.component';
import { ActiveDeliveryComponent } from '../components/active-delivery/active-delivery.component';
import { ActivePickupComponent } from '../components/active-pickup/active-pickup.component';
import { ActiveCurbsideComponent } from '../components/active-curbside/active-curbside.component';
import { InactiveDeliveryComponent } from '../components/inactive-delivery/inactive-delivery.component';
import { InactivePickupComponent } from '../components/inactive-pickup/inactive-pickup.component';
import { InactiveCurbsideComponent } from '../components/inactive-curbside/inactive-curbside.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NoThanksComponent } from '../components/no-thanks/no-thanks.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { PoyntModalComponent } from '../components/poynt-modal/poynt-modal.component';
import { CheckoutPoyntComponent } from '../Pages/checkout-poynt/checkout-poynt.component';
import { PoyntInputComponent } from '../components/poynt-input/poynt-input.component';
import { CheckoutCfdPoyntComponent } from '../Pages/CFD/Checkouts/checkout-cfd-poynt/checkout-cfd-poynt.component';
import { CheckoutRefundPoyntComponent } from '../Pages/ReportIssue/checkout-refund-poynt/checkout-refund-poynt.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { FillLikeIconComponent } from '../components/fill-like-icon/fill-like-icon.component';
import { NearMeIconComponent } from '../components/near-me-icon/near-me-icon.component';
import { MenuBookIconComponent } from '../components/menu-book-icon/menu-book-icon.component';
import { MenuBookIconFilledComponent } from '../components/menu-book-icon-filled/menu-book-icon-filled.component';
import { OutlinedLikeIconComponent } from '../components/outlined-like-icon/outlined-like-icon.component';
import { SearchIconComponent } from '../components/search-icon/search-icon.component';
import { CloseIconComponent } from '../components/close-icon/close-icon.component';
import { PersonIconComponent } from '../components/person-icon/person-icon.component';
import { LocationOnIconComponent } from '../components/location-on-icon/location-on-icon.component';
import { ArrowDownIconComponent } from '../components/arrow-down-icon/arrow-down-icon.component';
import { ArrowLeftIconComponent } from '../components/arrow-left-icon/arrow-left-icon.component';
import { ArrowRightIconComponent } from '../components/arrow-right-icon/arrow-right-icon.component';
import { YelpReviewsComponent } from '../components/yelp-reviews/yelp-reviews.component';
import {DeliveryOloModalComponent} from '../Pages/OnlineOrdering/Checkouts/Components/delivery-olo-modal/delivery-olo-modal.component';
import {OloDeliveryStateComponent} from '../Pages/OnlineOrdering/OLODeliveryState/olo-delivery-state.component';
import {AgmCoreModule} from '@agm/core';
import {CancelReasonComponent} from '../Pages/OnlineOrdering/OLODeliveryState/Components/cancel-reason/cancel-reason.component';
import {ReRequestOloModalComponent} from '../Pages/OnlineOrdering/Checkouts/Components/re-request-olo-modal/re-request-olo-modal.component';
import {AddTipsComponent} from '../Pages/OnlineOrdering/OLODeliveryState/Components/add-tips/add-tips.component';
import {TicketComponent} from '../components/ticket/modal/ticket.component';
import {TicketTableComponent} from '../components/ticket/table/ticket-table/ticket-table.component';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';


export function localStorageSyncReducer(
  reducer: ActionReducer<any>
): ActionReducer<any> {
  return localStorageSync({keys: ['cartShop']})(reducer);
}

const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];

@NgModule({
  declarations: [
    AppComponent,
    CheckoutCfdStripe,
    NoFoundComponent,
    OrdersHistoryComponent,
    OrderHistoryCardComponent,
    FavoriteTwoComponent,
    CheckoutGuestStripeComponent,
    LoadingComponent,
    PaymentComponent,
    DialogAddPaymentMethod,
    PaymentRequestComponent,
    YourOrderReceipt,
    YourProductReceipt,
    CheckoutCardConnect,
    LoginComponentV2,
    AddressValidation,
    ReceiptComponent,
    YourOrder,
    ForgotPasswordComponentV2,
    ProductModal,
    CoverPage,
    AddressMobileList,
    CurbsideModal,
    SignInModal,
    ScheduleComponent,
    PaymentCFDComponent,
    PaymentRequestCDFComponent,
    ScheduleCFDComponent,
    ResetPassComponent,
    CreateAccountModal,
    HomeScreenComponent,
    FooterComponent,
    LogoNavBar,
    CategoriesV2GeneralComponent,
    TopProductsV2Component,
    SearchProductsV2Component,
    YourProduct,
    YourOrderCheckout,
    Account,
    CardConnectAddPaymentMethods,
    CheckoutDineInCardConnect,
    SendReceipt,
    Customer,
    Orders,
    AccountMobile,
    CheckoutMobile,
    VerifyComponent,
    AddressDialog,
    OrderSummary,
    ReceiptDineInComponent,
    HelpComponent,
    CurrentLocation,
    VerifyForgetComponent,
    DesktopTimer,
    ActionsPopup,
    RefundReceived,
    YourProduct,
    SignupComponent,
    CheckoutRefund,
    YourOrderCfd,
    YourOrderCheckoutRefund,
    CategoriesV2Component,
    CheckoutCfdCardConnect,
    CheckoutRefundCardConnect,
    AutoCompleteComponent,
    ReceiptCfdComponent,
    YourProductCfd,
    FormCardConnectComponent,
    Menu2Component,
    BottomBarComponent,
    HeaderComponent,
    MenuSectionComponent,
    PaymentModalComponent,
    CollapseComponent,
    CollapseWithCheckboxesComponent,
    CartComponent,
    PaymentMethodModalComponent,
    SuccessViewComponent,
    FailViewComponent,
    FavoritesComponent,
    FavoritesProductsComponent,
    FavoritesRestaurantsComponent,
    TabsComponent,
    OrderSummary2Component,
    OrderSummaryBottomSheetComponent,
    ProcessingPaymentComponent,
    PaymentSuccessfullComponent,
    OrderSummaryItemsComponent,
    SidebarComponent,
    LoginSignupComponent,
    NotFoundComponent,
    ScanTableComponent,
    PaymentFailedComponent,
    OrdersHistory2Component,
    MyTabComponent,
    SelectedOrderComponent,
    CheckoutComponent,
    CollapseHeaderComponent,
    GuestModalComponent,
    GuestInformationModalComponent,
    ProfileComponent,
    AccountFooterComponent,
    PaymentsComponent,
    PasswordComponent,
    MaterialInputComponent,
    SigninComponent,
    PasswordComponent,
    CheckoutGuestDineInStripe,
    SignupComponent,
    NavbarComponent,
    ReorderComponent,
    CheckoutGuestStripeComponent,
    OrderTypeSliderComponent,
    OnlineOrderingFooterComponent,
    CollapseHeaderCheckoutPaymentComponent,
    MobileSidebarComponent,
    ConditionalFooterDirective,
    CheckedCheckboxComponent,
    UncheckedCheckboxComponent,
    UncheckedRadioButtonComponent,
    CheckedRadioButtonComponent,
    DecrementButtonComponent,
    IncrementButtonComponent,
    ActiveDeliveryComponent,
    ActivePickupComponent,
    ActiveCurbsideComponent,
    InactiveDeliveryComponent,
    InactivePickupComponent,
    InactiveCurbsideComponent,
    NoThanksComponent,
    PoyntModalComponent,
    CheckoutPoyntComponent,
    PoyntInputComponent,
    CheckoutCfdPoyntComponent,
    CheckoutRefundPoyntComponent,
    FillLikeIconComponent,
    NearMeIconComponent,
    MenuBookIconComponent,
    MenuBookIconFilledComponent,
    OutlinedLikeIconComponent,
    SearchIconComponent,
    CloseIconComponent,
    PersonIconComponent,
    LocationOnIconComponent,
    ArrowDownIconComponent,
    ArrowLeftIconComponent,
    ArrowRightIconComponent,
    YelpReviewsComponent,
    DeliveryOloModalComponent,
    CancelReasonComponent,
    AddTipsComponent,
    ReRequestOloModalComponent,
    TicketComponent,
    TicketTableComponent,
    OloDeliveryStateComponent
  ],
  imports: [
    BrowserModule,
    CountdownModule,
    StoreModule.forRoot({cartShop: ShopReducer}, {metaReducers}),
    StoreDevtoolsModule.instrument({
      maxAge: 100,
      logOnly: environment.production
    }),
    AppRoutingModule,
    BsDropdownModule.forRoot(),
    NgxIntlTelInputModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    MatDividerModule,
    MatInputModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatRadioModule,
    MatRippleModule,
    MatNativeDateModule,
    MatDatepickerModule,
    NgxStripeModule.forRoot('pk_test_TTF68ceJV8AKZCuq3ho4vrjY00iIHqHUZO'),
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production
    }),
    MatGridListModule,
    MatIconModule,
    CarouselModule,
    MatToolbarModule,
    MatTabsModule,
    MatMenuModule,
    MatStepperModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatTooltipModule,
    ScrollingModule,
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapKey
    }),
    MatTableModule,
    MatPaginatorModule
  ],
  providers: [{provide: MatDialogRef, useValue: {}},
    {provide: MAT_DIALOG_DATA, useValue: []}, {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: {displayDefaultIndicatorType: false}
    },
    ConfigService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
