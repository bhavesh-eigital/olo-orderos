import { Component, Input, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-unchecked-radio-button',
  templateUrl: './unchecked-radio-button.component.html',
  styleUrls: ['./unchecked-radio-button.component.scss']
})
export class UncheckedRadioButtonComponent implements AfterViewInit {

  @Input() disabled = false;

  constructor() { }

  ngAfterViewInit() {
    this.setInputColor();
  }

  setInputColor() {
    if(this.disabled) {
      return '#ddd';
    }
    return '#212121';
  }
}
