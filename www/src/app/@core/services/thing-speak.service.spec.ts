import { TestBed, inject } from '@angular/core/testing'

import { ThingSpeakService } from './thing-speak.service'

describe('ThingSpeakService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ThingSpeakService],
    })
  })

  it('should be created', inject(
    [ThingSpeakService],
    (service: ThingSpeakService) => {
      expect(service).toBeTruthy()
    }
  ))
})
