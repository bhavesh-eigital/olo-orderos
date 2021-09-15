import {Injectable} from '@angular/core';
import {LazyLoadService} from './lazy-load.service';
import {Observable, Subject} from 'rxjs';

declare const gapi;

@Injectable({
  providedIn: 'root'
})
export class GoogleService {
  public auth2: any;

  constructor(private lazyLoadService: LazyLoadService) {
    this.lazyLoadService
      .load(`https://apis.google.com/js/platform.js`, 'script')
      .subscribe(() => {
        gapi.load('auth2', () => {
          this.auth2 = gapi.auth2.init({
            fetch_basic_profile: true,
            scope: 'profile email',
            client_id:
              '351848152932-bsicd9okj1g629o47ruhjho9uhblim2t.apps.googleusercontent.com'
          });
        });
      });
  }

  signIn(): Observable<any> {
    const result = new Subject();

    this.auth2.signIn({scope: 'profile email'}).then(
      () => {
        const googleToken = this.auth2.currentUser.get().getAuthResponse(true);
        result.next(googleToken);
        result.complete();
      },
      (fail) => {
        result.next(false);
        result.complete();
      }
    );

    return result;
  }
}
