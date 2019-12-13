import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FbLoginComponent } from './fb-login.component';

const routes: Routes = [
  { path: '', component: FbLoginComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FbLoginRoutingModule { }
