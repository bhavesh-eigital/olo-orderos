import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {Router} from '@angular/router';
import {UIService} from '../../services/ui.service';
import {select, Store} from '@ngrx/store';
import {
  ClearCart,
  SetCustomer,
  SetPlacedOrder,
  SetTemporalCustomer,
  SetTemporalCustomerPhoneDetails
} from 'src/store/actions';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnChanges {

  tableNumber = localStorage.tableNumber ? localStorage.tableNumber : 0;
  customerName = 'Guest';
  @Input() open: boolean = false;
  @Output() openChange = new EventEmitter<boolean>();
  @ViewChild('sidebar') sidebar: ElementRef;
  @ViewChild('sidebarLayer') layer: ElementRef;
  customer: any;
  placedOrders = [];

  constructor(
    private renderer: Renderer2,
    private uiService: UIService,
    private store: Store,
    private router: Router,
    private snackbar: MatSnackBar
  ) {
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data: any) => {
      this.customer = data.customer;
      this.customer.length !== 0
        ? this.customerName = this.customer.customerFirstName + ' ' + this.customer.customerLastName
        : this.customerName = 'Guest';
      this.placedOrders = data.placedOrders;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.layer && this.sidebar) {
      if (changes.open.currentValue) {
        this.openSidebar();
      } else {
        this.closeSidebar();
      }
    }
  }

  openSidebar() {
    this.open = true
    this.renderer.addClass(this.layer.nativeElement, 'layer-active');
    this.renderer.addClass(this.sidebar.nativeElement, 'open');
  }


  closeSidebar() {
    this.open = false;
    this.openChange.emit(false);
    this.renderer.removeClass(this.layer.nativeElement, 'layer-active');
    this.renderer.removeClass(this.sidebar.nativeElement, 'open');
  }

  goToTable() {
    this.uiService.showTables = true;
    this.router.navigate(['/scanner-table']);
  }

  goToAccount() {
    if (this.customer === undefined || this.customer.length > 0) {
      this.router.navigate(['/signin']);
    } else {
      this.router.navigate(['/my-account/profile']);
    }
  }

  setCustomer(currentStore) {
    this.store.dispatch(new SetCustomer(currentStore));
  }

  cleanCart(currentStore) {
    this.store.dispatch(new ClearCart(currentStore));
  }

  setPlacedOrders(newOrder) {
    this.store.dispatch(new SetPlacedOrder(newOrder));
  }

  setTemporalCustomer() {
    this.store.dispatch(new SetTemporalCustomer([]));
    this.store.dispatch(new SetTemporalCustomerPhoneDetails(null));
  }

  leaveTable() {
    if (this.areTherePlacedOrders()) return;

    this.setCustomer([]);
    this.cleanCart([]);
    this.setPlacedOrders([]);
    this.setTemporalCustomer();
    localStorage.removeItem('tableNumber');
    this.router.navigate(['/scanner-table']);
  }

  redirectLogin() {
    if (this.isCustomerLoggedIn() && this.areTherePlacedOrders()) return;

    if(this.customer.length !== 0) {
      this.setCustomer([]);
      this.cleanCart([]);
    }

    // this.setPlacedOrders([]);
    this.setTemporalCustomer();
    const currency = localStorage.currency;
    const subdomain = localStorage.subdomain;
    const provider = localStorage.provider;
    localStorage.currency = currency;
    localStorage.subdomain = subdomain;
    localStorage.provider = provider;
    localStorage.removeItem('expirationDate');
    this.router.navigate(['signin']);

    this.closeSidebar();
  }

  isCustomerLoggedIn() {
    return Object.keys(this.customer).length
  }

  areTherePlacedOrders() {
    if (this.placedOrders && this.placedOrders.length) {
      this.snackbar.open('You must pay your orders before sign out', '', {
        duration: 5000,
        panelClass: ['red-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      this.closeSidebar();
      return true;
    }
    return false;
  }
}
