import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { IpcameraComponent } from './ipcamera.component'
import { IpcameraRoutingModule } from './ipcamera-routing.module'

import { NgbModule } from '@ng-bootstrap/ng-bootstrap'

@NgModule({
  imports: [CommonModule, IpcameraRoutingModule, NgbModule],
  declarations: [IpcameraComponent],
})
export class IpcameraModule {}
