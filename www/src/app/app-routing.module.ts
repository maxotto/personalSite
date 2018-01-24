import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './@core/guard/auth.guard';
import { HomeComponent} from './components/home/home.component';
import { NotFoundComponent} from './components/not-found/not-found.component';

const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'login', loadChildren: './pages/login/login.module#LoginModule' },
    { path: 'gallery', loadChildren: './pages/photo-gallery/photo-gallery.module#PhotoGalleryModule', canLoad: [AuthGuard]  },
    { path: 'not-found', component: NotFoundComponent},
    { path: '**', redirectTo: 'not-found' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
