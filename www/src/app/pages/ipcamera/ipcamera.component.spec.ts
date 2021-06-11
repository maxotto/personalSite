import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { IpcameraComponent } from './ipcamera.component'

describe('IpcameraComponent', () => {
  let component: IpcameraComponent
  let fixture: ComponentFixture<IpcameraComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [IpcameraComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(IpcameraComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
