import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import { GlobalParams } from '../../params';
import { JwtHelper } from '../jwt/jwtHelper';

@Injectable()
export class AuthenticationService {
    // http://plnkr.co/edit/XqwwUM44NQEpxQVFFxNW?p=preview
    private _authStateSource = new BehaviorSubject<number>(0);
    authState$ = this._authStateSource.asObservable();
    public token: string;
    public refreshToken: string;
    public userLabel: string;
    private apiURL: string;

    constructor( private httpClient: HttpClient, @Inject(Window) private _window: Window) {
        // set token if saved in local storage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.refreshToken = currentUser && currentUser.refresh;
        this.userLabel = currentUser && currentUser.userLabel;
        const hostname = this._window.location.hostname.replace(/^(www\.)/,'' );
        this.apiURL = `${this._window.location.protocol}//${GlobalParams.API_SUBDOMEN}.${hostname}`;
        console.log(this._window.location);
    }
    changeAuthState(number) {
        this._authStateSource.next(number);
    }
    isLogged() {
        const jwtHelper: JwtHelper = new JwtHelper();
        if ( !(jwtHelper.isTokenExpired(this.token)) ) {
            this.changeAuthState(1);
            return true;
        } else {
            // делаем попытку рефреша токенов
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const refreshed = this.refreshTokens(currentUser);
            if (refreshed) {
                this.changeAuthState(1);
                return true;
            }
            this.logout();
            return false;
        }
    }
    login(username: string, password: string): Observable<any> {
        const body = {
            'username': username,
            'password': password
        };
        const url = this.apiURL + '/v1/api/login';
        // const url = 'http://api.agmsite.com/login';
        console.log("!!!!!");
        console.log(url);
        return this.httpClient.post(url, body).map((response: any) => {
            // login successful if there's a jwt token in the response
            const accessToken = response && response.access;
            const refreshToken = response && response.refresh;
            const routes = response && response.routes;
            const userLabel = response && response.userLabel;
            this.userLabel = userLabel;
            const jwtHelper: JwtHelper = new JwtHelper();
            if (accessToken) {
                // set token property
                this.token = accessToken;
                this.refreshToken = refreshToken;
                // store username and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem(
                    'currentUser',
                    JSON.stringify({ username: username, userLabel: userLabel, token: accessToken, refresh: refreshToken, routes: routes})
                );
                this.changeAuthState(1);
                // return true to indicate successful login
                return true;
            } else {
                const errors = response && response.errors;
                // return errors list to indicate failed login
                return errors;
            }
        });
    }
    refreshTokens(currentUser) {
        const body = {
            'token': this.token,
        };
        return this.httpClient.post(this.apiURL + 'refresh', body).map((response: any) => {
            const accessToken = response && response.access;
            // const username = accessToken && accessToken.username;
            const refreshToken = response && response.refresh;
            const routes = response && response.routes;
            const userLabel = currentUser.userLabel;
            this.userLabel = userLabel;
            const username = currentUser.username;
            const jwtHelper: JwtHelper = new JwtHelper();
            if (accessToken) {
                this.token = accessToken;
                this.refreshToken = refreshToken;
                localStorage.setItem(
                    'currentUser',
                    JSON.stringify({ username: username, userLabel: userLabel, token: accessToken, refresh: refreshToken, routes: routes})
                );
                this.changeAuthState(1);
                return true;
            } else {
                const errors = response && response.errors;
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

    logout(): void {
        this.token = null;
        this.refreshToken = null;
        this.userLabel = null;
        localStorage.removeItem('currentUser');
        this.changeAuthState(0);
    }
}