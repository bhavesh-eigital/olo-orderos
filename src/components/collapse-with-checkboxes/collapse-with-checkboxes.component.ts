import { OnChanges, SimpleChanges } from '@angular/core';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Renderer2,
  ViewChild,
  ViewChildren
} from '@angular/core';
import ObjectID from 'bson-objectid';

@Component({
  selector: 'app-collapse-with-checkboxes',
  templateUrl: './collapse-with-checkboxes.component.html',
  styleUrls: ['./collapse-with-checkboxes.component.scss']
})
export class CollapseWithCheckboxesComponent implements AfterViewInit, OnChanges {


  @Input() items = [];
  @Input() title = '';
  @Input() description = '';
  @Input() type = '';
  @Input() ingredientsSelected = [];
  @Input() show = true;
  @Input() modifiersGroup: any = [];
  @Input() modifiersSelected = [];
  @Input() modifierGroupIndex: number;
  @Input() disabled = false;
  @Output() ingredientsEmit: EventEmitter<any> = new EventEmitter();
  @Output() modifiersSelectedChange: EventEmitter<any> = new EventEmitter();

  @ViewChild('toggleHeader') toggleHeader: ElementRef;
  @ViewChild('toggleArrow') toggleArrow: ElementRef;
  @ViewChild('togglePannel') togglePannel: ElementRef;
  panelOpenState: boolean;


  constructor(private renderer: Renderer2) { }

  ngOnChanges(changes: SimpleChanges) { }

  ngAfterViewInit(): void {
    this.toggleCollapsesListener();
  }

  setIngredients = (ingredients) => {
    this.ingredientsEmit.emit(ingredients);
  }

  setModifiers = (modifierSelected, optionSelected, index) => {
    const isSelected = this.modifiersSelected.find((modifier) => {
      return modifier.modifierOptions.find( options => {
       return modifier.modifierId === modifierSelected.modifierId &&
        modifier.modifierGroupName === this.modifiersGroup[this.modifierGroupIndex].modifierGroupName &&
         options._id === optionSelected._id;
      } );
    });

    if (isSelected === undefined) {
      if(this.disabled) {
        return
      }
      const findModifierId = this.modifiersSelected.find( mod => mod.modifierId === modifierSelected.modifierId );

      if (!findModifierId) {
        this.modifiersSelected.push({
          ...modifierSelected,
          modifierOptions: [optionSelected],
          modifiersTemporalId: new ObjectID().toHexString(),
          modifierGroupId: this.modifiersGroup[this.modifierGroupIndex].modifierGroupId,
          modifierGroupName: this.modifiersGroup[this.modifierGroupIndex].modifierGroupName
        });

      } else {
        this.modifiersSelected = [...this.modifiersSelected.map( modG =>
          modG.modifierId === modifierSelected.modifierId  ?
          {...modG, modifierOptions: [optionSelected] } : modG)];
      }

    } else {
      this.modifiersSelected = this.modifiersSelected.filter((modifier) => {
        return (modifier.modifierId !== modifierSelected.modifierId);
      });
    }

    this.modifiersSelectedChange.emit(this.modifiersSelected);
  }

  isIngredientSelected = (ingredientOption) => {
    const isCheck = this.ingredientsSelected.find((item) => {
      return item.ingredientId === ingredientOption.ingredientId;
    });
    return isCheck !== undefined;
  }

  isModifiersSelected = (modifiersOption, modifiersGroup) => {

    const isCheck = this.modifiersSelected.find((modifier) => {
      // if((modifier.modifierId === modifiersOption.modifierId) && (modifier.modifierGroupName === modifiersGroup.modifierGroupName)) {
      //   console.log(modifier, modifiersGroup);
      // }
      return (modifier.modifierId === modifiersOption.modifierId) && (modifier.modifierGroupName === modifiersGroup.modifierGroupName);
    });

    if(isCheck) {
      console.log();
    }

    return isCheck !== undefined;
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

  isOptionModifierSelected( modifierSelected: any, modOptionSelected: any) {
    const modOptionChecked =  this.modifiersSelected.find( modifier => {
      return modifier.modifierOptions.find( options => {
        return modifier.modifierId === modifierSelected.modifierId && options._id === modOptionSelected._id;
      } );
    } );
    return modOptionChecked !== undefined;
  }
}
