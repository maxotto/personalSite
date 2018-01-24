import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoGalleryComponent } from './photo-gallery.component';
import { PhotoGalleryRoutingModule } from './photo-gallery-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthGuard } from '../../@core/guard/auth.guard';

@NgModule({
  imports: [
    CommonModule,
    PhotoGalleryRoutingModule,
    NgbModule,
  ],
  declarations: [PhotoGalleryComponent],
  providers: [AuthGuard]
})
export class PhotoGalleryModule { }
