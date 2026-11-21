import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { CourseListComponent } from './components/dashboard-courses/course-list/course-list.component';
import { DashboardCoursesComponent } from './components/dashboard-courses/dashboard-courses.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { LoginComponent } from './components/login/login.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'lecture', pathMatch: 'full', redirectTo: 'my/courses' },
  {
    path: '',
    component: DashboardComponent,
    canActivateChild: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardCoursesComponent, data: { view: 'dashboard' } },
      { path: 'my/courses', component: DashboardCoursesComponent, data: { view: 'courses' } },
      { path: 'my/courses/:id', component: CourseListComponent },
      { path: 'my/progress', component: DashboardCoursesComponent, data: { view: 'progress' } },
    ],
  },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
