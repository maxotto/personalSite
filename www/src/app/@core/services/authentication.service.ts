import { map } from 'rxjs/operators'
import { Inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, BehaviorSubject } from 'rxjs'
import { GlobalParams } from '../../params'
import { coreUrls } from '../../params'
import { JwtHelper } from '../jwt/jwtHelper'
import { Router } from '@angular/router'
import { isDevMode } from '@angular/core'
import { SocialAuthService } from 'angularx-social-login'
import { SocialUser } from 'angularx-social-login'

@Injectable()
export class AuthenticationService {
  // http://plnkr.co/edit/XqwwUM44NQEpxQVFFxNW?p=preview
  private _authStateSource = new BehaviorSubject<number>(0)
  authState$ = this._authStateSource.asObservable()
  public token: string
  public refreshToken: string
  public user: string
  public fbUser: SocialUser
  private apiURL: string
  private protocol: string

  constructor(
    private httpClient: HttpClient,
    @Inject(Window) private _window: Window,
    private router: Router,
    private fbAuthService: SocialAuthService
  ) {
    // set token if saved in local storage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))
    this.token = currentUser && currentUser.token
    this.refreshToken = currentUser && currentUser.refresh
    this.user = currentUser && currentUser.user
    const { protocol, hostname, apiURL } = coreUrls(this._window)
    this.apiURL = apiURL
    this.protocol = protocol
    let mode = 'PROD'
    if (isDevMode()) {
      mode = 'DEV'
      console.log(`Use ${hostname} as backend hostname in ${mode} Mode`)
    }
    // Check FaceBook login state
    this.fbAuthService.authState.subscribe(user => {
      this.fbUser = user
    })
  }
  changeAuthState(number) {
    this._authStateSource.next(number)
  }
  isLogged() {
    if (!this.token || !this.fbUser) {
      this.router.navigate(['/home'])
      return false
    }
    if (this.fbUser) {
      console.log('this.fbUser => ', this.fbUser)
      this.changeAuthState(1)
      return true
    }
    const jwtHelper: JwtHelper = new JwtHelper()
    if (!jwtHelper.isTokenExpired(this.token)) {
      console.log(jwtHelper.decodeToken(this.token))
      this.changeAuthState(1)
      return true
    } else {
      // делаем попытку рефреша токенов
      const currentUser = JSON.parse(localStorage.getItem('currentUser'))
      this.refreshTokens(currentUser).subscribe(
        () => {
          this.changeAuthState(1)
          return true
        },
        error => {
          console.log(error)
          this.logout()
        },
        () => {
          console.log('refreshTokens complete')
        }
      )
    }
  }
  login(username: string, password: string): Observable<any> {
    const body = {
      username: username,
      password: password,
    }
    const url =
      this.protocol +
      '//' +
      this.apiURL +
      '/' +
      GlobalParams.API_VERSION +
      '/' +
      GlobalParams.API_SUBDOMEN +
      '/login'
    return this.httpClient.post(url, body).pipe(
      map((response: any) => {
        // login successful if there's a jwt token in the response
        const accessToken = response && response.access
        const refreshToken = response && response.refresh
        this.user = response && response.user
        if (accessToken) {
          // set token property
          this.token = accessToken
          this.refreshToken = refreshToken
          // store username and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem(
            'currentUser',
            JSON.stringify({
              user: this.user,
              token: accessToken,
              refresh: refreshToken,
            })
          )
          this.changeAuthState(1)
          // return true to indicate successful login
          return true
        } else {
          // return errors list to indicate failed login
          return response && response.errors
        }
      })
    )
  }
  logout(): void {
    this.token = null
    this.refreshToken = null
    this.user = null
    localStorage.removeItem('currentUser')
    this.fbAuthService.signOut()
    this.changeAuthState(0)
  }
  refreshTokens(currentUser) {
    const body = {
      token: this.token,
    }
    return this.httpClient
      .post(
        this.apiURL +
          '/' +
          GlobalParams.API_VERSION +
          '/' +
          GlobalParams.API_SUBDOMEN +
          '/refresh',
        body
      )
      .pipe(
        map((response: any) => {
          const accessToken = response && response.access
          // const username = accessToken && accessToken.username;
          const refreshToken = response && response.refresh
          this.user = currentUser.user
          if (accessToken && refreshToken) {
            this.token = accessToken
            this.refreshToken = refreshToken
            localStorage.setItem(
              'currentUser',
              JSON.stringify({
                user: this.user,
                token: accessToken,
                refresh: refreshToken,
              })
            )
            this.changeAuthState(1)
            return true
          } else {
            const errors = response && response.errors
            console.error({ errors })
            this.logout()
            return false
          }
        })
      )
  }
  getAccessToken() {
    return this.token
  }

  getRefreshToken() {
    return this.refreshToken
  }
}
