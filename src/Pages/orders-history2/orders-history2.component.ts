import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';

@Component({
  selector: 'app-orders-history2',
  templateUrl: './orders-history2.component.html',
  styleUrls: ['./orders-history2.component.scss']
})
export class OrdersHistory2Component implements OnInit {

  open = false;
  currentTab = 0;
  @ViewChild('indicator') indicator: ElementRef;

  orders = [
    {
      id: 1,
      img: 'assets/orders-history/crave.png',
      restaurantName: 'U Crave Cafe & Grill',
      price: 202.28,
      status: 1,
      date: Date.now()
    },
    {
      id: 2,
      img: 'assets/orders-history/pita.jpg',
      restaurantName: 'Pita Kitchen LA',
      price: 97.42,
      status: 1,
      date: Date.now()
    },
    {
      id: 3,
      img: 'assets/orders-history/big-joe.png',
      restaurantName: `Big Joe's Kitchen`,
      price: 55.01,
      status: 1,
      date: Date.now()
    },
    {
      id: 4,
      img: 'assets/orders-history/bollywood.png',
      restaurantName: `Bollywood Bites`,
      price: 0,
      status: 3,
      date: Date.now()
    },
    {
      id: 5,
      img: 'assets/orders-history/via-selfie.png',
      restaurantName: `Via Selfie Fusion Kitchen`,
      price: 55.01,
      status: 1,
      date: Date.now()
    },
    {
      id: 6,
      img: 'assets/orders-history/bollywood.png',
      restaurantName: `Bollywood Bites`,
      price: 0,
      status: 3,
      date: Date.now()
    },
    {
      id: 7,
      img: 'assets/orders-history/via-selfie.png',
      restaurantName: `Via Selfie Fusion Kitchen`,
      price: 55.01,
      status: 1,
      date: Date.now()
    },
  ]

  constructor(private renderer: Renderer2) {
  }

  ngOnInit(): void {
  }

  switchTab(tabNumber: number) {
    if (tabNumber === 0) {
      this.renderer.removeClass(this.indicator.nativeElement, 'right');
      this.renderer.addClass(this.indicator.nativeElement, 'left');
    } else {
      this.renderer.removeClass(this.indicator.nativeElement, 'left');
      this.renderer.addClass(this.indicator.nativeElement, 'right');
    }
    this.currentTab = tabNumber;
  }

  getStatus(status) {
    switch (status) {
      case 1:
        return 'Completed';
      case 2:
        return 'In Progress';
      case 3:
        return 'Cancelled';

      default:
        return
    }
  }

}
