import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './@core/guard/auth.guard';
import { HomeComponent} from './components/home/home.component';
import { NotFoundComponent} from './components/not-found/not-found.component';

const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'login', loadChildren: './pages/login/login.module#LoginModule' },
    { path: 'map', loadChildren: './pages/google-maps/google-maps.module#GoogleMapsModule', canLoad: [AuthGuard] , canActivate: [AuthGuard] },
    { path: 'about', loadChildren: './pages/about/about.module#AboutModule'},
    { path: 'gallery', loadChildren: './pages/photo-gallery/photo-gallery.module#PhotoGalleryModule', canLoad: [AuthGuard]  },
    { path: 'tmonitor', loadChildren: './pages/temp-monitor/temp-monitor.module#TempMonitorModule', canLoad: [AuthGuard]  },
    { path: 'ipcamera', loadChildren: './pages/ipcamera/ipcamera.module#IpcameraModule', canLoad: [AuthGuard]  },
    { path: 'not-found', component: NotFoundComponent},
    { path: '**', redirectTo: 'not-found' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
