import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private apiUrl = `${API_CONFIG.baseUrl}/api`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Complaints
  raiseComplaint(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/complaints/raise`, formData, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getStudentComplaints(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/complaints/student`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getWardenComplaints(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/complaints/warden`, {
      headers: this.authService.getNoCacheHeaders()
    });
  }

  getStaffComplaints(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/complaints/staff`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  assignComplaint(complaintId: number, staffId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/complaints/assign/${complaintId}`, { staffId }, {
      headers: this.authService.getJsonHeaders()
    });
  }

  updateComplaintStatus(complaintId: number, status: string, completionPhoto?: File): Observable<any> {
    const formData = new FormData();
    formData.append('status', status);
    if (completionPhoto) {
      formData.append('completionPhoto', completionPhoto);
    }
    return this.http.put(`${this.apiUrl}/complaints/update-status/${complaintId}`, formData, {
      headers: this.authService.getAuthHeaders()
    });
  }

  submitFeedback(complaintId: number, rating: number, comment: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/complaints/feedback/${complaintId}`, { rating, comment }, {
      headers: this.authService.getJsonHeaders()
    });
  }

  getAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/complaints/analytics`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getComplaintDetails(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/complaints/details/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Users
  getStaffList(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/staff`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/all`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateUserStatus(userId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/status/${userId}`, { status }, {
      headers: this.authService.getJsonHeaders()
    });
  }

  updateUserDetails(userId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/edit/${userId}`, data, {
      headers: this.authService.getJsonHeaders()
    });
  }

  createStaffOrWarden(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/create-staff-warden`, userData, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Announcements / Notices
  getAnnouncements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/announcements/list`, {
      headers: this.authService.getNoCacheHeaders()
    });
  }

  createAnnouncement(announcementData: any): Observable<any> {
    const isFormData = announcementData instanceof FormData;
    return this.http.post(`${this.apiUrl}/announcements/create`, announcementData, {
      headers: isFormData ? this.authService.getAuthHeaders() : this.authService.getJsonHeaders()
    });
  }

  deleteAnnouncement(announcementId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/announcements/delete/${announcementId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // System Settings Management
  getFooterSettings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/settings/footer`, {
      headers: this.authService.getNoCacheHeaders()
    });
  }

  updateFooterSettings(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/settings/footer`, data, {
      headers: this.authService.getJsonHeaders()
    });
  }

  getPublicSettings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/settings/public`, {
      headers: this.authService.getNoCacheHeaders()
    });
  }

  updatePublicSettings(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/settings/public`, data, {
      headers: this.authService.getJsonHeaders()
    });
  }

  getStaffWorkload(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/complaints/staff-workload`, {
      headers: this.authService.getNoCacheHeaders()
    });
  }


  // Notifications History
  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notifications`, {
      headers: this.authService.getNoCacheHeaders()
    });
  }

  markAllNotificationsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/read`, {}, {
      headers: this.authService.getJsonHeaders()
    });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/delete/${userId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deleteComplaint(complaintId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/complaints/delete/${complaintId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/notifications/delete/${notificationId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deleteAllNotifications(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/notifications/delete-all`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getWardenList(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/wardens`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  uploadDeveloperPicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('pic', file);
    return this.http.post<any>(`${this.apiUrl}/settings/upload-dev-pic`, formData, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Management API Methods
  createStaffAccount(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/create-staff-warden`, data, {
      headers: this.authService.getJsonHeaders()
    });
  }

  getAllComplaints(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/complaints/warden`, {
      headers: this.authService.getNoCacheHeaders()
    });
  }

  createManagementAccount(data: any): Observable<any> {
    const payload = {
      ...data,
      role: 'management'
    };
    return this.http.post(`${this.apiUrl}/users/create-staff-warden`, payload, {
      headers: this.authService.getJsonHeaders()
    });
  }

  getManagementAccounts(): Observable<any[]> {
    return new Observable((observer) => {
      this.http.get<any[]>(`${this.apiUrl}/users/all`, {
        headers: this.authService.getAuthHeaders()
      }).subscribe({
        next: (res) => {
          const mgmtList = Array.isArray(res) ? res.filter((u: any) => u.role === 'management') : [];
          observer.next(mgmtList);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  deleteManagementAccount(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/delete/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getManagementAnalytics(period: string = 'week'): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/analytics?period=${period}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  bulkImportStudents(students: any[], batchName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/bulk-import`, { students, batchName }, {
      headers: this.authService.getJsonHeaders()
    });
  }

  terminateUser(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/terminate-user`, { userId }, {
      headers: this.authService.getJsonHeaders()
    });
  }

  terminateBatch(batchName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/terminate-batch`, { batchName }, {
      headers: this.authService.getJsonHeaders()
    });
  }

  getStaffPerformance(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/staff-performance`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getAttendanceStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/attendance-stats`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getMonthlyAttendanceReport(monthStr: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/attendance/monthly-report?month=${monthStr}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getMessAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mess/feedback/stats`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map((res: any) => {
        if (res && res.stats) {
          const feedbacks = (res.feedbacks || []).map((f: any) => ({
            id: f.id,
            mealType: f.mealType,
            foodQuality: f.rating,
            comments: f.comment || '',
            student: f.student || { name: 'Student', roomNumber: 'N/A', hostelBlock: 'Block' },
            date: f.date,
            createdAt: f.createdAt
          }));
          return {
            summary: {
              avgRating: typeof res.stats.overallAvg === 'number' ? res.stats.overallAvg.toFixed(1) : (res.stats.overallAvg || '0.0'),
              totalReviews: res.stats.totalCount || 0
            },
            reviews: feedbacks
          };
        }
        return res;
      })
    );
  }

  getActivityLogs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/activity-logs/feed`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getStaffTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/staff-tasks/all`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  createStaffTask(taskData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/staff-tasks/create`, taskData, {
      headers: this.authService.getJsonHeaders()
    });
  }

  updateStaffTaskStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/staff-tasks/status/${id}`, { status }, {
      headers: this.authService.getJsonHeaders()
    });
  }
}


