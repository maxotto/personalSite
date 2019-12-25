import { Component, OnInit } from '@angular/core'
import { AuthenticationService } from '../../@core/services'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  public user = ''
  private isNavbarCollapsed: boolean
  constructor(private auth: AuthenticationService) {}

  ngOnInit() {
    this.auth.isLogged()
  }
  public isLogged() {
    if (this.auth.token) {
      this.user = this.auth.user
      return true
    }
    if (this.auth.fbUser) {
      this.user = this.auth.fbUser.name
      return true
    }
    this.user = ''
    return false
  }
  public logout() {
    this.auth.logout()
  }
}
