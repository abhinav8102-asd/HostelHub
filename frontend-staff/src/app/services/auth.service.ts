import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'warden' | 'staff' | 'admin';
  phone: string;
  roomNumber?: string;
  hostelBlock?: string;
  status: 'active' | 'inactive';
  profilePicUrl?: string;
  bio?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Namespaced keys so staff portal doesn't conflict with other portals in same browser
const TOKEN_KEY = 'hh_staff_token';
const USER_KEY = 'hh_staff_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token || ''}`
    });
  }

  // Use this for JSON POST/PUT requests — includes Content-Type so backend can parse body
  getJsonHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token || ''}`,
      'Content-Type': 'application/json'
    });
  }

  // Use this for GET requests that must NOT be cached (announcements, notifications etc)
  getNoCacheHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token || ''}`,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    });
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: { email: string; password: Math | string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res && res.token) {
          localStorage.setItem(TOKEN_KEY, res.token);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
  }

  updateProfile(formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile`, formData, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(res => {
        if (res && res.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  hasRole(roles: string[]): boolean {
    const user = this.currentUserValue;
    return !!user && roles.includes(user.role);
  }
}
