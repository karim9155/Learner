import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-results',
  standalone: false,
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {

  courseId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('courseId');
  }

  goBack(): void {
    this.location.back();
  }

  goHome(): void {
    this.router.navigate(['/learner/courses']);
  }

  finishCourse(): void {
    this.router.navigate(['/learner/courses']);
  }

}
