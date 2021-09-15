import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, map, distinctUntilChanged, tap } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  @Input() title: string = '';
  @Input() showSearcher: boolean = true;
  @Input() fixed: boolean = false;
  @Input() sticky: boolean = false;
  @Input() showNumber = true;
  @Input() showEatosLogo = false;
  @Input() titleTranslation = 'translateX(-50%)';
  @Input() search = false;
  @Input() placeholder = '';
  @Input() showTitle = true;
  @Output() openSidebar = new EventEmitter<void>();
  @Output() onBlur = new EventEmitter<KeyboardEvent>();
  @Output() onKeyUp = new EventEmitter<KeyboardEvent>();
  @Output() onSearcherClose = new EventEmitter<void>();
  tableNumber = localStorage.tableNumber ? localStorage.tableNumber : 0;
  keyupSubs$ = new Subscription();

  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;

  constructor() {
  }


  showSearcherAndListenKeyEvents() {
    this.search = true;
    setTimeout(() => {
      const fromEventEmmit = fromEvent(this.searchInput.nativeElement, 'keyup');
      this.keyupSubs$ = fromEventEmmit.pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        tap((event: KeyboardEvent) => {
          this.onKeyUp.emit(event);
        })
      ).subscribe();
    }, 500)
  }

  hideSearcher() {
    this.search = false;
    this.onSearcherClose.emit();
    this.keyupSubs$.unsubscribe();
  }
}
