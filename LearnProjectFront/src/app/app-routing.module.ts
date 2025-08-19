import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './admin/dashboard/dashboard.component';
import { TrainerDashboardComponent } from './trainer/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  // 1. Specific routes first
  { path: 'login', component: LoginComponent },
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'trainer/dashboard',
    component: TrainerDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'trainer' }
  },
  // 2. Lazy-loaded module route
  {
    path: 'learner',
    loadChildren: () => import('./learner/learner.module').then(m => m.LearnerModule)
  },

  // 3. Default route for the root path
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // 4. Wildcard route MUST be last
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
