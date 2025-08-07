import { Component, OnInit } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  courses: any[] = [];

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.courseService.getAllCourses().subscribe(
      (response) => {
        this.courses = response.map((course: any) => ({ ...course, showVideos: false }));
      },
      (error) => {
        console.error('Failed to load courses', error);
      }
    );
  }

  toggleVideos(course: any): void {
    course.showVideos = !course.showVideos;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
