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

      <!-- Photo Zoom Modal -->
      <div class="modal-overlay" *ngIf="zoomPhotoUrl" (click)="closePhotoModal()" style="z-index: 99999;">
        <div class="modal-card" (click)="$event.stopPropagation()" style="max-width: 90vw; max-height: 90vh; text-align: center; background: rgba(0,0,0,0.9); padding: 16px; border-radius: 18px; position: relative;">
          <button class="close-btn" (click)="closePhotoModal()" style="position: absolute; top: 12px; right: 12px; z-index: 10;">✕</button>
          <img [src]="zoomPhotoUrl" alt="Zoomed View" style="max-width: 100%; max-height: 80vh; border-radius: 12px; object-fit: contain;" />
        </div>
      </div>

      <!-- TAB CONTENT AREA -->
      <div class="tab-content-area">

        <!-- TAB NAVIGATION (Horizontal Scrollable Bar) -->
        <div class="admin-tab-nav">
          <button (click)="switchTab('stats')" [class.active]="activeTab === 'stats'">📊 Dashboard</button>
          <button (click)="switchTab('workflow')" [class.active]="activeTab === 'workflow'">🛠️ Work Flow</button>
          <button (click)="switchTab('performance')" [class.active]="activeTab === 'performance'">👨‍🔧 Staff Stats</button>
          <button (click)="switchTab('feedback')" [class.active]="activeTab === 'feedback'">⭐ Reviews & Feedback</button>
          <button (click)="switchTab('notices')" [class.active]="activeTab === 'notices'">📢 Notices</button>
          <button (click)="switchTab('activity')" [class.active]="activeTab === 'activity'">📜 Activity Log</button>
          <button (click)="switchTab('users')" [class.active]="activeTab === 'users'">👥 Students & Users</button>
          <button (click)="switchTab('create')" [class.active]="activeTab === 'create'">➕ Create Account</button>
          <button (click)="switchTab('settings')" [class.active]="activeTab === 'settings'">⚙️ Settings</button>
          <button (click)="switchTab('my-profile')" [class.active]="activeTab === 'my-profile'">👤 Profile</button>
        </div>

        <!-- 1. DASHBOARD & REAL-TIME STATS -->
        <div *ngIf="activeTab === 'stats'" class="tab-panel">
          <h4 class="page-title">📊 Executive Real-Time Dashboard</h4>

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
            <div class="bar-chart-container" style="display: flex; align-items: flex-end; justify-content: space-around; height: 180px; padding: 20px 10px 10px 10px; background: var(--bg-muted); border-radius: 14px; border: 1px solid var(--border-color); margin-bottom: 20px;">
              <div *ngFor="let t of getTrendData()" class="bar-item" style="display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; flex: 1; max-width: 50px;">
                <span class="bar-val-tag" style="font-size: 11px; font-weight: 800; color: var(--purple-primary); margin-bottom: 4px;">{{ t.complaints }}</span>
                <div [style.height.%]="getTrendBarHeight(t.complaints)" class="bar-fill" style="width: 100%; max-width: 28px; background: linear-gradient(180deg, #6366f1, #4f46e5); border-radius: 6px 6px 0 0; transition: height 0.4s ease;"></div>
                <span class="bar-label" style="font-size: 11px; margin-top: 6px; color: var(--text-secondary); font-weight: 600;">{{ t.label }}</span>
              </div>
            </div>

            <!-- Category Breakdown Progress Bars -->
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color);">
              <h5 class="card-section-title" style="margin-bottom: 12px; font-size: 13.5px;">🗂️ System Complaint Category Distribution Graph</h5>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <div *ngFor="let cat of getCategoryDistribution()">
                  <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; font-weight: 600;">
                    <span>{{ cat.icon }} {{ cat.name }}</span>
                    <span style="color: var(--text-secondary);">{{ cat.count }} Tickets ({{ cat.pct }}%)</span>
                  </div>
                  <div style="height: 10px; width: 100%; background: var(--bg-muted); border-radius: 10px; overflow: hidden; border: 1px solid var(--border-color);">
                    <div [style.width.%]="cat.pct" [style.background]="cat.color" style="height: 100%; border-radius: 10px; transition: width 0.5s ease;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. COMPLETE WORK FLOW (COMPLAINTS MATRIX) -->
        <div *ngIf="activeTab === 'workflow'" class="tab-panel">
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
        <div *ngIf="activeTab === 'performance'" class="tab-panel">
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
                    <td>
                      <button class="btn btn-secondary" (click)="openStaffDetail(s); $event.stopPropagation();" style="padding: 4px 8px; font-size: 11px;">View Profile 👤</button>
                      <button class="btn btn-secondary" (click)="openEditUserModal(s); $event.stopPropagation();" style="padding: 4px 8px; font-size: 11px; margin-left: 4px;">Edit ✏️</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 5. FEEDBACK & REVIEWS (MESS FOOD REVIEWS) -->
        <div *ngIf="activeTab === 'feedback'" class="tab-panel">
          <h4 class="page-title">⭐ Student Mess Food Quality & Reviews</h4>

          <!-- Rating Breakdown Header -->
          <div class="card shadow-card" style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 14px;">
              <div>
                <span class="card-sub-lbl" style="text-transform: uppercase; font-weight: 700;">Mess Food Quality Overall Score</span>
                <h2 class="rating-big-score" style="margin: 4px 0;">⭐ {{ getMessMealStats().overallAvg }} <span style="font-size: 14px; opacity: 0.7;">/ 5.0</span></h2>
                <span class="card-sub-lbl">Based on {{ getMessMealStats().total }} student reviews submitted</span>
              </div>
              <span class="clickable-hint">💡 Tap metric box below to filter meal type</span>
            </div>

            <!-- Meal Quality Filter Metric Cards -->
            <div class="metrics-grid-auto">
              <div 
                class="metric-box clickable-box" 
                [style.border]="selectedMealFilter === 'all' ? '2px solid #b31031' : '1px solid var(--border-color)'"
                [style.background]="selectedMealFilter === 'all' ? 'rgba(179, 16, 49, 0.08)' : 'var(--bg-card)'"
                (click)="filterMealReviews('all')"
              >
                <span class="metric-lbl">All Reviews</span>
                <strong class="metric-val purple-text">⭐ {{ getMessMealStats().overallAvg }}</strong>
                <span class="detail-link-text">{{ getMessMealStats().total }} Reviews →</span>
              </div>

              <div 
                class="metric-box clickable-box" 
                [style.border]="selectedMealFilter === 'breakfast' ? '2px solid #b31031' : '1px solid var(--border-color)'"
                [style.background]="selectedMealFilter === 'breakfast' ? 'rgba(179, 16, 49, 0.08)' : 'var(--bg-card)'"
                (click)="filterMealReviews('breakfast')"
              >
                <span class="metric-lbl">Breakfast</span>
                <strong class="metric-val green-text">🍳 {{ getMessMealStats().bCount }}</strong>
                <span class="detail-link-text">⭐ {{ getMessMealStats().bAvg }} Avg →</span>
              </div>

              <div 
                class="metric-box clickable-box" 
                [style.border]="selectedMealFilter === 'lunch' ? '2px solid #b31031' : '1px solid var(--border-color)'"
                [style.background]="selectedMealFilter === 'lunch' ? 'rgba(179, 16, 49, 0.08)' : 'var(--bg-card)'"
                (click)="filterMealReviews('lunch')"
              >
                <span class="metric-lbl">Lunch</span>
                <strong class="metric-val blue-text">🍛 {{ getMessMealStats().lCount }}</strong>
                <span class="detail-link-text">⭐ {{ getMessMealStats().lAvg }} Avg →</span>
              </div>

              <div 
                class="metric-box clickable-box" 
                [style.border]="selectedMealFilter === 'snacks' ? '2px solid #b31031' : '1px solid var(--border-color)'"
                [style.background]="selectedMealFilter === 'snacks' ? 'rgba(179, 16, 49, 0.08)' : 'var(--bg-card)'"
                (click)="filterMealReviews('snacks')"
              >
                <span class="metric-lbl">Snacks</span>
                <strong class="metric-val yellow-text">☕ {{ getMessMealStats().sCount }}</strong>
                <span class="detail-link-text">⭐ {{ getMessMealStats().sAvg }} Avg →</span>
              </div>

              <div 
                class="metric-box clickable-box" 
                [style.border]="selectedMealFilter === 'dinner' ? '2px solid #b31031' : '1px solid var(--border-color)'"
                [style.background]="selectedMealFilter === 'dinner' ? 'rgba(179, 16, 49, 0.08)' : 'var(--bg-card)'"
                (click)="filterMealReviews('dinner')"
              >
                <span class="metric-lbl">Dinner</span>
                <strong class="metric-val orange-text">🍽️ {{ getMessMealStats().dCount }}</strong>
                <span class="detail-link-text">⭐ {{ getMessMealStats().dAvg }} Avg →</span>
              </div>
            </div>
          </div>

          <!-- Student Reviews Stream -->
          <div class="card shadow-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h5 class="card-section-title" style="margin: 0;">Student Mess Food Feedbacks & Ratings</h5>
              <span class="ticket-badge" style="font-size: 11px;">Showing {{ getFilteredMessReviews().length }} Feedbacks</span>
            </div>
            <div style="max-height: 700px; overflow-y: auto; padding-right: 4px;">
              <div *ngFor="let r of getFilteredMessReviews()" class="review-item-box" style="margin-bottom: 12px; padding: 14px; border-radius: 12px; background: var(--bg-card); border: 1px solid var(--border-color);">
                <div class="review-item-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                  <div>
                    <strong style="font-size: 14.5px; color: var(--text-primary);">{{ r.student?.name || 'Student' }}</strong>
                    <span class="card-sub-lbl" style="display: block; font-size: 11.5px; color: var(--text-secondary);">Room {{ r.student?.roomNumber || 'N/A' }} | {{ r.student?.hostelBlock || 'Hostel Block' }}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="status-tag status-moderate" style="font-size: 10px; text-transform: uppercase;">{{ r.mealType }}</span>
                    <span class="rating-star" style="font-size: 14px; font-weight: 800; color: #f59e0b; background: rgba(245, 158, 11, 0.1); padding: 2px 8px; border-radius: 6px;">⭐ {{ r.rating || r.foodQuality }}/5</span>
                  </div>
                </div>
                <p class="review-comment" style="margin: 6px 0; font-size: 13px; color: var(--text-primary); font-style: italic; background: var(--bg-muted); padding: 8px 12px; border-radius: 8px;">"{{ r.comment || r.comments || 'No comment provided.' }}"</p>
                <div *ngIf="r.photoUrl" style="margin: 8px 0;">
                  <img [src]="getImageUrl(r.photoUrl)" style="max-width: 100%; max-height: 200px; border-radius: 10px; object-fit: cover; border: 1px solid var(--border-color); cursor: pointer;" (click)="openPhotoModal(getImageUrl(r.photoUrl))" alt="Mess food feedback photo" />
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                  <span class="card-sub-lbl" style="font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
                    📅 Recorded Date: <strong>{{ (r.date || r.createdAt) | date:'mediumDate' }}</strong>
                  </span>
                  <span *ngIf="r.createdAt" class="card-sub-lbl" style="font-size: 10.5px; color: var(--text-muted);">
                    🕒 {{ r.createdAt | date:'shortTime' }}
                  </span>
                </div>
              </div>
            </div>
            <div *ngIf="getFilteredMessReviews().length === 0" class="empty-state">
              <span class="empty-icon">🍽️</span>
              <p>No student mess reviews match the selected meal filter.</p>
            </div>
          </div>
        </div>

        <!-- NOTICES & BROADCASTS TAB (READ ONLY) -->
        <div *ngIf="activeTab === 'notices'" class="tab-panel">
          <h4 class="page-title">📢 Official Notices & Broadcasts</h4>

          <!-- All Active Notices Stream (Read Only View) -->
          <div class="card shadow-card">
            <h5 class="card-section-title">All Broadcasted Notices Feed</h5>
            <div *ngFor="let notice of announcementsList" class="card complaint-card-item" style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <span class="ticket-badge">📢 Notice #{{ notice.id }}</span>
                  <h5 class="complaint-item-title" style="margin-top: 4px;">{{ notice.title }}</h5>
                  <span class="card-sub-lbl">Target: <strong>{{ notice.hostelBlock || 'All Hostels' }}</strong> | Posted on {{ notice.createdAt | date:'medium' }}</span>
                </div>
                <button class="btn btn-delete-user" (click)="deleteNotice(notice.id)" style="width: auto; padding: 4px 8px; font-size: 11px;">Delete 🗑️</button>
              </div>
              <p class="complaint-desc-text" style="margin-top: 8px;">{{ notice.content }}</p>
              <img *ngIf="notice.photoUrl" [src]="getImageUrl(notice.photoUrl)" (error)="onImgError($event)" (click)="openPhotoModal(getImageUrl(notice.photoUrl))" style="max-width: 100%; max-height: 250px; border-radius: 12px; margin-top: 10px; object-fit: cover; border: 1px solid var(--border-color); cursor: pointer;" alt="Notice Attachment" />
            </div>

            <div *ngIf="announcementsList.length === 0" class="empty-state">
              <span class="empty-icon">📢</span>
              <p>No official notices broadcasted yet.</p>
            </div>
          </div>
        </div>

        <!-- 6. LIVE ACTIVITY AUDIT TRAIL FEED -->
        <div *ngIf="activeTab === 'activity'" class="tab-panel">
          <h4 class="page-title">📜 Live System Activity & Audit Trail</h4>

          <div class="card shadow-card">
            <div *ngFor="let log of activityLogs" class="activity-feed-row" style="padding: 12px 14px; border-bottom: 1px solid var(--border-color); display: flex; gap: 12px; align-items: flex-start;">
              <span style="font-size: 20px; background: var(--bg-muted); padding: 8px; border-radius: 10px;">⚡</span>
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span class="purple-text font-bold" style="font-size: 12.5px;">{{ log.actorName || 'System Action' }} ({{ (log.actorRole || 'System') | uppercase }})</span>
                  <span class="activity-time" style="font-size: 11px; color: var(--text-muted);">{{ log.createdAt | date:'shortTime' }}</span>
                </div>
                <p class="activity-desc" style="margin: 4px 0 0 0; font-size: 13px; color: var(--text-primary); font-weight: 500;">{{ log.description }}</p>
              </div>
            </div>
            <div *ngIf="!activityLogs || activityLogs.length === 0" class="empty-state">
              <span class="empty-icon">📜</span>
              <p>No recent activity logs recorded in database.</p>
            </div>
          </div>
        </div>

        <!-- 8. STUDENTS & USERS MANAGEMENT DIRECTORY -->
        <div *ngIf="activeTab === 'users'" class="tab-panel">
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
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-secondary" (click)="openEditUserModal(u)" style="width: auto; padding: 6px 12px; font-size: 11px;">Edit ✏️</button>
                <button class="btn btn-delete-user" (click)="deleteUser(u.id)" style="width: auto; padding: 6px 12px; font-size: 11px;">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <!-- CREATE ACCOUNT TAB (STUDENT, WARDEN, STAFF) -->
        <div *ngIf="activeTab === 'create'" class="tab-panel">
          <h4 class="page-title">➕ Create User Account (Student, Warden, Staff)</h4>
          <div class="card shadow-card" style="max-width: 580px;">
            <form (ngSubmit)="onCreateSubmit()">
              
              <!-- Role Selector -->
              <div class="form-group" style="margin-bottom: 16px;">
                <label class="form-label" style="font-weight: 700;">Account Type / Role *</label>
                <select class="form-input" [(ngModel)]="createForm.role" (change)="onRoleChange()" name="role" style="height: 44px; font-weight: 700; background: var(--bg-muted);">
                  <option value="student">🎓 Student Account</option>
                  <option value="warden">🛡️ Warden Account</option>
                  <option value="staff">🔧 Maintenance Staff Account</option>
                </select>
              </div>

              <!-- General Credentials -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
                <div class="form-group">
                  <label class="form-label">Full Name *</label>
                  <input type="text" class="form-input" [(ngModel)]="createForm.name" name="name" required placeholder="e.g. Rahul Sharma" />
                </div>
                <div class="form-group">
                  <label class="form-label">Phone Number *</label>
                  <input type="text" class="form-input" [(ngModel)]="createForm.phone" name="phone" placeholder="e.g. 9876543210" />
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
                <div class="form-group">
                  <label class="form-label">Email Address *</label>
                  <input type="email" class="form-input" [(ngModel)]="createForm.email" name="email" required placeholder="e.g. rahul@hostelhub.com" />
                </div>
                <div class="form-group">
                  <label class="form-label">Password *</label>
                  <input type="password" class="form-input" [(ngModel)]="createForm.password" name="password" required placeholder="Set password" />
                </div>
              </div>

              <!-- STUDENT-SPECIFIC FIELDS -->
              <div *ngIf="createForm.role === 'student'" style="background: rgba(99, 102, 241, 0.06); padding: 16px; border-radius: 12px; border: 1px solid rgba(99, 102, 241, 0.2); margin-bottom: 16px;">
                <h5 style="margin: 0 0 12px 0; font-size: 13px; color: var(--purple-primary); font-weight: 800;">🎓 Student Details Form</h5>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
                  <div class="form-group">
                    <label class="form-label">Roll Number *</label>
                    <input type="text" class="form-input" [(ngModel)]="createForm.rollNumber" name="rollNumber" placeholder="e.g. 2025001" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Room Number *</label>
                    <input type="text" class="form-input" [(ngModel)]="createForm.roomNumber" name="roomNumber" placeholder="e.g. 304" />
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
                  <div class="form-group">
                    <label class="form-label">Hostel Block *</label>
                    <select class="form-input" [(ngModel)]="createForm.hostelBlock" name="hostelBlock">
                      <option value="Boys Hostel 1">Boys Hostel 1</option>
                      <option value="Boys Hostel 2">Boys Hostel 2</option>
                      <option value="Girls Hostel 1">Girls Hostel 1</option>
                      <option value="Girls Hostel 2">Girls Hostel 2</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Gender *</label>
                    <select class="form-input" [(ngModel)]="createForm.gender" name="gender">
                      <option value="male">Male ♂</option>
                      <option value="female">Female ♀</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Batch *</label>
                  <input type="text" class="form-input" [(ngModel)]="createForm.batch" name="batch" placeholder="e.g. Batch 2025-2029" />
                </div>
              </div>

              <!-- STAFF SPECIFIC FIELDS -->
              <div *ngIf="createForm.role === 'staff'">
                <div class="form-group" style="margin-bottom: 10px;">
                  <label class="form-label">Trade / Category</label>
                  <select class="form-input" [(ngModel)]="createForm.bio" name="bio">
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="Painter">Painter</option>
                    <option value="Mason">Mason</option>
                    <option value="AC / AC Technician">AC / AC Technician</option>
                    <option value="Cleaner / Housekeeping">Cleaner / Housekeeping</option>
                  </select>
                </div>
                <div class="form-group" style="margin-bottom: 10px;">
                  <label class="form-label">Assigned Hostel Area</label>
                  <select class="form-input" [(ngModel)]="createForm.hostelBlock" name="hostelBlock">
                    <option value="All Hostels">All Hostels</option>
                    <option value="Boys Hostel 1">Boys Hostel 1</option>
                    <option value="Boys Hostel 2">Boys Hostel 2</option>
                    <option value="Girls Hostel 1">Girls Hostel 1</option>
                    <option value="Girls Hostel 2">Girls Hostel 2</option>
                  </select>
                </div>
              </div>

              <!-- WARDEN SPECIFIC FIELDS -->
              <div *ngIf="createForm.role === 'warden'">
                <div class="form-group" style="margin-bottom: 10px;">
                  <label class="form-label">Assigned Hostel Block</label>
                  <select class="form-input" [(ngModel)]="createForm.hostelBlock" name="hostelBlock">
                    <option value="All Hostels">All Hostels</option>
                    <option value="Boys Hostel 1">Boys Hostel 1</option>
                    <option value="Boys Hostel 2">Boys Hostel 2</option>
                    <option value="Girls Hostel 1">Girls Hostel 1</option>
                    <option value="Girls Hostel 2">Girls Hostel 2</option>
                  </select>
                </div>
              </div>

              <button type="submit" class="btn btn-primary" style="margin-top: 14px; width: 100%; height: 44px; font-size: 14px; font-weight: 700;">🚀 Create {{ createForm.role | uppercase }} Account Now</button>
            </form>
          </div>
        </div>

        <!-- SETTINGS TAB (FULL APP & FOOTER CONTENT MANAGEMENT) -->
        <div *ngIf="activeTab === 'settings'" class="tab-panel">
          <h4 class="page-title">⚙️ System Settings & App Content Control Center</h4>
          <p class="card-sub-lbl" style="margin-bottom: 16px;">Edit User App Home Page overview, Footer contact details, and Developer Team info. All changes are saved permanently in PostgreSQL Database.</p>

          <div *ngIf="settingsSaveSuccess" class="alert alert-success" style="margin-bottom: 14px;">{{ settingsSaveSuccess }}</div>
          <div *ngIf="settingsSaveError" class="alert alert-danger" style="margin-bottom: 14px;">{{ settingsSaveError }}</div>

          <!-- Section 1: User App Footer Details -->
          <div class="card shadow-card" style="margin-bottom: 20px;">
            <h5 class="card-section-title">📄 User App Footer Details</h5>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div>
                <label class="form-label">Footer Header Text</label>
                <input type="text" class="form-input" [(ngModel)]="systemFooterSettings.footer_text" placeholder="e.g. Hostel Maintenance & Support Portal" />
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <label class="form-label">Support Email</label>
                  <input type="email" class="form-input" [(ngModel)]="systemFooterSettings.footer_email" placeholder="e.g. support@hostelhub.com" />
                </div>
                <div>
                  <label class="form-label">Helpline Phone Number</label>
                  <input type="text" class="form-input" [(ngModel)]="systemFooterSettings.footer_phone" placeholder="e.g. +91 98765 43210" />
                </div>
              </div>
              <div>
                <label class="form-label">Copyright Line</label>
                <input type="text" class="form-input" [(ngModel)]="systemFooterSettings.footer_copyright" placeholder="e.g. © 2026 HostelHub. All rights reserved." />
              </div>
            </div>
          </div>

          <!-- Section 2: User App Home Page Overview & Instructions -->
          <div class="card shadow-card" style="margin-bottom: 20px;">
            <h5 class="card-section-title">🏠 User App Home Page Overview & Guide</h5>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div>
                <label class="form-label">What is HostelHub? (Overview Description)</label>
                <textarea class="form-input" rows="3" [(ngModel)]="systemPublicSettings.app_about" placeholder="Describe the HostelHub platform..."></textarea>
              </div>
              <div>
                <label class="form-label">How It Works (Step-by-Step Instructions)</label>
                <textarea class="form-input" rows="4" [(ngModel)]="systemPublicSettings.app_how_it_works" placeholder="1. Raise Ticket... 2. Automated Routing..."></textarea>
              </div>
            </div>
          </div>

          <!-- Section 3: Developer Team Information -->
          <div class="card shadow-card" style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <h5 class="card-section-title" style="margin: 0;">👨‍💻 Meet the Developer Team Information</h5>
              <button type="button" class="btn btn-primary" (click)="addDeveloperMember()" style="font-size: 12px; padding: 6px 14px;">
                ➕ Add Developer
              </button>
            </div>

            <div *ngFor="let dev of systemPublicSettings.developer_team; let i = index" class="card" style="background: var(--bg-muted); margin-bottom: 16px; border: 1px solid var(--border-color); padding: 16px; border-radius: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h6 style="margin: 0; font-size: 14px; font-weight: 800; color: var(--text-primary);">Developer Member #{{ i + 1 }}</h6>
                <button type="button" (click)="removeDeveloperMember(i)" style="background: #ef4444; color: white; border: none; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer;">
                  🗑️ Remove
                </button>
              </div>

              <!-- Profile Photo Upload & Alignment Controls -->
              <div style="background: var(--bg-card); padding: 12px; border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 14px;">
                <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 10px;">
                  <!-- High-Res Interactive Circle Preview -->
                  <div (click)="dev.pic ? openPhotoModal(getImageUrl(dev.pic)) : null" title="Click to view full-resolution preview" style="width: 64px; height: 64px; border-radius: 50%; border: 3px solid #2563eb; background: var(--bg-muted); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; overflow: hidden; flex-shrink: 0; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
                    <img *ngIf="dev.pic" [src]="getImageUrl(dev.pic)" [style.object-position]="dev.picPosition || 'center center'" [style.transform]="'scale(' + ((dev.picZoom || 100) / 100) + ')'" style="width: 100%; height: 100%; object-fit: cover; transform-origin: center center; image-rendering: -webkit-optimize-contrast;" alt="Dev Photo" />
                    <span *ngIf="!dev.pic" style="font-size: 24px;">👨‍💻</span>
                  </div>

                  <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                      <label class="form-label" style="margin: 0; font-weight: 800;">PROFILE PHOTO (HIGH RESOLUTION)</label>
                      <button *ngIf="dev.pic" type="button" (click)="openPhotoModal(getImageUrl(dev.pic))" style="background: #2563eb; color: white; border: none; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer;">
                        👁️ Full Preview
                      </button>
                    </div>
                    <input type="file" (change)="uploadDeveloperPhoto($event, i)" accept="image/*" style="font-size: 12px; color: var(--text-secondary);" />
                  </div>
                </div>

                <!-- Position & Zoom Adjustment Controls -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: var(--bg-muted); padding: 10px; border-radius: 10px; border: 1px solid var(--border-color);">
                  <div>
                    <label class="form-label" style="font-size: 10.5px;">🎯 FACE FOCUS / ALIGNMENT</label>
                    <select class="form-input" [(ngModel)]="dev.picPosition" style="font-size: 12px; padding: 6px 10px;">
                      <option value="center center">Center (Default)</option>
                      <option value="top center">Top Focus (Face / Head)</option>
                      <option value="bottom center">Bottom Focus</option>
                      <option value="left center">Left Focus</option>
                      <option value="right center">Right Focus</option>
                    </select>
                  </div>

                  <div>
                    <label class="form-label" style="font-size: 10.5px;">🔍 ZOOM / CROP LEVEL</label>
                    <select class="form-input" [(ngModel)]="dev.picZoom" style="font-size: 12px; padding: 6px 10px;">
                      <option [ngValue]="100">100% (Original Fit)</option>
                      <option [ngValue]="110">110% (Zoom 1.1x)</option>
                      <option [ngValue]="125">125% (Zoom 1.25x)</option>
                      <option [ngValue]="140">140% (Zoom 1.4x)</option>
                      <option [ngValue]="160">160% (Zoom 1.6x)</option>
                      <option [ngValue]="180">180% (Zoom 1.8x)</option>
                      <option [ngValue]="200">200% (Zoom 2.0x)</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Name & Role -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                <div>
                  <label class="form-label">Name</label>
                  <input type="text" class="form-input" [(ngModel)]="dev.name" placeholder="e.g. Abhinav Kumar" />
                </div>
                <div>
                  <label class="form-label">Role Title</label>
                  <input type="text" class="form-input" [(ngModel)]="dev.role" placeholder="e.g. Lead Full-Stack Developer" />
                </div>
              </div>

              <!-- Short Description -->
              <div style="margin-bottom: 10px;">
                <label class="form-label">Short Description / Bio</label>
                <input type="text" class="form-input" [(ngModel)]="dev.description" placeholder="Bio description..." />
              </div>

              <!-- Social Links (GitHub, LinkedIn, Instagram, Twitter, Email) -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
                <div>
                  <label class="form-label">GitHub URL / Username</label>
                  <input type="text" class="form-input" [(ngModel)]="dev.github" placeholder="https://github.com/username" />
                </div>
                <div>
                  <label class="form-label">LinkedIn URL</label>
                  <input type="text" class="form-input" [(ngModel)]="dev.linkedin" placeholder="https://linkedin.com/in/username" />
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                <div>
                  <label class="form-label">Instagram URL</label>
                  <input type="text" class="form-input" [(ngModel)]="dev.instagram" placeholder="https://instagram.com/username" />
                </div>
                <div>
                  <label class="form-label">Twitter / X URL</label>
                  <input type="text" class="form-input" [(ngModel)]="dev.twitter" placeholder="https://x.com/username" />
                </div>
                <div>
                  <label class="form-label">Gmail / Email Address</label>
                  <input type="text" class="form-input" [(ngModel)]="dev.email" placeholder="dev@gmail.com" />
                </div>
              </div>

            </div>

            <button type="button" class="btn btn-secondary" (click)="addDeveloperMember()" style="width: 100%; border: 1.5px dashed #2563eb; color: #2563eb; font-weight: 800; padding: 10px; border-radius: 12px; margin-top: 4px;">
              ➕ Add Another Developer Member
            </button>
          </div>

          <!-- Save Button -->
          <button class="btn btn-primary" (click)="saveAllSystemSettings()" [disabled]="savingSettings" style="font-size: 14px; padding: 12px 24px;">
            <span *ngIf="savingSettings">Saving Settings to Database...</span>
            <span *ngIf="!savingSettings">💾 Save All System Settings Permanently</span>
          </button>
        </div>

        <!-- PROFILE TAB -->
        <div *ngIf="activeTab === 'my-profile'" class="tab-panel">
          <h4 class="page-title">👤 Admin Profile</h4>
          <div class="card shadow-card">
            <p class="card-sub-lbl">Logged in as: <strong>{{ user?.email }}</strong></p>
          </div>
        </div>

      </div>
    </div>

    <!-- INTERACTIVE METRIC DETAILS MODAL -->
    <div *ngIf="showMetricDetailsModal" class="modal-overlay">
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
    <div *ngIf="showComplaintDetailModal && selectedComplaintDetail" class="modal-overlay">
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
    <div *ngIf="showStaffDetailModal && selectedStaffDetail" class="modal-overlay">
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

    <!-- INTERACTIVE EDIT USER MODAL -->
    <div *ngIf="showEditUserModal && selectedUserForEdit" class="modal-overlay">
      <div class="modal-card" style="max-width: 500px;">
        <div class="modal-header">
          <h3 style="margin: 0; font-size: 16px;">✏️ Edit User Details (ID #{{ selectedUserForEdit.id }})</h3>
          <button class="close-btn" (click)="closeEditUserModal()">✕</button>
        </div>
        <div class="modal-body-scroll">
          <form (ngSubmit)="saveUserEdit()">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-input" [(ngModel)]="editUserForm.name" name="editName" required />
            </div>
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-input" [(ngModel)]="editUserForm.email" name="editEmail" required />
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input type="text" class="form-input" [(ngModel)]="editUserForm.phone" name="editPhone" />
            </div>
            <div class="form-group">
              <label class="form-label">Role</label>
              <select class="form-input" [(ngModel)]="editUserForm.role" name="editRole">
                <option value="student">Student</option>
                <option value="staff">Maintenance Staff</option>
                <option value="warden">Warden</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Trade / Category / Bio</label>
              <input type="text" class="form-input" [(ngModel)]="editUserForm.bio" name="editBio" placeholder="e.g. Electrician, Plumber, Hostel Warden" />
            </div>
            <div class="form-group">
              <label class="form-label">Hostel Block</label>
              <select class="form-input" [(ngModel)]="editUserForm.hostelBlock" name="editHostelBlock">
                <option value="All Hostels">All Hostels</option>
                <option value="Boys Hostel B-1">Boys Hostel B-1</option>
                <option value="Boys Hostel B-2">Boys Hostel B-2</option>
                <option value="Girls Hostel G-1">Girls Hostel G-1</option>
                <option value="Girls Hostel G-2">Girls Hostel G-2</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Room Number (Students)</label>
              <input type="text" class="form-input" [(ngModel)]="editUserForm.roomNumber" name="editRoomNumber" placeholder="e.g. 102" />
            </div>
            <div class="form-group">
              <label class="form-label">Account Status</label>
              <select class="form-input" [(ngModel)]="editUserForm.status" name="editStatus">
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary" style="margin-top: 12px;" [disabled]="savingUserEdit">
              <span *ngIf="savingUserEdit">Saving Changes...</span>
              <span *ngIf="!savingUserEdit">💾 Save Changes Now</span>
            </button>
          </form>
        </div>
      </div>
    </div>

  `,
  styles: [`
    .dashboard-container { padding: 18px 16px; max-width: 1280px; margin: 0 auto; font-family: var(--font-sans); }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      background: var(--bg-card);
      padding: 16px 20px;
      border-radius: 18px;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
    }
    .user-info { display: flex; align-items: center; gap: 14px; }
    .avatar-ring {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #2563eb;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      border: 2px solid #3b82f6;
      flex-shrink: 0;
    }
    .user-meta { font-size: 11.5px; color: var(--text-muted); font-weight: 600; margin: 2px 0 0 0; }
    
    .header-actions { display: flex; align-items: center; gap: 10px; }
    .theme-toggle-btn {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--bg-muted);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logout-btn {
      background: #ef4444;
      color: white;
      border: none;
      height: 40px;
      padding: 0 16px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
    }

    .admin-tab-nav {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 10px;
      margin-bottom: 20px;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .admin-tab-nav::-webkit-scrollbar { display: none; }
    .admin-tab-nav button {
      white-space: nowrap;
      padding: 10px 18px;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      background: var(--bg-card);
      color: var(--text-secondary);
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
    }
    .admin-tab-nav button.active {
      background: #2563eb;
      color: #ffffff;
      border-color: #2563eb;
      font-weight: 800;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    
    .page-title { font-weight: 900; font-size: 19px; margin-bottom: 16px; color: var(--text-primary); }
    .card-section-title { margin: 0 0 12px 0; color: var(--text-primary); font-size: 15px; font-weight: 800; }
    .card-sub-lbl { font-size: 11.5px; color: var(--text-secondary); }
    .font-bold { font-weight: 700; }

    .ai-insight-banner { background: #1e3a8a; color: white; padding: 14px 18px; border-radius: 14px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; }
    .live-tag { background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 800; color: white; }

    .shadow-card { background: var(--bg-card); color: var(--text-primary); padding: 20px; border-radius: 18px; border: 1px solid var(--border-color); margin-bottom: 20px; box-shadow: var(--shadow-sm); }
    
    .metrics-grid-auto { display: grid; grid-template-columns: repeat(auto-fit, minmax(135px, 1fr)); gap: 12px; }
    .metric-box { background: var(--bg-muted); padding: 14px; border-radius: 12px; border-left: 4px solid var(--primary); }
    .clickable-box { cursor: pointer; }
    .clickable-hint { font-size: 11px; color: #2563eb; font-weight: 700; }
    .detail-link-text { font-size: 10.5px; color: #2563eb; display: block; margin-top: 6px; font-weight: 800; }

    .border-purple { border-left-color: #6366f1; }
    .border-green { border-left-color: #22c55e; }
    .border-yellow { border-left-color: #eab308; }
    .border-blue { border-left-color: #2563eb; }
    .border-red { border-left-color: #ef4444; }
    .border-indigo { border-left-color: #8b5cf6; }
    .border-teal { border-left-color: #14b8a6; }
    .border-orange { border-left-color: #f97316; }

    .metric-lbl { font-size: 11px; color: var(--text-muted); display: block; font-weight: 700; }
    .metric-val { font-size: 22px; font-weight: 900; }
    .purple-text { color: #6366f1; }
    .green-text { color: #22c55e; }
    .yellow-text { color: #eab308; }
    .blue-text { color: #2563eb; }
    .red-text { color: #ef4444; }
    .indigo-text { color: #8b5cf6; }
    .teal-text { color: #14b8a6; }
    .orange-text { color: #f97316; }

    .card-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
    .period-toggle-group { display: flex; background: var(--bg-muted); padding: 4px; border-radius: 10px; gap: 4px; border: 1px solid var(--border-color); }
    .period-toggle-group button { background: transparent; color: var(--text-secondary); border: none; padding: 6px 14px; border-radius: 8px; font-size: 11.5px; font-weight: 700; cursor: pointer; }
    .period-toggle-group button.active { background: #2563eb; color: white; font-weight: 800; }

    .bar-chart-container { display: flex; align-items: flex-end; gap: 12px; height: 160px; padding: 10px 0; border-bottom: 1px solid var(--border-color); }
    .bar-item { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; gap: 6px; }
    .bar-val-tag { font-size: 10px; color: #2563eb; font-weight: 800; }
    .bar-fill { width: 100%; max-width: 32px; background: #2563eb; border-radius: 6px 6px 0 0; }
    .bar-label { font-size: 9.5px; color: var(--text-muted); font-weight: 600; white-space: nowrap; }

    .filter-matrix-card { background: var(--bg-card); padding: 14px; border-radius: 14px; margin-bottom: 16px; border: 1px solid var(--border-color); display: flex; gap: 10px; flex-wrap: wrap; }
    .filter-select { flex: 1; min-width: 130px; }

    .complaint-card-item { padding: 16px; border-radius: 14px; margin-bottom: 12px; background: var(--bg-card); border: 1px solid var(--border-color); }
    .clickable-card { cursor: pointer; }
    .clickable-card:hover { border-color: #2563eb; }
    .complaint-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .ticket-badge { font-size: 11px; background: #eff6ff; color: #2563eb; padding: 3px 10px; border-radius: 8px; font-weight: 800; }
    .complaint-item-title { margin: 4px 0 2px 0; color: var(--text-primary); font-size: 15px; font-weight: 700; }
    .complaint-student-info { font-size: 11px; color: var(--text-muted); }
    .complaint-desc-text { font-size: 12.5px; color: var(--text-secondary); margin-bottom: 10px; }
    .complaint-card-footer { display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-muted); border-top: 1px solid var(--border-color); padding-top: 8px; flex-wrap: wrap; gap: 6px; }
    .staff-highlight { color: #2563eb; font-weight: 700; }
    .view-detail-badge { font-size: 10.5px; color: #2563eb; font-weight: 800; }

    .custom-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12.5px; min-width: 600px; }
    .custom-table th { padding: 12px 10px; border-bottom: 2px solid var(--border-color); color: var(--text-muted); font-weight: 800; text-transform: uppercase; font-size: 11px; }
    .custom-table td { padding: 12px 10px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); }
    .clickable-row { cursor: pointer; }
    .clickable-row:hover { background: var(--bg-muted); }
    .rating-star { color: #facc15; font-weight: 800; }
    .status-tag { padding: 4px 10px; border-radius: 8px; font-size: 10.5px; font-weight: 800; }
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
    .green-fill { background: #22c55e; }
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

    .parsed-preview-box { margin-bottom: 12px; padding: 10px; background: var(--bg-muted); border-radius: 8px; border: 1px solid #2563eb; }
    .danger-control-card { border: 1.5px solid #ef4444; padding: 18px; border-radius: 16px; background: rgba(239, 68, 68, 0.05); }
    .termination-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
    .termination-box { background: var(--bg-card); padding: 14px; border-radius: 12px; border: 1px solid var(--border-color); }
    .user-card-row { padding: 14px; border-radius: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
    .task-item-row { background: var(--bg-muted); padding: 12px; border-radius: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }

    /* SOLID MODAL STYLES (No glass blur, no animations) */
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.75); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
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

  zoomPhotoUrl: string | null = null;
  openPhotoModal(url: string): void { this.zoomPhotoUrl = url; }
  closePhotoModal(): void { this.zoomPhotoUrl = null; }

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

  createForm = {
    name: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    bio: 'Hostel Student',
    hostelBlock: 'Boys Hostel 1',
    roomNumber: '',
    rollNumber: '',
    gender: 'male',
    batch: 'Batch 2025-2029'
  };

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

  // Edit User Modal State
  showEditUserModal = false;
  selectedUserForEdit: any = null;
  editUserForm = { name: '', email: '', phone: '', role: 'student', bio: '', hostelBlock: 'All Hostels', roomNumber: '', status: 'active' };
  savingUserEdit = false;

  // Notices State
  announcementsList: any[] = [];
  newNotice = { title: '', content: '', hostelBlock: 'All Hostels', photoFile: null as File | null };

  // System Settings State
  systemFooterSettings = {
    footer_text: 'Hostel Maintenance & Support Portal',
    footer_email: 'support@hostelhub.com',
    footer_phone: '+91 98765 43210',
    footer_copyright: '© 2026 HostelHub. All rights reserved.'
  };

  systemPublicSettings: { app_about: string; app_how_it_works: string; developer_team: any[] } = {
    app_about: '',
    app_how_it_works: '',
    developer_team: [
      { name: 'Abhinav Kumar', role: 'Lead Full-Stack Developer', description: 'Expert in Node.js, Express, Sequelize, and Angular architecture.', pic: '', picPosition: 'center center', picZoom: 100, github: '', linkedin: '', instagram: '', twitter: '', email: '' },
      { name: 'Saransh Singh', role: 'UI/UX Designer', description: 'Specializes in crafting premium dark/light mode interfaces and custom transitions.', pic: '', picPosition: 'center center', picZoom: 100, github: '', linkedin: '', instagram: '', twitter: '', email: '' }
    ]
  };

  savingSettings = false;
  settingsSaveSuccess = '';
  settingsSaveError = '';

  getImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    let cleanPath = url.startsWith('/') ? url : '/' + url;
    if (!cleanPath.startsWith('/uploads/')) {
      cleanPath = '/uploads' + cleanPath;
    }
    return 'https://hostelhub-0cyi.onrender.com' + cleanPath;
  }

  onImgError(event: any): void {
    if (event && event.target) {
      event.target.style.display = 'none';
    }
  }

  getTrendData(): any[] {
    if (this.mgmtTrendData && Array.isArray(this.mgmtTrendData.timeSeries) && this.mgmtTrendData.timeSeries.length > 0) {
      return this.mgmtTrendData.timeSeries;
    }
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const total = (this.allComplaints || []).length || 4;
    return days.map((d, idx) => ({
      label: d,
      complaints: Math.max(1, Math.round((total * (idx + 1)) / 7))
    }));
  }

  getCategoryDistribution(): any[] {
    const cats = [
      { name: 'Plumbing', icon: '🔧', color: '#3b82f6' },
      { name: 'Electrical', icon: '⚡', color: '#f59e0b' },
      { name: 'Carpentry', icon: '🪚', color: '#8b5cf6' },
      { name: 'Cleaning', icon: '🧹', color: '#10b981' },
      { name: 'Internet', icon: '🌐', color: '#ef4444' }
    ];
    const complaintsList = this.allComplaints || [];
    const total = complaintsList.length || 1;
    return cats.map(c => {
      const count = complaintsList.filter(item => (item.category || '').toLowerCase() === c.name.toLowerCase()).length;
      const pct = complaintsList.length > 0 ? Math.round((count / total) * 100) : (c.name === 'Plumbing' ? 40 : c.name === 'Electrical' ? 30 : 10);
      return { ...c, count, pct };
    });
  }

  onRoleChange(): void {
    if (this.createForm.role === 'student') {
      this.createForm.bio = 'Hostel Student';
      if (!this.createForm.hostelBlock || this.createForm.hostelBlock === 'All Hostels') {
        this.createForm.hostelBlock = 'Boys Hostel 1';
      }
    } else if (this.createForm.role === 'warden') {
      this.createForm.bio = 'Hostel Warden';
    } else if (this.createForm.role === 'staff') {
      this.createForm.bio = 'Electrician';
    }
  }

  selectedMealFilter: 'all' | 'breakfast' | 'lunch' | 'snacks' | 'dinner' = 'all';

  filterMealReviews(meal: 'all' | 'breakfast' | 'lunch' | 'snacks' | 'dinner'): void {
    this.selectedMealFilter = meal;
    this.cdr.detectChanges();
  }

  getFilteredMessReviews(): any[] {
    const reviews = (this.messAnalytics?.reviews || this.messAnalytics?.feedbacks || []);
    if (this.selectedMealFilter === 'all') return reviews;
    return reviews.filter((r: any) => (r.mealType || '').toLowerCase().trim() === this.selectedMealFilter.toLowerCase());
  }

  getMessMealStats() {
    const reviews = (this.messAnalytics?.reviews || this.messAnalytics?.feedbacks || []);
    const total = reviews.length;
    
    let totalSum = 0;
    let bCount = 0, lCount = 0, sCount = 0, dCount = 0;
    let bSum = 0, lSum = 0, sSum = 0, dSum = 0;

    reviews.forEach((r: any) => {
      const rating = Number(r.rating || r.foodQuality) || 0;
      totalSum += rating;
      const m = (r.mealType || '').toLowerCase().trim();
      if (m === 'breakfast') { bCount++; bSum += rating; }
      else if (m === 'lunch') { lCount++; lSum += rating; }
      else if (m === 'snacks') { sCount++; sSum += rating; }
      else if (m === 'dinner') { dCount++; dSum += rating; }
    });

    const overallAvg = total > 0 ? (totalSum / total).toFixed(1) : '0.0';
    const bAvg = bCount > 0 ? (bSum / bCount).toFixed(1) : '0.0';
    const lAvg = lCount > 0 ? (lSum / lCount).toFixed(1) : '0.0';
    const sAvg = sCount > 0 ? (sSum / sCount).toFixed(1) : '0.0';
    const dAvg = dCount > 0 ? (dSum / dCount).toFixed(1) : '0.0';

    return {
      total,
      overallAvg,
      bCount, bAvg,
      lCount, lAvg,
      sCount, sAvg,
      dCount, dAvg
    };
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
    this.loadAnnouncementsList();
    this.loadSystemSettings();
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'feedback') {
      this.loadMessAnalytics();
    } else if (tab === 'notices') {
      this.loadAnnouncementsList();
    } else if (tab === 'attendance') {
      this.loadAttendanceStats();
      this.loadMonthlyAttendanceReport();
    } else if (tab === 'users') {
      this.loadUsers();
    } else if (tab === 'performance') {
      this.loadStaffPerformance();
    } else if (tab === 'settings') {
      this.loadSystemSettings();
    }
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

  // Interactive Staff & User Detail Modal
  openStaffDetail(staff: any): void {
    if (!staff) return;
    const id = staff.id;
    const email = staff.email || '';
    const name = staff.name || '';

    // Match across loaded arrays
    const perfMatch = (this.staffPerformanceList || []).find((s: any) => (id && s.id === id) || (email && s.email === email));
    const userMatch = (this.users || []).find((u: any) => (id && u.id === id) || (email && u.email === email));

    // Live compute from allComplaints fallback if needed
    const userComplaints = (this.allComplaints || []).filter((c: any) => 
      (id && (c.staffId === id || c.studentId === id || c.wardenId === id)) || 
      (name && c.assignedStaff && c.assignedStaff.toLowerCase().includes(name.toLowerCase()))
    );

    const liveAssigned = userComplaints.length;
    const liveResolved = userComplaints.filter((c: any) => c.status === 'resolved').length;
    const livePending = userComplaints.filter((c: any) => c.status !== 'resolved').length;

    const assigned = staff.assigned ?? perfMatch?.assigned ?? (userMatch as any)?.assigned ?? liveAssigned;
    const resolved = staff.resolved ?? perfMatch?.resolved ?? (userMatch as any)?.resolved ?? liveResolved;
    const pending = staff.pending ?? perfMatch?.pending ?? (userMatch as any)?.pending ?? livePending;

    this.selectedStaffDetail = {
      ...staff,
      ...(perfMatch || {}),
      category: staff.category || staff.bio || perfMatch?.category || userMatch?.bio || (staff.role === 'staff' ? 'Maintenance Staff' : staff.role),
      assigned: typeof assigned === 'number' ? assigned : 0,
      resolved: typeof resolved === 'number' ? resolved : 0,
      pending: typeof pending === 'number' ? pending : 0
    };

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
    const series = this.getTrendData();
    const maxVal = Math.max(...series.map((t: any) => t.complaints || 0), 1);
    return Math.max(Math.round((val / maxVal) * 100), 18);
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

  createStaffTask(): void {
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
    if (this.createForm.role === 'student' && !this.createForm.rollNumber) {
      this.createForm.rollNumber = 'STU-' + Math.floor(100000 + Math.random() * 900000);
    }
    this.complaintService.createStaffAccount(this.createForm).subscribe({
      next: (res: any) => {
        alert(`✅ ${res.message || 'Account created successfully!'}`);
        this.createForm = {
          name: '',
          email: '',
          password: '',
          role: 'student',
          phone: '',
          bio: 'Hostel Student',
          hostelBlock: 'Boys Hostel 1',
          roomNumber: '',
          rollNumber: '',
          gender: 'male',
          batch: 'Batch 2025-2029'
        };
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

  // Edit User Modal Handlers
  openEditUserModal(user: any): void {
    this.selectedUserForEdit = user;
    this.editUserForm = {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'student',
      bio: user.bio || user.category || '',
      hostelBlock: user.hostelBlock || 'All Hostels',
      roomNumber: user.roomNumber || '',
      status: user.status || 'active'
    };
    this.showEditUserModal = true;
    this.cdr.detectChanges();
  }

  closeEditUserModal(): void {
    this.showEditUserModal = false;
    this.selectedUserForEdit = null;
    this.savingUserEdit = false;
    this.cdr.detectChanges();
  }

  saveUserEdit(): void {
    if (!this.selectedUserForEdit) return;
    this.savingUserEdit = true;
    this.complaintService.updateUserDetails(this.selectedUserForEdit.id, this.editUserForm).subscribe({
      next: (res: any) => {
        this.savingUserEdit = false;
        alert('✅ User details updated successfully!');
        this.closeEditUserModal();
        this.loadUsers();
        this.loadStaffPerformance();
      },
      error: (err: any) => {
        this.savingUserEdit = false;
        alert(`❌ ${err.error?.message || 'Failed to update user details.'}`);
      }
    });
  }

  // Notices Handlers
  loadAnnouncementsList(): void {
    this.complaintService.getAnnouncements().subscribe({
      next: (res: any[]) => {
        this.announcementsList = res;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error fetching announcements:', err)
    });
  }

  onNoticePhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.newNotice.photoFile = file;
    }
  }

  postNotice(): void {
    if (!this.newNotice.title || !this.newNotice.content) return;
    const formData = new FormData();
    formData.append('title', this.newNotice.title);
    formData.append('content', this.newNotice.content);
    formData.append('hostelBlock', this.newNotice.hostelBlock);
    if (this.newNotice.photoFile) {
      formData.append('photo', this.newNotice.photoFile);
    }

    this.complaintService.createAnnouncement(formData).subscribe({
      next: (res: any) => {
        alert('📢 Notice broadcasted successfully!');
        this.newNotice = { title: '', content: '', hostelBlock: 'All Hostels', photoFile: null };
        this.loadAnnouncementsList();
      },
      error: (err: any) => alert(`❌ ${err.error?.message || 'Failed to post notice.'}`)
    });
  }

  deleteNotice(announcementId: number): void {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    this.complaintService.deleteAnnouncement(announcementId).subscribe({
      next: () => {
        alert('🗑️ Notice deleted successfully!');
        this.loadAnnouncementsList();
      },
      error: (err: any) => alert(`❌ ${err.error?.message || 'Failed to delete notice.'}`)
    });
  }

  loadSystemSettings(): void {
    this.complaintService.getFooterSettings().subscribe({
      next: (res: any) => {
        if (res) {
          this.systemFooterSettings = {
            footer_text: res.footer_text || 'Hostel Maintenance & Support Portal',
            footer_email: res.footer_email || 'support@hostelhub.com',
            footer_phone: res.footer_phone || '+91 98765 43210',
            footer_copyright: res.footer_copyright || '© 2026 HostelHub. All rights reserved.'
          };
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error fetching footer settings:', err)
    });

    this.complaintService.getPublicSettings().subscribe({
      next: (res: any) => {
        if (res) {
          this.systemPublicSettings.app_about = res.app_about || '';
          this.systemPublicSettings.app_how_it_works = res.app_how_it_works || '';
          if (Array.isArray(res.developer_team)) {
            this.systemPublicSettings.developer_team = res.developer_team;
          }
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error fetching public settings:', err)
    });
  }

  saveAllSystemSettings(): void {
    this.savingSettings = true;
    this.settingsSaveSuccess = '';
    this.settingsSaveError = '';

    this.complaintService.updateFooterSettings(this.systemFooterSettings).subscribe({
      next: () => {
        this.complaintService.updatePublicSettings(this.systemPublicSettings).subscribe({
          next: () => {
            this.savingSettings = false;
            this.settingsSaveSuccess = '✅ All System Settings & App Details saved permanently in Database!';
            this.cdr.detectChanges();
            setTimeout(() => { this.settingsSaveSuccess = ''; this.cdr.detectChanges(); }, 4000);
          },
          error: (err: any) => {
            this.savingSettings = false;
            this.settingsSaveError = `❌ ${err.error?.message || 'Failed to save public settings.'}`;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err: any) => {
        this.savingSettings = false;
        this.settingsSaveError = `❌ ${err.error?.message || 'Failed to save footer settings.'}`;
        this.cdr.detectChanges();
      }
    });
  }

  addDeveloperMember(): void {
    if (!this.systemPublicSettings.developer_team) {
      this.systemPublicSettings.developer_team = [];
    }
    this.systemPublicSettings.developer_team.push({
      name: '',
      role: '',
      description: '',
      pic: '',
      picPosition: 'center center',
      picZoom: 100,
      github: '',
      linkedin: '',
      instagram: '',
      twitter: '',
      email: ''
    });
    this.cdr.detectChanges();
  }

  removeDeveloperMember(index: number): void {
    if (this.systemPublicSettings.developer_team && this.systemPublicSettings.developer_team.length > index) {
      this.systemPublicSettings.developer_team.splice(index, 1);
      this.cdr.detectChanges();
    }
  }

  uploadDeveloperPhoto(event: any, index: number): void {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64Url = e.target.result;
        if (this.systemPublicSettings.developer_team && this.systemPublicSettings.developer_team[index]) {
          this.systemPublicSettings.developer_team[index].pic = base64Url;
          this.cdr.detectChanges();

          // Auto-save immediately to DB table so photo is NEVER lost!
          this.saveAllSystemSettings();
        }
      };
      reader.readAsDataURL(file);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
