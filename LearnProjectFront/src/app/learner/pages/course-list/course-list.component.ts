import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Learner, LearnerDataService } from '../../../services/learner-data.service';
import {MatToolbar} from '@angular/material/toolbar';
import {MatCard, MatCardContent, MatCardHeader} from '@angular/material/card';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-course-list',
  standalone: false,
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css']
})
export class CourseListComponent implements OnInit {
  learner: Learner | null = null;

  constructor(
    private learnerDataService: LearnerDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.learner = this.learnerDataService.getLearnerSnapshot();
    if (!this.learner) {
      // If there's no learner data, redirect back to login
      this.router.navigate(['/learner/login']);
    }
  }

  playCourse(courseId: string): void {
    this.router.navigate(['/learner/play', courseId]);
  }
}
