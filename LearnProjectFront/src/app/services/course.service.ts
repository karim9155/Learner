import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:8080/api/courses'; // Adjust the URL to your backend

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
  getCoursesByTrainer(trainerEmail: string): Observable<any> {
    // This endpoint should ideally take a trainer ID, but we'll use email for now
    // This will require a backend change to fetch courses by trainer email.
    // For now, we will filter on the frontend.
    return this.http.get<any[]>(`${this.apiUrl}/all`, { headers: this.getAuthHeaders() });
  }

  deleteCourse(courseId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${courseId}`, { headers: this.getAuthHeaders() });
  }

  deleteVideo(videoId: string): Observable<any> {
    const videoApiUrl = 'http://localhost:8080/api/videos';
    return this.http.delete(`${videoApiUrl}/${videoId}`, { headers: this.getAuthHeaders() });
  }
}
