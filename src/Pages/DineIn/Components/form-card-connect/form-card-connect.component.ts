import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';

@Component({
  selector: 'FormCardConnect',
  templateUrl: './form-card-connect.component.html',
  styleUrls: ['./form-card-connect.component.scss']
})
export class FormCardConnectComponent implements OnInit {
  @Output() tokenEmited: EventEmitter<any> = new EventEmitter();
  urlLink: any;
  responseFormCard: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  height = 270;

  constructor(private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.getParams();
    window.addEventListener('message', (event) => {
      const token = JSON.parse(event.data);
      this.responseFormCard = token;
      this.tokenEmited.emit(this.responseFormCard);
    }, true);
  }

  openSnackBar(message, status) {
    this.snackBar.open(message, '', {
      duration: 5000,
      panelClass: [status === 1 ? 'green-snackbar' : 'red-snackbar'],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  getParams = () => {
    const params = {
      useexpiry: true,
      usemonthnames: true,
      usecvv: true,
      cardnumbernumericonly: true,
      invalidinputevent: true,
      enhancedresponse: true,
      tokenizewheninactive: true,
      inactivityto: true,
      cardinputmaxlength: 19,
      fullmobilekeyboard: true,
      formatinput: true
    };
    const queryString = Object.keys(params).map((key) => {
      return key + '=' + params[key];
    }).join('&');
    this.urlLink = this.sanitizer
      .bypassSecurityTrustResourceUrl(encodeURI('https://boltgw.cardconnect.com:6443/itoke/ajax-tokenizer.html?' + queryString + '&css=label{font-size:18px;margin-top:10px;font-weight:400;text-transform:uppercase;font-family: Montserrat, sans-serif !important;}select{height:48px;width:110px;margin-right:10px;margin-top:8px;margin-bottom:8px;font-size:15px;border-radius:6px;border-width:1px;border-color:lightgrey;border-style:solid;font-size:18px;padding-left:10px;-moz-outline:none;outline:none}input{width: 100%;margin-top:8px;margin-bottom:8px;vertical-align:middle;font-size:18px;border-radius:6px;border-width:1px;border-color:lightgrey;border-style:solid;height:48px;padding-left:10px;box-sizing:border-box;-moz-outline:none;outline:none}input:last-child{width:80px}'));
  }


  showMeToken() {
    if (this.responseFormCard.errorCode === '0') {
      this.tokenEmited.emit(this.responseFormCard);
    } else {
      this.tokenEmited.emit(this.responseFormCard);
      this.openSnackBar(this.responseFormCard.errorMessage, 2);
    }
  }


}
