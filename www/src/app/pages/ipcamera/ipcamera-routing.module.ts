import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { IpcameraComponent } from './ipcamera.component'

const routes: Routes = [{ path: '', component: IpcameraComponent }]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IpcameraRoutingModule {}
