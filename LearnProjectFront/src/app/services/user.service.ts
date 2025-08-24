import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Learner} from './learner-data.service';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  badgeNumber: string;
  email: string;
  phone: string;
  active: boolean;
  memberships: { role: string }[];
}
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) { }

  uploadUsers(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  getEmployees(page: number, size: number, searchTerm: string): Observable<any> {
    // This assumes your backend endpoint for employees is structured this way
    return this.http.get(`${this.apiUrl}/employees?page=${page}&size=${size}&search=${searchTerm}`);
  }

  // ADD THIS METHOD FOR THE MODAL
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }

  updateUser(userId: string, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}`, userData);
  }

  findLearnerByPhone(phone: string): Observable<Learner> {
    // Make sure the phone number is URL-encoded
    const encodedPhone = encodeURIComponent(phone);
    return this.http.get<Learner>(`${this.apiUrl}/learner/${encodedPhone}`);
  }

}
