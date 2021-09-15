import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { map, switchMap } from 'rxjs/operators';
import { PaymentModalComponent } from 'src/components/payment-modal/payment-modal.component';
import { findSetting } from 'src/utils/FindSetting';
import { ConfigService } from '../../services/config.service';
import { Reorder } from "../../services/reorder.service";

@Component({
  selector: 'app-selected-order',
  templateUrl: './selected-order.component.html',
  styleUrls: ['./selected-order.component.scss']
})
export class SelectedOrderComponent implements OnInit, AfterViewInit {

  id: string;
  open: boolean = false;
  date = Date.now();

  order: any = {};

  customer: any;

  loading = false;
  showTitle = true;
  storeInformation: any;
  OnlineStoreDineIn = 'true';

  constructor(
    private activatedRoute: ActivatedRoute,
    private configService: ConfigService,
    private store: Store,
    private reorder: Reorder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.loading = true;
    // @ts-ignore
    store.pipe(select('cartShop')).pipe(
      map((data: any) => (this.customer = data.customer, this.storeInformation = data.storeInformation)),
      switchMap(() => this.activatedRoute.params),
      switchMap((resp: any) => this.getCustomerOrders(resp.id, resp.type))
    ).subscribe();
  }

  ngOnInit(): void {
    this.OnlineStoreDineIn = findSetting(this.storeInformation, 'OnlineStoreDineIn');
  }

  ngAfterViewInit() {
    this.onResize();
  }

  getIngredientes(product) {
    let words = '';

    if (product && product.productIngredients) {
      product.productIngredients.map((ingredient: any, i: number) => {
        words += ingredient.ingredientName;
        if (i < product.productIngredients.length - 1) {
          words += ', ';
        }
      })
    }

    if (product && product.productModifiers) {
      product.productModifiers.map((modifier: any, i: number) => {
        words += modifier.modifierName;
        if (i < product.productModifiers.length - 1) {
          words += ', ';
        }
      })
    }

    return words;
  }

  getCustomerOrders(orderId: string, type: string) {
    return this.configService.getCustomerOrders(this.customer.customerId, this.storeInformation.storeId).pipe(
      map(({ orders }: any) => {
        if (type === 'current') {
          this.order = orders.current.find(order => order.orderId === orderId);
        } else {
          this.order = orders.past.find(order => order.orderId === orderId);
        }
        this.loading = false;
      })
    )
  }

  getStatus(status) {
    switch (status) {
      case 1:
        return 'Unconfirmed';
      case 2:
        return 'accepted';
      case 3:
        return 'Cancelled';
      case 4:
        return 'Preparing';
      case 5:
        return 'Prepared';
      case 6:
        return 'Picking-up';
      case 7:
        return 'Completed';
      case 8:
        return 'Cancelled';
      default:
        return
    }
  }

  openDialog(currentProduct): void {
    this.dialog.open(PaymentModalComponent, {
      panelClass: 'full-screen-modal',
      data: { product: currentProduct, action: 'add' }
    });
  }

  reOrder(orderId: any) {
    if (this.OnlineStoreDineIn === 'false') {
      this.snackBar.open('This store has disabled the option to order from Dinein', '', {
        duration: 5000,
        panelClass: ['red-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }
    this.reorder.reorderByOrderId(this.storeInformation.merchantId, orderId);
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth < 365) {
      this.showTitle = false;
    } else {
      this.showTitle = true;
    }
  }
}
