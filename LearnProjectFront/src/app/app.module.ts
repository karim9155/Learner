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

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    TrainerDashboardComponent,
    AdminDashboardComponent
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
        BrowserAnimationsModule

    ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
