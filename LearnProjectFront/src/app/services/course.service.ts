import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://54.37.78.55:8080/api/courses';
  private enrollmentApiUrl = 'http://54.37.78.55:8080/api/enrollments';



  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(includeContentType: boolean = true): HttpHeaders {
    const token = this.authService.getToken();
    let headersConfig: { [key: string]: string } = {
      'Authorization': `Bearer ${token}`
    };

    if (includeContentType) {
      headersConfig['Content-Type'] = 'application/json';
    }

    return new HttpHeaders(headersConfig);
  }

  createCourse(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}`, formData, { headers: this.getAuthHeaders(false) });
  }

  addVideo(videoData: any): Observable<any> {
    const videoApiUrl = 'http://54.37.78.55:8080/api/videos';
    return this.http.post(videoApiUrl, videoData, { headers: this.getAuthHeaders() });
  }

  getAllCourses(search: string = ''): Observable<any> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get(`${this.apiUrl}/all`, { headers: this.getAuthHeaders(), params });
  }

  getVideosByCourse(courseId: string): Observable<any> {
    const videoApiUrl = 'http://54.37.78.55:8080/api/videos';
    return this.http.get(`${videoApiUrl}/by-course/${courseId}`, { headers: this.getAuthHeaders() });
  }

  // This method accepts either a trainer ID or email
  getCoursesByTrainer(trainerIdOrEmail: string, search: string = ''): Observable<any> {
    // Check if the parameter is an email (contains @) and encode it
    if (trainerIdOrEmail.includes('@')) {
      trainerIdOrEmail = encodeURIComponent(trainerIdOrEmail);
    }
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<any[]>(`${this.apiUrl}/by-trainer/${trainerIdOrEmail}`, { headers: this.getAuthHeaders(), params });
  }

  deleteCourse(courseId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${courseId}`, { headers: this.getAuthHeaders() });
  }

  deleteVideo(videoId: string): Observable<any> {
    const videoApiUrl = 'http://54.37.78.55:8080/api/videos';
    return this.http.delete(`${videoApiUrl}/${videoId}`, { headers: this.getAuthHeaders() });
  }
  getEnrolledCourses(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/by-user/${userId}`, { headers: this.getAuthHeaders() });
  }

  enrollInCourse(courseId: string, userId: string): Observable<any> {
    const enrollmentUrl = 'http://54.37.78.55:8080/api/enrollments';
    return this.http.post(enrollmentUrl, { courseId, learnerId: userId }, { headers: this.getAuthHeaders() });
  }
  // THIS IS THE NEW METHOD FOR THE ADMIN DASHBOARD
  getAdminEnrolledCourses(adminId: string, search: string = ''): Observable<any> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get(`${this.enrollmentApiUrl}/admin/${adminId}`, { headers: this.getAuthHeaders(), params });
  }


}
