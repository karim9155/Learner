import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LearnerDataService } from '../../services/learner-data.service';

@Injectable({
  providedIn: 'root'
})
export class LearnerGuard implements CanActivate {
  constructor(
    private learnerDataService: LearnerDataService,
    private router: Router
  ) {}

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const learner = this.learnerDataService.getLearnerSnapshot();

    if (learner) {
      return true; // Learner has logged in via phone, allow access
    } else {
      // No learner data, redirect to the phone login page
      return this.router.createUrlTree(['/learner/login']);
    }
  }
}
