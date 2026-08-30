import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';
import { ComplaintService } from '../../services/complaint.service';
import { SocketService, LiveNotification } from '../../services/socket.service';

const API_BASE_URL = 'https://hostelhub-0cyi.onrender.com';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <!-- Toast Alert for Live Notifications -->
      <div class="toast-alert" *ngIf="activeToast" (click)="clearToast()">
        <div class="toast-content">
          <span class="toast-bell">🔧</span>
          <div class="toast-text">
            <strong>Task Update</strong>
            <p>{{ activeToast.message }}</p>
          </div>
          <span style="font-size:14px; color:rgba(255,255,255,0.5); flex-shrink:0;">✕</span>
        </div>
      </div>

      <!-- Photo Zoom Modal -->
      <div class="photo-modal" *ngIf="zoomPhotoUrl" (click)="closePhotoModal()">
        <div class="modal-wrapper" (click)="$event.stopPropagation()">
          <button class="close-modal" (click)="closePhotoModal()">&times;</button>
          <img [src]="zoomPhotoUrl" alt="Zoomed view" class="zoomed-image"/>
        </div>
      </div>

      <!-- Header Bar -->
      <div class="header">
        <div class="user-info">
          <div class="avatar-ring" style="position: relative;">
            <span class="avatar" *ngIf="!user?.profilePicUrl">🔧</span>
            <img *ngIf="user?.profilePicUrl" [src]="getImageUrl(user.profilePicUrl)" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" (error)="onImgError($event)"/>
            <span class="online-pulse-dot" style="width: 12px; height: 12px; right: 0; bottom: 0; position: absolute;"></span>
          </div>
          <div>
            <h3 style="margin: 0; display: flex; align-items: center; gap: 6px;">
              <span>Staff Portal</span>
              <span style="font-size: 10px; font-weight: 800; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 2px 8px; border-radius: 10px; text-transform: uppercase;">LIVE</span>
            </h3>
            <p class="user-meta" style="margin: 2px 0 0 0;">
              {{ user?.name || 'Staff Member' }} • {{ getStaffSpecialty() | titlecase }}
            </p>
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

      <!-- Floating Glass Navigation Dock -->
      <div class="bottom-tabs">
        <button class="tab-item" [class.active]="activeTab === 'tasks'" (click)="activeTab = 'tasks'">
          <span class="tab-icon">
            🛠️
            <span class="tab-badge animate-scale" *ngIf="getAssignedCount() > 0">{{ getAssignedCount() }}</span>
          </span>
          <span class="tab-text">My Tasks</span>
        </button>
        <button class="tab-item" [class.active]="activeTab === 'alerts'" (click)="onAlertsTab()">
          <span class="tab-icon">
            🔔
            <span class="tab-badge animate-scale" *ngIf="getUnreadNotifCount() > 0" style="background: #8b5cf6;">{{ getUnreadNotifCount() }}</span>
          </span>
          <span class="tab-text">Alert History</span>
        </button>
        <button class="tab-item" [class.active]="activeTab === 'my-profile'" (click)="activeTab = 'my-profile'; initProfileEdit()">
          <span class="tab-icon">👤</span>
          <span class="tab-text">Profile</span>
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="tab-content-area">
        
        <!-- TAB 1: ASSIGNED TASKS -->
        <div *ngIf="activeTab === 'tasks'" class="animate-fade">
          <!-- Cyber Glass Header Banner -->
          <div class="cyber-tab-header">
            <div class="cyber-header-badge" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white;">🛠️</div>
            <div>
              <h4 style="margin: 0 0 2px 0; font-family: var(--font-display); font-size: 17.5px; font-weight: 900; color: var(--text-primary);">My Maintenance Tasks</h4>
              <p style="margin: 0; font-size: 12px; color: var(--text-muted);">View room locations, call students, start work & upload proof</p>
            </div>
          </div>

          <!-- Filter Pills -->
          <div class="filter-pills" style="margin-bottom: 16px;">
            <button class="pill-btn" [class.active]="filterStatus === 'all'" (click)="filterStatus = 'all'">
              All ({{ tasks.length }})
            </button>
            <button class="pill-btn" [class.active]="filterStatus === 'assigned'" (click)="filterStatus = 'assigned'" style="border-color: rgba(37,99,235,0.4);">
              New ({{ getAssignedCount() }})
            </button>
            <button class="pill-btn" [class.active]="filterStatus === 'in_progress'" (click)="filterStatus = 'in_progress'" style="border-color: rgba(245,158,11,0.4);">
              Active ({{ getInProgressCount() }})
            </button>
            <button class="pill-btn" [class.active]="filterStatus === 'resolved'" (click)="filterStatus = 'resolved'" style="border-color: rgba(16,185,129,0.4);">
              Done ({{ getResolvedCount() }})
            </button>
          </div>

          <div class="complaints-list" *ngIf="filteredTasks.length > 0; else noTasks">
            <div class="card task-card" *ngFor="let task of filteredTasks" [class.expanded]="expandedTaskId === task.id" style="border-radius: 20px; transition: all 0.25s ease;">
              
              <div class="task-summary" (click)="toggleExpand(task.id)" style="cursor: pointer;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span class="badge" [class]="'badge-' + task.status" style="font-size: 11px; font-weight: 900; padding: 5px 12px; border-radius: 12px; text-transform: uppercase;">
                    {{ task.status === 'assigned' ? '🆕 NEW ASSIGNED' : task.status === 'in_progress' ? '⏳ IN PROGRESS' : '✅ COMPLETED' }}
                  </span>
                  <span style="font-size: 12px; font-weight: 800; color: #2563eb; background: rgba(37, 99, 235, 0.08); padding: 4px 10px; border-radius: 12px;">
                    🏠 Room {{ task.student?.roomNumber || 'N/A' }} ({{ task.student?.hostelBlock || 'Block A' }})
                  </span>
                </div>

                <h4 style="margin: 0 0 6px 0; font-family: var(--font-display); font-size: 16px; font-weight: 800; color: var(--text-primary);">
                  {{ task.title }}
                </h4>

                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
                  <span style="background: var(--bg-muted); border: 1px solid var(--border-color); color: var(--text-secondary); font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 8px; display: inline-flex; align-items: center; gap: 4px;">
                    <span>{{ getCategoryIcon(task.category) }}</span>
                    <span>{{ task.category | titlecase }}</span>
                  </span>

                  <span *ngIf="task.priority" style="font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px;" [style.color]="task.priority === 'urgent' ? '#ef4444' : '#d97706'" [style.background]="task.priority === 'urgent' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)'">
                    {{ task.priority === 'urgent' ? '🚨 URGENT' : '⚠️ HIGH PRIORITY' }}
                  </span>
                </div>

                <p class="task-desc-short" *ngIf="expandedTaskId !== task.id" style="margin: 0; font-size: 12.5px; color: var(--text-muted); line-height: 1.4;">
                  {{ task.description | slice:0:65 }}{{ task.description.length > 65 ? '...' : '' }}
                </p>

                <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed var(--border-color); display: flex; justify-content: space-between; align-items: center;" *ngIf="expandedTaskId !== task.id">
                  <span style="font-size: 11.5px; font-weight: 700; color: #2563eb;">Tap for Student Info & Actions</span>
                  <span style="font-size: 12px; color: #2563eb;">👇</span>
                </div>
              </div>

              <!-- Expanded Details Area -->
              <div class="task-details animate-fade" *ngIf="expandedTaskId === task.id" style="margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border-color);">
                <p style="font-size: 13px; color: var(--text-primary); line-height: 1.5; margin: 0 0 16px 0; background: var(--bg-muted); padding: 12px; border-radius: 12px; border: 1px solid var(--border-color);">
                  <strong style="color: #2563eb; display: block; margin-bottom: 4px; font-size: 11.5px; text-transform: uppercase;">Job Problem Details:</strong>
                  {{ task.description }}
                </p>

                <!-- Student Contact Section -->
                <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px; padding: 14px; margin-bottom: 16px;">
                  <div style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">👤 Student Contact & Location</div>
                  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                    <div>
                      <strong style="font-size: 14px; color: var(--text-primary); display: block;">{{ task.student?.name || 'Student' }}</strong>
                      <span style="font-size: 12px; color: var(--text-muted);">Room No: <strong>{{ task.student?.roomNumber || 'N/A' }}</strong> • {{ task.student?.hostelBlock || 'Block A' }}</span>
                    </div>

                    <!-- Direct Call Button -->
                    <a [href]="'tel:' + (task.student?.phone || '')" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; font-size: 12.5px; font-weight: 800; padding: 8px 14px; border-radius: 12px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                      <span>📞 Call Student</span>
                    </a>
                  </div>
                </div>

                <!-- Problem photo attached by student -->
                <div class="photo-view" *ngIf="task.photoUrl" style="margin-bottom: 16px;">
                  <p style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">📸 Student Issue Image Attachment:</p>
                  <div class="image-container" (click)="openPhotoModal(getImageUrl(task.photoUrl))" style="width: 100%; height: 160px; border-radius: 12px; overflow: hidden; position: relative; cursor: pointer; border: 1px solid var(--border-color);">
                    <img [src]="getImageUrl(task.photoUrl)" style="width: 100%; height: 100%; object-fit: cover;" alt="Student issue photo" (error)="onImgError($event)"/>
                    <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.7); color: white; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 8px;">🔍 Tap to Zoom</div>
                  </div>
                </div>

                <!-- Actions based on status -->
                <div *ngIf="task.status === 'assigned'" style="margin-top: 14px;">
                  <button type="button" class="btn" style="width: 100%; height: 46px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; border: none; border-radius: 14px; font-size: 14px; font-weight: 900; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);" (click)="updateStatus(task.id, 'in_progress')">
                    🚀 Start Work Now (Mark In Progress)
                  </button>
                </div>

                <div *ngIf="task.status === 'in_progress'" style="margin-top: 14px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; padding: 16px;">
                  <label style="font-size: 12px; font-weight: 800; color: var(--text-primary); display: block; margin-bottom: 8px;">
                    📸 Upload Work Proof Photo (Required to complete job):
                  </label>
                  
                  <div *ngIf="!imagePreviewUrls[task.id]" style="margin-bottom: 12px;">
                    <input type="file" (change)="onFileChange($event, task.id)" accept="image/*" class="file-input" [id]="'proof_' + task.id" style="display: none;" />
                    <div (click)="selectPhoto('proof', task.id)" style="background: #fdf2f4; border: 1.5px dashed rgba(179, 16, 49, 0.3); border-radius: 14px; padding: 16px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;">
                      <span style="font-size: 28px;">📷</span>
                      <strong style="font-size: 13px; color: #b31031;">Take / Select Proof Photo</strong>
                      <span style="font-size: 11px; color: var(--text-muted);">Snap repair completion photo</span>
                    </div>
                  </div>

                  <div *ngIf="imagePreviewUrls[task.id]" style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px; background: var(--bg-muted); padding: 10px; border-radius: 12px; border: 1px solid var(--border-color);">
                    <img [src]="imagePreviewUrls[task.id]" style="width: 54px; height: 54px; border-radius: 8px; object-fit: cover;" alt="Preview proof"/>
                    <div style="flex: 1; min-width: 0;">
                      <span style="font-size: 12px; font-weight: 700; color: var(--text-primary); display: block; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                        {{ selectedFiles[task.id]?.name || 'Proof Photo' }}
                      </span>
                      <span style="font-size: 10.5px; color: #10b981; font-weight: 700;">✓ Ready to submit</span>
                    </div>
                    <button type="button" (click)="removeSelectedFile(task.id)" style="background: none; border: none; color: #ef4444; font-size: 13px; cursor: pointer; font-weight: 700;">✕ Remove</button>
                  </div>

                  <button type="button" class="btn" [disabled]="!selectedFiles[task.id]" (click)="resolveTask(task.id)" style="width: 100%; height: 46px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 14px; font-size: 14px; font-weight: 900; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);">
                    ✅ Mark Job Completed & Done
                  </button>
                </div>

                <!-- If resolved, show proof uploaded -->
                <div *ngIf="task.status === 'resolved'" style="margin-top: 14px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 14px; padding: 14px;">
                  <p style="margin: 0 0 10px 0; font-size: 13.5px; font-weight: 800; color: #059669; display: flex; align-items: center; gap: 6px;">
                    <span>🎉</span> Job Completed & Resolved!
                  </p>
                  <div *ngIf="task.completionPhotoUrl">
                    <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 6px;">WORK COMPLETION PROOF:</span>
                    <div (click)="openPhotoModal(getImageUrl(task.completionPhotoUrl))" style="width: 100%; height: 140px; border-radius: 10px; overflow: hidden; position: relative; cursor: pointer;">
                      <img [src]="getImageUrl(task.completionPhotoUrl)" style="width: 100%; height: 100%; object-fit: cover;" alt="Work completion proof" (error)="onImgError($event)"/>
                      <div style="position: absolute; bottom: 6px; right: 6px; background: rgba(0,0,0,0.7); color: white; font-size: 10.5px; font-weight: 700; padding: 3px 8px; border-radius: 6px;">🔍 Tap to Zoom</div>
                    </div>
                  </div>
                </div>

                <button type="button" class="btn btn-secondary" style="width: 100%; margin-top: 14px; padding: 10px; border-radius: 12px; font-size: 12.5px; font-weight: 700; cursor: pointer;" (click)="toggleExpand(null)">
                  Collapse Task 👆
                </button>
              </div>

            </div>
          </div>

          <ng-template #noTasks>
            <div class="empty-state" style="text-align: center; padding: 48px 20px;">
              <span style="font-size: 52px; display: block; margin-bottom: 12px;">🎉</span>
              <h4 style="margin: 0 0 6px 0; color: var(--text-primary);">All Clear!</h4>
              <p style="margin: 0; color: var(--text-muted); font-size: 13px;">No maintenance jobs matching this status. Enjoy your day!</p>
            </div>
          </ng-template>
        </div>

        <!-- TAB 2: ALERTS LOG -->
        <div *ngIf="activeTab === 'alerts'" class="animate-fade">
          <!-- Cyber Header Banner -->
          <div class="cyber-tab-header">
            <div class="cyber-header-badge" style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white;">🔔</div>
            <div>
              <h4 style="margin: 0 0 2px 0; font-family: var(--font-display); font-size: 17.5px; font-weight: 900; color: var(--text-primary);">Work Alerts & Broadcast Log</h4>
              <p style="margin: 0; font-size: 12px; color: var(--text-muted);">Real-time notification alerts, task assignments and system logs</p>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h5 style="margin: 0; font-size: 14px; font-weight: 800; color: var(--text-primary);">Notifications Log</h5>
            <button class="clear-notif-btn" *ngIf="notifications.length > 0" (click)="clearAllNotifications()" style="background: rgba(37, 99, 235, 0.1); color: #2563eb; font-size: 11.5px; font-weight: 800; padding: 6px 12px; border-radius: 12px; border: 1px solid rgba(37, 99, 235, 0.2); cursor: pointer;">
              ✓ Mark all as read
            </button>
          </div>
          
          <div class="notifications-list" *ngIf="notifications.length > 0; else noNotifications">
            <div class="card notif-card clickable-notice" [class.unread]="!notif.isRead" *ngFor="let notif of notifications" (click)="onNotificationClick(notif)" style="border-radius: 16px; padding: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 18px;">{{ getNotifIcon(notif.type) }}</span>
                <span style="font-size: 11px; font-weight: 700; color: var(--text-muted);">{{ notif.createdAt | date:'d MMM, h:mm a' }}</span>
              </div>
              <p style="margin: 0 0 8px 0; font-size: 13px; color: var(--text-primary); line-height: 1.4; font-weight: 600;">{{ notif.message }}</p>
              <div style="font-size: 11px; color: #2563eb; text-align: right; font-weight: 800;">Tap to view details 🔎</div>
            </div>
          </div>
          <ng-template #noNotifications>
            <div class="empty-state" style="text-align: center; padding: 48px 20px;">
              <span style="font-size: 48px; display: block; margin-bottom: 12px;">🔕</span>
              <h4 style="margin: 0 0 6px 0; color: var(--text-primary);">No Alerts</h4>
              <p style="margin: 0; color: var(--text-muted); font-size: 13px;">No notification alerts on your log yet.</p>
            </div>
          </ng-template>
        </div>

        <!-- TAB 3: EDIT PROFILE & DUTY STATUS -->
        <div *ngIf="activeTab === 'my-profile'" class="animate-fade">
          <!-- Cyber Header Banner -->
          <div class="cyber-tab-header">
            <div class="cyber-header-badge" style="background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); color: white;">👤</div>
            <div>
              <h4 style="margin: 0 0 2px 0; font-family: var(--font-display); font-size: 17.5px; font-weight: 900; color: var(--text-primary);">Staff Profile & Availability</h4>
              <p style="margin: 0; font-size: 12px; color: var(--text-muted);">Update profile avatar, availability status & contact info</p>
            </div>
          </div>

          <!-- Duty Availability Toggle Box -->
          <div class="card" style="padding: 18px; border-radius: 20px; border: 1px solid var(--border-color); background: var(--bg-card); margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px;" [style.border-color]="isOnDuty ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px;" [style.background]="isOnDuty ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)'" [style.color]="isOnDuty ? '#10b981' : '#ef4444'">
                {{ isOnDuty ? '🟢' : '🔴' }}
              </div>
              <div>
                <strong style="font-size: 14px; color: var(--text-primary); display: block;">
                  {{ isOnDuty ? 'ON DUTY — Available for Jobs' : 'OFF DUTY — On Leave / Unavailable' }}
                </strong>
                <span style="font-size: 11.5px; color: var(--text-muted);">
                  {{ isOnDuty ? 'Warden can assign new maintenance tickets to you' : 'New ticket assignments are paused while off-duty' }}
                </span>
              </div>
            </div>

            <button type="button" (click)="toggleDutyStatus()" style="padding: 8px 16px; border-radius: 20px; border: none; font-size: 12px; font-weight: 900; cursor: pointer; transition: all 0.2s ease; white-space: nowrap;" [style.background]="isOnDuty ? '#10b981' : '#ef4444'" style="color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
              {{ isOnDuty ? 'Set Off-Duty' : 'Set On-Duty' }}
            </button>
          </div>

          <form (ngSubmit)="onProfileSubmit()" #profileForm="ngForm" style="display: flex; flex-direction: column; gap: 16px;">
            <div *ngIf="profileError" class="alert alert-danger">{{ profileError }}</div>
            <div *ngIf="profileSuccess" class="alert alert-success">{{ profileSuccess }}</div>

            <!-- Profile Photo Card Box -->
            <div class="card" style="padding: 24px; border-radius: 20px; border: 1px solid var(--border-color); background: var(--bg-card); display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; box-shadow: var(--shadow-sm);">
              <div style="position: relative; width: 104px; height: 104px; border-radius: 50%; border: 3px solid #b31031; padding: 3px; background: var(--bg-card);">
                <div style="width: 100%; height: 100%; border-radius: 50%; overflow: hidden; background: #f1f5f9; display: flex; align-items: center; justify-content: center;">
                  <img *ngIf="profilePreviewUrl" [src]="profilePreviewUrl" style="width: 100%; height: 100%; object-fit: cover;" />
                  <span *ngIf="!profilePreviewUrl" style="font-size: 44px; color: #94a3b8;">🔧</span>
                </div>
                <!-- Camera Badge Icon -->
                <button type="button" (click)="selectPhoto('profile')" style="position: absolute; bottom: 2px; right: 2px; width: 30px; height: 30px; border-radius: 50%; background: #b31031; color: white; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 13px; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
                  📷
                </button>
              </div>

              <div>
                <strong style="font-size: 14.5px; color: var(--text-primary); display: block; margin-bottom: 2px;">Profile Photo</strong>
                <span style="font-size: 11px; color: var(--text-muted);">JPG, PNG up to 5MB</span>
              </div>

              <input type="file" (change)="onProfilePicChange($event)" accept="image/*" class="file-input" id="profilePicFile" style="display: none;"/>
              <button type="button" (click)="selectPhoto('profile')" class="btn" style="width: 100%; max-width: 320px; height: 42px; background: #fdf2f4; color: #b31031; border: 1px solid rgba(179, 16, 49, 0.2); border-radius: 12px; font-size: 13px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
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
                  style="height: 42px; border-radius: 12px; font-size: 13px; background: var(--bg-muted); border: 1px solid var(--border-color); padding: 0 14px;"
                  [(ngModel)]="editUser.name" 
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
                  style="height: 42px; border-radius: 12px; font-size: 13px; background: var(--bg-muted); border: 1px solid var(--border-color); padding: 0 14px;"
                  [(ngModel)]="editUser.phone" 
                  required
                />
              </div>

              <!-- Bio Field -->
              <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                  <span style="width: 32px; height: 32px; border-radius: 8px; background: #fdf2f4; color: #b31031; display: flex; align-items: center; justify-content: center; font-size: 15px;">📄</span>
                  <label class="form-label" style="margin: 0; font-size: 12.5px; font-weight: 700; color: var(--text-primary);">Specialty / Duty Bio</label>
                </div>
                <div style="position: relative;">
                  <textarea 
                    id="profileBio" 
                    name="profileBio" 
                    class="form-input" 
                    rows="3" 
                    style="border-radius: 12px; font-size: 13px; background: var(--bg-muted); border: 1px solid var(--border-color); padding: 10px 14px; width: 100%;"
                    placeholder="Describe your maintenance specialty (e.g. Electrician, Plumber)..."
                    [(ngModel)]="editUser.bio"
                  ></textarea>
                  <span style="position: absolute; right: 12px; bottom: 8px; font-size: 10px; color: var(--text-muted);">{{ editUser.bio ? editUser.bio.length : 0 }}/150</span>
                </div>
              </div>
            </div>

            <!-- Save Changes Crimson Button -->
            <button type="submit" class="btn" style="width: 100%; height: 46px; background: linear-gradient(135deg, #8a0d24 0%, #b31031 100%); color: white; border: none; border-radius: 14px; font-size: 14px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 14px rgba(138, 13, 36, 0.35);" [disabled]="!profileForm.form.valid || updatingProfile">
              <span>💾</span> {{ updatingProfile ? 'Updating...' : 'Save Changes' }}
            </button>

            <!-- Bottom Need Help Box -->
            <div class="card" style="padding: 16px; border-radius: 16px; border: 1px solid var(--border-color); background: var(--bg-card); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
              <div>
                <strong style="font-size: 13px; color: #b31031; display: block; margin-bottom: 2px;">Need Help?</strong>
                <span style="font-size: 11.5px; color: var(--text-muted);">We are here to assist you.</span>
              </div>

              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <a [href]="'mailto:' + (footerSettings?.footer_email || 'support@hostelhub.com')" style="background: var(--bg-muted); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 11.5px; font-weight: 600; padding: 6px 12px; border-radius: 20px; text-decoration: none; display: flex; align-items: center; gap: 6px;">
                  <span>✉️</span> {{ footerSettings?.footer_email || 'support@hostelhub.com' }}
                </a>
                <a [href]="'tel:' + (footerSettings?.footer_phone || '+919876543210')" style="background: var(--bg-muted); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 11.5px; font-weight: 600; padding: 6px 12px; border-radius: 20px; text-decoration: none; display: flex; align-items: center; gap: 6px;">
                  <span>📞</span> {{ footerSettings?.footer_phone || '+91 98765 43210' }}
                </a>
              </div>
            </div>
          </form>

          <!-- Dynamic Solo Developer Card -->
          <div style="margin-top: 24px;" *ngIf="publicSettings?.developer_team?.length">
            <div style="margin-bottom: 12px;">
              <h4 style="font-family: var(--font-display); font-size: 15px; font-weight: 900; color: var(--text-primary); margin: 0 0 2px 0;">
                👨‍💻 Creator & Solo Developer
              </h4>
              <p style="margin: 0; font-size: 11.5px; color: var(--text-muted);">The architect and engineer behind HostelHub.</p>
            </div>

            <div class="solo-dev-card" style="padding: 24px 18px; border-radius: 24px;">
              <div style="position: relative; display: inline-block; margin-bottom: 12px;">
                <div style="width: 72px; height: 72px; border-radius: 50%; border: 3px solid #2563eb; padding: 3px; margin: 0 auto; background: var(--bg-card); overflow: hidden;">
                  <img [src]="getImageUrl(publicSettings.developer_team[0].pic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80')" 
                       style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" 
                       [alt]="publicSettings.developer_team[0].name || 'Abhinav Kumar'" 
                       (error)="onImgError($event)" />
                </div>
                <div class="online-pulse-dot" style="width: 12px; height: 12px; right: 2px; bottom: 2px;"></div>
              </div>

              <h4 style="margin: 0 0 4px 0; font-family: var(--font-display); font-size: 20px; font-weight: 900; color: var(--text-primary);">
                {{ publicSettings.developer_team[0].name || 'Abhinav Kumar' }}
              </h4>

              <span style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; font-size: 10.5px; font-weight: 900; padding: 4px 14px; border-radius: 20px; letter-spacing: 0.5px; display: inline-block; margin-bottom: 12px;">
                🚀 {{ (publicSettings.developer_team[0].role || 'CREATOR & LEAD FULL-STACK DEVELOPER') | uppercase }}
              </span>

              <p style="margin: 0 0 16px 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; max-width: 440px; margin-left: auto; margin-right: auto;">
                {{ publicSettings.developer_team[0].description || 'Sole Architect & Lead Developer of HostelHub.' }}
              </p>

              <div style="display: flex; justify-content: center; align-items: center; gap: 10px; flex-wrap: wrap;">
                <a [href]="publicSettings.developer_team[0].github || 'https://github.com/abhinav8102-asd'" target="_blank" class="social-icon-btn-dev" title="GitHub">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                </a>
                <a [href]="publicSettings.developer_team[0].linkedin || 'https://linkedin.com'" target="_blank" class="social-icon-btn-dev" title="LinkedIn">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.762-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a [href]="publicSettings.developer_team[0].email || 'mailto:support@hostelhub.com'" class="social-icon-btn-dev" title="Email">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 6.013-9.518-6.013h19.036zm-19.518 14v-11.774l10 6.32 10-6.32v11.774h-20z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Single App Footer Glass Card -->
      <footer class="app-footer-card animate-fade" style="margin: 24px 16px 24px 16px; padding: 22px 18px; border-radius: 24px;">
        <h4 style="margin: 0 0 8px 0; font-family: var(--font-display); font-size: 15px; font-weight: 900; color: var(--text-primary); text-align: center;">
          {{ footerSettings?.footer_text || 'Hostel Maintenance & Support Portal' }}
        </h4>
        <div style="display: flex; justify-content: center; align-items: center; gap: 14px; font-size: 12px; color: var(--text-muted); flex-wrap: wrap; margin-bottom: 10px;">
          <span>📧 {{ footerSettings?.footer_email || 'support@hostelhub.com' }}</span>
          <span>·</span>
          <span>📞 {{ footerSettings?.footer_phone || '+91 98765 43210' }}</span>
        </div>
        <p style="margin: 0; font-size: 11px; font-weight: 700; color: var(--text-muted); line-height: 1.5; text-align: center;">
          Developed by HostelHub Engineering Team 💻 · {{ footerSettings?.footer_copyright || '© 2026 HostelHub. All rights reserved.' }}
        </p>
      </footer>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
    }

    /* Premium Header */
    .header {
      background: var(--bg-header);
      color: #f8fafc;
      padding: 14px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(179, 16, 49, 0.4);
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
      background: rgba(179, 16, 49, 0.25);
      border: 2px solid rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 0 10px rgba(179, 16, 49, 0.4);
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
      background-color: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #f87171;
      padding: 6px 12px;
      font-size: 11px;
      font-weight: 700;
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: var(--transition-fast);
    }
    .logout-btn:hover, .logout-btn:active {
      background-color: var(--danger);
      color: var(--white);
      transform: translateY(-1px);
    }

    /* Floating Glass Navigation Dock */
    .bottom-tabs {
      background: var(--bg-glass);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-around;
      padding: 8px 12px;
      position: sticky;
      top: 73px;
      z-index: 100;
      box-shadow: var(--shadow-sm);
    }

    .tab-item {
      background: none;
      border: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: var(--text-muted);
      cursor: pointer;
      padding: 6px 16px;
      border-radius: var(--radius-md);
      transition: all var(--transition-normal);
      position: relative;
    }

    .tab-item.active {
      color: var(--primary);
      background: var(--primary-light);
      font-weight: 700;
    }

    .tab-icon {
      font-size: 18px;
      position: relative;
    }

    .tab-badge {
      position: absolute;
      top: -4px;
      right: -8px;
      background: var(--primary);
      color: white;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 5px;
      border-radius: 10px;
      line-height: 1;
    }

    .tab-text {
      font-size: 11px;
      font-weight: 600;
    }

    .tab-content-area {
      padding: 20px 16px;
      flex: 1;
    }

    .filter-pills {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .pill-btn {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      font-size: 12px;
      font-weight: 700;
      padding: 7px 14px;
      border-radius: 20px;
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--transition-normal);
    }

    .pill-btn.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
      box-shadow: var(--shadow-sm);
    }

    /* Toast Alert Notification */
    .toast-alert {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(37, 99, 235, 0.4);
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
      color: white;
      padding: 12px 18px;
      border-radius: 16px;
      z-index: 9999;
      backdrop-filter: blur(12px);
      max-width: 90%;
      cursor: pointer;
      animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .toast-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .toast-bell {
      font-size: 22px;
    }
    .toast-text strong {
      font-size: 11px;
      color: #60a5fa;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .toast-text p {
      font-size: 12px;
      color: #e2e8f0;
      margin: 2px 0 0 0;
      line-height: 1.35;
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
    @keyframes slideDown {
      from { transform: translate(-50%, -30px); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }

    .clickable-notice {
      cursor: pointer;
      transition: var(--transition-normal);
    }
    .clickable-notice:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--primary);
    }
    .notif-card.unread {
      border-left: 4px solid var(--primary);
      background-color: var(--primary-light);
    }
  `]
})
export class StaffDashboardComponent implements OnInit, OnDestroy {
  user: User | null = null;
  tasks: any[] = [];
  selectedFiles: { [key: number]: File } = {};
  imagePreviewUrls: { [key: number]: string } = {};

  filterStatus: 'all' | 'assigned' | 'in_progress' | 'resolved' = 'all';
  expandedTaskId: number | null = null;
  zoomPhotoUrl: string | null = null;
  activeTab = 'tasks';
  isOnDuty = true;
  
  editUser = { name: '', phone: '', bio: '' };
  profilePreviewUrl: string | null = null;
  selectedProfilePic: File | null = null;
  updatingProfile = false;
  profileError = '';
  profileSuccess = '';
  notifications: any[] = [];
  publicSettings: any = null;
  footerSettings: any = {
    footer_text: 'HostelHub Management System • Staff Portal',
    footer_email: 'support@hostelhub.com',
    footer_phone: '+91 98765 43210',
    footer_copyright: '© 2026 HostelHub Inc. All rights reserved.'
  };

  activeToast: LiveNotification | null = null;
  private notifSub!: Subscription;
  isDarkMode = false;

  constructor(
    private authService: AuthService,
    private complaintService: ComplaintService,
    private socketService: SocketService,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    const saved = localStorage.getItem('hh_dark_mode');
    if (saved === 'true') { this.isDarkMode = true; document.body.classList.add('dark-mode'); }
    this.loadTasks();
    this.loadNotifications();
    this.loadPublicSettings();
    this.loadFooterSettings();

    this.notifSub = this.socketService.notification$.subscribe(notif => {
      if (notif) {
        this.activeToast = notif;
        this.loadTasks();
        this.loadNotifications();
        this.cdr.detectChanges();
        setTimeout(() => this.clearToast(), 3000);
      }
    });

    this.socketService.onEvent('settings_updated', () => {
      this.loadPublicSettings();
      this.loadFooterSettings();
    });
  }

  ngOnDestroy(): void {
    if (this.notifSub) {
      this.notifSub.unsubscribe();
    }
  }

  loadTasks(): void {
    this.complaintService.getStaffComplaints().subscribe({
      next: (res) => { this.tasks = res; this.cdr.detectChanges(); },
      error: (err) => console.error(err)
    });
  }

  loadPublicSettings(): void {
    this.http.get<any>(`${API_BASE_URL}/api/settings/public`).subscribe({
      next: (res) => { this.publicSettings = res; this.cdr.detectChanges(); },
      error: (err) => console.error(err)
    });
  }

  loadFooterSettings(): void {
    this.http.get<any>(`${API_BASE_URL}/api/settings/footer`).subscribe({
      next: (res) => { if (res) { this.footerSettings = res; this.cdr.detectChanges(); } },
      error: (err) => console.error(err)
    });
  }

  toggleDutyStatus(): void {
    this.isOnDuty = !this.isOnDuty;
    this.showLocalToast(this.isOnDuty ? '🟢 You are now ON DUTY (Available for jobs)' : '🔴 You are now OFF DUTY (Assignments paused)');
  }

  onFileChange(event: any, taskId: number): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFiles[taskId] = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrls[taskId] = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removeSelectedFile(taskId: number): void {
    delete this.selectedFiles[taskId];
    delete this.imagePreviewUrls[taskId];
    const fileInput = document.getElementById('proof_' + taskId) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    this.cdr.detectChanges();
  }

  updateStatus(complaintId: number, status: string): void {
    this.complaintService.updateComplaintStatus(complaintId, status).subscribe({
      next: () => {
        this.loadTasks();
        this.showLocalToast(status === 'in_progress' ? '🚀 Job started!' : '✅ Job completed!');
      },
      error: (err) => {
        console.error(err);
        this.showLocalToast('❌ Failed to update status. Try again.');
      }
    });
  }

  resolveTask(taskId: number): void {
    const file = this.selectedFiles[taskId];
    this.complaintService.updateComplaintStatus(taskId, 'resolved', file).subscribe({
      next: () => {
        this.loadTasks();
        delete this.selectedFiles[taskId];
        delete this.imagePreviewUrls[taskId];
        this.showLocalToast('🎉 Task marked as completed!');
      },
      error: (err) => {
        console.error(err);
        this.showLocalToast('❌ Error uploading proof. Try again.');
      }
    });
  }

  getAssignedCount(): number {
    return this.tasks.filter(t => t.status === 'assigned').length;
  }

  getInProgressCount(): number {
    return this.tasks.filter(t => t.status === 'in_progress').length;
  }

  getResolvedCount(): number {
    return this.tasks.filter(t => t.status === 'resolved').length;
  }

  getUnreadNotifCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  getFilteredTasks(): any[] {
    if (this.filterStatus === 'all') return this.tasks;
    if (this.filterStatus === 'assigned') return this.tasks.filter(t => t.status === 'assigned');
    if (this.filterStatus === 'in_progress') return this.tasks.filter(t => t.status === 'in_progress');
    if (this.filterStatus === 'resolved') return this.tasks.filter(t => t.status === 'resolved');
    return this.tasks;
  }

  get filteredTasks(): any[] {
    return this.getFilteredTasks();
  }

  toggleExpand(taskId: number | null): void {
    if (this.expandedTaskId === taskId) {
      this.expandedTaskId = null;
    } else {
      this.expandedTaskId = taskId;
    }
  }

  openPhotoModal(url: string): void {
    this.zoomPhotoUrl = url;
  }

  closePhotoModal(): void {
    this.zoomPhotoUrl = null;
  }

  getStaffSpecialty(): string {
    return (this.user as any)?.specialization || this.user?.role || 'Maintenance Specialist';
  }

  getCategoryIcon(cat: string): string {
    switch (cat?.toLowerCase()) {
      case 'electrical': return '⚡';
      case 'plumbing': return '🚰';
      case 'carpentry': return '🪚';
      case 'cleaning': return '🧹';
      case 'wifi': return '📶';
      default: return '⚙️';
    }
  }

  clearToast(): void {
    this.activeToast = null;
    this.socketService.clearNotification();
    this.cdr.detectChanges();
  }

  showLocalToast(msg: string): void {
    this.activeToast = { message: msg, type: 'complaint_update', createdAt: new Date() } as any;
    this.cdr.detectChanges();
    setTimeout(() => this.clearToast(), 3000);
  }

  onAlertsTab(): void {
    this.activeTab = 'alerts';
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.complaintService.getNotifications().subscribe({
      next: (res) => { this.notifications = res; this.cdr.detectChanges(); },
      error: (err) => console.error(err)
    });
  }

  clearAllNotifications(): void {
    this.complaintService.markAllNotificationsRead().subscribe({
      next: () => { this.loadNotifications(); this.cdr.detectChanges(); },
      error: (err) => console.error(err)
    });
  }

  onNotificationClick(notif: any): void {
    notif.isRead = true;
    this.activeTab = 'tasks';
    const match = notif.message.match(/complaint "(.*)"/i) || notif.message.match(/task assigned: "(.*)"/i) || notif.message.match(/job "(.*)"/i);
    if (match) {
      const title = match[1];
      const task = this.tasks.find(t => t.title.toLowerCase() === title.toLowerCase());
      if (task) {
        this.expandedTaskId = task.id;
      }
    }
    this.cdr.detectChanges();
  }

  getNotifIcon(type: string): string {
    switch (type) {
      case 'assignment': return '🔧';
      case 'complaint_update': return '🛠️';
      default: return '🔔';
    }
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/staff/login']);
  }

  initProfileEdit(): void {
    const u = this.authService.currentUserValue;
    if (u) {
      this.editUser = {
        name: u.name,
        phone: u.phone,
        bio: u.bio || ''
      };
      this.profilePreviewUrl = u.profilePicUrl ? this.getImageUrl(u.profilePicUrl) : null;
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
        this.cdr.detectChanges();
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

  async selectPhoto(type: 'proof' | 'profile', taskId?: number) {
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
          if (type === 'proof' && taskId !== undefined) {
            this.selectedFiles[taskId] = file;
            this.imagePreviewUrls[taskId] = reader.result as string;
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
      if (type === 'proof' && taskId !== undefined) {
        const el = document.getElementById('proof_' + taskId) as HTMLInputElement;
        if (el) el.click();
      } else if (type === 'profile') {
        const el = document.getElementById('profilePicFile') as HTMLInputElement;
        if (el) el.click();
      }
    }
  }

  getImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const cleanPath = url.startsWith('/') ? url : '/' + url;
    return API_BASE_URL + cleanPath;
  }

  onImgError(event: any): void {
    if (event && event.target) {
      event.target.style.display = 'none';
    }
  }
}
