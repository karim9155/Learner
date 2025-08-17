import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { JwtInterceptor } from './services/jwt.interceptor';
import {TrainerDashboardComponent} from './trainer/dashboard/dashboard.component';
import {CommonModule} from '@angular/common';
import {AdminDashboardComponent} from './admin/dashboard/dashboard.component';
import {MatPaginator} from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatList, MatListItem} from '@angular/material/list';
import {MatDialogActions, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {EnrollModalComponent} from './admin/components/enroll-modal/enroll-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    TrainerDashboardComponent,
    AdminDashboardComponent,
    EnrollModalComponent

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
        MatButton

    ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
