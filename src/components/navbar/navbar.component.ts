import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {fromEvent, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, tap} from 'rxjs/operators';
import {OrderTypeSliderComponent} from '../order-type-slider/order-type-slider.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, AfterViewInit {

  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;
  @ViewChild('smallSearchInput') smallSearchInput: ElementRef<HTMLInputElement>;
  @ViewChild('slider') orderTypeSlider: OrderTypeSliderComponent;
  @ViewChild('slider2') orderTypeSlider2: OrderTypeSliderComponent;
  @ViewChild('header') header: ElementRef<HTMLDivElement>;
  @ViewChild('mobileHeader') mobileHeader: ElementRef<HTMLDivElement>;
  @ViewChild('mobileSlider') mobileSlider: ElementRef<HTMLDivElement>;
  @ViewChild('mobileLocation') mobileLocation: ElementRef<HTMLDivElement>;

  @Input() currentOrderType: number = 2;
  @Input() textSearch = '';
  @Input() searchProduct = [];
  @Input() showSlider = true;
  @Input() showCurrentLocation = true;
  @Input() showSearcher = true;
  deliveryIsDisabled = localStorage.getItem('orderTypeDelivery') === 'false' ? false : true;

  @Output() currentOrderTypeChange = new EventEmitter<number>();
  @Output() customerDefaultAddressEmit = new EventEmitter<any>();
  @Output() onSetSearchBox = new EventEmitter<KeyboardEvent>();
  @Output() onSearcherClosed = new EventEmitter<void>();
  @Output() openSidebar = new EventEmitter<void>();

  placeholder = 'Search Menu...';
  innerWidth;
  hiddeLocation = false;
  closeSearch = false;
  openSearch = false;
  searchText$ = new Subscription();

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.onResize();
    this.orderTypeSlider.toggleSlider(this.currentOrderType);
    this.orderTypeSlider2.toggleSlider(this.currentOrderType);
    this.orderTypeSelected(this.currentOrderType)
    this.searcherKeyupListener();
  }


  @HostListener('window: resize', ['$event'])
  onResize() {
    this.innerWidth = window.innerWidth;
    if (window.innerWidth <= 1024) {
      this.placeholder = '';
    } else {
      this.placeholder = 'Search Menu...';
    }

    if (window.innerWidth >= 840) {
      if (!this.header.nativeElement.style.display || this.header.nativeElement.style.display === 'none') {
        this.mobileHeader.nativeElement.style.display = 'none';
        this.header.nativeElement.style.display = 'flex';
        setTimeout(() => this.orderTypeSlider.toggleSlider(this.currentOrderType), 150);
        setTimeout(() => this.orderTypeSlider2.toggleSlider(this.currentOrderType), 150);
        this.mobileLocation.nativeElement.style.display = 'none'
      }
    } else {
      if (!this.mobileHeader.nativeElement.style.display || this.mobileHeader.nativeElement.style.display === 'none') {
        this.header.nativeElement.style.display = 'none'
        this.mobileHeader.nativeElement.style.display = 'block';
        this.mobileLocation.nativeElement.style.display = 'flex'
        setTimeout(() => this.orderTypeSlider2.toggleSlider(this.currentOrderType), 150);
        setTimeout(() => this.orderTypeSlider.toggleSlider(this.currentOrderType), 150);
      }
    }

    this.closeSearcher();
  }

  @HostListener('window: keyup.escape', ['$event'])
  onEscapePressed() {
    this.closeSearcher();
    this.closeSmallSearcher();
  }

  openSearcher() {
    if (!this.searchInput.nativeElement.style.display || this.searchInput.nativeElement.style.display === 'none') {
      if (window.innerWidth <= 1024) {
        this.hiddeLocation = true;
      }
      this.searchInput.nativeElement.style.display = 'block';
      this.searchInput.nativeElement.focus();
    }
  }

  closeSearcher() {
    if (this.innerWidth < 1024) {
      this.hiddeLocation = false;
      this.searchInput.nativeElement.style.display = 'none';
      this.onSearcherClosed.emit();
    }
  }

  openSmallSearcher() {
    this.openSearch = true;
    setTimeout(() => this.smallSearcKeyupListener(), 150);
  }

  closeSmallSearcher() {
    this.openSearch = false;
    this.searchText$.unsubscribe();
    this.onSearcherClosed.emit();
  }

  orderTypeSelected(selectedType: number) {
    this.currentOrderTypeChange.emit(selectedType);
  }

  searcherKeyupListener() {
    const keyupEvent = fromEvent(this.searchInput.nativeElement, 'keyup');
    keyupEvent.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      tap((event: KeyboardEvent) => {
        this.setSearchBox(event);
      })
    ).subscribe();
  }

  smallSearcKeyupListener() {
    this.smallSearchInput.nativeElement.focus();
    const keyupEvent = fromEvent(this.smallSearchInput.nativeElement, 'keyup');
    this.searchText$ = keyupEvent.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      tap((event: KeyboardEvent) => {
        this.setSearchBox(event);
      })
    ).subscribe();
  }

  getNewAddressDefault(ev) {
    this.customerDefaultAddressEmit.emit(ev);
  }

  setSearchBox(event: KeyboardEvent) {
    this.onSetSearchBox.emit(event);
  }
}
