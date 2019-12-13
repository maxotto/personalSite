import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FbLoginRoutingModule } from './fb-login-routing.module';
import { FbLoginComponent } from './fb-login.component';

@NgModule({
  declarations: [FbLoginComponent],
  imports: [
    CommonModule,
    FbLoginRoutingModule
  ]
})
export class FbLoginModule { }
