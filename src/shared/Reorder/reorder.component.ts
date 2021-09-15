import {AfterViewInit, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-collapse-reorder',
  templateUrl: './reorder.component.html',
  styleUrls: ['./reorder.component.scss']
})
export class ReorderComponent implements OnInit, AfterViewInit {

  constructor() {
  }

  orderId: string;
  modifiersSelected: any;

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
  }

  getOrderInformation = () => {
  }


}
