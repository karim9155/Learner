import { Component, OnInit } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as Papa from 'papaparse';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { EnrollModalComponent } from '../components/enroll-modal/enroll-modal.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

// ... (interfaces remain the same) ...
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
  showQrCode?: boolean;
  duration?: string;

}

interface Video {
  id: string;
  title: string;
  youtubeUrl: string;
  duration?: string;

}

interface User {
  id: string;
  name: string;
  lastname: string;
  department: string;
  email: string;
  'phone number': string;
  'badg number': string;
}


@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  filteredCourses: Course[] = [];
  shopCourses: Course[] = [];
  enrolledCourses: Course[] = [];
  users: User[] = [];
  csvFile: File | null = null;
  darkMode: boolean = false;
  activeSection: string = 'dashboard';
  isLoading: boolean = false;
  uploadProgress: number = 0;
  employees: User[] = [];
  totalEmployees = 0;
  pageSize = 10;
  pageIndex = 0;
  searchTerm = '';
  shopCoursesSearchTerm = '';
  enrolledCoursesSearchTerm = '';
  private shopCoursesSearchSubject = new Subject<string>();
  private enrolledCoursesSearchSubject = new Subject<string>();
  lightLogo: string = 'assets/logo.png';
  darkLogo: string = 'assets/logoDark.png';
  qrCodeData: string = 'https://snaplabs.online/learner/login';

  // Admin user info will now be populated dynamically
  adminUser: any = {}; // <-- CHANGED: Initialize as an empty object

  constructor(
    private courseService: CourseService,
    private authService: AuthService, // Already injected, which is great!
    private userService: UserService,
    private router: Router,
    private sanitizer: DomSanitizer,
    public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    // Check dark mode
    const savedDarkMode = localStorage.getItem('dashboardDarkMode');
    if (savedDarkMode === 'true') {
      this.darkMode = true;
      document.documentElement.classList.add('dark');
    }


    // Get the current user's info from the AuthService
    this.loadAdminInfo(); // <-- CHANGED: Call the method to load user info

    // Load other data
    this.loadEmployees();
    this.loadAllCourses();
    this.loadEnrolledCourses(); // This will now use the correct ID

    this.shopCoursesSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
        this.isLoading = true;
        return this.courseService.getAllCourses(term);
      })
    ).subscribe({
      next: (response) => {
        this.shopCourses = response.map((course: any) => ({
          ...course,
          showVideos: false
        }));
        this.filteredCourses = this.shopCourses;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to search courses', error);
        this.isLoading = false;
      }
    });

    this.enrolledCoursesSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
        this.isLoading = true;
        return this.courseService.getAdminEnrolledCourses(this.adminUser.id, term);
      })
    ).subscribe({
      next: (response) => {
        this.enrolledCourses = response.map((course: any) => ({
          ...course,
          showVideos: false
        }));
        this.filteredCourses = this.shopCourses;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to search enrolled courses', error);
        this.isLoading = false;
      }
    });
  }
  handleSearch(event: any): void {
    const term = (event.target.value as string).toLowerCase();
    this.searchTerm = term;

    this.filteredCourses = this.shopCourses.filter(course =>
        course.title.toLowerCase().includes(term) ||
        course.description.toLowerCase().includes(term)
      //(course.category && course.category.toLowerCase().includes(term))
    );
  }

  // Utility method to get current user info
  loadAdminInfo(): void {
    // Get admin user info from auth service
    const userInfo = this.authService.getCurrentUser(); // Assuming this method exists and decodes the token
    if (userInfo) {
      this.adminUser = {
        id: userInfo.id, // <-- CHANGED: Use the ID from the service
        name: userInfo.name || 'Admin User',
        email: userInfo.email || 'admin@company.com',
        role: userInfo.role || 'Administrator'
      };
    } else {
      // Handle case where user info is not available (e.g., logout)
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }


  loadAllCourses(searchTerm: string = ''): void {
    this.isLoading = true;
    this.courseService.getAllCourses(searchTerm).subscribe({
      next: (response) => {
        this.shopCourses = response.map((course: any) => ({
          ...course,
          showVideos: false
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load courses', error);
        this.isLoading = false;
      }
    });
  }

  // This method now works correctly
  loadEnrolledCourses(searchTerm: string = ''): void {
    if (!this.adminUser.id) { // <-- CHANGED: Add a check to ensure ID exists before calling
      console.error("Admin user ID not found. Cannot load enrolled courses.");
      return;
    }
    this.isLoading = true;
    this.courseService.getAdminEnrolledCourses(this.adminUser.id, searchTerm).subscribe({
      next: (response) => {
        this.enrolledCourses = response.map((course: any) => ({
          ...course,
          showVideos: false
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load admin enrolled courses', error);
        this.isLoading = false;
      }
    });
  }

  onShopCoursesSearch(event: any): void {
    this.shopCoursesSearchTerm = event.target.value;
    this.shopCoursesSearchSubject.next(this.shopCoursesSearchTerm);
  }

  onEnrolledCoursesSearch(event: any): void {
    this.enrolledCoursesSearchTerm = event.target.value;
    this.enrolledCoursesSearchSubject.next(this.enrolledCoursesSearchTerm);
  }

  // ... (The rest of your component code remains the same)
  enroll(courseId: string): void {
    const course = this.shopCourses.find(c => c.id === courseId);
    if (course) {
      this.openEnrollDialog(course);
    }
  }

  openEnrollDialog(course: Course): void {
    const dialogRef = this.dialog.open(EnrollModalComponent, {
      width: '1700px',
      data: {courseId: course.id, courseName: course.title}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEnrolledCourses();
      }
    });
  }

  toggleVideos(course: Course): void {
    course.showVideos = !course.showVideos;

    if (course.showVideos && !course.videos) {
      this.courseService.getVideosByCourse(course.id).subscribe({
        next: (videos) => {
          course.videos = videos;
        },
        error: (error) => {
          console.error(`Failed to load videos for course ${course.id}`, error);
        }
      });
    }
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

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      this.csvFile = file;

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          this.users = result.data as User[];
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          alert('Error parsing CSV file. Please check the format.');
        }
      });
    } else {
      alert('Please select a valid CSV file.');
    }
  }

  saveUsers(): void {
    if (this.csvFile && this.users.length > 0) {
      this.isLoading = true;
      this.uploadProgress = 0;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        this.uploadProgress += 10;
        if (this.uploadProgress >= 90) {
          clearInterval(progressInterval);
        }
      }, 200);

      this.userService.uploadUsers(this.csvFile).subscribe({
        next: (response) => {
          clearInterval(progressInterval);
          this.uploadProgress = 100;

          setTimeout(() => {
            alert('Users created successfully!');
            this.users = [];
            this.csvFile = null;
            this.uploadProgress = 0;
            this.isLoading = false;

            // Reset file input
            const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
          }, 500);
        },
        error: (error) => {
          clearInterval(progressInterval);
          console.error('Failed to create users', error);
          alert('Failed to create users. Please check the console for more details.');
          this.isLoading = false;
          this.uploadProgress = 0;
        }
      });
    } else {
      alert('Please select a valid CSV file with user data.');
    }
  }

  removeUser(index: number): void {
    this.users.splice(index, 1);
  }

  clearUsers(): void {
    this.users = [];
    this.csvFile = null;
    const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;

    if (this.darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dashboardDarkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dashboardDarkMode', 'false');
    }
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  getTotalCourses(): number {
    return this.shopCourses.length;
  }

  getTotalVideos(): number {
    const shopVideos = this.shopCourses.reduce((total, course) => {
      return total + (course.videos ? course.videos.length : 0);
    }, 0);
    const enrolledVideos = this.enrolledCourses.reduce((total, course) => {
      return total + (course.videos ? course.videos.length : 0);
    }, 0);
    return shopVideos + enrolledVideos;
  }

  getTotalUsers(): number {
    return this.users.length;
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.userService.getEmployees(this.pageIndex, this.pageSize, this.searchTerm).subscribe({
      next: (response) => {
        this.employees = response.content;
        this.totalEmployees = response.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load employees', error);
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEmployees();
  }

  onSearch(): void {
    this.pageIndex = 0;
    this.loadEmployees();
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.loadEmployees();
        },
        error: (error) => console.error('Failed to delete user', error)
      });
    }
  }

  updateUser(user: User): void {
    console.log('Update user:', user);
  }

  getImageUrl(coverImage: string): string {
    return `/uploads/${coverImage}`;
  }

  onImageError(e: Event) {
    const img = e.target as HTMLImageElement;
    img.classList.add('error');
  }

  getRecentActivity() {
    return undefined;
  }

  getActivityStatus(activity: any) {

  }

  getActiveEnrollments() {
    return "";
  }

  getPageTitle() {
    return "";
  }

  getPageSubtitle() {
    return "";
  }

  generateQrCode(course: Course): void {
    this.enrolledCourses.forEach(c => c.showQrCode = false);
    course.showQrCode = true;
  }

  downloadQrCode(): void {
    const qrCodeElement = document.querySelector('qrcode canvas') as HTMLCanvasElement;
    if (qrCodeElement) {
      const link = document.createElement('a');
      link.download = 'qr-code.png';
      link.href = qrCodeElement.toDataURL('image/png');
      link.click();
    }
  }

}
