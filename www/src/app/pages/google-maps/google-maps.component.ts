import { Component, OnInit } from '@angular/core'
// import { MouseEvent } from '@agm/core'
// import { Marker } from '@agm/core/services/google-maps-types'

@Component({
  selector: 'app-google-maps',
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.css'],
})
export class GoogleMapsComponent implements OnInit {
  lat = 55.755861357594476
  lng = 37.620451732869014
  zoom = 15
  height = 800
  constructor() { }

  ngOnInit() {
    this.height = window.innerHeight - 145
  }
  // dragEnd(m: Marker, $event: any) {
  //   alert(
  //     'Новые координаты: lat->' +
  //       $event.coords.lat +
  //       ', lng->' +
  //       $event.coords.lng
  //   )
  //   console.log('dragEnd', m, $event)
  // }
  onResize(event) {
    // console.log(event);
    // console.log(event.target);
    this.height = event.target.innerHeight - 145
  }
}
