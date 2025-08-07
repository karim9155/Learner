import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    const requiredRole = next.data['role'];
    const token = this.authService.getToken();

    if (token) {
      const userRole = this.authService.getRoleFromToken(token);
      if (userRole === requiredRole) {
        return true;
      }
    }

    this.router.navigate(['/login']); // Or a "not authorized" page
    return false;
  }
}
