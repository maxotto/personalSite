import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { PhotoGalleryComponent } from './photo-gallery.component'

const routes: Routes = [{ path: '', component: PhotoGalleryComponent }]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PhotoGalleryRoutingModule {}
