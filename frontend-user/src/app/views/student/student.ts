import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';
import { ComplaintService } from '../../services/complaint.service';
import { SocketService, LiveNotification } from '../../services/socket.service';
import { MessService } from '../../services/mess.service';
import { AttendanceService } from '../../services/attendance.service';
import { API_CONFIG } from '../../config/api.config';




@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <!-- Toast Alert for Live Notifications -->
      <div class="toast-alert" *ngIf="activeToast" (click)="clearToast()">
        <div class="toast-content">
          <span class="toast-bell">🔔</span>
          <div class="toast-text">
            <strong>Notification</strong>
            <p>{{ activeToast.message }}</p>
          </div>
          <span class="toast-close">✕</span>
        </div>
      </div>

      <!-- Photo Zoom Modal -->
      <div class="photo-modal" *ngIf="zoomPhotoUrl" (click)="closePhotoModal()">
        <div class="modal-wrapper" (click)="$event.stopPropagation()">
          <button class="close-modal" (click)="closePhotoModal()">&times;</button>
          <img [src]="zoomPhotoUrl" alt="Zoomed view" class="zoomed-image"/>
        </div>
      </div>

      <!-- Detailed Notice Modal -->
      <div class="notice-modal-overlay" *ngIf="selectedNotice" (click)="closeNoticeModal()">
        <div class="notice-modal-dialog animate-fade" (click)="$event.stopPropagation()">
          <div class="notice-modal-header">
            <span class="notice-modal-badge">📢 NOTICE</span>
            <button class="notice-modal-close" (click)="closeNoticeModal()">✕</button>
          </div>
          <h3 class="notice-modal-title">{{ selectedNotice.title }}</h3>
          <div class="notice-modal-meta">
            <span>👨‍💼 {{ selectedNotice.creator?.name || 'Warden' }}</span>
            <span>{{ selectedNotice.createdAt | date:'d MMM, h:mm a' }}</span>
          </div>
          <div class="notice-modal-body">{{ selectedNotice.content }}</div>
          
          <!-- Notice Photo Attachment -->
          <div *ngIf="selectedNotice.photoUrl" style="margin-top: 14px; margin-bottom: 14px; text-align: center;">
            <img 
              [src]="getImageUrl(selectedNotice.photoUrl)" 
              style="max-width: 100%; max-height: 220px; border-radius: 8px; object-fit: cover; box-shadow: var(--shadow-sm); cursor: pointer;"
              alt="Notice Attachment"
              (click)="openPhotoModal(getImageUrl(selectedNotice.photoUrl))"
            />
          </div>

          <button class="btn btn-primary" style="width:100%;margin-top:4px" (click)="closeNoticeModal()">Close</button>
        </div>
      </div>

      <!-- FUTURISTIC SIDEBAR GLASS DRAWER OVERLAY -->
      <div class="sidebar-backdrop" *ngIf="isSidebarOpen" (click)="closeSidebar()">
        <div class="sidebar-drawer" (click)="$event.stopPropagation()">
          <div class="sidebar-header">
            <div class="sidebar-user-info">
              <div class="sidebar-avatar-ring">
                <span class="avatar" *ngIf="!user?.profilePicUrl" style="font-size: 24px;">🎓</span>
                <img *ngIf="user?.profilePicUrl" [src]="getImageUrl(user.profilePicUrl)" (error)="onAvatarError($event)" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />
              </div>
              <div>
                <h4 class="sidebar-user-name">{{ user?.name }}</h4>
                <span class="sidebar-user-role">🎓 Student · Room {{ user?.roomNumber }}</span>
                <span class="sidebar-user-block">🏢 {{ user?.hostelBlock || 'Hostel' }}</span>
              </div>
            </div>
            <button type="button" class="sidebar-close-btn" (click)="closeSidebar()">✕</button>
          </div>

          <!-- Navigation Links List -->
          <div class="sidebar-nav-menu">
            <button type="button" class="sidebar-nav-item" [class.active]="activeTab === 'home'" (click)="switchTab('home'); closeSidebar()">
              <span class="sidebar-nav-icon">🏠</span>
              <span>Home Dashboard</span>
            </button>

            <button type="button" class="sidebar-nav-item" [class.active]="activeTab === 'notices'" (click)="switchTab('notices'); closeSidebar()">
              <span class="sidebar-nav-icon">📢</span>
              <span>Official Notices</span>
              <span class="sidebar-badge" *ngIf="getUnreadNoticesCount() > 0">{{ getUnreadNoticesCount() }}</span>
            </button>

            <button type="button" class="sidebar-nav-item" [class.active]="activeTab === 'raise'" (click)="switchTab('raise'); closeSidebar()">
              <span class="sidebar-nav-icon">🚀</span>
              <span>Raise Complaint</span>
            </button>

            <button type="button" class="sidebar-nav-item" [class.active]="activeTab === 'mess'" (click)="switchTab('mess'); closeSidebar()">
              <span class="sidebar-nav-icon">🍴</span>
              <span>Mess Food Reviews</span>
            </button>

            <button type="button" class="sidebar-nav-item" [class.active]="activeTab === 'my-complaints'" (click)="switchTab('my-complaints'); closeSidebar()">
              <span class="sidebar-nav-icon">📋</span>
              <span>My Tickets Tracker</span>
              <span class="sidebar-badge" *ngIf="getActiveTicketsCount() > 0">{{ getActiveTicketsCount() }}</span>
            </button>

            <button type="button" class="sidebar-nav-item" [class.active]="activeTab === 'profile'" (click)="switchTab('profile'); closeSidebar()">
              <span class="sidebar-nav-icon">🔔</span>
              <span>Notifications & Alerts</span>
              <span class="sidebar-badge" *ngIf="getUnreadNotificationsCount() > 0">{{ getUnreadNotificationsCount() }}</span>
            </button>

            <button type="button" class="sidebar-nav-item" [class.active]="activeTab === 'my-profile'" (click)="switchTab('my-profile'); closeSidebar()">
              <span class="sidebar-nav-icon">👤</span>
              <span>Account Profile</span>
            </button>
          </div>

          <!-- Sidebar Footer Logout Button -->
          <div class="sidebar-footer-box">
            <button type="button" class="sidebar-logout-btn" (click)="logout()">
              <span>🚪 Logout Account</span>
            </button>
          </div>
        </div>
      </div>

      <!-- CYBER COMMAND TOP HEADER BAR -->
      <div class="cyber-top-bar" *ngIf="activeTab !== 'chat'">
        <!-- Left: Hamburger Button -->
        <button type="button" class="hamburger-btn" (click)="toggleSidebar()" title="Open Navigation Menu">
          <span>☰</span>
        </button>

        <!-- Center/Left: User Profile & Online Indicator -->
        <div (click)="switchTab('my-profile')" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
          <div style="position: relative; width: 44px; height: 44px;">
            <div style="width: 100%; height: 100%; border-radius: 50%; border: 2px solid #2563eb; padding: 2px; display: flex; align-items: center; justify-content: center;">
              <span class="avatar" *ngIf="!user?.profilePicUrl" style="font-size: 20px;">🎓</span>
              <img *ngIf="user?.profilePicUrl" [src]="getImageUrl(user.profilePicUrl)" (error)="onAvatarError($event)" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />
            </div>
            <div class="online-pulse-dot"></div>
          </div>
          <div>
            <h4 style="margin: 0; font-size: 15px; font-weight: 800; color: var(--text-primary);">{{ user?.name }}</h4>
            <p style="margin: 2px 0 0 0; font-size: 11px; font-weight: 700; color: #2563eb;">
              🏢 {{ user?.hostelBlock }} · Room {{ user?.roomNumber }}
            </p>
          </div>
        </div>

        <!-- Right: Tickets Pill & Theme Toggle -->
        <div style="display: flex; align-items: center; gap: 8px;">
          <button (click)="switchTab('my-complaints')" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 14px rgba(37,99,235,0.3); cursor: pointer;">
            <span style="background: rgba(255,255,255,0.25); color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900;">
              {{ getActiveTicketsCount() }}
            </span>
            <span>TICKETS</span>
          </button>
          <button class="theme-toggle-btn" (click)="toggleDarkMode()" style="width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid var(--border-color); background: var(--bg-card); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px;">
            {{ isDarkMode ? '☀️' : '🌙' }}
          </button>
        </div>
      </div>

      <!-- MAIN TABS CONTAINER -->
      <div class="tab-content-area">

        <!-- TAB 0: HOME / COMMAND CENTER -->
        <div *ngIf="activeTab === 'home'" class="tab-panel animate-fade">
          
          <!-- 1. Sleek Compact Glass Greeting Banner -->
          <div style="background: linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(56,189,248,0.12) 100%); border-radius: 20px; padding: 16px 20px; border: 1.5px solid rgba(37,99,235,0.2); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 8px 24px rgba(37,99,235,0.06);">
            <div>
              <span style="font-size: 11px; font-weight: 800; color: #2563eb; letter-spacing: 0.6px; text-transform: uppercase; display: block; margin-bottom: 2px;">⚡ STUDENT COMMAND CENTER</span>
              <h4 style="margin: 0; font-size: 18px; font-weight: 900; color: var(--text-primary);">Hello, {{ user?.name }}! 👋</h4>
            </div>
            <div style="display: flex; gap: 8px;">
              <span style="background: #eff6ff; color: #2563eb; border: 1px solid rgba(37,99,235,0.2); padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 800;">
                🎓 {{ user?.batch || 'Batch 2025' }}
              </span>
            </div>
          </div>

          <!-- 2. World-Class 3D Quick Action Grid Launchpad -->
          <div style="margin-top: 10px; margin-bottom: 28px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <h4 style="margin: 0; font-size: 17px; font-weight: 900; color: var(--text-primary);">🚀 Quick Launchpad</h4>
              <span style="font-size: 11.5px; font-weight: 800; color: #2563eb;">1-Tap Access</span>
            </div>

            <div class="action-grid-3d">
              <!-- Action 1: Raise Complaint -->
              <div class="action-tile-3d tile-blue" (click)="switchTab('raise')">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div class="action-badge-floating" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white;">🚀</div>
                  <span style="font-size: 10.5px; font-weight: 800; color: #2563eb; background: rgba(37,99,235,0.12); padding: 3px 8px; border-radius: 10px;">URGENT</span>
                </div>
                <div>
                  <div class="action-card-title">Raise Issue</div>
                  <div class="action-card-sub" style="color: #475569;">Submit ticket to staff</div>
                </div>
              </div>

              <!-- Action 2: Mess Review -->
              <div class="action-tile-3d tile-green" (click)="switchTab('mess')">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div class="action-badge-floating" style="background: linear-gradient(135deg, #10b981, #059669); color: white;">⭐</div>
                  <span style="font-size: 10.5px; font-weight: 800; color: #059669; background: rgba(16,185,129,0.12); padding: 3px 8px; border-radius: 10px;">DAILY</span>
                </div>
                <div>
                  <div class="action-card-title">Mess Review</div>
                  <div class="action-card-sub" style="color: #047857;">Rate meal & upload photo</div>
                </div>
              </div>

              <!-- Action 3: Notices & Broadcasts -->
              <div class="action-tile-3d tile-purple" (click)="switchTab('notices')">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div class="action-badge-floating" style="background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: white;">📢</div>
                  <span style="font-size: 10.5px; font-weight: 800; color: #6d28d9; background: rgba(139,92,246,0.12); padding: 3px 8px; border-radius: 10px;">{{ announcements.length }} NEW</span>
                </div>
                <div>
                  <div class="action-card-title">Hostel Notices</div>
                  <div class="action-card-sub" style="color: #5b21b6;">Warden official broadcasts</div>
                </div>
              </div>

              <!-- Action 4: My Tickets -->
              <div class="action-tile-3d tile-amber" (click)="switchTab('my-complaints')">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div class="action-badge-floating" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white;">📋</div>
                  <span style="font-size: 10.5px; font-weight: 800; color: #b45309; background: rgba(245,158,11,0.15); padding: 3px 8px; border-radius: 10px;">{{ getActiveTicketsCount() }} ACTIVE</span>
                </div>
                <div>
                  <div class="action-card-title">My Tickets</div>
                  <div class="action-card-sub" style="color: #78350f;">Track live repair progress</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 1.5 World-Class Auto-Scrolling Official Notice Reel Stream -->
          <div class="section-header" style="margin-top: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
              <div>
                <h4 style="margin: 0; font-size: 17px; font-weight: 900; color: var(--text-primary);">📢 Official Notice Reel</h4>
                <p class="section-subtitle" style="margin: 2px 0 0 0; color: var(--text-muted);">Live announcements from Hostel Administration</p>
              </div>
              <button (click)="switchTab('notices')" style="background: rgba(37, 99, 235, 0.1); color: #2563eb; font-size: 11.5px; font-weight: 800; padding: 6px 14px; border-radius: 14px; border: 1px solid rgba(37, 99, 235, 0.25); cursor: pointer;">
                View All ({{ announcements.length }}) →
              </button>
            </div>
          </div>

          <div *ngIf="isLoadingAnnouncements" class="skeleton-list">
            <div class="skeleton skeleton-card"></div>
          </div>

          <!-- Side-by-Side Notice Reel Track (Clean Touch Swipe - No Auto Animation) -->
          <div *ngIf="!isLoadingAnnouncements && announcements.length > 0" class="notice-reel-wrapper">
            <div class="notice-reel-track">
              <div *ngFor="let notice of announcements" class="notice-reel-card" (click)="openNoticeModal(notice)">
                <div>
                  <div class="notice-card-header">
                    <span class="notice-tag">
                      {{ notice.hostelBlock === 'All' ? '🌐 ALL HOSTELS' : '🏠 BLOCK ' + notice.hostelBlock }}
                    </span>
                    <span class="notice-date">📅 {{ notice.createdAt | date:'d MMM' }}</span>
                  </div>
                  <h5 class="notice-title">{{ notice.title }}</h5>
                  <p class="notice-preview">{{ notice.content }}</p>
                  <div *ngIf="notice.photoUrl" class="notice-photo-box">
                    <img [src]="getImageUrl(notice.photoUrl)" alt="Notice Attachment" />
                  </div>
                </div>

                <div class="notice-card-footer">
                  <span>By: <strong>{{ notice.creator?.name || 'Warden' }}</strong></span>
                  <span class="read-more">Read Notice 🔍</span>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="!isLoadingAnnouncements && announcements.length === 0" class="empty-state" style="padding: 20px; text-align: center;">
            <span style="font-size: 28px;">📢</span>
            <p style="font-size: 13px; color: var(--text-muted); margin-top: 6px;">No active hostel notices posted yet.</p>
          </div>

          <!-- 2. Dynamic Auto-Adjusting Hostel Wardens Section -->
          <div class="section-header" style="margin-top: 32px;">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
              <div>
                <h4 style="margin: 0; font-size: 17px; font-weight: 900; color: var(--text-primary);">👨‍💼 Your Hostel Wardens</h4>
                <p class="section-subtitle" style="margin: 2px 0 0 0; color: var(--text-muted);">Reach out to wardens assigned to your block for support and approvals.</p>
              </div>
              <span *ngIf="wardens.length > 0" style="background: rgba(37,99,235,0.1); color: #2563eb; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 12px;">
                {{ wardens.length }} {{ wardens.length === 1 ? 'Warden Active' : 'Wardens Active' }}
              </span>
            </div>
          </div>

          <div *ngIf="isLoadingWardens" class="skeleton-list">
            <div class="skeleton skeleton-card"></div>
          </div>

          <!-- Dynamic Responsive Grid (Auto-adjusts for 1 or multiple wardens) -->
          <div *ngIf="!isLoadingWardens && wardens.length > 0" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 14px;">
            <div *ngFor="let warden of wardens" class="warden-glass-card">
              
              <div>
                <!-- Top Row: Avatar & Details -->
                <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px;">
                  <div style="position: relative; width: 62px; height: 62px; flex-shrink: 0;">
                    <div style="width: 100%; height: 100%; border-radius: 20px; border: 2px solid #2563eb; padding: 2px; background: var(--bg-card); overflow: hidden; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(37,99,235,0.2);">
                      <span *ngIf="!warden.profilePicUrl" style="font-size: 28px;">👨‍💼</span>
                      <img *ngIf="warden.profilePicUrl" [src]="getImageUrl(warden.profilePicUrl)" style="width: 100%; height: 100%; object-fit: cover; border-radius: 16px;" alt="Warden Photo" />
                    </div>
                  </div>
                  <div>
                    <h5 style="margin: 0 0 4px 0; font-family: var(--font-display); font-size: 17px; font-weight: 900; color: var(--text-primary);">
                      {{ warden.name }}
                    </h5>
                    <span style="background: #2563eb; color: white; font-size: 10.5px; font-weight: 800; padding: 3px 10px; border-radius: 10px; display: inline-block;">
                      🏢 Block {{ warden.hostelBlock || 'All' }} Warden
                    </span>
                  </div>
                </div>

                <!-- Bio -->
                <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; margin: 0 0 16px 0;">
                  {{ warden.bio || 'Available for hostel administration, mess regulations, and student support.' }}
                </p>
              </div>

              <!-- Quick Action Contact Buttons (1-Tap Call & Email) -->
              <div style="display: flex; gap: 10px; margin-top: 12px; padding-top: 14px; border-top: 1px solid rgba(37, 99, 235, 0.15);">
                <a *ngIf="warden.phone" [href]="'tel:' + warden.phone" class="contact-btn-warden" style="flex: 1; padding: 9px 12px; border-radius: 14px; font-size: 12px; font-weight: 800; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px;">
                  <span>📞 Call</span>
                </a>
                <a *ngIf="warden.email" [href]="'mailto:' + warden.email" class="contact-btn-warden" style="flex: 1; padding: 9px 12px; border-radius: 14px; font-size: 12px; font-weight: 800; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px;">
                  <span>✉️ Email</span>
                </a>
              </div>

            </div>
          </div>

          <div *ngIf="!isLoadingWardens && wardens.length === 0" class="empty-state" style="padding: 20px; text-align: center;">
            <span style="font-size: 28px;">👥</span>
            <p style="font-size: 13px; color: var(--text-muted); margin-top: 6px;">No wardens registered in the system yet.</p>
          </div>

          <!-- 3. Dynamic Solo Developer & Architect Section -->
          <div class="section-header" style="margin-top: 32px;">
            <h4>👨‍💻 Creator & Solo Developer</h4>
            <p class="section-subtitle">The architect and engineer behind the complete design, system backend, and native mobile apps of HostelHub.</p>
          </div>

          <div *ngIf="isLoadingPublicSettings" class="skeleton-list">
            <div class="skeleton skeleton-card"></div>
          </div>

          <div *ngIf="!isLoadingPublicSettings" style="margin-top: 14px;">
            <div class="solo-dev-card">
              
              <!-- Avatar Circle with Glowing Border -->
              <div style="position: relative; width: 90px; height: 90px; margin: 0 auto 16px auto;">
                <div style="width: 100%; height: 100%; border-radius: 50%; border: 3px solid #2563eb; padding: 3px; background: var(--bg-card); box-shadow: 0 0 20px rgba(37, 99, 235, 0.3);">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" alt="Abhinav Kumar" />
                </div>
                <span class="online-pulse-dot" style="width: 14px; height: 14px; border-width: 2.5px; bottom: 2px; right: 2px;"></span>
              </div>

              <!-- Role Tag -->
              <div style="display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; font-size: 11px; font-weight: 900; padding: 5px 14px; border-radius: 20px; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); margin-bottom: 12px;">
                🚀 CREATOR & LEAD FULL-STACK DEVELOPER
              </div>

              <!-- Name & Description -->
              <h4 style="font-family: var(--font-display); font-size: 22px; font-weight: 900; color: var(--text-primary); margin: 0 0 6px 0;">
                Abhinav Kumar
              </h4>
              <p style="font-size: 13px; font-weight: 600; color: var(--text-secondary); max-width: 480px; margin: 0 auto 20px auto; line-height: 1.5;">
                Sole Architect & Lead Developer of HostelHub. Expert in Full-Stack Engineering, Angular, Node.js, Express, Sequelize, & Capacitor Native Apps.
              </p>

              <!-- Social Links Row -->
              <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
                <a href="https://github.com/abhinav8102-asd" target="_blank" rel="noopener" class="social-icon-btn-dev" title="GitHub Profile">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener" class="social-icon-btn-dev" title="LinkedIn Profile">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener" class="social-icon-btn-dev" title="Instagram Profile">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener" class="social-icon-btn-dev" title="Twitter Profile">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                </a>
                <a href="mailto:abhinav@hostelhub.com" target="_blank" rel="noopener" class="social-icon-btn-dev" title="Email">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </a>
              </div>
            </div>
          </div>

          <!-- 4. System Overview & Workflow Pipeline Card (Exact Match to User Screenshot) -->
          <div class="overview-glass-card" style="margin-top: 32px;">
            
            <!-- Top Section: What is HostelHub? -->
            <div style="margin-bottom: 24px;">
              <span style="background: rgba(37, 99, 235, 0.12); color: #2563eb; font-size: 10.5px; font-weight: 800; padding: 4px 12px; border-radius: 12px; letter-spacing: 0.5px; text-transform: uppercase;">
                ⚡ SYSTEM OVERVIEW
              </span>
              <h3 style="font-family: var(--font-display); font-size: 20px; font-weight: 900; color: var(--text-primary); margin: 10px 0 8px 0;">
                What is HostelHub?
              </h3>
              <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0 0 16px 0;">
                {{ publicSettings.app_about || 'HostelHub is an all-in-one digital platform designed to streamline hostel management. It allows students to raise maintenance tickets instantly, monitors staff assignments, skips mess meals, tracks attendance, and updates students with official announcements.' }}
              </p>
              
              <!-- Feature Pills Row -->
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                <span class="overview-feature-pill">
                  ⚡ Instant Ticket Dispatch
                </span>
                <span class="overview-feature-pill">
                  🍽️ Daily Mess Rating
                </span>
                <span class="overview-feature-pill">
                  📢 Official Warden Feed
                </span>
              </div>
            </div>

            <div style="height: 1px; background: var(--border-color); margin: 20px 0; opacity: 0.6;"></div>

            <!-- Bottom Section: How It Works -->
            <div>
              <span style="background: rgba(16, 185, 129, 0.12); color: #059669; font-size: 10.5px; font-weight: 800; padding: 4px 12px; border-radius: 12px; letter-spacing: 0.5px; text-transform: uppercase;">
                🔄 WORKFLOW PIPELINE
              </span>
              <h3 style="font-family: var(--font-display); font-size: 20px; font-weight: 900; color: var(--text-primary); margin: 10px 0 16px 0;">
                How It Works
              </h3>

              <!-- 4 Step Pill Cards -->
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <div class="overview-step-pill">
                  <span style="background: rgba(37,99,235,0.12); color: #2563eb; font-size: 12.5px; font-weight: 900; width: 34px; height: 34px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">01</span>
                  <p style="margin: 0; font-size: 12.5px; font-weight: 700; color: var(--text-primary); line-height: 1.4;">
                    1. Raise a Ticket: Submit electrical, plumbing, carpentry, or cleaning issues with photos.
                  </p>
                </div>

                <div class="overview-step-pill">
                  <span style="background: rgba(37,99,235,0.12); color: #2563eb; font-size: 12.5px; font-weight: 900; width: 34px; height: 34px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">02</span>
                  <p style="margin: 0; font-size: 12.5px; font-weight: 700; color: var(--text-primary); line-height: 1.4;">
                    2. Automated Routing: Wardens assign staff based on category.
                  </p>
                </div>

                <div class="overview-step-pill">
                  <span style="background: rgba(37,99,235,0.12); color: #2563eb; font-size: 12.5px; font-weight: 900; width: 34px; height: 34px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">03</span>
                  <p style="margin: 0; font-size: 12.5px; font-weight: 700; color: var(--text-primary); line-height: 1.4;">
                    3. Track Resolution: View status changes and review work completion proof.
                  </p>
                </div>

                <div class="overview-step-pill">
                  <span style="background: rgba(37,99,235,0.12); color: #2563eb; font-size: 12.5px; font-weight: 900; width: 34px; height: 34px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">04</span>
                  <p style="margin: 0; font-size: 12.5px; font-weight: 700; color: var(--text-primary); line-height: 1.4;">
                    4. Connect: Join batch group chats and stay updated.
                  </p>
                </div>
              </div>
            </div>

          </div>

          <!-- 5. Sleek Redesigned Royal Blue Footer Card (Dark & Light Mode Ready) -->
          <footer class="app-footer-card animate-fade">
            <h6 style="margin: 0 0 6px 0; font-family: var(--font-display); font-size: 13.5px; font-weight: 900; color: var(--text-primary);">
              {{ footerSettings?.footer_text || 'HostelHub — Hostel Maintenance & Support Portal' }}
            </h6>
            <div style="display: flex; justify-content: center; align-items: center; gap: 12px; font-size: 11.5px; font-weight: 700; color: var(--text-secondary); flex-wrap: wrap;">
              <span>📧 {{ footerSettings?.footer_email || 'support@hostelhub.com' }}</span>
              <span>·</span>
              <span>📞 {{ footerSettings?.footer_phone || '+91 98765 43210' }}</span>
            </div>
            <div style="margin-top: 8px; font-size: 11px; font-weight: 600; color: var(--text-muted);">
              Developed by <strong>HostelHub Engineering Team 💻</strong> · {{ footerSettings?.footer_copyright || '© 2026 HostelHub Inc. All rights reserved.' }}
            </div>
          </footer>

        </div>


        <!-- TAB 1: RAISE COMPLAINT -->
        <div *ngIf="activeTab === 'raise'" class="tab-panel animate-fade">
          <h4 class="page-title">📝 Raise a New Ticket</h4>
          <div class="form-container">
            <form (ngSubmit)="onRaiseSubmit()" #raiseForm="ngForm">
              <div *ngIf="raiseError" class="alert alert-danger">{{ raiseError }}</div>
              <div *ngIf="raiseSuccess" class="alert alert-success">{{ raiseSuccess }}</div>

              <div class="form-group">
                <label class="form-label" for="title">Complaint Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  class="form-input"
                  placeholder="e.g. Fan Regulator not working"
                  [(ngModel)]="newComplaint.title"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Category</label>
                <div class="category-grid">
                  <div class="category-card" [class.selected]="newComplaint.category === 'electrical'" (click)="selectCategory('electrical')">
                    <span class="cat-icon">⚡</span>
                    <span class="cat-name">Electrical</span>
                  </div>
                  <div class="category-card" [class.selected]="newComplaint.category === 'plumbing'" (click)="selectCategory('plumbing')">
                    <span class="cat-icon">🚰</span>
                    <span class="cat-name">Plumbing</span>
                  </div>
                  <div class="category-card" [class.selected]="newComplaint.category === 'carpentry'" (click)="selectCategory('carpentry')">
                    <span class="cat-icon">🪚</span>
                    <span class="cat-name">Carpentry</span>
                  </div>
                  <div class="category-card" [class.selected]="newComplaint.category === 'cleaning'" (click)="selectCategory('cleaning')">
                    <span class="cat-icon">🧹</span>
                    <span class="cat-name">Cleaning</span>
                  </div>
                  <div class="category-card" [class.selected]="newComplaint.category === 'wifi'" (click)="selectCategory('wifi')">
                    <span class="cat-icon">📶</span>
                    <span class="cat-name">Internet</span>
                  </div>
                  <div class="category-card" [class.selected]="newComplaint.category === 'others'" (click)="selectCategory('others')">
                    <span class="cat-icon">⚙️</span>
                    <span class="cat-name">Others</span>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="description">Detailed Description</label>
                <textarea
                  id="description"
                  name="description"
                  class="form-input"
                  rows="4"
                  placeholder="Tell us exactly what the issue is and where..."
                  [(ngModel)]="newComplaint.description"
                  required
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Priority Level</label>
                <div class="priority-selector">
                  <div class="priority-option" [class.selected]="newComplaint.priority === 'low'" (click)="newComplaint.priority = 'low'">
                    <span>🟢</span><span>Low</span>
                  </div>
                  <div class="priority-option" [class.selected]="newComplaint.priority === 'medium'" (click)="newComplaint.priority = 'medium'">
                    <span>🟡</span><span>Medium</span>
                  </div>
                  <div class="priority-option" [class.selected]="newComplaint.priority === 'high'" (click)="newComplaint.priority = 'high'">
                    <span>🟠</span><span>High</span>
                  </div>
                  <div class="priority-option" [class.selected]="newComplaint.priority === 'urgent'" (click)="newComplaint.priority = 'urgent'">
                    <span>🔴</span><span>Urgent</span>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Upload Photo (Optional)</label>

                <div class="upload-area" *ngIf="!imagePreviewUrl">
                  <input type="file" (change)="onFileChange($event)" accept="image/*" class="file-input" id="photoFile"/>
                  <label for="photoFile" class="file-input-label" (click)="selectPhoto('complaint'); $event.preventDefault()">
                    <span class="upload-icon">📸</span>
                    <span class="upload-text">Select Image File</span>
                    <span class="upload-subtext">JPEG, PNG up to 5MB</span>
                  </label>
                </div>

                <div class="preview-area animate-fade" *ngIf="imagePreviewUrl">
                  <img [src]="imagePreviewUrl" alt="File preview" class="preview-thumbnail"/>
                  <div class="preview-info">
                    <span class="preview-name">{{ selectedFile?.name }}</span>
                    <button type="button" class="btn-remove-file" (click)="removeSelectedFile()">Remove ❌</button>
                  </div>
                </div>
              </div>

              <button type="submit" class="btn btn-primary btn-submit" [disabled]="!raiseForm.form.valid || !newComplaint.category || raising || justSubmitted">
                <span *ngIf="raising">Submitting...</span>
                <span *ngIf="!raising && justSubmitted">Submitted ✓</span>
                <span *ngIf="!raising && !justSubmitted">Submit Ticket ⚡</span>
              </button>
            </form>
          </div>
        </div>

        <!-- TAB 2: MY COMPLAINTS -->
        <div *ngIf="activeTab === 'my-complaints'" class="tab-panel animate-fade">

          <!-- Quick Actions Row -->
          <div class="my-tickets-header">
            <h4 class="page-title" style="margin-bottom:0">📋 My Tickets</h4>
            <button class="btn-raise-shortcut" (click)="activeTab = 'raise'">
              ➕ Raise New
            </button>
          </div>

          <!-- Filter Pills -->
          <div class="filter-pills">
            <button class="pill-btn" [class.active]="filterStatus === 'all'" (click)="filterStatus = 'all'">
              All ({{ complaints.length }})
            </button>
            <button class="pill-btn" [class.active]="filterStatus === 'pending'" (click)="filterStatus = 'pending'">
              Active ({{ getPendingCount() }})
            </button>
            <button class="pill-btn" [class.active]="filterStatus === 'resolved'" (click)="filterStatus = 'resolved'">
              Resolved ({{ getResolvedCount() }})
            </button>
          </div>

          <!-- Skeleton Loading -->
          <div *ngIf="isLoadingComplaints" class="skeleton-list">
            <div class="skeleton skeleton-card"></div>
            <div class="skeleton skeleton-card"></div>
            <div class="skeleton skeleton-card"></div>
          </div>

          <div *ngIf="!isLoadingComplaints">
            <div *ngIf="filteredComplaints.length > 0">
              <div class="card complaint-card" *ngFor="let comp of filteredComplaints" [class.expanded]="expandedComplaintId === comp.id">
                <div class="comp-summary" (click)="toggleExpand(comp.id)">
                  <div class="comp-header">
                    <span class="badge" [class]="'badge-' + comp.status">{{ comp.status | titlecase }}</span>
                    <span class="comp-date">{{ comp.createdAt | date:'short' }}</span>
                  </div>
                  <h4 class="comp-title">{{ comp.title }}</h4>
                  <div class="comp-category-tag">
                    <span class="cat-tag-icon">{{ getCategoryIcon(comp.category) }}</span>
                    <span>{{ comp.category | titlecase }}</span>
                  </div>
                  <p class="comp-desc-short" *ngIf="expandedComplaintId !== comp.id">
                    {{ comp.description | slice:0:80 }}{{ comp.description.length > 80 ? '...' : '' }}
                  </p>
                  <div class="tap-hint" *ngIf="expandedComplaintId !== comp.id">Tap to view details 👇</div>
                </div>

                <!-- Expanded Details -->
                <div class="comp-details animate-fade" *ngIf="expandedComplaintId === comp.id">

                  <!-- Progress Timeline -->
                  <div class="timeline-container">
                    <div class="timeline-step completed">
                      <div class="step-marker">✓</div>
                      <div class="step-content">
                        <span class="step-title">Ticket Raised</span>
                        <span class="step-date">{{ comp.createdAt | date:'mediumDate' }}</span>
                      </div>
                    </div>
                    <div class="timeline-step" [class.completed]="comp.status !== 'pending'">
                      <div class="step-marker">{{ comp.status !== 'pending' ? '✓' : '2' }}</div>
                      <div class="step-content">
                        <span class="step-title">Staff Assignment</span>
                        <span class="step-desc" *ngIf="comp.staff">{{ comp.staff.name }} Assigned</span>
                        <span class="step-desc" *ngIf="!comp.staff">Awaiting Warden Assignment</span>
                      </div>
                    </div>
                    <div class="timeline-step" [class.completed]="comp.status === 'in_progress' || comp.status === 'resolved'">
                      <div class="step-marker">{{ (comp.status === 'in_progress' || comp.status === 'resolved') ? '✓' : '3' }}</div>
                      <div class="step-content">
                        <span class="step-title">Work In Progress</span>
                        <span class="step-desc" *ngIf="comp.status === 'in_progress' || comp.status === 'resolved'">Staff working on it</span>
                        <span class="step-desc" *ngIf="comp.status === 'pending' || comp.status === 'assigned'">Awaiting start</span>
                      </div>
                    </div>
                    <div class="timeline-step" [class.completed]="comp.status === 'resolved'">
                      <div class="step-marker">{{ comp.status === 'resolved' ? '✓' : '4' }}</div>
                      <div class="step-content">
                        <span class="step-title">Resolved</span>
                        <span class="step-desc" *ngIf="comp.status === 'resolved'">✅ Job Completed</span>
                        <span class="step-desc" *ngIf="comp.status !== 'resolved'">Awaiting Resolution</span>
                      </div>
                    </div>
                  </div>

                  <p class="comp-desc-full"><strong>Details:</strong><br/>{{ comp.description }}</p>

                  <!-- Attachment -->
                  <div class="attachment-view" *ngIf="comp.photoUrl">
                    <p class="section-label">📸 Original Attachment:</p>
                    <div class="image-container" (click)="openPhotoModal(getImageUrl(comp.photoUrl))">
                      <img [src]="getImageUrl(comp.photoUrl)" class="comp-img" alt="Attachment" (error)="onImgError($event)"/>
                      <div class="image-overlay">🔍 Tap to Zoom</div>
                    </div>
                  </div>

                  <!-- Assigned Staff -->
                  <div class="staff-assignment" *ngIf="comp.staff">
                    <div class="staff-header">🛠️ Assigned Service Staff</div>
                    <div class="staff-body">
                      <p class="staff-name">Name: <strong>{{ comp.staff.name }}</strong></p>
                      <div class="staff-contact">
                        <a [href]="'tel:' + comp.staff.phone" class="staff-call-btn">
                          📞 Call {{ comp.staff.phone }}
                        </a>
                      </div>
                    </div>
                  </div>

                  <!-- Completion Proof -->
                  <div class="completion-view" *ngIf="comp.completionPhotoUrl">
                    <div class="completion-header">✅ Resolution Work Proof</div>
                    <div class="image-container" (click)="openPhotoModal(getImageUrl(comp.completionPhotoUrl))">
                      <img [src]="getImageUrl(comp.completionPhotoUrl)" class="completion-img" alt="Work completion proof" (error)="onImgError($event)"/>
                      <div class="image-overlay">🔍 Tap to Zoom</div>
                    </div>
                  </div>

                  <!-- Feedback -->
                  <div class="feedback-section" *ngIf="comp.status === 'resolved'">
                    <div *ngIf="!comp.feedbackRating; else ratedState">
                      <p class="feedback-prompt">Rate this resolution:</p>
                      <div class="stars">
                        <span *ngFor="let star of [1,2,3,4,5]"
                              (click)="selectRating(comp.id, star)"
                              [class.active]="(tempRating[comp.id] || 0) >= star"
                              class="star">★</span>
                      </div>
                      <div class="feedback-comment-box animate-fade" *ngIf="tempRating[comp.id]">
                        <textarea
                          class="form-input feedback-textarea"
                          [(ngModel)]="tempComment[comp.id]"
                          placeholder="Add comments/suggestions (Optional)..."
                          rows="2">
                        </textarea>
                        <button class="btn btn-primary submit-feedback-btn" (click)="submitComplaintFeedback(comp.id)">
                          Submit Rating & Feedback
                        </button>
                      </div>
                    </div>
                    <ng-template #ratedState>
                      <div class="rated-display">
                        <p class="rated-stars">⭐ Rated: <strong>{{ comp.feedbackRating }}/5</strong></p>
                        <p class="rated-comment" *ngIf="comp.feedbackComment">
                          💬 <em>"{{ comp.feedbackComment }}"</em>
                        </p>
                      </div>
                    </ng-template>
                  </div>

                  <button class="btn btn-secondary btn-collapse" (click)="toggleExpand(null)">Collapse ↑</button>
                </div>
              </div>
            </div>

            <div *ngIf="filteredComplaints.length === 0" class="empty-state">
              <span class="empty-icon">📭</span>
              <p>No tickets matching this filter.</p>
            </div>
          </div>
        </div>

        <!-- TAB 3: ALERTS -->
        <div *ngIf="activeTab === 'profile'" class="tab-panel animate-fade">
          <div class="notif-header-row">
            <h4 class="page-title">🔔 Alerts</h4>
            <div class="notif-header-btns" *ngIf="notifications.length > 0">
              <button class="clear-notif-btn" (click)="clearAllNotifications()">
                Mark all read ✓
              </button>
              <button class="delete-all-notif-btn" (click)="deleteAllNotifications()">
                🗑️ Delete All
              </button>
            </div>
          </div>

          <div class="notifications-list" *ngIf="notifications.length > 0">
            <div class="card notif-card clickable-notice" [class.unread]="!notif.isRead" *ngFor="let notif of notifications" (click)="onNotificationClick(notif)">
              <div class="notif-meta">
                <span class="notif-badge-icon">{{ getNotifIcon(notif.type) }}</span>
                <span class="notif-time">{{ notif.createdAt | date:'shortTime' }}</span>
                <button class="notif-delete-btn" (click)="deleteNotification(notif.id, $event)" title="Delete notification">🗑️</button>
              </div>
              <p class="notif-msg">{{ notif.message }}</p>
              <div class="notice-tap-hint">Tap to view details 🔎</div>
            </div>
          </div>
          <div *ngIf="notifications.length === 0" class="empty-state">
            <span class="empty-icon">🔔</span>
            <p>No notifications yet.</p>
          </div>
        </div>

        <!-- TAB 4: EDIT PROFILE -->
        <div *ngIf="activeTab === 'my-profile'" class="tab-panel animate-fade">
          <!-- Header Banner Widget -->
          <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 16px;">
            <div style="width: 46px; height: 46px; border-radius: 50%; background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">👤</div>
            <div>
              <h4 style="margin: 0 0 2px 0; font-size: 17px; font-weight: 800; color: var(--text-primary);">Edit Profile</h4>
              <p style="margin: 0; font-size: 12px; color: var(--text-muted);">Update your profile information</p>
            </div>
          </div>

          <form (ngSubmit)="onProfileSubmit()" #profileForm="ngForm" style="display: flex; flex-direction: column; gap: 16px;">
            <div *ngIf="profileError" class="alert alert-danger">{{ profileError }}</div>
            <div *ngIf="profileSuccess" class="alert alert-success">{{ profileSuccess }}</div>

            <!-- Profile Photo Card Box -->
            <div class="card" style="padding: 24px; border-radius: 20px; border: 1px solid var(--border-color); background: var(--bg-card); display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; box-shadow: var(--shadow-sm);">
              <div style="position: relative; width: 104px; height: 104px; border-radius: 50%; border: 3px solid #2563eb; padding: 3px; background: var(--bg-card);">
                <div style="width: 100%; height: 100%; border-radius: 50%; overflow: hidden; background: #f1f5f9; display: flex; align-items: center; justify-content: center;">
                  <img *ngIf="profilePreviewUrl" [src]="profilePreviewUrl" (error)="profilePreviewUrl = null" style="width: 100%; height: 100%; object-fit: cover;" />
                  <span *ngIf="!profilePreviewUrl" style="font-size: 44px; color: #94a3b8;">🎓</span>
                </div>
                <!-- Camera Badge Icon -->
                <button type="button" (click)="selectPhoto('profile')" style="position: absolute; bottom: 2px; right: 2px; width: 30px; height: 30px; border-radius: 50%; background: #2563eb; color: white; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 13px; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
                  📷
                </button>
              </div>

              <div>
                <strong style="font-size: 14.5px; color: var(--text-primary); display: block; margin-bottom: 2px;">Profile Photo</strong>
                <span style="font-size: 11px; color: var(--text-muted);">JPG, PNG up to 5MB</span>
              </div>

              <input type="file" (change)="onProfilePicChange($event)" accept="image/*" class="file-input" id="profilePicFile" style="display: none;"/>
              <button type="button" (click)="selectPhoto('profile')" class="btn" style="width: 100%; max-width: 320px; height: 42px; background: #eff6ff; color: #2563eb; border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 12px; font-size: 13px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <span>📷</span> Change Photo
              </button>
            </div>

            <!-- Profile Info Form Fields Card -->
            <div class="card" style="padding: 20px; border-radius: 20px; border: 1px solid var(--border-color); background: var(--bg-card); display: flex; flex-direction: column; gap: 16px; box-shadow: var(--shadow-sm);">
              
              <!-- Full Name Field -->
              <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                  <span style="width: 32px; height: 32px; border-radius: 8px; background: #fdf2f4; color: #b31031; display: flex; align-items: center; justify-content: center; font-size: 15px;">👤</span>
                  <label class="form-label" style="margin: 0; font-size: 12.5px; font-weight: 700; color: var(--text-primary);">Full Name</label>
                </div>
                <input 
                  type="text" 
                  id="profileName" 
                  name="profileName" 
                  class="form-input" 
                  style="height: 42px; border-radius: 12px; font-size: 13px; background: var(--bg-muted); border: 1px solid var(--border-color); padding: 0 14px; width: 100%;"
                  [(ngModel)]="editUser.name" 
                  required
                />
              </div>

              <!-- Email Address Field -->
              <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                  <span style="width: 32px; height: 32px; border-radius: 8px; background: #fdf2f4; color: #b31031; display: flex; align-items: center; justify-content: center; font-size: 15px;">✉️</span>
                  <label class="form-label" style="margin: 0; font-size: 12.5px; font-weight: 700; color: var(--text-primary);">Email Address</label>
                </div>
                <input 
                  type="email" 
                  id="profileEmail" 
                  name="profileEmail" 
                  class="form-input" 
                  style="height: 42px; border-radius: 12px; font-size: 13px; background: var(--bg-muted); border: 1px solid var(--border-color); padding: 0 14px; width: 100%;"
                  [(ngModel)]="editUser.email" 
                  required
                />
              </div>

              <!-- Phone Number Field -->
              <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                  <span style="width: 32px; height: 32px; border-radius: 8px; background: #fdf2f4; color: #b31031; display: flex; align-items: center; justify-content: center; font-size: 15px;">📞</span>
                  <label class="form-label" style="margin: 0; font-size: 12.5px; font-weight: 700; color: var(--text-primary);">Phone Number</label>
                </div>
                <input 
                  type="text" 
                  id="profilePhone" 
                  name="profilePhone" 
                  class="form-input" 
                  style="height: 42px; border-radius: 12px; font-size: 13px; background: var(--bg-muted); border: 1px solid var(--border-color); padding: 0 14px; width: 100%;"
                  [(ngModel)]="editUser.phone" 
                  required
                />
              </div>

              <!-- Roll Number Field -->
              <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                  <span style="width: 32px; height: 32px; border-radius: 8px; background: #fdf2f4; color: #b31031; display: flex; align-items: center; justify-content: center; font-size: 15px;">💳</span>
                  <label class="form-label" style="margin: 0; font-size: 12.5px; font-weight: 700; color: var(--text-primary);">Roll Number</label>
                </div>
                <input 
                  type="text" 
                  id="profileRollNumber" 
                  name="profileRollNumber" 
                  class="form-input" 
                  style="height: 42px; border-radius: 12px; font-size: 13px; background: var(--bg-muted); border: 1px solid var(--border-color); padding: 0 14px; width: 100%;"
                  [(ngModel)]="editUser.rollNumber" 
                  required
                />
              </div>

              <!-- Hostel Block & Room Number Row -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                    <span style="font-size: 14px;">🏢</span>
                    <label class="form-label" style="margin: 0; font-size: 11.5px; font-weight: 700; color: var(--text-primary);">Hostel Block</label>
                  </div>
                  <select 
                    id="profileHostelBlock" 
                    name="profileHostelBlock" 
                    class="form-input" 
                    style="height: 42px; border-radius: 12px; font-size: 12px; background: var(--bg-muted); border: 1px solid var(--border-color); padding: 0 10px; width: 100%; color: var(--text-primary);"
                    [(ngModel)]="editUser.hostelBlock"
                    required
                  >
                    <option value="Boys Hostel 1">Boys Hostel 1</option>
                    <option value="Boys Hostel 2">Boys Hostel 2</option>
                    <option value="Girls Hostel 1">Girls Hostel 1</option>
                    <option value="Girls Hostel 2">Girls Hostel 2</option>
                  </select>
                </div>

                <div>
                  <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                    <span style="font-size: 14px;">🚪</span>
                    <label class="form-label" style="margin: 0; font-size: 11.5px; font-weight: 700; color: var(--text-primary);">Room No.</label>
                  </div>
                  <input 
                    type="text" 
                    id="profileRoomNumber" 
                    name="profileRoomNumber" 
                    class="form-input" 
                    style="height: 42px; border-radius: 12px; font-size: 12px; background: var(--bg-muted); border: 1px solid var(--border-color); padding: 0 10px; width: 100%;"
                    [(ngModel)]="editUser.roomNumber" 
                    required
                  />
                </div>
              </div>

              <!-- Critical Warning Box for Gender & Batch -->
              <div style="background: #fff7ed; border: 1px solid #fdba74; border-radius: 12px; padding: 12px; display: flex; align-items: flex-start; gap: 10px;">
                <span style="font-size: 18px; color: #ea580c; flex-shrink: 0;">⚠️</span>
                <span style="font-size: 11px; color: #9a3412; line-height: 1.45; font-weight: 600;">
                  <strong>Critical Fields:</strong> Changing Gender or Academic Batch will reset your account to 'PENDING APPROVAL' and require Warden re-approval.
                </span>
              </div>

              <!-- Gender & Academic Batch Row -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                    <span style="font-size: 14px;">👥</span>
                    <label class="form-label" style="margin: 0; font-size: 11.5px; font-weight: 700; color: var(--text-primary);">Gender</label>
                  </div>
                  <select 
                    id="profileGender" 
                    name="profileGender" 
                    class="form-input" 
                    style="height: 42px; border-radius: 12px; font-size: 12px; background: var(--bg-muted); border: 1px solid var(--border-color); padding: 0 10px; width: 100%; color: var(--text-primary);"
                    [(ngModel)]="editUser.gender"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                    <span style="font-size: 14px;">🎓</span>
                    <label class="form-label" style="margin: 0; font-size: 11.5px; font-weight: 700; color: var(--text-primary);">Batch</label>
                  </div>
                  <select 
                    id="profileBatch" 
                    name="profileBatch" 
                    class="form-input" 
                    style="height: 42px; border-radius: 12px; font-size: 12px; background: var(--bg-muted); border: 1px solid var(--border-color); padding: 0 10px; width: 100%; color: var(--text-primary);"
                    [(ngModel)]="editUser.batch"
                    required
                  >
                    <option value="Batch 2023-2027">Batch 2023-2027</option>
                    <option value="Batch 2024-2028">Batch 2024-2028</option>
                    <option value="Batch 2025-2029">Batch 2025-2029</option>
                    <option value="Batch 2026-2030">Batch 2026-2030</option>
                  </select>
                </div>
              </div>

              <!-- Bio Field -->
              <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                  <span style="width: 32px; height: 32px; border-radius: 8px; background: #fdf2f4; color: #b31031; display: flex; align-items: center; justify-content: center; font-size: 15px;">📄</span>
                  <label class="form-label" style="margin: 0; font-size: 12.5px; font-weight: 700; color: var(--text-primary);">Bio</label>
                </div>
                <div style="position: relative;">
                  <textarea 
                    id="profileBio" 
                    name="profileBio" 
                    class="form-input" 
                    rows="3" 
                    style="border-radius: 12px; font-size: 13px; background: var(--bg-muted); border: 1px solid var(--border-color); padding: 10px 14px; width: 100%; color: var(--text-primary);"
                    placeholder="Tell us about yourself..."
                    [(ngModel)]="editUser.bio"
                  ></textarea>
                  <span style="position: absolute; right: 12px; bottom: 8px; font-size: 10px; color: var(--text-muted);">{{ editUser.bio ? editUser.bio.length : 0 }}/150</span>
                </div>
              </div>
            </div>

            <!-- Save Changes Blue Button -->
            <button type="submit" class="btn" style="width: 100%; height: 46px; background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); color: white; border: none; border-radius: 14px; font-size: 14px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);" [disabled]="!profileForm.form.valid || updatingProfile">
              <span>💾</span> {{ updatingProfile ? 'Updating...' : 'Save Changes' }}
            </button>

            <!-- Bottom Need Help Box -->
            <div class="card" style="padding: 16px; border-radius: 16px; border: 1px solid var(--border-color); background: var(--bg-card); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
              <div>
                <strong style="font-size: 13px; color: #2563eb; display: block; margin-bottom: 2px;">Need Help?</strong>
                <span style="font-size: 11.5px; color: var(--text-muted);">We are here to assist you.</span>
              </div>

              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <a href="mailto:support@hostelhub.com" style="background: var(--bg-muted); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 11.5px; font-weight: 600; padding: 6px 12px; border-radius: 20px; text-decoration: none; display: flex; align-items: center; gap: 6px;">
                  <span>✉️</span> support@hostelhub.com
                </a>
                <a href="tel:+919876543210" style="background: var(--bg-muted); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 11.5px; font-weight: 600; padding: 6px 12px; border-radius: 20px; text-decoration: none; display: flex; align-items: center; gap: 6px;">
                  <span>📞</span> +91 98765 43210
                </a>
              </div>
            </div>
          </form>
        </div>


        <!-- TAB 5: MESS MANAGEMENT -->
        <div *ngIf="activeTab === 'mess'" class="tab-panel animate-fade">
          <h4 class="page-title">🍴 Mess Management</h4>

          <div *ngIf="messSuccess" class="alert alert-success">{{ messSuccess }}</div>
          <div *ngIf="messError" class="alert alert-danger">{{ messError }}</div>

          <div class="mess-container">
            <!-- Today's Menu Display -->
            <div class="card mess-card today-menu-card">
              <div class="menu-header">
                <h5>📅 Weekly Mess Menu</h5>
                <span class="day-badge">Today: {{ getDayOfWeekName() }}</span>
              </div>

              <div *ngIf="isLoadingMess" class="skeleton-list">
                <div class="skeleton skeleton-card"></div>
                <div class="skeleton skeleton-card"></div>
              </div>

              <div class="menu-list" *ngIf="!isLoadingMess">
                <div class="menu-day-row" *ngFor="let m of messMenu" [class.active-day]="m.dayOfWeek === getDayOfWeekName()">
                  <div class="day-name">
                    {{ m.dayOfWeek }}
                    <span class="today-marker" *ngIf="m.dayOfWeek === getDayOfWeekName()">TODAY</span>
                  </div>
                  <div class="day-meals">
                    <div class="meal-item">
                      <span class="meal-label">🍳 Breakfast:</span>
                      <span class="meal-text">{{ m.breakfast }}</span>
                    </div>
                    <div class="meal-item">
                      <span class="meal-label">🍛 Lunch:</span>
                      <span class="meal-text">{{ m.lunch }}</span>
                    </div>
                    <div class="meal-item">
                      <span class="meal-label">☕ Snacks:</span>
                      <span class="meal-text">{{ m.snacks || 'Samosa & Hot Chai' }}</span>
                    </div>
                    <div class="meal-item">
                      <span class="meal-label">🍽️ Dinner:</span>
                      <span class="meal-text">{{ m.dinner }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Real-time Feedback Submission -->
            <div class="card mess-card">
              <h5>⭐ Daily Meal Quality Feedback</h5>
              <p style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">
                How was the food today? Share your thoughts to help us improve quality.
              </p>

              <form (ngSubmit)="submitMessFeedback()" #messFeedbackForm="ngForm">
                <div class="form-group">
                  <label class="form-label">Select Meal</label>
                  <div class="custom-dropdown-container">
                    <button type="button" class="form-input custom-dropdown-trigger" (click)="toggleMessMealDropdown($event)">
                      <span class="selected-text">{{ getMessMealLabel() }}</span>
                      <span class="dropdown-arrow">▼</span>
                    </button>
                    
                    <div class="custom-dropdown-menu animate-fade" *ngIf="isMessMealDropdownOpen">
                      <div class="custom-dropdown-item" [class.selected]="selectedMessMeal === 'breakfast'" (click)="selectMessMeal('breakfast')">
                        Breakfast
                      </div>
                      <div class="custom-dropdown-item" [class.selected]="selectedMessMeal === 'lunch'" (click)="selectMessMeal('lunch')">
                        Lunch
                      </div>
                      <div class="custom-dropdown-item" [class.selected]="selectedMessMeal === 'snacks'" (click)="selectMessMeal('snacks')">
                        Snacks
                      </div>
                      <div class="custom-dropdown-item" [class.selected]="selectedMessMeal === 'dinner'" (click)="selectMessMeal('dinner')">
                        Dinner
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Rating</label>
                  <div class="stars" style="margin-bottom: 8px;">
                    <span *ngFor="let star of [1,2,3,4,5]"
                          (click)="tempMessRating = star"
                          [class.active]="tempMessRating >= star"
                          class="star">★</span>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="messComment">Comments (Optional)</label>
                  <textarea 
                    id="messComment" 
                    name="messComment" 
                    class="form-input" 
                    rows="2" 
                    placeholder="Provide your feedback here..." 
                    [(ngModel)]="tempMessComment">
                  </textarea>
                </div>

                <!-- Optional Mess Food Image Attachment -->
                <div class="form-group" style="margin-top: 12px;">
                  <label class="form-label" style="display: flex; justify-content: space-between; align-items: center;">
                    <span>📷 Food Photo (Optional)</span>
                    <span style="font-size: 10.5px; color: var(--text-muted);">Attach food photo</span>
                  </label>
                  
                  <input type="file" (change)="onMessPhotoSelected($event)" accept="image/*" class="file-input" id="messPhotoInput" style="display: none;" />

                  <!-- Dual Photo Source Buttons: Camera & Gallery -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                    <button type="button" (click)="selectMessPhoto('camera')" class="btn" style="background: rgba(37, 99, 235, 0.08); color: #2563eb; border: 1px dashed rgba(37, 99, 235, 0.3); padding: 9px; border-radius: 10px; font-size: 11.5px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 5px; cursor: pointer;">
                      <span>📷 Real-time Camera</span>
                    </button>
                    <button type="button" (click)="selectMessPhoto('gallery')" class="btn" style="background: var(--bg-muted); color: var(--text-primary); border: 1px dashed var(--border-color); padding: 9px; border-radius: 10px; font-size: 11.5px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 5px; cursor: pointer;">
                      <span>🖼️ Import Gallery</span>
                    </button>
                  </div>

                  <!-- Image Preview Box -->
                  <div *ngIf="messPhotoPreviewUrl" style="margin-top: 8px; position: relative; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); background: var(--bg-muted); padding: 8px; text-align: center;">
                    <img [src]="messPhotoPreviewUrl" style="max-width: 100%; max-height: 180px; border-radius: 8px; object-fit: cover;" alt="Mess food photo preview" />
                    <div style="margin-top: 6px; display: flex; align-items: center; justify-content: space-between; padding: 0 4px;">
                      <span style="font-size: 11px; color: #166534; font-weight: 700;">✓ Food photo attached</span>
                      <button type="button" (click)="clearMessPhoto()" style="background: none; border: none; color: #ef4444; font-size: 12px; font-weight: 700; cursor: pointer;">✕ Remove Photo</button>
                    </div>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary submit-feedback-btn">
                  Submit Feedback
                </button>
              </form>
            </div>

            <!-- 4. My Recent Mess Feedback History -->
            <div class="card mess-card" style="margin-top: 16px;">
              <h5 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 800; color: var(--text-primary);">💬 My Recent Feedback</h5>
              <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px;">Your submitted meal ratings & reviews</p>

              <div *ngIf="myMessFeedbacks.length > 0; else noMyFeedback" style="display: flex; flex-direction: column; gap: 10px;">
                <div *ngFor="let f of myMessFeedbacks" style="padding: 12px 14px; border-radius: 14px; background: var(--bg-muted); border: 1px solid var(--border-color);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-weight: 800; color: #f59e0b; font-size: 13px;">⭐ {{ f.rating }}/5</span>
                      <span style="background: rgba(37, 99, 235, 0.1); color: #2563eb; padding: 2px 8px; border-radius: 6px; font-size: 10.5px; font-weight: 800; text-transform: uppercase;">
                        {{ f.mealType }}
                      </span>
                    </div>
                    <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">
                      📅 {{ (f.createdAt || f.date) | date:'MMM d, h:mm a' }}
                    </span>
                  </div>

                  <p *ngIf="f.comment" style="font-style: italic; font-size: 13px; margin: 4px 0; color: var(--text-primary);">
                    "{{ f.comment }}"
                  </p>

                  <div *ngIf="f.photoUrl" style="margin-top: 8px;">
                    <img 
                      [src]="getImageUrl(f.photoUrl)" 
                      style="max-width: 100%; max-height: 180px; border-radius: 10px; object-fit: cover; border: 1px solid var(--border-color); cursor: pointer;" 
                      (click)="openPhotoModal(getImageUrl(f.photoUrl))" 
                      alt="Food photo" 
                    />
                  </div>
                </div>
              </div>

              <ng-template #noMyFeedback>
                <p style="font-size: 12px; color: var(--text-muted); text-align: center; margin: 8px 0;">You have not submitted any mess feedback yet.</p>
              </ng-template>
            </div>
          </div>
        </div>

        <!-- TAB NOTICES: OFFICIAL ANNOUNCEMENTS & BROADCASTS -->
        <div *ngIf="activeTab === 'notices'" class="tab-panel animate-fade">
          <h4 class="page-title">📢 Official Hostel Notices & Broadcasts</h4>
          <p class="section-subtitle" style="margin-bottom: 16px;">Stay updated with official maintenance, water supply, mess schedules, and hostel rules broadcasted by administration.</p>

          <div *ngIf="isLoadingAnnouncements" class="skeleton-list">
            <div class="skeleton skeleton-card"></div>
            <div class="skeleton skeleton-card"></div>
          </div>

          <div *ngIf="!isLoadingAnnouncements && announcements.length > 0" style="display: flex; flex-direction: column; gap: 14px;">
            <div *ngFor="let notice of announcements" class="card" style="border: 1px solid var(--border-color); padding: 18px; border-radius: 18px; background: var(--bg-card); box-shadow: var(--shadow-sm);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 8px; text-transform: uppercase; border: 1px solid rgba(37, 99, 235, 0.2);">
                  {{ notice.hostelBlock === 'All' ? '🌐 ALL HOSTEL BLOCKS' : '🏠 ' + notice.hostelBlock }}
                </span>
                <span style="font-size: 11.5px; color: var(--text-muted); font-weight: 600;">
                  📅 {{ notice.createdAt | date:'d MMM yyyy, h:mm a' }}
                </span>
              </div>

              <h4 style="margin: 6px 0 8px 0; font-size: 16px; font-weight: 800; color: var(--text-primary);">{{ notice.title }}</h4>
              <p style="margin: 0 0 12px 0; font-size: 13.5px; color: var(--text-secondary); line-height: 1.5; white-space: pre-line;">
                {{ notice.content }}
              </p>

              <!-- Attached Notice Image -->
              <div *ngIf="notice.photoUrl" style="margin-top: 10px; margin-bottom: 12px;">
                <img 
                  [src]="getImageUrl(notice.photoUrl)" 
                  style="max-width: 100%; max-height: 280px; object-fit: cover; border-radius: 12px; border: 1px solid var(--border-color); cursor: pointer;" 
                  (click)="openPhotoModal(getImageUrl(notice.photoUrl))"
                  alt="Notice Attachment"
                />
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid var(--border-color); font-size: 11.5px; color: var(--text-muted);">
                <span>Posted by: <strong>{{ notice.creator?.name || 'Warden' }}</strong></span>
                <span class="purple-text font-bold" style="cursor: pointer;" (click)="openNoticeModal(notice)">View Full Notice 🔍</span>
              </div>
            </div>
          </div>

          <div *ngIf="!isLoadingAnnouncements && announcements.length === 0" class="empty-state">
            <span class="empty-icon">📢</span>
            <p>No official notices broadcasted yet. Official announcements will appear here live!</p>
          </div>
        </div>

      <!-- Bottom Tab Navigation (displayed as top-nav by global CSS) -->
      <div class="bottom-tabs">
        <button type="button" class="tab-item" [class.active]="activeTab === 'home'" (click)="switchTab('home')">
          <span class="tab-icon">🏠</span>
          <span>Home</span>
        </button>
        <button type="button" class="tab-item" [class.active]="activeTab === 'notices'" (click)="switchTab('notices')">
          <span class="tab-icon">
            📢
            <span class="tab-badge animate-scale" *ngIf="getUnreadNoticesCount() > 0">{{ getUnreadNoticesCount() }}</span>
          </span>
          <span>Notices</span>
        </button>
        <button type="button" class="tab-item" [class.active]="activeTab === 'raise'" (click)="switchTab('raise')">
          <span class="tab-icon">➕</span>
          <span>Raise</span>
        </button>
        <button type="button" class="tab-item" [class.active]="activeTab === 'mess'" (click)="switchTab('mess')">
          <span class="tab-icon">🍴</span>
          <span>Mess</span>
        </button>
        <button type="button" class="tab-item" [class.active]="activeTab === 'my-complaints'" (click)="switchTab('my-complaints')">
          <span class="tab-icon">
            📋
            <span class="tab-badge animate-scale" *ngIf="getActiveTicketsCount() > 0">{{ getActiveTicketsCount() }}</span>
          </span>
          <span>My Tickets</span>
        </button>
        <button type="button" class="tab-item" [class.active]="activeTab === 'profile'" (click)="switchTab('profile')">
          <span class="tab-icon">
            🔔
            <span class="tab-badge animate-scale" *ngIf="getUnreadNotificationsCount() > 0">{{ getUnreadNotificationsCount() }}</span>
          </span>
          <span>Alerts</span>
        </button>
        <button type="button" class="tab-item" [class.active]="activeTab === 'my-profile'" (click)="switchTab('my-profile')">
          <span class="tab-icon">👤</span>
          <span>Profile</span>
        </button>
      </div>


      <!-- Sleek Exit App Confirmation Modal -->
      <div *ngIf="showExitAppModal" class="photo-modal" (click)="cancelExitModal($event)" style="z-index: 99999;">
        <div class="card" (click)="$event.stopPropagation()" style="width: 88%; max-width: 340px; border-radius: 24px; padding: 24px; text-align: center; background: var(--bg-card); border: 1px solid var(--border-color); box-shadow: 0 20px 40px rgba(0,0,0,0.5); animation: modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #fee2e2; color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 26px; margin: 0 auto 14px;">🚪</div>
          <h3 style="margin: 0 0 6px 0; font-size: 18px; font-weight: 800; color: var(--text-primary);">Exit HostelHub?</h3>
          <p style="margin: 0 0 20px 0; font-size: 13px; color: var(--text-muted); line-height: 1.4;">Are you sure you want to exit the application?</p>
          
          <div style="display: flex; gap: 10px;">
            <button type="button" (click)="cancelExitModal($event)" style="flex: 1; padding: 12px; border-radius: 14px; border: 1px solid var(--border-color); background: var(--bg-muted); color: var(--text-primary); font-size: 13.5px; font-weight: 700; cursor: pointer;">
              No, Cancel
            </button>
            <button type="button" (click)="confirmExitApp()" style="flex: 1; padding: 12px; border-radius: 14px; border: none; background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); color: white; font-size: 13.5px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);">
              Yes, Exit
            </button>
          </div>
        </div>
      </div>

      <!-- Critical Data Change Warning Modal -->
      <div *ngIf="showCriticalUpdateModal" class="photo-modal" (click)="showCriticalUpdateModal = false" style="z-index: 99999;">
        <div class="card" (click)="$event.stopPropagation()" style="width: 90%; max-width: 360px; border-radius: 24px; padding: 24px; text-align: center; background: var(--bg-card); border: 1px solid var(--border-color); box-shadow: 0 20px 40px rgba(0,0,0,0.5); animation: modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #ffedd5; color: #ea580c; display: flex; align-items: center; justify-content: center; font-size: 26px; margin: 0 auto 14px;">⚠️</div>
          <h3 style="margin: 0 0 6px 0; font-size: 18px; font-weight: 800; color: var(--text-primary);">Critical Data Change</h3>
          <p style="margin: 0 0 12px 0; font-size: 12.5px; color: var(--text-muted); line-height: 1.45;">
            You are changing critical profile information (Gender / Academic Batch / Hostel Block).
          </p>
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 10px 12px; font-size: 11.5px; color: #ef4444; font-weight: 700; margin-bottom: 20px; text-align: left; line-height: 1.4;">
            🚨 Warning: Change at your own risk! Your account will require Warden re-approval.
          </div>
          
          <div style="display: flex; gap: 10px;">
            <button type="button" (click)="showCriticalUpdateModal = false" style="flex: 1; padding: 12px; border-radius: 14px; border: 1px solid var(--border-color); background: var(--bg-muted); color: var(--text-primary); font-size: 13px; font-weight: 700; cursor: pointer;">
              Cancel
            </button>
            <button type="button" (click)="confirmCriticalUpdate()" style="flex: 1; padding: 12px; border-radius: 14px; border: none; background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); color: white; font-size: 13px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.35);">
              Proceed & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: var(--bg-body);
    }

    /* Header */
    .header {
      background: var(--bg-header);
      color: #f8fafc;
      padding: 14px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(179, 16, 49, 0.4);
      box-shadow: 0 2px 20px rgba(179, 16, 49, 0.25);
      position: sticky;
      top: 0;
      z-index: 200;
    }
    .user-info { display: flex; align-items: center; gap: 12px; }
    .avatar-ring {
      width: 42px;
      height: 42px;
      background: rgba(179, 16, 49, 0.25);
      border: 2px solid rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 0 14px rgba(179, 16, 49, 0.4);
    }
    .avatar { font-size: 20px; }
    h3 { font-size: 15px; font-weight: 700; color: #f8fafc; letter-spacing: 0.1px; }
    .user-meta { font-size: 11px; color: rgba(248,250,252,0.55); margin-top: 2px; }

    .header-actions { display: flex; align-items: center; gap: 6px; }

    .logout-btn {
      background: rgba(239,68,68,0.15);
      border: 1px solid rgba(239,68,68,0.35);
      color: #f87171;
      padding: 7px 14px;
      font-size: 12px;
      font-weight: 700;
      border-radius: var(--radius-full);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all var(--transition-fast);
      font-family: var(--font-sans);
    }
    .logout-btn:hover { background: rgba(239,68,68,0.85); color: white; }

    /* Content area */
    .tab-content-area {
      flex: 1;
      padding: 16px 16px 65px;
      max-width: 760px;
      width: 100%;
      margin: 0 auto;
      background-color: var(--bg-body);
    }

    .tab-panel { display: flex; flex-direction: column; }

    /* My Tickets Header Row */
    .my-tickets-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .btn-raise-shortcut {
      background: var(--gradient-btn);
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 700;
      font-family: var(--font-sans);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: var(--transition-fast);
      box-shadow: 0 4px 10px rgba(179, 16, 49, 0.35);
    }
    .btn-raise-shortcut:hover { background: var(--primary-dark); transform: translateY(-1px); }

    /* Skeleton */
    .skeleton-list { display: flex; flex-direction: column; gap: 12px; }

    /* Welcome Banner */
    .welcome-card {
      background: var(--gradient-brand);
      color: white;
      border-radius: var(--radius-xl);
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 12px 28px rgba(179, 16, 49, 0.40);
      position: relative;
      overflow: hidden;
    }
    .welcome-card::before {
      content: '';
      position: absolute;
      width: 200px;
      height: 200px;
      background: rgba(255,255,255,0.06);
      border-radius: 50%;
      top: -60px;
      right: -60px;
      pointer-events: none;
    }
    .welcome-card::after {
      content: '';
      position: absolute;
      width: 120px;
      height: 120px;
      background: rgba(255,255,255,0.04);
      border-radius: 50%;
      bottom: -30px;
      left: 20px;
      pointer-events: none;
    }
    .welcome-badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      color: white;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: var(--radius-full);
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .welcome-card h4 { font-size: 18px; font-weight: 800; margin-bottom: 8px; color: white; }
    .welcome-card p { font-size: 13px; color: rgba(255,255,255,0.8); line-height: 1.5; }
    .btn-raise-cta {
      background: rgba(255,255,255,0.95);
      color: var(--primary-dark);
      margin-top: 16px;
      padding: 10px 20px;
      border-radius: var(--radius-md);
      font-weight: 700;
      width: auto;
      display: inline-flex;
      gap: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      font-family: var(--font-sans);
      font-size: 13.5px;
      cursor: pointer;
      border: none;
      transition: all var(--transition-fast);
      position: relative;
      z-index: 5;
    }
    .btn-raise-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,0,0,0.25); }

    /* Section Header */
    .section-header {
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-color);
    }
    .section-header h4 { font-size: 14px; font-weight: 700; color: var(--text-secondary); }

    /* Notice Cards */
    .notice-card {
      border-left: 4px solid var(--primary);
      background-color: var(--bg-card);
      cursor: pointer;
    }
    .notice-meta {
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      color: var(--text-muted);
      margin-bottom: 6px;
      font-weight: 600;
    }
    .notice-title { font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
    .notice-body { font-size: 12px; color: var(--text-secondary); line-height: 1.45; }
    .notice-tap-hint { font-size: 10px; color: var(--primary); font-weight: 700; text-align: right; margin-top: 8px; }

    /* Category Grid */
    .developer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }
    .dev-social-links {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-top: 12px;
    }
    .social-icon-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #fdf2f4;
      border: 1px solid rgba(179, 16, 49, 0.15);
      color: #b31031;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      text-decoration: none;
    }
    .social-icon-btn:hover {
      background: #b31031;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(179, 16, 49, 0.3);
    }
    .category-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 8px;
    }
    .category-card {
      background: var(--bg-card);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 14px 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      text-align: center;
      transition: all var(--transition-fast);
      box-shadow: var(--shadow-sm);
    }
    .category-card:hover { border-color: var(--primary); background-color: var(--primary-light); }
    .category-card:active { transform: scale(0.95); }
    .category-card.selected {
      border-color: var(--primary);
      background-color: var(--primary-light);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }
    .cat-icon { font-size: 22px; margin-bottom: 5px; }
    .cat-name { font-size: 11px; font-weight: 700; color: var(--text-secondary); }
    .category-card.selected .cat-name { color: var(--primary-dark); }

    /* Upload */
    .upload-area { position: relative; width: 100%; }
    .file-input-label {
      border: 2px dashed var(--border-color);
      border-radius: var(--radius-md);
      background-color: var(--bg-muted);
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: var(--transition-fast);
      gap: 4px;
    }
    .file-input-label:hover { border-color: var(--primary); background-color: var(--primary-light); }
    .upload-icon { font-size: 26px; }
    .upload-text { font-size: 13px; font-weight: 700; color: var(--text-primary); }
    .upload-subtext { font-size: 10px; color: var(--text-muted); }
    .file-input { display: none; }

    .preview-area {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--bg-card);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
    }
    .preview-thumbnail { width: 60px; height: 60px; border-radius: var(--radius-sm); object-fit: cover; }
    .preview-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .preview-name { font-size: 12px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
    .btn-remove-file { background: none; border: none; color: var(--danger); font-size: 11px; font-weight: 700; cursor: pointer; text-align: left; width: fit-content; padding: 2px 0; }
    .btn-submit { margin-top: 12px; }

    /* Filter Pills */
    .filter-pills { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
    .pill-btn {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      padding: 7px 16px;
      font-size: 12px;
      font-weight: 600;
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: all var(--transition-fast);
      color: var(--text-secondary);
      font-family: var(--font-sans);
    }
    .pill-btn:hover { border-color: var(--primary); color: var(--primary); }
    .pill-btn.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
      box-shadow: 0 4px 10px var(--primary-glow);
    }

    /* Complaint Card */
    .complaint-card {
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
      overflow: hidden;
      padding: 0;
    }
    .comp-summary { padding: 18px; }
    .comp-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .comp-date { font-size: 10.5px; color: var(--text-muted); font-weight: 500; }
    .comp-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
    .comp-category-tag {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      background-color: var(--bg-muted);
      padding: 3px 10px;
      border-radius: var(--radius-full);
      margin-bottom: 10px;
      font-weight: 600;
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
    }
    .comp-desc-short { font-size: 12.5px; color: var(--text-muted); line-height: 1.45; }
    .tap-hint { font-size: 10.5px; color: var(--primary); font-weight: 700; text-align: right; margin-top: 8px; }

    /* Expanded Details */
    .comp-details {
      padding: 0 18px 18px;
      border-top: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .comp-desc-full { font-size: 13px; color: var(--text-secondary); line-height: 1.55; padding-top: 12px; }
    .section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; letter-spacing: 0.5px; }

    /* Images */
    .image-container { position: relative; border-radius: var(--radius-md); overflow: hidden; cursor: zoom-in; }
    .comp-img, .completion-img { width: 100%; max-height: 180px; object-fit: cover; display: block; border-radius: var(--radius-md); transition: transform 0.25s ease; }
    .image-container:hover .comp-img, .image-container:hover .completion-img { transform: scale(1.02); }
    .image-overlay { position: absolute; bottom: 0; left: 0; width: 100%; background: rgba(0,0,0,0.5); color: white; text-align: center; font-size: 10px; font-weight: 700; padding: 4px 0; backdrop-filter: blur(2px); }

    /* Staff */
    .staff-assignment {
      background: var(--primary-light);
      border: 1px solid rgba(179, 16, 49, 0.2);
      border-radius: var(--radius-md);
      padding: 14px;
    }
    .staff-header { font-size: 11px; font-weight: 700; color: var(--primary-dark); text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; }
    .staff-body { display: flex; justify-content: space-between; align-items: center; }
    .staff-name { font-size: 13px; color: var(--text-primary); }
    .staff-call-btn {
      background: var(--bg-card);
      border: 1px solid var(--primary);
      color: var(--primary);
      padding: 7px 14px;
      font-size: 12px;
      font-weight: 700;
      border-radius: var(--radius-sm);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      transition: all var(--transition-fast);
    }
    .staff-call-btn:hover { background: var(--primary); color: white; }

    /* Completion */
    .completion-header { font-size: 11px; font-weight: 700; color: var(--success); text-transform: uppercase; margin-bottom: 6px; }

    /* Stars */
    .feedback-section { background: var(--bg-muted); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; }
    .feedback-prompt { font-size: 12.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
    .stars { display: flex; gap: 6px; }
    .star { font-size: 28px; color: var(--neutral-300); cursor: pointer; transition: all 0.15s ease; }
    .star.active { color: #fbbf24; }
    .star:hover { transform: scale(1.2); color: #fbbf24; }
    .feedback-comment-box { margin-top: 10px; display: flex; flex-direction: column; gap: 8px; }
    .feedback-textarea { font-size: 13px; }
    .submit-feedback-btn { padding: 9px 16px; font-size: 12px; align-self: flex-end; width: auto; }
    .rated-display { display: flex; flex-direction: column; gap: 4px; }
    .rated-stars { font-size: 13px; color: var(--success); font-weight: 700; }
    .rated-comment { font-size: 12px; color: var(--text-secondary); background: var(--bg-card); border-radius: 8px; padding: 6px 10px; border: 1px solid var(--border-color); }
    .btn-collapse { margin-top: 4px; }

    /* Notifications */
    .notif-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .notif-header-btns { display: flex; gap: 8px; align-items: center; }
    .clear-notif-btn { background: var(--primary-light); border: none; color: var(--primary); font-size: 12px; font-weight: 700; cursor: pointer; padding: 6px 12px; border-radius: var(--radius-sm); transition: var(--transition-fast); font-family: var(--font-sans); }
    .clear-notif-btn:hover { background: var(--primary); color: white; }
    .delete-all-notif-btn { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #f87171; font-size: 12px; font-weight: 700; cursor: pointer; padding: 6px 12px; border-radius: var(--radius-sm); transition: var(--transition-fast); font-family: var(--font-sans); }
    .delete-all-notif-btn:hover { background: #ef4444; color: white; }
    .notif-card { border-left: 4px solid var(--border-color); padding: 14px 16px; }
    .notif-card.unread { border-left-color: var(--primary); background: var(--primary-light); }
    .notif-meta { display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; color: var(--text-muted); margin-bottom: 4px; font-weight: 600; }
    .notif-delete-btn { margin-left: auto; background: none; border: none; cursor: pointer; font-size: 14px; padding: 2px 6px; border-radius: var(--radius-sm); opacity: 0.5; transition: opacity 0.2s; line-height: 1; }
    .notif-delete-btn:hover { opacity: 1; background: rgba(239,68,68,0.15); }
    .notif-msg { font-size: 13px; color: var(--text-primary); line-height: 1.45; }

    /* Toast */
    .toast-alert {
      position: fixed;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      width: calc(100% - 32px);
      max-width: 500px;
      background: #0f172a;
      color: white;
      border-radius: var(--radius-lg);
      padding: 14px 18px;
      box-shadow: var(--shadow-xl);
      z-index: 2000;
      animation: slideDown 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28);
      cursor: pointer;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .toast-content { display: flex; align-items: center; gap: 12px; }
    .toast-bell { font-size: 22px; flex-shrink: 0; }
    .toast-text { flex: 1; }
    .toast-text strong { font-size: 10.5px; color: var(--primary-light); text-transform: uppercase; letter-spacing: 0.5px; }
    .toast-text p { font-size: 12.5px; color: #e2e8f0; margin-top: 2px; line-height: 1.35; }
    .toast-close { font-size: 14px; color: rgba(255,255,255,0.5); flex-shrink: 0; }
    @keyframes slideDown {
      from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
      to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }

    /* Photo Modal */
    .photo-modal {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.88);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 3000;
      backdrop-filter: blur(8px);
    }
    .modal-wrapper { position: relative; max-width: 90%; max-height: 85%; display: flex; justify-content: center; align-items: center; }
    .close-modal { position: absolute; top: -48px; right: 0; background: none; border: none; color: white; font-size: 36px; cursor: pointer; }
    .zoomed-image { max-width: 100%; max-height: 75vh; border-radius: var(--radius-lg); box-shadow: 0 25px 50px rgba(0,0,0,0.5); object-fit: contain; }

    /* Notice Modal */
    .notice-modal-overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .notice-modal-dialog {
      background: var(--bg-card);
      border-radius: var(--radius-xl);
      padding: 24px;
      width: 100%;
      max-width: 440px;
      box-shadow: var(--shadow-xl);
      display: flex;
      flex-direction: column;
      gap: 14px;
      border: 1px solid var(--border-color);
    }
    .notice-modal-header { display: flex; justify-content: space-between; align-items: center; }
    .notice-modal-badge { font-size: 10px; font-weight: 700; color: var(--primary); background: var(--primary-light); padding: 4px 10px; border-radius: var(--radius-full); letter-spacing: 0.5px; }
    .notice-modal-close { background: var(--bg-muted); border: none; width: 30px; height: 30px; border-radius: 50%; font-size: 13px; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; justify-content: center; transition: var(--transition-fast); }
    .notice-modal-close:hover { background: var(--danger-light); color: var(--danger); }
    .notice-modal-title { font-size: 16px; font-weight: 800; color: var(--text-primary); line-height: 1.35; }
    .notice-modal-meta { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); padding: 8px 12px; background: var(--bg-muted); border-radius: var(--radius-sm); }
    .notice-modal-body { font-size: 13.5px; color: var(--text-secondary); line-height: 1.65; white-space: pre-wrap; padding-top: 4px; }

    /* Notif dot */
    .notif-dot {
      position: absolute;
      top: 6px;
      right: 10px;
      width: 7px;
      height: 7px;
      background: var(--danger);
      border-radius: 50%;
      border: 1.5px solid var(--bg-nav);
    }
    .tab-item { position: relative; }

    /* Priority Selector */
    .priority-selector { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .priority-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      padding: 10px 4px;
      border: 2px solid var(--border-color);
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      transition: var(--transition-fast);
      background: var(--bg-card);
    }
    .priority-option span:first-child { font-size: 18px; }
    .priority-option:hover { border-color: var(--primary); color: var(--primary); }
    .priority-option.selected { border-color: var(--primary); background: var(--primary-light); color: var(--primary-dark); }

    /* Clickable */
    .clickable-notice { cursor: pointer; }
    .clickable-notice:hover { border-color: rgba(179, 16, 49, 0.3); }

    /* Loading dots */
    .loading-dots::after {
      content: '...';
      animation: dots 1.2s steps(4, end) infinite;
    }
    @keyframes dots {
      0%, 20% { content: '.'; }
      40% { content: '..'; }
      60%, 100% { content: '...'; }
    }

    /* Form container */
    .form-container {
      background: var(--bg-card);
      border-radius: var(--radius-xl);
      padding: 24px;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
    }

    /* Clean Footer Styling matching Warden Portal */
    .footer {
      background: var(--bg-card);
      border-top: 1px solid var(--border-color);
      padding: 24px 20px 28px;
      margin-top: auto;
      width: 100%;
    }
    .footer-content {
      max-width: 500px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
      text-align: center;
    }
    .footer-title {
      font-size: 14px;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
    }
    .footer-meta {
      display: flex;
      justify-content: center;
      gap: 16px;
      font-size: 12px;
      color: var(--text-secondary);
    }
    .footer-copyright {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    /* Mess Management CSS */
    .mess-container { display: flex; flex-direction: column; gap: 20px; }
    .mess-card { border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-xl); padding: 20px; box-shadow: var(--shadow-sm); }
    .skip-meal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 10px; }
    @media (max-width: 500px) { .skip-meal-grid { grid-template-columns: 1fr; } }
    .skip-meal-day h6 { font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; border-left: 3px solid var(--primary); padding-left: 8px; }
    .skip-buttons { display: flex; flex-direction: column; gap: 8px; }
    .btn-skip {
      background: var(--bg-muted);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 10px;
      font-size: 12px;
      font-weight: 700;
      border-radius: var(--radius-md);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all var(--transition-fast);
      font-family: var(--font-sans);
    }
    .btn-skip::after {
      content: 'Eating';
      font-size: 9px;
      padding: 2px 6px;
      background: rgba(34,197,94,0.15);
      color: #22c55e;
      border-radius: var(--radius-sm);
    }
    .btn-skip:hover { background: var(--primary-light); border-color: var(--primary); color: var(--primary-dark); }
    .btn-skip.skipped {
      border-color: rgba(239,68,68,0.4);
      background: rgba(239,68,68,0.06);
      color: #ef4444;
    }
    .btn-skip.skipped::after {
      content: 'Skipping';
      background: rgba(239,68,68,0.15);
      color: #ef4444;
    }

    .today-menu-card { padding: 20px; }
    .menu-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .day-badge { background: var(--primary-light); color: var(--primary-dark); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: var(--radius-full); }
    .menu-list { display: flex; flex-direction: column; gap: 12px; }
    .menu-day-row {
      padding: 14px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      background: var(--bg-muted);
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: all var(--transition-fast);
    }
    .menu-day-row.active-day {
      border-color: var(--primary);
      background: var(--primary-light);
      box-shadow: 0 4px 12px var(--primary-glow);
    }
    .day-name { font-size: 14px; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
    .today-marker { font-size: 9px; font-weight: 900; background: var(--primary); color: white; padding: 1px 5px; border-radius: 4px; }
    .day-meals { display: flex; flex-direction: column; gap: 4px; }
    .meal-item { font-size: 12.5px; display: flex; gap: 6px; }
    .meal-label { font-weight: 700; color: var(--text-secondary); width: 85px; flex-shrink: 0; }
    .meal-text { color: var(--text-primary); }

    /* Attendance Badge CSS */
    .badge {
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      display: inline-block;
    }
    .badge-present { background: rgba(34,197,94,0.15); color: #22c55e; }
    .badge-absent { background: rgba(239,68,68,0.15); color: #ef4444; }
    .badge-outing { background: rgba(234,179,8,0.15); color: #eab308; }
  `]
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  user: User | null = null;
  activeTab: any = 'home';
  complaints: any[] = [];
  announcements: any[] = [];
  notifications: any[] = [];
  isDarkMode = false;

  isLoadingComplaints = true;
  isLoadingAnnouncements = true;

  messPhotoFile: File | null = null;
  messPhotoPreviewUrl: string | null = null;

  // Dynamic Home Page Sections
  wardens: any[] = [];
  publicSettings: any = {
    app_about: '',
    app_how_it_works: '',
    developer_team: []
  };
  isLoadingWardens = true;
  isLoadingPublicSettings = true;

  newComplaint = {
    title: '',
    category: '',
    description: '',
    priority: 'medium'
  };
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;

  raising = false;
  justSubmitted = false;
  raiseError = '';
  raiseSuccess = '';

  filterStatus: 'all' | 'pending' | 'resolved' = 'all';
  expandedComplaintId: number | null = null;
  zoomPhotoUrl: string | null = null;
  selectedNotice: any | null = null;

  tempRating: { [id: number]: number } = {};
  tempComment: { [id: number]: string } = {};

  activeToast: LiveNotification | null = null;
  private notifSub!: Subscription;
  footerSettings: any = null;
  editUser: any = {
    name: '',
    email: '',
    phone: '',
    rollNumber: '',
    hostelBlock: '',
    roomNumber: '',
    gender: 'male',
    batch: 'Batch 2023-2027',
    bio: ''
  };
  profilePreviewUrl: string | null = null;
  selectedProfilePic: File | null = null;
  updatingProfile = false;
  profileError = '';
  profileSuccess = '';

  // Mess Management fields
  messMenu: any[] = [];
  mySkips: any[] = [];
  isLoadingMess = false;
  selectedMessMeal: 'breakfast' | 'lunch' | 'snacks' | 'dinner' = 'breakfast';
  isMessMealDropdownOpen = false;
  tempMessRating = 5;
  tempMessComment = '';
  messSuccess = '';
  messError = '';

  // Attendance fields
  attendanceStats: any = null;
  attendanceHistory: any[] = [];
  isLoadingAttendance = false;

  constructor(
    private authService: AuthService,
    private complaintService: ComplaintService,
    private socketService: SocketService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private messService: MessService,
    private attendanceService: AttendanceService
  ) { }

  switchTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'raise') {
      this.raiseError = '';
      this.raiseSuccess = '';
    } else if (tab === 'notices') {
      this.loadAnnouncements();
      this.markNoticesAsSeen();
    } else if (tab === 'home') {
      this.loadAnnouncements();
      this.loadComplaints();
    } else if (tab === 'mess') {
      this.loadMessInfo();
    } else if (tab === 'my-complaints') {
      this.loadComplaints();
      this.markTicketsAsSeen();
    } else if (tab === 'profile') {
      this.clearAllNotifications();
    } else if (tab === 'my-profile') {
      this.initProfileEdit();
      this.loadAttendanceStats();
    }
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) { }
    this.cdr.detectChanges();
  }

  showExitAppModal: boolean = false;
  private backButtonPluginSub: any = null;

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    this.loadAnnouncements();
    this.loadComplaints();
    this.loadNotifications();
    this.loadFooterSettings();
    this.loadWardens();
    this.loadPublicSettings();
    this.setupBackButtonListener();

    // Restore dark mode preference
    const saved = localStorage.getItem('hh_dark_mode');
    if (saved === 'true') {
      this.isDarkMode = true;
      document.body.classList.add('dark-mode');
    }


    // Subscribe to live socket notifications
    this.notifSub = this.socketService.notification$.subscribe(notif => {
      if (notif) {
        this.activeToast = notif;
        this.loadNotifications();
        this.loadComplaints();
        setTimeout(() => { this.clearToast(); }, 3000);
      }
    });

    // Handle real-time announcement deletion
    this.socketService.onEvent('announcement_deleted', (announcementId: number) => {
      this.announcements = this.announcements.filter(a => a.id !== announcementId);
      if (this.selectedNotice && this.selectedNotice.id === announcementId) {
        this.selectedNotice = null;
      }
      this.cdr.detectChanges();
    });
  }

  loadWardens(): void {
    this.isLoadingWardens = true;
    this.complaintService.getWardenList().subscribe({
      next: (res: any) => {
        this.wardens = res;
        this.isLoadingWardens = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load wardens:', err);
        this.isLoadingWardens = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadPublicSettings(): void {
    this.isLoadingPublicSettings = true;
    this.complaintService.getPublicSettings().subscribe({
      next: (res: any) => {
        this.publicSettings = res;
        this.isLoadingPublicSettings = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load public settings:', err);
        this.isLoadingPublicSettings = false;
        this.cdr.detectChanges();
      }
    });
  }

  splitLines(text: string): string[] {
    if (!text) return [];
    return text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  }

  ngOnDestroy(): void {
    if (this.notifSub) { this.notifSub.unsubscribe(); }
    if (this.backButtonPluginSub && typeof this.backButtonPluginSub.remove === 'function') {
      this.backButtonPluginSub.remove();
    }
  }

  setupBackButtonListener(): void {
    try {
      App.addListener('backButton', () => {
        if (this.zoomPhotoUrl) {
          this.zoomPhotoUrl = null;
          this.cdr.detectChanges();
          return;
        }
        if (this.selectedNotice) {
          this.selectedNotice = null;
          this.cdr.detectChanges();
          return;
        }
        if (this.showExitAppModal) {
          this.showExitAppModal = false;
          this.cdr.detectChanges();
          return;
        }
        if (this.expandedComplaintId !== null) {
          this.expandedComplaintId = null;
          this.cdr.detectChanges();
          return;
        }
        if (this.activeTab !== 'home') {
          this.activeTab = 'home';
          this.cdr.detectChanges();
          return;
        }
        this.showExitAppModal = true;
        this.cdr.detectChanges();
      }).then(sub => {
        this.backButtonPluginSub = sub;
      });
    } catch (e) {
      console.log('Non-Capacitor environment for backButton');
    }
  }

  cancelExitModal(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showExitAppModal = false;
    this.cdr.detectChanges();
  }

  confirmExitApp(): void {
    this.showExitAppModal = false;
    this.cdr.detectChanges();
    try {
      App.exitApp();
    } catch (e) {
      window.close();
    }
  }

  loadFooterSettings(): void {
    this.complaintService.getFooterSettings().subscribe({
      next: (res) => { this.footerSettings = res; this.cdr.detectChanges(); },
      error: (err) => console.error(err)
    });
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('hh_dark_mode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('hh_dark_mode', 'false');
    }
  }

  loadComplaints(): void {
    this.isLoadingComplaints = true;
    this.complaintService.getStudentComplaints().subscribe({
      next: (res) => {
        this.complaints = res;
        this.isLoadingComplaints = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoadingComplaints = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAnnouncements(): void {
    this.isLoadingAnnouncements = true;
    this.complaintService.getAnnouncements().subscribe({
      next: (res) => {
        this.announcements = res;
        this.isLoadingAnnouncements = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoadingAnnouncements = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadNotifications(): void {
    this.complaintService.getNotifications().subscribe({
      next: (res) => { this.notifications = res; this.cdr.detectChanges(); },
      error: (err) => console.error(err)
    });
  }

  selectCategory(cat: string): void { this.newComplaint.category = cat; }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => { this.imagePreviewUrl = reader.result as string; };
      reader.readAsDataURL(file);
    }
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    this.imagePreviewUrl = null;
    const fi = document.getElementById('photoFile') as HTMLInputElement;
    if (fi) fi.value = '';
  }

  onRaiseSubmit(): void {
    this.raising = true;
    this.raiseError = '';
    this.raiseSuccess = '';

    const safetyTimer = setTimeout(() => {
      if (this.raising) {
        this.raising = false;
        this.raiseError = 'Request timed out. Please check your connection and try again.';
      }
    }, 15000);

    const token = this.authService.token;
    if (!token) {
      clearTimeout(safetyTimer);
      this.raising = false;
      this.raiseError = 'Session expired! Please log out and log in again.';
      return;
    }

    const formData = new FormData();
    formData.append('title', this.newComplaint.title);
    formData.append('category', this.newComplaint.category);
    formData.append('description', this.newComplaint.description);
    formData.append('priority', this.newComplaint.priority || 'medium');
    if (this.selectedFile) { formData.append('photo', this.selectedFile); }

    this.complaintService.raiseComplaint(formData).subscribe({
      next: () => {
        clearTimeout(safetyTimer);
        this.raising = false;
        this.justSubmitted = true;
        this.raiseSuccess = '✅ Ticket submitted successfully!';
        // Show toast notification
        this.activeToast = { message: '✅ Your ticket has been submitted successfully! Staff will be assigned shortly.', type: 'info', createdAt: new Date() } as any;
        setTimeout(() => this.clearToast(), 3000);
        // Reset form
        this.newComplaint = { title: '', category: '', description: '', priority: 'medium' };
        this.selectedFile = null;
        this.imagePreviewUrl = null;
        this.loadComplaints();
        this.cdr.detectChanges();
        setTimeout(() => {
          this.justSubmitted = false;
          this.activeTab = 'my-complaints';
          this.filterStatus = 'all';
          this.raiseSuccess = '';
          this.cdr.detectChanges();
        }, 2500);
      },
      error: (err) => {
        clearTimeout(safetyTimer);
        this.raising = false;
        if (err.status === 401 || err.status === 403) {
          this.raiseError = '❌ Session expired or access denied. Please log out and log in again.';
        } else if (err.status === 0) {
          this.raiseError = '❌ Cannot reach server. Please make sure the backend is running on port 5000.';
        } else {
          this.raiseError = '❌ ' + (err.error?.message || 'Error submitting ticket. Please try again.');
        }
        this.cdr.detectChanges();
      }
    });
  }

  selectRating(complaintId: number, rating: number): void { this.tempRating[complaintId] = rating; }

  submitComplaintFeedback(complaintId: number): void {
    const rating = this.tempRating[complaintId];
    const comment = this.tempComment[complaintId] || '';
    this.complaintService.submitFeedback(complaintId, rating, comment).subscribe({
      next: () => {
        this.loadComplaints();
        delete this.tempRating[complaintId];
        delete this.tempComment[complaintId];
        this.cdr.detectChanges();
      },
      error: (err) => { console.error(err); this.cdr.detectChanges(); }
    });
  }

  clearAllNotifications(): void {
    this.complaintService.markAllNotificationsRead().subscribe({
      next: () => { this.loadNotifications(); this.cdr.detectChanges(); },
      error: (err) => { console.error(err); this.cdr.detectChanges(); }
    });
  }

  deleteNotification(notificationId: number, event: Event): void {
    event.stopPropagation();
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.cdr.detectChanges();
    this.complaintService.deleteNotification(notificationId).subscribe({
      error: (err) => { this.loadNotifications(); console.error(err); }
    });
  }

  deleteAllNotifications(): void {
    this.notifications = [];
    this.cdr.detectChanges();
    this.complaintService.deleteAllNotifications().subscribe({
      error: (err) => { this.loadNotifications(); console.error(err); }
    });
  }

  hasUnreadNotifications(): boolean { return this.notifications.some(n => !n.isRead); }
  getUnreadNotificationsCount(): number { return this.notifications.filter(n => !n.isRead).length; }
  getPendingCount(): number { return this.complaints.filter(c => c.status !== 'resolved').length; }
  getResolvedCount(): number { return this.complaints.filter(c => c.status === 'resolved').length; }

  get filteredComplaints(): any[] {
    if (this.filterStatus === 'all') return this.complaints;
    if (this.filterStatus === 'pending') return this.complaints.filter(c => c.status !== 'resolved');
    if (this.filterStatus === 'resolved') return this.complaints.filter(c => c.status === 'resolved');
    return this.complaints;
  }

  toggleExpand(complaintId: number | null): void {
    this.expandedComplaintId = this.expandedComplaintId === complaintId ? null : complaintId;
  }

  openPhotoModal(url: string): void { this.zoomPhotoUrl = url; }
  closePhotoModal(): void { this.zoomPhotoUrl = null; }
  openNoticeModal(notice: any): void { this.selectedNotice = notice; }
  closeNoticeModal(): void { this.selectedNotice = null; }

  onNotificationClick(notif: any): void {
    notif.isRead = true;
    if (notif.type === 'announcement') {
      const match = notif.message.match(/New Announcement: "(.*)"/);
      const title = match ? match[1] : '';
      const announcement = this.announcements.find(a => a.title === title);
      if (announcement) {
        this.selectedNotice = announcement;
      } else {
        this.selectedNotice = { title: title || 'Hostel Announcement', content: notif.message, createdAt: notif.createdAt, creator: { name: 'Warden' } };
      }
    } else {
      this.activeTab = 'my-complaints';
      const match = notif.message.match(/complaint "(.*)"/i) || notif.message.match(/task assigned: "(.*)"/i);
      if (match) {
        const title = match[1];
        const comp = this.complaints.find(c => c.title.toLowerCase() === title.toLowerCase());
        if (comp) { this.expandedComplaintId = comp.id; }
      }
    }
  }

  getCategoryIcon(cat: string): string {
    switch (cat) {
      case 'electrical': return '⚡';
      case 'plumbing': return '🚰';
      case 'carpentry': return '🪚';
      case 'cleaning': return '🧹';
      case 'wifi': return '📶';
      default: return '⚙️';
    }
  }

  getNotifIcon(type: string): string {
    switch (type) {
      case 'complaint_update': return '🛠️';
      case 'announcement': return '📢';
      default: return '🔔';
    }
  }

  clearToast(): void {
    this.activeToast = null;
    this.socketService.clearNotification();
    this.cdr.detectChanges();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/student/login']);
  }

  showToast(message: string): void {
    this.activeToast = { message, type: 'info', createdAt: new Date() } as any;
    setTimeout(() => this.clearToast(), 3000);
  }

  showCriticalUpdateModal: boolean = false;

  initProfileEdit(): void {
    const u = this.authService.currentUserValue;
    if (u) {
      this.editUser = {
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        rollNumber: u.rollNumber || '',
        hostelBlock: u.hostelBlock || '',
        roomNumber: u.roomNumber || '',
        gender: u.gender || 'male',
        batch: u.batch || 'Batch 2023-2027',
        bio: u.bio || ''
      };
      this.profilePreviewUrl = this.getImageUrl(u.profilePicUrl);
      this.selectedProfilePic = null;
      this.profileError = '';
      this.profileSuccess = '';
    }
  }

  onProfilePicChange(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedProfilePic = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.profilePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onProfileSubmit(): void {
    const u = this.user;
    if (!u) return;

    // Critical fields check: ONLY Gender or Academic Batch require Warden re-approval
    const isCriticalChanged =
      (this.editUser.gender && this.editUser.gender !== u.gender) ||
      (this.editUser.batch && this.editUser.batch !== u.batch);

    if (isCriticalChanged && !this.showCriticalUpdateModal) {
      this.showCriticalUpdateModal = true;
      this.cdr.detectChanges();
      return;
    }

    this.confirmCriticalUpdate();
  }

  confirmCriticalUpdate(): void {
    this.showCriticalUpdateModal = false;
    this.updatingProfile = true;
    this.profileError = '';
    this.profileSuccess = '';

    const formData = new FormData();
    formData.append('name', this.editUser.name);
    formData.append('email', this.editUser.email);
    formData.append('phone', this.editUser.phone);
    formData.append('rollNumber', this.editUser.rollNumber);
    formData.append('hostelBlock', this.editUser.hostelBlock);
    formData.append('roomNumber', this.editUser.roomNumber);
    formData.append('gender', this.editUser.gender);
    formData.append('batch', this.editUser.batch);
    formData.append('bio', this.editUser.bio);

    if (this.selectedProfilePic) {
      formData.append('profilePic', this.selectedProfilePic);
    }

    this.authService.updateProfile(formData).subscribe({
      next: (res) => {
        this.updatingProfile = false;
        this.user = res.user;
        if (res.requiresReapproval || res.user?.status === 'pending_verification') {
          this.profileSuccess = '⚠️ Profile updated! Critical data was changed. Your account is now pending Warden re-approval.';
          this.showToast('⚠️ Critical data updated! Account pending Warden re-approval.');
        } else {
          this.profileSuccess = '✅ Profile updated successfully!';
          this.showToast('✅ Profile updated successfully!');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.updatingProfile = false;
        this.profileError = '❌ ' + (err.error?.message || 'Failed to update profile.');
        this.cdr.detectChanges();
      }
    });
  }

  myMessFeedbacks: any[] = [];

  loadMyMessFeedbacks(): void {
    this.messService.getMyFeedback().subscribe({
      next: (feedbacks) => {
        this.myMessFeedbacks = feedbacks || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load my mess feedback:', err);
      }
    });
  }

  // Load mess data
  loadMessInfo(): void {
    this.isLoadingMess = true;
    this.messError = '';
    this.messSuccess = '';
    this.messService.getMenu().subscribe({
      next: (menu) => {
        this.messMenu = menu;
        this.isLoadingMess = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.messError = 'Failed to load weekly menu.';
        this.isLoadingMess = false;
        this.cdr.detectChanges();
      }
    });

    this.messService.getMySkippedMeals().subscribe({
      next: (skips) => {
        this.mySkips = skips;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load skipped meals:', err);
      }
    });

    this.loadMyMessFeedbacks();
  }

  // Get date strings for today & tomorrow
  getTodayDateString(): string {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }

  getTomorrowDateString(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  getDayOfWeekName(): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }

  // Skip meal logic
  isMealSkipped(mealType: 'breakfast' | 'lunch' | 'dinner', date: string): boolean {
    return this.mySkips.some(s => s.mealType === mealType && s.date === date);
  }

  toggleSkip(mealType: 'breakfast' | 'lunch' | 'dinner', date: string): void {
    this.messError = '';
    this.messSuccess = '';
    this.messService.toggleSkipMeal(mealType, date).subscribe({
      next: (res) => {
        this.messSuccess = res.message;
        // Refresh skip list
        this.messService.getMySkippedMeals().subscribe(skips => {
          this.mySkips = skips;
          this.cdr.detectChanges();
        });
        setTimeout(() => { this.messSuccess = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.messError = err.error?.message || 'Failed to update skip meal option.';
        this.cdr.detectChanges();
      }
    });
  }

  toggleMessMealDropdown(event: Event): void {
    event.stopPropagation();
    this.isMessMealDropdownOpen = !this.isMessMealDropdownOpen;
    this.cdr.detectChanges();
  }

  selectMessMeal(meal: 'breakfast' | 'lunch' | 'snacks' | 'dinner'): void {
    this.selectedMessMeal = meal;
    this.isMessMealDropdownOpen = false;
    this.cdr.detectChanges();
  }

  getMessMealLabel(): string {
    if (!this.selectedMessMeal) return 'Select Meal';
    if (this.selectedMessMeal === 'breakfast') return '🍳 Breakfast';
    if (this.selectedMessMeal === 'lunch') return '🍛 Lunch';
    if (this.selectedMessMeal === 'snacks') return '☕ Snacks';
    if (this.selectedMessMeal === 'dinner') return '🍽️ Dinner';
    return this.selectedMessMeal;
  }

  downloadImage(imageUrl: string | null | undefined, fileName: string = 'Notice-Attachment.jpg'): void {
    if (!imageUrl) return;
    const fullUrl = this.getImageUrl(imageUrl);

    // Show instant toast notification
    this.activeToast = {
      message: '📥 Preparing image for Gallery Save...',
      type: 'info',
      createdAt: new Date()
    };
    this.cdr.detectChanges();

    const triggerNativeOrBlobDownload = async (blob: Blob) => {
      try {
        const mimeType = blob.type || 'image/jpeg';
        const file = new File([blob], fileName, { type: mimeType });

        // Method A: Native Android Web Share Sheet (Provides direct 'Save to Gallery' / 'Photos' option)
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Notice Attachment',
            text: 'Save Notice Image to Gallery'
          });
          this.activeToast = {
            message: '✅ Saved to Gallery!',
            type: 'success',
            createdAt: new Date()
          };
          this.cdr.detectChanges();
          setTimeout(() => this.clearToast(), 4000);
          return;
        }
      } catch (shareErr: any) {
        if (shareErr.name === 'AbortError') {
          this.clearToast();
          return;
        }
        console.warn('Native share fallback to anchor link:', shareErr);
      }

      // Method B: Blob Object URL Anchor Download
      try {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);

        this.activeToast = {
          message: '✅ Image downloaded to Gallery!',
          type: 'success',
          createdAt: new Date()
        };
        this.cdr.detectChanges();
        setTimeout(() => this.clearToast(), 4000);
      } catch (linkErr) {
        console.error('Anchor download failed:', linkErr);
        window.open(fullUrl, '_blank');
        this.activeToast = {
          message: '✅ Image opened for download!',
          type: 'success',
          createdAt: new Date()
        };
        this.cdr.detectChanges();
        setTimeout(() => this.clearToast(), 4000);
      }
    };

    const dataURItoBlob = (dataURI: string): Blob => {
      const parts = dataURI.split(',');
      const mime = parts[0].split(':')[1].split(';')[0];
      const byteString = atob(parts[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mime });
    };

    // 1. Base64 URL direct blob conversion
    if (fullUrl.startsWith('data:image')) {
      try {
        const blob = dataURItoBlob(fullUrl);
        triggerNativeOrBlobDownload(blob);
        return;
      } catch (base64Err) {
        console.warn('Base64 blob conversion failed:', base64Err);
      }
    }

    // 2. HTTP fetch blob
    fetch(fullUrl, { mode: 'cors' })
      .then(res => res.blob())
      .then(blob => triggerNativeOrBlobDownload(blob))
      .catch(err => {
        console.warn('Fetch image blob failed, attempting canvas conversion:', err);
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              canvas.toBlob(blob => {
                if (blob) triggerNativeOrBlobDownload(blob);
              }, 'image/jpeg', 0.95);
              return;
            }
          } catch (canvasErr) {
            console.error('Canvas blob failed:', canvasErr);
          }
          window.open(fullUrl, '_blank');
        };
        img.onerror = () => window.open(fullUrl, '_blank');
        img.src = fullUrl;
      });
  }

  onMessPhotoSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      this.messPhotoFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.messPhotoPreviewUrl = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  async selectMessPhoto(sourceType: 'camera' | 'gallery'): Promise<void> {
    try {
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: sourceType === 'camera' ? CameraSource.Camera : CameraSource.Photos
      });

      if (image && image.webPath) {
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const file = new File([blob], `mess-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });

        const reader = new FileReader();
        reader.onload = () => {
          this.messPhotoFile = file;
          this.messPhotoPreviewUrl = reader.result as string;
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.log('Capacitor camera/gallery failed or cancelled, using browser file input:', err);
      const el = document.getElementById('messPhotoInput') as HTMLInputElement;
      if (el) el.click();
    }
  }

  clearMessPhoto(): void {
    this.messPhotoFile = null;
    this.messPhotoPreviewUrl = null;
    const el = document.getElementById('messPhotoInput') as HTMLInputElement;
    if (el) el.value = '';
    this.cdr.detectChanges();
  }

  // Submit Feedback
  submitMessFeedback(): void {
    this.messSuccess = '';
    this.messError = '';
    const date = this.getTodayDateString();

    const formData = new FormData();
    formData.append('mealType', this.selectedMessMeal);
    formData.append('date', date);
    formData.append('rating', this.tempMessRating.toString());
    formData.append('comment', this.tempMessComment || '');
    if (this.messPhotoFile) {
      formData.append('photo', this.messPhotoFile);
    }

    this.messService.submitFeedback(formData).subscribe({
      next: (res) => {
        this.messSuccess = '✅ ' + res.message;
        this.tempMessComment = '';
        this.tempMessRating = 5;
        this.clearMessPhoto();
        this.loadMyMessFeedbacks();
        this.cdr.detectChanges();
        setTimeout(() => { this.messSuccess = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.messError = '❌ ' + (err.error?.message || 'Failed to submit feedback.');
        this.cdr.detectChanges();
      }
    });
  }

  // Load individual student attendance statistics
  loadAttendanceStats(): void {
    this.isLoadingAttendance = true;
    this.attendanceService.getMyStats().subscribe({
      next: (res) => {
        this.attendanceStats = res.summary;
        this.attendanceHistory = res.history;
        this.isLoadingAttendance = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load attendance statistics:', err);
        this.isLoadingAttendance = false;
        this.cdr.detectChanges();
      }
    });
  }

  lastSeenNoticesTime: string = localStorage.getItem('student_seen_notices_time') || '';
  lastSeenTicketsTime: string = localStorage.getItem('student_seen_tickets_time') || '';

  markNoticesAsSeen(): void {
    this.lastSeenNoticesTime = new Date().toISOString();
    localStorage.setItem('student_seen_notices_time', this.lastSeenNoticesTime);
    this.cdr.detectChanges();
  }

  markTicketsAsSeen(): void {
    this.lastSeenTicketsTime = new Date().toISOString();
    localStorage.setItem('student_seen_tickets_time', this.lastSeenTicketsTime);
    this.cdr.detectChanges();
  }

  getUnreadNoticesCount(): number {
    if (!this.announcements || this.announcements.length === 0) return 0;
    if (!this.lastSeenNoticesTime) {
      return this.announcements.length;
    }
    return this.announcements.filter(a => {
      const itemTime = new Date(a.createdAt).getTime();
      return itemTime > new Date(this.lastSeenNoticesTime).getTime();
    }).length;
  }

  getActiveTicketsCount(): number {
    if (!this.complaints || this.complaints.length === 0) return 0;
    if (!this.lastSeenTicketsTime) {
      return this.complaints.filter((c: any) => c.status === 'pending' || c.status === 'in_progress').length;
    }
    return this.complaints.filter((c: any) => {
      const itemTime = new Date(c.updatedAt || c.createdAt).getTime();
      return itemTime > new Date(this.lastSeenTicketsTime).getTime() && (c.status === 'pending' || c.status === 'in_progress');
    }).length;
  }

  getImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const cleanPath = url.startsWith('/') ? url : '/' + url;
    return API_CONFIG.baseUrl + cleanPath;
  }

  onImgError(event: any): void {
    if (event && event.target) {
      event.target.style.display = 'none';
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.isMessMealDropdownOpen) {
      this.isMessMealDropdownOpen = false;
      this.cdr.detectChanges();
    }
  }

  async selectPhoto(type: 'complaint' | 'profile') {
    try {
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt
      });

      if (image && image.webPath) {
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });

        const reader = new FileReader();
        reader.onload = () => {
          if (type === 'complaint') {
            this.selectedFile = file;
            this.imagePreviewUrl = reader.result as string;
          } else if (type === 'profile') {
            this.selectedProfilePic = file;
            this.profilePreviewUrl = reader.result as string;
          }
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.log('Capacitor camera failed or cancelled, using standard browser input:', err);
      if (type === 'complaint') {
        const el = document.getElementById('photoFile') as HTMLInputElement;
        if (el) el.click();
      } else if (type === 'profile') {
        const el = document.getElementById('profilePicFile') as HTMLInputElement;
        if (el) el.click();
      }
    }
  }

  onAvatarError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }
}




