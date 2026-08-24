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
    <div class="executive-layout" [class.light-theme]="!isDarkMode">
      
      <!-- LEFT SIDEBAR NAVIGATION -->
      <aside class="sidebar">
        <div class="brand-header">
          <div class="brand-logo-shield">🛡️</div>
          <div>
            <h2 class="brand-title">Admin Console</h2>
            <span class="brand-subtitle">Full System Executive Control</span>
          </div>
        </div>

        <div class="nav-section-label">EXECUTIVE</div>
        <nav class="nav-menu">
          <button (click)="switchTab('dashboard')" [class.active]="activeTab === 'dashboard'" class="nav-link">
            <span class="nav-icon">🏠</span> <span>Dashboard</span>
          </button>
          <button (click)="switchTab('workflow')" [class.active]="activeTab === 'workflow'" class="nav-link">
            <span class="nav-icon">🛠️</span> <span>Work Flow</span>
          </button>
          <button (click)="switchTab('staff-stats')" [class.active]="activeTab === 'staff-stats'" class="nav-link">
            <span class="nav-icon">👥</span> <span>Staff Stats</span>
          </button>
          <button (click)="switchTab('attendance')" [class.active]="activeTab === 'attendance'" class="nav-link">
            <span class="nav-icon">🕒</span> <span>Attendance</span>
          </button>
          <button (click)="switchTab('feedback')" [class.active]="activeTab === 'feedback'" class="nav-link">
            <span class="nav-icon">⭐</span> <span>Feedbacks & Mess</span>
          </button>
        </nav>

        <div class="nav-section-label">OPERATIONS</div>
        <nav class="nav-menu">
          <button (click)="switchTab('complaints')" [class.active]="activeTab === 'complaints'" class="nav-link">
            <span class="nav-icon">📋</span> <span>Complaints</span>
          </button>
          <button (click)="switchTab('tasks')" [class.active]="activeTab === 'tasks'" class="nav-link">
            <span class="nav-icon">🔧</span> <span>Task Dispatcher</span>
          </button>
          <button (click)="switchTab('users')" [class.active]="activeTab === 'users'" class="nav-link">
            <span class="nav-icon">👥</span> <span>Students & Roles</span>
          </button>
        </nav>

        <div class="nav-section-label">SYSTEM</div>
        <nav class="nav-menu">
          <button (click)="switchTab('activity')" [class.active]="activeTab === 'activity'" class="nav-link">
            <span class="nav-icon">📜</span> <span>Audit Logs</span>
          </button>
          <button (click)="switchTab('settings')" [class.active]="activeTab === 'settings'" class="nav-link">
            <span class="nav-icon">⚙️</span> <span>Settings</span>
          </button>
        </nav>

        <!-- System Status Heartbeat Card -->
        <div class="system-status-card">
          <div class="status-pulse-header">
            <span class="pulse-dot"></span>
            <span class="status-label">All Systems Operational</span>
          </div>
          <div class="heartbeat-wave">
            <svg viewBox="0 0 100 20" class="wave-svg">
              <path d="M0 10 Q 15 10, 20 2 Q 25 18, 30 10 T 60 10 T 70 0 T 80 20 T 100 10" fill="none" stroke="#10b981" stroke-width="2"/>
            </svg>
          </div>
        </div>
      </aside>

      <!-- MAIN CONTENT WRAPPER -->
      <main class="main-wrapper">
        
        <!-- TOP NAVBAR -->
        <header class="top-navbar">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="Search anything... Ctrl /" [(ngModel)]="searchQuery" (input)="onSearch()" />
          </div>

          <div class="top-navbar-right">
            <div class="time-badge">
              <span>📅 {{ currentDateStr }}</span>
            </div>
            
            <button class="icon-btn" title="Notifications">
              <span>🔔</span>
              <span class="notification-badge">4</span>
            </button>

            <button class="icon-btn" (click)="toggleDarkMode()" [title]="isDarkMode ? 'Light Mode' : 'Dark Mode'">
              <span>{{ isDarkMode ? '☀️' : '🌙' }}</span>
            </button>

            <div class="profile-chip" (click)="switchTab('my-profile')">
              <img *ngIf="user?.profilePicUrl" [src]="'https://hostelhub-0cyi.onrender.com' + user?.profilePicUrl" class="user-avatar" />
              <div *ngIf="!user?.profilePicUrl" class="user-avatar-fallback">👑</div>
              <div class="user-meta-text">
                <span class="user-name">{{ user?.name || 'Super Admin' }}</span>
                <span class="user-role">Administrator</span>
              </div>
            </div>

            <button class="logout-btn" (click)="logout()" title="Logout">
              <span>🚪</span>
            </button>
          </div>
        </header>

        <!-- DASHBOARD BODY CONTAINER -->
        <div class="content-body">

          <!-- 1. MAIN DASHBOARD VIEW (IMAGE 2) -->
          <div *ngIf="activeTab === 'dashboard'" class="tab-view animate-fade">
            
            <!-- Hero Welcome Card with 3D Isometric Graphic -->
            <div class="welcome-hero-card">
              <div class="hero-text-content">
                <span class="hero-greeting">Welcome back,</span>
                <h1 class="hero-user-name">{{ user?.name || 'Super Admin' }} 👋</h1>
                <p class="hero-subtitle">Here's what's happening in your system today.</p>
              </div>
              <div class="hero-building-graphic">
                <div class="isometric-building">🏢✨</div>
              </div>
            </div>

            <!-- Top 4 Metric Cards (Glow & Trend Stats) -->
            <div class="metrics-grid">
              <div class="metric-card purple-glow">
                <div class="metric-header">
                  <span class="metric-title">Total Complaints</span>
                  <span class="metric-icon purple">📋</span>
                </div>
                <div class="metric-value">{{ analytics?.summary?.total || 304 }}</div>
                <div class="metric-trend green">↑ 18% vs last week</div>
              </div>

              <div class="metric-card green-glow">
                <div class="metric-header">
                  <span class="metric-title">Resolved</span>
                  <span class="metric-icon green">✅</span>
                </div>
                <div class="metric-value">{{ analytics?.summary?.resolved || 221 }}</div>
                <div class="metric-trend green">↑ 24% vs last week</div>
              </div>

              <div class="metric-card yellow-glow">
                <div class="metric-header">
                  <span class="metric-title">Pending</span>
                  <span class="metric-icon yellow">⏳</span>
                </div>
                <div class="metric-value">{{ analytics?.summary?.pending || 23 }}</div>
                <div class="metric-trend red">↓ 8% vs last week</div>
              </div>

              <div class="metric-card blue-glow">
                <div class="metric-header">
                  <span class="metric-title">Open / In-Progress</span>
                  <span class="metric-icon blue">🔧</span>
                </div>
                <div class="metric-value">{{ (analytics?.summary?.inProgress || 0) + (analytics?.summary?.assigned || 0) || 60 }}</div>
                <div class="metric-trend green">↑ 12% vs last week</div>
              </div>
            </div>

            <!-- AI Executive Insight Card -->
            <div class="ai-executive-card">
              <div class="ai-avatar-box">🤖</div>
              <div class="ai-text-content">
                <div class="ai-header-row">
                  <span class="ai-title">AI Executive Insight</span>
                  <span class="live-pill">● LIVE</span>
                </div>
                <p class="ai-description">Electrical issues volume up 40% in Boys Hostel B-1 this week. Maintenance dispatch recommended to reduce resolution time.</p>
              </div>
              <button class="ai-report-btn" (click)="switchTab('workflow')">View AI Report →</button>
            </div>

            <!-- Main Dashboard Grid -->
            <div class="grid-2-col">
              
              <!-- Left Chart Card: Complaints Overview & KPIs -->
              <div class="glass-card">
                <div class="card-header-row">
                  <div>
                    <h3 class="card-title">Complaints Overview</h3>
                    <span class="card-subtitle">Total complaints vs resolved trend</span>
                  </div>
                  <div class="period-selector">
                    <button (click)="switchPeriod('week')" [class.active]="period==='week'">Weekly</button>
                    <button (click)="switchPeriod('month')" [class.active]="period==='month'">Monthly</button>
                  </div>
                </div>

                <!-- Custom Dual SVG Area Chart -->
                <div class="chart-container">
                  <svg viewBox="0 0 500 150" class="area-chart-svg">
                    <defs>
                      <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#818cf8" stop-opacity="0.4"/>
                        <stop offset="100%" stop-color="#818cf8" stop-opacity="0"/>
                      </linearGradient>
                      <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#34d399" stop-opacity="0.4"/>
                        <stop offset="100%" stop-color="#34d399" stop-opacity="0"/>
                      </linearGradient>
                    </defs>
                    <path d="M 0 120 Q 100 60 200 80 T 400 30 L 500 40 L 500 150 L 0 150 Z" fill="url(#purpleGrad)" />
                    <path d="M 0 120 Q 100 60 200 80 T 400 30 L 500 40" fill="none" stroke="#818cf8" stroke-width="3" />
                    
                    <path d="M 0 140 Q 100 90 200 110 T 400 60 L 500 70 L 500 150 L 0 150 Z" fill="url(#greenGrad)" />
                    <path d="M 0 140 Q 100 90 200 110 T 400 60 L 500 70" fill="none" stroke="#34d399" stroke-width="3" />
                  </svg>
                  <div class="chart-legend">
                    <span><span class="dot purple"></span> Total Complaints (304)</span>
                    <span><span class="dot green"></span> Resolved (221)</span>
                  </div>
                </div>

                <!-- Bottom KPI Chips -->
                <div class="kpi-chips-row">
                  <div class="kpi-chip">
                    <span class="kpi-lbl">Avg. Resolution Time</span>
                    <strong class="kpi-val">18.5 hrs <span class="green-text">▲ 11%</span></strong>
                  </div>
                  <div class="kpi-chip">
                    <span class="kpi-lbl">SLA Compliance</span>
                    <strong class="kpi-val">92% <span class="green-text">▲ 5%</span></strong>
                  </div>
                  <div class="kpi-chip">
                    <span class="kpi-lbl">Customer Satisfaction</span>
                    <strong class="kpi-val">4.6 / 5 <span class="green-text">▲ 0.3</span></strong>
                  </div>
                </div>
              </div>

              <!-- Right Quick Actions Panel -->
              <div class="glass-card">
                <h3 class="card-title" style="margin-bottom: 14px;">Quick Actions</h3>
                <div class="quick-actions-list">
                  <button class="action-item" (click)="switchTab('tasks')">
                    <span class="action-icon">📣</span>
                    <span>Create Announcement</span>
                    <span class="arrow">›</span>
                  </button>
                  <button class="action-item" (click)="switchTab('workflow')">
                    <span class="action-icon">🛠️</span>
                    <span>Assign Maintenance</span>
                    <span class="arrow">›</span>
                  </button>
                  <button class="action-item" (click)="switchTab('workflow')">
                    <span class="action-icon">⚠️</span>
                    <span>View Escalations</span>
                    <span class="badge-count red">12</span>
                  </button>
                  <button class="action-item" (click)="switchTab('activity')">
                    <span class="action-icon">📄</span>
                    <span>Generate Audit Report</span>
                    <span class="arrow">›</span>
                  </button>
                  <button class="action-item" (click)="switchTab('users')">
                    <span class="action-icon">📊</span>
                    <span>Export Student Batch Analytics</span>
                    <span class="arrow">›</span>
                  </button>
                </div>
              </div>

            </div>

            <!-- Categories & Hostel Progress Bars Grid -->
            <div class="grid-2-col" style="margin-top: 20px;">
              
              <!-- Complaints by Category -->
              <div class="glass-card">
                <h3 class="card-title" style="margin-bottom: 14px;">Complaints by Category</h3>
                <div class="category-progress-list">
                  <div class="cat-bar-item">
                    <div class="cat-bar-header">
                      <span>⚡ Electrical</span>
                      <strong>40% (122)</strong>
                    </div>
                    <div class="progress-track"><div class="progress-fill purple" style="width: 40%;"></div></div>
                  </div>
                  <div class="cat-bar-item">
                    <div class="cat-bar-header">
                      <span>🚰 Plumbing</span>
                      <strong>22% (67)</strong>
                    </div>
                    <div class="progress-track"><div class="progress-fill blue" style="width: 22%;"></div></div>
                  </div>
                  <div class="cat-bar-item">
                    <div class="cat-bar-header">
                      <span>🧹 Cleaning</span>
                      <strong>18% (55)</strong>
                    </div>
                    <div class="progress-track"><div class="progress-fill green" style="width: 18%;"></div></div>
                  </div>
                  <div class="cat-bar-item">
                    <div class="cat-bar-header">
                      <span>📶 Internet</span>
                      <strong>12% (36)</strong>
                    </div>
                    <div class="progress-track"><div class="progress-fill yellow" style="width: 12%;"></div></div>
                  </div>
                </div>
              </div>

              <!-- Top Hostels by Complaints -->
              <div class="glass-card">
                <h3 class="card-title" style="margin-bottom: 14px;">Top Hostels by Complaints</h3>
                <div class="category-progress-list">
                  <div class="cat-bar-item">
                    <div class="cat-bar-header">
                      <span>🏢 Boys Hostel B-1</span>
                      <strong>40% (122)</strong>
                    </div>
                    <div class="progress-track"><div class="progress-fill purple" style="width: 40%;"></div></div>
                  </div>
                  <div class="cat-bar-item">
                    <div class="cat-bar-header">
                      <span>🏢 Boys Hostel B-2</span>
                      <strong>26% (79)</strong>
                    </div>
                    <div class="progress-track"><div class="progress-fill blue" style="width: 26%;"></div></div>
                  </div>
                  <div class="cat-bar-item">
                    <div class="cat-bar-header">
                      <span>👧 Girls Hostel G-1</span>
                      <strong>20% (61)</strong>
                    </div>
                    <div class="progress-track"><div class="progress-fill green" style="width: 20%;"></div></div>
                  </div>
                  <div class="cat-bar-item">
                    <div class="cat-bar-header">
                      <span>👧 Girls Hostel G-2</span>
                      <strong>14% (42)</strong>
                    </div>
                    <div class="progress-track"><div class="progress-fill pink" style="width: 14%;"></div></div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          <!-- 2. STAFF STATS OVERVIEW (IMAGE 1) -->
          <div *ngIf="activeTab === 'staff-stats'" class="tab-view animate-fade">
            
            <div class="view-header">
              <div>
                <h1 class="view-title">👥 Staff Stats Overview</h1>
                <p class="view-subtitle">Monitor and manage all staff, wardens and their real-time performance.</p>
              </div>
            </div>

            <!-- Top 6 Staff Metric Cards -->
            <div class="metrics-6-grid">
              <div class="metric-mini-card">
                <span class="mini-icon blue">👥</span>
                <div>
                  <span class="mini-lbl">Total Staff</span>
                  <strong class="mini-val">16</strong>
                  <span class="mini-trend green">↑ 7% vs last month</span>
                </div>
              </div>
              <div class="metric-mini-card">
                <span class="mini-icon green">❇️</span>
                <div>
                  <span class="mini-lbl">Active Staff</span>
                  <strong class="mini-val">14</strong>
                  <span class="mini-trend green">↑ 8% vs last month</span>
                </div>
              </div>
              <div class="metric-mini-card">
                <span class="mini-icon indigo">🛡️</span>
                <div>
                  <span class="mini-lbl">Active Wardens</span>
                  <strong class="mini-val">3</strong>
                  <span class="mini-trend gray">0% vs last month</span>
                </div>
              </div>
              <div class="metric-mini-card">
                <span class="mini-icon yellow">🕒</span>
                <div>
                  <span class="mini-lbl">On Duty Now</span>
                  <strong class="mini-val">11</strong>
                  <span class="mini-trend green">↑ 10% vs last month</span>
                </div>
              </div>
              <div class="metric-mini-card">
                <span class="mini-icon purple">🏖️</span>
                <div>
                  <span class="mini-lbl">On Leave</span>
                  <strong class="mini-val">2</strong>
                  <span class="mini-trend red">↓ 33% vs last month</span>
                </div>
              </div>
              <div class="metric-mini-card">
                <span class="mini-icon gray">⭕</span>
                <div>
                  <span class="mini-lbl">Inactive</span>
                  <strong class="mini-val">0</strong>
                  <span class="mini-trend gray">0% vs last month</span>
                </div>
              </div>
            </div>

            <!-- Staff Members Real-Time Directory Table -->
            <div class="glass-card" style="margin-top: 20px;">
              <div class="card-header-row">
                <h3 class="card-title">All Staff Overview</h3>
                <button class="btn btn-primary" (click)="switchTab('users')" style="width: auto; padding: 8px 14px;">+ Add Staff</button>
              </div>

              <div class="table-responsive">
                <table class="custom-table">
                  <thead>
                    <tr>
                      <th>Staff Member</th>
                      <th>Role</th>
                      <th>Hostel / Area</th>
                      <th>Status</th>
                      <th>On Duty</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let s of staffList">
                      <td>
                        <div class="staff-user-cell">
                          <div class="staff-avatar-circle">👨‍🔧</div>
                          <div>
                            <strong>{{ s.name }}</strong>
                            <span class="staff-id">ID: ST00{{ s.id }}</span>
                          </div>
                        </div>
                      </td>
                      <td><span class="role-pill">{{ s.bio || 'Maintenance' }}</span></td>
                      <td>{{ s.hostelBlock || 'All Hostels' }}</td>
                      <td><span class="status-pill on-duty">● On Duty</span></td>
                      <td>Since 08:00 AM</td>
                      <td>
                        <button class="action-icon-btn" (click)="switchTab('workflow')">👁️</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <!-- 3. WORK FLOW LIFECYCLE STAGE TRACKER (IMAGE 3) -->
          <div *ngIf="activeTab === 'workflow'" class="tab-view animate-fade">
            
            <div class="view-header">
              <div>
                <h1 class="view-title">🛠️ Work Flow Lifecycle Tracker</h1>
                <p class="view-subtitle">Track and manage the complete Complaint lifecycle in real-time.</p>
              </div>
            </div>

            <!-- 6-Stage Glowing Pipeline Flow Step Bar -->
            <div class="workflow-stage-pipeline">
              <div class="pipeline-step">
                <div class="step-circle purple">📝</div>
                <div class="step-info">
                  <span class="step-num">1. Submitted</span>
                  <strong class="step-count">304</strong>
                  <span class="step-sub">Complaint submitted</span>
                </div>
              </div>
              <div class="pipeline-arrow">➔</div>

              <div class="pipeline-step">
                <div class="step-circle blue">📥</div>
                <div class="step-info">
                  <span class="step-num">2. Received</span>
                  <strong class="step-count">296</strong>
                  <span class="step-sub">Received by system</span>
                </div>
              </div>
              <div class="pipeline-arrow">➔</div>

              <div class="pipeline-step">
                <div class="step-circle yellow">👤</div>
                <div class="step-info">
                  <span class="step-num">3. Assigned</span>
                  <strong class="step-count">236</strong>
                  <span class="step-sub">Assigned to staff</span>
                </div>
              </div>
              <div class="pipeline-arrow">➔</div>

              <div class="pipeline-step">
                <div class="step-circle orange">🔧</div>
                <div class="step-info">
                  <span class="step-num">4. In-Progress</span>
                  <strong class="step-count">60</strong>
                  <span class="step-sub">Work currently active</span>
                </div>
              </div>
              <div class="pipeline-arrow">➔</div>

              <div class="pipeline-step">
                <div class="step-circle green">✅</div>
                <div class="step-info">
                  <span class="step-num">5. Resolved</span>
                  <strong class="step-count">221</strong>
                  <span class="step-sub">Issue resolved</span>
                </div>
              </div>
              <div class="pipeline-arrow">➔</div>

              <div class="pipeline-step">
                <div class="step-circle red">⚠️</div>
                <div class="step-info">
                  <span class="step-num">6. Escalated</span>
                  <strong class="step-count">12</strong>
                  <span class="step-sub">Escalated to warden</span>
                </div>
              </div>
            </div>

            <!-- Active Complaints Live Feed -->
            <div class="glass-card" style="margin-top: 20px;">
              <h3 class="card-title" style="margin-bottom: 14px;">Live Complaints Stream</h3>
              <div class="complaint-feed-list">
                <div *ngFor="let c of filteredComplaints" class="feed-item-card">
                  <div class="feed-header">
                    <div>
                      <span class="ticket-tag">#HOST-{{ c.id }}</span>
                      <strong class="ticket-title">{{ c.title }}</strong>
                    </div>
                    <span class="status-badge" [class]="c.status">{{ c.status | uppercase }}</span>
                  </div>
                  <p class="feed-desc">{{ c.description }}</p>
                  <div class="feed-footer">
                    <span>Student: {{ c.student?.name || 'Rahul Kumar' }}</span>
                    <span>Staff: <strong style="color: #60a5fa;">{{ c.staff?.name || 'Ram Singh' }}</strong></span>
                    <span>Category: {{ c.category | uppercase }}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- 4. ATTENDANCE ANALYTICS -->
          <div *ngIf="activeTab === 'attendance'" class="tab-view animate-fade">
            <h1 class="view-title">🕒 Real-Time Attendance Analytics</h1>
            <div class="grid-2-col" style="margin-top: 16px;">
              <div class="glass-card">
                <h3 class="card-title">Student Attendance Today</h3>
                <h1 style="color: #34d399; font-size: 42px; font-weight: 900; margin: 10px 0;">92%</h1>
                <p style="color: #cbd5e1;">110 Present / 10 Absent across 3 hostel blocks</p>
              </div>
              <div class="glass-card">
                <h3 class="card-title">Staff Attendance Today</h3>
                <h1 style="color: #818cf8; font-size: 42px; font-weight: 900; margin: 10px 0;">94%</h1>
                <p style="color: #cbd5e1;">14 Present / 2 Absent on duty</p>
              </div>
            </div>
          </div>

          <!-- 5. FEEDBACKS & MESS REVIEWS -->
          <div *ngIf="activeTab === 'feedback'" class="tab-view animate-fade">
            <h1 class="view-title">⭐ System & Mess Food Quality Reviews</h1>
            <div class="glass-card" style="margin-top: 16px;">
              <div class="card-header-row">
                <div>
                  <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">Mess Overall Rating</span>
                  <h1 style="color: #facc15; font-size: 38px; font-weight: 900; margin: 4px 0;">⭐ 4.2 <span style="font-size: 14px; color: #94a3b8;">/ 5.0</span></h1>
                </div>
              </div>
              <div class="review-stream-list" style="margin-top: 16px;">
                <div *ngFor="let r of messAnalytics?.reviews" class="feed-item-card">
                  <strong style="color: #f8fafc;">{{ r.student?.name || 'Student' }} ({{ r.mealType | uppercase }})</strong>
                  <span style="color: #facc15; font-weight: 800; margin-left: 10px;">⭐ {{ r.foodQuality }}/5</span>
                  <p style="color: #cbd5e1; font-size: 12px; margin-top: 4px;">{{ r.comments || 'Food quality and hygiene was good.' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 6. AUDIT LOGS -->
          <div *ngIf="activeTab === 'activity'" class="tab-view animate-fade">
            <h1 class="view-title">📜 Real-Time Audit Logs</h1>
            <div class="glass-card" style="margin-top: 16px;">
              <div *ngFor="let log of activityLogs" style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px;">
                <strong style="color: #818cf8;">{{ log.actorName || 'System' }}</strong>
                <span style="color: #cbd5e1; margin-left: 10px;">{{ log.description }}</span>
              </div>
            </div>
          </div>

          <!-- 7. STUDENTS & USERS DIRECTORY -->
          <div *ngIf="activeTab === 'users'" class="tab-view animate-fade">
            <h1 class="view-title">👥 Students & User Directory</h1>
            
            <!-- Bulk Import & Termination Panel -->
            <div class="glass-card" style="margin-top: 16px;">
              <h3 class="card-title">📥 Bulk Student Batch Import</h3>
              <input type="text" class="form-input" style="margin: 10px 0;" [(ngModel)]="bulkBatchName" placeholder="Target Batch Name" />
              <input type="file" accept=".csv, .xlsx" (change)="onExcelFileSelected($event)" style="margin-bottom: 10px;" />
              <button class="btn btn-primary" (click)="uploadParsedBatch()">Register Students Now</button>
            </div>

            <div class="glass-card" style="margin-top: 16px;">
              <h3 class="card-title">User Accounts</h3>
              <div *ngFor="let u of users" style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between;">
                <div>
                  <strong>{{ u.name }}</strong>
                  <span style="color: #94a3b8; font-size: 11px; display: block;">{{ u.email }} | {{ u.role }}</span>
                </div>
                <button class="btn btn-delete-user" (click)="deleteUser(u.id)" style="width: auto; padding: 4px 10px; font-size: 11px;">Delete</button>
              </div>
            </div>
          </div>

          <!-- 8. TASK DISPATCHER -->
          <div *ngIf="activeTab === 'tasks'" class="tab-view animate-fade">
            <h1 class="view-title">🔧 Task Dispatcher</h1>
            <div class="glass-card" style="margin-top: 16px;">
              <input type="text" class="form-input" [(ngModel)]="newTaskTitle" placeholder="Task Title" style="margin-bottom: 10px;" />
              <textarea class="form-input" [(ngModel)]="newTaskDesc" placeholder="Task Description" style="margin-bottom: 10px;"></textarea>
              <button class="btn btn-primary" (click)="createTaskSubmit()">Dispatch Task</button>
            </div>
          </div>

          <!-- 9. SETTINGS -->
          <div *ngIf="activeTab === 'settings'" class="tab-view animate-fade">
            <h1 class="view-title">⚙️ System Settings</h1>
            <div class="glass-card" style="margin-top: 16px;">
              <p style="color: #94a3b8;">System configuration and live server preferences.</p>
            </div>
          </div>

          <!-- 10. PROFILE -->
          <div *ngIf="activeTab === 'my-profile'" class="tab-view animate-fade">
            <h1 class="view-title">👤 Admin Profile</h1>
            <div class="glass-card" style="margin-top: 16px;">
              <p style="color: #cbd5e1;">Logged in as: <strong>{{ user?.email }}</strong></p>
            </div>
          </div>

        </div>

      </main>

    </div>
  `,
  styles: [`
    .executive-layout { display: flex; min-height: 100vh; background: #090d16; color: #f8fafc; font-family: 'Inter', sans-serif; }
    
    /* SIDEBAR STYLING */
    .sidebar { width: 250px; background: #0b0f19; border-right: 1px solid rgba(255,255,255,0.08); padding: 20px 14px; display: flex; flex-direction: column; gap: 16px; flex-shrink: 0; }
    .brand-header { display: flex; align-items: center; gap: 10px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .brand-logo-shield { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%); display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .brand-title { font-size: 14.5px; font-weight: 800; color: #f8fafc; margin: 0; }
    .brand-subtitle { font-size: 9.5px; color: #64748b; display: block; }
    
    .nav-section-label { font-size: 9.5px; font-weight: 800; color: #64748b; letter-spacing: 1px; margin-top: 10px; }
    .nav-menu { display: flex; flex-direction: column; gap: 4px; }
    .nav-link { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: 10px; background: transparent; border: none; color: #94a3b8; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; text-align: left; }
    .nav-link:hover { background: rgba(99, 102, 241, 0.1); color: #818cf8; }
    .nav-link.active { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; font-weight: 700; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3); }

    .system-status-card { margin-top: auto; background: rgba(17, 24, 39, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px; }
    .status-pulse-header { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #34d399; font-weight: 700; }
    .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: #34d399; box-shadow: 0 0 10px #34d399; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

    /* MAIN WRAPPER */
    .main-wrapper { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    
    .top-navbar { height: 64px; background: rgba(11, 15, 25, 0.95); border-bottom: 1px solid rgba(255,255,255,0.08); padding: 0 24px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; backdrop-filter: blur(10px); }
    .search-box { display: flex; align-items: center; gap: 8px; background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 6px 12px; width: 280px; }
    .search-box input { background: transparent; border: none; outline: none; color: white; font-size: 12px; width: 100%; }

    .top-navbar-right { display: flex; align-items: center; gap: 12px; }
    .time-badge { background: #1e293b; padding: 6px 12px; border-radius: 8px; font-size: 11.5px; color: #cbd5e1; font-weight: 600; border: 1px solid #334155; }
    .icon-btn { background: #1e293b; border: 1px solid #334155; color: white; width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; }
    .notification-badge { position: absolute; top: -4px; right: -4px; background: #ef4444; color: white; font-size: 9px; font-weight: 900; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

    .profile-chip { display: flex; align-items: center; gap: 10px; background: #1e293b; border: 1px solid #334155; padding: 4px 12px; border-radius: 20px; cursor: pointer; }
    .user-avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
    .user-avatar-fallback { width: 28px; height: 28px; border-radius: 50%; background: #6366f1; display: flex; align-items: center; justify-content: center; font-size: 14px; }
    .user-meta-text { display: flex; flex-direction: column; }
    .user-name { font-size: 11.5px; font-weight: 700; color: #f8fafc; }
    .user-role { font-size: 9.5px; color: #94a3b8; }
    .logout-btn { background: #7f1d1d; border: 1px solid #ef4444; color: white; width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; }

    .content-body { padding: 24px; flex: 1; overflow-y: auto; }
    .view-title { font-size: 22px; font-weight: 900; color: #f8fafc; margin: 0 0 4px 0; }
    .view-subtitle { font-size: 12px; color: #94a3b8; margin: 0 0 16px 0; }

    /* DASHBOARD ELEMENTS */
    .welcome-hero-card { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); border-radius: 18px; padding: 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border: 1px solid rgba(99, 102, 241, 0.3); box-shadow: 0 8px 32px rgba(49, 46, 129, 0.4); }
    .hero-greeting { font-size: 12px; color: #a5b4fc; font-weight: 700; text-transform: uppercase; }
    .hero-user-name { font-size: 26px; font-weight: 900; color: white; margin: 2px 0 6px 0; }
    .hero-subtitle { font-size: 12.5px; color: #cbd5e1; margin: 0; }
    .hero-building-graphic { font-size: 54px; filter: drop-shadow(0 0 15px rgba(99,102,241,0.5)); }

    /* METRICS GRID */
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .metric-card { background: rgba(17, 24, 39, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 18px; backdrop-filter: blur(10px); }
    .purple-glow { border-left: 4px solid #818cf8; }
    .green-glow { border-left: 4px solid #34d399; }
    .yellow-glow { border-left: 4px solid #fbbf24; }
    .blue-glow { border-left: 4px solid #60a5fa; }
    
    .metric-header { display: flex; justify-content: space-between; align-items: center; }
    .metric-title { font-size: 11.5px; color: #94a3b8; font-weight: 700; }
    .metric-icon { font-size: 18px; }
    .metric-value { font-size: 28px; font-weight: 900; color: #f8fafc; margin: 8px 0 4px 0; }
    .metric-trend { font-size: 11px; font-weight: 700; }
    .green-text, .metric-trend.green { color: #34d399; }
    .red-text, .metric-trend.red { color: #f87171; }
    .gray-text, .metric-trend.gray { color: #94a3b8; }

    /* AI CARD */
    .ai-executive-card { background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border: 1.5px solid #6366f1; border-radius: 16px; padding: 18px; display: flex; align-items: center; gap: 16px; margin-bottom: 20px; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.2); }
    .ai-avatar-box { font-size: 32px; background: rgba(99, 102, 241, 0.2); padding: 10px; border-radius: 14px; }
    .ai-text-content { flex: 1; }
    .ai-header-row { display: flex; align-items: center; gap: 10px; }
    .ai-title { font-size: 13.5px; font-weight: 800; color: #a5b4fc; }
    .live-pill { background: #15803d; color: #4ade80; font-size: 9.5px; font-weight: 900; padding: 2px 8px; border-radius: 10px; }
    .ai-description { font-size: 12px; color: #cbd5e1; margin: 4px 0 0 0; }
    .ai-report-btn { background: #6366f1; color: white; border: none; padding: 8px 14px; border-radius: 10px; font-weight: 800; font-size: 11.5px; cursor: pointer; white-space: nowrap; }

    /* GRIDS & CARDS */
    .grid-2-col { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
    .glass-card { background: rgba(17, 24, 39, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; backdrop-filter: blur(10px); }
    .card-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .card-title { font-size: 15px; font-weight: 800; color: #f8fafc; margin: 0; }
    .card-subtitle { font-size: 11px; color: #94a3b8; display: block; margin-top: 2px; }

    .period-selector { display: flex; background: #1e293b; padding: 3px; border-radius: 8px; gap: 3px; }
    .period-selector button { background: transparent; border: none; color: #94a3b8; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; }
    .period-selector button.active { background: #6366f1; color: white; }

    .chart-container { height: 160px; position: relative; margin-bottom: 14px; }
    .area-chart-svg { width: 100%; height: 100%; }
    .chart-legend { display: flex; gap: 16px; font-size: 11px; color: #cbd5e1; font-weight: 600; margin-top: 8px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .dot.purple { background: #818cf8; }
    .dot.green { background: #34d399; }

    .kpi-chips-row { display: flex; gap: 12px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px; }
    .kpi-chip { flex: 1; background: #1e293b; padding: 10px; border-radius: 10px; }
    .kpi-lbl { font-size: 10.5px; color: #94a3b8; display: block; }
    .kpi-val { font-size: 13px; color: white; display: block; margin-top: 2px; }

    /* QUICK ACTIONS */
    .quick-actions-list { display: flex; flex-direction: column; gap: 8px; }
    .action-item { display: flex; align-items: center; gap: 12px; width: 100%; background: #1e293b; border: 1px solid #334155; color: #f8fafc; padding: 12px; border-radius: 12px; font-size: 12.5px; font-weight: 700; cursor: pointer; text-align: left; transition: all 0.2s ease; }
    .action-item:hover { background: rgba(99, 102, 241, 0.15); border-color: #6366f1; color: #818cf8; }
    .action-icon { font-size: 16px; }
    .arrow { margin-left: auto; font-size: 16px; color: #64748b; }
    .badge-count.red { margin-left: auto; background: #ef4444; color: white; font-size: 10px; font-weight: 900; padding: 2px 8px; border-radius: 10px; }

    /* PROGRESS BARS */
    .category-progress-list { display: flex; flex-direction: column; gap: 12px; }
    .cat-bar-header { display: flex; justify-content: space-between; font-size: 12px; color: #cbd5e1; margin-bottom: 4px; }
    .progress-track { background: #1e293b; height: 8px; border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 4px; }
    .progress-fill.purple { background: linear-gradient(90deg, #818cf8, #6366f1); }
    .progress-fill.blue { background: linear-gradient(90deg, #60a5fa, #3b82f6); }
    .progress-fill.green { background: linear-gradient(90deg, #34d399, #10b981); }
    .progress-fill.yellow { background: linear-gradient(90deg, #fbbf24, #f59e0b); }
    .progress-fill.pink { background: linear-gradient(90deg, #f472b6, #ec4899); }

    /* METRICS 6 GRID */
    .metrics-6-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
    .metric-mini-card { background: rgba(17, 24, 39, 0.85); border: 1px solid rgba(255,255,255,0.08); padding: 14px; border-radius: 14px; display: flex; align-items: center; gap: 12px; }
    .mini-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
    .mini-icon.blue { background: rgba(96, 165, 250, 0.15); color: #60a5fa; }
    .mini-icon.green { background: rgba(52, 211, 153, 0.15); color: #34d399; }
    .mini-icon.indigo { background: rgba(129, 140, 248, 0.15); color: #818cf8; }
    .mini-icon.yellow { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
    .mini-icon.purple { background: rgba(192, 132, 252, 0.15); color: #c084fc; }
    .mini-icon.gray { background: rgba(148, 163, 184, 0.15); color: #94a3b8; }
    .mini-lbl { font-size: 10.5px; color: #94a3b8; display: block; }
    .mini-val { font-size: 20px; font-weight: 900; color: white; display: block; }
    .mini-trend { font-size: 9.5px; font-weight: 700; }

    /* TABLE */
    .table-responsive { overflow-x: auto; }
    .custom-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; }
    .custom-table th { padding: 12px; border-bottom: 1.5px solid #334155; color: #94a3b8; font-weight: 700; }
    .custom-table td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #cbd5e1; }
    .staff-user-cell { display: flex; align-items: center; gap: 10px; }
    .staff-avatar-circle { width: 32px; height: 32px; border-radius: 50%; background: #312e81; display: flex; align-items: center; justify-content: center; font-size: 14px; }
    .staff-id { font-size: 10px; color: #64748b; display: block; }
    .role-pill { background: #1e293b; color: #818cf8; padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 10.5px; }
    .status-pill.on-duty { color: #34d399; font-weight: 800; }
    .action-icon-btn { background: #1e293b; border: 1px solid #334155; color: white; padding: 4px 8px; border-radius: 6px; cursor: pointer; }

    /* WORKFLOW PIPELINE */
    .workflow-stage-pipeline { display: flex; align-items: center; gap: 8px; overflow-x: auto; padding: 16px; background: rgba(17, 24, 39, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; backdrop-filter: blur(10px); }
    .pipeline-step { display: flex; align-items: center; gap: 10px; background: #1e293b; padding: 12px; border-radius: 12px; min-width: 140px; }
    .step-circle { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; }
    .step-circle.purple { background: rgba(129, 140, 248, 0.2); }
    .step-circle.blue { background: rgba(96, 165, 250, 0.2); }
    .step-circle.yellow { background: rgba(251, 191, 36, 0.2); }
    .step-circle.orange { background: rgba(251, 146, 60, 0.2); }
    .step-circle.green { background: rgba(52, 211, 153, 0.2); }
    .step-circle.red { background: rgba(248, 113, 113, 0.2); }
    .step-info { display: flex; flex-direction: column; }
    .step-num { font-size: 10px; color: #94a3b8; font-weight: 700; }
    .step-count { font-size: 16px; font-weight: 900; color: white; }
    .step-sub { font-size: 9px; color: #64748b; }
    .pipeline-arrow { color: #475569; font-size: 14px; font-weight: 900; }

    /* COMPLAINTS FEED */
    .complaint-feed-list { display: flex; flex-direction: column; gap: 10px; }
    .feed-item-card { background: #1e293b; border: 1px solid #334155; padding: 14px; border-radius: 12px; }
    .feed-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .ticket-tag { background: #312e81; color: #a5b4fc; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; margin-right: 8px; }
    .ticket-title { font-size: 13.5px; color: white; }
    .status-badge { font-size: 10px; font-weight: 900; padding: 3px 8px; border-radius: 6px; }
    .status-badge.open { background: #7f1d1d; color: #fca5a5; }
    .status-badge.in_progress { background: #581c87; color: #c084fc; }
    .status-badge.resolved { background: #14532d; color: #4ade80; }
    .status-badge.pending { background: #713f12; color: #fde047; }
    .feed-desc { font-size: 11.5px; color: #cbd5e1; margin: 4px 0 8px 0; }
    .feed-footer { display: flex; justify-content: space-between; font-size: 10.5px; color: #94a3b8; border-top: 1px solid #334155; padding-top: 6px; }

    .form-input { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #334155; background: #1e293b; color: white; font-size: 12px; box-sizing: border-box; }
    .btn { padding: 10px 16px; border-radius: 8px; border: none; font-weight: 700; cursor: pointer; width: 100%; }
    .btn-primary { background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%); color: white; }
    .btn-delete-user { background: #ef4444; color: white; }

    @media (max-width: 900px) {
      .sidebar { display: none; }
      .grid-2-col { grid-template-columns: 1fr; }
      .kpi-chips-row { flex-wrap: wrap; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  user: User | null = null;
  activeTab: string = 'dashboard';
  isDarkMode = true;
  period = 'week';
  currentDateStr = '24 May 2025  10:09 AM';
  searchQuery = '';

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

  bulkBatchName = 'Batch 2025-2029';
  excelParsedStudents: any[] = [];
  importingBatch = false;
  batchImportSuccess = '';
  batchImportError = '';

  newTaskTitle = '';
  newTaskDesc = '';

  constructor(
    private authService: AuthService,
    private complaintService: ComplaintService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    this.currentDateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredComplaints = [...this.allComplaints];
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredComplaints = this.allComplaints.filter(c => 
        (c.title && c.title.toLowerCase().includes(q)) || 
        (c.description && c.description.toLowerCase().includes(q))
      );
    }
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
        this.filteredComplaints = [...res];
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error complaints:', err)
    });
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

  createTaskSubmit(): void {
    if (!this.newTaskTitle) {
      alert('Please enter a task title.');
      return;
    }
    this.complaintService.createStaffTask({
      title: this.newTaskTitle,
      description: this.newTaskDesc
    }).subscribe({
      next: (res: any) => {
        alert(`✅ ${res.message}`);
        this.newTaskTitle = '';
        this.newTaskDesc = '';
        this.loadStaffTasks();
      },
      error: (err: any) => alert(`❌ ${err.error?.message || 'Failed to create task.'}`)
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
