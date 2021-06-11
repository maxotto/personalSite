import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { TempMonitorComponent } from './temp-monitor.component'

describe('TempMonitorComponent', () => {
  let component: TempMonitorComponent
  let fixture: ComponentFixture<TempMonitorComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TempMonitorComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TempMonitorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
