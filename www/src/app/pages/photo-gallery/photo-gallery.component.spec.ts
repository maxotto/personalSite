import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { PhotoGalleryComponent } from './photo-gallery.component'

describe('PhotoGalleryComponent', () => {
  let component: PhotoGalleryComponent
  let fixture: ComponentFixture<PhotoGalleryComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PhotoGalleryComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotoGalleryComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
