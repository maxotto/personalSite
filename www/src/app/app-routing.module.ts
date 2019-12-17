import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './@core/guard/auth.guard';
import { HomeComponent } from './components/home/home.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule) },
  { path: 'map',
    loadChildren: () => import('./pages/google-maps/google-maps.module').then(m => m.GoogleMapsModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  { path: 'about', loadChildren: () => import('./pages/about/about.module').then(m => m.AboutModule) },
  { path: 'gallery',
    loadChildren: () => import('./pages/photo-gallery/photo-gallery.module').then(m => m.PhotoGalleryModule),
    canLoad: [AuthGuard]
  },
  { path: 'tmonitor',
    loadChildren: () => import('./pages/temp-monitor/temp-monitor.module').then(m => m.TempMonitorModule),
    canLoad: [AuthGuard]
  },
  { path: 'ipcamera',
    loadChildren: () => import('./pages/ipcamera/ipcamera.module').then(m => m.IpcameraModule),
    canLoad: [AuthGuard]
  },
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: 'not-found' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
