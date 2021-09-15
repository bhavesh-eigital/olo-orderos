import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {Router} from '@angular/router';
import {ClearCart, SetCustomer} from '../../store/actions';
import {select, Store} from '@ngrx/store';
import { Subscription } from 'rxjs';
import { OnDestroy } from '@angular/core';
import { AfterLoginViews, UIService } from 'src/services/ui.service';

@Component({
  selector: 'app-mobile-sidebar',
  templateUrl: './mobile-sidebar.component.html',
  styleUrls: ['./mobile-sidebar.component.scss']
})
export class MobileSidebarComponent implements OnInit, OnChanges, OnDestroy {

  @Input() isUserLoggedIn = false;
  @Input() customer: any;
  @Input() username: string;
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  @ViewChild('sidebar') sidebar: ElementRef<HTMLDivElement>;
  @ViewChild('sidebarLayer') layer: ElementRef<HTMLDivElement>;

  storeSub$ = new Subscription();

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private store: Store<{ storeInformation: []; cart: [], customer: [] }>,
    private uiService: UIService
  ) {
    // @ts-ignore
    this.storeSub$ = store.pipe(select('cartShop')).subscribe((data) => (this.customer = data.customer));
  }

  ngOnInit(): void {
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
    this.open = true;
    this.renderer.addClass(this.layer.nativeElement, 'layer-active');
    this.renderer.addClass(this.sidebar.nativeElement, 'open');
  }


  closeSidebar() {
    this.open = false;
    this.openChange.emit(false);
    this.renderer.removeClass(this.layer.nativeElement, 'layer-active');
    this.renderer.removeClass(this.sidebar.nativeElement, 'open');
  }

  redirectHome() {
    this.router.navigate(['home']);
  }

  setCustomer(currentStore) {
    this.store.dispatch(new SetCustomer(currentStore));
  }

  redirectFavorites() {
    if (this.customer === undefined || this.customer.length > 0) {
      this.router.navigate(['login']);
    } else {
      this.router.navigate(['favorites']);
    }
  }

  redirectOrders() {
    if (this.customer === undefined || this.customer.length === 0) {
      this.uiService.afterLogin = AfterLoginViews.TO_ORDERS;
      this.router.navigate(['login']);
    } else {
      this.router.navigate(['orders']);
    }
  }

  redirectAccount() {
    if (this.customer === undefined || this.customer.length === 0) {
      this.uiService.afterLogin = AfterLoginViews.TO_ACCOUNT;
      this.router.navigate(['login']);
    } else {
      this.router.navigate(['customer']);
    }
  }

  cleanCart(currentStore) {
    this.store.dispatch(new ClearCart(currentStore));
  }


  redirectLogin() {
    if (this.customer.length !== 0) {
      this.setCustomer([]);
      this.cleanCart([]);
      localStorage.removeItem('scheduleCategoryId');
    }
    const currency = localStorage.currency;
    const subdomain = localStorage.subdomain;
    const provider = localStorage.provider;
    const autoAccept = localStorage.autoAccept;
    localStorage.clear();
    localStorage.currency = currency;
    localStorage.provider = provider;
    localStorage.subdomain = subdomain;
    localStorage.autoAccept = autoAccept;

    this.uiService.afterLogin = null;

    this.router.navigate(['login']);
  }

  ngOnDestroy() {
    this.storeSub$.unsubscribe();
  }
}
