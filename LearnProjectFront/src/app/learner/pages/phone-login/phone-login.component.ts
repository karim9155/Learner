import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { Learner, LearnerDataService } from '../../../services/learner-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-phone-login',
  templateUrl: './phone-login.component.html',
  standalone: false,
  styleUrls: ['./phone-login.component.css']
})
export class PhoneLoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  isLoading = false;

  // Enhanced phone number validation pattern (supports international format)
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
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    const phone = this.loginForm.value.phone!.trim();

    this.userService.findLearnerByPhone(phone).subscribe({
      next: (learner) => {
        this.isLoading = false;
        this.learnerDataService.changeLearner(learner);

        // Show success message
        this.snackBar.open(
          `Welcome back! Redirecting to your courses...`,
          'Close',
          { duration: 2000 }
        );

        // Navigate to courses
        this.router.navigate(['/learner/courses']);
      },
      error: (err) => {
        this.isLoading = false;
        const errorMsg = err.error?.message || 'An unexpected error occurred. Please try again.';
        this.errorMessage = errorMsg;

        // Also show snackbar for better UX
        this.snackBar.open(
          errorMsg,
          'Close',
          { duration: 4000 }
        );
      }
    });
  }

  // Clear error message when user starts typing
  onInputChange(): void {
    if (this.errorMessage) {
      this.errorMessage = null;
    }
  }

  // Navigate back (if needed)
  onBackClick(): void {
    if (!this.isLoading) {
      // You can implement navigation back to previous page or dashboard
      // this.router.navigate(['/']);
    }
  }

  // Reset form to initial state
  resetForm(): void {
    this.loginForm.reset();
    this.isLoading = false;
    this.errorMessage = null;
  }

  // Getter for easy access to phone form control in template
  get phone() {
    return this.loginForm.get('phone');
  }

  // Check if form is valid and ready to submit
  get isFormValid(): boolean {
    return this.loginForm.valid && !this.isLoading;
  }

  // Get specific phone validation error message
  getPhoneErrorMessage(): string {
    const phoneControl = this.phone;
    if (phoneControl?.hasError('required')) {
      return 'Phone number is required';
    }
    if (phoneControl?.hasError('pattern')) {
      return 'Invalid phone number format. Please enter a valid phone number.';
    }
    return '';
  }

  // Check if phone field has errors and should show error styling
  hasPhoneError(): boolean {
    const phoneControl = this.phone;
    return !!(phoneControl?.invalid && (phoneControl?.dirty || phoneControl?.touched));
  }

  // Format phone number as user types (optional enhancement)
  formatPhoneNumber(value: string): string {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, '');
    return cleaned;
  }

  // Handle phone input formatting
  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = this.formatPhoneNumber(input.value);

    // Update form control with formatted value
    this.phone?.setValue(formattedValue, { emitEvent: false });

    // Clear errors when user starts typing
    this.onInputChange();
  }

  // Check if we're currently processing the form
  get isProcessing(): boolean {
    return this.isLoading;
  }

  // Get current phone value
  get phoneValue(): string {
    return this.phone?.value || '';
  }

  // Validate phone number format
  isValidPhoneFormat(phone: string): boolean {
    return this.phonePattern.test(phone);
  }

  // Handle form submission with additional validation
  handleSubmit(): void {
    // Mark all fields as touched to show validation errors
    this.loginForm.markAllAsTouched();

    if (this.loginForm.valid) {
      this.onSubmit();
    }
  }
}
