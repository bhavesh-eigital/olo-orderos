import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appConditionalFooter]'
})
export class ConditionalFooterDirective {

  constructor(private el: ElementRef, private renderer: Renderer2) { 
    this.onResize();
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth > 768) {
      this.renderer.removeStyle(this.el.nativeElement, 'display');
      this.renderer.setStyle(this.el.nativeElement, 'display', 'block');
    } else {
      this.renderer.removeStyle(this.el.nativeElement, 'display');
      this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
    }
  }

}
