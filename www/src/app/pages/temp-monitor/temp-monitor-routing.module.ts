import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { TempMonitorComponent } from './temp-monitor.component'

const routes: Routes = [{ path: '', component: TempMonitorComponent }]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TempMonitorRoutingModule {}
