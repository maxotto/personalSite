import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { YandexMailLoginFormComponent } from './yandex-mail-login-form.component'

describe('YandexMailLoginFormComponent', () => {
  let component: YandexMailLoginFormComponent
  let fixture: ComponentFixture<YandexMailLoginFormComponent>

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [YandexMailLoginFormComponent],
      }).compileComponents()
    })
  )

  beforeEach(() => {
    fixture = TestBed.createComponent(YandexMailLoginFormComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should be created', () => {
    expect(component).toBeTruthy()
  })
})
