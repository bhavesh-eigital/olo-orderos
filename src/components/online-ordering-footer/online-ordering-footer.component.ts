import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { AfterLoginViews, UIService } from 'src/services/ui.service';

@Component({
  selector: 'app-online-ordering-footer',
  templateUrl: './online-ordering-footer.component.html',
  styleUrls: ['./online-ordering-footer.component.scss']
})
export class OnlineOrderingFooterComponent implements OnDestroy {

  @Input() cartIsOpened = false;
  @Input() cartLength = 0;
  @Output() onCartClicked = new EventEmitter<void>();

  storeSub$ = new Subscription();
  customer: any = [];

  constructor(
    public router: Router,
    private snackbar: MatSnackBar,
    private store: Store,
    private uiService: UIService
  ) { 
    this.storeSub$ = store.subscribe((state: any) => {
      const data = state.cartShop;
      this.customer = data.customer;
    });
  }

  ngOnInit(): void { }

  clickCartHandler() {
    if (localStorage.getItem('pauseOrder') === 'true') {
      this.snackbar.open('Restaurant is currently not accepting orders, please try again later', '', {
        duration: 3000,
        panelClass: ['green-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return
    }

    this.onCartClicked.emit();
  }

  onFavoritesClicked() {
    if(this.customer.length === 0) {
      this.uiService.afterLogin = AfterLoginViews.TO_FAVORITES
    }

    this.router.navigate(['favorites'])
  }

  ngOnDestroy() {
    this.storeSub$.unsubscribe();
  }
}
