import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { UIService } from '../../services/ui.service';

@Component({
  selector: 'app-bottom-bar',
  templateUrl: './bottom-bar.component.html',
  styleUrls: ['./bottom-bar.component.scss']
})
export class BottomBarComponent implements OnInit {
  cart = [];
  showTabs = true;
  storeInformation: any;

  constructor(
    private store: Store,
    private snackbar: MatSnackBar,
    public router: Router,
    public uiService: UIService
  ) {
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data: any) => (
      this.cart = data.cart,
      this.storeInformation = data.storeInformation
    ));
    if (!localStorage.OnlineStoreAllowOrderWithoutPaying || localStorage.OnlineStoreAllowOrderWithoutPaying === 'false') {
      this.showTabs = false;
    }
  }

  ngOnInit(): void { 
    document.documentElement.style.setProperty('--theme-global-var', this.uiService.themeColor);
  }

  cartClickHandler() {
    if (localStorage.OnlineStoreDineInPauseOrder === 'true') {
      this.snackbar.open('Restaurant is currently not accepting orders, please try again later', '', {
        duration: 3000,
        panelClass: ['green-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }

    this.router.navigate(['/cart']);
  }
}
