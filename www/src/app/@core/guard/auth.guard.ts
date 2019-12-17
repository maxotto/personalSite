import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Route } from '@angular/router';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { JwtHelper } from '../jwt/jwtHelper';
import { AuthenticationService } from '../services';
import {SocialUser} from 'angularx-social-login';

@Injectable()
export class AuthGuard implements CanActivate, CanLoad {

  constructor(private router: Router, private auth: AuthenticationService) { }

    canLoad(route: Route) {
      if (this.checkLocalLogged() || this.checkFbLogged()) {
        return true;
      }
      this.router.navigate(['/login']);
      return false;
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      if (this.checkLocalLogged() || this.checkFbLogged()) {
        return true;
      }
      this.router.navigate(['/login']);
      return false;
    }

    checkLocalLogged() {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
        return false;
      }
      const jwtHelper: JwtHelper = new JwtHelper();
      const token = currentUser && currentUser.token;
      const tokenIsExpired = jwtHelper.isTokenExpired(token);
      if (currentUser && !tokenIsExpired) {
        return true;
      }
      if (tokenIsExpired) {
        // check refresh token
        const refreshToken = currentUser && currentUser.refresh;
        const refreshTokenIsExpired = jwtHelper.isTokenExpired(refreshToken);
        if (currentUser && !refreshTokenIsExpired) {
          // refresh both tokens at once
          return this.auth.refreshTokens(currentUser);
        } else {
          return false;            }
      }
    }

    checkFbLogged() {
        const fbUser: SocialUser = this.auth.fbUser;
        return !!fbUser;
    }
}
