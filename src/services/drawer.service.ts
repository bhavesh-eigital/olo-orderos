import {Injectable} from '@angular/core';
// @ts-ignore
import {MatDrawer} from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class DrawerService {
  private drawer: MatDrawer;

  /**
   * setDrawer
   */
  public setDrawer(flyout: MatDrawer) {
    this.drawer = flyout;
  }

  public close() {
    return this.drawer.close();
  }
  public toggle(): void {
    this.drawer.toggle();
  }
}
