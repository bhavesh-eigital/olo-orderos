import { Component, HostListener, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-menu-book-icon',
  templateUrl: './menu-book-icon.component.html',
  styleUrls: ['./menu-book-icon.component.scss']
})
export class MenuBookIconComponent implements  AfterViewInit{

  width = 0

  constructor() { }

  ngAfterViewInit() {
    this.onResize();
  }

  @HostListener('window:resize')
  onResize() {
    this.width = window.innerWidth;
  }

  getSize() {
    if(this.width > 699) {
      return 34;
    }
    return 24;
  }
}
