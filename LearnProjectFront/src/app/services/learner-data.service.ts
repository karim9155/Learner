import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Define an interface for the learner data
export interface Learner {
  id: string;
  name: string;
  email: string;
  phone: string;
  enrolledCourses: any[];
}

@Injectable({
  providedIn: 'root'
})
export class LearnerDataService {
  private learnerSource = new BehaviorSubject<Learner | null>(null);
  currentLearner = this.learnerSource.asObservable();

  constructor() { }

  changeLearner(learner: Learner) {
    this.learnerSource.next(learner);
  }

  getLearnerSnapshot(): Learner | null {
    return this.learnerSource.getValue();
  }
}
