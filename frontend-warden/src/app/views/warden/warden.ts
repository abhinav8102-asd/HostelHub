import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';
import { ComplaintService } from '../../services/complaint.service';
import { SocketService, LiveNotification } from '../../services/socket.service';
import { MessService } from '../../services/mess.service';
import { AttendanceService } from '../../services/attendance.service';




@Component({
  selector: 'app-warden-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <!-- Toast Alert for Live Notifications -->
      <div class="toast-alert" *ngIf="activeToast" (click)="clearToast()">
        <div class="toast-content">
          <span class="toast-bell">🔔</span>
          <div class="toast-text">
            <strong>Warden Update</strong>
            <p>{{ activeToast.message }}</p>
          </div>
          <span class="toast-close" style="font-size:14px; color:rgba(255,255,255,0.5); flex-shrink:0;">✕</span>
        </div>
      </div>

      <!-- Photo Zoom Modal -->
      <div class="photo-modal" *ngIf="zoomPhotoUrl" (click)="closePhotoModal()">
        <div class="modal-wrapper" (click)="$event.stopPropagation()">
          <button class="close-modal" (click)="closePhotoModal()">&times;</button>
        </div>
      </div>

      <!-- FUTURISTIC SIDEBAR GLASS DRAWER OVERLAY -->
      <div class="sidebar-backdrop" *ngIf="isSidebarOpen" (click)="closeSidebar()">
        <div class="sidebar-drawer" (click)="$event.stopPropagation()">
          <div class="sidebar-header">
            <div class="sidebar-user-info">
              <div class="sidebar-avatar-ring">
                <span class="avatar" *ngIf="!user?.profilePicUrl" style="font-size: 24px;">👨‍💼</span>
                <img *ngIf="user?.profilePicUrl" [src]="getImageUrl(user.profilePicUrl)" (error)="onAvatarError($event)" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />
              </div>
              <div>
                <h4 class="sidebar-user-name">{{ user?.name || 'Warden' }}</h4>
                <span class="sidebar-user-role">🛡️ Official Warden</span>
                <span class="sidebar-user-block">🏢 {{ user?.hostelBlock || 'All Blocks' }}</span>
              </div>
            </div>
            <button type="button" class="sidebar-close-btn" (click)="closeSidebar()">✕</button>
          </div>

          <!-- Navigation Links List -->
          <div class="sidebar-nav-menu">
            <button type="button" class="sidebar-nav-item" [class.active]="activeTab === 'home'" (click)="switchTab('home'); closeSidebar()">
              <div class="sidebar-nav-icon-wrapper">🏠</div>
              <span>Home Command</span>
              <span class="sidebar-arrow">›</span>
            </button>

            <button type="button" class="sidebar-nav-item" [class.active]="activeTab === 'complaints'" (click)="switchTab('complaints'); closeSidebar()">
              <div class="sidebar-nav-icon-wrapper">📋</div>
              <span>Complaints & Tickets</span>
              <span class="sidebar-badge" *ngIf="getPendingCount() > 0">{{ getPendingCount() }}</span>
              <span class="sidebar-arrow" *ngIf="getPendingCount() === 0">›</span>
            </button>

            <button type="button" class="sidebar-nav-item" [class.active]="activeTab === 'announcements'" (click)="switchTab('announcements'); closeSidebar()">
              <div class="sidebar-nav-icon-wrapper">📢</div>
              <span>Official Broadcasts</span>
              <span class="sidebar-arrow">›</span>
            </button>

            <button type="button" class="sidebar-nav-item" [class.active]="activeTab === 'mess'" (click)="switchTab('mess'); closeSidebar()">
              <div class="sidebar-nav-icon-wrapper">🍽️</div>
              <span>Mess & Meal Management</span>
              <span class="sidebar-arrow">›</span>
            </button>

            <button type="button" class="sidebar-nav-item" [class.active]="activeTab === 'users'" (click)="switchTab('users'); closeSidebar()">
              <div class="sidebar-nav-icon-wrapper">👥</div>
              <span>Hostel Students</span>
              <span class="sidebar-arrow">›</span>
            </button>

            <button type="button" class="sidebar-nav-item" [class.active]="activeTab === 'approvals'" (click)="switchTab('approvals'); closeSidebar()">
              <div class="sidebar-nav-icon-wrapper">⚡</div>
              <span>Staff & Approvals</span>
              <span class="sidebar-arrow">›</span>
            </button>

            <button type="button" class="sidebar-nav-item" [class.active]="activeTab === 'profile'" (click)="switchTab('profile'); closeSidebar()">
              <div class="sidebar-nav-icon-wrapper">👤</div>
              <span>My Profile</span>
              <span class="sidebar-arrow">›</span>
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
      <div class="cyber-top-bar">
        <!-- Left Group: Hamburger + Avatar + Warden Info -->
        <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
          <button type="button" (click)="toggleSidebar()" title="Open Navigation Menu" class="hamburger-btn">
            <span>☰</span>
          </button>

          <div (click)="switchTab('profile')" style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1; min-width: 0;">
            <div style="position: relative; width: 40px; height: 40px; flex-shrink: 0;">
              <div style="width: 100%; height: 100%; border-radius: 50%; border: 2.5px solid #2563eb; padding: 2px; display: flex; align-items: center; justify-content: center; background: var(--bg-card); box-shadow: 0 0 14px rgba(37, 99, 235, 0.25);">
                <span class="avatar" *ngIf="!user?.profilePicUrl" style="font-size: 18px;">👨‍💼</span>
                <img *ngIf="user?.profilePicUrl" [src]="getImageUrl(user.profilePicUrl)" (error)="onAvatarError($event)" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />
              </div>
              <div class="online-pulse-dot"></div>
            </div>
            <div style="flex: 1; min-width: 0; overflow: hidden;">
              <h4 style="margin: 0; font-family: var(--font-display); font-size: 15px; font-weight: 900; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2;">
                {{ user?.name || 'Warden' }}
              </h4>
              <p style="margin: 2px 0 0 0; font-size: 11px; font-weight: 800; color: #2563eb; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2;">
                🏢 {{ user?.hostelBlock || 'All Blocks' }} Warden
              </p>
            </div>
          </div>
        </div>

        <!-- Right Group: Theme Toggle -->
        <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
          <button (click)="toggleDarkMode()" [title]="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'" style="width: 38px; height: 38px; border-radius: 12px; border: 1.5px solid var(--border-color); background: var(--bg-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; color: var(--text-primary); flex-shrink: 0;">
            {{ isDarkMode ? '☀️' : '🌙' }}
          </button>
        </div>
      </div>

      <!-- TAB AREA -->
      <div class="tab-content-area">
        
        <!-- TAB 0: HOME DASHBOARD -->
        <div *ngIf="activeTab === 'home'" class="tab-panel animate-fade">
          
          <!-- Section 1: WORLD-CLASS 3D ANIMATED LAUNCHPAD GRID -->
          <div style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h3 style="font-family: var(--font-display); font-size: 16px; font-weight: 900; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 8px;">
                <span>🚀 Warden Launchpad</span>
              </h3>
              <span style="font-size: 11px; font-weight: 800; color: #2563eb; background: rgba(37, 99, 235, 0.08); padding: 4px 10px; border-radius: 20px;">
                1-Tap Command
              </span>
            </div>

            <div class="action-grid-3d">
              <!-- Tile 1: Pending Approvals -->
              <div class="action-tile-3d tile-blue" (click)="switchTab('approvals')">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div class="action-badge-floating" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff;">
                    🔍
                  </div>
                  <span style="background: rgba(37, 99, 235, 0.12); color: #2563eb; font-size: 10px; font-weight: 900; padding: 4px 8px; border-radius: 12px; text-transform: uppercase;">
                    APPROVALS
                  </span>
                </div>
                <div>
                  <h4 class="action-card-title">{{ getPendingCount() }} Pending</h4>
                  <p class="action-card-sub" style="color: var(--text-muted);">Registration & Staff requests</p>
                </div>
              </div>

              <!-- Tile 2: Total Complaint Tickets -->
              <div class="action-tile-3d tile-amber" (click)="switchTab('complaints')">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div class="action-badge-floating" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff;">
                    📋
                  </div>
                  <span style="background: rgba(245, 158, 11, 0.15); color: #d97706; font-size: 10px; font-weight: 900; padding: 4px 8px; border-radius: 12px; text-transform: uppercase;">
                    TICKETS
                  </span>
                </div>
                <div>
                  <h4 class="action-card-title">{{ complaints.length }} Tickets</h4>
                  <p class="action-card-sub" style="color: var(--text-muted);">Active hostel maintenance</p>
                </div>
              </div>

              <!-- Tile 3: Post Notice -->
              <div class="action-tile-3d tile-purple" (click)="switchTab('announcements')">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div class="action-badge-floating" style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: #ffffff;">
                    📢
                  </div>
                  <span style="background: rgba(139, 92, 246, 0.15); color: #7c3aed; font-size: 10px; font-weight: 900; padding: 4px 8px; border-radius: 12px; text-transform: uppercase;">
                    BROADCAST
                  </span>
                </div>
                <div>
                  <h4 class="action-card-title">Post Broadcast</h4>
                  <p class="action-card-sub" style="color: var(--text-muted);">{{ announcements.length }} active notices sent</p>
                </div>
              </div>

              <!-- Tile 4: Mess & Meal Feedback Reviews -->
              <div class="action-tile-3d tile-green" (click)="switchTab('mess'); loadMessData()">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div class="action-badge-floating" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff;">
                    ⭐
                  </div>
                  <span style="background: rgba(16, 185, 129, 0.15); color: #059669; font-size: 10px; font-weight: 900; padding: 4px 8px; border-radius: 12px; text-transform: uppercase;">
                    MESS REVIEW
                  </span>
                </div>
                <div>
                  <h4 class="action-card-title">Mess Rating & Reviews</h4>
                  <p class="action-card-sub" style="color: var(--text-muted);">{{ feedbackStats?.overallAvg || 'N/A' }} ★ Student mess feedback</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: OFFICIAL BROADCAST STREAM REEL -->
          <div style="margin-bottom: 24px;" *ngIf="announcements.length > 0">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 0 2px;">
              <div>
                <h3 style="font-family: var(--font-display); font-size: 16px; font-weight: 900; color: var(--text-primary); margin: 0 0 2px 0; display: flex; align-items: center; gap: 8px;">
                  <span>📢 Official Notice Reel</span>
                </h3>
                <p style="margin: 0; font-size: 12px; color: var(--text-muted);">
                  Live announcements from Hostel Administration
                </p>
              </div>
              <button (click)="switchTab('announcements')" style="background: rgba(37, 99, 235, 0.1); border: 1px solid rgba(37, 99, 235, 0.25); color: #2563eb; font-size: 11.5px; font-weight: 800; padding: 6px 14px; border-radius: 20px; cursor: pointer; white-space: nowrap;">
                View All ({{ announcements.length }}) →
              </button>
            </div>
            <div style="border-bottom: 1px solid var(--border-color); margin-top: 10px; margin-bottom: 14px; opacity: 0.7;"></div>

            <div class="notice-reel-wrapper">
              <div class="notice-reel-track">
                <div class="notice-reel-card" *ngFor="let notice of announcements" (click)="switchTab('announcements')">
                  <div style="display: flex; flex-direction: column; height: 100%; justify-content: space-between;">
                    <div>
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="background: rgba(37, 99, 235, 0.1); color: #2563eb; font-size: 10px; font-weight: 900; padding: 3px 8px; border-radius: 8px;">
                          🌐 {{ notice.hostelBlock || 'ALL HOSTELS' }}
                        </span>
                        <span style="font-size: 10.5px; font-weight: 700; color: var(--text-muted);">
                          📅 {{ notice.createdAt | date:'d MMM' }}
                        </span>
                      </div>

                      <!-- Notice Photo Image (if present) -->
                      <div *ngIf="notice.photoUrl || notice.photo_url || notice.imageUrl" style="width: 100%; height: 110px; border-radius: 12px; overflow: hidden; margin-bottom: 8px; border: 1.5px solid var(--border-color); background: var(--bg-muted);" (click)="$event.stopPropagation(); zoomPhotoUrl = getImageUrl(notice.photoUrl || notice.photo_url || notice.imageUrl)">
                        <img [src]="getImageUrl(notice.photoUrl || notice.photo_url || notice.imageUrl)" style="width: 100%; height: 100%; object-fit: cover;" (error)="onAvatarError($event)" />
                      </div>

                      <h4 style="margin: 0 0 6px 0; font-family: var(--font-display); font-size: 14.5px; font-weight: 800; color: var(--text-primary); line-height: 1.3;">
                        {{ notice.title }}
                      </h4>
                      <p style="margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        {{ notice.content }}
                      </p>
                    </div>

                    <div style="margin-top: 10px; padding-top: 6px; border-top: 1px dashed var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-size: 10.5px; font-weight: 700; color: #2563eb;">Tap to view detail</span>
                      <span style="font-size: 12px; color: #2563eb;">→</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: WARDEN COMMAND OVERVIEW & SYSTEM PIPELINE GLASS CARD -->
          <div class="overview-glass-card" style="margin-bottom: 24px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
              <span style="background: rgba(37, 99, 235, 0.12); color: #2563eb; font-size: 11px; font-weight: 900; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.4px;">
                ⚡ Warden Command System
              </span>
              <span style="font-size: 11px; font-weight: 800; color: var(--text-muted);">v2.4 Live Pipeline</span>
            </div>

            <h3 style="font-family: var(--font-display); font-size: 18px; font-weight: 900; color: var(--text-primary); margin: 0 0 10px 0; line-height: 1.3;">
              Automated Hostel Management & Maintenance Engine 🏢
            </h3>
            <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0 0 18px 0;">
              HostelHub empowers wardens to manage student complaints, dispatch electricians & plumbers, publish official hostel broadcasts, and track daily mess meal skip analytics seamlessly.
            </p>

            <!-- 4-Step Resolution Pipeline Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px;">
              <div class="overview-step-pill">
                <div style="width: 32px; height: 32px; border-radius: 10px; background: rgba(37, 99, 235, 0.12); color: #2563eb; font-weight: 900; font-size: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  01
                </div>
                <div>
                  <h5 style="margin: 0; font-size: 12.5px; font-weight: 800; color: var(--text-primary);">Receive Ticket</h5>
                  <p style="margin: 2px 0 0 0; font-size: 10.5px; color: var(--text-muted);">Real-time student alerts</p>
                </div>
              </div>

              <div class="overview-step-pill">
                <div style="width: 32px; height: 32px; border-radius: 10px; background: rgba(16, 185, 129, 0.12); color: #10b981; font-weight: 900; font-size: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  02
                </div>
                <div>
                  <h5 style="margin: 0; font-size: 12.5px; font-weight: 800; color: var(--text-primary);">Staff Dispatch</h5>
                  <p style="margin: 2px 0 0 0; font-size: 10.5px; color: var(--text-muted);">Assign plumber/electrician</p>
                </div>
              </div>

              <div class="overview-step-pill">
                <div style="width: 32px; height: 32px; border-radius: 10px; background: rgba(245, 158, 11, 0.12); color: #d97706; font-weight: 900; font-size: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  03
                </div>
                <div>
                  <h5 style="margin: 0; font-size: 12.5px; font-weight: 800; color: var(--text-primary);">Track Repair</h5>
                  <p style="margin: 2px 0 0 0; font-size: 10.5px; color: var(--text-muted);">Live work progress</p>
                </div>
              </div>

              <div class="overview-step-pill">
                <div style="width: 32px; height: 32px; border-radius: 10px; background: rgba(139, 92, 246, 0.12); color: #7c3aed; font-weight: 900; font-size: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  04
                </div>
                <div>
                  <h5 style="margin: 0; font-size: 12.5px; font-weight: 800; color: var(--text-primary);">Broadcast & Approve</h5>
                  <p style="margin: 2px 0 0 0; font-size: 10.5px; color: var(--text-muted);">Official student notices</p>
                </div>
              </div>
            </div>

            <!-- Feature Tags Pill Row -->
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <span class="overview-feature-pill">🛡️ Role Isolation</span>
              <span class="overview-feature-pill">⚡ Instant Socket Alerts</span>
              <span class="overview-feature-pill">📊 Mess Analytics</span>
              <span class="overview-feature-pill">📱 Mobile APK Native</span>
            </div>
          </div>

          <!-- Section 4: SOLO CREATOR & ARCHITECT SPOTLIGHT SECTION -->
          <div style="margin-bottom: 24px;" *ngIf="publicSettings?.developer_team?.length">
            <!-- Header Outside Card -->
            <div style="margin-bottom: 14px;">
              <h3 style="font-family: var(--font-display); font-size: 16px; font-weight: 900; color: var(--text-primary); margin: 0 0 4px 0; display: flex; align-items: center; gap: 8px;">
                <span>👨‍💻 Creator & Solo Developer</span>
              </h3>
              <p style="margin: 0; font-size: 12px; color: var(--text-muted); line-height: 1.4;">
                The architect and engineer behind the complete design, system backend, and native mobile apps of HostelHub.
              </p>
              <div style="border-bottom: 1px solid var(--border-color); margin-top: 10px; margin-bottom: 16px; opacity: 0.7;"></div>
            </div>

            <!-- Developer Glass Card (Matching Screenshot 2) -->
            <div class="solo-dev-card" style="margin-bottom: 0; padding: 28px 20px; border-radius: 28px;">
              <div style="position: relative; display: inline-block; margin-bottom: 14px;">
                <div style="width: 76px; height: 76px; border-radius: 50%; border: 3px solid #2563eb; padding: 3px; margin: 0 auto; background: var(--bg-card); box-shadow: 0 0 24px rgba(37, 99, 235, 0.35); overflow: hidden;">
                  <img [src]="getImageUrl(publicSettings.developer_team[0].pic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80')" 
                       style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" 
                       [alt]="publicSettings.developer_team[0].name || 'Abhinav Kumar'" 
                       (error)="onAvatarError($event)" />
                </div>
                <div class="online-pulse-dot" style="width: 14px; height: 14px; right: 2px; bottom: 2px;"></div>
              </div>

              <div style="margin-bottom: 14px;">
                <span style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; font-size: 11px; font-weight: 900; padding: 6px 16px; border-radius: 20px; letter-spacing: 0.5px; display: inline-block; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);">
                  🚀 {{ (publicSettings.developer_team[0].role || 'CREATOR & LEAD FULL-STACK DEVELOPER') | uppercase }}
                </span>
              </div>

              <h3 style="margin: 0 0 6px 0; font-family: var(--font-display); font-size: 22px; font-weight: 900; color: var(--text-primary);">
                {{ publicSettings.developer_team[0].name || 'Abhinav Kumar' }}
              </h3>

              <p style="margin: 0 0 18px 0; font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; max-width: 480px; margin-left: auto; margin-right: auto;">
                {{ publicSettings.developer_team[0].description || 'Sole Architect & Lead Developer of HostelHub. Expert in Full-Stack Engineering, Angular, Node.js, Express, Sequelize, & Capacitor Native Apps.' }}
              </p>

              <!-- 5 Social Media Buttons -->
              <div style="display: flex; justify-content: center; align-items: center; gap: 12px; flex-wrap: wrap;">
                <a [href]="publicSettings.developer_team[0].github || 'https://github.com/abhinav8102-asd'" target="_blank" class="social-icon-btn-dev" title="GitHub Repository">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                </a>
                <a [href]="publicSettings.developer_team[0].linkedin || 'https://linkedin.com'" target="_blank" class="social-icon-btn-dev" title="LinkedIn Profile">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.762-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a [href]="publicSettings.developer_team[0].instagram || 'https://instagram.com'" target="_blank" class="social-icon-btn-dev" title="Instagram Profile">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a [href]="publicSettings.developer_team[0].twitter || 'https://twitter.com'" target="_blank" class="social-icon-btn-dev" title="Twitter Profile">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a [href]="publicSettings.developer_team[0].email || 'mailto:support@hostelhub.com'" class="social-icon-btn-dev" title="Send Email">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 6.013-9.518-6.013h19.036zm-19.518 14v-11.774l10 6.32 10-6.32v11.774h-20z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <!-- Section 5: SINGLE APP FOOTER GLASS CARD (Matching Screenshot 3) -->
          <div class="app-footer-card" style="margin-top: 24px; margin-bottom: 24px; padding: 22px 18px; border-radius: 24px;">
            <h4 style="margin: 0 0 8px 0; font-family: var(--font-display); font-size: 15px; font-weight: 900; color: var(--text-primary);">
              {{ footerSettings?.footer_text || 'Hostel Maintenance & Support Portal' }}
            </h4>
            <div style="display: flex; justify-content: center; align-items: center; gap: 14px; font-size: 12px; color: var(--text-muted); flex-wrap: wrap; margin-bottom: 10px;">
              <span>📧 {{ footerSettings?.footer_email || 'support@hostelhub.com' }}</span>
              <span>·</span>
              <span>📞 {{ footerSettings?.footer_phone || '+91 98765 43210' }}</span>
            </div>
            <p style="margin: 0; font-size: 11px; font-weight: 700; color: var(--text-muted); line-height: 1.5;">
              Developed by HostelHub Engineering Team 💻 · {{ footerSettings?.footer_copyright || '© 2026 HostelHub. All rights reserved.' }}
            </p>
          </div>

        </div>ar(--text-muted);">
              Developed by HostelHub Engineering Team 🏢 · © 2026 HostelHub. All rights reserved.
            </p>
          </div>

        </div>

        <!-- TAB 1: COMPLAINTS LIST -->
        <div *ngIf="activeTab === 'complaints'" class="tab-panel animate-fade">
          <h4 class="page-title">📋 Student Complaint Tickets</h4>

          <!-- New Unassigned Complaints Alert Section Banner -->
          <div *ngIf="getPendingCount() > 0 && filterStatus !== 'pending'" style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 14px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 22px;">🔔</span>
              <div>
                <strong style="font-size: 14px; color: #ef4444; display: block;">{{ getPendingCount() }} New Complaint(s) Awaiting Staff Assignment</strong>
                <span style="font-size: 12px; color: var(--text-muted);">Assign staff members to these new tickets to initiate maintenance.</span>
              </div>
            </div>
            <button type="button" class="btn btn-primary" style="background: #ef4444; color: white; font-size: 12px; padding: 7px 14px; border-radius: 6px; font-weight: 700; cursor: pointer;" (click)="filterStatus = 'pending'">
              View New Complaints ({{ getPendingCount() }}) →
            </button>
          </div>

          <!-- Filter Pills -->
          <div class="filter-pills">
            <button class="pill-btn" [class.active]="filterStatus === 'all'" (click)="filterStatus = 'all'">
              📁 All ({{ complaints.length }})
            </button>
            <button class="pill-btn" [class.active]="filterStatus === 'pending'" (click)="filterStatus = 'pending'">
              🆕 New Complaints ({{ getPendingCount() }})
            </button>
            <button class="pill-btn" [class.active]="filterStatus === 'assigned'" (click)="filterStatus = 'assigned'">
              ⏳ Assigned ({{ getAssignedOnlyCount() }})
            </button>
            <button class="pill-btn" [class.active]="filterStatus === 'in_progress'" (click)="filterStatus = 'in_progress'">
              ⚡ In Progress ({{ getInProgressOnlyCount() }})
            </button>
            <button class="pill-btn" [class.active]="filterStatus === 'resolved'" (click)="filterStatus = 'resolved'">
              ✅ Resolved ({{ getResolvedCount() }})
            </button>
          </div>

          <div class="complaints-list" *ngIf="filteredComplaints.length > 0; else noComplaints">
            <div class="card complaint-card" *ngFor="let comp of filteredComplaints" [class.expanded]="expandedComplaintId === comp.id">
              
              <div class="comp-summary" (click)="toggleExpand(comp.id)">
                <div class="comp-header">
                  <span class="badge" [class]="'badge-' + comp.status">{{ comp.status | titlecase }}</span>
                  <div class="comp-header-right">
                    <span class="priority-badge" [class]="'priority-' + (comp.priority || 'medium')">{{ getPriorityIcon(comp.priority) }} {{ comp.priority | titlecase }}</span>
                    <span class="comp-meta">Room {{ comp.student?.roomNumber }}</span>
                  </div>
                </div>
                <h4 class="comp-title">{{ comp.title }}</h4>
                <div class="comp-category-tag">
                  <span class="cat-tag-icon">{{ getCategoryIcon(comp.category) }}</span>
                  <span>{{ comp.category | titlecase }}</span>
                  <span class="comp-block-tag">{{ comp.student?.hostelBlock }}</span>
                </div>
                <p class="comp-desc-short" *ngIf="expandedComplaintId !== comp.id">
                  {{ comp.description | slice:0:60 }}{{ comp.description.length > 60 ? '...' : '' }}
                </p>
                <div class="tap-hint" *ngIf="expandedComplaintId !== comp.id">Tap to view details & assign 👇</div>
              </div>

              <!-- Expanded Details Area -->
              <div class="comp-details animate-fade" *ngIf="expandedComplaintId === comp.id">
                
                <!-- Progress Tracking Timeline -->
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
                      <span class="step-desc" *ngIf="!comp.staff">Awaiting Assignment</span>
                    </div>
                  </div>
                  <div class="timeline-step" [class.completed]="comp.status === 'in_progress' || comp.status === 'resolved'">
                    <div class="step-marker">{{ (comp.status === 'in_progress' || comp.status === 'resolved') ? '✓' : '3' }}</div>
                    <div class="step-content">
                      <span class="step-title">Work Progress</span>
                      <span class="step-desc" *ngIf="comp.status === 'in_progress' || comp.status === 'resolved'">In Progress</span>
                      <span class="step-desc" *ngIf="comp.status === 'pending' || comp.status === 'assigned'">Awaiting Start</span>
                    </div>
                  </div>
                  <div class="timeline-step" [class.completed]="comp.status === 'resolved'">
                    <div class="step-marker">{{ comp.status === 'resolved' ? '✓' : '4' }}</div>
                    <div class="step-content">
                      <span class="step-title">Resolution Status</span>
                      <span class="step-desc" *ngIf="comp.status === 'resolved'">✅ Job Completed</span>
                      <span class="step-desc" *ngIf="comp.status !== 'resolved'">Awaiting Resolution</span>
                    </div>
                  </div>
                </div>

                <p class="comp-desc-full"><strong>Details:</strong><br/>{{ comp.description }}</p>
                
                <div class="student-info-section">
                  <div class="info-label">👤 Raised By Student</div>
                  <p class="student-name"><strong>{{ comp.student?.name }}</strong></p>
                  <p class="student-room">Block: {{ comp.student?.hostelBlock }} • Room: {{ comp.student?.roomNumber }}</p>
                  <a [href]="'tel:' + comp.student?.phone" class="btn btn-call-student">
                    📞 Call Student ({{ comp.student?.phone }})
                  </a>
                </div>

                <!-- Photo attached by student -->
                <div class="photo-view" *ngIf="comp.photoUrl">
                  <p class="section-label">📸 Attachment from Student:</p>
                  <div class="image-container" (click)="openPhotoModal('https://hostelhub-0cyi.onrender.com' + comp.photoUrl)">
                    <img [src]="'https://hostelhub-0cyi.onrender.com' + comp.photoUrl" class="comp-img" alt="Student issue proof"/>
                    <div class="image-overlay">🔍 Tap to Zoom</div>
                  </div>
                </div>

                <!-- Assigned Staff Details -->
                <div class="assigned-staff-details" *ngIf="comp.staff">
                  <div class="staff-header">🛠️ Assigned Service Staff</div>
                  <div class="staff-body">
                    <p class="staff-name">Name: <strong>{{ comp.staff.name }}</strong></p>
                    <a [href]="'tel:' + comp.staff.phone" class="staff-call-btn">
                      📞 Call Staff ({{ comp.staff.phone }})
                    </a>
                  </div>
                </div>

                <!-- If resolved, show proof & feedback -->
                <div class="resolved-details-section" *ngIf="comp.status === 'resolved'">
                  <!-- Work Proof Image -->
                  <div class="photo-view" *ngIf="comp.completionPhotoUrl">
                    <p class="section-label text-success">✅ Resolution Work Proof:</p>
                    <div class="image-container" (click)="openPhotoModal('https://hostelhub-0cyi.onrender.com' + comp.completionPhotoUrl)">
                      <img [src]="'https://hostelhub-0cyi.onrender.com' + comp.completionPhotoUrl" class="comp-img" alt="Work completion proof"/>
                      <div class="image-overlay">🔍 Tap to Zoom</div>
                    </div>
                  </div>

                  <!-- Feedback Rating -->
                  <div class="resolution-feedback" *ngIf="comp.feedbackRating">
                    <div class="feedback-stars">⭐ Student Rating: <strong>{{ comp.feedbackRating }}/5</strong></div>
                    <div class="feedback-comment" *ngIf="comp.feedbackComment">
                      💬 <em>"{{ comp.feedbackComment }}"</em>
                    </div>
                  </div>
                </div>

                <!-- Assignment/Reassignment Action -->
                <div class="assignment-action">
                  <label class="assign-label">
                    {{ comp.staff ? '⚙️ Reassign Maintenance Staff:' : '🛠️ Assign Maintenance Staff:' }}
                  </label>
                  <div class="assign-row">
                    <!-- Custom Styled Dropdown -->
                    <div class="custom-dropdown-container">
                      <button type="button" class="form-input custom-dropdown-trigger" (click)="toggleDropdown(comp.id, $event)">
                        <span class="selected-text">{{ getSelectedStaffName(comp.id) || 'Select Staff Member' }}</span>
                        <span class="dropdown-arrow">▼</span>
                      </button>
                      
                      <div class="custom-dropdown-menu animate-fade" *ngIf="openDropdownId === comp.id">
                        <div class="custom-dropdown-item placeholder-item" (click)="selectStaffMember(comp.id, undefined)">
                          Select Staff Member
                        </div>
                        <div class="custom-dropdown-item" *ngFor="let s of staffWorkload" [class.selected]="assignedStaffMap[comp.id] === s.id" (click)="selectStaffMember(comp.id, s.id)">
                          {{ s.name.replace('Electrician', 'Elec').replace('Plumber', 'Plum').replace('Cleaner', 'Clean') }} ({{ s.activeCount }} task{{ s.activeCount === 1 ? '' : 's' }})
                        </div>
                      </div>
                    </div>

                    <button class="btn btn-primary assign-btn" [disabled]="!assignedStaffMap[comp.id] || assigning[comp.id] || justAssigned[comp.id]" (click)="assignStaff(comp.id)">
                      <span *ngIf="assigning[comp.id]">Assigning...</span>
                      <span *ngIf="!assigning[comp.id] && justAssigned[comp.id]">Assigned ✓</span>
                      <span *ngIf="!assigning[comp.id] && !justAssigned[comp.id]">{{ comp.staff ? 'Reassign' : 'Assign' }}</span>
                    </button>
                  </div>
                </div>

                <div class="comp-action-row">
                  <button class="btn btn-secondary btn-collapse" (click)="toggleExpand(null)">Collapse Detail 👆</button>
                  <button class="btn btn-delete-comp" (click)="deleteComplaint(comp.id)">🗑️ Delete Complaint</button>
                </div>
              </div>

            </div>
          </div>
          <ng-template #noComplaints>
            <div class="empty-state">
              <span class="empty-icon">📭</span>
              <p>No complaints matching the selected filter.</p>
            </div>
          </ng-template>
        </div>


        <!-- TAB 1: CREATE ANNOUNCEMENT -->
        <div *ngIf="activeTab === 'announcements'" class="tab-panel animate-fade">
          <h4 class="page-title">📣 Post Notice / Announcement</h4>
          
          <div class="form-container">
            <form (ngSubmit)="onNoticeSubmit()" #noticeForm="ngForm">
              <div *ngIf="noticeError" class="alert alert-danger">{{ noticeError }}</div>
              <div *ngIf="noticeSuccess" class="alert alert-success">{{ noticeSuccess }}</div>

              <div class="form-group">
                <label class="form-label" for="noticeTitle">Notice Title</label>
                <input 
                  type="text" 
                  id="noticeTitle" 
                  name="noticeTitle" 
                  class="form-input" 
                  placeholder="e.g. Water shortage notice"
                  [(ngModel)]="newNotice.title" 
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="targetBlock">Target Block</label>
                <select id="targetBlock" name="targetBlock" class="form-input" [(ngModel)]="newNotice.hostelBlock" required>
                  <option value="All">All Blocks</option>
                  <option value="Block-A">Block A</option>
                  <option value="Block-B">Block B</option>
                  <option value="Block-C">Block C</option>
                  <option value="Block-D">Block D</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="noticeContent">Notice Message</label>
                <textarea 
                  id="noticeContent" 
                  name="noticeContent" 
                  class="form-input" 
                  rows="5" 
                  placeholder="Write announcement body details..."
                  [(ngModel)]="newNotice.content" 
                  required
                ></textarea>
              </div>

              <!-- Optional Notice Photo Attachment -->
              <div class="form-group" style="margin-top: 12px;">
                <label class="form-label">📷 Attach Image (Optional)</label>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <input type="file" (change)="onNoticePhotoSelected($event)" accept="image/*" class="file-input" id="noticePhotoFile" style="display: none;"/>
                  <label for="noticePhotoFile" class="btn btn-secondary" style="cursor: pointer; font-size: 12px; padding: 8px 14px; display: inline-flex; align-items: center; gap: 6px;">
                    📷 Choose Photo
                  </label>
                  <span *ngIf="noticePhotoFile" style="font-size: 12px; color: var(--primary); font-weight: 600;">
                    ✓ {{ noticePhotoFile.name }}
                  </span>
                  <button type="button" *ngIf="noticePhotoFile" (click)="clearNoticePhoto()" style="background: none; border: none; color: #ef4444; font-size: 14px; cursor: pointer;">✕ Remove</button>
                </div>
                <div *ngIf="noticePhotoPreview" style="margin-top: 10px;">
                  <img [src]="noticePhotoPreview" style="max-width: 200px; max-height: 140px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-color);" />
                </div>
              </div>

              <button type="submit" class="btn btn-primary btn-submit" [disabled]="!noticeForm.form.valid || postingNotice || justPosted">
                <span *ngIf="postingNotice">Posting...</span>
                <span *ngIf="!postingNotice && justPosted">Posted ✓</span>
                <span *ngIf="!postingNotice && !justPosted">📢 Post Announcement</span>
              </button>
            </form>
          </div>

          <!-- Past Announcements History -->
          <div class="announcements-history" *ngIf="announcements.length > 0">
            <h5 class="history-title">📋 Previously Posted Notices</h5>
            <div class="notice-history-card" *ngFor="let a of announcements">
              <div class="notice-history-header">
                <div>
                  <span class="notice-block-tag">{{ a.hostelBlock === 'All' ? '🌐 All Blocks' : '🏠 ' + a.hostelBlock }}</span>
                  <span class="notice-date">{{ a.createdAt | date:'d MMM, h:mm a' }}</span>
                </div>
                <button class="btn-delete-notice" (click)="deleteAnnouncement(a.id)" title="Delete">🗑️</button>
              </div>
              <p class="notice-history-title">{{ a.title }}</p>
              <p class="notice-history-body">{{ a.content }}</p>

              <!-- Optional Notice Image -->
              <div *ngIf="a.photoUrl" style="margin-top: 10px;">
                <img [src]="getImageUrl(a.photoUrl)" (click)="openPhotoModal(getImageUrl(a.photoUrl))" style="max-width: 100%; max-height: 250px; border-radius: 10px; cursor: pointer; object-fit: cover; box-shadow: 0 2px 8px rgba(0,0,0,0.15);" />
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: ANALYTICS -->
        <div *ngIf="activeTab === 'analytics'" class="tab-panel animate-fade">
          <h4 class="page-title">📊 Hostel Analytics</h4>

          <!-- Quick Stats -->
          <div class="analytics-grid">
            <div class="analytics-box blue">
              <span class="a-icon">📋</span>
              <span class="a-val">{{ complaints.length }}</span>
              <span class="a-lbl">Total</span>
            </div>
            <div class="analytics-box yellow">
              <span class="a-icon">⏳</span>
              <span class="a-val">{{ getPendingCount() }}</span>
              <span class="a-lbl">Pending</span>
            </div>
            <div class="analytics-box indigo">
              <span class="a-icon">🔧</span>
              <span class="a-val">{{ getAssignedCount() }}</span>
              <span class="a-lbl">In Progress</span>
            </div>
            <div class="analytics-box green">
              <span class="a-icon">✅</span>
              <span class="a-val">{{ getResolvedCount() }}</span>
              <span class="a-lbl">Resolved</span>
            </div>
          </div>

          <!-- Priority Breakdown -->
          <div class="priority-breakdown-card">
            <h5>🚨 By Priority</h5>
            <div class="priority-bars">
              <div class="priority-row" *ngFor="let p of ['urgent','high','medium','low']">
                <span class="priority-badge" [class]="'priority-' + p">{{ getPriorityIcon(p) }} {{ p | titlecase }}</span>
                <div class="priority-bar-track">
                  <div class="priority-bar-fill" [class]="'fill-' + p" [style.width.%]="getPriorityPercent(p)"></div>
                </div>
                <span class="priority-count">{{ getPriorityCount(p) }}</span>
              </div>
            </div>
          </div>

          <!-- Staff Leaderboard -->
          <div class="leaderboard-card animate-fade" *ngIf="staffList.length > 0">
            <h5 class="leaderboard-title">🏆 Staff Performance Leaderboard</h5>
            <div class="leaderboard-list">
              <div class="leaderboard-item" *ngFor="let s of getStaffStats(); let i = index">
                <div class="leaderboard-rank">{{ i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i+1)+'.' }}</div>
                <div class="leaderboard-info">
                  <span class="leaderboard-name">{{ s.name }}</span>
                  <span class="leaderboard-meta">{{ s.completedCount }}/{{ s.totalAssigned }} resolved</span>
                </div>
                <div class="leaderboard-rating">
                  ⭐ {{ s.avgRating }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 4: EDIT PROFILE -->
        <div *ngIf="activeTab === 'my-profile'" class="tab-panel animate-fade">
          <h4 class="page-title">👤 Edit Profile</h4>
          
          <div class="form-container">
            <form (ngSubmit)="onProfileSubmit()" #profileForm="ngForm">
              <div *ngIf="profileError" class="alert alert-danger">{{ profileError }}</div>
              <div *ngIf="profileSuccess" class="alert alert-success">{{ profileSuccess }}</div>

              <!-- Profile Pic Section -->
              <div class="form-group" style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; margin-bottom: 20px;">
                <label class="form-label">Profile Picture</label>
                <div class="profile-pic-container" style="position: relative; width: 100px; height: 100px; border-radius: 50%; border: 2px solid var(--primary); overflow: hidden; background: #f1f5f9; display: flex; justify-content: center; align-items: center; box-shadow: var(--shadow-md);">
                  <img *ngIf="profilePreviewUrl" [src]="profilePreviewUrl" style="width: 100%; height: 100%; object-fit: cover;" />
                  <span *ngIf="!profilePreviewUrl" style="font-size: 40px; color: #94a3b8;">👨‍💼</span>
                </div>
                <input type="file" (change)="onProfilePicChange($event)" accept="image/*" class="file-input" id="profilePicFile" style="display: none;"/>
                <label for="profilePicFile" class="btn btn-secondary" style="cursor: pointer; font-size: 12px; padding: 6px 12px;">
                  📷 Choose Photo
                </label>
              </div>

              <div class="form-group">
                <label class="form-label" for="profileName">Full Name</label>
                <input 
                  type="text" 
                  id="profileName" 
                  name="profileName" 
                  class="form-input" 
                  [(ngModel)]="editUser.name" 
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="profilePhone">Phone Number</label>
                <input 
                  type="text" 
                  id="profilePhone" 
                  name="profilePhone" 
                  class="form-input" 
                  [(ngModel)]="editUser.phone" 
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="profileBio">Bio</label>
                <textarea 
                  id="profileBio" 
                  name="profileBio" 
                  class="form-input" 
                  rows="3" 
                  placeholder="Tell us about yourself..."
                  [(ngModel)]="editUser.bio"
                ></textarea>
              </div>

              <button type="submit" class="btn btn-primary btn-submit" [disabled]="!profileForm.form.valid || updatingProfile">
                <span *ngIf="updatingProfile">Updating...</span>
                <span *ngIf="!updatingProfile">Save Changes</span>
              </button>
            </form>
          </div>
        </div>

        <!-- TAB 5: WARDEN MESS MANAGEMENT -->
        <div *ngIf="activeTab === 'mess'" class="tab-panel animate-fade">
          <h4 class="page-title">🍴 Mess Admin Portal</h4>

          <div *ngIf="messSuccess" class="alert alert-success">{{ messSuccess }}</div>
          <div *ngIf="messError" class="alert alert-danger">{{ messError }}</div>

          <div class="mess-container">
            <!-- 1. Waste Minimizer Summary -->
            <div class="card mess-card">
              <h5>🚪 Today & Tomorrow's Skip Stats (Waste Minimizer)</h5>
              <p style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">
                Plan cooking quantity based on the number of students who reported skipping meals.
              </p>

              <div class="skip-summary-grid">
                <div class="skip-summary-day">
                  <h6>Today ({{ getTodayDateString() | date:'EEEE, MMM d' }})</h6>
                  <div class="skip-stats-row">
                    <div class="stat-badge">🍳 Breakfast: <strong>{{ getSkipCount(getTodayDateString(), 'breakfast') }}</strong> skipping</div>
                    <div class="stat-badge">🍛 Lunch: <strong>{{ getSkipCount(getTodayDateString(), 'lunch') }}</strong> skipping</div>
                    <div class="stat-badge">🍽️ Dinner: <strong>{{ getSkipCount(getTodayDateString(), 'dinner') }}</strong> skipping</div>
                  </div>
                </div>

                <div class="skip-summary-day">
                  <h6>Tomorrow ({{ getTomorrowDateString() | date:'EEEE, MMM d' }})</h6>
                  <div class="skip-stats-row">
                    <div class="stat-badge">🍳 Breakfast: <strong>{{ getSkipCount(getTomorrowDateString(), 'breakfast') }}</strong> skipping</div>
                    <div class="stat-badge">🍛 Lunch: <strong>{{ getSkipCount(getTomorrowDateString(), 'lunch') }}</strong> skipping</div>
                    <div class="stat-badge">🍽️ Dinner: <strong>{{ getSkipCount(getTomorrowDateString(), 'dinner') }}</strong> skipping</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Menu Management Editor -->
            <div class="card mess-card">
              <h5>📅 Edit Weekly Mess Menu</h5>
              <p style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">
                Modify meal menu items for Monday through Sunday. Any changes update student portals in real-time.
              </p>

              <div class="menu-editor-list">
                <div class="menu-edit-row" *ngFor="let m of messMenu">
                  <div class="menu-edit-day-name">{{ m.dayOfWeek }}</div>
                  
                  <div class="menu-edit-inputs">
                    <div class="edit-input-group">
                      <label>🍳 Breakfast</label>
                      <input type="text" [(ngModel)]="m.breakfast" class="form-input text-sm" />
                    </div>
                    <div class="edit-input-group">
                      <label>🍛 Lunch</label>
                      <input type="text" [(ngModel)]="m.lunch" class="form-input text-sm" />
                    </div>
                    <div class="edit-input-group">
                      <label>🍽️ Dinner</label>
                      <input type="text" [(ngModel)]="m.dinner" class="form-input text-sm" />
                    </div>
                    
                    <button (click)="saveMenuDay(m)" class="btn btn-primary btn-save-menu-day" [disabled]="savingMenuId === m.id">
                      {{ savingMenuId === m.id ? 'Saving...' : 'Save Day Menu ✓' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Student Feedback Reports -->
            <div class="card mess-card">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
                <h5 style="margin: 0;">⭐ Student Mess Food Feedback</h5>
                <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">Click card to filter by meal type</span>
              </div>
              
              <!-- Metrics Cards (Interactive Click-to-Filter by Meal) -->
              <div class="feedback-metrics" *ngIf="feedbackStats">
                <div 
                  class="metric-box" 
                  [style.border]="selectedMealFilter === 'all' ? '2px solid #b31031' : '1px solid var(--border-color)'"
                  [style.background]="selectedMealFilter === 'all' ? 'rgba(179, 16, 49, 0.08)' : 'var(--bg-card)'"
                  style="cursor: pointer; transition: all 0.2s ease; border-radius: 12px; padding: 10px;"
                  (click)="filterByMeal('all')"
                >
                  <div class="metric-val" style="font-weight: 800; font-size: 16px; color: #b31031;">⭐ {{ feedbackStats.overallAvg }}</div>
                  <div class="metric-lbl" style="font-size: 10.5px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">All Reviews</div>
                </div>

                <div 
                  class="metric-box" 
                  [style.border]="selectedMealFilter === 'breakfast' ? '2px solid #b31031' : '1px solid var(--border-color)'"
                  [style.background]="selectedMealFilter === 'breakfast' ? 'rgba(179, 16, 49, 0.08)' : 'var(--bg-card)'"
                  style="cursor: pointer; transition: all 0.2s ease; border-radius: 12px; padding: 10px;"
                  (click)="filterByMeal('breakfast')"
                >
                  <div class="metric-val" style="font-weight: 800; font-size: 16px; color: var(--text-primary);">🍳 {{ feedbackStats.breakfastAvg }}</div>
                  <div class="metric-lbl" style="font-size: 10.5px; font-weight: 700; color: var(--text-muted); margin-top: 2px;">Breakfast</div>
                </div>

                <div 
                  class="metric-box" 
                  [style.border]="selectedMealFilter === 'lunch' ? '2px solid #b31031' : '1px solid var(--border-color)'"
                  [style.background]="selectedMealFilter === 'lunch' ? 'rgba(179, 16, 49, 0.08)' : 'var(--bg-card)'"
                  style="cursor: pointer; transition: all 0.2s ease; border-radius: 12px; padding: 10px;"
                  (click)="filterByMeal('lunch')"
                >
                  <div class="metric-val" style="font-weight: 800; font-size: 16px; color: var(--text-primary);">🍛 {{ feedbackStats.lunchAvg }}</div>
                  <div class="metric-lbl" style="font-size: 10.5px; font-weight: 700; color: var(--text-muted); margin-top: 2px;">Lunch</div>
                </div>

                <div 
                  class="metric-box" 
                  [style.border]="selectedMealFilter === 'dinner' ? '2px solid #b31031' : '1px solid var(--border-color)'"
                  [style.background]="selectedMealFilter === 'dinner' ? 'rgba(179, 16, 49, 0.08)' : 'var(--bg-card)'"
                  style="cursor: pointer; transition: all 0.2s ease; border-radius: 12px; padding: 10px;"
                  (click)="filterByMeal('dinner')"
                >
                  <div class="metric-val" style="font-weight: 800; font-size: 16px; color: var(--text-primary);">🍽️ {{ feedbackStats.dinnerAvg }}</div>
                  <div class="metric-lbl" style="font-size: 10.5px; font-weight: 700; color: var(--text-muted); margin-top: 2px;">Dinner</div>
                </div>
              </div>

              <!-- Dual Filter Bar: Hostel Block Filter Dropdown + Meal Filter Badge -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; margin-bottom: 12px; gap: 10px; flex-wrap: wrap;">
                <!-- Hostel Block Filter Dropdown -->
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-size: 12px; font-weight: 700; color: var(--text-muted);">🏠 Hostel:</span>
                  <select 
                    class="form-input" 
                    [(ngModel)]="selectedHostelFilter" 
                    (change)="cdr.detectChanges()"
                    style="height: 36px; padding: 0 10px; font-size: 12px; font-weight: 700; border-radius: 8px; background: var(--bg-muted); border: 1px solid var(--border-color); color: var(--text-primary); cursor: pointer;"
                  >
                    <option value="all">🌐 All Hostels</option>
                    <option value="Boys Hostel 1">🏠 Boys Hostel 1</option>
                    <option value="Boys Hostel 2">🏠 Boys Hostel 2</option>
                    <option value="Girls Hostel 1">🏠 Girls Hostel 1</option>
                    <option value="Girls Hostel 2">🏠 Girls Hostel 2</option>
                  </select>
                </div>

                <!-- Active Meal Filter Badge Indicator -->
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-size: 11px; font-weight: 700; color: var(--text-muted);">Filtered:</span>
                  <span style="background: rgba(179, 16, 49, 0.12); color: #b31031; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(179, 16, 49, 0.2);">
                    {{ selectedMealFilter === 'all' ? 'ALL REVIEWS (' + filteredFeedbacks.length + ')' : (selectedMealFilter | uppercase) + ' (' + filteredFeedbacks.length + ')' }}
                  </span>
                  <button *ngIf="selectedMealFilter !== 'all' || selectedHostelFilter !== 'all'" (click)="selectedMealFilter = 'all'; selectedHostelFilter = 'all'; cdr.detectChanges()" style="background: none; border: none; color: #ef4444; font-size: 11px; font-weight: 700; cursor: pointer; text-decoration: underline;">Reset ✕</button>
                </div>
              </div>

              <!-- Reviews List Filtered -->
              <div class="comments-list" *ngIf="filteredFeedbacks.length > 0; else noReviews">
                <div class="comment-item" *ngFor="let f of filteredFeedbacks">
                  <div class="comment-header">
                    <span class="rating-stars">⭐ {{ f.rating }}/5</span>
                    <span class="comment-meal">{{ f.mealType | titlecase }}</span>
                    <span class="comment-date">{{ (f.createdAt || f.date) | date:'MMM d, y, h:mm a' }}</span>
                  </div>
                  <p class="comment-text" *ngIf="f.comment">"{{ f.comment }}"</p>
                  <div *ngIf="f.photoUrl || f.photo_url" style="margin-top: 8px;">
                    <img [src]="getImageUrl(f.photoUrl || f.photo_url)" style="max-width: 100%; max-height: 200px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-color); cursor: pointer;" (click)="openPhotoModal(getImageUrl(f.photoUrl || f.photo_url))" (error)="onImgError($event)" alt="Mess food photo" />
                  </div>
                  <div class="comment-author">
                    👨‍🎓 {{ f.student?.name || 'Student' }} · Room {{ f.student?.roomNumber || 'N/A' }} · {{ f.student?.hostelBlock || 'Hostel Block' }}
                  </div>
                </div>
              </div>
              <ng-template #noReviews>
                <p style="font-size:12px; color:var(--text-muted); text-align:center; padding:12px 0;">No student reviews submitted yet.</p>
              </ng-template>
            </div>
          </div>
        </div>

        <!-- TAB 6: WARDEN ATTENDANCE ROLL CALL -->
        <div *ngIf="activeTab === 'attendance'" class="tab-panel animate-fade">
          <h4 class="page-title">📅 Daily Roll Call Attendance</h4>

          <div *ngIf="attendanceSuccess" class="alert alert-success">{{ attendanceSuccess }}</div>
          <div *ngIf="attendanceError" class="alert alert-danger">{{ attendanceError }}</div>

          <div class="mess-container">
            <!-- Attendance Control Bar -->
            <div class="card mess-card">
              <h5>⚙️ Attendance Controls</h5>
              
              <div class="form-group" style="margin-top: 10px;">
                <label class="form-label" for="attDate">Roll Call Date</label>
                <input 
                  type="date" 
                  id="attDate" 
                  name="attDate" 
                  class="form-input" 
                  [(ngModel)]="rollCallDate" 
                  (change)="loadDailyRollCall()"
                  required 
                />
              </div>

              <!-- Search and Filter Row -->
              <div style="display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 200px;">
                  <input 
                    type="text" 
                    class="form-input" 
                    placeholder="🔍 Search Student by Name or Room..." 
                    [(ngModel)]="searchStudentQuery" 
                  />
                </div>
                <div>
                  <select class="form-input" [(ngModel)]="filterHostelBlock">
                    <option value="">All Blocks</option>
                    <option value="Block-A">Block A</option>
                    <option value="Block-B">Block B</option>
                    <option value="Block-C">Block C</option>
                    <option value="Block-D">Block D</option>
                  </select>
                </div>
              </div>

              <!-- Bulk Action Row -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; border-top: 1px dashed var(--border-color); padding-top: 12px;">
                <button type="button" class="btn btn-secondary" style="font-size: 11.5px; padding: 6px 12px;" (click)="markAllPresent()">
                  ✅ Mark All Present
                </button>
                
                <button type="button" class="btn btn-primary" [disabled]="savingAttendance || rollCallStudents.length === 0" (click)="saveDailyAttendance()">
                  {{ savingAttendance ? 'Saving Attendance...' : '💾 Save Attendance Roll Call' }}
                </button>
              </div>
            </div>

            <!-- Student List Card -->
            <div class="card mess-card" style="padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h5>👨‍🎓 Students List</h5>
                <span class="day-badge">{{ filteredStudents.length }} student(s)</span>
              </div>

              <div *ngIf="isLoadingRollCall" class="skeleton-list">
                <div class="skeleton skeleton-card"></div>
              </div>

              <div class="comments-list" *ngIf="!isLoadingRollCall">
                <div class="comment-item" *ngFor="let s of filteredStudents" style="flex-direction: column; gap: 8px; padding: 14px;">
                  
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
                    <div>
                      <strong style="font-size: 14px; color: var(--text-primary);">{{ s.name }}</strong>
                      <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">
                        🏠 {{ s.hostelBlock }} · Room {{ s.roomNumber }}
                      </div>
                    </div>
                    
                    <!-- Roll Call Toggle Buttons -->
                    <div style="display: flex; gap: 4px;">
                      <button 
                        type="button" 
                        class="pill-btn" 
                        [class.active]="attendanceMarkMap[s.id] === 'present'"
                        (click)="attendanceMarkMap[s.id] = 'present'"
                        style="padding: 4px 10px; font-size: 11px; border-radius: 4px;"
                      >
                        Present
                      </button>
                      <button 
                        type="button" 
                        class="pill-btn" 
                        [class.active]="attendanceMarkMap[s.id] === 'absent'"
                        (click)="attendanceMarkMap[s.id] = 'absent'"
                        style="padding: 4px 10px; font-size: 11px; border-radius: 4px;"
                      >
                        Absent
                      </button>
                      <button 
                        type="button" 
                        class="pill-btn" 
                        [class.active]="attendanceMarkMap[s.id] === 'outing'"
                        (click)="attendanceMarkMap[s.id] = 'outing'"
                        style="padding: 4px 10px; font-size: 11px; border-radius: 4px;"
                      >
                        Outing
                      </button>
                    </div>
                  </div>

                  <!-- Optional Remarks Box -->
                  <div style="width: 100%;">
                    <input 
                      type="text" 
                      class="form-input text-sm" 
                      style="height: 28px; font-size: 11.5px; padding: 4px 8px;" 
                      placeholder="Remarks (e.g. late entry, sick, went home)..."
                      [(ngModel)]="attendanceRemarksMap[s.id]" 
                    />
                  </div>

                </div>
              </div>

              <div *ngIf="!isLoadingRollCall && filteredStudents.length === 0" class="empty-state">
                <span class="empty-icon">📭</span>
                <p>No active students match the query.</p>
              </div>
            </div>
          </div>
        </div>



      </div>

      <!-- Bottom Navigation Dock (displayed as floating glass top-nav by global CSS) -->
      <div class="bottom-tabs">
        <button type="button" class="tab-item" [class.active]="activeTab === 'home'" (click)="switchTab('home')">
          <span class="tab-icon">🏠</span>
          <span>Home</span>
        </button>
        <button type="button" class="tab-item" [class.active]="activeTab === 'complaints'" (click)="switchTab('complaints')">
          <span class="tab-icon">
            📋
            <span class="tab-badge animate-scale" *ngIf="getPendingCount() > 0">{{ getPendingCount() }}</span>
          </span>
          <span>Tickets</span>
        </button>
        <button type="button" class="tab-item" [class.active]="activeTab === 'announcements'" (click)="onAnnouncementsTab()">
          <span class="tab-icon">📢</span>
          <span>Notices</span>
        </button>
        <button type="button" class="tab-item" [class.active]="activeTab === 'mess'" (click)="switchTab('mess'); loadMessData()">
          <span class="tab-icon">🍽️</span>
          <span>Mess</span>
        </button>
        <button type="button" class="tab-item" [class.active]="activeTab === 'users'" (click)="switchTab('users')">
          <span class="tab-icon">👥</span>
          <span>Students</span>
        </button>
        <button type="button" class="tab-item" [class.active]="activeTab === 'approvals'" (click)="switchTab('approvals')">
          <span class="tab-icon">⚡</span>
          <span>Approvals</span>
        </button>
        <button type="button" class="tab-item" [class.active]="activeTab === 'profile'" (click)="switchTab('profile'); initProfileEdit()">
          <span class="tab-icon">👤</span>
          <span>Profile</span>
        </button>
      </div><!-- /bottom-tabs -->
    </div><!-- /dashboard-container -->

  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
    }

    /* ── WARDEN HOME DASHBOARD ANIMATED STYLES ── */
    .warden-hero-card {
      position: relative;
      background: linear-gradient(135deg, #b31031 0%, #8a0d24 50%, #4a0412 100%);
      border-radius: var(--radius-xl);
      padding: 24px;
      margin-bottom: 16px;
      overflow: hidden;
      box-shadow: 0 10px 28px rgba(179, 16, 49, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .hero-bg-glow {
      position: absolute;
      top: -50px;
      right: -50px;
      width: 180px;
      height: 180px;
      background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%);
      border-radius: 50%;
      pointer-events: none;
      animation: pulseGlow 4s infinite alternate ease-in-out;
    }
    .hero-content { position: relative; z-index: 2; color: #ffffff; }
    .hero-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(4px);
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    .hero-title {
      font-size: 20px;
      font-weight: 900;
      margin-bottom: 4px;
      letter-spacing: -0.3px;
    }
    .hero-subtitle {
      font-size: 12.5px;
      opacity: 0.9;
      margin-bottom: 18px;
    }
    .hero-quick-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .hero-btn {
      padding: 9px 16px;
      font-size: 12.5px;
      font-weight: 700;
      border-radius: var(--radius-md);
      cursor: pointer;
      border: none;
      transition: all var(--transition-fast);
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .primary-glow {
      background: #ffffff;
      color: var(--primary-dark);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
    }
    .primary-glow:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.3); }
    .glass-btn {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
      backdrop-filter: blur(6px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .glass-btn:hover { background: rgba(255, 255, 255, 0.25); transform: translateY(-2px); }

    /* Live Marquee Ticker */
    .live-marquee-container {
      display: flex;
      align-items: center;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      overflow: hidden;
      margin-bottom: 18px;
      box-shadow: var(--shadow-sm);
    }
    .marquee-tag {
      background: var(--primary);
      color: #ffffff;
      font-size: 10.5px;
      font-weight: 800;
      padding: 8px 12px;
      white-space: nowrap;
      flex-shrink: 0;
      letter-spacing: 0.5px;
    }
    .marquee-track {
      flex: 1;
      overflow: hidden;
      white-space: nowrap;
      position: relative;
      padding: 6px 0;
    }
    .marquee-content {
      display: inline-block;
      white-space: nowrap;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary);
      animation: marqueeScroll 18s linear infinite;
      padding-left: 100%;
    }
    .marquee-content:hover { animation-play-state: paused; }
    .marquee-dot { margin: 0 10px; color: var(--primary); font-weight: 900; }

    /* 2x2 Grid Stats Cards with Floating Animation */
    .dashboard-grid-2x2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 18px;
    }
    .grid-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xl);
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      transition: all var(--transition-normal);
      box-shadow: var(--shadow-sm);
      position: relative;
      overflow: hidden;
    }
    .grid-card:hover {
      transform: translateY(-4px);
      border-color: var(--primary);
      box-shadow: var(--shadow-md);
    }
    .float-card-1 { animation: floatSlow 6s ease-in-out infinite; }
    .float-card-2 { animation: floatSlow 6s ease-in-out infinite 1.5s; }
    .float-card-3 { animation: floatSlow 6s ease-in-out infinite 3s; }
    .float-card-4 { animation: floatSlow 6s ease-in-out infinite 4.5s; }

    .card-icon-wrapper {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }
    .red-glow { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
    .orange-glow { background: rgba(249, 115, 22, 0.15); color: #f97316; }
    .purple-glow { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
    .green-glow { background: rgba(34, 197, 94, 0.15); color: #22c55e; }

    .card-info { margin-left: 10px; flex: 1; }
    .card-value {
      font-size: 22px;
      font-weight: 900;
      color: var(--text-primary);
      line-height: 1;
      margin-bottom: 4px;
    }
    .card-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      margin: 0;
    }
    .card-arrow {
      font-size: 16px;
      color: var(--text-muted);
      transition: transform var(--transition-fast);
    }
    .grid-card:hover .card-arrow { transform: translateX(3px); color: var(--primary); }

    /* Quick Announcement Banner */
    .quick-announcement-banner {
      background: var(--bg-card);
      border: 1px dashed var(--primary);
      border-radius: var(--radius-xl);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 18px;
    }
    .banner-text h4 { font-size: 14px; font-weight: 800; color: var(--text-primary); margin-bottom: 2px; }
    .banner-text p { font-size: 11.5px; color: var(--text-muted); margin: 0; }
    .btn-post-quick {
      background: var(--gradient-btn);
      color: #ffffff;
      font-size: 12px;
      font-weight: 800;
      padding: 9px 15px;
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
      white-space: nowrap;
      box-shadow: 0 4px 10px rgba(179, 16, 49, 0.25);
      transition: transform var(--transition-fast);
    }
    .btn-post-quick:hover { transform: scale(1.03); }

    /* Home Analytics Preview */
    .home-analytics-preview {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xl);
      padding: 18px;
      margin-bottom: 18px;
    }
    .preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .preview-header h5 { font-size: 14px; font-weight: 800; color: var(--text-primary); margin: 0; }
    .link-btn {
      background: none;
      border: none;
      color: var(--primary);
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }
    .analytics-mini-bars { display: flex; flex-direction: column; gap: 10px; }
    .mini-bar-item { display: flex; flex-direction: column; gap: 4px; }
    .bar-top { display: flex; justify-content: space-between; font-size: 11.5px; color: var(--text-secondary); font-weight: 600; }
    .bar-track { height: 7px; background: var(--bg-muted); border-radius: 10px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 10px; transition: width 0.8s ease-in-out; }
    .bar-fill.red { background: #ef4444; }
    .bar-fill.orange { background: #f97316; }
    .bar-fill.green { background: #22c55e; }

    /* ── KEYFRAME ANIMATIONS ── */
    @keyframes marqueeScroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-100%); }
    }
    @keyframes floatSlow {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    @keyframes pulseGlow {
      0% { opacity: 0.3; transform: scale(1); }
      100% { opacity: 0.7; transform: scale(1.15); }
    }

    /* Premium Header */
    .header {
      background: var(--bg-header);
      color: #f8fafc;
      padding: 14px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(99, 102, 241, 0.3);
      box-shadow: 0 2px 20px rgba(0,0,0,0.2);
      position: sticky;
      top: 0;
      z-index: 200;
    }
    .header-actions { display: flex; align-items: center; gap: 6px; }
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .avatar-ring {
      width: 44px;
      height: 44px;
      background: rgba(99, 102, 241, 0.2);
      border: 1.5px solid var(--primary);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
    }
    .avatar {
      font-size: 22px;
    }
    h3 {
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.2px;
      color: #f8fafc;
    }
    .user-meta {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 1px;
    }
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

    /* Tab content areas */
    .tab-content-area {
      flex: 1;
      padding: 16px;
      padding-bottom: 84px;
      overflow-y: auto;
      background-color: var(--bg-body);
    }
    .tab-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .page-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 16px;
      letter-spacing: -0.3px;
    }

    /* Animations */
    .animate-fade {
      animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Filter pills */
    .filter-pills {
      display: flex;
      gap: 8px;
      margin-bottom: 14px;
      overflow-x: auto;
      padding-bottom: 4px;
    }
    .pill-btn {
      background-color: var(--white);
      border: 1px solid var(--neutral-200);
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 20px;
      cursor: pointer;
      transition: var(--transition-fast);
      color: var(--neutral-600);
      white-space: nowrap;
    }
    .pill-btn.active {
      background-color: var(--primary);
      color: var(--white);
      border-color: var(--primary);
      box-shadow: var(--shadow-sm);
    }

    /* Complaint Cards & Expand details */
    .complaint-card {
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
      overflow: hidden;
      padding: 0;
    }
    .comp-summary {
      padding: 16px;
    }
    .comp-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .comp-meta {
      font-size: 11px;
      font-weight: 700;
      color: var(--neutral-500);
    }
    .comp-title {
      font-size: 14.5px;
      font-weight: 700;
      color: var(--neutral-900);
      margin-bottom: 4px;
    }
    .comp-category-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      background-color: var(--neutral-100);
      padding: 2px 8px;
      border-radius: 12px;
      margin-bottom: 8px;
      font-weight: 600;
      color: var(--neutral-600);
    }
    .comp-desc-short {
      font-size: 12.5px;
      color: var(--neutral-500);
      line-height: 1.4;
    }
    .tap-hint {
      font-size: 10px;
      color: var(--primary);
      font-weight: 700;
      text-align: right;
      margin-top: 8px;
    }

    /* Expanded Details Area */
    .comp-details {
      padding: 0 16px 16px 16px;
      border-top: 1px solid var(--neutral-100);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .comp-desc-full {
      font-size: 13px;
      color: var(--neutral-700);
      line-height: 1.45;
      padding-top: 12px;
    }

    /* Student info card */
    .student-info-section {
      background-color: var(--bg-muted);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 12px;
    }
    .info-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--neutral-500);
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .student-name {
      font-size: 13px;
      color: var(--neutral-800);
    }
    .student-room {
      font-size: 11.5px;
      color: var(--neutral-500);
      margin-bottom: 8px;
    }
    .btn-call-student {
      background-color: var(--white);
      border: 1.5px solid var(--primary);
      color: var(--primary);
      padding: 6px 12px;
      font-size: 11.5px;
      font-weight: 700;
      border-radius: var(--radius-sm);
      display: inline-flex;
      width: auto;
      text-decoration: none;
      transition: var(--transition-fast);
      box-shadow: var(--shadow-sm);
    }
    .btn-call-student:hover {
      background-color: var(--primary);
      color: var(--white);
    }

    /* Images */
    .section-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--neutral-500);
      margin-bottom: 4px;
    }
    .image-container {
      position: relative;
      border-radius: var(--radius-md);
      overflow: hidden;
      cursor: zoom-in;
    }
    .comp-img {
      width: 100%;
      max-height: 160px;
      object-fit: cover;
      display: block;
      border: 1px solid var(--neutral-200);
      border-radius: var(--radius-md);
      transition: transform 0.25s ease;
    }
    .image-container:hover .comp-img {
      transform: scale(1.02);
    }
    .image-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      background: rgba(15, 23, 42, 0.6);
      color: var(--white);
      text-align: center;
      font-size: 10px;
      font-weight: 700;
      padding: 4px 0;
      backdrop-filter: blur(2px);
    }

    /* Staff details */
    .assigned-staff-details {
      background-color: var(--primary-light);
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: var(--radius-md);
      padding: 12px;
      margin-top: 0;
    }
    .staff-header {
      font-size: 11px;
      font-weight: 700;
      color: var(--primary-dark);
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .staff-body {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .staff-name {
      font-size: 13px;
      color: var(--neutral-800);
    }
    .staff-call-btn {
      background-color: var(--white);
      border: 1px solid var(--primary);
      color: var(--primary);
      padding: 6px 12px;
      font-size: 11.5px;
      font-weight: 700;
      border-radius: var(--radius-sm);
      text-decoration: none;
      display: inline-flex;
      transition: var(--transition-fast);
      box-shadow: var(--shadow-sm);
    }
    .staff-call-btn:hover {
      background-color: var(--primary);
      color: var(--white);
    }

    /* Feedback & Resolution details */
    .resolved-details-section {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: var(--radius-md);
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .text-success {
      color: #166534 !important;
    }
    .resolution-feedback {
      border-top: 1px dashed #bbf7d0;
      padding-top: 8px;
    }
    .feedback-stars {
      font-size: 12px;
      color: #15803d;
      font-weight: 700;
    }
    .feedback-comment {
      font-size: 12px;
      color: #374151;
      background-color: var(--white);
      border-radius: 6px;
      padding: 6px 10px;
      margin-top: 4px;
      border: 1px solid #dcfce7;
    }

    /* Assign Panel */
    .assignment-action {
      margin-top: 4px;
      border-top: 1.5px dashed var(--neutral-200);
      padding-top: 12px;
    }
    .assign-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--neutral-600);
      text-transform: uppercase;
      display: block;
      margin-bottom: 6px;
    }
    .assign-row {
      display: flex;
      gap: 8px;
    }
    .select-staff {
      flex: 1;
      padding: 10px 12px;
      font-size: 13.5px;
      direction: rtl;
    }
    .select-staff option {
      direction: ltr;
    }
    .assign-btn {
      width: auto;
      padding: 10px 18px;
      font-size: 13px;
      box-shadow: 0 4px 6px rgba(99, 102, 241, 0.15);
    }
    @media (max-width: 767px) {
      .assign-row {
        flex-direction: column !important;
        gap: 10px !important;
      }
      .select-staff {
        width: 100% !important;
        padding: 12px 14px !important;
      }
      .assign-btn {
        width: 100% !important;
        padding: 12px !important;
      }
    }

    .btn-submit {
      margin-top: 10px;
      box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
    }
    .btn-collapse {
      margin-top: 4px;
    }

    .empty-state {
      text-align: center;
      color: var(--neutral-400);
      padding: 40px 20px;
      font-size: 14px;
    }
    .empty-icon {
      font-size: 32px;
      display: block;
      margin-bottom: 8px;
    }

    .alert {
      padding: 12px;
      border-radius: var(--radius-md);
      font-size: 14px;
      margin-bottom: 16px;
      font-weight: 500;
    }
    .alert-danger { background-color: #fee2e2; color: #b91c1c; }
    .alert-success { background-color: #d1fae5; color: #047857; }

    /* Live Toast Notification */
    .toast-alert {
      position: fixed;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      width: calc(100% - 32px);
      max-width: 500px;
      background-color: #0f172a;
      color: var(--white);
      border-radius: var(--radius-lg);
      padding: 14px 18px;
      box-shadow: var(--shadow-xl);
      z-index: 2000;
      animation: slideDown 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28);
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .toast-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .toast-bell {
      font-size: 24px;
    }
    .toast-text strong {
      font-size: 11px;
      color: var(--primary-light);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .toast-text p {
      font-size: 12px;
      color: #e2e8f0;
      margin-top: 2px;
      line-height: 1.35;
    }
    @keyframes slideDown {
      from { transform: translateY(-30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* Zoom Photo Modal styles */
    .photo-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(15, 23, 42, 0.92);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(8px);
      animation: modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .modal-wrapper {
      position: relative;
      max-width: 90%;
      max-height: 85%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .close-modal {
      position: absolute;
      top: -46px;
      right: 0;
      background: none;
      border: none;
      color: var(--white);
      font-size: 36px;
      cursor: pointer;
      line-height: 1;
      padding: 4px;
    }
    .zoomed-image {
      max-width: 100%;
      max-height: 75vh;
      border-radius: var(--radius-lg);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      object-fit: contain;
    }
    @keyframes modalFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Priority Badges */
    .priority-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .priority-urgent { background-color: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
    .priority-high { background-color: #ffedd5; color: #c2410c; border: 1px solid #fdba74; }
    .priority-medium { background-color: #fef9c3; color: #854d0e; border: 1px solid #fde047; }
    .priority-low { background-color: #dcfce7; color: #15803d; border: 1px solid #86efac; }

    .comp-header-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 3px;
    }
    .comp-block-tag {
      font-size: 10px;
      font-weight: 700;
      background-color: #e0e7ff;
      color: #4338ca;
      padding: 2px 6px;
      border-radius: 8px;
      margin-left: 6px;
    }

    /* Analytics Tab */
    .analytics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 16px;
    }
    .analytics-box {
      border-radius: var(--radius-md);
      padding: 14px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      border: 1px solid transparent;
    }
    .analytics-box.blue { background: #dbeafe; border-color: #93c5fd; }
    .analytics-box.yellow { background: #fef9c3; border-color: #fde047; }
    .analytics-box.indigo { background: #e0e7ff; border-color: #a5b4fc; }
    .analytics-box.green { background: #dcfce7; border-color: #86efac; }
    .a-icon { font-size: 20px; }
    .a-val { font-size: 22px; font-weight: 800; color: #1e293b; }
    .a-lbl { font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; }

    /* Priority breakdown */
    .priority-breakdown-card {
      background: var(--white);
      border: 1px solid var(--neutral-200);
      border-radius: var(--radius-md);
      padding: 14px;
      margin-bottom: 16px;
      box-shadow: var(--shadow-sm);
    }
    .priority-breakdown-card h5 { font-size: 13px; font-weight: 700; margin-bottom: 12px; color: var(--text-primary); }
    .priority-bars { display: flex; flex-direction: column; gap: 8px; }
    .priority-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .priority-row .priority-badge { min-width: 72px; justify-content: center; }
    .priority-bar-track {
      flex: 1;
      background: var(--bg-muted);
      border-radius: 6px;
      height: 8px;
      overflow: hidden;
    }
    .priority-bar-fill {
      height: 100%;
      border-radius: 6px;
      transition: width 0.6s ease;
      min-width: 2px;
    }
    .fill-urgent { background: #ef4444; }
    .fill-high { background: #f97316; }
    .fill-medium { background: #eab308; }
    .fill-low { background: #22c55e; }
    .priority-count { font-size: 12px; font-weight: 700; color: #475569; min-width: 20px; text-align: right; }

    /* Announcements history */
    .announcements-history {
      margin-top: 20px;
    }
    .history-title {
      font-size: 13px;
      font-weight: 700;
      color: #374151;
      margin-bottom: 10px;
    }
    .notice-history-card {
      background: var(--white);
      border: 1px solid var(--neutral-200);
      border-radius: var(--radius-md);
      padding: 12px;
      margin-bottom: 10px;
      box-shadow: var(--shadow-sm);
    }
    .notice-history-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 6px;
    }
    .notice-block-tag {
      font-size: 11px;
      font-weight: 700;
      color: #4338ca;
      background: #e0e7ff;
      padding: 2px 7px;
      border-radius: 8px;
      display: inline-block;
    }
    .notice-date {
      font-size: 10px;
      color: #94a3b8;
      display: block;
      margin-top: 3px;
    }
    .btn-delete-notice {
      background: none;
      border: none;
      font-size: 16px;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background 0.2s;
      line-height: 1;
    }
    .btn-delete-notice:hover { background: #fee2e2; }
    .notice-history-title {
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 4px;
    }
    .notice-history-body {
      font-size: 12px;
      color: #64748b;
      line-height: 1.4;
    }

    /* Leaderboard rank */
    .leaderboard-rank { font-size: 18px; min-width: 28px; }
    .leaderboard-info { flex: 1; display: flex; flex-direction: column; }
    .leaderboard-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; }

    /* Complaint action row (collapse + delete) */
    .comp-action-row {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    }
    .btn-delete-comp {
      background: rgba(239,68,68,0.12);
      border: 1px solid rgba(239,68,68,0.35);
      color: #f87171;
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 700;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-family: var(--font-sans);
      transition: all 0.2s;
    }
    .btn-delete-comp:hover { background: #ef4444; color: white; }

    /* Enhanced Rich Footer Styling */
    .footer {
      background: var(--bg-card);
      border-top: 1px solid var(--border-color);
      padding: 24px 20px 30px;
      margin-top: 24px;
      width: 100%;
      box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.04);
    }
    .footer-container {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .footer-brand-section {
      text-align: center;
    }
    .footer-brand-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .brand-icon { font-size: 22px; }
    .brand-name {
      font-size: 18px;
      font-weight: 900;
      color: var(--text-primary);
      letter-spacing: -0.3px;
    }
    .brand-badge {
      font-size: 9.5px;
      font-weight: 800;
      background: var(--primary-light);
      color: var(--primary);
      padding: 2px 8px;
      border-radius: var(--radius-full);
      letter-spacing: 0.5px;
      border: 1px solid rgba(179, 16, 49, 0.2);
    }
    .footer-tagline {
      font-size: 12px;
      color: var(--text-secondary);
      max-width: 500px;
      margin: 0 auto;
      line-height: 1.4;
    }
    .footer-quick-nav {
      display: flex;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
      margin: 4px 0;
    }
    .nav-pill {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-secondary);
      background: var(--bg-muted);
      border: 1px solid var(--border-color);
      padding: 5px 12px;
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .nav-pill:hover {
      background: var(--primary-light);
      color: var(--primary);
      border-color: var(--primary);
      transform: translateY(-1px);
    }
    .footer-info-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    @media (max-width: 600px) {
      .footer-info-cards { grid-template-columns: 1fr; }
    }
    .footer-card {
      background: var(--bg-muted);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 12px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      text-align: left;
    }
    .emergency-card {
      background: rgba(239, 68, 68, 0.08);
      border-color: rgba(239, 68, 68, 0.25);
    }
    .f-card-icon { font-size: 20px; flex-shrink: 0; }
    .f-card-label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .f-card-val {
      display: block;
      font-size: 12px;
      font-weight: 800;
      color: var(--text-primary);
      margin-top: 1px;
    }
    .emergency-card .f-card-val { color: #ef4444; }
    .footer-bottom {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      border-top: 1px dashed var(--border-color);
      padding-top: 14px;
    }
    .system-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      color: var(--success);
    }
    .status-dot {
      width: 7px;
      height: 7px;
      background: var(--success);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--success);
    }
    .footer-copyright {
      font-size: 10.5px;
      color: var(--text-muted);
      text-align: center;
    }

    /* Warden Mess Management CSS */
    .mess-container { display: flex; flex-direction: column; gap: 20px; }
    .mess-card { border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-xl); padding: 20px; box-shadow: var(--shadow-sm); }
    
    /* Skip summary card */
    .skip-summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 10px; }
    @media(max-width: 600px) { .skip-summary-grid { grid-template-columns: 1fr; } }
    .skip-summary-day h6 { font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; border-left: 3px solid var(--primary); padding-left: 8px; }
    .skip-stats-row { display: flex; flex-direction: column; gap: 6px; }
    .stat-badge {
      background: var(--bg-muted);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 10px 14px;
      border-radius: var(--radius-md);
      font-size: 12px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .stat-badge strong { color: #ef4444; font-size: 13px; }

    /* Menu editor card */
    .menu-editor-list { display: flex; flex-direction: column; gap: 14px; margin-top: 10px; }
    .menu-edit-row {
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      background: var(--bg-muted);
      padding: 14px;
    }
    .menu-edit-day-name { font-size: 14px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; }
    .menu-edit-inputs { display: flex; flex-direction: column; gap: 8px; }
    .edit-input-group { display: flex; align-items: center; gap: 10px; }
    .edit-input-group label { font-size: 11.5px; font-weight: 700; color: var(--text-secondary); width: 85px; flex-shrink: 0; }
    .edit-input-group input { flex: 1; padding: 6px 10px; font-size: 12px; height: 32px; }
    .btn-save-menu-day { font-size: 11px; padding: 6px 12px; align-self: flex-end; margin-top: 4px; border-radius: var(--radius-sm); }

    /* Feedback metrics card */
    .feedback-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px; }
    @media(max-width: 500px) { .feedback-metrics { grid-template-columns: 1fr 1fr; } }
    .metric-box {
      background: var(--bg-muted);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .metric-val { font-size: 18px; font-weight: 800; color: var(--primary); }
    .metric-lbl { font-size: 9.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-top: 2px; }

    /* Comments review list */
    .comments-list { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
    .comment-item {
      padding: 12px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--bg-muted);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .comment-header { display: flex; gap: 10px; align-items: center; font-size: 11px; font-weight: 700; }
    .rating-stars { color: #fbbf24; }
    .comment-meal { color: var(--text-secondary); background: rgba(99,102,241,0.1); padding: 1px 6px; border-radius: 4px; }
    .comment-date { color: var(--text-muted); margin-left: auto; font-weight: 500; }
    .comment-text { font-size: 12.5px; color: var(--text-primary); line-height: 1.4; font-style: italic; }
    .comment-author { font-size: 10px; color: var(--text-muted); font-weight: 600; text-align: right; }

    /* Attendance Pill Buttons CSS */
    .pill-btn {
      background: var(--bg-muted);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      cursor: pointer;
      font-weight: 700;
      transition: all 0.2s;
      outline: none;
    }
    .pill-btn.active {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
    }

    /* Custom Dropdown Styling */
    .custom-dropdown-container {
      position: relative;
      flex: 1;
      width: 100%;
    }
    .custom-dropdown-trigger {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      cursor: pointer;
      background-color: var(--bg-input);
      text-align: left;
      font-size: 13.5px;
      padding: 10px 12px;
    }
    .custom-dropdown-trigger .selected-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      padding-right: 8px;
    }
    .dropdown-arrow {
      font-size: 10px;
      color: var(--text-muted);
      flex-shrink: 0;
    }
    .custom-dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 4px;
      background-color: var(--bg-card);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      max-height: 180px;
      overflow-y: auto;
    }
    .custom-dropdown-item {
      padding: 10px 14px;
      font-size: 13px;
      color: var(--text-primary);
      cursor: pointer;
      transition: background-color var(--transition-fast);
      text-align: left;
    }
    .custom-dropdown-item:hover {
      background-color: var(--bg-muted);
    }
    .custom-dropdown-item.selected {
      background-color: var(--primary-light);
      color: var(--primary);
      font-weight: 600;
    }
    .placeholder-item {
      color: var(--text-muted);
    }
  `]
})
export class WardenDashboardComponent implements OnInit, OnDestroy {
  user: User | null = null;
  activeTab: string = 'home';
  isSidebarOpen = false;

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.cdr.detectChanges();
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
    this.cdr.detectChanges();
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  onAvatarError(event: any): void {
    if (event && event.target) {
      event.target.style.display = 'none';
    }
  }
  
  editUser = { name: '', phone: '', bio: '' };
  profilePreviewUrl: string | null = null;
  selectedProfilePic: File | null = null;
  updatingProfile = false;
  profileError = '';
  profileSuccess = '';
  complaints: any[] = [];
  staffList: any[] = [];
  staffWorkload: any[] = [];
  announcements: any[] = [];
  assignedStaffMap: { [key: number]: number } = {};
  openDropdownId: number | null = null;
  unreadCounts: { [groupId: number]: number } = {};
  get totalUnreadChatCount(): number {
    return Object.values(this.unreadCounts).reduce((acc, val) => acc + val, 0);
  }
  assigning: { [key: number]: boolean } = {};

  filterStatus: string = 'all';
  expandedComplaintId: number | null = null;
  zoomPhotoUrl: string | null = null;

  newNotice = {
    title: '',
    content: '',
    hostelBlock: 'All'
  };
  postingNotice = false;
  noticeError = '';
  noticeSuccess = '';

  activeToast: LiveNotification | null = null;
  private notifSub!: Subscription;
  isDarkMode = false;
  justAssigned: { [id: number]: boolean } = {};
  justPosted = false;

  footerSettings: any = null;

  // Mess Management fields
  messMenu: any[] = [];
  feedbackStats: any = null;
  feedbacks: any[] = [];
  skipSummary: any = {};
  savingMenuId: number | null = null;
  messSuccess = '';
  messError = '';

  // Attendance Management fields
  rollCallDate = '';
  rollCallStudents: any[] = [];
  attendanceMarkMap: { [studentId: number]: 'present' | 'absent' | 'outing' } = {};
  attendanceRemarksMap: { [studentId: number]: string } = {};
  isLoadingRollCall = false;
  savingAttendance = false;
  searchStudentQuery = '';
  filterHostelBlock = '';
  attendanceSuccess = '';
  attendanceError = '';

  constructor(
    private authService: AuthService,
    private complaintService: ComplaintService,
    private socketService: SocketService,
    private router: Router,
    public cdr: ChangeDetectorRef,
    private messService: MessService,
    private attendanceService: AttendanceService
  ) {}



  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    const saved = localStorage.getItem('hh_dark_mode');
    if (saved === 'true') { this.isDarkMode = true; document.body.classList.add('dark-mode'); }
    this.loadComplaints();
    this.loadStaffList();
    this.loadStaffWorkload();
    this.loadFooterSettings();
    this.loadPublicSettings();

    this.notifSub = this.socketService.notification$.subscribe(notif => {
      if (notif) {
        this.activeToast = notif;
        this.loadComplaints();
        this.loadStaffWorkload();
        setTimeout(() => this.clearToast(), 3000);
      }
    });

    // Listen for real-time settings updates from Admin Panel
    this.socketService.onEvent('settings_updated', () => {
      this.loadFooterSettings();
      this.loadPublicSettings();
    });

    // Listen for real-time announcement deletion
    this.socketService.onEvent('announcement_deleted', (announcementId: number) => {
      this.announcements = this.announcements.filter(a => a.id !== announcementId);
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.notifSub) { this.notifSub.unsubscribe(); }
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
    this.complaintService.getWardenComplaints().subscribe({
      next: (res) => { this.complaints = res; this.cdr.detectChanges(); },
      error: (err) => { console.error(err); this.cdr.detectChanges(); }
    });
  }

  loadStaffList(): void {
    this.complaintService.getStaffList().subscribe({
      next: (res) => { this.staffList = res; this.cdr.detectChanges(); },
      error: (err) => { console.error(err); this.cdr.detectChanges(); }
    });
  }

  loadStaffWorkload(): void {
    this.complaintService.getStaffWorkload().subscribe({
      next: (res) => { this.staffWorkload = res; this.cdr.detectChanges(); },
      error: (err) => { console.error(err); this.cdr.detectChanges(); }
    });
  }

  loadAnnouncements(): void {
    this.complaintService.getAnnouncements().subscribe({
      next: (res) => { this.announcements = res; this.cdr.detectChanges(); },
      error: (err) => { console.error(err); this.cdr.detectChanges(); }
    });
  }

  publicSettings: any = null;
  isLoadingPublicSettings = false;

  loadFooterSettings(): void {
    this.complaintService.getFooterSettings().subscribe({
      next: (res) => { this.footerSettings = res; this.cdr.detectChanges(); },
      error: (err) => console.error(err)
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

  onAnnouncementsTab(): void {
    this.activeTab = 'announcements';
    this.loadAnnouncements();
  }

  deleteAnnouncement(announcementId: number): void {
    // Optimistic UI: remove immediately, then call API
    this.announcements = this.announcements.filter(a => a.id !== announcementId);
    this.complaintService.deleteAnnouncement(announcementId).subscribe({
      next: () => {
        this.showToast('✅ Announcement deleted.');
      },
      error: (err) => {
        this.showToast('❌ Failed to delete. Reloading...');
        this.loadAnnouncements();
        console.error(err);
      }
    });
  }

  showToast(message: string): void {
    this.activeToast = { message, type: 'info', createdAt: new Date() };
    setTimeout(() => this.clearToast(), 3000);
  }

  deleteComplaint(complaintId: number): void {
    if (!confirm('Are you sure you want to permanently delete this complaint?')) return;
    this.complaints = this.complaints.filter(c => c.id !== complaintId);
    if (this.expandedComplaintId === complaintId) this.expandedComplaintId = null;
    this.cdr.detectChanges();
    this.complaintService.deleteComplaint(complaintId).subscribe({
      next: () => {
        this.showToast('🗑️ Complaint deleted successfully.');
        this.loadStaffWorkload();
      },
      error: (err) => {
        this.showToast('❌ Failed to delete complaint.');
        this.loadComplaints();
        console.error(err);
      }
    });
  }

  toggleDropdown(complaintId: number, event: Event): void {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === complaintId ? null : complaintId;
    this.cdr.detectChanges();
  }

  selectStaffMember(complaintId: number, staffId: any): void {
    if (staffId === undefined) {
      delete this.assignedStaffMap[complaintId];
    } else {
      this.assignedStaffMap[complaintId] = staffId;
    }
    this.openDropdownId = null;
    this.cdr.detectChanges();
  }

  getSelectedStaffName(complaintId: number): string {
    const staffId = this.assignedStaffMap[complaintId];
    if (!staffId) return '';
    const staff = this.staffWorkload.find(s => s.id === staffId);
    return staff ? staff.name.replace('Electrician', 'Elec').replace('Plumber', 'Plum').replace('Cleaner', 'Clean') : '';
  }

  assignStaff(complaintId: number): void {
    const staffId = this.assignedStaffMap[complaintId];
    if (!staffId) return;

    this.assigning[complaintId] = true;
    this.complaintService.assignComplaint(complaintId, Number(staffId)).subscribe({
      next: () => {
        this.loadComplaints();
        this.loadStaffWorkload();
        delete this.assignedStaffMap[complaintId];
        delete this.assigning[complaintId];
        this.justAssigned[complaintId] = true;
        setTimeout(() => {
          this.justAssigned[complaintId] = false;
          this.cdr.detectChanges();
        }, 3000);
        this.showToast('✅ Complaint successfully assign ho gaya hai!');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        delete this.assigning[complaintId];
        const errMsg = err.error?.message || 'Error assigning staff. Token may have expired.';
        this.showToast('❌ ' + errMsg);
        this.cdr.detectChanges();
      }
    });
  }

  getStaffStats(): any[] {
    const stats: any[] = [];
    this.staffList.forEach(staff => {
      const staffComplaints = this.complaints.filter(c => c.staffId === staff.id);
      const completed = staffComplaints.filter(c => c.status === 'resolved');
      const ratings = completed.filter(c => c.feedbackRating).map(c => c.feedbackRating);
      const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 'N/A';
      stats.push({
        name: staff.name,
        phone: staff.phone,
        totalAssigned: staffComplaints.length,
        completedCount: completed.length,
        avgRating: avgRating
      });
    });
    return stats.sort((a, b) => {
      if (a.avgRating === 'N/A') return 1;
      if (b.avgRating === 'N/A') return -1;
      return Number(b.avgRating) - Number(a.avgRating);
    });
  }

  noticePhotoFile: File | null = null;
  noticePhotoPreview: string | null = null;

  onNoticePhotoSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.noticePhotoFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.noticePhotoPreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  clearNoticePhoto(): void {
    this.noticePhotoFile = null;
    this.noticePhotoPreview = null;
    this.cdr.detectChanges();
  }

  onNoticeSubmit(): void {
    this.postingNotice = true;
    this.noticeError = '';
    this.noticeSuccess = '';

    // Check token before sending
    const token = this.authService.token;
    if (!token) {
      this.postingNotice = false;
      this.noticeError = '❌ Session expired. Please log out and log in again as Warden.';
      return;
    }

    // Safety timeout — auto-reset if stuck > 10s
    const safetyTimer = setTimeout(() => {
      if (this.postingNotice) {
        this.postingNotice = false;
        this.noticeError = '❌ Request timed out. Please check your connection and try again.';
      }
    }, 10000);

    this.complaintService.createAnnouncement(this.newNotice, this.noticePhotoFile || undefined).subscribe({
      next: () => {
        clearTimeout(safetyTimer);
        this.postingNotice = false;
        this.justPosted = true;
        this.noticeSuccess = '✅ Notice posted successfully!';
        this.newNotice = { title: '', content: '', hostelBlock: 'All' };
        this.clearNoticePhoto();
        this.loadAnnouncements();
        this.cdr.detectChanges();
        setTimeout(() => {
          this.justPosted = false;
          this.activeTab = 'complaints';
          this.noticeSuccess = '';
          this.cdr.detectChanges();
        }, 1500);
      },
      error: (err) => {
        clearTimeout(safetyTimer);
        this.postingNotice = false;
        if (err.status === 401 || err.status === 403) {
          this.noticeError = '❌ Access denied (403). You must be logged in as a Warden or Admin to post notices. Please log out and log in with warden credentials.';
        } else if (err.status === 0) {
          this.noticeError = '❌ Cannot reach server. Make sure the backend is running.';
        } else {
          this.noticeError = '❌ ' + (err.error?.message || 'Error posting notice. Please try again.');
        }
        this.cdr.detectChanges();
      }
    });
  }

  getFilteredComplaints(): any[] {
    if (this.filterStatus === 'all') {
      return this.complaints;
    }
    if (this.filterStatus === 'pending' || this.filterStatus === 'new') {
      return this.complaints.filter(c => c.status === 'pending');
    }
    if (this.filterStatus === 'assigned') {
      return this.complaints.filter(c => c.status === 'assigned');
    }
    if (this.filterStatus === 'in_progress') {
      return this.complaints.filter(c => c.status === 'in_progress');
    }
    if (this.filterStatus === 'resolved') {
      return this.complaints.filter(c => c.status === 'resolved');
    }
    return this.complaints;
  }

  get filteredComplaints(): any[] {
    return this.getFilteredComplaints();
  }

  getPendingCount(): number {
    return this.complaints.filter(c => c.status === 'pending').length;
  }

  getAssignedOnlyCount(): number {
    return this.complaints.filter(c => c.status === 'assigned').length;
  }

  getInProgressOnlyCount(): number {
    return this.complaints.filter(c => c.status === 'in_progress').length;
  }

  getAssignedCount(): number {
    return this.complaints.filter(c => c.status === 'assigned' || c.status === 'in_progress').length;
  }

  getResolvedCount(): number {
    return this.complaints.filter(c => c.status === 'resolved').length;
  }

  getFilteredComplaintsCount(status: string): number {
    return this.complaints.filter(c => c.status === status).length;
  }

  getFilteredComplaintsCountAll(): number {
    return this.complaints.length;
  }

  toggleExpand(complaintId: number | null): void {
    if (this.expandedComplaintId === complaintId) {
      this.expandedComplaintId = null;
    } else {
      this.expandedComplaintId = complaintId;
    }
  }

  openPhotoModal(url: string): void {
    this.zoomPhotoUrl = url;
  }

  closePhotoModal(): void {
    this.zoomPhotoUrl = null;
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

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'urgent': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '🟡';
    }
  }

  getPriorityCount(priority: string): number {
    return this.complaints.filter(c => (c.priority || 'medium') === priority).length;
  }

  getPriorityPercent(priority: string): number {
    if (this.complaints.length === 0) return 0;
    return Math.round((this.getPriorityCount(priority) / this.complaints.length) * 100);
  }

  clearToast(): void {
    this.activeToast = null;
    this.socketService.clearNotification();
    this.cdr.detectChanges();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/warden/login']);
  }

  initProfileEdit(): void {
    const u = this.authService.currentUserValue;
    if (u) {
      this.editUser = {
        name: u.name,
        phone: u.phone,
        bio: u.bio || ''
      };
      this.profilePreviewUrl = u.profilePicUrl ? 'https://hostelhub-0cyi.onrender.com' + u.profilePicUrl : null;
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
    this.updatingProfile = true;
    this.profileError = '';
    this.profileSuccess = '';

    const formData = new FormData();
    formData.append('name', this.editUser.name);
    formData.append('phone', this.editUser.phone);
    formData.append('bio', this.editUser.bio);
    if (this.selectedProfilePic) {
      formData.append('profilePic', this.selectedProfilePic);
    }

    this.authService.updateProfile(formData).subscribe({
      next: (res) => {
        this.updatingProfile = false;
        this.profileSuccess = '✅ Profile updated successfully!';
        this.user = res.user;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.updatingProfile = false;
        this.profileError = '❌ ' + (err.error?.message || 'Failed to update profile.');
        this.cdr.detectChanges();
      }
    });
  }

  selectedMealFilter: 'all' | 'breakfast' | 'lunch' | 'snacks' | 'dinner' = 'all';
  selectedHostelFilter: string = 'all';

  filterByMeal(meal: 'all' | 'breakfast' | 'lunch' | 'snacks' | 'dinner'): void {
    if (this.selectedMealFilter === meal) {
      this.selectedMealFilter = 'all';
    } else {
      this.selectedMealFilter = meal;
    }
    this.cdr.detectChanges();
  }

  get filteredFeedbacks(): any[] {
    return (this.feedbacks || []).filter(f => {
      const matchMeal = this.selectedMealFilter === 'all' || (f.mealType || '').toLowerCase() === this.selectedMealFilter.toLowerCase();
      const studentBlock = (f.student?.hostelBlock || '').toLowerCase().trim();
      const filterBlock = this.selectedHostelFilter.toLowerCase().trim();
      const matchHostel = this.selectedHostelFilter === 'all' || studentBlock.includes(filterBlock) || filterBlock.includes(studentBlock);
      return matchMeal && matchHostel;
    });
  }

  getImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const cleanPath = url.startsWith('/') ? url : '/' + url;
    return 'https://hostelhub-0cyi.onrender.com' + cleanPath;
  }

  // Load warden mess data
  loadMessData(): void {
    this.messError = '';
    this.messSuccess = '';
    
    // Load Menu
    this.messService.getMenu().subscribe({
      next: (menu) => { this.messMenu = menu; this.cdr.detectChanges(); },
      error: (err) => console.error(err)
    });

    // Load Feedback Stats
    this.messService.getFeedbackStats().subscribe({
      next: (res) => {
        this.feedbackStats = res.stats;
        this.feedbacks = res.feedbacks;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });

    // Load Skip Summary
    this.messService.getSkipSummary().subscribe({
      next: (res) => {
        this.skipSummary = res.summary;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  // Save changes to menu
  saveMenuDay(menuDay: any): void {
    this.savingMenuId = menuDay.id;
    this.messSuccess = '';
    this.messError = '';
    
    this.messService.updateMenu(menuDay.id, {
      breakfast: menuDay.breakfast,
      lunch: menuDay.lunch,
      dinner: menuDay.dinner
    }).subscribe({
      next: (res) => {
        this.savingMenuId = null;
        this.messSuccess = `✅ Menu updated for ${menuDay.dayOfWeek}!`;
        this.loadMessData();
        setTimeout(() => { this.messSuccess = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.savingMenuId = null;
        this.messError = `❌ Failed to update menu: ` + (err.error?.message || '');
        this.cdr.detectChanges();
      }
    });
  }

  // Helpers
  getTodayDateString(): string {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }

  getTomorrowDateString(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  getSkipCount(date: string, mealType: 'breakfast' | 'lunch' | 'dinner'): number {
    return this.skipSummary[date] ? this.skipSummary[date][mealType] : 0;
  }

  // Load Daily Attendance Roll Call
  loadDailyRollCall(): void {
    if (!this.rollCallDate) {
      this.rollCallDate = this.getTodayDateString();
    }
    this.isLoadingRollCall = true;
    this.attendanceSuccess = '';
    this.attendanceError = '';

    const prevDate = new Date(this.rollCallDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];

    // Load active students
    this.attendanceService.getStudents().subscribe({
      next: (students) => {
        this.rollCallStudents = students;
        
        // Initialize map with default 'present'
        students.forEach(s => {
          this.attendanceMarkMap[s.id] = 'present';
          this.attendanceRemarksMap[s.id] = '';
        });

        // First check previous day's attendance to roll forward 'absent' status
        this.attendanceService.getDailySummary(prevDateStr).subscribe({
          next: (prevRecords) => {
            if (prevRecords && Array.isArray(prevRecords)) {
              prevRecords.forEach(rec => {
                if (rec.status === 'absent' && this.attendanceMarkMap[rec.studentId] !== undefined) {
                  this.attendanceMarkMap[rec.studentId] = 'absent';
                }
              });
            }

            // Load existing summary for selected date
            this.attendanceService.getDailySummary(this.rollCallDate).subscribe({
              next: (summaryRecords) => {
                summaryRecords.forEach(rec => {
                  if (this.attendanceMarkMap[rec.studentId] !== undefined) {
                    this.attendanceMarkMap[rec.studentId] = rec.status;
                    this.attendanceRemarksMap[rec.studentId] = rec.remarks || '';
                  }
                });
                this.isLoadingRollCall = false;
                this.cdr.detectChanges();
              },
              error: (err) => {
                console.error('Error fetching attendance summary:', err);
                this.isLoadingRollCall = false;
                this.cdr.detectChanges();
              }
            });
          },
          error: () => {
            this.isLoadingRollCall = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Error fetching students:', err);
        this.attendanceError = 'Failed to load student list.';
        this.isLoadingRollCall = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Filter students based on search query and block
  get filteredStudents(): any[] {
    return this.rollCallStudents.filter(s => {
      const matchSearch = !this.searchStudentQuery || 
        s.name.toLowerCase().includes(this.searchStudentQuery.toLowerCase()) || 
        s.roomNumber.toLowerCase().includes(this.searchStudentQuery.toLowerCase());
      
      const matchBlock = !this.filterHostelBlock || s.hostelBlock === this.filterHostelBlock;
      
      return matchSearch && matchBlock;
    });
  }

  // Bulk mark all present
  markAllPresent(): void {
    this.filteredStudents.forEach(s => {
      this.attendanceMarkMap[s.id] = 'present';
    });
    this.cdr.detectChanges();
  }

  // Save current attendance map to backend
  saveDailyAttendance(): void {
    this.savingAttendance = true;
    this.attendanceSuccess = '';
    this.attendanceError = '';

    const records = this.rollCallStudents.map(s => ({
      studentId: s.id,
      status: this.attendanceMarkMap[s.id] || 'present',
      remarks: this.attendanceRemarksMap[s.id] || ''
    }));

    this.attendanceService.markAttendance(this.rollCallDate, records).subscribe({
      next: (res) => {
        this.savingAttendance = false;
        this.attendanceSuccess = `✅ Attendance successfully marked for ${this.rollCallDate}!`;
        this.loadDailyRollCall();
        this.cdr.detectChanges();
        setTimeout(() => { this.attendanceSuccess = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.savingAttendance = false;
        this.attendanceError = '❌ Failed to save attendance: ' + (err.error?.message || '');
        this.cdr.detectChanges();
      }
    });
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.openDropdownId !== null) {
      this.openDropdownId = null;
      this.cdr.detectChanges();
    }
  }

  onImgError(event: any): void {
    if (event && event.target) {
      event.target.style.display = 'none';
    }
  }
}




