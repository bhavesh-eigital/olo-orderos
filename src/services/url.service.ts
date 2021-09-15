import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class UrlService {

    routerEventSub$ = new Subscription();

    constructor(private router: Router) { 
        this.getLastUrl();
    }


    getLastUrl() {
        this.routerEventSub$ = this.router.events.pipe(
            tap((ev) => console.log({ev:console.log(ev)})),
            filter(event => event instanceof NavigationEnd),
            tap((event: NavigationEnd) => console.log(event))
        ).subscribe();
    }
}