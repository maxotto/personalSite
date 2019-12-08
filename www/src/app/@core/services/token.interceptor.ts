import { Injectable, Injector, Inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { AuthenticationService } from './authentication.service';
import { Observable } from 'rxjs';
import { GlobalParams } from '../../params';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    private noTokenUrls = [];
    private refreshTokenUrl = 'api/refresh';
    constructor(@Inject(Window) private _window: Window, private injector: Injector) {
        const hostname = this._window.location.hostname.replace(/^(www\.)/,'' );
        const apiURL = `${GlobalParams.API_SUBDOMEN}.${hostname}`;
        const apiRoot = '/' + GlobalParams.API_VERSION + '/' + GlobalParams.API_SUBDOMEN;
        this.noTokenUrls = [
          `api.agmsite.com` + apiRoot + `/login`,
          'api.thingspeak.com/'
        ];
        this.refreshTokenUrl = `${apiURL}` + apiRoot + `/refresh`;
    }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const url = request.url;
        // Get the auth header from the service.
        const auth = this.injector.get(AuthenticationService);
        let noTokenUrl = false;
        for (const u of this.noTokenUrls) {
            if (url.indexOf(u) >= 0) {
                noTokenUrl = true;
            }
        }
        if (noTokenUrl) {
            // by https://github.com/angular/angular/issues/18224
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