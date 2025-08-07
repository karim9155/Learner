import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth'; // Adjust the URL to your backend
  private tokenKey = 'auth_token';
  private roleKey = 'auth_role';

  constructor(private http: HttpClient) { }


  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => this.saveToken(response.jwt))
    );
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    const decodedToken: any = jwtDecode(token);
    localStorage.setItem(this.roleKey, decodedToken.role);
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
  }

  getRoleFromToken(token: string): string {
    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.role;
    } catch (error) {
      console.error('Error decoding token:', error);
      return '';
    }
  }
}
