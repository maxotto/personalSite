import { Injectable, Injector, Inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { AuthenticationService } from './authentication.service';
import { Observable } from 'rxjs/Observable';
import { GlobalParams } from '../../params';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    private noTokenUrl = 'api/login';
    private refreshTokenUrl = 'api/refresh';
    constructor(@Inject(Window) private _window: Window, private injector: Injector) {
        const hostname = this._window.location.hostname.replace(/^(www\.)/,'' );
        const apiURL = `${GlobalParams.API_SUBDOMEN}.${hostname}`;
        this.noTokenUrl = `api.agmsite.com/v1/api/login`;
        this.refreshTokenUrl = `${apiURL}/refresh`;
    }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const url = request.url;
        // Get the auth header from the service.
        const auth = this.injector.get(AuthenticationService);
        console.log(request);
        if (url.indexOf(this.noTokenUrl) >= 0) {
            // by https://github.com/angular/angular/issues/18224
            // console.log(url);
            return next.handle(request);
        }
        if (url.indexOf(this.refreshTokenUrl) >= 0) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${auth.getRefreshToken()}`
                }
            });
            return next.handle(request);
        }
        request = request.clone({
            setHeaders: {
                Authorization: `Bearer ${auth.getAccessToken()}`
            }
        });
        return next.handle(request);
    }
}