import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TempMonitorComponent } from './temp-monitor.component';
import { TempMonitorRoutingModule } from './temp-monitor-routing.module';
import { ThingSpeakService } from '../../@core/services/thing-speak.service';

@NgModule({
  imports: [
    CommonModule,
    TempMonitorRoutingModule
  ],
  declarations: [TempMonitorComponent],
  providers: [ThingSpeakService]
})
export class TempMonitorModule { }
