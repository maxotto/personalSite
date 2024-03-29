import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { FormsModule } from '@angular/forms'
import { HttpClientModule } from '@angular/common/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { HTTP_INTERCEPTORS } from '@angular/common/http'

import { AuthGuard } from './@core/guard/auth.guard'
import { TokenInterceptor } from './@core/services'
import { AuthenticationService } from './@core/services'

import { AppComponent } from './app.component'
import { NavbarComponent } from './components/navbar/navbar.component'
import { FooterComponent } from './components/footer/footer.component'

import { AppRoutingModule } from './app-routing.module'
import { HomeComponent } from './components/home/home.component'
import { YandexMailLoginFormComponent } from './components/yandex-mail-login-form/yandex-mail-login-form.component'
import { SidebarComponent } from './components/sidebar/sidebar.component'
import { NotFoundComponent } from './components/not-found/not-found.component'

import {
  SocialLoginModule,
  SocialAuthServiceConfig,
} from 'angularx-social-login'
import { FacebookLoginProvider } from 'angularx-social-login'

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    YandexMailLoginFormComponent,
    SidebarComponent,
    NotFoundComponent,
  ],
  imports: [
    BrowserModule,
    NgbModule,
    FontAwesomeModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    // AgmCoreModule.forRoot({
    //   apiKey: 'AIzaSyARIMiX_C7rE4U-pM6nih2n2z2z0YfhrfY',
    // }),
    SocialLoginModule,
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: true,
        providers: [
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider('973483776359176'),
          },
        ],
      },
    },
    { provide: Window, useValue: window },
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    AuthenticationService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
