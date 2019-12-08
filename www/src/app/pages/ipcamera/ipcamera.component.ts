import {Component, OnInit, ViewChild} from '@angular/core';
import {NgbCarousel} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-ipcamera',
  templateUrl: './ipcamera.component.html',
  styleUrls: ['./ipcamera.component.css']
})
export class IpcameraComponent implements OnInit {
  @ViewChild('carousel', { static: false }) carousel: NgbCarousel;
  hash: number;

  constructor() {
    const time = new Date();
    this.hash = time.getTime();
  }

  ngOnInit() {
    this.carousel.pause();
    console.log(this.carousel);
  }

}
