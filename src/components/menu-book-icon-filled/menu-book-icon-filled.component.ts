import { AfterViewInit, Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-menu-book-icon-filled',
  templateUrl: './menu-book-icon-filled.component.html',
  styleUrls: ['./menu-book-icon-filled.component.scss']
})
export class MenuBookIconFilledComponent implements AfterViewInit {

  width = 0;

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
