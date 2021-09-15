import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-order-history-card',
  templateUrl: './order-history-card.component.html',
  styleUrls: ['./order-history-card.component.scss']
})
export class OrderHistoryCardComponent implements OnInit {
  @Input() order
  constructor() { }

  ngOnInit(): void {
  }

}
