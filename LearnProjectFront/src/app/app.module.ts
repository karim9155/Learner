import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { JwtInterceptor } from './services/jwt.interceptor';
import {CommonModule} from '@angular/common';
import {AdminDashboardComponent} from './admin/dashboard/dashboard.component';
import {MatPaginator} from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatCheckbox, MatCheckboxModule} from '@angular/material/checkbox';
import {MatList, MatListItem, MatListModule} from '@angular/material/list';
import {MatDialogActions, MatDialogContent, MatDialogModule, MatDialogTitle} from '@angular/material/dialog';
import {MatButton, MatButtonModule} from '@angular/material/button';
import {EnrollModalComponent} from './admin/components/enroll-modal/enroll-modal.component';
import {PhoneLoginComponent} from './learner/pages/phone-login/phone-login.component';
import {CourseListComponent} from './learner/pages/course-list/course-list.component';
import {VideoScrollerComponent} from './learner/pages/video-scroller/video-scroller.component';
import {LearnerRoutingModule} from './learner/learner-routing.module';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatProgressBar} from '@angular/material/progress-bar';
import {QRCodeComponent} from 'angularx-qrcode';
import {TrainerDashboardComponent} from './trainer/dashboard/dashboard.component';
import {CoursePreviewComponent} from './trainer/course-preview/course-preview.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    TrainerDashboardComponent,
    AdminDashboardComponent,
    EnrollModalComponent,
    PhoneLoginComponent,
    CourseListComponent,
    VideoScrollerComponent,
    CoursePreviewComponent


  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    CommonModule,
    MatPaginator,
    AppRoutingModule, // Provides <router-outlet>
    CommonModule,     // Provides *ngIf, *ngFor, [ngClass], etc.
    FormsModule,      // Provides [(ngModel)]
    ReactiveFormsModule,
    MatPaginatorModule, // Provides <mat-paginator>
    BrowserAnimationsModule,
    CommonModule,
    MatCheckbox,
    ReactiveFormsModule,
    MatListItem,
    MatList,
    MatDialogContent,
    MatDialogTitle,
    MatDialogActions,
    MatButton,
    CommonModule,
    LearnerRoutingModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule,
    MatProgressBar,
    QRCodeComponent,
    MatProgressBar



  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
