import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:8080/api/courses';


  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createCourse(courseData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, courseData, { headers: this.getAuthHeaders() });
  }

  addVideo(videoData: any): Observable<any> {
    const videoApiUrl = 'http://localhost:8080/api/videos';
    return this.http.post(videoApiUrl, videoData, { headers: this.getAuthHeaders() });
  }

  getAllCourses(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`, { headers: this.getAuthHeaders() });
  }

  getVideosByCourse(courseId: string): Observable<any> {
    const videoApiUrl = 'http://localhost:8080/api/videos';
    return this.http.get(`${videoApiUrl}/by-course/${courseId}`, { headers: this.getAuthHeaders() });
  }

  // This method accepts either a trainer ID or email
  getCoursesByTrainer(trainerIdOrEmail: string): Observable<any> {
    // Check if the parameter is an email (contains @) and encode it
    if (trainerIdOrEmail.includes('@')) {
      trainerIdOrEmail = encodeURIComponent(trainerIdOrEmail);
    }
    return this.http.get<any[]>(`${this.apiUrl}/by-trainer/${trainerIdOrEmail}`, { headers: this.getAuthHeaders() });
  }

  deleteCourse(courseId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${courseId}`, { headers: this.getAuthHeaders() });
  }

  deleteVideo(videoId: string): Observable<any> {
    const videoApiUrl = 'http://localhost:8080/api/videos';
    return this.http.delete(`${videoApiUrl}/${videoId}`, { headers: this.getAuthHeaders() });
  }
  getEnrolledCourses(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/by-user/${userId}`, { headers: this.getAuthHeaders() });
  }

  enrollInCourse(courseId: string, userId: string): Observable<any> {
    const enrollmentUrl = 'http://localhost:8080/api/enrollments';
    return this.http.post(enrollmentUrl, { courseId, learnerId: userId }, { headers: this.getAuthHeaders() });
  }

}
