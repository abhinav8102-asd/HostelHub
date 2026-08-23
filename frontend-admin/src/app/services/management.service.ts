import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ManagementService {
  private apiUrl = `${API_CONFIG.baseUrl}/api/management`;

  constructor(private http: HttpClient) {}

  getExecutiveStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  getOccupancyHeatmap(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/heatmap`);
  }

  getComplaintsAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/complaints-analytics`);
  }

  getMessScorecard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mess-scorecard`);
  }

  getStudent360(query: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/student-360?query=${encodeURIComponent(query)}`);
  }

  getAuditLogs(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/audit-logs`);
  }

  getManagementAnalytics(period: string = 'week'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics?period=${period}`);
  }

  bulkImportStudents(students: any[], batchName: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bulk-import`, { students, batchName });
  }

  terminateUser(userId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/terminate-user`, { userId });
  }

  terminateBatch(batchName: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/terminate-batch`, { batchName });
  }

  exportCompliancePDF(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export-compliance-pdf`, { responseType: 'blob' });
  }
}
