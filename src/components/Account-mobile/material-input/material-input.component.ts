import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-material-input',
  templateUrl: './material-input.component.html',
  styleUrls: ['./material-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MaterialInputComponent),
      multi: true
    }
  ]
})
export class MaterialInputComponent implements OnInit, AfterViewInit {

  @Input() placeholder: string = '';
  @Input() width: string = '200px';
  @Input() name = '';
  @Output() ngModelChange = new EventEmitter();
  @ViewChild('matInput') matInput: ElementRef<HTMLInputElement>;
  @ViewChild('matInputWrapper') matInputWrapper: ElementRef<HTMLDivElement>;
  @ViewChild('matLabel') matLabel: ElementRef<HTMLLabelElement>;

  value = '';

  onChange = (_: any) => {};

  constructor(
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
  }

  emitChanges() {
    this.onChange(this.value);
  }

  writeValue(val: any): void {
    this.value = val;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {}

  setDisabledState?(isDisabled: boolean) {}

  // onNgModelChange() {
  //   this.ngModelChange.emit(this.ngModel);
  // }

  ngAfterViewInit() {
    this.renderer.listen(this.matInput.nativeElement, 'focus', () => {
      this.addLabelStyles();
      this.addBorderStyles();
    });

    this.renderer.listen(this.matInput.nativeElement, 'blur', () => {
      if (!this.matInput.nativeElement.value) {
        this.removeLabelStyles();
      }
      this.removeBorderStyles();
    })

    this.renderer.listen(this.matInput.nativeElement, 'keyup', () => {
      if (!this.matInput.nativeElement.value) {
        this.removeLabelStyles();
      } else {
        this.addLabelStyles();
      }
    })
  }

  addBorderStyles() {
    this.renderer.addClass(this.matInputWrapper.nativeElement, 'borderColorOnInputFocus');
  }

  removeBorderStyles() {
    this.renderer.removeClass(this.matInputWrapper.nativeElement, 'borderColorOnInputFocus');
  }

  addLabelStyles() {
    this.renderer.addClass(this.matLabel.nativeElement, 'labelSizeOnInputFocus')
  }

  removeLabelStyles() {
    this.renderer.addClass(this.matLabel.nativeElement, 'labelSizeOnInputFocus')
  }

  // onChange()

  setChange(ev) {}
}
