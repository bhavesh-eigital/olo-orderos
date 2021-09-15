import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-search-icon',
  templateUrl: './search-icon.component.html',
  styleUrls: ['./search-icon.component.scss']
})
export class SearchIconComponent implements OnInit {

  @Input() size: 'small' | 'default' = 'default';

  constructor() { }

  ngOnInit(): void {
  }

}
