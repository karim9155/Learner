import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class TrainerDashboardComponent implements OnInit {
  courseForm: FormGroup;
  videoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private authService: AuthService,
    private router: Router
  ) {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.videoForm = this.fb.group({
      courseId: ['', Validators.required],
      title: ['', Validators.required],
      url: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  createCourse(): void {
    if (this.courseForm.valid) {
      this.courseService.createCourse(this.courseForm.value).subscribe(
        (response) => {
          console.log('Course created successfully', response);
          this.courseForm.reset();
        },
        (error) => {
          console.error('Course creation failed', error);
        }
      );
    }
  }

  addVideo(): void {
    if (this.videoForm.valid) {
      const courseId = this.videoForm.value.courseId;
      const videoData = {
        title: this.videoForm.value.title,
        url: this.videoForm.value.url
      };
      this.courseService.addVideo(courseId, videoData).subscribe(
        (response) => {
          console.log('Video added successfully', response);
          this.videoForm.reset();
        },
        (error) => {
          console.error('Video addition failed', error);
        }
      );
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
