import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { ComplaintService } from '../../services/complaint.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">
      
      <!-- HEADER -->
      <div class="header">
        <div class="user-info">
          <div class="avatar-ring">
            <span class="avatar" *ngIf="!user?.profilePicUrl">👨‍💻</span>
            <img *ngIf="user?.profilePicUrl" [src]="'https://hostelhub-0cyi.onrender.com' + user.profilePicUrl" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />
          </div>
          <div>
            <h3 style="margin: 0; font-size: 16px; font-weight: 800;">Admin Console</h3>
            <p class="user-meta" style="margin: 0; font-size: 11px; opacity: 0.8;">Full System Executive Control</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="theme-toggle-btn" (click)="toggleDarkMode()" [title]="isDarkMode ? 'Light Mode' : 'Dark Mode'">
            {{ isDarkMode ? '☀️' : '🌙' }}
          </button>
          <button class="logout-btn" (click)="logout()">
            <span>Logout</span>
            <span>🚪</span>
          </button>
        </div>
      </div>

      <!-- TAB CONTENT AREA -->
      <div class="tab-content-area">

        <!-- TAB NAVIGATION (Horizontal Scrollable Bar) -->
        <div class="admin-tab-nav">
          <button (click)="switchTab('stats')" [class.active]="activeTab === 'stats'">📊 Dashboard</button>
          <button (click)="switchTab('workflow')" [class.active]="activeTab === 'workflow'">🛠️ Work Flow</button>
          <button (click)="switchTab('performance')" [class.active]="activeTab === 'performance'">👨‍🔧 Staff Stats</button>
          <button (click)="switchTab('attendance')" [class.active]="activeTab === 'attendance'">🕒 Attendance</button>
          <button (click)="switchTab('feedback')" [class.active]="activeTab === 'feedback'">⭐ Reviews & Mess</button>
          <button (click)="switchTab('activity')" [class.active]="activeTab === 'activity'">📜 Activity Log</button>
          <button (click)="switchTab('alerts')" [class.active]="activeTab === 'alerts'">🚨 Alerts Hub</button>
          <button (click)="switchTab('users')" [class.active]="activeTab === 'users'">👥 Students & Users</button>
          <button (click)="switchTab('tasks')" [class.active]="activeTab === 'tasks'">🗂️ Task Dispatcher</button>
          <button (click)="switchTab('create')" [class.active]="activeTab === 'create'">➕ Create Staff</button>
          <button (click)="switchTab('settings')" [class.active]="activeTab === 'settings'">⚙️ Settings</button>
          <button (click)="switchTab('my-profile')" [class.active]="activeTab === 'my-profile'">👤 Profile</button>
        </div>

        <!-- 1. DASHBOARD & REAL-TIME STATS -->
        <div *ngIf="activeTab === 'stats'" class="tab-panel animate-fade">
          <h4 class="page-title">📊 Executive Real-Time Dashboard</h4>

          <!-- AI Insight Banner -->
          <div class="ai-insight-banner">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 24px;">🤖</span>
              <div>
                <strong style="font-size: 13px; display: block; color: #a5b4fc;">AI Executive Insight</strong>
                <span style="font-size: 12px; color: #f8fafc;">Real-time database analytics active. Click any metric box below for full detailed list.</span>
              </div>
            </div>
            <span class="live-tag">● LIVE</span>
          </div>

          <!-- Real-Time Metrics Table Card (Interactive Cards!) -->
          <div class="card shadow-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h5 class="card-section-title" style="margin: 0;">System Operations Real-Time Metrics</h5>
              <span class="clickable-hint">💡 Click any box to view details</span>
            </div>

            <div class="metrics-grid-auto">
              <div class="metric-box border-purple clickable-box" (click)="openMetricDetails('total')">
                <span class="metric-lbl">Total Complaints</span>
                <strong class="metric-val purple-text">{{ getMetrics().total }}</strong>
                <span class="detail-link-text">View All →</span>
              </div>

              <div class="metric-box border-green clickable-box" (click)="openMetricDetails('resolved')">
                <span class="metric-lbl">Resolved</span>
                <strong class="metric-val green-text">{{ getMetrics().resolved }}</strong>
                <span class="detail-link-text">View Resolved →</span>
              </div>

              <div class="metric-box border-yellow clickable-box" (click)="openMetricDetails('pending')">
                <span class="metric-lbl">Pending</span>
                <strong class="metric-val yellow-text">{{ getMetrics().pending }}</strong>
                <span class="detail-link-text">View Pending →</span>
              </div>

              <div class="metric-box border-blue clickable-box" (click)="openMetricDetails('inProgress')">
                <span class="metric-lbl">Open / In-Progress</span>
                <strong class="metric-val blue-text">{{ getMetrics().inProgress }}</strong>
                <span class="detail-link-text">View Active →</span>
              </div>

              <div class="metric-box border-red clickable-box" (click)="openMetricDetails('unassigned')">
                <span class="metric-lbl">Unassigned</span>
                <strong class="metric-val red-text">{{ getMetrics().unassigned }}</strong>
                <span class="detail-link-text">View Unassigned →</span>
              </div>

              <div class="metric-box border-indigo clickable-box" (click)="openMetricDetails('escalated')">
                <span class="metric-lbl">Escalated Warden</span>
                <strong class="metric-val indigo-text">{{ getMetrics().escalated }}</strong>
                <span class="detail-link-text">View Escalated →</span>
              </div>

              <div class="metric-box border-teal clickable-box" (click)="openMetricDetails('activeStaff')">
                <span class="metric-lbl">Active Staff</span>
                <strong class="metric-val teal-text">{{ getMetrics().activeStaff }} / {{ getMetrics().totalStaff }}</strong>
                <span class="detail-link-text">Staff List →</span>
              </div>

              <div class="metric-box border-orange clickable-box" (click)="openMetricDetails('activeWardens')">
                <span class="metric-lbl">Active Wardens</span>
                <strong class="metric-val orange-text">{{ getMetrics().activeWardens }} / {{ getMetrics().totalWardens }}</strong>
                <span class="detail-link-text">Warden List →</span>
              </div>
            </div>
          </div>

          <!-- Graphical Trend Analytics Card -->
          <div class="card shadow-card">
            <div class="card-header-row">
              <div>
                <h5 class="card-section-title" style="margin:0;">📈 Executive Analytics Trends</h5>
                <span class="card-sub-lbl">Real-time complaint & resolution volume analysis</span>
              </div>
              <div class="period-toggle-group">
                <button (click)="switchPeriod('day')" [class.active]="period==='day'">Day</button>
                <button (click)="switchPeriod('week')" [class.active]="period==='week'">Weekly</button>
                <button (click)="switchPeriod('month')" [class.active]="period==='month'">Monthly</button>
              </div>
            </div>

            <!-- Graphical Bar Representation -->
            <div *ngIf="mgmtTrendData && mgmtTrendData.timeSeries" class="bar-chart-container">
              <div *ngFor="let t of mgmtTrendData.timeSeries" class="bar-item">
                <span class="bar-val-tag">{{ t.complaints }}</span>
                <div [style.height.%]="getTrendBarHeight(t.complaints)" class="bar-fill"></div>
                <span class="bar-label">{{ t.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. COMPLETE WORK FLOW (COMPLAINTS MATRIX) -->
        <div *ngIf="activeTab === 'workflow'" class="tab-panel animate-fade">
          <h4 class="page-title">🛠️ Complete Complaint Work Flow</h4>

          <!-- Filter Matrix -->
          <div class="card filter-matrix-card">
            <select class="form-input filter-select" [(ngModel)]="workflowStatusFilter" (change)="filterComplaints()">
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated</option>
            </select>
            <select class="form-input filter-select" [(ngModel)]="workflowCategoryFilter" (change)="filterComplaints()">
              <option value="all">All Categories</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="carpentry">Carpentry</option>
              <option value="cleaning">Cleaning</option>
              <option value="internet">Internet</option>
            </select>
          </div>

          <!-- Complaint Cards Stream -->
          <div class="complaints-list">
            <div *ngFor="let c of filteredComplaints" class="card complaint-card-item clickable-card" (click)="openComplaintDetail(c)">
              <div class="complaint-card-header">
                <div>
                  <span class="ticket-badge">#HOST-{{ c.id }}</span>
                  <h5 class="complaint-item-title">{{ c.title }}</h5>
                  <span class="complaint-student-info">Student: {{ c.student?.name || 'Student' }} (Room {{ c.student?.roomNumber || 'N/A' }}, {{ c.student?.hostelBlock || 'Block' }})</span>
                </div>
                <span [class]="'badge badge-' + c.status">{{ c.status | uppercase }}</span>
              </div>
              <p class="complaint-desc-text">{{ c.description }}</p>
              <div class="complaint-card-footer">
                <span>Assigned Staff: <strong class="staff-highlight">{{ c.staff?.name || 'Unassigned' }}</strong></span>
                <span>Category: <strong>{{ c.category | uppercase }}</strong></span>
                <span class="view-detail-badge">Click for Details 🔍</span>
              </div>
            </div>

            <div *ngIf="filteredComplaints.length === 0" class="empty-state">
              <span class="empty-icon">📋</span>
              <p>No complaints match the selected filter criteria in database.</p>
              <button class="btn btn-secondary" (click)="resetFilters()" style="width: auto; margin-top: 10px;">Reset Filters</button>
            </div>
          </div>
        </div>

        <!-- 3. STAFF PERFORMANCE LEADERBOARD -->
        <div *ngIf="activeTab === 'performance'" class="tab-panel animate-fade">
          <h4 class="page-title">👨‍🔧 Maintenance Staff Performance Leaderboard</h4>

          <div class="card shadow-card">
            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Role / Category</th>
                    <th>Assigned</th>
                    <th>Resolved</th>
                    <th>Pending</th>
                    <th>Avg Time</th>
                    <th>Rating</th>
                    <th>Status Badge</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let s of staffPerformanceList" class="clickable-row" (click)="openStaffDetail(s)">
                    <td class="font-bold">{{ s.name }}</td>
                    <td class="category-highlight">{{ s.category || s.bio || 'Maintenance' }}</td>
                    <td>{{ s.assigned }}</td>
                    <td class="green-text font-bold">{{ s.resolved }}</td>
                    <td class="yellow-text">{{ s.pending }}</td>
                    <td>{{ s.avgResolutionTime || '2.0 hrs' }}</td>
                    <td class="rating-star">⭐ {{ s.rating || '4.5' }}</td>
                    <td>
                      <span *ngIf="s.statusBadge==='excellent' || s.resolved >= s.pending" class="status-tag status-excellent">EXCELLENT</span>
                      <span *ngIf="s.statusBadge==='moderate' || (s.resolved < s.pending && s.pending > 0)" class="status-tag status-moderate">MODERATE</span>
                      <span *ngIf="s.statusBadge==='attention'" class="status-tag status-attention">NEEDS ATTENTION</span>
                    </td>
                    <td><button class="btn btn-secondary" (click)="openStaffDetail(s); $event.stopPropagation();" style="padding: 4px 8px; font-size: 11px;">View Profile 👤</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 4. REAL-TIME ATTENDANCE ANALYTICS -->
        <div *ngIf="activeTab === 'attendance'" class="tab-panel animate-fade">
          <h4 class="page-title">🕒 Student Attendance Analytics & Monthly Ledger</h4>

          <div class="attendance-top-grid">
            <div class="card attendance-card border-left-green">
              <span class="card-sub-lbl">Student Today's Live Attendance</span>
              <strong class="attendance-big-val green-text">{{ attendanceStats?.studentPercentage ?? 0 }}%</strong>
              <span class="card-sub-lbl" style="margin-top: 4px;">{{ attendanceStats?.presentStudents ?? 0 }} Present / {{ attendanceStats?.absentStudents ?? 0 }} Absent (Total Active Students: {{ attendanceStats?.totalStudents ?? 0 }})</span>
            </div>
          </div>

          <!-- Monthly Attendance History Ledger Card -->
          <div class="card shadow-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
              <div>
                <h5 class="card-section-title" style="margin: 0;">📅 Student Monthly Attendance History Ledger</h5>
                <span class="card-sub-lbl">View month-by-month present & absent day counts per student</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <label class="form-label" style="margin: 0;">Select Month:</label>
                <input type="month" class="form-input" style="width: auto;" [(ngModel)]="selectedAttendanceMonth" (change)="loadMonthlyAttendanceReport()" />
              </div>
            </div>

            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Room & Hostel Block</th>
                    <th>Days Present</th>
                    <th>Days Absent</th>
                    <th>Outing Days</th>
                    <th>Monthly Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of monthlyAttendanceReport?.report">
                    <td class="font-bold">{{ item.student?.name }}</td>
                    <td>Room {{ item.student?.roomNumber || 'N/A' }} ({{ item.student?.hostelBlock || 'Block' }})</td>
                    <td class="green-text font-bold">{{ item.presentDays }} days</td>
                    <td class="red-text font-bold">{{ item.absentDays }} days</td>
                    <td class="yellow-text">{{ item.outingDays }} days</td>
                    <td>
                      <span [class]="item.percentage >= 75 ? 'status-tag status-excellent' : 'status-tag status-attention'">
                        {{ item.percentage }}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div *ngIf="!monthlyAttendanceReport?.report || monthlyAttendanceReport?.report?.length === 0" class="empty-state">
              <span class="empty-icon">📅</span>
              <p>No student attendance history recorded for {{ selectedAttendanceMonth }}.</p>
            </div>
          </div>

          <!-- Block-wise Attendance Card -->
          <div class="card shadow-card" style="margin-top: 20px;">
            <h5 class="card-section-title">Hostel Block Breakdown</h5>
            <div *ngFor="let b of attendanceStats?.blockWise" class="block-attendance-item">
              <div class="block-att-header">
                <span class="font-bold">{{ b.block }}</span>
                <span class="green-text font-bold">{{ b.percentage }}% Present</span>
              </div>
              <div class="progress-track-bg">
                <div [style.width.%]="b.percentage" class="progress-track-fill green-fill"></div>
              </div>
              <div *ngIf="b.alert" class="alert-block-text">⚠️ {{ b.alert }}</div>
            </div>
            <div *ngIf="!attendanceStats?.blockWise || attendanceStats?.blockWise?.length === 0" class="empty-state">
              <span class="empty-icon">🏢</span>
              <p>No student hostel block attendance recorded today.</p>
            </div>
          </div>
        </div>

        <!-- 5. FEEDBACK & REVIEWS (COMPLAINTS + MESS FOOD REVIEWS) -->
        <div *ngIf="activeTab === 'feedback'" class="tab-panel animate-fade">
          <h4 class="page-title">⭐ Feedback & Reviews (System + Mess Reviews)</h4>

          <!-- Rating Breakdown Header -->
          <div class="card shadow-card" style="margin-bottom: 20px;">
            <div class="feedback-score-row">
              <div>
                <span class="card-sub-lbl" style="text-transform: uppercase;">Mess Food Quality Score</span>
                <h2 class="rating-big-score">⭐ {{ messAnalytics?.summary?.avgRating ?? '0.0' }} <span style="font-size: 14px; opacity: 0.7;">/ 5.0</span></h2>
                <span class="card-sub-lbl">Based on {{ messAnalytics?.summary?.totalReviews ?? 0 }} student reviews submitted</span>
              </div>
            </div>
          </div>

          <!-- Student Reviews Stream -->
          <div class="card shadow-card">
            <h5 class="card-section-title">Recent Student Mess & Complaint Reviews</h5>
            <div *ngFor="let r of messAnalytics?.reviews" class="review-item-box">
              <div class="review-item-header">
                <strong>{{ r.student?.name || 'Student' }} ({{ r.mealType | uppercase }})</strong>
                <span class="rating-star">⭐ {{ r.foodQuality }}/5</span>
              </div>
              <p class="review-comment">{{ r.comments || 'No comment provided.' }}</p>
            </div>
            <div *ngIf="!messAnalytics?.reviews || messAnalytics?.reviews?.length === 0" class="empty-state">
              <span class="empty-icon">🍽️</span>
              <p>No student mess reviews submitted yet. Student reviews will appear here live when submitted!</p>
            </div>
          </div>
        </div>

        <!-- 6. LIVE ACTIVITY FEED -->
        <div *ngIf="activeTab === 'activity'" class="tab-panel animate-fade">
          <h4 class="page-title">📜 Live System Activity Feed</h4>

          <div class="card shadow-card">
            <div *ngFor="let log of activityLogs" class="activity-feed-row">
              <span style="font-size: 18px;">⚡</span>
              <div>
                <span class="purple-text font-bold" style="font-size: 12px;">{{ log.actorName || 'System' }} ({{ log.actorRole | uppercase }})</span>
                <p class="activity-desc">{{ log.description }}</p>
                <span class="activity-time">{{ log.createdAt | date:'shortTime' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 7. CRITICAL ALERTS HUB -->
        <div *ngIf="activeTab === 'alerts'" class="tab-panel animate-fade">
          <h4 class="page-title">🚨 Critical Alerts & Attention Hub</h4>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div class="alert-card danger-alert">
              <strong style="font-size: 14px;">⚠️ Unassigned Complaint Timeout Alert</strong>
              <p style="margin: 4px 0 0 0; font-size: 12px;">{{ getMetrics().unassigned }} complaints pending assignment for > 2 hours.</p>
            </div>
            <div class="alert-card warning-alert">
              <strong style="font-size: 14px;">⚡ High Absentees Alert</strong>
              <p style="margin: 4px 0 0 0; font-size: 12px;">Boys Hostel B-1 reported 23% student absent rate today.</p>
            </div>
          </div>
        </div>

        <!-- 8. STUDENTS & USERS MANAGEMENT DIRECTORY -->
        <div *ngIf="activeTab === 'users'" class="tab-panel animate-fade">
          <h4 class="page-title">👥 System Users & Batch Management</h4>

          <!-- Bulk Student Batch Import Section -->
          <div class="card shadow-card" style="margin-bottom: 20px;">
            <h5 class="card-section-title">📥 Bulk Student Batch Import (Excel / CSV)</h5>
            <p class="card-sub-lbl" style="margin-bottom: 14px;">Upload student Excel/CSV sheet to register a full batch at once</p>

            <div *ngIf="batchImportSuccess" class="alert alert-success" style="margin-bottom: 12px;">{{ batchImportSuccess }}</div>
            <div *ngIf="batchImportError" class="alert alert-danger" style="margin-bottom: 12px;">{{ batchImportError }}</div>

            <div style="margin-bottom: 12px;">
              <label class="form-label">Target Batch Name</label>
              <input type="text" class="form-input" [(ngModel)]="bulkBatchName" placeholder="e.g. Batch 2025-2029" />
            </div>

            <div style="margin-bottom: 12px;">
              <label class="form-label">Upload Excel/CSV File</label>
              <input type="file" accept=".csv, .xlsx, .json" (change)="onExcelFileSelected($event)" style="font-size: 12px; width: 100%;" />
            </div>

            <div *ngIf="excelParsedStudents.length > 0" class="parsed-preview-box">
              <span class="purple-text font-bold" style="font-size: 12px;">📄 Preview Parsed Students: {{ excelParsedStudents.length }} records ready to import</span>
            </div>

            <button type="button" class="btn btn-primary" (click)="uploadParsedBatch()" [disabled]="excelParsedStudents.length === 0 || importingBatch">
              <span *ngIf="importingBatch">Importing Student Batch...</span>
              <span *ngIf="!importingBatch">🚀 Register {{ excelParsedStudents.length }} Students Now</span>
            </button>
          </div>

          <!-- Termination & Block Control Center -->
          <div class="card danger-control-card" style="margin-bottom: 24px;">
            <h5 style="margin: 0 0 4px 0; color: #ef4444; font-size: 15px; font-weight: 800;">⛔ Termination & Block Control Center</h5>
            <p style="margin: 0 0 14px 0; font-size: 11.5px; opacity: 0.8;">Terminate individual IDs or block an entire student batch instantly</p>

            <div class="termination-grid">
              <!-- Single ID Termination -->
              <div class="termination-box">
                <label class="form-label" style="color: #ef4444;">1-Click Single User Termination</label>
                <select class="form-input" style="margin-bottom: 8px;" [(ngModel)]="terminateUserIdInput">
                  <option [ngValue]="null">Select User to Block/Terminate</option>
                  <option *ngFor="let u of users" [value]="u.id">{{ u.name }} ({{ u.role | uppercase }}) - ID #{{ u.id }}</option>
                </select>
                <button type="button" class="btn btn-delete-user" (click)="executeSingleUserTermination()">🚫 Block / Terminate User</button>
              </div>

              <!-- Full Batch Termination -->
              <div class="termination-box">
                <label class="form-label" style="color: #ef4444;">1-Click Full Batch Termination</label>
                <input type="text" class="form-input" style="margin-bottom: 8px;" [(ngModel)]="terminateBatchNameInput" placeholder="Type batch name e.g. Batch 2025-2029" />
                <button type="button" class="btn btn-delete-user" (click)="executeBatchTermination()">⚠️ Terminate Entire Batch</button>
              </div>
            </div>
          </div>

          <!-- User Directory List -->
          <div class="user-list">
            <div *ngFor="let u of users" class="card user-card-row">
              <div>
                <strong class="font-bold">{{ u.name }}</strong>
                <span class="card-sub-lbl" style="display: block;">{{ u.email }} | {{ u.role | uppercase }} | Block: {{ u.hostelBlock || 'All' }}</span>
              </div>
              <button class="btn btn-delete-user" (click)="deleteUser(u.id)" style="width: auto; padding: 6px 12px; font-size: 11px;">Delete</button>
            </div>
          </div>
        </div>

        <!-- 9. TASK & WORK DISPATCHER -->
        <div *ngIf="activeTab === 'tasks'" class="tab-panel animate-fade">
          <h4 class="page-title">🗂️ Task & Work Dispatcher</h4>

          <!-- Dispatch Task Card -->
          <div class="card shadow-card" style="margin-bottom: 20px;">
            <h5 class="card-section-title">Dispatch Custom Maintenance Task</h5>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <input type="text" class="form-input" [(ngModel)]="newTaskTitle" placeholder="Task Title (e.g. Clean Terrace Floor Block A)" />
              <textarea class="form-input" [(ngModel)]="newTaskDesc" placeholder="Task details and instructions"></textarea>
              <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <select class="form-input" style="flex: 1;" [(ngModel)]="newTaskStaffId">
                  <option [ngValue]="null">Select Staff Member</option>
                  <option *ngFor="let s of staffList" [value]="s.id">{{ s.name }} ({{ s.bio || 'Maintenance' }})</option>
                </select>
                <select class="form-input" style="flex: 1;" [(ngModel)]="newTaskPriority">
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">URGENT</option>
                </select>
              </div>
              <button class="btn btn-primary" (click)="createTaskSubmit()">🚀 Dispatch Task Now</button>
            </div>
          </div>

          <!-- Dispatched Tasks List -->
          <div class="card shadow-card">
            <h5 class="card-section-title">Dispatched Work Tasks</h5>
            <div *ngFor="let task of staffTasksList" class="task-item-row">
              <div>
                <strong class="font-bold">{{ task.title }}</strong>
                <span class="card-sub-lbl" style="display: block;">Assigned: {{ task.assignedStaff?.name || 'Staff' }} | Priority: {{ task.priority | uppercase }}</span>
              </div>
              <span class="status-tag status-excellent">{{ task.status | uppercase }}</span>
            </div>
          </div>
        </div>

        <!-- 10. CREATE STAFF / WARDEN -->
        <div *ngIf="activeTab === 'create'" class="tab-panel animate-fade">
          <h4 class="page-title">➕ Create Staff or Warden ID Account</h4>
          <div class="card shadow-card" style="max-width: 500px;">
            <form (ngSubmit)="onCreateSubmit()">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-input" [(ngModel)]="createForm.name" name="name" required placeholder="e.g. Ramesh Sharma" />
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" class="form-input" [(ngModel)]="createForm.email" name="email" required placeholder="e.g. ramesh@hostelhub.com" />
              </div>
              <div class="form-group">
                <label class="form-label">Password</label>
                <input type="password" class="form-input" [(ngModel)]="createForm.password" name="password" required placeholder="Set password" />
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number (Optional)</label>
                <input type="text" class="form-input" [(ngModel)]="createForm.phone" name="phone" placeholder="e.g. 9876543210" />
              </div>
              <div class="form-group">
                <label class="form-label">Role</label>
                <select class="form-input" [(ngModel)]="createForm.role" (change)="onRoleChange()" name="role">
                  <option value="staff">Maintenance Staff</option>
                  <option value="warden">Warden</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Trade / Category</label>
                <select class="form-input" [(ngModel)]="createForm.bio" name="bio">
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Painter">Painter</option>
                  <option value="Mason">Mason</option>
                  <option value="AC / AC Technician">AC / AC Technician</option>
                  <option value="Appliance Technician">Appliance Technician</option>
                  <option value="Generator / DG Operator">Generator / DG Operator</option>
                  <option value="RO / Water Purifier Technician">RO / Water Purifier Technician</option>
                  <option value="Lift Operator / Technician">Lift Operator / Technician</option>
                  <option value="Wifi Operator / IT Technician">Wifi Operator / IT Technician</option>
                  <option value="Cleaner / Housekeeping">Cleaner / Housekeeping</option>
                  <option value="Security Guard">Security Guard</option>
                  <option value="Hostel Warden">Hostel Warden</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Assigned Hostel Area</label>
                <select class="form-input" [(ngModel)]="createForm.hostelBlock" name="hostelBlock">
                  <option value="All Hostels">All Hostels</option>
                  <option value="Boys Hostel B-1">Boys Hostel B-1</option>
                  <option value="Boys Hostel B-2">Boys Hostel B-2</option>
                  <option value="Girls Hostel G-1">Girls Hostel G-1</option>
                  <option value="Girls Hostel G-2">Girls Hostel G-2</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary" style="margin-top: 10px;">🚀 Create Account Now</button>
            </form>
          </div>
        </div>

        <!-- SETTINGS TAB -->
        <div *ngIf="activeTab === 'settings'" class="tab-panel animate-fade">
          <h4 class="page-title">⚙️ System Settings</h4>
          <div class="card shadow-card">
            <p class="card-sub-lbl">System settings and portal control center.</p>
          </div>
        </div>

        <!-- PROFILE TAB -->
        <div *ngIf="activeTab === 'my-profile'" class="tab-panel animate-fade">
          <h4 class="page-title">👤 Admin Profile</h4>
          <div class="card shadow-card">
            <p class="card-sub-lbl">Logged in as: <strong>{{ user?.email }}</strong></p>
          </div>
        </div>

      </div>
    </div>

    <!-- INTERACTIVE METRIC DETAILS MODAL -->
    <div *ngIf="showMetricDetailsModal" class="modal-overlay animate-fade">
      <div class="modal-card modal-large">
        <div class="modal-header">
          <h3 style="margin: 0; font-size: 16px;">🔍 {{ metricModalTitle }}</h3>
          <button class="close-btn" (click)="closeMetricDetailsModal()">✕</button>
        </div>
        <div class="modal-body-scroll">
          <div *ngIf="metricModalType === 'complaint'">
            <div *ngFor="let c of metricModalItems" class="card complaint-card-item clickable-card" (click)="openComplaintDetail(c)">
              <div class="complaint-card-header">
                <div>
                  <span class="ticket-badge">#HOST-{{ c.id }}</span>
                  <h5 class="complaint-item-title">{{ c.title }}</h5>
                  <span class="complaint-student-info">Student: {{ c.student?.name || 'Student' }} (Room {{ c.student?.roomNumber || 'N/A' }})</span>
                </div>
                <span [class]="'badge badge-' + c.status">{{ c.status | uppercase }}</span>
              </div>
              <p class="complaint-desc-text">{{ c.description }}</p>
              <div class="complaint-card-footer">
                <span>Assigned: <strong>{{ c.staff?.name || 'Unassigned' }}</strong></span>
                <span>Category: <strong>{{ c.category | uppercase }}</strong></span>
              </div>
            </div>
            <div *ngIf="metricModalItems.length === 0" class="empty-state">
              <span class="empty-icon">📋</span>
              <p>No complaints found in this category.</p>
            </div>
          </div>

          <div *ngIf="metricModalType === 'user'">
            <div *ngFor="let u of metricModalItems" class="card user-card-row">
              <div>
                <strong class="font-bold">{{ u.name }}</strong>
                <span class="card-sub-lbl" style="display: block;">{{ u.email }} | Role: {{ u.role | uppercase }} | Status: {{ u.status | uppercase }}</span>
              </div>
              <button class="btn btn-secondary" (click)="openStaffDetail(u)" style="width: auto; padding: 4px 10px; font-size: 11px;">View Profile 👤</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- INTERACTIVE COMPLAINT DETAIL MODAL -->
    <div *ngIf="showComplaintDetailModal && selectedComplaintDetail" class="modal-overlay animate-fade">
      <div class="modal-card">
        <div class="modal-header">
          <h3 style="margin: 0; font-size: 16px;">📋 Complaint #HOST-{{ selectedComplaintDetail.id }} Details</h3>
          <button class="close-btn" (click)="closeComplaintDetailModal()">✕</button>
        </div>
        <div class="modal-body-scroll">
          <h4 style="margin: 0 0 6px 0; color: var(--text-primary);">{{ selectedComplaintDetail.title }}</h4>
          <span [class]="'badge badge-' + selectedComplaintDetail.status" style="margin-bottom: 12px; display: inline-block;">{{ selectedComplaintDetail.status | uppercase }}</span>

          <div class="detail-section">
            <span class="form-label">Description</span>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">{{ selectedComplaintDetail.description }}</p>
          </div>

          <div class="detail-section">
            <span class="form-label">Student Information</span>
            <p style="font-size: 12.5px; color: var(--text-primary); margin: 0;">Name: <strong>{{ selectedComplaintDetail.student?.name || 'N/A' }}</strong></p>
            <p style="font-size: 12.5px; color: var(--text-primary); margin: 0;">Room & Hostel: <strong>Room {{ selectedComplaintDetail.student?.roomNumber || 'N/A' }}, {{ selectedComplaintDetail.student?.hostelBlock || 'N/A' }}</strong></p>
            <p style="font-size: 12.5px; color: var(--text-primary); margin: 0;">Phone: <strong>{{ selectedComplaintDetail.student?.phone || 'N/A' }}</strong></p>
          </div>

          <div class="detail-section" style="margin-top: 12px;">
            <span class="form-label">Assign Maintenance Staff</span>
            <div style="display: flex; gap: 8px; margin-top: 4px;">
              <select class="form-input" [(ngModel)]="assignStaffIdInput">
                <option [ngValue]="null">Select Staff Member</option>
                <option *ngFor="let s of staffList" [value]="s.id">{{ s.name }} ({{ s.bio || 'Maintenance' }})</option>
              </select>
              <button class="btn btn-primary" (click)="assignStaffSubmit(selectedComplaintDetail.id)" style="width: auto; padding: 8px 14px;">Assign</button>
            </div>
          </div>

          <div style="margin-top: 18px; border-top: 1px solid var(--border-color); padding-top: 12px; display: flex; gap: 10px;">
            <button class="btn btn-delete-user" (click)="deleteComplaintSubmit(selectedComplaintDetail.id)" style="flex: 1;">Delete Ticket</button>
            <button class="btn btn-secondary" (click)="closeComplaintDetailModal()" style="flex: 1;">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- INTERACTIVE STAFF DETAIL MODAL -->
    <div *ngIf="showStaffDetailModal && selectedStaffDetail" class="modal-overlay animate-fade">
      <div class="modal-card">
        <div class="modal-header">
          <h3 style="margin: 0; font-size: 16px;">👤 Staff Member Profile</h3>
          <button class="close-btn" (click)="closeStaffDetailModal()">✕</button>
        </div>
        <div class="modal-body-scroll">
          <h4 style="margin: 0 0 2px 0; color: var(--text-primary);">{{ selectedStaffDetail.name }}</h4>
          <span class="category-highlight" style="font-size: 12px; font-weight: 700; display: block; margin-bottom: 10px;">{{ selectedStaffDetail.category || selectedStaffDetail.bio || 'Maintenance Staff' }}</span>

          <div class="detail-section">
            <p style="font-size: 12.5px; margin: 2px 0;">Email: <strong>{{ selectedStaffDetail.email || 'N/A' }}</strong></p>
            <p style="font-size: 12.5px; margin: 2px 0;">Role: <strong>{{ selectedStaffDetail.role | uppercase }}</strong></p>
            <p style="font-size: 12.5px; margin: 2px 0;">Hostel Area: <strong>{{ selectedStaffDetail.hostelBlock || 'All Hostels' }}</strong></p>
            <p style="font-size: 12.5px; margin: 2px 0;">Status: <strong class="green-text">{{ selectedStaffDetail.status || 'Active' }}</strong></p>
          </div>

          <div style="margin-top: 14px; padding: 10px; background: var(--bg-muted); border-radius: 10px;">
            <span class="form-label">Performance Breakdown</span>
            <div style="display: flex; justify-content: space-around; margin-top: 6px; text-align: center;">
              <div><span style="font-size: 10px; color: var(--text-muted);">Assigned</span><strong style="display: block; font-size: 16px;">{{ selectedStaffDetail.assigned || 0 }}</strong></div>
              <div><span style="font-size: 10px; color: var(--text-muted);">Resolved</span><strong style="display: block; font-size: 16px;" class="green-text">{{ selectedStaffDetail.resolved || 0 }}</strong></div>
              <div><span style="font-size: 10px; color: var(--text-muted);">Pending</span><strong style="display: block; font-size: 16px;" class="yellow-text">{{ selectedStaffDetail.pending || 0 }}</strong></div>
            </div>
          </div>

          <button class="btn btn-secondary" (click)="closeStaffDetailModal()" style="width: 100%; margin-top: 16px;">Close Profile</button>
        </div>
      </div>
    </div>

  `,
  styles: [`
    .dashboard-container { padding: 16px; max-width: 1200px; margin: 0 auto; font-family: var(--font-sans); }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: var(--bg-card); padding: 14px 20px; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); }
    .user-info { display: flex; align-items: center; gap: 12px; }
    .avatar-ring { width: 42px; height: 42px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; }
    .header-actions { display: flex; gap: 8px; }
    .admin-tab-nav { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 16px; -webkit-overflow-scrolling: touch; }
    .admin-tab-nav button { white-space: nowrap; padding: 8px 14px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-secondary); font-weight: 700; font-size: 12px; cursor: pointer; transition: all 0.2s; }
    .admin-tab-nav button.active { background: var(--primary); color: white; border-color: var(--primary); }
    
    .page-title { font-weight: 900; font-size: 18px; margin-bottom: 14px; color: var(--text-primary); }
    .card-section-title { margin: 0 0 12px 0; color: var(--text-primary); font-size: 15px; font-weight: 800; }
    .card-sub-lbl { font-size: 11.5px; color: var(--text-secondary); }
    .font-bold { font-weight: 700; }

    .ai-insight-banner { background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%); color: white; padding: 14px 18px; border-radius: 14px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; }
    .live-tag { background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 800; color: white; }

    .shadow-card { background: var(--bg-card); color: var(--text-primary); padding: 18px; border-radius: 16px; border: 1px solid var(--border-color); margin-bottom: 20px; box-shadow: var(--shadow-sm); }
    
    .metrics-grid-auto { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; }
    .metric-box { background: var(--bg-muted); padding: 12px; border-radius: 10px; border-left: 4px solid var(--primary); transition: transform 0.2s; }
    .clickable-box { cursor: pointer; }
    .clickable-box:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .clickable-hint { font-size: 11px; color: var(--primary); font-weight: 700; }
    .detail-link-text { font-size: 10px; color: var(--primary); display: block; margin-top: 4px; font-weight: 700; }

    .border-purple { border-left-color: #6366f1; }
    .border-green { border-left-color: #22c55e; }
    .border-yellow { border-left-color: #eab308; }
    .border-blue { border-left-color: #3b82f6; }
    .border-red { border-left-color: #ef4444; }
    .border-indigo { border-left-color: #a855f7; }
    .border-teal { border-left-color: #14b8a6; }
    .border-orange { border-left-color: #f97316; }

    .metric-lbl { font-size: 11px; color: var(--text-muted); display: block; }
    .metric-val { font-size: 20px; font-weight: 900; }
    .purple-text { color: #818cf8; }
    .green-text { color: #4ade80; }
    .yellow-text { color: #fde047; }
    .blue-text { color: #60a5fa; }
    .red-text { color: #fca5a5; }
    .indigo-text { color: #c084fc; }
    .teal-text { color: #2dd4bf; }
    .orange-text { color: #fb923c; }

    .card-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
    .period-toggle-group { display: flex; background: var(--bg-muted); padding: 3px; border-radius: 8px; gap: 3px; }
    .period-toggle-group button { background: transparent; color: var(--text-secondary); border: none; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; }
    .period-toggle-group button.active { background: var(--primary); color: white; }

    .bar-chart-container { display: flex; align-items: flex-end; gap: 12px; height: 160px; padding: 10px 0; border-bottom: 1px solid var(--border-color); }
    .bar-item { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; gap: 6px; }
    .bar-val-tag { font-size: 10px; color: var(--primary); font-weight: 800; }
    .bar-fill { width: 100%; max-width: 32px; background: linear-gradient(180deg, var(--primary) 0%, var(--primary-dark) 100%); border-radius: 6px 6px 0 0; transition: height 0.4s ease; }
    .bar-label { font-size: 9.5px; color: var(--text-muted); font-weight: 600; white-space: nowrap; }

    .filter-matrix-card { background: var(--bg-card); padding: 14px; border-radius: 14px; margin-bottom: 16px; border: 1px solid var(--border-color); display: flex; gap: 10px; flex-wrap: wrap; }
    .filter-select { flex: 1; min-width: 130px; }

    .complaint-card-item { padding: 16px; border-radius: 14px; margin-bottom: 12px; background: var(--bg-card); border: 1px solid var(--border-color); }
    .clickable-card { cursor: pointer; transition: border-color 0.2s, transform 0.2s; }
    .clickable-card:hover { border-color: var(--primary); transform: translateY(-1px); }
    .complaint-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .ticket-badge { font-size: 11px; background: var(--primary-light); color: var(--primary); padding: 2px 8px; border-radius: 6px; font-weight: 800; }
    .complaint-item-title { margin: 4px 0 2px 0; color: var(--text-primary); font-size: 15px; font-weight: 700; }
    .complaint-student-info { font-size: 11px; color: var(--text-muted); }
    .complaint-desc-text { font-size: 12.5px; color: var(--text-secondary); margin-bottom: 10px; }
    .complaint-card-footer { display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-muted); border-top: 1px solid var(--border-color); padding-top: 8px; flex-wrap: wrap; gap: 6px; }
    .staff-highlight { color: var(--primary); }
    .view-detail-badge { font-size: 10.5px; color: var(--primary); font-weight: 700; }

    .custom-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12.5px; min-width: 600px; }
    .custom-table th { padding: 10px; border-bottom: 1.5px solid var(--border-color); color: var(--text-muted); }
    .custom-table td { padding: 12px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); }
    .clickable-row { cursor: pointer; }
    .clickable-row:hover { background: var(--bg-muted); }
    .rating-star { color: #facc15; font-weight: 800; }
    .status-tag { padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; }
    .status-excellent { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
    .status-moderate { background: rgba(234, 179, 8, 0.15); color: #eab308; }
    .status-attention { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

    .attendance-top-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 20px; }
    .attendance-card { padding: 16px; border-radius: 14px; }
    .border-left-green { border-left: 4px solid #22c55e; }
    .border-left-purple { border-left: 4px solid #6366f1; }
    .attendance-big-val { font-size: 26px; font-weight: 900; display: block; margin: 4px 0; }

    .block-attendance-item { margin-bottom: 12px; background: var(--bg-muted); padding: 12px; border-radius: 10px; }
    .block-att-header { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
    .progress-track-bg { background: var(--bg-card); height: 8px; border-radius: 4px; overflow: hidden; }
    .progress-track-fill { height: 100%; border-radius: 4px; }
    .green-fill { background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%); }
    .alert-block-text { margin-top: 6px; font-size: 10.5px; color: #ef4444; font-weight: 700; }

    .feedback-score-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; }
    .rating-big-score { margin: 4px 0 0 0; color: #facc15; font-size: 32px; font-weight: 900; }
    .star-distribution-box { flex: 1; max-width: 250px; }
    .star-row { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-secondary); margin-bottom: 2px; }
    .star-bar-track { flex: 1; background: var(--bg-muted); height: 6px; border-radius: 3px; overflow: hidden; }
    .star-bar-fill { background: #facc15; height: 100%; }

    .review-item-box { background: var(--bg-muted); padding: 12px; border-radius: 10px; margin-bottom: 10px; }
    .review-item-header { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: var(--text-primary); }
    .review-comment { font-size: 12px; color: var(--text-secondary); margin: 0; }

    .activity-feed-row { display: flex; gap: 12px; border-bottom: 1px solid var(--border-color); padding: 10px 0; align-items: center; }
    .activity-desc { margin: 2px 0 0 0; font-size: 12px; color: var(--text-secondary); }
    .activity-time { font-size: 10px; color: var(--text-muted); }

    .alert-card { padding: 16px; border-radius: 14px; color: white; }
    .danger-alert { background: #450a0a; border: 1.5px solid #ef4444; }
    .warning-alert { background: #422006; border: 1.5px solid #eab308; }

    .parsed-preview-box { margin-bottom: 12px; padding: 10px; background: var(--bg-muted); border-radius: 8px; border: 1px solid var(--primary); }
    .danger-control-card { border: 1.5px solid #ef4444; padding: 18px; border-radius: 16px; background: rgba(239, 68, 68, 0.05); }
    .termination-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
    .termination-box { background: var(--bg-card); padding: 14px; border-radius: 12px; border: 1px solid var(--border-color); }
    .user-card-row { padding: 14px; border-radius: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
    .task-item-row { background: var(--bg-muted); padding: 12px; border-radius: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }

    .logout-btn { background: #ef4444; color: white; border: none; padding: 8px 12px; border-radius: 8px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-size: 12px; }

    /* MODAL STYLES */
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
    .modal-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 18px; padding: 20px; max-width: 500px; width: 100%; color: var(--text-primary); box-shadow: var(--shadow-lg); }
    .modal-large { max-width: 650px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; }
    .close-btn { background: var(--bg-muted); border: 1px solid var(--border-color); color: var(--text-muted); width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-weight: 800; display: flex; align-items: center; justify-content: center; }
    .modal-body-scroll { max-height: 70vh; overflow-y: auto; padding-right: 4px; }
    .detail-section { margin-bottom: 10px; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  user: User | null = null;
  activeTab: string = 'stats';
  isDarkMode = true;
  period = 'week';

  analytics: any = null;
  mgmtTrendData: any = null;
  staffPerformanceList: any[] = [];
  attendanceStats: any = null;
  messAnalytics: any = null;
  activityLogs: any[] = [];
  staffTasksList: any[] = [];
  filteredComplaints: any[] = [];
  allComplaints: any[] = [];
  users: User[] = [];
  staffList: User[] = [];

  workflowStatusFilter = 'all';
  workflowCategoryFilter = 'all';

  bulkBatchName = 'Batch 2025-2029';
  excelParsedStudents: any[] = [];
  importingBatch = false;
  batchImportSuccess = '';
  batchImportError = '';

  terminateUserIdInput: number | null = null;
  terminateBatchNameInput = '';

  newTaskTitle = '';
  newTaskDesc = '';
  newTaskStaffId: number | null = null;
  newTaskPriority = 'medium';

  createForm = { name: '', email: '', password: '', role: 'staff', phone: '', bio: 'Electrician', hostelBlock: 'All Hostels' };

  // Interactive Modals State
  showMetricDetailsModal = false;
  metricModalTitle = '';
  metricModalItems: any[] = [];
  metricModalType: 'complaint' | 'user' = 'complaint';

  showComplaintDetailModal = false;
  selectedComplaintDetail: any = null;
  assignStaffIdInput: number | null = null;

  showStaffDetailModal = false;
  selectedStaffDetail: any = null;

  selectedAttendanceMonth = new Date().toISOString().slice(0, 7);
  monthlyAttendanceReport: any = null;

  onRoleChange(): void {
    if (this.createForm.role === 'warden') {
      this.createForm.bio = 'Hostel Warden';
    } else if (this.createForm.role === 'staff' && this.createForm.bio === 'Hostel Warden') {
      this.createForm.bio = 'Electrician';
    }
  }

  constructor(
    private authService: AuthService,
    private complaintService: ComplaintService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    this.isDarkMode = localStorage.getItem('admin_theme') !== 'light';
    document.body.classList.toggle('dark-mode', this.isDarkMode);

    this.loadGraphicalAnalytics();
    this.loadUsers();
    this.loadStaffPerformance();
    this.loadAttendanceStats();
    this.loadMonthlyAttendanceReport();
    this.loadMessAnalytics();
    this.loadActivityLogs();
    this.loadStaffTasks();
    this.loadComplaints();
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  switchPeriod(p: string): void {
    this.period = p;
    this.loadGraphicalAnalytics();
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    localStorage.setItem('admin_theme', this.isDarkMode ? 'dark' : 'light');
    this.cdr.detectChanges();
  }

  // Calculate Real-Time Operations Metrics dynamically from Live Backend Data
  getMetrics() {
    const total = this.allComplaints.length;
    const resolved = this.allComplaints.filter(c => c.status === 'resolved').length;
    const pending = this.allComplaints.filter(c => c.status === 'pending').length;
    const inProgress = this.allComplaints.filter(c => c.status === 'in_progress' || c.status === 'assigned').length;
    const unassigned = this.allComplaints.filter(c => !c.assignedStaffId && c.status === 'pending').length;
    const escalated = this.allComplaints.filter(c => c.status === 'escalated' || c.isEscalated).length;
    
    const activeStaff = this.users.filter(u => u.role === 'staff' && u.status === 'active').length;
    const totalStaff = this.users.filter(u => u.role === 'staff').length;
    const activeWardens = this.users.filter(u => u.role === 'warden' && u.status === 'active').length;
    const totalWardens = this.users.filter(u => u.role === 'warden').length;

    return { total, resolved, pending, inProgress, unassigned, escalated, activeStaff, totalStaff, activeWardens, totalWardens };
  }

  // Interactive Metric Details Modal opener
  openMetricDetails(metricType: string): void {
    if (metricType === 'total') {
      this.metricModalTitle = 'All System Complaints';
      this.metricModalItems = [...this.allComplaints];
      this.metricModalType = 'complaint';
    } else if (metricType === 'resolved') {
      this.metricModalTitle = 'Resolved Complaints';
      this.metricModalItems = this.allComplaints.filter(c => c.status === 'resolved');
      this.metricModalType = 'complaint';
    } else if (metricType === 'pending') {
      this.metricModalTitle = 'Pending Complaints';
      this.metricModalItems = this.allComplaints.filter(c => c.status === 'pending');
      this.metricModalType = 'complaint';
    } else if (metricType === 'inProgress') {
      this.metricModalTitle = 'Open / In-Progress Complaints';
      this.metricModalItems = this.allComplaints.filter(c => c.status === 'in_progress' || c.status === 'assigned');
      this.metricModalType = 'complaint';
    } else if (metricType === 'unassigned') {
      this.metricModalTitle = 'Unassigned Complaints';
      this.metricModalItems = this.allComplaints.filter(c => !c.assignedStaffId && c.status === 'pending');
      this.metricModalType = 'complaint';
    } else if (metricType === 'escalated') {
      this.metricModalTitle = 'Escalated Complaints';
      this.metricModalItems = this.allComplaints.filter(c => c.status === 'escalated' || c.isEscalated);
      this.metricModalType = 'complaint';
    } else if (metricType === 'activeStaff') {
      this.metricModalTitle = 'Maintenance Staff Directory';
      this.metricModalItems = this.users.filter(u => u.role === 'staff');
      this.metricModalType = 'user';
    } else if (metricType === 'activeWardens') {
      this.metricModalTitle = 'Hostel Wardens Directory';
      this.metricModalItems = this.users.filter(u => u.role === 'warden');
      this.metricModalType = 'user';
    }
    this.showMetricDetailsModal = true;
    this.cdr.detectChanges();
  }

  closeMetricDetailsModal(): void {
    this.showMetricDetailsModal = false;
    this.cdr.detectChanges();
  }

  // Interactive Complaint Detail Modal
  openComplaintDetail(c: any): void {
    this.selectedComplaintDetail = c;
    this.assignStaffIdInput = c.assignedStaffId || c.staffId || null;
    this.showComplaintDetailModal = true;
    this.cdr.detectChanges();
  }

  closeComplaintDetailModal(): void {
    this.showComplaintDetailModal = false;
    this.selectedComplaintDetail = null;
    this.cdr.detectChanges();
  }

  assignStaffSubmit(complaintId: number): void {
    if (!this.assignStaffIdInput) {
      alert('Please select a staff member.');
      return;
    }
    this.complaintService.assignComplaint(complaintId, this.assignStaffIdInput).subscribe({
      next: (res: any) => {
        alert('✅ Complaint assigned successfully!');
        this.closeComplaintDetailModal();
        this.loadComplaints();
      },
      error: (err: any) => alert(`❌ ${err.error?.message || 'Failed to assign complaint.'}`)
    });
  }

  deleteComplaintSubmit(complaintId: number): void {
    if (!confirm('Are you sure you want to delete this complaint?')) return;
    this.complaintService.deleteComplaint(complaintId).subscribe({
      next: (res: any) => {
        alert('✅ Complaint deleted successfully!');
        this.closeComplaintDetailModal();
        this.loadComplaints();
      },
      error: (err: any) => alert(`❌ ${err.error?.message || 'Failed to delete complaint.'}`)
    });
  }

  // Interactive Staff Detail Modal
  openStaffDetail(staff: any): void {
    this.selectedStaffDetail = staff;
    this.showStaffDetailModal = true;
    this.cdr.detectChanges();
  }

  closeStaffDetailModal(): void {
    this.showStaffDetailModal = false;
    this.selectedStaffDetail = null;
    this.cdr.detectChanges();
  }

  loadGraphicalAnalytics(): void {
    this.complaintService.getManagementAnalytics(this.period).subscribe({
      next: (res: any) => {
        this.mgmtTrendData = res;
        this.analytics = { summary: { total: res.summary.totalComplaints, pending: res.summary.pendingComplaints, resolved: res.summary.resolvedComplaints, assigned: res.summary.inProgressComplaints, inProgress: 0 } };
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error analytics:', err)
    });
  }

  loadUsers(): void {
    this.complaintService.getAllUsers().subscribe({
      next: (res: any) => {
        this.users = res;
        this.staffList = res.filter((u: any) => u.role === 'staff' || u.role === 'warden');
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error users:', err)
    });
  }

  loadStaffPerformance(): void {
    this.complaintService.getStaffPerformance().subscribe({
      next: (res: any) => {
        this.staffPerformanceList = res;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error staff performance:', err)
    });
  }

  loadAttendanceStats(): void {
    this.complaintService.getAttendanceStats().subscribe({
      next: (res: any) => {
        this.attendanceStats = res;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error attendance stats:', err)
    });
  }

  loadMonthlyAttendanceReport(): void {
    this.complaintService.getMonthlyAttendanceReport(this.selectedAttendanceMonth).subscribe({
      next: (res: any) => {
        this.monthlyAttendanceReport = res;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error monthly attendance report:', err)
    });
  }

  loadMessAnalytics(): void {
    this.complaintService.getMessAnalytics().subscribe({
      next: (res: any) => {
        this.messAnalytics = res;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error mess analytics:', err)
    });
  }

  loadActivityLogs(): void {
    this.complaintService.getActivityLogs().subscribe({
      next: (res: any) => {
        this.activityLogs = res;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error activity logs:', err)
    });
  }

  loadStaffTasks(): void {
    this.complaintService.getStaffTasks().subscribe({
      next: (res: any) => {
        this.staffTasksList = res;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error staff tasks:', err)
    });
  }

  loadComplaints(): void {
    this.complaintService.getAllComplaints().subscribe({
      next: (res: any) => {
        this.allComplaints = res;
        this.filterComplaints();
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error complaints:', err)
    });
  }

  filterComplaints(): void {
    this.filteredComplaints = this.allComplaints.filter(c => {
      const matchStatus = this.workflowStatusFilter === 'all' || 
        (c.status && c.status.toLowerCase() === this.workflowStatusFilter.toLowerCase());
      const matchCat = this.workflowCategoryFilter === 'all' || 
        (c.category && c.category.toLowerCase() === this.workflowCategoryFilter.toLowerCase());
      return matchStatus && matchCat;
    });
  }

  resetFilters(): void {
    this.workflowStatusFilter = 'all';
    this.workflowCategoryFilter = 'all';
    this.filterComplaints();
  }

  getTrendBarHeight(val: number): number {
    if (!this.mgmtTrendData || !this.mgmtTrendData.timeSeries) return 20;
    const maxVal = Math.max(...this.mgmtTrendData.timeSeries.map((t: any) => t.complaints), 1);
    return Math.max(Math.round((val / maxVal) * 100), 20);
  }

  onExcelFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const text = e.target.result;
      const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
      if (lines.length <= 1) return;
      const headers = lines[0].split(',').map((h: string) => h.trim().replace(/^"|"$/g, ''));
      const parsed: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const currentline = lines[i].split(',').map((c: string) => c.trim().replace(/^"|"$/g, ''));
        if (currentline.length < 2) continue;
        const obj: any = {};
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentline[j] || '';
        }
        parsed.push(obj);
      }
      this.excelParsedStudents = parsed;
      this.cdr.detectChanges();
    };
    reader.readAsText(file);
  }

  uploadParsedBatch(): void {
    if (this.excelParsedStudents.length === 0) return;
    this.importingBatch = true;
    this.batchImportSuccess = '';
    this.batchImportError = '';
    this.cdr.detectChanges();

    this.complaintService.bulkImportStudents(this.excelParsedStudents, this.bulkBatchName).subscribe({
      next: (res: any) => {
        this.importingBatch = false;
        this.batchImportSuccess = `✅ ${res.message || 'Batch created successfully!'}`;
        this.excelParsedStudents = [];
        this.loadUsers();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.importingBatch = false;
        this.batchImportError = `❌ ${err.error?.message || err.message || 'Failed to import batch.'}`;
        this.cdr.detectChanges();
      }
    });
  }

  executeSingleUserTermination(): void {
    if (!this.terminateUserIdInput) {
      alert('Please select or enter a User ID.');
      return;
    }
    if (!confirm(`Are you sure you want to block/terminate User ID #${this.terminateUserIdInput}?`)) return;

    this.complaintService.terminateUser(this.terminateUserIdInput).subscribe({
      next: (res: any) => {
        alert(`✅ ${res.message}`);
        this.terminateUserIdInput = null;
        this.loadUsers();
      },
      error: (err: any) => alert(`❌ ${err.error?.message || 'Failed to terminate user.'}`)
    });
  }

  executeBatchTermination(): void {
    if (!this.terminateBatchNameInput.trim()) {
      alert('Please enter or select a Batch Name.');
      return;
    }
    const targetBatch = this.terminateBatchNameInput.trim();
    if (!confirm(`⚠️ DANGER: Are you sure you want to block ALL students in "${targetBatch}"?`)) return;

    this.complaintService.terminateBatch(targetBatch).subscribe({
      next: (res: any) => {
        alert(`✅ ${res.message}`);
        this.terminateBatchNameInput = '';
        this.loadUsers();
      },
      error: (err: any) => alert(`❌ ${err.error?.message || 'Failed to terminate batch.'}`)
    });
  }

  createTaskSubmit(): void {
    if (!this.newTaskTitle) {
      alert('Please enter a task title.');
      return;
    }
    this.complaintService.createStaffTask({
      title: this.newTaskTitle,
      description: this.newTaskDesc,
      assignedStaffId: this.newTaskStaffId,
      priority: this.newTaskPriority
    }).subscribe({
      next: (res: any) => {
        alert(`✅ ${res.message}`);
        this.newTaskTitle = '';
        this.newTaskDesc = '';
        this.newTaskStaffId = null;
        this.loadStaffTasks();
      },
      error: (err: any) => alert(`❌ ${err.error?.message || 'Failed to create task.'}`)
    });
  }

  onCreateSubmit(): void {
    if (!this.createForm.name || !this.createForm.email || !this.createForm.password) {
      alert('Please fill out Name, Email, and Password.');
      return;
    }
    this.complaintService.createStaffAccount(this.createForm).subscribe({
      next: (res: any) => {
        alert(`✅ ${res.message || 'Account created successfully!'}`);
        this.createForm = { name: '', email: '', password: '', role: 'staff', phone: '', bio: 'Electrician', hostelBlock: 'All Hostels' };
        this.loadUsers();
      },
      error: (err: any) => alert(`❌ ${err.error?.message || err.message || 'Failed to create account.'}`)
    });
  }

  deleteUser(userId: number): void {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.complaintService.deleteUser(userId).subscribe({
      next: (res: any) => {
        alert('✅ User deleted successfully!');
        this.loadUsers();
      },
      error: (err: any) => alert(`❌ ${err.error?.message || 'Failed to delete user.'}`)
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
