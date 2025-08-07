import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
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
          const role = this.authService.getRole()?.toLowerCase();
          if (role === 'admin') {
            this.ngZone.run(() => this.router.navigate(['/admin/dashboard']));
          } else if (role === 'trainer') {
            this.ngZone.run(() => this.router.navigate(['/trainer/dashboard']));
          }
        },
        (error) => {
          console.error('Login failed', error);
        }
      );
    }
  }
}
