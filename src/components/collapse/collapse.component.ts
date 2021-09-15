import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
  ViewChildren
} from '@angular/core';

@Component({
  selector: 'app-collapse',
  templateUrl: './collapse.component.html',
  styleUrls: ['./collapse.component.scss']
})
export class CollapseComponent implements OnInit, AfterViewInit {

  @Input() items = [];
  @Input() title = '';
  @Input() variantSelected = { _id: '0' };
  @Output() variantEmit: EventEmitter<any> = new EventEmitter();

  @ViewChild('toggleHeader') toggleHeader: ElementRef;
  @ViewChild('toggleArrow') toggleArrow: ElementRef;
  @ViewChild('togglePannel') togglePannel: ElementRef;

  @Input() show = true;

  constructor(private renderer: Renderer2) {
  }

  ngOnInit() {
    this.setSize();
  }

  ngAfterViewInit() {
    this.toggleCollapsesListener();
  }

  setVariant = (variant) => {

    this.variantSelected = variant;
    this.variantEmit.emit(variant);
  }

  isVariantSelected = (variantOption) => {
    return this.variantSelected._id === variantOption._id;
  }

  toggleCollapsesListener() {
    this.toggleCollapse();
    this.renderer.listen(this.toggleHeader.nativeElement, 'click', () => {
      this.toggleCollapse();
    });
  }

  toggleCollapse() {
    if (!this.show) {
      this.show = true;
      this.renderer.removeClass(this.togglePannel.nativeElement, 'show');
      this.renderer.addClass(this.togglePannel.nativeElement, 'hidden');
      this.renderer.addClass(this.toggleArrow.nativeElement, 'rotate');

    } else {
      this.show = false;
      this.renderer.removeClass(this.togglePannel.nativeElement, 'hidden');
      this.renderer.addClass(this.togglePannel.nativeElement, 'show');
      this.renderer.removeClass(this.toggleArrow.nativeElement, 'rotate');
    }
  }

  setSize() {
    if (this.items.length === 1 || this.variantSelected._id === '0') {
      this.variantSelected._id = this.items[0]._id;
    }
  }
}
