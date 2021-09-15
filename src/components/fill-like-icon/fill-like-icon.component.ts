import { AfterViewInit, Component, HostListener, Input } from '@angular/core';

@Component({
  selector: 'app-fill-like-icon',
  templateUrl: './fill-like-icon.component.html',
  styleUrls: ['./fill-like-icon.component.scss']
})
export class FillLikeIconComponent implements AfterViewInit {

  @Input() size: 'small' | 'default' = 'default';
  @Input() dark = false;
  @Input() fromFooter = true;
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
    if(this.fromFooter && this.width > 699 && this.size !== 'small') {
      return 34;
    }
    return 24;
  }

}
