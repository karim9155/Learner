import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  login(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe(
        (response) => {
          // The backend should return the role in the response
          const role = this.authService.getRoleFromToken(response.token);
          if (role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else if (role === 'trainer') {
            this.router.navigate(['/trainer/dashboard']);
          }
        },
        (error) => {
          console.error('Login failed', error);
        }
      );
    }
  }
}
