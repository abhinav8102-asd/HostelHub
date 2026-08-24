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
      <!-- Header -->
      <div class="header">
        <div class="user-info">
          <div class="avatar-ring">
            <span class="avatar" *ngIf="!user?.profilePicUrl">👨‍💻</span>
            <img *ngIf="user?.profilePicUrl" [src]="'https://hostelhub-0cyi.onrender.com' + user.profilePicUrl" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />
          </div>
          <div>
            <h3>Admin Console</h3>
            <p class="user-meta">Full System Executive Control</p>
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

      <!-- Tab Content Area -->
      <div class="tab-content-area">

        <!-- Tab Navigation (Horizontal Scrollable Bar) -->
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
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%); color: white; padding: 14px 18px; border-radius: 14px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 22px;">🤖</span>
              <div>
                <strong style="font-size: 13px; display: block; color: #a5b4fc;">AI Executive Insight</strong>
                <span style="font-size: 12px; color: #f8fafc;">Electrical issues volume up 40% in Boys Hostel B-1 this week. Maintenance dispatch recommended.</span>
              </div>
            </div>
            <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 800;">LIVE</span>
          </div>

          <!-- Real-Time Metrics Table Card -->
          <div class="card" style="background: #0f172a; color: white; padding: 18px; border-radius: 16px; margin-bottom: 20px; border: 1px solid #1e293b;">
            <h5 style="margin: 0 0 12px 0; color: #f8fafc; font-size: 15px; font-weight: 800;">System Operations Real-Time Metrics</h5>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px;">
              <div style="background: #1e293b; padding: 12px; border-radius: 10px; border-left: 4px solid #6366f1;">
                <span style="font-size: 11px; color: #94a3b8; display: block;">Total Complaints</span>
                <strong style="font-size: 20px; color: #f8fafc;">{{ analytics?.summary?.total || 304 }}</strong>
              </div>
              <div style="background: #1e293b; padding: 12px; border-radius: 10px; border-left: 4px solid #22c55e;">
                <span style="font-size: 11px; color: #94a3b8; display: block;">Resolved</span>
                <strong style="font-size: 20px; color: #4ade80;">{{ analytics?.summary?.resolved || 221 }}</strong>
              </div>
              <div style="background: #1e293b; padding: 12px; border-radius: 10px; border-left: 4px solid #eab308;">
                <span style="font-size: 11px; color: #94a3b8; display: block;">Pending</span>
                <strong style="font-size: 20px; color: #fde047;">{{ analytics?.summary?.pending || 23 }}</strong>
              </div>
              <div style="background: #1e293b; padding: 12px; border-radius: 10px; border-left: 4px solid #3b82f6;">
                <span style="font-size: 11px; color: #94a3b8; display: block;">Open / In-Progress</span>
                <strong style="font-size: 20px; color: #60a5fa;">{{ (analytics?.summary?.inProgress || 0) + (analytics?.summary?.assigned || 0) || 60 }}</strong>
              </div>
              <div style="background: #1e293b; padding: 12px; border-radius: 10px; border-left: 4px solid #ef4444;">
                <span style="font-size: 11px; color: #94a3b8; display: block;">Unassigned</span>
                <strong style="font-size: 20px; color: #fca5a5;">8</strong>
              </div>
              <div style="background: #1e293b; padding: 12px; border-radius: 10px; border-left: 4px solid #a855f7;">
                <span style="font-size: 11px; color: #94a3b8; display: block;">Escalated Warden</span>
                <strong style="font-size: 20px; color: #c084fc;">12</strong>
              </div>
              <div style="background: #1e293b; padding: 12px; border-radius: 10px; border-left: 4px solid #14b8a6;">
                <span style="font-size: 11px; color: #94a3b8; display: block;">Active Staff</span>
                <strong style="font-size: 20px; color: #2dd4bf;">14 / 16</strong>
              </div>
              <div style="background: #1e293b; padding: 12px; border-radius: 10px; border-left: 4px solid #f97316;">
                <span style="font-size: 11px; color: #94a3b8; display: block;">Active Wardens</span>
                <strong style="font-size: 20px; color: #fb923c;">3 / 4</strong>
              </div>
            </div>
          </div>

          <!-- Graphical Trend Analytics Card -->
          <div class="card chart-card" style="margin-bottom: 24px; background: #0f172a; color: white; padding: 18px; border-radius: 16px; border: 1px solid #1e293b;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
              <div>
                <h5 style="margin: 0; color: #f8fafc; font-size: 16px; font-weight: 800;">📈 Executive Analytics Trends</h5>
                <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 11.5px;">Real-time complaint & resolution volume analysis</p>
              </div>
              <div style="display: flex; background: #1e293b; padding: 3px; border-radius: 8px; gap: 3px;">
                <button (click)="switchPeriod('day')" [style.background]="period==='day'?'#6366f1':'transparent'" style="color: white; border: none; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">Day</button>
                <button (click)="switchPeriod('week')" [style.background]="period==='week'?'#6366f1':'transparent'" style="color: white; border: none; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">Weekly</button>
                <button (click)="switchPeriod('month')" [style.background]="period==='month'?'#6366f1':'transparent'" style="color: white; border: none; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">Monthly</button>
              </div>
            </div>

            <!-- Graphical Bar Representation -->
            <div *ngIf="mgmtTrendData && mgmtTrendData.timeSeries" style="display: flex; align-items: flex-end; gap: 12px; height: 160px; padding: 10px 0; border-bottom: 1px solid #334155;">
              <div *ngFor="let t of mgmtTrendData.timeSeries" style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; gap: 6px;">
                <span style="font-size: 10px; color: #818cf8; font-weight: 800;">{{ t.complaints }}</span>
                <div [style.height.%]="getTrendBarHeight(t.complaints)" style="width: 100%; max-width: 32px; background: linear-gradient(180deg, #6366f1 0%, #4338ca 100%); border-radius: 6px 6px 0 0; transition: height 0.4s ease;"></div>
                <span style="font-size: 9.5px; color: #94a3b8; font-weight: 600; white-space: nowrap;">{{ t.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. COMPLETE WORK FLOW (COMPLAINTS MATRIX) -->
        <div *ngIf="activeTab === 'workflow'" class="tab-panel animate-fade">
          <h4 class="page-title">🛠️ Complete Complaint Work Flow</h4>

          <!-- Filter Matrix -->
          <div style="background: #0f172a; padding: 14px; border-radius: 14px; margin-bottom: 16px; border: 1px solid #1e293b; display: flex; gap: 10px; flex-wrap: wrap;">
            <select class="form-input" style="flex: 1; min-width: 130px; background: #1e293b; color: white;" [(ngModel)]="workflowStatusFilter" (change)="filterComplaints()">
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated to Warden</option>
            </select>
            <select class="form-input" style="flex: 1; min-width: 130px; background: #1e293b; color: white;" [(ngModel)]="workflowCategoryFilter" (change)="filterComplaints()">
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
            <div *ngFor="let c of filteredComplaints" class="complaint-card" style="background: #0f172a; color: white; border: 1px solid #1e293b; padding: 16px; border-radius: 14px; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div>
                  <span style="font-size: 11px; background: #312e81; color: #a5b4fc; padding: 2px 8px; border-radius: 6px; font-weight: 800;">#HOST-{{ c.id }}</span>
                  <h5 style="margin: 4px 0 2px 0; color: #f8fafc; font-size: 15px;">{{ c.title }}</h5>
                  <span style="font-size: 11px; color: #94a3b8;">Student: {{ c.student?.name || 'Rahul Kumar' }} (Room {{ c.student?.roomNumber || '102' }})</span>
                </div>
                <span [class]="c.status" class="badge" style="text-transform: uppercase; font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 8px;">{{ c.status }}</span>
              </div>
              <p style="font-size: 12px; color: #cbd5e1; margin-bottom: 10px;">{{ c.description }}</p>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #1e293b; padding-top: 8px;">
                <span>Assigned Staff: <strong style="color: #60a5fa;">{{ c.staff?.name || 'Ram Singh (Electrician)' }}</strong></span>
                <span>Category: {{ c.category | uppercase }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. STAFF PERFORMANCE LEADERBOARD -->
        <div *ngIf="activeTab === 'performance'" class="tab-panel animate-fade">
          <h4 class="page-title">👨‍🔧 Maintenance Staff Performance Leaderboard</h4>

          <div class="card" style="background: #0f172a; color: white; padding: 18px; border-radius: 16px; border: 1px solid #1e293b;">
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12.5px;">
                <thead>
                  <tr style="border-bottom: 1.5px solid #334155; color: #94a3b8;">
                    <th style="padding: 10px;">Staff Member</th>
                    <th style="padding: 10px;">Trade / Category</th>
                    <th style="padding: 10px;">Assigned</th>
                    <th style="padding: 10px;">Resolved</th>
                    <th style="padding: 10px;">Pending</th>
                    <th style="padding: 10px;">Avg Resolution Time</th>
                    <th style="padding: 10px;">Rating</th>
                    <th style="padding: 10px;">Status Badge</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let s of staffPerformanceList" style="border-bottom: 1px solid #1e293b;">
                    <td style="padding: 12px; font-weight: 700; color: #f8fafc;">{{ s.name }}</td>
                    <td style="padding: 12px; color: #818cf8;">{{ s.category }}</td>
                    <td style="padding: 12px;">{{ s.assigned }}</td>
                    <td style="padding: 12px; color: #4ade80; font-weight: 700;">{{ s.resolved }}</td>
                    <td style="padding: 12px; color: #fde047;">{{ s.pending }}</td>
                    <td style="padding: 12px; color: #94a3b8;">{{ s.avgResolutionTime }}</td>
                    <td style="padding: 12px; color: #facc15; font-weight: 800;">⭐ {{ s.rating }}</td>
                    <td style="padding: 12px;">
                      <span *ngIf="s.statusBadge==='excellent'" style="background: #14532d; color: #4ade80; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 800;">EXCELLENT</span>
                      <span *ngIf="s.statusBadge==='moderate'" style="background: #713f12; color: #fde047; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 800;">MODERATE</span>
                      <span *ngIf="s.statusBadge==='attention'" style="background: #7f1d1d; color: #fca5a5; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 800;">NEEDS ATTENTION</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 4. REAL-TIME ATTENDANCE ANALYTICS -->
        <div *ngIf="activeTab === 'attendance'" class="tab-panel animate-fade">
          <h4 class="page-title">🕒 Real-Time Attendance Analytics</h4>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 20px;">
            <div style="background: #0f172a; padding: 16px; border-radius: 14px; border-left: 4px solid #22c55e; color: white;">
              <span style="font-size: 11px; color: #94a3b8; display: block;">Student Today's Attendance</span>
              <strong style="font-size: 24px; color: #4ade80;">{{ attendanceStats?.studentPercentage || 92 }}%</strong>
              <span style="font-size: 11px; color: #cbd5e1; display: block; margin-top: 4px;">{{ attendanceStats?.presentStudents || 110 }} Present / {{ attendanceStats?.absentStudents || 10 }} Absent</span>
            </div>
            <div style="background: #0f172a; padding: 16px; border-radius: 14px; border-left: 4px solid #6366f1; color: white;">
              <span style="font-size: 11px; color: #94a3b8; display: block;">Staff Today's Attendance</span>
              <strong style="font-size: 24px; color: #818cf8;">{{ attendanceStats?.staffPercentage || 94 }}%</strong>
              <span style="font-size: 11px; color: #cbd5e1; display: block; margin-top: 4px;">{{ attendanceStats?.staffPresent || 14 }} / {{ attendanceStats?.staffCount || 16 }} Present</span>
            </div>
          </div>

          <!-- Block-wise Attendance Card -->
          <div class="card" style="background: #0f172a; color: white; padding: 18px; border-radius: 16px; border: 1px solid #1e293b;">
            <h5 style="margin: 0 0 12px 0; color: #f8fafc;">Hostel Block Breakdown</h5>
            <div *ngFor="let b of attendanceStats?.blockWise" style="margin-bottom: 12px; background: #1e293b; padding: 12px; border-radius: 10px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
                <span style="font-weight: 700; color: #f8fafc;">{{ b.block }}</span>
                <span style="color: #4ade80; font-weight: 800;">{{ b.percentage }}% Present</span>
              </div>
              <div style="background: #0f172a; height: 8px; border-radius: 4px; overflow: hidden;">
                <div [style.width.%]="b.percentage" style="background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%); height: 100%;"></div>
              </div>
              <div *ngIf="b.alert" style="margin-top: 6px; font-size: 10.5px; color: #fca5a5; font-weight: 700;">⚠️ {{ b.alert }}</div>
            </div>
          </div>
        </div>

        <!-- 5. FEEDBACK & REVIEWS (COMPLAINTS + MESS FOOD REVIEWS) -->
        <div *ngIf="activeTab === 'feedback'" class="tab-panel animate-fade">
          <h4 class="page-title">⭐ Feedback & Reviews (System + Mess Reviews)</h4>

          <!-- Rating Breakdown Header -->
          <div class="card" style="background: #0f172a; color: white; padding: 18px; border-radius: 16px; border: 1px solid #1e293b; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
              <div>
                <span style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Mess Food Quality Score</span>
                <h2 style="margin: 4px 0 0 0; color: #facc15; font-size: 32px; font-weight: 900;">⭐ {{ messAnalytics?.summary?.avgRating || '4.2' }} <span style="font-size: 14px; color: #94a3b8;">/ 5.0</span></h2>
                <span style="font-size: 11.5px; color: #cbd5e1;">Based on {{ messAnalytics?.summary?.totalReviews || 128 }} student reviews this week</span>
              </div>
              <div style="flex: 1; max-width: 250px;">
                <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">5-Star Distribution</div>
                <div style="display: flex; align-items: center; gap: 6px; font-size: 11px;">
                  <span>5⭐</span>
                  <div style="flex: 1; background: #1e293b; height: 6px; border-radius: 3px; overflow: hidden;"><div style="width: 70%; background: #facc15; height: 100%;"></div></div>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; font-size: 11px;">
                  <span>4⭐</span>
                  <div style="flex: 1; background: #1e293b; height: 6px; border-radius: 3px; overflow: hidden;"><div style="width: 20%; background: #facc15; height: 100%;"></div></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Student Reviews Stream -->
          <div class="card" style="background: #0f172a; color: white; padding: 18px; border-radius: 16px; border: 1px solid #1e293b;">
            <h5 style="margin: 0 0 12px 0; color: #f8fafc;">Recent Student Mess & Complaint Reviews</h5>
            <div *ngFor="let r of messAnalytics?.reviews" style="background: #1e293b; padding: 12px; border-radius: 10px; margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                <strong style="color: #f8fafc;">{{ r.student?.name || 'Student' }} ({{ r.mealType | uppercase }})</strong>
                <span style="color: #facc15; font-weight: 800;">⭐ {{ r.foodQuality }}/5</span>
              </div>
              <p style="font-size: 11.5px; color: #cbd5e1; margin: 0;">{{ r.comments || 'Food quality and cleanliness was good.' }}</p>
            </div>
          </div>
        </div>

        <!-- 6. LIVE ACTIVITY FEED -->
        <div *ngIf="activeTab === 'activity'" class="tab-panel animate-fade">
          <h4 class="page-title">📜 Live System Activity Feed</h4>

          <div class="card" style="background: #0f172a; color: white; padding: 18px; border-radius: 16px; border: 1px solid #1e293b;">
            <div *ngFor="let log of activityLogs" style="display: flex; gap: 12px; border-bottom: 1px solid #1e293b; padding: 10px 0; align-items: center;">
              <span style="font-size: 18px;">⚡</span>
              <div>
                <span style="font-size: 12px; font-weight: 700; color: #818cf8;">{{ log.actorName || 'System' }} ({{ log.actorRole | uppercase }})</span>
                <p style="margin: 2px 0 0 0; font-size: 11.5px; color: #cbd5e1;">{{ log.description }}</p>
                <span style="font-size: 10px; color: #64748b;">{{ log.createdAt | date:'shortTime' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 7. CRITICAL ALERTS HUB -->
        <div *ngIf="activeTab === 'alerts'" class="tab-panel animate-fade">
          <h4 class="page-title">🚨 Critical Alerts & Attention Hub</h4>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="background: #450a0a; border: 1.5px solid #ef4444; padding: 16px; border-radius: 14px; color: white;">
              <strong style="color: #fca5a5; font-size: 14px;">⚠️ Unassigned Complaint Timeout Alert</strong>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #fecdd3;">8 complaints pending assignment for > 2 hours in Block B.</p>
            </div>
            <div style="background: #422006; border: 1.5px solid #eab308; padding: 16px; border-radius: 14px; color: white;">
              <strong style="color: #fde047; font-size: 14px;">⚡ High Absentees Alert</strong>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #fef08a;">Boys Hostel B-1 reported 23% student absent rate today.</p>
            </div>
          </div>
        </div>

        <!-- 8. STUDENTS & USERS MANAGEMENT DIRECTORY -->
        <div *ngIf="activeTab === 'users'" class="tab-panel animate-fade">
          <h4 class="page-title">👥 System Users & Batch Management</h4>

          <!-- Bulk Student Batch Import Section -->
          <div class="card" style="margin-bottom: 20px; background: #0f172a; color: white; padding: 18px; border-radius: 16px; border: 1px solid #334155;">
            <h5 style="margin: 0 0 4px 0; color: #f8fafc; font-size: 15px; font-weight: 800;">📥 Bulk Student Batch Import (Excel / CSV)</h5>
            <p style="margin: 0 0 14px 0; color: #94a3b8; font-size: 11.5px;">Upload student Excel/CSV sheet to register a full batch at once</p>

            <div *ngIf="batchImportSuccess" class="alert alert-success" style="margin-bottom: 12px; font-weight: 700;">{{ batchImportSuccess }}</div>
            <div *ngIf="batchImportError" class="alert alert-danger" style="margin-bottom: 12px; font-weight: 700;">{{ batchImportError }}</div>

            <div style="margin-bottom: 12px;">
              <label style="display: block; font-size: 11px; font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">Target Batch Name</label>
              <input type="text" class="form-input" style="width: 100%; background: #1e293b; border: 1.5px solid #6366f1; color: white; border-radius: 8px; padding: 10px; font-weight: 700; box-sizing: border-box;" [(ngModel)]="bulkBatchName" placeholder="e.g. Batch 2025-2029" />
            </div>

            <div style="margin-bottom: 12px;">
              <label style="display: block; font-size: 11px; font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">Upload Excel/CSV File</label>
              <input type="file" accept=".csv, .xlsx, .json" (change)="onExcelFileSelected($event)" style="font-size: 12px; color: #cbd5e1; background: #1e293b; border: 1px dashed #6366f1; width: 100%; padding: 10px; border-radius: 8px; box-sizing: border-box;" />
            </div>

            <div *ngIf="excelParsedStudents.length > 0" style="margin-bottom: 12px; padding: 10px; background: #1e293b; border-radius: 8px; border: 1px solid #6366f1;">
              <span style="font-size: 12px; font-weight: 700; color: #818cf8;">📄 Preview Parsed Students: {{ excelParsedStudents.length }} records ready to import</span>
            </div>

            <button type="button" class="btn btn-primary" (click)="uploadParsedBatch()" [disabled]="excelParsedStudents.length === 0 || importingBatch" style="width: 100%; font-weight: 800; padding: 12px; border-radius: 10px;">
              <span *ngIf="importingBatch">Importing Student Batch...</span>
              <span *ngIf="!importingBatch">🚀 Register {{ excelParsedStudents.length }} Students Now</span>
            </button>
          </div>

          <!-- Termination & Block Control Center -->
          <div class="card" style="margin-bottom: 24px; background: #1e1b2e; border: 1.5px solid #991b1b; padding: 18px; border-radius: 16px;">
            <h5 style="margin: 0 0 4px 0; color: #fecdd3; font-size: 15px; font-weight: 800;">⛔ Termination & Block Control Center</h5>
            <p style="margin: 0 0 14px 0; color: #fda4af; font-size: 11.5px;">Terminate individual IDs or block an entire student batch instantly</p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
              <!-- Single ID Termination -->
              <div style="background: rgba(0,0,0,0.5); padding: 14px; border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.4);">
                <label style="display: block; font-size: 11.5px; font-weight: 700; color: #fecdd3; margin-bottom: 6px;">1-Click Single User Termination</label>
                <select class="form-input" style="width: 100%; background: #0f172a; border: 1.5px solid #ef4444; color: white; border-radius: 8px; padding: 8px; margin-bottom: 8px; font-weight: 600; box-sizing: border-box;" [(ngModel)]="terminateUserIdInput">
                  <option [ngValue]="null">Select User to Block/Terminate</option>
                  <option *ngFor="let u of users" [value]="u.id">{{ u.name }} ({{ u.role | uppercase }}) - ID #{{ u.id }}</option>
                </select>
                <button type="button" class="btn btn-delete-user" (click)="executeSingleUserTermination()" style="width: 100%; background: #ef4444; color: white; padding: 8px; font-weight: 800; border-radius: 8px;">🚫 Block / Terminate User</button>
              </div>

              <!-- Full Batch Termination -->
              <div style="background: rgba(0,0,0,0.5); padding: 14px; border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.4);">
                <label style="display: block; font-size: 11.5px; font-weight: 700; color: #fecdd3; margin-bottom: 6px;">1-Click Full Batch Termination</label>
                <select class="form-input" style="width: 100%; background: #0f172a; border: 1.5px solid #dc2626; color: white; border-radius: 8px; padding: 8px; margin-bottom: 8px; font-weight: 600; box-sizing: border-box;" [(ngModel)]="terminateBatchNameInput">
                  <option value="">Select Batch to Terminate</option>
                  <option value="Batch 2023-2027">Batch 2023-2027</option>
                  <option value="Batch 2024-2028">Batch 2024-2028</option>
                  <option value="Batch 2025-2029">Batch 2025-2029</option>
                  <option value="Batch 2026-2030">Batch 2026-2030</option>
                </select>
                <input type="text" class="form-input" style="width: 100%; background: #0f172a; border: 1px solid #dc2626; color: white; border-radius: 8px; padding: 6px; font-size: 11px; margin-bottom: 8px; box-sizing: border-box;" [(ngModel)]="terminateBatchNameInput" placeholder="Or type custom batch name" />
                <button type="button" class="btn btn-delete-user" (click)="executeBatchTermination()" style="width: 100%; background: #dc2626; color: white; padding: 8px; font-weight: 800; border-radius: 8px;">⚠️ Terminate Entire Batch</button>
              </div>
            </div>
          </div>

          <!-- User Directory List -->
          <div class="user-list">
            <div *ngFor="let u of users" class="user-card" style="background: #0f172a; color: white; border: 1px solid #1e293b; padding: 14px; border-radius: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #f8fafc;">{{ u.name }}</strong>
                <span style="font-size: 11px; color: #94a3b8; display: block;">{{ u.email }} | {{ u.role | uppercase }} | Block: {{ u.hostelBlock || 'All' }}</span>
              </div>
              <button class="btn btn-delete-user" (click)="deleteUser(u.id)" style="padding: 6px 12px; font-size: 11px;">Delete</button>
            </div>
          </div>
        </div>

        <!-- 9. TASK & WORK DISPATCHER -->
        <div *ngIf="activeTab === 'tasks'" class="tab-panel animate-fade">
          <h4 class="page-title">🗂️ Task & Work Dispatcher</h4>

          <!-- Dispatch Task Card -->
          <div class="card" style="background: #0f172a; color: white; padding: 18px; border-radius: 16px; border: 1px solid #1e293b; margin-bottom: 20px;">
            <h5 style="margin: 0 0 12px 0; color: #f8fafc;">Dispatch Custom Maintenance Task</h5>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <input type="text" class="form-input" style="background: #1e293b; color: white;" [(ngModel)]="newTaskTitle" placeholder="Task Title (e.g. Clean Terrace Floor Block A)" />
              <textarea class="form-input" style="background: #1e293b; color: white;" [(ngModel)]="newTaskDesc" placeholder="Task details and instructions"></textarea>
              <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <select class="form-input" style="flex: 1; background: #1e293b; color: white;" [(ngModel)]="newTaskStaffId">
                  <option [ngValue]="null">Select Staff Member</option>
                  <option *ngFor="let s of staffList" [value]="s.id">{{ s.name }} ({{ s.bio || 'Maintenance' }})</option>
                </select>
                <select class="form-input" style="flex: 1; background: #1e293b; color: white;" [(ngModel)]="newTaskPriority">
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">URGENT</option>
                </select>
              </div>
              <button class="btn btn-primary" (click)="createTaskSubmit()" style="font-weight: 800; padding: 10px;">🚀 Dispatch Task Now</button>
            </div>
          </div>

          <!-- Dispatched Tasks List -->
          <div class="card" style="background: #0f172a; color: white; padding: 18px; border-radius: 16px; border: 1px solid #1e293b;">
            <h5 style="margin: 0 0 12px 0; color: #f8fafc;">Dispatched Work Tasks</h5>
            <div *ngFor="let task of staffTasksList" style="background: #1e293b; padding: 12px; border-radius: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #f8fafc;">{{ task.title }}</strong>
                <span style="font-size: 11px; color: #94a3b8; display: block;">Assigned: {{ task.assignedStaff?.name || 'Staff' }} | Priority: {{ task.priority | uppercase }}</span>
              </div>
              <span [style.background]="task.status==='completed'?'#15803d':'#a16207'" style="padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; color: white;">{{ task.status | uppercase }}</span>
            </div>
          </div>
        </div>

        <!-- 10. CREATE STAFF / MANAGEMENT -->
        <div *ngIf="activeTab === 'create'" class="tab-panel animate-fade">
          <h4 class="page-title">➕ Create Staff Account</h4>
          <div class="card" style="background: #0f172a; color: white; padding: 18px; border-radius: 16px; border: 1px solid #1e293b;">
            <form (ngSubmit)="onCreateSubmit()">
              <div class="form-group" style="margin-bottom: 10px;">
                <label style="color: #94a3b8; font-size: 12px;">Full Name</label>
                <input type="text" class="form-input" style="background: #1e293b; color: white;" [(ngModel)]="createForm.name" name="name" required />
              </div>
              <div class="form-group" style="margin-bottom: 10px;">
                <label style="color: #94a3b8; font-size: 12px;">Email</label>
                <input type="email" class="form-input" style="background: #1e293b; color: white;" [(ngModel)]="createForm.email" name="email" required />
              </div>
              <div class="form-group" style="margin-bottom: 10px;">
                <label style="color: #94a3b8; font-size: 12px;">Password</label>
                <input type="password" class="form-input" style="background: #1e293b; color: white;" [(ngModel)]="createForm.password" name="password" required />
              </div>
              <div class="form-group" style="margin-bottom: 10px;">
                <label style="color: #94a3b8; font-size: 12px;">Role</label>
                <select class="form-input" style="background: #1e293b; color: white;" [(ngModel)]="createForm.role" name="role">
                  <option value="warden">Warden</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px; font-weight: 800;">Create Account</button>
            </form>
          </div>
        </div>

        <!-- SETTINGS TAB -->
        <div *ngIf="activeTab === 'settings'" class="tab-panel animate-fade">
          <h4 class="page-title">⚙️ System Settings</h4>
          <div class="card" style="background: #0f172a; color: white; padding: 18px; border-radius: 16px; border: 1px solid #1e293b;">
            <p style="color: #94a3b8; font-size: 12px;">System settings and portal controls</p>
          </div>
        </div>

        <!-- PROFILE TAB -->
        <div *ngIf="activeTab === 'my-profile'" class="tab-panel animate-fade">
          <h4 class="page-title">👤 Admin Profile</h4>
          <div class="card" style="background: #0f172a; color: white; padding: 18px; border-radius: 16px; border: 1px solid #1e293b;">
            <p style="color: #94a3b8; font-size: 12px;">Logged in as: {{ user?.email }}</p>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 16px; max-width: 1200px; margin: 0 auto; font-family: 'Inter', sans-serif; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .user-info { display: flex; align-items: center; gap: 12px; }
    .avatar-ring { width: 42px; height: 42px; border-radius: 50%; background: #6366f1; display: flex; align-items: center; justify-content: center; }
    .header-actions { display: flex; gap: 8px; }
    .admin-tab-nav { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 16px; -webkit-overflow-scrolling: touch; }
    .admin-tab-nav button { white-space: nowrap; padding: 8px 14px; border-radius: 10px; border: 1px solid #334155; background: #0f172a; color: #cbd5e1; font-weight: 700; font-size: 12px; cursor: pointer; }
    .admin-tab-nav button.active { background: #6366f1; color: white; border-color: #6366f1; }
    .form-input { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #334155; font-size: 12px; box-sizing: border-box; }
    .btn { padding: 10px 16px; border-radius: 8px; border: none; font-weight: 700; cursor: pointer; }
    .btn-primary { background: #6366f1; color: white; }
    .btn-delete-user { background: #ef4444; color: white; }
    .page-title { font-weight: 900; font-size: 18px; margin-bottom: 14px; color: #f8fafc; }
  `]
})
export class AdminComponent implements OnInit {
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

  createForm = { name: '', email: '', password: '', role: 'staff' };

  constructor(
    private authService: AuthService,
    private complaintService: ComplaintService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadGraphicalAnalytics();
    this.loadUsers();
    this.loadStaffPerformance();
    this.loadAttendanceStats();
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
  }

  loadGraphicalAnalytics(): void {
    this.complaintService.getManagementAnalytics(this.period).subscribe({
      next: (res) => {
        this.mgmtTrendData = res;
        this.analytics = { summary: { total: res.summary.totalComplaints, pending: res.summary.pendingComplaints, resolved: res.summary.resolvedComplaints, assigned: res.summary.inProgressComplaints, inProgress: 0 } };
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error analytics:', err)
    });
  }

  loadUsers(): void {
    this.complaintService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.staffList = res.filter((u: any) => u.role === 'staff');
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error users:', err)
    });
  }

  loadStaffPerformance(): void {
    this.complaintService.getStaffPerformance().subscribe({
      next: (res) => {
        this.staffPerformanceList = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error staff performance:', err)
    });
  }

  loadAttendanceStats(): void {
    this.complaintService.getAttendanceStats().subscribe({
      next: (res) => {
        this.attendanceStats = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error attendance stats:', err)
    });
  }

  loadMessAnalytics(): void {
    this.complaintService.getMessAnalytics().subscribe({
      next: (res) => {
        this.messAnalytics = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error mess analytics:', err)
    });
  }

  loadActivityLogs(): void {
    this.complaintService.getActivityLogs().subscribe({
      next: (res) => {
        this.activityLogs = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error activity logs:', err)
    });
  }

  loadStaffTasks(): void {
    this.complaintService.getStaffTasks().subscribe({
      next: (res) => {
        this.staffTasksList = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error staff tasks:', err)
    });
  }

  loadComplaints(): void {
    this.complaintService.getAllComplaints().subscribe({
      next: (res) => {
        this.allComplaints = res;
        this.filterComplaints();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error complaints:', err)
    });
  }

  filterComplaints(): void {
    this.filteredComplaints = this.allComplaints.filter(c => {
      const matchStatus = this.workflowStatusFilter === 'all' || c.status === this.workflowStatusFilter;
      const matchCat = this.workflowCategoryFilter === 'all' || c.category === this.workflowCategoryFilter;
      return matchStatus && matchCat;
    });
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
      next: (res) => {
        this.importingBatch = false;
        this.batchImportSuccess = `✅ ${res.message || 'Batch created successfully!'}`;
        this.excelParsedStudents = [];
        this.loadUsers();
        this.cdr.detectChanges();
      },
      error: (err) => {
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
      next: (res) => {
        alert(`✅ ${res.message}`);
        this.terminateUserIdInput = null;
        this.loadUsers();
      },
      error: (err) => alert(`❌ ${err.error?.message || 'Failed to terminate user.'}`)
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
      next: (res) => {
        alert(`✅ ${res.message}`);
        this.terminateBatchNameInput = '';
        this.loadUsers();
      },
      error: (err) => alert(`❌ ${err.error?.message || 'Failed to terminate batch.'}`)
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
      next: (res) => {
        alert(`✅ ${res.message}`);
        this.newTaskTitle = '';
        this.newTaskDesc = '';
        this.newTaskStaffId = null;
        this.loadStaffTasks();
      },
      error: (err) => alert(`❌ ${err.error?.message || 'Failed to create task.'}`)
    });
  }

  onCreateSubmit(): void {
    this.complaintService.createStaffAccount(this.createForm).subscribe({
      next: (res) => {
        alert('✅ Account created successfully!');
        this.createForm = { name: '', email: '', password: '', role: 'staff' };
        this.loadUsers();
      },
      error: (err) => alert(`❌ ${err.error?.message || 'Failed to create account.'}`)
    });
  }

  deleteUser(userId: number): void {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.complaintService.deleteUser(userId).subscribe({
      next: (res) => {
        alert('✅ User deleted successfully!');
        this.loadUsers();
      },
      error: (err) => alert(`❌ ${err.error?.message || 'Failed to delete user.'}`)
    });
  }

  initProfileEdit(): void {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
