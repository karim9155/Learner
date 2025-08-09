import { Component, OnInit } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
    private router: Router,
    private sanitizer: DomSanitizer
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
    if (course.showVideos && !course.videos) { // Only fetch if showing and videos aren't loaded
      this.courseService.getVideosByCourse(course.id).subscribe(
        (videos) => {
          course.videos = videos;
        },
        (error) => {
          console.error(`Failed to load videos for course ${course.id}`, error);
        }
      );
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getEmbedUrl(url: string): SafeResourceUrl {
    if (!url) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }

    let videoId: string | undefined;

    if (url.includes('watch?v=')) {
      videoId = url.split('v=')[1];
      const ampersandPosition = videoId.indexOf('&');
      if (ampersandPosition !== -1) {
        videoId = videoId.substring(0, ampersandPosition);
      }
    } else if (url.includes('youtu.be/') || url.includes('/shorts/')) {
      const urlParts = url.split('/');
      videoId = urlParts[urlParts.length - 1];
      const queryIndex = videoId.indexOf('?');
      if (queryIndex !== -1) {
        videoId = videoId.substring(0, queryIndex);
      }
    }

    if (videoId) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + videoId);
    }

    // Return a blank URL if no valid ID could be extracted
    return this.sanitizer.bypassSecurityTrustResourceUrl('');
  }
}
