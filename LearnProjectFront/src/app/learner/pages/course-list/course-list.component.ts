import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Learner, LearnerDataService } from '../../../services/learner-data.service';

interface Course {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  videoCount?: number;
  duration?: string;
  enrolledCount?: number;
  progress?: number;
}

@Component({
  selector: 'app-course-list',
  standalone: false,
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css']
})
export class CourseListComponent implements OnInit {
  learner: Learner | null = null;
  isLoading = true;

  // Mock course images - in a real app, these would come from your backend
  courseImages = [
    "https://images.unsplash.com/photo-1699495592088-f63b5d1b1e83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMGNvdXJzZSUyMGVkdWNhdGlvbnxlbnwxfHx8fDE3NTYxMTMyNzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1518818608552-195ed130cdf4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMGNvdXJzZXxlbnwxfHx8fDE3NTYwMzA4NTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1584143257261-e16224e2c9df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFpbmluZyUyMHdvcmtzaG9wJTIwbGVhcm5pbmd8ZW58MXx8fHwxNzU2MTEzMjg5fDA&ixlib=rb-4.1.0&q=80&w=1080"
  ];

  constructor(
    private learnerDataService: LearnerDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLearnerData();
  }

  private loadLearnerData(): void {
    // Simulate loading delay
    setTimeout(() => {
      this.learner = this.learnerDataService.getLearnerSnapshot();

      if (!this.learner) {
        // If there's no learner data, redirect back to login
        this.router.navigate(['/learner/login']);
        return;
      }

      // Add mock data for enhanced display
      this.enhanceCourseData();
      this.isLoading = false;
    }, 500);
  }

  private enhanceCourseData(): void {
    if (this.learner?.enrolledCourses) {
      this.learner.enrolledCourses = this.learner.enrolledCourses.map((course, index) => ({
        ...course,
        videoCount: course.videoCount || Math.floor(Math.random() * 15) + 5,
        duration: this.generateDuration(),
        enrolledCount: course.enrolledCount || Math.floor(Math.random() * 100) + 10,
        progress: Math.floor(Math.random() * 100),
        coverImage: course.coverImage || this.getCourseImage(index)
      }));
    }
  }

  private generateDuration(): string {
    const hours = Math.floor(Math.random() * 8) + 1;
    const minutes = Math.floor(Math.random() * 60);
    return `${hours}h ${minutes}m`;
  }

  getCourseImage(index: number): string {
    return this.courseImages[index % this.courseImages.length];
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return 'progress-green';
    if (progress >= 50) return 'progress-blue';
    if (progress >= 20) return 'progress-yellow';
    return 'progress-gray';
  }

  playCourse(courseId: string): void {
    this.router.navigate(['/learner/play', courseId]);
  }

  onBackClick(): void {
    this.router.navigate(['/learner/login']);
  }

  onContactAdmin(): void {
    // Could implement a help or contact feature
    alert('Contact your administrator for course enrollment');
  }

  getTotalVideos(): number {
    if (!this.learner?.enrolledCourses) return 0;
    return this.learner.enrolledCourses.reduce((total, course) => total + (course.videoCount || 0), 0);
  }

  getFirstName(): string {
    if (!this.learner?.name) return '';
    return this.learner.name.split(' ')[0];
  }

  getUserInitial(): string {
    if (!this.learner?.name) return '?';
    return this.learner.name.charAt(0).toUpperCase();
  }

  // Track by function for ngFor performance
  trackByCourseId(index: number, course: Course): string {
    return course.id;
  }

  // Check if learner has courses
  get hasCourses(): boolean {
    return !!(this.learner?.enrolledCourses && this.learner.enrolledCourses.length > 0);
  }

  // Get course count
  get courseCount(): number {
    return this.learner?.enrolledCourses?.length || 0;
  }
}
