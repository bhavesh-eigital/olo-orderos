import { Component, AfterViewInit } from '@angular/core';
import { PoyntService } from '../../services/poynt.service';
import { UIService } from '../../services/ui.service';

@Component({
  selector: 'app-poynt-input',
  templateUrl: './poynt-input.component.html',
  styleUrls: ['./poynt-input.component.scss']
})
export class PoyntInputComponent implements AfterViewInit {

  constructor(
    private poyntService: PoyntService,
    private uiService: UIService
  ) { }

  ngAfterViewInit() {
    // this.poyntService.createPoyntScript("poyntWrapper", this.onReady, this.onGetNonce, this.onError);
  }

  onReady = ev => console.log(ev);

  onGetNonce = ev => console.log(ev);

  onError = ev => console.log(ev);

}
