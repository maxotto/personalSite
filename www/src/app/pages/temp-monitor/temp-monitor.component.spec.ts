import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TempMonitorComponent } from './temp-monitor.component'

describe('TempMonitorComponent', () => {
  let component: TempMonitorComponent
  let fixture: ComponentFixture<TempMonitorComponent>

  beforeEach(async(() => {
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
