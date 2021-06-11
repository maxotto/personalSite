import { Component, OnInit } from '@angular/core';
import { faCog } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-yandex-mail-login-form',
  templateUrl: './yandex-mail-login-form.component.html',
  styleUrls: ['./yandex-mail-login-form.component.css'],
})
export class YandexMailLoginFormComponent implements OnInit {
  public faCog = faCog;
  constructor() { }

  ngOnInit() { }
}
