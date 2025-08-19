import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { Learner, LearnerDataService } from '../../../services/learner-data.service';
import {MatFormField, MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-phone-login',
  templateUrl: './phone-login.component.html',
  standalone: false,
  styleUrls: ['./phone-login.component.css']
})
export class PhoneLoginComponent {
// 1. Declare the property without initializing it
  loginForm: FormGroup;
  errorMessage: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder, // fb is injected here
    private router: Router,
    private userService: UserService,
    private learnerDataService: LearnerDataService
  ) {
    // 2. Initialize the form inside the constructor where fb is available
    this.loginForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    const phone = this.loginForm.value.phone!;

    this.userService.findLearnerByPhone(phone).subscribe({
      next: (learner) => {
        this.isLoading = false;
        this.learnerDataService.changeLearner(learner);
        this.router.navigate(['/learner/courses']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error.message || 'An unexpected error occurred.';
      }
    });
  }
}
