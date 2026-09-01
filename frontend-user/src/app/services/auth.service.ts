import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, retry } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'warden' | 'staff' | 'admin';
  phone: string;
  roomNumber?: string;
  hostelBlock?: string;
  rollNumber?: string;
  status: string;
  profilePicUrl?: string;
  bio?: string;
  gender?: string;
  batch?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

const TOKEN_KEY = 'hh_student_token';
const USER_KEY = 'hh_student_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${API_CONFIG.baseUrl}/api/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // 1. Web LocalStorage Load (Immediate/Synchronous)
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }

    // 2. Native SharedPreferences Load (Asynchronous, avoids Android WebView session resets)
    this.initNativeStorage();

    // 3. Background server warm-up ping (wakes up sleeping Render backend)
    this.pingServer();
  }

  public pingServer(): void {
    this.http.get(`${API_CONFIG.baseUrl}/`).subscribe({ error: () => {} });
  }

  private async initNativeStorage() {
    try {
      const { value: token } = await Preferences.get({ key: TOKEN_KEY });
      const { value: userStr } = await Preferences.get({ key: USER_KEY });

      if (token && userStr) {
        const user = JSON.parse(userStr);
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, userStr);
        this.currentUserSubject.next(user);

        // Auto redirect to correct page if currently stuck on login page
        const currentUrl = window.location.pathname;
        if (currentUrl.includes('/login')) {
          this.router.navigate([`/${user.role}`]);
        }
      }
    } catch (e) {
      console.error('Failed to load native preferences:', e);
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

  getJsonHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token || ''}`,
      'Content-Type': 'application/json'
    });
  }

  getNoCacheHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token || ''}`,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    });
  }

  sendRegistrationOTP(data: { email: string; rollNumber?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-registration-otp`, data);
  }

  verifyOTP(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, { email, otp });
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      retry({ count: 2, delay: 1500 })
    );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      retry({ count: 2, delay: 1500 }),
      tap(res => {
        if (res && res.token) {
          localStorage.setItem(TOKEN_KEY, res.token);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);

          // Async sync to preferences
          Preferences.set({ key: TOKEN_KEY, value: res.token });
          Preferences.set({ key: USER_KEY, value: JSON.stringify(res.user) });
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    Preferences.remove({ key: TOKEN_KEY });
    Preferences.remove({ key: USER_KEY });
    this.currentUserSubject.next(null);
    this.router.navigate(['/student/login']);
  }

  updateProfile(formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile`, formData, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(res => {
        if (res && res.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
          Preferences.set({ key: USER_KEY, value: JSON.stringify(res.user) });
        }
      })
    );
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(user => {
        if (user) {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          this.currentUserSubject.next(user);
          Preferences.set({ key: USER_KEY, value: JSON.stringify(user) });
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
