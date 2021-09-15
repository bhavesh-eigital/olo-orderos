import {AfterViewInit, Component, ElementRef, Input, Renderer2, ViewChild} from '@angular/core';

@Component({
  selector: 'app-collapse-header',
  templateUrl: './collapse-header.component.html',
  styleUrls: ['./collapse-header.component.scss']
})
export class CollapseHeaderComponent implements AfterViewInit {

  @ViewChild('toggleHeader') toggleHeader: ElementRef<HTMLElement>;
  @ViewChild('toggleArrow') toggleArrow: ElementRef<HTMLElement>;
  @Input() title: string = '';
  @Input() show = false;

  constructor(private renderer: Renderer2) {
  }

  ngAfterViewInit(): void {
    this.toggleCollapse();
  }

  toggleCollapse() {
    if (!this.show) {
      this.show = true;
      this.renderer.removeClass(this.toggleHeader.nativeElement.parentElement.nextSibling, 'show');
      this.renderer.addClass(this.toggleHeader.nativeElement.parentElement.nextSibling, 'hidden');
      this.renderer.addClass(this.toggleArrow.nativeElement, 'rotate');
    } else {
      this.show = false;
      this.renderer.removeClass(this.toggleHeader.nativeElement.parentElement.nextSibling, 'hidden');
      this.renderer.addClass(this.toggleHeader.nativeElement.parentElement.nextSibling, 'show');
      this.renderer.removeClass(this.toggleArrow.nativeElement, 'rotate');
    }
  }
}
