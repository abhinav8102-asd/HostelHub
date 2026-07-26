import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Student {
  id: number;
  name: string;
  email: string;
  roomNumber: string;
  hostelBlock: string;
  phone: string;
}

export interface AttendanceRecord {
  id?: number;
  studentId: number;
  date: string;
  status: 'present' | 'absent' | 'outing';
  remarks?: string;
  student?: {
    id: number;
    name: string;
    roomNumber: string;
    hostelBlock: string;
  };
}

export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  outing: number;
  percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = 'https://hostelhub-0cyi.onrender.com/api/attendance';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/students`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  markAttendance(date: string, records: { studentId: number; status: 'present' | 'absent' | 'outing'; remarks?: string }[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark`, { date, records }, {
      headers: this.authService.getJsonHeaders()
    });
  }

  getDailySummary(date: string): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(`${this.apiUrl}/summary?date=${date}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getMyStats(): Observable<{ summary: AttendanceStats; history: AttendanceRecord[] }> {
    return this.http.get<{ summary: AttendanceStats; history: AttendanceRecord[] }>(`${this.apiUrl}/my-stats`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}

