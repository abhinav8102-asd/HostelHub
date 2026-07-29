import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';
import { ComplaintService } from '../../services/complaint.service';
import { SocketService, LiveNotification } from '../../services/socket.service';

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

      <!-- Header -->
      <div class="header">
        <div class="user-info">
          <div class="avatar-ring">
            <span class="avatar" *ngIf="!user?.profilePicUrl">🔧</span>
            <img *ngIf="user?.profilePicUrl" [src]="'https://hostelhub-0cyi.onrender.com' + user.profilePicUrl" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />
          </div>
          <div>
            <h3>Staff Portal</h3>
            <p class="user-meta">{{ user?.name }} • Specialist</p>
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

      <!-- Navigation Tabs (styled as top navbar) -->
      <div class="bottom-tabs">
        <button class="tab-item" [class.active]="activeTab === 'tasks'" (click)="activeTab = 'tasks'">
          <span class="tab-icon">🛠️</span>
          <span class="tab-text">My Tasks</span>
        </button>
        <button class="tab-item" [class.active]="activeTab === 'alerts'" (click)="onAlertsTab()">
          <span class="tab-icon">🔔</span>
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
          <h4 class="page-title">My Assigned Tasks</h4>

          <!-- Filter Pills -->
          <div class="filter-pills">
            <button class="pill-btn" [class.active]="filterStatus === 'all'" (click)="filterStatus = 'all'">
              All ({{ tasks.length }})
            </button>
            <button class="pill-btn" [class.active]="filterStatus === 'assigned'" (click)="filterStatus = 'assigned'">
              New ({{ getAssignedCount() }})
            </button>
            <button class="pill-btn" [class.active]="filterStatus === 'in_progress'" (click)="filterStatus = 'in_progress'">
              Active ({{ getInProgressCount() }})
            </button>
            <button class="pill-btn" [class.active]="filterStatus === 'resolved'" (click)="filterStatus = 'resolved'">
              Done ({{ getResolvedCount() }})
            </button>
          </div>

          <div class="complaints-list" *ngIf="filteredTasks.length > 0; else noTasks">
            <div class="card task-card" *ngFor="let task of filteredTasks" [class.expanded]="expandedTaskId === task.id">
              
              <div class="task-summary" (click)="toggleExpand(task.id)">
                <div class="task-header">
                  <span class="badge" [class]="'badge-' + task.status">{{ task.status.replace('_', ' ') }}</span>
                  <span class="task-room">Room {{ task.student?.roomNumber }} ({{ task.student?.hostelBlock }})</span>
                </div>
                <h4 class="task-title">{{ task.title }}</h4>
                <div class="task-category-tag">
                  <span class="cat-tag-icon">{{ getCategoryIcon(task.category) }}</span>
                  <span>{{ task.category | titlecase }}</span>
                </div>
                <p class="task-desc-short" *ngIf="expandedTaskId !== task.id">
                  {{ task.description | slice:0:60 }}{{ task.description.length > 60 ? '...' : '' }}
                </p>
                <div class="tap-hint" *ngIf="expandedTaskId !== task.id">Tap to view details & updates 👇</div>
              </div>

              <!-- Expanded Details Area -->
              <div class="task-details animate-fade" *ngIf="expandedTaskId === task.id">
                <p class="task-desc-full"><strong>Job Description:</strong><br/>{{ task.description }}</p>

                <!-- Student info -->
                <div class="student-info-section">
                  <div class="info-label">👤 Student Contact Info</div>
                  <p class="student-name">Name: <strong>{{ task.student?.name }}</strong></p>
                  <p class="student-room">Room No: {{ task.student?.roomNumber }} ({{ task.student?.hostelBlock }})</p>
                  <a [href]="'tel:' + task.student?.phone" class="btn btn-call-student">
                    📞 Call Student ({{ task.student?.phone }})
                  </a>
                </div>

                <!-- Problem photo attached by student -->
                <div class="photo-view" *ngIf="task.photoUrl">
                  <p class="section-label">📸 Issue Attachment:</p>
                  <div class="image-container" (click)="openPhotoModal('https://hostelhub-0cyi.onrender.com' + task.photoUrl)">
                    <img [src]="'https://hostelhub-0cyi.onrender.com' + task.photoUrl" class="comp-img" alt="Student issue photo"/>
                    <div class="image-overlay">🔍 Tap to Zoom</div>
                  </div>
                </div>

                <!-- Actions based on status -->
                <div class="task-actions" *ngIf="task.status === 'assigned'">
                  <button class="btn btn-primary btn-start-job" (click)="updateStatus(task.id, 'in_progress')">
                    🚀 Start This Job
                  </button>
                </div>

                <div class="task-actions" *ngIf="task.status === 'in_progress'">
                  <div class="resolution-form">
                    <label class="form-label">Upload Work Proof (Required):</label>
                    
                    <div class="upload-area" *ngIf="!imagePreviewUrls[task.id]">
                      <input type="file" (change)="onFileChange($event, task.id)" accept="image/*" class="file-input" [id]="'proof_' + task.id" />
                      <label [for]="'proof_' + task.id" class="file-input-label" (click)="selectPhoto('proof', task.id); $event.preventDefault()">
                        <span class="upload-icon">📸</span>
                        <span class="upload-text">Select Completion Image</span>
                      </label>
                    </div>

                    <div class="preview-area animate-fade" *ngIf="imagePreviewUrls[task.id]">
                      <img [src]="imagePreviewUrls[task.id]" alt="Preview proof" class="preview-thumbnail"/>
                      <div class="preview-info">
                        <span class="preview-name">{{ selectedFiles[task.id]?.name }}</span>
                        <button type="button" class="btn-remove-file" (click)="removeSelectedFile(task.id)">Remove ❌</button>
                      </div>
                    </div>

                    <button class="btn btn-success btn-submit-resolved" [disabled]="!selectedFiles[task.id]" (click)="resolveTask(task.id)">
                      ✅ Mark Completed
                    </button>
                  </div>
                </div>

                <!-- If resolved, show proof uploaded -->
                <div class="resolved-proof-section" *ngIf="task.status === 'resolved'">
                  <p class="text-success">🎉 Job Completed Successfully!</p>
                  <div class="photo-view" *ngIf="task.completionPhotoUrl">
                    <p class="section-label">✅ Uploaded Work Proof:</p>
                    <div class="image-container" (click)="openPhotoModal('https://hostelhub-0cyi.onrender.com' + task.completionPhotoUrl)">
                      <img [src]="'https://hostelhub-0cyi.onrender.com' + task.completionPhotoUrl" class="comp-img" alt="Work completion proof"/>
                      <div class="image-overlay">🔍 Tap to Zoom</div>
                    </div>
                  </div>
                </div>

                <button class="btn btn-secondary btn-collapse" (click)="toggleExpand(null)">Collapse Task 👆</button>
              </div>

            </div>
          </div>

          <ng-template #noTasks>
            <div class="empty-state">
              <span class="empty-icon">🏖️</span>
              <p>No jobs assigned to you matching this status. Enjoy your day!</p>
            </div>
          </ng-template>
        </div>

        <!-- TAB 2: ALERTS LOG -->
        <div *ngIf="activeTab === 'alerts'" class="animate-fade">
          <div class="notif-header-row">
            <h4 class="page-title">🔕 Alert History</h4>
            <button class="clear-notif-btn" *ngIf="notifications.length > 0" (click)="clearAllNotifications()">
              Mark all as read Checkbox
            </button>
          </div>
          
          <div class="notifications-list" *ngIf="notifications.length > 0; else noNotifications">
            <div class="card notif-card clickable-notice" [class.unread]="!notif.isRead" *ngFor="let notif of notifications" (click)="onNotificationClick(notif)">
              <div class="notif-meta">
                <span class="notif-badge-icon">{{ getNotifIcon(notif.type) }}</span>
                <span class="notif-time">{{ notif.createdAt | date:'shortTime' }}</span>
              </div>
              <p class="notif-msg">{{ notif.message }}</p>
              <div class="notice-tap-hint">Tap to view details 🔎</div>
            </div>
          </div>
          <ng-template #noNotifications>
            <div class="empty-state">
              <span class="empty-icon">🔔</span>
              <p>No notifications on your log yet.</p>
            </div>
          </ng-template>
        </div>

        <!-- TAB 3: EDIT PROFILE -->
        <div *ngIf="activeTab === 'my-profile'" class="animate-fade">
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
                  <span *ngIf="!profilePreviewUrl" style="font-size: 40px; color: #94a3b8;">🔧</span>
                </div>
                 <input type="file" (change)="onProfilePicChange($event)" accept="image/*" class="file-input" id="profilePicFile" style="display: none;"/>
                 <button type="button" class="btn btn-secondary" style="cursor: pointer; font-size: 12px; padding: 6px 12px;" (click)="selectPhoto('profile')">
                   📷 Choose Photo
                 </button>
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

      </div>
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

    /* Scrollable Layout */
    .tab-content-area {
      flex: 1;
      padding: 16px;
      padding-bottom: 80px;
      overflow-y: auto;
      background-color: var(--bg-body);
    }
    .page-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--neutral-900);
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
    }
    .pill-btn.active {
      background-color: var(--primary);
      color: var(--white);
      border-color: var(--primary);
      box-shadow: var(--shadow-sm);
    }

    /* Task Card list */
    .task-card {
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
      overflow: hidden;
      padding: 0;
    }
    .task-summary {
      padding: 16px;
    }
    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .task-room {
      font-size: 11px;
      font-weight: 700;
      color: var(--neutral-500);
    }
    .task-title {
      font-size: 14.5px;
      font-weight: 700;
      color: var(--neutral-900);
      margin-bottom: 4px;
    }
    .task-category-tag {
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
    .task-desc-short {
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

    /* Expanded Content area */
    .task-details {
      padding: 0 16px 16px 16px;
      border-top: 1px solid var(--neutral-100);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .task-desc-full {
      font-size: 13px;
      color: var(--neutral-700);
      line-height: 1.45;
      padding-top: 12px;
    }

    /* Student details */
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

    /* Original Photo Attachment */
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

    /* Task Actions */
    .task-actions {
      margin-top: 4px;
      border-top: 1.5px dashed var(--neutral-200);
      padding-top: 12px;
    }
    .btn-start-job {
      box-shadow: 0 4px 6px rgba(99, 102, 241, 0.15);
    }
    .btn-submit-resolved {
      margin-top: 12px;
      box-shadow: 0 4px 6px rgba(16, 185, 129, 0.15);
    }

    /* Resolution Proof Uploads styling */
    .resolution-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .upload-area {
      position: relative;
      width: 100%;
    }
    .file-input { display: none; }
    .file-input-label {
      border: 1.5px dashed var(--neutral-400);
      border-radius: var(--radius-md);
      background-color: var(--neutral-100);
      padding: 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: var(--transition-fast);
    }
    .upload-icon {
      font-size: 24px;
      margin-bottom: 2px;
    }
    .upload-text {
      font-size: 12.5px;
      font-weight: 700;
      color: var(--neutral-700);
    }

    /* Preview area for resolution */
    .preview-area {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      background: var(--white);
      border: 1.5px solid var(--neutral-200);
      border-radius: var(--radius-md);
    }
    .preview-thumbnail {
      width: 60px;
      height: 60px;
      border-radius: var(--radius-sm);
      object-fit: cover;
      border: 1px solid var(--neutral-200);
    }
    .preview-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .preview-name {
      font-size: 12px;
      font-weight: 600;
      color: var(--neutral-800);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 180px;
    }
    .btn-remove-file {
      background: none;
      border: none;
      color: var(--danger);
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      text-align: left;
      width: fit-content;
      padding: 2px 0;
    }

    .btn-success {
      background-color: var(--success);
      color: var(--white);
    }
    .btn-success:active {
      transform: scale(0.97);
    }
    .text-success {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--success);
    }
    .resolved-proof-section {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: var(--radius-md);
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
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

    /* Clickable Notices & Notifications Alert styles */
    .clickable-notice {
      cursor: pointer;
      position: relative;
      transition: var(--transition-normal);
    }
    .clickable-notice:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--primary);
    }
    .notice-tap-hint {
      font-size: 10px;
      color: var(--primary);
      text-align: right;
      margin-top: 8px;
      font-weight: 600;
    }
    .notif-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .clear-notif-btn {
      background: none;
      border: none;
      color: var(--primary);
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: var(--transition-fast);
    }
    .clear-notif-btn:hover {
      background-color: var(--primary-light);
    }
    .notif-card {
      border-left: 4px solid var(--neutral-400);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.01);
      padding: 12px 16px;
      margin-bottom: 12px;
    }
    .notif-card.unread {
      border-left-color: var(--primary);
      background-color: var(--primary-light);
      box-shadow: 0 2px 6px rgba(99, 102, 241, 0.05);
    }
    .notif-meta {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: var(--neutral-400);
      margin-bottom: 4px;
      font-weight: 600;
    }
    .notif-badge-icon {
      font-size: 14px;
    }
    .notif-msg {
      font-size: 12.5px;
      color: var(--neutral-700);
      line-height: 1.4;
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
  
  editUser = { name: '', phone: '', bio: '' };
  profilePreviewUrl: string | null = null;
  selectedProfilePic: File | null = null;
  updatingProfile = false;
  profileError = '';
  profileSuccess = '';
  notifications: any[] = [];

  activeToast: LiveNotification | null = null;
  private notifSub!: Subscription;
  isDarkMode = false;

  constructor(
    private authService: AuthService,
    private complaintService: ComplaintService,
    private socketService: SocketService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    const saved = localStorage.getItem('hh_dark_mode');
    if (saved === 'true') { this.isDarkMode = true; document.body.classList.add('dark-mode'); }
    this.loadTasks();
    this.loadNotifications();

    this.notifSub = this.socketService.notification$.subscribe(notif => {
      if (notif) {
        this.activeToast = notif;
        this.loadTasks();
        this.loadNotifications();
        this.cdr.detectChanges();
        setTimeout(() => this.clearToast(), 3000);
      }
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

  onFileChange(event: any, taskId: number): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFiles[taskId] = file;

      // Generate preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrls[taskId] = reader.result as string;
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

  getFilteredTasks(): any[] {
    if (this.filterStatus === 'all') {
      return this.tasks;
    }
    if (this.filterStatus === 'assigned') {
      return this.tasks.filter(t => t.status === 'assigned');
    }
    if (this.filterStatus === 'in_progress') {
      return this.tasks.filter(t => t.status === 'in_progress');
    }
    if (this.filterStatus === 'resolved') {
      return this.tasks.filter(t => t.status === 'resolved');
    }
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
}

