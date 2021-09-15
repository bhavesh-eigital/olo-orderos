import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReceiptComponent } from '../Pages/OnlineOrdering/Receipt/receipt.component';
import { AppComponent } from './app.component';
import { ForgotPasswordComponentV2 } from '../Pages/Account/Forgot-password/forgot-password.component';
import { CategoriesV2GeneralComponent } from '../Pages/OnlineOrdering/Categories/categories.component';
import { FavoriteTwoComponent } from '../Pages/Account/Favorites/favorite-two.component';
import { Customer } from '../Pages/Account/Customer/customer.component';
import { Orders } from '../Pages/Account/Orders/orders';
import { DesktopTimer } from '../Pages/ReportIssue/MenuReportIssue/desktop-timer.component';
import { CheckoutRefund } from '../Pages/ReportIssue/Checkout-Refund/checkout';
import { ReceiptCfdComponent } from '../Pages/CFD/Receipt-cfd/receipt.component';
import { ReceiptDineInComponent } from '../Pages/DineIn/Receipt-DineIn/receipt.component';
import { NoFoundComponent } from '../Pages/NoFound/noFound.component';
import { HomeScreenComponent } from '../Pages/OnlineOrdering/HomeScreen/home.component';
import { LoginComponentV2 } from '../Pages/Account/Login/login.component';
import { ResetPassComponent } from '../Pages/Account/Reset-Password/reset-pass.component';
import { RefundReceived } from '../Pages/ReportIssue/Refund/refund-received';
import { VerifyComponent } from '../Pages/Account/Verify/verify.component';
import { VerifyForgetComponent } from '../Pages/Account/Verify-Forget/verify.component';
import { HelpComponent } from '../Pages/Account/Help/help.component';
import { CheckoutCfdStripe } from '../Pages/CFD/Checkouts/Checkout-cfd-stripe/checkout';
import { CheckoutCfdCardConnect } from '../Pages/CFD/Checkouts/Checkout-cfd-CardConnect/checkout';
import { CheckoutRefundCardConnect } from '../Pages/ReportIssue/Checkout-Refund-CardConnect/checkout';
import { Menu2Component } from '../Pages/Menu2/menu2.component';
import { CartComponent } from '../Pages/Cart/cart.component';
import { FavoritesComponent } from '../Pages/Favorites/favorites.component';
import { TabsComponent } from '../Pages/Tabs/tabs.component';
import { NotFoundComponent } from '../Pages/not-found/not-found.component';
import { ScanTableComponent } from '../Pages/scan-table/scan-table.component';
import { OrdersHistory2Component } from '../components/orders-history2/orders-history2.component';
import { SelectedOrderComponent } from '../Pages/selected-order/selected-order.component';
import { CheckoutCardConnect } from '../Pages/OnlineOrdering/Checkouts/Checkout-CardConnect/checkout';
import { CheckoutComponent } from '../Pages/checkout/checkout.component';
import { GuestModalComponent } from 'src/Pages/guest-modal/guest-modal.component';
import { OrderSummary2Component } from '../components/order-summary2/order-summary2.component';
import { ProfileComponent } from '../Pages/my-account/profile/profile.component';
import { PaymentsComponent } from '../Pages/my-account/payments/payments.component';
import { PasswordComponent } from 'src/Pages/my-account/password/password.component';
import { SigninComponent } from '../Pages/signin/signin.component';
import { SignupComponent } from '../Pages/signup/signup.component';
import { CheckoutGuestStripeComponent } from '../Pages/checkout-guest-stripe/checkout.component';
import { CheckoutPoyntComponent } from '../Pages/checkout-poynt/checkout-poynt.component';
import { CheckoutCfdPoyntComponent } from '../Pages/CFD/Checkouts/checkout-cfd-poynt/checkout-cfd-poynt.component';
import { CheckoutRefundPoyntComponent } from '../Pages/ReportIssue/checkout-refund-poynt/checkout-refund-poynt.component';
import {OloDeliveryStateComponent} from '../Pages/OnlineOrdering/OLODeliveryState/olo-delivery-state.component';
import {TicketTableComponent} from '../components/ticket/table/ticket-table/ticket-table.component';

const routes: Routes = [
  { path: '', component: HomeScreenComponent, pathMatch: 'full' },
  { path: 'home', component: CategoriesV2GeneralComponent, pathMatch: 'full' },
  { path: 'product/:productId', component: CategoriesV2GeneralComponent, pathMatch: 'full' },
  { path: 'forgetPassword', component: ForgotPasswordComponentV2 },
  { path: 'login', component: LoginComponentV2 },
  { path: 'customer', component: Customer },
  { path: 'favorites', component: FavoriteTwoComponent },
  { path: 'receipt', component: ReceiptComponent },
  { path: 'receipt-cfd', component: ReceiptCfdComponent },
  { path: 'receipt/restaurant', component: ReceiptDineInComponent },
  { path: 'orders', component: Orders },
  { path: 'redirect', component: AppComponent },
  {
    path: 'checkout/cdf', component: localStorage.provider === 'STRIPE'
      ? CheckoutCfdStripe
      : CheckoutCfdCardConnect
  },
  { path: 'checkout', component: CheckoutCardConnect },
  {
    path: 'checkout/Refund', component: localStorage.provider === 'STRIPE'
      ? CheckoutRefund
      : CheckoutRefundCardConnect
  },
  {
    path: 'checkout-refund', component: localStorage.provider === 'STRIPE'
      ? CheckoutRefund
      : CheckoutRefundCardConnect
  },
  { path: 'reset', component: ResetPassComponent },
  { path: 'refundRequest', component: DesktopTimer },
  { path: 'refund', component: RefundReceived },
  { path: 'verify', component: VerifyComponent },
  { path: 'verify-reset', component: VerifyForgetComponent },
  { path: 'help/:orderId', component: HelpComponent },
  { path: 'noFound', component: NoFoundComponent },
  { path: 'dinein', component: Menu2Component },
  { path: 'cart', component: CartComponent },
  { path: 'my-favorites', component: FavoritesComponent },
  { path: 'tabs', component: TabsComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'notFound', component: NotFoundComponent },
  { path: 'scanner-table', component: ScanTableComponent },
  { path: 'orders-history', component: OrdersHistory2Component },
  { path: 'orders-history/:id/:type', component: SelectedOrderComponent },
  {
    path: 'checkoutGuest',
    component: localStorage.provider === 'STRIPE'
      ? CheckoutGuestStripeComponent
      : CheckoutComponent
  },
  { path: 'guest-information', component: GuestModalComponent },
  { path: 'order-summary', component: OrderSummary2Component },
  { path: 'my-account/profile', component: ProfileComponent },
  { path: 'my-account/payment', component: PaymentsComponent },
  { path: 'my-account/password', component: PasswordComponent },
  { path: 'delivery/state', component: OloDeliveryStateComponent },
  { path: 'tickets', component: TicketTableComponent },
  { path: '**', redirectTo: '/notFound' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
