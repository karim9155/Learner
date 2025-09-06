import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private timer: any;
  private inactivityTime = 30 * 60 * 1000; // 30 minutes

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) { }

  initInactivityTimer(): void {
    this.ngZone.runOutsideAngular(() => {
      this.resetTimer();
      window.addEventListener('mousemove', () => this.resetTimer());
      window.addEventListener('keypress', () => this.resetTimer());
    });
  }

  private resetTimer(): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.ngZone.run(() => {
        this.logout();
      });
    }, this.inactivityTime);
  }

  private logout(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
