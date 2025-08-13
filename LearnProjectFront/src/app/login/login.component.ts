import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

interface LoginFormData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword: boolean = false;
  isLoading: boolean = false;
  darkMode: boolean = false;
  rememberMe: boolean = false;

  // Logo paths - replace these with your actual logo paths
  lightLogo: string = '';
  darkLogo: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    // Check if dark mode is enabled from localStorage
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      this.darkMode = true;
      document.documentElement.classList.add('dark');
    }

    // Check if remember me was previously selected
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.rememberMe = true;
      this.loginForm.patchValue({ email: savedEmail });
    }
  }

  // Get form control for easier access in template
  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  // Check if form is valid
  get isFormValid(): boolean {
    return this.loginForm.valid &&
      this.loginForm.get('email')?.value &&
      this.loginForm.get('password')?.value;
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Toggle dark mode
  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;

    if (this.darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }

  // Handle remember me functionality
  onRememberMeChange(): void {
    if (this.rememberMe && this.emailControl?.value) {
      localStorage.setItem('rememberedEmail', this.emailControl.value);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
  }

  // Get error message for email field
  getEmailErrorMessage(): string {
    if (this.emailControl?.hasError('required')) {
      return 'Email is required';
    }
    if (this.emailControl?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  // Get error message for password field
  getPasswordErrorMessage(): string {
    if (this.passwordControl?.hasError('required')) {
      return 'Password is required';
    }
    if (this.passwordControl?.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }

  // Handle form submission
  login(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;

      // Handle remember me
      if (this.rememberMe) {
        localStorage.setItem('rememberedEmail', this.emailControl?.value || '');
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      const loginData: LoginFormData = {
        email: this.emailControl?.value,
        password: this.passwordControl?.value
      };

      this.authService.login(loginData).subscribe({
        next: (response) => {
          const role = this.authService.getRole()?.toLowerCase();

          if (role === 'admin') {
            this.ngZone.run(() => this.router.navigate(['/admin/dashboard']));
          } else if (role === 'trainer') {
            this.ngZone.run(() => this.router.navigate(['/trainer/dashboard']));
          } else {
            // Default navigation for other roles
            this.ngZone.run(() => this.router.navigate(['/dashboard']));
          }
        },
        error: (error) => {
          console.error('Login failed', error);
          this.isLoading = false;

          // You can add error handling here, such as showing a toast notification
          // or setting an error message property to display in the template
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.loginForm.markAllAsTouched();
    }
  }

  // Handle forgot password
  onForgotPassword(): void {
    // Implement forgot password functionality
    console.log('Forgot password clicked');
    // You can navigate to forgot password page or show a modal
    // this.router.navigate(['/forgot-password']);
  }

  // Handle sign up
  onSignUp(): void {
    // Navigate to sign up page
    console.log('Sign up clicked');
    // this.router.navigate(['/register']);
  }
}
