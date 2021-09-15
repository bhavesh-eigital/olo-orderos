import { Component } from '@angular/core';
import { select, Store } from '@ngrx/store';

@Component({
  selector: 'app-guest-modal',
  templateUrl: './guest-modal.component.html',
  styleUrls: ['./guest-modal.component.scss']
})
export class GuestModalComponent {

  storeInformation: any;

  constructor(private store: Store) {
    // @ts-ignore
    this.store.pipe(select('cartShop'))
      .subscribe((data: any) => {
        this.storeInformation = data.storeInformation;
      });
  }

}
