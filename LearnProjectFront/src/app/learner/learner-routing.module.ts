import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PhoneLoginComponent } from './pages/phone-login/phone-login.component';
import { CourseListComponent } from './pages/course-list/course-list.component';
import { VideoScrollerComponent } from './pages/video-scroller/video-scroller.component';
import { LearnerGuard } from './guards/learner.guard'; // <-- IMPORT THE NEW GUARD

const routes: Routes = [
  {
    path: 'login',
    component: PhoneLoginComponent // This page is public
  },
  {
    path: 'courses',
    component: CourseListComponent,
    canActivate: [LearnerGuard] // <-- PROTECT THIS ROUTE
  },
  {
    path: 'play/:courseId',
    component: VideoScrollerComponent,
    canActivate: [LearnerGuard] // <-- PROTECT THIS ROUTE
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LearnerRoutingModule { }
