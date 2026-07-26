import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface MessMenu {
  id: number;
  dayOfWeek: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export interface MessFeedback {
  id?: number;
  studentId?: number;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  date: string;
  rating: number;
  comment?: string;
  student?: {
    name: string;
    roomNumber: string;
    hostelBlock: string;
  };
  createdAt?: string;
}

export interface MessSkip {
  id?: number;
  studentId?: number;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessService {
  private apiUrl = 'http://localhost:5000/api/mess';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getMenu(): Observable<MessMenu[]> {
    return this.http.get<MessMenu[]>(`${this.apiUrl}/menu`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateMenu(id: number, menuData: Partial<MessMenu>): Observable<any> {
    return this.http.put(`${this.apiUrl}/menu/${id}`, menuData, {
      headers: this.authService.getJsonHeaders()
    });
  }

  submitFeedback(feedback: MessFeedback): Observable<any> {
    return this.http.post(`${this.apiUrl}/feedback`, feedback, {
      headers: this.authService.getJsonHeaders()
    });
  }

  getFeedbackStats(): Observable<{ stats: any; feedbacks: MessFeedback[] }> {
    return this.http.get<{ stats: any; feedbacks: MessFeedback[] }>(`${this.apiUrl}/feedback/stats`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  toggleSkipMeal(mealType: string, date: string): Observable<{ message: string; skipped: boolean }> {
    return this.http.post<{ message: string; skipped: boolean }>(`${this.apiUrl}/skip`, { mealType, date }, {
      headers: this.authService.getJsonHeaders()
    });
  }

  getMySkippedMeals(): Observable<MessSkip[]> {
    return this.http.get<MessSkip[]>(`${this.apiUrl}/skip/my`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getSkipSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/skip/summary`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
