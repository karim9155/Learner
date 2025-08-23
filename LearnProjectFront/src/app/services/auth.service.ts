import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://54.37.78.55:8080/auth';
  private tokenKey = 'auth_token';
  private roleKey = 'auth_role';
  private userKey = 'auth_user'; // Key for storing the user object

  constructor(private http: HttpClient) { }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // When login is successful, save all relevant auth data
        this.saveAuthData(response);
      })
    );
  }

  // Updated method to save token, user object, and role
  private saveAuthData(response: { jwt: string; user: any }): void {
    if (response.jwt && response.user) {
      const decodedToken: any = jwtDecode(response.jwt);
      const role = decodedToken.role || 'Unknown';

      localStorage.setItem(this.tokenKey, response.jwt);
      localStorage.setItem(this.userKey, JSON.stringify(response.user));
      localStorage.setItem(this.roleKey, role);
    }
  }

  // New method to get the stored user object
  getCurrentUser(): any | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.userKey); // Clear the user object on logout
  }
}
