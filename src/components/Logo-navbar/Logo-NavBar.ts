import { Component, HostListener, OnInit, AfterViewInit } from '@angular/core';
import { select, Store } from '@ngrx/store';

@Component({
  selector: 'Logo-NavBar',
  templateUrl: './Logo-NavBar.html',
  styleUrls: ['./Logo-NavBar.scss']
})
export class LogoNavBar implements OnInit, AfterViewInit {


  storeInformation: any;
  height = 39;
  width = 169;

  constructor(
    private store: Store<{ storeInformation: []; cart: [], customer: [] }>
  ) {
    // @ts-ignore
    store.pipe(select('cartShop')).subscribe((data) => (this.storeInformation = data.storeInformation));
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.onResize();
  }

  getNavBarLogo = (): string => {
    if (!this.storeInformation.storeFrontNavbarLogo) {
      return 'assets/orderosLogo.png';
    } else {
      return this.storeInformation.storeFrontNavbarLogo;
    }
  }

  getAltName = () => {
    if (!this.storeInformation?.storeFrontName) {
      return 'orderOs';
    } else {
      return this.storeInformation?.storeFrontName
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth >= 840) {
      this.height = 60;
      if (this.getNavBarLogo().includes('assets/orderosLogo.png')) {
        this.width = 169;
      }
    } else {
      this.height = 39;
      if (this.getNavBarLogo().includes('assets/orderosLogo.png')) {
        this.width = 108;
      }
    }
  }
}
