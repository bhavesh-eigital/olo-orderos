import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(
    private router: Router
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token: string = localStorage.getItem('token');

    let request = req;

    if (request.url.includes('googleapis') === false) {
      if (token) {
        request = req.clone({
          setHeaders: {
            authorization: `${token}`
          }
        });
      }
    }


    // @ts-ignore
    return next.handle(request).pipe(catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        if (localStorage.orderType == '4') {
          this.router.navigateByUrl('/signin');
        } else {
          this.router.navigateByUrl('/login');
        }
      }
      return throwError(err);
    })
    );
  }
}

