import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  ) {}

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


  createStaffOrWarden(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/create-staff-warden`, userData, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Announcements
  getAnnouncements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/announcements/list`, {
      headers: this.authService.getNoCacheHeaders()
    });
  }

  createAnnouncement(announcement: { title: string; content: string; hostelBlock?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/announcements/create`, announcement, {
      headers: this.authService.getJsonHeaders()
    });
  }

  deleteAnnouncement(announcementId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/announcements/delete/${announcementId}`, {
      headers: this.authService.getAuthHeaders()
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

  getFooterSettings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/settings/footer`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateFooterSettings(settings: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/settings/footer`, settings, {
      headers: this.authService.getJsonHeaders()
    });
  }

  getWardenList(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/wardens`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getPublicSettings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/settings/public`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updatePublicSettings(settings: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/settings/public`, settings, {
      headers: this.authService.getJsonHeaders()
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
  createManagementAccount(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/management/accounts`, data, {
      headers: this.authService.getJsonHeaders()
    });
  }

  getManagementAccounts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/management/accounts`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deleteManagementAccount(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/management/accounts/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getManagementAnalytics(period: string = 'week'): Observable<any> {
    return this.http.get(`${this.apiUrl}/management/analytics?period=${period}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  bulkImportStudents(students: any[], batchName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/management/bulk-import`, { students, batchName }, {
      headers: this.authService.getJsonHeaders()
    });
  }

  terminateUser(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/management/terminate-user`, { userId }, {
      headers: this.authService.getJsonHeaders()
    });
  }

  terminateBatch(batchName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/management/terminate-batch`, { batchName }, {
      headers: this.authService.getJsonHeaders()
    });
  }
}


