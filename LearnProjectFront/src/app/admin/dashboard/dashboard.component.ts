import { Component, OnInit } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as Papa from 'papaparse';
import {PageEvent} from '@angular/material/paginator';

interface Course {
  id: string;
  name: string;
  description: string;
  trainerEmail: string;
  showVideos: boolean;
  videos?: Video[];
}

interface Video {
  id: string;
  title: string;
  youtubeUrl: string;
}

interface User {
  id: string;
  name: string;
  lastname: string;
  departement: string;
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
  courses: Course[] = [];
  users: User[] = [];
  csvFile: File | null = null;
  darkMode: boolean = false;
  sidebarCollapsed: boolean = false;
  activeSection: string = 'dashboard';
  isLoading: boolean = false;
  uploadProgress: number = 0;
  employees: User[] = [];
  totalEmployees = 0;
  pageSize = 10;
  pageIndex = 0;
  searchTerm = '';
  // Logo paths - replace these with your actual logo paths
  lightLogo: string = 'assets/logo.png';
  darkLogo: string = 'assets/logoDark.png';

  // Admin user info (would come from auth service)
  adminUser = {
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'Administrator'
  };

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Check if dark mode is enabled
    const savedDarkMode = localStorage.getItem('dashboardDarkMode');
    if (savedDarkMode === 'true') {
      this.darkMode = true;
      document.documentElement.classList.add('dark');
      this.loadEmployees();

    }

    // Check sidebar state
    const savedSidebarState = localStorage.getItem('sidebarCollapsed');
    if (savedSidebarState === 'true') {
      this.sidebarCollapsed = true;
    }

    this.loadCourses();
    // this.loadAdminInfo();
  }

/*  loadAdminInfo(): void {
    // Get admin user info from auth service
    const userInfo = this.authService.getCurrentUser();
    if (userInfo) {
      this.adminUser = {
        name: userInfo.name || 'Admin User',
        email: userInfo.email || 'admin@company.com',
        role: userInfo.role || 'Administrator'
      };
    }
  }*/

  loadCourses(): void {
    this.isLoading = true;
    this.courseService.getAllCourses().subscribe({
      next: (response) => {
        this.courses = response.map((course: any) => ({
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

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed.toString());
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

  // Utility methods
  getTotalCourses(): number {
    return this.courses.length;
  }

  getTotalVideos(): number {
    return this.courses.reduce((total, course) => {
      return total + (course.videos ? course.videos.length : 0);
    }, 0);
  }

  getTotalUsers(): number {
    // This would typically come from a service
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
    // Here you would typically open a modal or navigate to an edit page
    // For simplicity, we'll just log it.
    console.log('Update user:', user);
  }
}
