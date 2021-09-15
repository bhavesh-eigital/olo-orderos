import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-outlined-like-icon',
  templateUrl: './outlined-like-icon.component.html',
  styleUrls: ['./outlined-like-icon.component.scss']
})
export class OutlinedLikeIconComponent implements OnInit {

  @Input() size: 'small' | 'default' = 'default';

  constructor() { }

  ngOnInit(): void {
  }

}
