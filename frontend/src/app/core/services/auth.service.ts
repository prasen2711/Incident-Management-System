import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.checkToken();
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<any> {
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, body.toString(), { headers }).pipe(
      tap((res: any) => {
        localStorage.setItem('access_token', res.access_token);
        this.loadProfile();
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/register`, userData);
  }

  loadProfile() {
    this.http.get<User>(`${environment.apiUrl}/users/me`, {
      headers: { Authorization: `Bearer ${this.getToken()}` }
    }).subscribe({
      next: (user) => {
        this.currentUserSubject.next(user);
        this.redirectByRole(user.role);
      },
      error: () => this.logout()
    });
  }

  redirectByRole(role: string) {
    const url = this.router.url.split('?')[0]; // Strip query params
    if (url === '/login' || url === '/') {
      if (role === 'admin') this.router.navigate(['/admin/dashboard']);
      else if (role === 'support') this.router.navigate(['/support/dashboard']);
      else this.router.navigate(['/service-desk/dashboard']);
    }
  }

  logout() {
    localStorage.removeItem('access_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  checkToken() {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.http.get<User>(`${environment.apiUrl}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (user) => this.currentUserSubject.next(user),
        error: () => this.logout()
      });
    }
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, new_password: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/reset-password`, { token, new_password });
  }
}
