import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
// import { AgmCoreModule } from '@agm/core'
import { GoogleMapsComponent } from './google-maps.component'
import { GoogleMapsRoutingModule } from './google-maps-routing.module'

@NgModule({
  imports: [
    CommonModule,
    // AgmCoreModule.forRoot({
    //   apiKey: 'AIzaSyARIMiX_C7rE4U-pM6nih2n2z2z0YfhrfY',
    // }),
    GoogleMapsRoutingModule,
  ],
  declarations: [GoogleMapsComponent],
})
export class GoogleMapsModule {}
