import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

export enum AfterLoginViews {
  TO_CHECK_OUT = 'toCheckOut',
  TO_FAVORITES = 'toFavorites',
  TO_ACCOUNT = 'toAccount',
  TO_ORDERS = 'toOrders',
  TO_TICKETS = 'toTickets',
}

@Injectable({
  providedIn: 'root'
})
export class UIService {
  showTables = false;
  themeColor = '#e91e63';

  afterLogin: AfterLoginViews;

  public showOldReceiptUI = false;

  constructor(private snackBar: MatSnackBar) { }

  materialInputEventListener() {
    const materialInputs = document.querySelectorAll('.materialInput');
    materialInputs.forEach((input: HTMLInputElement | HTMLSelectElement) => {
      const label = input.previousElementSibling;
      const wrapper = input.parentElement;

      if (input.value) {
        label.classList.add('labelSizeOnInputFocus');
        if (!input.disabled) {
          wrapper.classList.add('borderColorOnInputFocus');
        } else {
          wrapper.classList.remove('borderColorOnInputFocus');
        }
      }

      input.addEventListener('focus', () => {
        label.classList.add('labelSizeOnInputFocus');
        if (!input.disabled) {
          wrapper.classList.add('borderColorOnInputFocus');
        } else {
          wrapper.classList.remove('borderColorOnInputFocus');
        }
      });

      input.addEventListener('blur', () => {
        if (!input.value) {
          label.classList.remove('labelSizeOnInputFocus');
        }
        wrapper.classList.remove('borderColorOnInputFocus');
      })
    });

    const materialSelects = document.querySelectorAll('.materialSelect');
    materialSelects.forEach((select: HTMLSelectElement) => {
      const wrapper = select.parentElement;
      select.addEventListener('mouseover', () => {
        if (!select.disabled) {
          wrapper.classList.add('borderColorOnInputFocus');
        } else {
          wrapper.classList.remove('borderColorOnInputFocus');
        }
      });

      select.addEventListener('mouseleave', () => {
        wrapper.classList.remove('borderColorOnInputFocus');
      })
    })

    const materialInputWrappers = document.querySelectorAll('.materialInputWrapper');
    materialInputWrappers.forEach((wrapper: HTMLDivElement) => {
      wrapper.addEventListener('click', () => {
        const input = wrapper.childNodes[1] as HTMLInputElement;
        input.focus();
      })
    })
  }

  setGlobalThemeColor(themeColor: string) {
    const globalColorWithOpacity = `${themeColor}b9`;
    const lightOpacity = `${themeColor}55`;
    document.documentElement.style.setProperty('--theme-global-var', themeColor);
    document.documentElement.style.setProperty('--theme-opacity-global-var', globalColorWithOpacity);
    document.documentElement.style.setProperty('--theme-light-opacity-var', lightOpacity);
    this.themeColor = themeColor;
  }

  openSnackBar(
    message: string,
    status: number,
    horizontalPosition: MatSnackBarHorizontalPosition = 'center',
    verticalPosition: MatSnackBarVerticalPosition = 'top'
  ) {
    this.snackBar.open(message, '', {
      duration: 5000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: horizontalPosition,
      verticalPosition: verticalPosition,
    });
  }
}
