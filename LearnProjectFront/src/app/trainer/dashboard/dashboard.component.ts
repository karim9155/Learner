import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Course {
  id: string;
  title: string;
  description: string;
  trainerEmail: string;
  createdAt?: string;
  videoCount?: number;
  videos?: Video[];
}

interface Video {
  id: string;
  title: string;
  youtubeUrl: string;
  courseId: string;
  createdAt?: string;
}

interface CreateCourseData {
  title: string;
  description: string;
}

interface AddVideoData {
  courseId: string;
  title: string;
  youtubeUrl: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class TrainerDashboardComponent implements OnInit {
  courseForm: FormGroup;
  videoForm: FormGroup;
  myCourses: Course[] = [];
  darkMode: boolean = false;
  sidebarCollapsed: boolean = false;
  activeSection: string = 'dashboard';
  isLoading: boolean = false;

  lightLogo: string = 'assets/images/learn-logo-light.png';
  darkLogo: string = 'assets/images/learn-logo-dark.png';

  trainerUser = { id: '', name: '', email: '', role: '' };
  isCreatingCourse = false;
  isAddingVideo = false;
  private coursesLoaded: boolean = false;

  get courseFormControls() { return this.courseForm.controls; }
  get videoFormControls() { return this.videoForm.controls; }
  get isCourseFormValid() { return this.courseForm.valid; }
  get isVideoFormValid() { return this.videoForm.valid; }

  courseCreationMessage: string = '';
  videoAdditionMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.videoForm = this.fb.group({
      courseId: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(3)]],
      url: ['', [Validators.required, this.youtubeUrlValidator]]
    });
  }

  ngOnInit(): void {
    const savedDarkMode = localStorage.getItem('trainerDashboardDarkMode');
    if (savedDarkMode === 'true') {
      this.darkMode = true;
      document.documentElement.classList.add('dark');
    }

    const savedSidebarState = localStorage.getItem('trainerSidebarCollapsed');
    if (savedSidebarState === 'true') {
      this.sidebarCollapsed = true;
    }

    this.loadTrainerInfo();
    // Initialize coursesLoaded to false and load courses on component initialization
    this.coursesLoaded = false;
    this.loadMyCourses();
  }

  youtubeUrlValidator(control: any) {
    if (!control.value) return null;

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/|youtube\.com\/shorts\/)[\w-]+(&[\w=]*)?$/;
    return youtubeRegex.test(control.value) ? null : { invalidYouTubeUrl: true };
  }

  loadTrainerInfo(): void {
    const userInfo = this.authService.getCurrentUser();
    console.log('User info from token:', userInfo); // Debugging message
    if (userInfo) {
      this.trainerUser = {
        id: userInfo.sub || '',
        name: userInfo.name || 'Trainer User',
        email: userInfo.email || 'trainer@company.com',
        role: userInfo.role || 'Trainer'
      };
    }
  }

  loadMyCourses(): void {
    // Prevent multiple API calls if we already have the data
    if (this.coursesLoaded) {
      return;
    }

    this.isLoading = true;
    console.log("Attempting to load courses for trainer ID:", this.trainerUser.id);

    if (this.trainerUser && this.trainerUser.id) {
      this.courseService.getCoursesByTrainer(this.trainerUser.id).subscribe({
        next: (courses) => {
          console.log("SUCCESS: Courses received from API:", courses);
          this.myCourses = courses.map((course: any) => ({
            ...course,
            videoCount: 0
          }));
          this.coursesLoaded = true; // Mark as loaded
          this.myCourses.forEach(course => {
            this.loadCourseVideoCount(course);
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('ERROR: Failed to load courses', error);
          this.isLoading = false;
        }
      });
    } else {
      console.error('ERROR: Trainer ID was not available when loading courses.');
      this.isLoading = false;
    }
  }

  loadCourseVideoCount(course: Course): void {
    this.courseService.getVideosByCourse(course.id).subscribe({
      next: (videos) => {
        course.videoCount = videos.length;
        course.videos = videos;
      },
      error: (error) => {
        console.error(`Failed to load videos for course ${course.id}`, error);
      }
    });
  }

  getCourseFieldError(fieldName: string): string {
    const field = this.courseForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`;
    }
    return '';
  }

  getVideoFieldError(fieldName: string): string {
    const field = this.videoForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`;
    }
    if (field?.hasError('invalidYouTubeUrl')) {
      return 'Please enter a valid YouTube URL';
    }
    return '';
  }

  createCourse(): void {
    if (this.courseForm.valid) {
      this.isCreatingCourse = true;
      this.courseCreationMessage = '';

      const courseData: CreateCourseData = {
        title: this.courseFormControls['title'].value,
        description: this.courseFormControls['description'].value
      };

      this.courseService.createCourse(courseData).subscribe({
        next: (response) => {
          console.log('Course created successfully', response);
          this.courseCreationMessage = 'Course created successfully!';
          this.courseForm.reset();
          this.loadMyCourses();

          setTimeout(() => {
            this.courseCreationMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Course creation failed', error);
          this.courseCreationMessage = 'Failed to create course. Please try again.';
        },
        complete: () => {
          this.isCreatingCourse = false;
        }
      });
    } else {
      this.courseForm.markAllAsTouched();
    }
  }

  addVideo(): void {
    if (this.videoForm.valid) {
      this.isAddingVideo = true;
      this.videoAdditionMessage = '';

      const videoData: AddVideoData = {
        courseId: this.videoFormControls['courseId'].value,
        title: this.videoFormControls['title'].value,
        youtubeUrl: this.videoFormControls['url'].value
      };

      this.courseService.addVideo(videoData).subscribe({
        next: (response) => {
          console.log('Video added successfully', response);
          this.videoAdditionMessage = 'Video added successfully!';
          this.videoForm.reset();
          this.loadMyCourses();

          setTimeout(() => {
            this.videoAdditionMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Video addition failed', error);
          this.videoAdditionMessage = 'Failed to add video. Please try again.';
        },
        complete: () => {
          this.isAddingVideo = false;
        }
      });
    } else {
      this.videoForm.markAllAsTouched();
    }
  }

  selectCourseForVideo(courseId: string): void {
    this.videoForm.patchValue({ courseId: courseId });
    this.setActiveSection('videos');
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

    return this.sanitizer.bypassSecurityTrustResourceUrl('');
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;

    if (this.darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('trainerDashboardDarkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('trainerDashboardDarkMode', 'false');
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem('trainerSidebarCollapsed', this.sidebarCollapsed.toString());
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
    console.log(`Switched to section: ${section}`); // Debugging message
    if (section === 'my-courses') {
      this.loadMyCourses();
    }
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  getTotalCourses(): number {
    return this.myCourses.length;
  }

  getTotalVideos(): number {
    return this.myCourses.reduce((total, course) => {
      return total + (course.videoCount || 0);
    }, 0);
  }

  getRecentCourses(): Course[] {
    return this.myCourses.slice(0, 3);
  }

  deleteCourse(courseId: string): void {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      this.courseService.deleteCourse(courseId).subscribe({
        next: () => {
          this.myCourses = this.myCourses.filter(course => course.id !== courseId);
          console.log('Course deleted successfully');
        },
        error: (error) => {
          console.error('Failed to delete course', error);
          alert('Failed to delete course. Please try again.');
        }
      });
    }
  }

  deleteVideo(videoId: string, courseId: string): void {
    if (confirm('Are you sure you want to delete this video?')) {
      this.courseService.deleteVideo(videoId).subscribe({
        next: () => {
          const course = this.myCourses.find(c => c.id === courseId);
          if (course && course.videos) {
            course.videos = course.videos.filter(v => v.id !== videoId);
            course.videoCount = course.videos.length;
          }
          console.log('Video deleted successfully');
        },
        error: (error) => {
          console.error('Failed to delete video', error);
          alert('Failed to delete video. Please try again.');
        }
      });
    }
  }
}
