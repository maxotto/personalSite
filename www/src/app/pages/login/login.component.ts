import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '../../router.animations';
import { AuthenticationService } from '../../@core/services';
import { AuthService } from 'angularx-social-login';
import { FacebookLoginProvider } from 'angularx-social-login';
import { SocialUser } from 'angularx-social-login';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [routerTransition()]
})
export class LoginComponent implements OnInit {
  model:  any = {};
  user: SocialUser;
  loading = false;
  private loggedIn: boolean;
  private fbError = '';
  private error = '';
  constructor(
      public router: Router,
      private authenticationService: AuthenticationService,
      private FBauthService: AuthService
  ) {}

  ngOnInit() {
    this.FBauthService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
    });
  }

  onLoggedin() {
      localStorage.setItem('isLoggedin', 'true');
  }

  login() {
      this.loading = true;
      this.authenticationService.login(this.model.username, this.model.password)
          .subscribe(
              result => {
                  if (result === true) {
                      this.router.navigate(['/home']);
                  } else {
                      if (result.hasOwnProperty('password')) {
                          this.error = result.password;
                      } else {
                          this.error = 'Что-то пошло не так!';
                      }
                      this.loading = false;
                  }
              },
              err => {
                  this.error = err.message;
                  console.log(err);
                  this.loading = false;
              },
              () => {console.log('Login finished'); }
          );
  }
  signInWithFB(): void {
    this.FBauthService.signIn(FacebookLoginProvider.PROVIDER_ID)
      .then(res => {
        console.log({res});
        this.router.navigate(['/home']);
      })
      .catch(error => {
        this.fbError = error;
      });

  }
}
