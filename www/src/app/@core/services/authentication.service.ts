import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import { GlobalParams } from '../../params';
import { JwtHelper } from '../jwt/jwtHelper';
import {Router} from '@angular/router';

@Injectable()
export class AuthenticationService {
    // http://plnkr.co/edit/XqwwUM44NQEpxQVFFxNW?p=preview
    private _authStateSource = new BehaviorSubject<number>(0);
    authState$ = this._authStateSource.asObservable();
    public token: string;
    public refreshToken: string;
    public user: string;
    private apiURL: string;

    constructor( private httpClient: HttpClient, @Inject(Window) private _window: Window, private router: Router) {
        // set token if saved in local storage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.refreshToken = currentUser && currentUser.refresh;
        this.user = currentUser && currentUser.user;
        const hostname = this._window.location.hostname.replace(/^(www\.)/, '' );
        this.apiURL = `${this._window.location.protocol}//${GlobalParams.API_SUBDOMEN}.${hostname}`;
    }
    changeAuthState(number) {
        this._authStateSource.next(number);
    }
    isLogged() {
        console.log('IsLogged start');
        if (!this.token) {
          this.router.navigate(['/login']);
          return false;
        }
        const jwtHelper: JwtHelper = new JwtHelper();
        if ( !(jwtHelper.isTokenExpired(this.token)) ) {
          console.log(jwtHelper.decodeToken(this.token));
          this.changeAuthState(1);
          return true;
        } else {
            // делаем попытку рефреша токенов
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const refreshed = this.refreshTokens(currentUser).subscribe(
              result => {
                this.changeAuthState(1);
                return true;
              },
              error => {
                console.log(error);
                this.logout();
              },
              () => {console.log('refreshTokens complete')}
            );
        }
    }
    login(username: string, password: string): Observable<any> {
        const body = {
            'username': username,
            'password': password
        };
        //TODO автоматически переключать url в зависимости от среды - dev или prod
        // const url = this.apiURL + '/' + GlobalParams.API_VERSION + '/' + GlobalParams.API_SUBDOMEN +  '/login';
        const url = 'http://api.agmsite.com/login';
        // console.log('!!!!!');
        // console.log(url);
        return this.httpClient.post(url, body).map((response: any) => {
            // login successful if there's a jwt token in the response
            const accessToken = response && response.access;
            const refreshToken = response && response.refresh;
            this.user = response && response.user;
            const jwtHelper: JwtHelper = new JwtHelper();
            if (accessToken) {
                // set token property
                this.token = accessToken;
                this.refreshToken = refreshToken;
                // store username and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem(
                    'currentUser',
                    JSON.stringify({ user: this.user, token: accessToken, refresh: refreshToken})
                );
                this.changeAuthState(1);
                // return true to indicate successful login
                return true;
            } else {
                // return errors list to indicate failed login
                return response && response.errors;
            }
        });
    }
  logout(): void {
    this.token = null;
    this.refreshToken = null;
    this.user = null;
    localStorage.removeItem('currentUser');
    this.changeAuthState(0);
  }
  refreshTokens(currentUser) {
        const body = {
            'token': this.token,
        };
        return this.httpClient.post(
          this.apiURL + '/' + GlobalParams.API_VERSION + '/' + GlobalParams.API_SUBDOMEN +  '/refresh', body
        ).map((response: any) => {
            const accessToken = response && response.access;
            // const username = accessToken && accessToken.username;
            const refreshToken = response && response.refresh;
            this.user = currentUser.user;
            const jwtHelper: JwtHelper = new JwtHelper();
            if (accessToken && refreshToken) {
                this.token = accessToken;
                this.refreshToken = refreshToken;
                localStorage.setItem(
                    'currentUser',
                    JSON.stringify({ user: this.user, token: accessToken, refresh: refreshToken})
                );
                this.changeAuthState(1);
                return true;
            } else {
                const errors = response && response.errors;
                this.logout();
                return false;
            }
        });
    }
    getAccessToken() {
        return this.token;
    }

    getRefreshToken() {
        return this.refreshToken;
    }
}
