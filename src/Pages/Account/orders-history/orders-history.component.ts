import {Component, OnInit} from '@angular/core';
import {orders} from './data'

@Component({
  selector: 'app-orders-history',
  templateUrl: './orders-history.component.html',
  styleUrls: ['./orders-history.component.scss']
})
export class OrdersHistoryComponent implements OnInit {
  orders = orders
  constructor() { }

  ngOnInit(): void {
  }

}
