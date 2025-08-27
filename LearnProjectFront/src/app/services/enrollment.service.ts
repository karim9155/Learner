// karim9155/learner/Learner-fc5557b9b5123c3ec285bf8abc7969b10e56450d/LearnProjectFront/src/app/services/enrollment.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

<<<<<<< HEAD
const API_URL = '/api/enrollments';
=======
const API_URL = 'http://localhost:8080/api/enrollments';
>>>>>>> 10709e9063b6cafe44a448d3d1c95d8a731c6da2

export interface BatchEnrollmentRequest {
  courseId: string;
  learnerIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {

  constructor(private http: HttpClient) { }

  enrollUsersInCourse(request: BatchEnrollmentRequest): Observable<any> {
    return this.http.post(`${API_URL}/batch`, request);
  }
}
