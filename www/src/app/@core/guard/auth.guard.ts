import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { JwtHelper } from '../jwt/jwtHelper';
import { AuthenticationService } from '../services';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router, private auth: AuthenticationService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            this.router.navigate(['/login']);
            return false;
        }
        // todo console.log(state.url); // 'Это тот роут, куда мы хотим попасть. Его надо проверить на доступность'
        const jwtHelper: JwtHelper = new JwtHelper();
        const token = currentUser && currentUser.token;
        const routes = currentUser && currentUser.routes;
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
                this.router.navigate(['/login']);
                return false;            }
        }
    }
}
