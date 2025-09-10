import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CoursePreviewComponent } from '../course-preview/course-preview.component';

// --- Existing Interfaces (kept for original functionality) ---
interface Course {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  trainerEmail: string;
  createdAt?: string;
  videoCount?: number;
  videos?: Video[];
  showVideos?: boolean;
}

interface Video {
  id: string;
  title: string;
  youtubeUrl: string;
  courseId: string;
  createdAt?: string;
}

// --- New Interfaces for AI Generation Feature ---
interface GeneratedQuiz {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface GeneratedVideo {
  id: string;
  title: string;
  youtubeUrl: string;
  prompt: string;
  quiz: GeneratedQuiz;
  isUpdating: boolean;
  isEditingQuiz: boolean;
}

interface GeneratedContent {
  title: string;
  description: string;
  videos: GeneratedVideo[];
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class TrainerDashboardComponent implements OnInit {
  // --- Existing Properties ---
  courseForm: FormGroup;
  videoForm: FormGroup;
  myCourses: Course[] = [];
  darkMode: boolean = false;
  activeSection: string = 'dashboard';
  isLoading: boolean = false;
  lightLogo: string = 'assets/logo.png';
  darkLogo: string = 'assets/logoDark.png';
  trainerUser = { id: '', name: '', email: '', role: '' };
  isCreatingCourse = false;
  isAddingVideo = false;
  private coursesLoaded: boolean = false;
  myCoursesSearchTerm = '';
  private myCoursesSearchSubject = new Subject<string>();
  courseCreationMessage: string = '';
  videoAdditionMessage: string = '';

  // --- New Properties for AI Feature ---
  showReviewPanel: boolean = false;
  isGeneratingAI: boolean = false;
  isPublishing: boolean = false;
  pptFile: File | null = null;
  generatedContent: GeneratedContent | null = null;
  editableQuiz: GeneratedQuiz | null = null;

  // --- New Properties for Modern UI ---
  sidebarExpanded: boolean = false;
  creationStep: number = 1;
  mockQuestionsForm: FormGroup;

  private mockShorts: string[] = [
    'https://www.youtube.com/embed/l5_2QGEK1oE',
    'https://www.youtube.com/embed/NOEB46yBf2o',
    'https://www.youtube.com/embed/0iaIUyjHGuQ',
    'https://www.youtube.com/embed/hAYdrwtd-xE',
    'https://www.youtube.com/embed/M837WQ4NORA'
  ];

  get courseFormControls() { return this.courseForm.controls; }
  get videoFormControls() { return this.videoForm.controls; }
  get isCourseFormValid() { return this.courseForm.valid; }
  get isVideoFormValid() { return this.videoForm.valid; }

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer,
    public dialog: MatDialog
  ) {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      coverImage: [null]
    });

    this.videoForm = this.fb.group({
      courseId: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(3)]],
      url: ['', [Validators.required, this.youtubeUrlValidator]]
    });

    this.mockQuestionsForm = this.fb.group({
      objective: ['', Validators.required],
      message: ['', Validators.required],
      targetAudience: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const savedDarkMode = localStorage.getItem('trainerDashboardDarkMode');
    if (savedDarkMode === 'true') {
      this.darkMode = true;
      document.documentElement.classList.add('dark');
    }

    this.loadTrainerInfo();
    this.loadMyCourses();

    this.myCoursesSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
        this.isLoading = true;
        return this.courseService.getCoursesByTrainer(this.trainerUser.id, term);
      })
    ).subscribe({
      next: (courses) => {
        this.myCourses = courses.map((course: any) => ({
          ...course,
          videoCount: 0,
          showVideos: false
        }));
        this.myCourses.forEach(course => this.loadCourseVideoCount(course));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to search courses', error);
        this.isLoading = false;
      }
    });
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  // --- New Methods for Modern UI ---

  setSidebarExpanded(expanded: boolean): void {
    this.sidebarExpanded = expanded;
  }

  nextStep(): void {
    if (this.creationStep === 1 && this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      return;
    }
    if (this.creationStep === 2 && this.mockQuestionsForm.invalid) {
      this.mockQuestionsForm.markAllAsTouched();
      return;
    }
    if (this.creationStep < 3) {
      this.creationStep++;
    }
  }

  previousStep(): void {
    if (this.creationStep > 1) {
      this.creationStep--;
    }
  }

  getPageTitle(): string {
    switch (this.activeSection) {
      case 'dashboard': return 'Trainer Dashboard';
      case 'courses': return 'Create Course';
      case 'videos': return 'Add Videos';
      case 'my-courses': return 'My Courses';
      default: return 'Dashboard';
    }
  }

  getPageSubtitle(): string {
    switch (this.activeSection) {
      case 'dashboard': return `Welcome back, ${this.trainerUser.name}`;
      case 'courses': return 'Create new courses for your students';
      case 'videos': return 'Add videos to your courses';
      case 'my-courses': return 'Manage your created courses';
      default: return '';
    }
  }

  // --- Core Methods (Existing and Modified) ---

  onPptFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const validTypes = [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];

      if (validTypes.includes(file.type)) {
        this.pptFile = file;
      } else {
        this.pptFile = null;
        this.courseCreationMessage = 'Please select a valid PowerPoint file (.ppt or .pptx)';
        setTimeout(() => this.courseCreationMessage = '', 3000);
      }
    } else {
      this.pptFile = null;
    }
  }

  createCourse(): void {
    if (!this.courseForm.valid) {
      this.courseForm.markAllAsTouched();
      return;
    }

    // AI Generation Flow
    if (this.pptFile) {
      this.showReviewPanel = true;
      this.isGeneratingAI = true;
      this.generatedContent = null;

      // Simulate AI generation process
      setTimeout(() => {
        this.generatedContent = this.getMockGeneratedData();
        this.isGeneratingAI = false;
      }, 3000);

    } else { // Original Course Creation Flow
      this.isCreatingCourse = true;
      this.courseCreationMessage = '';

      const formData = new FormData();
      formData.append('course', new Blob([JSON.stringify({
        title: this.courseFormControls['title'].value,
        description: this.courseFormControls['description'].value,
      })], { type: 'application/json' }));

      if (this.courseForm.get('coverImage')?.value) {
        formData.append('coverImage', this.courseForm.get('coverImage')?.value);
      }

      this.courseService.createCourse(formData).subscribe({
        next: () => {
          this.courseCreationMessage = 'Course created successfully!';
          this.courseForm.reset();
          this.loadMyCourses();
          setTimeout(() => this.courseCreationMessage = '', 3000);
        },
        error: (error) => {
          console.error('Course creation failed', error);
          this.courseCreationMessage = 'Failed to create course. Please try again.';
        },
        complete: () => this.isCreatingCourse = false
      });
    }
  }

  // --- New Methods for AI Feature ---

  previewCourse(): void {
    if (!this.generatedContent) return;

    // Pass a deep copy of the data to prevent any potential side-effects
    // where the dialog data could be mutated by the parent component.
    const previewData = JSON.parse(JSON.stringify(this.generatedContent));

    this.dialog.open(CoursePreviewComponent, {
      width: '420px',
      height: '880px',
      data: previewData
    });
  }

  publishCourse(): void {
    if (!this.generatedContent) {
      console.error('No generated content to publish.');
      return;
    }

    this.isPublishing = true;

    const formData = new FormData();
    formData.append('courseData', new Blob([JSON.stringify(this.generatedContent)], { type: 'application/json' }));

    const coverImageFile = this.courseForm.get('coverImage')?.value;
    if (coverImageFile) {
      formData.append('coverImage', coverImageFile);
    }

    this.courseService.publishCourse(formData).subscribe({
      next: () => {
        this.isPublishing = false;
        this.courseCreationMessage = 'AI-generated course published successfully!';
        // Reset state
        this.showReviewPanel = false;
        this.generatedContent = null;
        this.pptFile = null;
        this.courseForm.reset();
        // Optionally, reload the "My Courses" list
        this.loadMyCourses();
        setTimeout(() => this.courseCreationMessage = '', 4000);
      },
      error: (error) => {
        this.isPublishing = false;
        console.error('Failed to publish course', error);
        this.courseCreationMessage = 'Failed to publish course. Please try again.';
        setTimeout(() => this.courseCreationMessage = '', 4000);
      }
    });
  }

  updateVideo(videoToUpdate: GeneratedVideo): void {
    if (!this.generatedContent) return;

    // Update the specific video's updating state
    const updatedVideos = this.generatedContent.videos.map(v =>
      v.id === videoToUpdate.id ? { ...v, isUpdating: true } : v
    );
    this.generatedContent = { ...this.generatedContent, videos: updatedVideos };

    // Simulate API call for regeneration
    setTimeout(() => {
      const currentUrlIndex = this.mockShorts.indexOf(videoToUpdate.youtubeUrl);
      let newUrlIndex = Math.floor(Math.random() * this.mockShorts.length);

      // Ensure the new URL is different
      while (newUrlIndex === currentUrlIndex && this.mockShorts.length > 1) {
        newUrlIndex = Math.floor(Math.random() * this.mockShorts.length);
      }

      // Update the video with new content
      const finalVideos = this.generatedContent!.videos.map(v =>
        v.id === videoToUpdate.id
          ? { ...v, youtubeUrl: this.mockShorts[newUrlIndex], prompt: '', isUpdating: false }
          : v
      );
      this.generatedContent = { ...this.generatedContent!, videos: finalVideos };
    }, 2000);
  }

  toggleQuizEdit(item: GeneratedVideo): void {
    if (!this.generatedContent) return;

    const updatedVideos = this.generatedContent.videos.map(v =>
      v.id === item.id ? { ...v, isEditingQuiz: !v.isEditingQuiz } : v
    );
    this.generatedContent = { ...this.generatedContent, videos: updatedVideos };

    if (!item.isEditingQuiz) {
      // Entering edit mode - deep copy the quiz to avoid modifying the original object directly
      this.editableQuiz = JSON.parse(JSON.stringify(item.quiz));
    } else {
      // Exiting edit mode
      this.editableQuiz = null;
    }
  }

  saveQuiz(item: GeneratedVideo): void {
    if (!this.editableQuiz || !this.generatedContent) return;

    // Copy the edited data back to the original object
    const updatedVideos = this.generatedContent.videos.map(v =>
      v.id === item.id
        ? { ...v, quiz: JSON.parse(JSON.stringify(this.editableQuiz)), isEditingQuiz: false }
        : v
    );
    this.generatedContent = { ...this.generatedContent, videos: updatedVideos };
    this.editableQuiz = null;
  }

  cancelQuizEdit(item: GeneratedVideo): void {
    if (!this.generatedContent) return;

    const updatedVideos = this.generatedContent.videos.map(v =>
      v.id === item.id ? { ...v, isEditingQuiz: false } : v
    );
    this.generatedContent = { ...this.generatedContent, videos: updatedVideos };
    this.editableQuiz = null;
  }

  private getMockGeneratedData(): GeneratedContent {
    const courseTitle = this.courseForm.value.title || 'Course';
    return {
      title: courseTitle,
      description: this.courseForm.value.description || 'Generated course description',
      videos: [
        {
          id: 'gen_vid_1',
          title: `Introduction to ${courseTitle}`,
          youtubeUrl: this.mockShorts[0],
          prompt: '',
          quiz: {
            question: `What is the core concept of ${courseTitle}?`,
            options: [
              'Fundamental principles',
              'Advanced techniques',
              'Basic overview',
              'Practical applications'
            ],
            correctAnswer: 0
          },
          isUpdating: false,
          isEditingQuiz: false
        },
        {
          id: 'gen_vid_2',
          title: `Key Concepts in ${courseTitle}`,
          youtubeUrl: this.mockShorts[1],
          prompt: '',
          quiz: {
            question: `Which approach is most effective in ${courseTitle}?`,
            options: [
              'Theoretical study only',
              'Practical application only',
              'Combined theory and practice',
              'Self-directed learning'
            ],
            correctAnswer: 2
          },
          isUpdating: false,
          isEditingQuiz: false
        },
        {
          id: 'gen_vid_3',
          title: `Advanced Applications of ${courseTitle}`,
          youtubeUrl: this.mockShorts[2],
          prompt: '',
          quiz: {
            question: `What is a real-world application of ${courseTitle}?`,
            options: [
              'Academic research',
              'Industry implementation',
              'Educational development',
              'All of the above'
            ],
            correctAnswer: 3
          },
          isUpdating: false,
          isEditingQuiz: false
        }
      ]
    };
  }

  // --- Unchanged Helper and Existing Methods ---

  youtubeUrlValidator(control: any) {
    if (!control.value) return null;
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/|youtube\.com\/shorts\/)[\w-]+(&[\w=]*)?$/;
    return youtubeRegex.test(control.value) ? null : { invalidYouTubeUrl: true };
  }

  getEmbedUrl(url: string): SafeResourceUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl('');
    let videoId: string | undefined;

    if (url.includes('youtu.be/') || url.includes('/shorts/')) {
      const urlParts = url.split('/');
      videoId = urlParts[urlParts.length - 1];
    } else if (url.includes('watch?v=')) {
      videoId = url.split('v=')[1];
    } else if (url.includes('/embed/')) {
      const urlParts = url.split('/');
      videoId = urlParts[urlParts.length - 1];
    }

    if (videoId) {
      const ampersandPosition = videoId.indexOf('&');
      if (ampersandPosition !== -1) {
        videoId = videoId.substring(0, ampersandPosition);
      }
      // Ensure the URL is for embedding correctly
      return this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + videoId);
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl('');
  }

  loadTrainerInfo(): void {
    const userInfo = this.authService.getCurrentUser();
    const userRole = this.authService.getRole();
    if (userInfo) {
      this.trainerUser = {
        id: userInfo.id || '',
        name: userInfo.name || 'Trainer User',
        email: userInfo.email || 'trainer@example.com',
        role: userRole || 'Trainer'
      };
    }
  }

  loadMyCourses(searchTerm: string = ''): void {
    this.isLoading = true;
    if (this.trainerUser && this.trainerUser.id) {
      this.courseService.getCoursesByTrainer(this.trainerUser.id, searchTerm).subscribe({
        next: (courses) => {
          this.myCourses = courses.map((course: any) => ({ ...course, videoCount: 0 }));
          this.myCourses.forEach(course => this.loadCourseVideoCount(course));
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

  onMyCoursesSearch(event: any): void {
    this.myCoursesSearchTerm = event.target.value;
    this.myCoursesSearchSubject.next(this.myCoursesSearchTerm);
  }

  loadCourseVideoCount(course: any): void {
    this.courseService.getVideosByCourse(course.id).subscribe({
      next: (videos) => {
        const courseIndex = this.myCourses.findIndex(c => c.id === course.id);
        if (courseIndex !== -1) this.myCourses[courseIndex].videoCount = videos.length;
      },
      error: (err) => console.error(`Failed to load video count for course ${course.id}`, err)
    });
  }

  getCourseFieldError(fieldName: string): string {
    const field = this.courseForm.get(fieldName);
    if (field?.hasError('required')) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`;
    }
    return '';
  }

  getVideoFieldError(fieldName: string): string {
    const field = this.videoForm.get(fieldName);
    if (field?.hasError('required')) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`;
    }
    if (field?.hasError('invalidYouTubeUrl')) return 'Please enter a valid YouTube URL';
    return '';
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.courseForm.patchValue({ coverImage: event.target.files[0] });
    }
  }

  addVideo(): void {
    if (this.videoForm.valid) {
      this.isAddingVideo = true;
      this.videoAdditionMessage = '';
      const videoData = {
        courseId: this.videoFormControls['courseId'].value,
        title: this.videoFormControls['title'].value,
        youtubeUrl: this.videoFormControls['url'].value
      };
      this.courseService.addVideo(videoData).subscribe({
        next: () => {
          this.videoAdditionMessage = 'Video added successfully!';
          this.videoForm.reset();
          this.loadMyCourses();
          setTimeout(() => this.videoAdditionMessage = '', 3000);
        },
        error: (error) => {
          console.error('Video addition failed', error);
          this.videoAdditionMessage = 'Failed to add video. Please try again.';
        },
        complete: () => this.isAddingVideo = false
      });
    } else {
      this.videoForm.markAllAsTouched();
    }
  }

  selectCourseForVideo(courseId: string): void {
    this.videoForm.patchValue({ courseId: courseId });
    this.setActiveSection('videos');
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

  setActiveSection(section: string): void {
    this.activeSection = section;
    if (section === 'my-courses') this.loadMyCourses();
    if (section !== 'courses') {
      this.showReviewPanel = false; // Hide review panel when leaving the create page
      this.generatedContent = null;
      this.isGeneratingAI = false;
      this.isPublishing = false;
    }
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  getTotalCourses(): number { return this.myCourses.length; }
  getTotalVideos(): number { return this.myCourses.reduce((total, course) => total + (course.videoCount || 0), 0); }
  getRecentCourses(): Course[] { return this.myCourses.slice(0, 3); }
  getImageUrl(coverImage: string): string { return `https://snaplabs.online/uploads/${coverImage}`; }
  onImageError(e: Event) {
    const imgElement = e.target as HTMLImageElement;
    imgElement.style.display = 'none';
    // Show placeholder icon instead
    const container = imgElement.parentElement;
    if (container) {
      container.classList.add('show-placeholder');
    }
  }

  deleteCourse(courseId: string): void {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      this.courseService.deleteCourse(courseId).subscribe({
        next: () => {
          this.myCourses = this.myCourses.filter(course => course.id !== courseId);
          this.courseCreationMessage = 'Course deleted successfully!';
          setTimeout(() => this.courseCreationMessage = '', 3000);
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
          this.videoAdditionMessage = 'Video deleted successfully!';
          setTimeout(() => this.videoAdditionMessage = '', 3000);
        },
        error: (error) => {
          console.error('Failed to delete video', error);
          alert('Failed to delete video. Please try again.');
        }
      });
    }
  }

  toggleVideos(course: Course): void {
    course.showVideos = !course.showVideos;
    if (course.showVideos && !course.videos) {
      this.courseService.getVideosByCourse(course.id).subscribe({
        next: (videos) => {
          const courseIndex = this.myCourses.findIndex(c => c.id === course.id);
          if (courseIndex !== -1) this.myCourses[courseIndex].videos = videos;
        },
        error: (err) => console.error(`Failed to load videos for course ${course.id}`, err)
      });
    }
  }

  protected readonly Math = Math;
}
