import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { LearnerDataService } from '../../../services/learner-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-phone-login',
  standalone: false,
  templateUrl: './phone-login.component.html',
  styleUrls: ['./phone-login.component.css']
})
export class PhoneLoginComponent {
  loginForm: FormGroup;
  verifyForm: FormGroup;
  errorMessage: string | null = null;
  isLoading = false;
  isCodeSent = false;

  private phonePattern = /^(\+?\d{1,3})?[\s.-]?\d{8,15}$/;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private learnerDataService: LearnerDataService,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(this.phonePattern)]]
    });
    this.verifyForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  onSendCode(): void {
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    const phone = this.loginForm.value.phone!.trim();

    this.userService.sendCode(phone).subscribe({
      next: () => {
        this.isLoading = false;
        this.isCodeSent = true;
        this.snackBar.open('Verification code sent!', 'Close', { duration: 2000 });
      },
      error: (err) => {
        this.isLoading = false;
        const errorMsg = err.error?.message || 'An unexpected error occurred. Please try again.';
        this.errorMessage = errorMsg;
        this.snackBar.open(errorMsg, 'Close', { duration: 4000 });
      }
    });
  }

  onVerifyCode(): void {
    if (this.verifyForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    const phone = this.loginForm.value.phone!.trim();
    const code = this.verifyForm.value.code!.trim();

    this.userService.verifyCode(phone, code).subscribe({
      next: (learner) => {
        this.isLoading = false;
        this.learnerDataService.changeLearner(learner);
        this.snackBar.open('Welcome back! Redirecting to your courses...', 'Close', { duration: 2000 });
        this.router.navigate(['/learner/courses']);
      },
      error: (err) => {
        this.isLoading = false;
        const errorMsg = err.error?.message || 'An unexpected error occurred. Please try again.';
        this.errorMessage = errorMsg;
        this.snackBar.open(errorMsg, 'Close', { duration: 4000 });
      }
    });
  }

  // Clear error message when user starts typing
  onInputChange(): void {
    if (this.errorMessage) {
      this.errorMessage = null;
    }
  }

  get phone() {
    return this.loginForm.get('phone');
  }

  get code() {
    return this.verifyForm.get('code');
  }
}
