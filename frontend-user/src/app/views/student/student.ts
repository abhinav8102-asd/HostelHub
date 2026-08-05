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
import { ChatService, GroupChat, ChatMessage } from '../../services/chat.service';
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
          
          <!-- Notice Photo Attachment with Download option -->
          <div *ngIf="selectedNotice.photoUrl" style="margin-top: 14px; margin-bottom: 14px; text-align: center;">
            <img 
              [src]="getImageUrl(selectedNotice.photoUrl)" 
              style="max-width: 100%; max-height: 220px; border-radius: 8px; object-fit: cover; box-shadow: var(--shadow-sm); cursor: pointer;"
              alt="Notice Attachment"
              (click)="openPhotoModal(getImageUrl(selectedNotice.photoUrl))"
            />
            <div style="margin-top: 10px;">
              <a 
                [href]="getImageUrl(selectedNotice.photoUrl)" 
                target="_blank" 
                download 
                class="btn"
                style="background: var(--neutral-100); color: var(--neutral-800); font-size: 12px; padding: 7px 14px; border-radius: 6px; text-decoration: none; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; border: 1px solid var(--neutral-200);"
              >
                📥 Download Image
              </a>
            </div>
          </div>

          <button class="btn btn-primary" style="width:100%;margin-top:4px" (click)="closeNoticeModal()">Close</button>
        </div>
      </div>

      <!-- HEADER -->
      <div class="header" *ngIf="activeTab !== 'chat'">
        <div class="user-info" (click)="switchTab('my-profile')" style="cursor: pointer;" title="View Profile">
          <div class="avatar-ring">
            <span class="avatar" *ngIf="!user?.profilePicUrl">🎓</span>
            <img *ngIf="user?.profilePicUrl" [src]="getImageUrl(user.profilePicUrl)" (error)="onAvatarError($event)" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />
          </div>
          <div>
            <h3>{{ user?.name }}</h3>
            <p class="user-meta">{{ user?.hostelBlock }} · Room {{ user?.roomNumber }}</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="theme-toggle-btn" (click)="toggleDarkMode()" [title]="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            {{ isDarkMode ? '☀️' : '🌙' }}
          </button>
          <button class="logout-btn" (click)="logout()">
            <span>Logout</span>
            <span>🚪</span>
          </button>
        </div>
      </div>

      <!-- MAIN TABS CONTAINER -->
      <div class="tab-content-area">

        <!-- TAB 0: HOME / NOTICES -->
        <div *ngIf="activeTab === 'home'" class="tab-panel animate-fade">
          
          <!-- 1. Student Profile Card (Top Widget) -->
          <div class="card student-profile-card">
            <div class="profile-card-pattern"></div>
            <div class="profile-card-content">
              <div class="profile-user-img-wrapper">
                <span class="profile-avatar-emoji" *ngIf="!user?.profilePicUrl">🎓</span>
                <img *ngIf="user?.profilePicUrl" [src]="getImageUrl(user.profilePicUrl)" class="profile-user-img" />
              </div>
              <div class="profile-user-details">
                <div class="welcome-tag">Welcome back,</div>
                <h4 class="profile-user-name">{{ user?.name }}</h4>
                <div class="profile-pills">
                  <span class="profile-pill block-pill">🏢 {{ user?.hostelBlock || 'N/A' }}</span>
                  <span class="profile-pill room-pill">🔑 Room {{ user?.roomNumber || 'N/A' }}</span>
                  <span class="profile-pill batch-pill">🎓 {{ user?.batch || 'Batch 2025' }}</span>
                </div>
              </div>
              <div class="profile-quick-stats">
                <div class="stat-item clickable" (click)="switchTab('my-complaints')">
                  <span class="stat-count">{{ complaints.length }}</span>
                  <span class="stat-label">Total Tickets</span>
                </div>
                <div class="stat-item resolved clickable" (click)="switchTab('my-complaints')">
                  <span class="stat-count">{{ getResolvedCount() }}</span>
                  <span class="stat-label">Resolved</span>
                </div>
              </div>
            </div>
          </div>


          <!-- 2. Dynamic Warden Section -->
          <div class="section-header" style="margin-top: 32px;">
            <h4>👨‍💼 Your Hostel Wardens</h4>
            <p class="section-subtitle">Reach out to wardens assigned to your block for support and approvals.</p>
          </div>

          <div *ngIf="isLoadingWardens" class="skeleton-list">
            <div class="skeleton skeleton-card"></div>
            <div class="skeleton skeleton-card"></div>
          </div>

          <div class="warden-grid" *ngIf="!isLoadingWardens && wardens.length > 0">
            <div class="card warden-card animate-hover" *ngFor="let warden of wardens">
              <div class="warden-header">
                <div class="warden-avatar-wrapper">
                  <span class="warden-default-avatar" *ngIf="!warden.profilePicUrl">👨‍💼</span>
                  <img *ngIf="warden.profilePicUrl" [src]="getImageUrl(warden.profilePicUrl)" class="warden-img" />
                </div>
                <div class="warden-name-block">
                  <h5 class="warden-name">{{ warden.name }}</h5>
                  <span class="warden-tag">Block {{ warden.hostelBlock || 'All' }} Warden</span>
                </div>
              </div>
              <p class="warden-bio">{{ warden.bio || 'Available for hostel administration, mess regulations, and student support.' }}</p>
              <div class="warden-contact-list">
                <a [href]="'tel:' + warden.phone" class="warden-contact-link phone">
                  <span>📞 {{ warden.phone }}</span>
                </a>
                <a [href]="'mailto:' + warden.email" class="warden-contact-link email">
                  <span>✉️ {{ warden.email }}</span>
                </a>
              </div>
            </div>
          </div>
          <div *ngIf="!isLoadingWardens && wardens.length === 0" class="empty-state">
            <span class="empty-icon">👥</span>
            <p>No wardens registered in the system yet.</p>
          </div>

          <!-- 3. Dynamic Developer Team Section -->
          <div class="section-header" style="margin-top: 32px;">
            <h4>🚀 Meet the Developer Team</h4>
            <p class="section-subtitle">The creative minds behind the design, architecture, and maintenance of HostelHub.</p>
          </div>

          <div *ngIf="isLoadingPublicSettings" class="skeleton-list">
            <div class="skeleton skeleton-card"></div>
          </div>

          <div class="developer-grid" *ngIf="!isLoadingPublicSettings && publicSettings.developer_team?.length > 0">
            <div class="card developer-card animate-hover" *ngFor="let dev of publicSettings.developer_team">
              <div class="dev-avatar-wrapper">
                <img [src]="getImageUrl(dev.pic)" class="dev-img" />
                <div class="dev-role-badge">{{ dev.role }}</div>
              </div>
              <h5 class="dev-name">{{ dev.name }}</h5>
              <p class="dev-desc">{{ dev.description }}</p>

              <!-- Dynamic Clickable Social Links -->
              <div class="dev-social-links" style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 14px;">
                <a *ngIf="dev.github" [href]="dev.github" target="_blank" rel="noopener" class="social-icon-btn" title="GitHub Profile" (click)="$event.stopPropagation()">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                </a>
                <a *ngIf="dev.linkedin" [href]="dev.linkedin" target="_blank" rel="noopener" class="social-icon-btn" title="LinkedIn Profile" (click)="$event.stopPropagation()">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                <a *ngIf="dev.instagram || true" [href]="dev.instagram || 'https://instagram.com'" target="_blank" rel="noopener" class="social-icon-btn" title="Instagram Profile" (click)="$event.stopPropagation()">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a *ngIf="dev.twitter" [href]="dev.twitter" target="_blank" rel="noopener" class="social-icon-btn" title="Twitter Profile" (click)="$event.stopPropagation()">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                </a>
                <a *ngIf="dev.email" [href]="dev.email.startsWith('mailto:') ? dev.email : 'mailto:' + dev.email" target="_blank" rel="noopener" class="social-icon-btn" title="Email" (click)="$event.stopPropagation()">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </a>
              </div>
            </div>
          </div>

          <!-- 4. App Info/Description Section -->
          <div class="card app-info-card" style="margin-top: 32px;">
            <div class="app-info-grid">
              <div class="app-info-about">
                <div class="info-tag">Overview</div>
                <h4>What is HostelHub?</h4>
                <p>{{ publicSettings.app_about }}</p>
              </div>
              <div class="app-info-works">
                <div class="info-tag">Process</div>
                <h4>How It Works</h4>
                <div class="work-steps">
                  <div class="step-item" *ngFor="let step of splitLines(publicSettings.app_how_it_works)">
                    <div class="step-bullet">✓</div>
                    <p class="step-text">{{ step }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>


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
            <div style="width: 46px; height: 46px; border-radius: 50%; background: #fdf2f4; color: #b31031; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">👤</div>
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
              <div style="position: relative; width: 104px; height: 104px; border-radius: 50%; border: 3px solid #b31031; padding: 3px; background: var(--bg-card);">
                <div style="width: 100%; height: 100%; border-radius: 50%; overflow: hidden; background: #f1f5f9; display: flex; align-items: center; justify-content: center;">
                  <img *ngIf="profilePreviewUrl" [src]="profilePreviewUrl" (error)="profilePreviewUrl = null" style="width: 100%; height: 100%; object-fit: cover;" />
                  <span *ngIf="!profilePreviewUrl" style="font-size: 44px; color: #94a3b8;">🎓</span>
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
                <a href="mailto:support@hostelhub.com" style="background: var(--bg-muted); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 11.5px; font-weight: 600; padding: 6px 12px; border-radius: 20px; text-decoration: none; display: flex; align-items: center; gap: 6px;">
                  <span>✉️</span> support@hostelhub.com
                </a>
                <a href="tel:+919876543210" style="background: var(--bg-muted); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 11.5px; font-weight: 600; padding: 6px 12px; border-radius: 20px; text-decoration: none; display: flex; align-items: center; gap: 6px;">
                  <span>📞</span> +91 98765 43210
                </a>
              </div>
            </div>
          </form>

          <div class="card" style="padding: 18px; margin-top: 20px; border-radius: 18px; border: 1px solid var(--border-color); background: var(--bg-card); box-shadow: var(--shadow-sm);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
              <span style="width: 28px; height: 28px; border-radius: 50%; background: #fdf2f4; color: #b31031; display: flex; align-items: center; justify-content: center; font-size: 13px;">📋</span>
              <strong style="font-size: 15px; color: var(--text-primary);">My Attendance Records</strong>
            </div>
            
            <div *ngIf="isLoadingAttendance" class="skeleton-list">
              <div class="skeleton skeleton-card"></div>
            </div>

            <div *ngIf="!isLoadingAttendance && attendanceStats">
              <!-- Attendance Stats Metrics Grid -->
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px;">
                <div style="background: var(--bg-muted); border: 1px solid var(--border-color); border-radius: 12px; padding: 10px; text-align: center;">
                  <div style="font-size: 15px; font-weight: 800;" [style.color]="attendanceStats.percentage >= 75 ? '#166534' : '#b91c1c'">
                    {{ attendanceStats.percentage }}%
                  </div>
                  <div style="font-size: 9px; color: var(--text-muted); margin-top: 2px;">Attendance</div>
                </div>
                <div style="background: var(--bg-muted); border: 1px solid var(--border-color); border-radius: 12px; padding: 10px; text-align: center;">
                  <div style="font-size: 15px; font-weight: 800; color: var(--text-primary);">{{ attendanceStats.total }}</div>
                  <div style="font-size: 9px; color: var(--text-muted); margin-top: 2px;">Total Days</div>
                </div>
                <div style="background: #e6f4ea; border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 12px; padding: 10px; text-align: center;">
                  <div style="font-size: 15px; font-weight: 800; color: #166534;">{{ attendanceStats.present }}</div>
                  <div style="font-size: 9px; color: #166534; margin-top: 2px;">Present</div>
                </div>
                <div style="background: #fee2e2; border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; padding: 10px; text-align: center;">
                  <div style="font-size: 15px; font-weight: 800; color: #b91c1c;">{{ attendanceStats.absent }}</div>
                  <div style="font-size: 9px; color: #b91c1c; margin-top: 2px;">Absent</div>
                </div>
              </div>

              <!-- Attendance History List -->
              <strong style="font-size: 13px; color: var(--text-primary); display: block; margin-bottom: 8px;">Recent Days Roll Call</strong>
              <div class="comments-list" *ngIf="attendanceHistory.length > 0; else noAttendance" style="display: flex; flex-direction: column; gap: 8px;">
                <div *ngFor="let att of attendanceHistory" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-muted); border: 1px solid var(--border-color); border-radius: 10px;">
                  <span style="font-size: 12.5px; font-weight: 700; color: var(--text-primary);">
                    📅 {{ att.date | date:'EEEE, MMM d, y' }}
                  </span>
                  
                  <span 
                    [style.background]="att.status === 'present' ? '#e6f4ea' : '#fee2e2'"
                    [style.color]="att.status === 'present' ? '#166534' : '#b91c1c'"
                    style="font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 8px; text-transform: uppercase;"
                  >
                    {{ att.status }}
                  </span>
                </div>
              </div>
              <ng-template #noAttendance>
                <p style="font-size: 12px; color: var(--text-muted); text-align: center; padding: 12px 0;">No attendance records found yet.</p>
              </ng-template>

              <!-- Real-time Shield Note -->
              <div style="margin-top: 14px; background: #f0f9ff; border: 1px solid rgba(14, 165, 233, 0.2); border-radius: 12px; padding: 10px 14px; display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px; color: #0284c7;">🛡️</span>
                <span style="font-size: 11px; color: #0369a1;">Attendance is marked daily by Warden and updated in real-time.</span>
              </div>
            </div>
          </div>
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

                <button type="submit" class="btn btn-primary submit-feedback-btn">
                  Submit Feedback
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- TAB 6: BATCH GROUP CHAT -->
        <div *ngIf="activeTab === 'chat'" class="tab-panel animate-fade full-screen-chat-panel">

          <!-- Group Room Selector Bar if multiple available -->
          <div *ngIf="myChatGroups.length > 0" style="display: flex; gap: 8px; overflow-x: auto; padding: 14px 16px; background: var(--bg-card); border-bottom: 1px solid var(--border-color);">
            <button 
              type="button"
              *ngFor="let g of myChatGroups"
              (click)="openChatGroup(g)"
              [style.background]="activeChatGroup?.id === g.id ? '#8a0d24' : 'var(--bg-muted)'"
              [style.color]="activeChatGroup?.id === g.id ? 'white' : 'var(--text-primary)'"
              style="padding: 8px 16px; border-radius: 20px; border: 1px solid var(--border-color); font-size: 12.5px; font-weight: 700; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 6px; box-shadow: var(--shadow-sm);"
            >
              <span>👧 {{ g.name }}</span>
              <span *ngIf="activeChatGroup?.id === g.id" style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%;"></span>
              <span class="channel-badge animate-scale" *ngIf="unreadCounts[g.id] > 0">{{ unreadCounts[g.id] }}</span>
            </button>
          </div>

          <!-- Group Room Container Card -->
          <div class="card chat-room-container" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; flex: 1; border-radius: 0; border: none; background: var(--bg-card);">
            
            <!-- Room Header -->
            <div style="background: var(--bg-card); padding: 12px 16px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
              <div *ngIf="!isMultiSelectMode" style="display: flex; align-items: center; gap: 10px;">
                <button type="button" (click)="activeTab = 'home'" style="background: var(--bg-muted); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 50%; width: 34px; height: 34px; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;" title="Back to Dashboard">
                  ←
                </button>
                <div style="width: 38px; height: 38px; border-radius: 50%; background: var(--bg-muted); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">👥</div>
                <div>
                  <strong style="font-size: 14.5px; font-weight: 800; color: var(--text-primary); display: block;">
                    {{ activeChatGroup?.name || 'Boys - Batch 2023-2027' }}
                  </strong>
                  <span style="font-size: 10.5px; color: var(--text-muted); display: block;">
                    Official group chat for {{ activeChatGroup?.name || 'Batch 2023-2027 Boys' }}
                  </span>
                </div>
              </div>

              <!-- Normal Mode Right Action Bar -->
              <div *ngIf="!isMultiSelectMode" style="display: flex; align-items: center; gap: 8px;">
                <button type="button" class="btn" style="background: var(--bg-muted); color: var(--text-primary); border: 1px solid var(--border-color); font-size: 11.5px; font-weight: 700; padding: 6px 12px; border-radius: 12px; cursor: pointer;" (click)="toggleMultiSelectMode()">
                  Select
                </button>
              </div>

              <!-- Multi-Select Action Bar -->
              <div *ngIf="isMultiSelectMode" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                <span style="font-size: 13.5px; font-weight: 700; color: #b31031;">
                  ☑️ {{ selectedMessageIds.size }} selected
                </span>

                <div style="display: flex; align-items: center; gap: 8px;">
                  <button type="button" class="btn" style="background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border-color); font-size: 12px; padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer;" (click)="bulkDeleteForMe()" [disabled]="selectedMessageIds.size === 0">
                    🙈 Delete for Me
                  </button>
                  <button type="button" class="btn btn-primary" style="background: #ef4444; color: white; border: none; font-size: 12px; padding: 6px 12px; border-radius: 6px; font-weight: 700; cursor: pointer;" (click)="bulkDeleteForEveryone()" [disabled]="selectedMessageIds.size === 0">
                    💥 Delete for Everyone
                  </button>
                  <button type="button" class="btn" style="background: transparent; border: none; color: var(--text-muted); font-size: 16px; padding: 4px 8px; cursor: pointer;" (click)="clearMessageSelection()">
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <!-- Messages Stream Area -->
            <div id="studentChatFeed" style="flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; background: var(--bg-body);">

              <!-- Centered Today Date Divider Pill -->
              <div style="align-self: center; margin: 4px 0 8px 0; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-muted); font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 12px; box-shadow: var(--shadow-sm);">
                Today
              </div>

              <!-- Clean Spinner Loader -->
              <div *ngIf="isLoadingChat && chatMessages.length === 0" style="margin: auto; display: flex; flex-direction: column; align-items: center; gap: 10px; color: var(--text-muted); padding: 40px 0;">
                <div style="width: 32px; height: 32px; border: 3px solid rgba(179, 16, 49, 0.2); border-top-color: #b31031; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                <span style="font-size: 13px; font-weight: 600;">Loading chat messages...</span>
              </div>

              <div *ngIf="!isLoadingChat && chatMessages.length === 0" class="empty-state" style="margin: auto;">
                <span class="empty-icon">💬</span>
                <p>No messages yet in this group chat. Be the first to say hello!</p>
              </div>

              <div *ngFor="let msg of chatMessages; let i = index" 
                [style.align-self]="msg.senderId === user?.id ? 'flex-end' : 'flex-start'" 
                style="max-width: 82%; display: flex; align-items: flex-start; gap: 8px; position: relative;" 
                (click)="isMultiSelectMode ? toggleMessageSelection(msg.id, $event) : (!msg.isDeleted ? openDeleteOptions(msg) : null); $event.stopPropagation()"
                (contextmenu)="!msg.isDeleted ? openDeleteOptions(msg) : null; $event.preventDefault(); $event.stopPropagation()"
              >
                
                <!-- Left Circle Avatar (Non-Self Messages) -->
                <div *ngIf="msg.senderId !== user?.id" [style.background]="msg.sender?.role === 'warden' ? '#fdf2f4' : '#b31031'" style="width: 34px; height: 34px; border-radius: 50%; color: white; font-weight: 800; font-size: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 14px;">
                  <span *ngIf="msg.sender?.role === 'warden'" style="font-size: 16px;">👨‍💼</span>
                  <span *ngIf="msg.sender?.role !== 'warden'">{{ getInitials(msg.sender?.name || 'ST') }}</span>
                </div>

                <div style="display: flex; flex-direction: column; flex: 1; min-width: 0;">

                  <!-- Inline Delete Options Popover -->
                  <div *ngIf="selectedMsgForDelete?.id === msg.id && !isMultiSelectMode" 
                    [style.right]="msg.senderId === user?.id ? '0' : 'auto'"
                    [style.left]="msg.senderId === user?.id ? 'auto' : '0'"
                    [style.top]="i === 0 ? '100%' : 'auto'"
                    [style.bottom]="i === 0 ? 'auto' : '100%'"
                    style="position: absolute; z-index: 1000; background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 12px; padding: 6px; display: flex; flex-direction: column; gap: 4px; min-width: 175px; box-shadow: var(--shadow-lg);"
                    (click)="$event.stopPropagation()"
                  >
                    <button type="button" (click)="confirmDeleteForMe(); $event.stopPropagation()" style="background: transparent; border: none; color: var(--text-primary); text-align: left; padding: 8px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                      <span>🙈</span> Delete for Me
                    </button>
                    <button type="button" *ngIf="msg.senderId === user?.id || user?.role === 'warden' || user?.role === 'admin'" (click)="confirmDeleteForEveryone(); $event.stopPropagation()" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; text-align: left; padding: 8px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                      <span>💥</span> Delete for Everyone
                    </button>
                    <button type="button" (click)="startMultiSelectWithMsg(msg); $event.stopPropagation()" style="background: transparent; border: none; color: #94a3b8; text-align: left; padding: 6px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                      <span>☑️</span> Select Multiple
                    </button>
                  </div>

                  <!-- Sender Info for non-self messages -->
                  <div *ngIf="msg.senderId !== user?.id && !msg.isDeleted" [style.color]="msg.sender?.role === 'warden' ? '#b31031' : '#b31031'" style="font-size: 11.5px; font-weight: 800; margin-bottom: 3px; display: flex; align-items: center; gap: 6px;">
                    <span *ngIf="isMultiSelectMode" style="font-size: 12px;">{{ isMessageSelected(msg.id) ? '☑️' : '🔲' }}</span>
                    <span>{{ msg.sender?.name }}</span>
                  </div>

                  <!-- Normal Active Message Bubble -->
                  <div *ngIf="!msg.isDeleted"
                    [style.background]="isMessageSelected(msg.id) ? 'rgba(179, 16, 49, 0.25)' : (msg.senderId === user?.id ? 'linear-gradient(135deg, #8a0d24 0%, #b31031 100%)' : (msg.sender?.role === 'warden' ? 'linear-gradient(135deg, #8a0d24 0%, #b31031 100%)' : 'var(--bg-card)'))"
                    [style.color]="(msg.senderId === user?.id || msg.sender?.role === 'warden') ? 'white' : 'var(--text-primary)'"
                    [style.border]="isMessageSelected(msg.id) ? '2px solid #b31031' : (msg.senderId === user?.id || msg.sender?.role === 'warden' ? 'none' : '1px solid var(--border-color)')"
                    [style.border-radius]="msg.senderId === user?.id ? '18px 18px 4px 18px' : '18px 18px 18px 4px'"
                    style="padding: 12px 16px; font-size: 13.5px; line-height: 1.45; word-break: break-word; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 4px; cursor: pointer; position: relative;"
                  >
                    <!-- Warden Tag Header inside Warden bubble -->
                    <div *ngIf="msg.sender?.role === 'warden'" style="display: flex; align-items: center; justify-content: space-between; gap: 4px; font-size: 10px; font-weight: 800; opacity: 0.9; margin-bottom: 2px; color: white;">
                      <span (click)="openDeleteOptions(msg); $event.stopPropagation()" style="cursor: pointer; opacity: 0.7; font-size: 12px;" title="Delete Options">🗑️</span>
                      <div style="display: flex; align-items: center; gap: 4px;">
                        <span>Warden</span>
                        <span>🛡️</span>
                      </div>
                    </div>

                    <div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; width: 100%;">
                      <span *ngIf="msg.message" style="flex: 1;">{{ msg.message }}</span>
                      
                      <!-- Timestamp inside bubble -->
                      <span [style.color]="(msg.senderId === user?.id || msg.sender?.role === 'warden') ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)'" style="font-size: 9.5px; font-weight: 600; white-space: nowrap; display: flex; align-items: center; gap: 4px;">
                        <span>{{ msg.createdAt | date:'shortTime' }}</span>
                        <span *ngIf="msg.senderId === user?.id" style="margin-left: 2px;">✓✓</span>
                        <span *ngIf="msg.senderId !== user?.id && msg.sender?.role !== 'warden'" (click)="openDeleteOptions(msg); $event.stopPropagation()" style="cursor: pointer; opacity: 0.6; font-size: 11px;" title="Delete Options">🗑️</span>
                      </span>
                    </div>

                    <!-- Attached Image View -->
                    <div *ngIf="msg.attachmentUrl" style="margin-top: 6px; width: 100%; max-width: 100%; overflow: hidden; border-radius: 10px;">
                      <img 
                        [src]="getImageUrl(msg.attachmentUrl)" 
                        (load)="scrollChatToBottom()"
                        (click)="openPhotoModal(getImageUrl(msg.attachmentUrl)); $event.stopPropagation()"
                        style="width: 100%; max-width: 100%; max-height: 220px; border-radius: 10px; cursor: pointer; object-fit: cover; box-shadow: 0 2px 8px rgba(0,0,0,0.15); display: block;" 
                      />
                    </div>
                  </div>

                  <!-- Reaction Tag if available -->
                  <div *ngIf="!msg.isDeleted && msg.reactions?.length" style="align-self: flex-start; margin-top: -6px; margin-left: 10px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 2px 8px; font-size: 11px; display: flex; align-items: center; gap: 4px; box-shadow: var(--shadow-sm);">
                    <span>👍</span>
                    <span style="font-weight: 700; color: var(--text-muted);">{{ msg.reactions.length }}</span>
                  </div>

                  <!-- Deleted Message Placeholder Bubble -->
                  <div *ngIf="msg.isDeleted"
                    style="background: var(--bg-card); color: var(--text-muted); border: 1px dashed var(--border-color); border-radius: 14px; padding: 10px 14px; font-size: 12px; font-style: italic; display: flex; align-items: center; justify-content: space-between; gap: 8px;"
                  >
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="color: #ef4444;">🚫</span>
                      <span>This message was deleted by {{ msg.deletedByName || 'Warden Test' }}</span>
                    </div>
                    <span style="font-size: 9.5px; color: var(--text-muted); font-style: normal;">{{ msg.createdAt | date:'shortTime' }}</span>
                  </div>

                </div>

                <!-- Right Avatar Circle (Self Messages) -->
                <div *ngIf="msg.senderId === user?.id" style="width: 34px; height: 34px; border-radius: 50%; background: #fdf2f4; border: 1px solid #b31031; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 4px;">
                  <img *ngIf="user?.profilePicUrl" [src]="getImageUrl(user.profilePicUrl)" style="width: 100%; height: 100%; object-fit: cover;" />
                  <span *ngIf="!user?.profilePicUrl" style="font-weight: 800; font-size: 11px; color: #b31031;">{{ getInitials(user?.name || 'ST') }}</span>
                </div>

              </div>

            </div>

            <!-- Chat Input Preview Box -->
            <div *ngIf="chatFilePreviewUrl" style="padding: 10px 14px; background: var(--bg-muted); border-top: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <img [src]="chatFilePreviewUrl" style="width: 42px; height: 42px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-color);" />
                <span style="font-size: 12px; font-weight: 600; color: var(--text-primary);">📷 Photo attached</span>
              </div>
              <button type="button" (click)="clearChatFile()" style="background: none; border: none; color: #ef4444; font-size: 16px; cursor: pointer;">✕</button>
            </div>

            <!-- Chat Input Dock (Image 2 Mockup Format) -->
            <div style="padding: 12px 14px; background: var(--bg-card); border-top: 1px solid var(--border-color); display: flex; gap: 10px; align-items: center; width: 100%;">
              <input type="file" #chatFileInput (change)="onChatFileSelected($event)" accept="image/*" style="display: none;" />
              
              <!-- Left Plus Button -->
              <button 
                type="button" 
                (click)="selectPhoto('chat')"
                style="width: 42px; height: 42px; border-radius: 50%; background: #b31031; color: white; border: none; font-size: 20px; font-weight: 700; flex-shrink: 0; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 10px rgba(179, 16, 49, 0.3);"
              >
                +
              </button>

              <!-- Rounded Input Pill Container -->
              <div style="flex: 1; min-width: 0; height: 44px; border-radius: 22px; background: var(--bg-muted); border: 1px solid var(--border-color); display: flex; align-items: center; padding: 0 14px; gap: 8px;">
                <input 
                  type="text" 
                  id="studentChatInput"
                  style="flex: 1; min-width: 0; border: none; background: transparent; outline: none; font-size: 13.5px; color: var(--text-primary);"
                  placeholder="Type a message..." 
                  [(ngModel)]="newChatMessageText" 
                  (keydown.enter)="sendStudentChatMessage(); $event.preventDefault()"
                />
                <span (click)="selectPhoto('chat')" style="font-size: 16px; color: var(--text-muted); cursor: pointer;">📎</span>
                <span (click)="selectPhoto('chat')" style="font-size: 16px; color: var(--text-muted); cursor: pointer;">📷</span>
              </div>

              <!-- Send Circle Button -->
              <button 
                type="button" 
                (click)="sendStudentChatMessage()"
                [disabled]="sendingChatMessage || (!newChatMessageText.trim() && !selectedChatFile)"
                style="width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #8a0d24 0%, #b31031 100%); color: white; border: none; font-size: 16px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 10px rgba(138, 13, 36, 0.35);"
              >
                ➔
              </button>
            </div>

          </div>
        </div>

      </div>

      <!-- Bottom Tab Navigation (displayed as top-nav by global CSS) -->
      <div class="bottom-tabs" *ngIf="activeTab !== 'chat'">
        <button type="button" class="tab-item" [class.active]="activeTab === 'home'" (click)="switchTab('home')">
          <span class="tab-icon">🏠</span>
          <span>Home</span>
        </button>
        <button type="button" class="tab-item" [class.active]="activeTab === 'raise'" (click)="switchTab('raise')">
          <span class="tab-icon">➕</span>
          <span>Raise</span>
        </button>
        <button type="button" class="tab-item" [class.active]="activeTab === 'mess'" (click)="switchTab('mess')">
          <span class="tab-icon">🍴</span>
          <span>Mess</span>
        </button>
        <button type="button" class="tab-item" [class.active]="activeTab === 'chat'" (click)="switchTab('chat')">
          <span class="tab-icon">
            💬
            <span class="tab-badge animate-scale" *ngIf="totalUnreadChatCount > 0">{{ totalUnreadChatCount }}</span>
          </span>
          <span>Chat</span>
        </button>
        <button type="button" class="tab-item" [class.active]="activeTab === 'my-complaints'" (click)="switchTab('my-complaints')">
          <span class="tab-icon">📋</span>
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
      <div *ngIf="showExitAppModal" class="photo-modal" (click)="showExitAppModal = false" style="z-index: 99999;">
        <div class="card" (click)="$event.stopPropagation()" style="width: 88%; max-width: 340px; border-radius: 24px; padding: 24px; text-align: center; background: var(--bg-card); border: 1px solid var(--border-color); box-shadow: 0 20px 40px rgba(0,0,0,0.5); animation: modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #fee2e2; color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 26px; margin: 0 auto 14px;">🚪</div>
          <h3 style="margin: 0 0 6px 0; font-size: 18px; font-weight: 800; color: var(--text-primary);">Exit HostelHub?</h3>
          <p style="margin: 0 0 20px 0; font-size: 13px; color: var(--text-muted); line-height: 1.4;">Are you sure you want to exit the application?</p>
          
          <div style="display: flex; gap: 10px;">
            <button type="button" (click)="showExitAppModal = false" style="flex: 1; padding: 12px; border-radius: 14px; border: 1px solid var(--border-color); background: var(--bg-muted); color: var(--text-primary); font-size: 13.5px; font-weight: 700; cursor: pointer;">
              No, Cancel
            </button>
            <button type="button" (click)="confirmExitApp()" style="flex: 1; padding: 12px; border-radius: 14px; border: none; background: linear-gradient(135deg, #8a0d24 0%, #b31031 100%); color: white; font-size: 13.5px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(179, 16, 49, 0.35);">
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

      <!-- Original Clean Footer -->
      <footer class="footer animate-fade" *ngIf="activeTab !== 'chat'">
        <div class="footer-content" style="text-align: center; padding: 18px 14px; border-top: 1px solid var(--border-color); margin-top: 24px; background: var(--bg-card); border-radius: 16px;">
          <p class="footer-title" style="margin: 0 0 6px 0; font-size: 13.5px; font-weight: 800; color: var(--text-primary);">{{ footerSettings?.footer_text || 'HostelHub - Modern Hostel Management' }}</p>
          <div class="footer-meta" style="display: flex; justify-content: center; align-items: center; gap: 14px; font-size: 12px; color: var(--text-muted); flex-wrap: wrap;">
            <span>📧 {{ footerSettings?.footer_email || 'support@hostelhub.com' }}</span>
            <span>📞 {{ footerSettings?.footer_phone || '+91 98765 43210' }}</span>
          </div>
          <div style="margin-top: 8px; font-size: 11.5px; color: var(--text-muted); font-weight: 600;">
            Developed by HostelHub Engineering Team 💻
          </div>
          <p class="footer-copyright" style="margin: 8px 0 0 0; font-size: 10.5px; color: var(--text-muted);">{{ footerSettings?.footer_copyright || '© 2026 HostelHub Inc. All rights reserved.' }}</p>
        </div>
      </footer>
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
      padding: 24px 20px 80px;
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
  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  user: User | null = null;
  activeTab = 'home';
  complaints: any[] = [];
  announcements: any[] = [];
  notifications: any[] = [];
  isDarkMode = false;

  isLoadingComplaints = true;
  isLoadingAnnouncements = true;

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

  // Chat fields
  myChatGroups: any[] = [];
  activeChatGroup: any = null;
  chatMessages: any[] = [];
  newChatMessageText = '';
  isLoadingChat = false;
  sendingChatMessage = false;
  private chatSub!: Subscription;
  unreadCounts: { [groupId: number]: number } = {};
  get totalUnreadChatCount(): number {
    return Object.values(this.unreadCounts).reduce((acc, val) => acc + val, 0);
  }

  constructor(
    private authService: AuthService,
    private complaintService: ComplaintService,
    private socketService: SocketService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private messService: MessService,
    private attendanceService: AttendanceService,
    private chatService: ChatService
  ) {}

  switchTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'raise') {
      this.raiseError = '';
      this.raiseSuccess = '';
    } else if (tab === 'mess') {
      this.loadMessInfo();
    } else if (tab === 'chat') {
      this.loadMyChatGroups();
      if (this.activeChatGroup) {
        this.unreadCounts[this.activeChatGroup.id] = 0;
      }
      this.scrollChatToBottom();
    } else if (tab === 'my-complaints') {
      this.loadComplaints();
    } else if (tab === 'profile') {
      this.clearAllNotifications();
    } else if (tab === 'my-profile') {
      this.initProfileEdit();
      this.loadAttendanceStats();
    }
    try {
      if (tab !== 'chat') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) {}
    this.cdr.detectChanges();
    if (tab === 'chat') {
      this.scrollChatToBottom();
    }
  }

  showExitAppModal: boolean = false;
  private backButtonPluginSub: any = null;

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    this.loadAnnouncements();
    this.loadComplaints();
    this.loadNotifications();
    this.loadFooterSettings();
    this.loadMyChatGroups();
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

    // Subscribe to real-time group chat messages
    this.chatSub = this.chatService.onNewMessage().subscribe(msg => {
      if (this.activeChatGroup && msg.groupId === this.activeChatGroup.id && this.activeTab === 'chat') {
        this.handleIncomingStudentChatMessage(msg);
      } else {
        // Increment unread count for the group
        this.unreadCounts[msg.groupId] = (this.unreadCounts[msg.groupId] || 0) + 1;
        this.cdr.detectChanges();

        // Show toast notification for new messages in other chats or if not on the chat tab
        if (this.user && msg.senderId !== this.user.id) {
          const groupName = this.myChatGroups.find(g => g.id === msg.groupId)?.name || 'Group Chat';
          this.activeToast = {
            message: `💬 Message in "${groupName}" - ${msg.sender?.name || 'User'}: ${msg.message || 'sent an image'}`,
            type: 'complaint_update',
            createdAt: new Date()
          } as any;
          this.cdr.detectChanges();
          setTimeout(() => this.clearToast(), 3000);
        }
      }
    });

    // Subscribe to real-time message deletion events
    this.chatDeleteSub = this.chatService.onMessageDeletedEveryone().subscribe(data => {
      if (data) {
        const msg = this.chatMessages.find(m => m.id === data.messageId);
        if (msg) {
          msg.isDeleted = true;
          msg.deletedByName = data.deletedByName;
          this.cdr.detectChanges();
        }
      }
    });

    // Subscribe to real-time bulk message deletion events
    this.bulkChatDeleteSub = this.chatService.onBulkMessagesDeletedEveryone().subscribe(data => {
      if (this.activeChatGroup && data.groupId === this.activeChatGroup.id) {
        data.messageIds.forEach(id => {
          const msg = this.chatMessages.find(m => m.id === id);
          if (msg) {
            msg.isDeleted = true;
            msg.deletedByName = data.deletedByName;
          }
        });
        this.cdr.detectChanges();
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
        if (this.isMultiSelectMode || this.selectedMsgForDelete) {
          this.isMultiSelectMode = false;
          this.selectedMessageIds.clear();
          this.selectedMsgForDelete = null;
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

  confirmExitApp(): void {
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
        this.raiseSuccess = '✅ Ticket raise ho gaya!';
        // Show toast notification
        this.activeToast = { message: '✅ Aapka ticket successfully submit ho gaya! Warden jald hi assign karega.', type: 'info', createdAt: new Date() } as any;
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

  // Submit Feedback
  submitMessFeedback(): void {
    this.messSuccess = '';
    this.messError = '';
    const date = this.getTodayDateString();
    const feedbackData = {
      mealType: this.selectedMessMeal,
      date,
      rating: this.tempMessRating,
      comment: this.tempMessComment
    };

    this.messService.submitFeedback(feedbackData).subscribe({
      next: (res) => {
        this.messSuccess = '✅ ' + res.message;
        this.tempMessComment = '';
        this.tempMessRating = 5;
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

  // Group Chat Methods
  loadMyChatGroups(): void {
    this.isLoadingChat = true;
    const safetyTimer = setTimeout(() => {
      if (this.isLoadingChat) {
        this.isLoadingChat = false;
        this.cdr.detectChanges();
      }
    }, 4000);

    this.chatService.getMyGroups().subscribe({
      next: (groups) => {
        clearTimeout(safetyTimer);
        this.myChatGroups = groups;
        
        // Join all group rooms to receive notifications
        groups.forEach(g => this.chatService.joinGroupRoom(g.id));

        if (groups.length > 0) {
          this.openChatGroup(groups[0]);
        } else {
          this.isLoadingChat = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        clearTimeout(safetyTimer);
        console.error('Failed to load chat groups:', err);
        this.isLoadingChat = false;
        this.cdr.detectChanges();
      }
    });
  }

  openChatGroup(group: any): void {
    const isSameGroup = this.activeChatGroup && this.activeChatGroup.id === group.id;
    this.activeChatGroup = group;
    this.unreadCounts[group.id] = 0;
    if (!isSameGroup) {
      this.chatMessages = [];
      this.isLoadingChat = true;
    }

    this.chatService.getGroupMessages(group.id).subscribe({
      next: (res) => {
        this.chatMessages = res.messages;
        this.isLoadingChat = false;
        this.cdr.detectChanges();
        this.scrollChatToBottom();
      },
      error: (err) => {
        console.error('Failed to load group messages:', err);
        this.isLoadingChat = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectedChatFile: File | null = null;
  chatFilePreviewUrl: string | null = null;
  isUploadingImage: boolean = false;

  onChatFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedChatFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.chatFilePreviewUrl = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  clearChatFile(): void {
    this.selectedChatFile = null;
    this.chatFilePreviewUrl = null;
    this.cdr.detectChanges();
  }

  onChatStreamScroll(): void {
    const inputEl = document.getElementById('studentChatInput') as HTMLInputElement;
    if (inputEl && document.activeElement === inputEl) {
      inputEl.blur();
    }
  }

  sendStudentChatMessage(): void {
    if ((!this.newChatMessageText || !this.newChatMessageText.trim()) && !this.selectedChatFile) return;
    if (!this.activeChatGroup) return;

    const msgText = (this.newChatMessageText || '').trim();
    const fileToSend = this.selectedChatFile;
    const previewToSend = this.chatFilePreviewUrl;

    this.newChatMessageText = '';
    this.clearChatFile();

    if (fileToSend) {
      this.isUploadingImage = true;
      this.chatService.uploadChatImage(fileToSend).subscribe({
        next: (uploadRes) => {
          this.isUploadingImage = false;
          this.postChatMessageWithUrl(msgText, uploadRes.attachmentUrl, previewToSend || undefined);
        },
        error: (err) => {
          console.error('Failed to upload chat image:', err);
          this.isUploadingImage = false;
          this.postChatMessageWithUrl(msgText, previewToSend || undefined);
        }
      });
    } else {
      this.postChatMessageWithUrl(msgText);
    }
  }

  private postChatMessageWithUrl(msgText: string, attachmentUrl?: string, previewUrl?: string): void {
    const tempId = -Date.now();
    const tempMsg: any = {
      id: tempId,
      groupId: this.activeChatGroup?.id,
      senderId: this.user?.id,
      message: msgText,
      attachmentUrl: attachmentUrl || previewUrl,
      createdAt: new Date().toISOString(),
      sender: {
        id: this.user?.id,
        name: this.user?.name || 'Student',
        role: this.user?.role || 'student',
        roomNumber: this.user?.roomNumber
      }
    };

    this.chatMessages.push(tempMsg);
    this.cdr.detectChanges();
    this.scrollChatToBottom();

    if (!this.activeChatGroup) return;

    this.chatService.sendMessage(this.activeChatGroup.id, msgText, attachmentUrl).subscribe({
      next: (serverMsg) => {
        this.handleIncomingStudentChatMessage(serverMsg, tempId);
      },
      error: (err) => {
        console.error('Failed to send student message:', err);
        this.chatMessages = this.chatMessages.filter(m => m.id !== tempId);
        this.cdr.detectChanges();
      }
    });
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

  private handleIncomingStudentChatMessage(msg: ChatMessage, tempId?: number): void {
    if (tempId) {
      const tempIdx = this.chatMessages.findIndex(m => m.id === tempId);
      if (tempIdx !== -1) {
        const tempAttachment = this.chatMessages[tempIdx]?.attachmentUrl;
        const alreadyPresent = this.chatMessages.some(m => m.id === msg.id);
        if (alreadyPresent) {
          this.chatMessages.splice(tempIdx, 1);
        } else {
          if (!msg.attachmentUrl && tempAttachment) {
            msg.attachmentUrl = tempAttachment;
          }
          this.chatMessages[tempIdx] = msg;
        }
        this.cdr.detectChanges();
        this.scrollChatToBottom();
        return;
      }
    }

    if (this.chatMessages.some(m => m.id === msg.id)) {
      return;
    }

    if (msg.senderId === this.user?.id) {
      const tempIdx = this.chatMessages.findIndex(m => m.id < 0);
      if (tempIdx !== -1) {
        this.chatMessages[tempIdx] = msg;
        this.cdr.detectChanges();
        this.scrollChatToBottom();
        return;
      }
    }

    this.chatMessages.push(msg);
    this.cdr.detectChanges();
    this.scrollChatToBottom();
  }

  scrollChatToBottom(): void {
    const scrollFn = () => {
      const feed = document.getElementById('studentChatFeed');
      if (feed) {
        feed.scrollTop = feed.scrollHeight;
      }
    };
    scrollFn();
    setTimeout(scrollFn, 50);
    setTimeout(scrollFn, 150);
    setTimeout(scrollFn, 300);
    setTimeout(scrollFn, 500);
  }

  // Chat Deletion & Multi-Select Options
  selectedMsgForDelete: any = null;
  showDeleteOptionsModal = false;
  private chatDeleteSub!: Subscription;
  private bulkChatDeleteSub!: Subscription;

  isMultiSelectMode: boolean = false;
  selectedMessageIds: Set<number> = new Set<number>();

  toggleMultiSelectMode(): void {
    this.isMultiSelectMode = !this.isMultiSelectMode;
    if (!this.isMultiSelectMode) {
      this.selectedMessageIds.clear();
    }
    this.selectedMsgForDelete = null;
    this.cdr.detectChanges();
  }

  startMultiSelectWithMsg(msg: any): void {
    this.isMultiSelectMode = true;
    this.selectedMessageIds.clear();
    this.selectedMessageIds.add(msg.id);
    this.selectedMsgForDelete = null;
    this.cdr.detectChanges();
  }

  toggleMessageSelection(msgId: number, event?: Event): void {
    if (event) { event.stopPropagation(); }
    if (this.selectedMessageIds.has(msgId)) {
      this.selectedMessageIds.delete(msgId);
    } else {
      this.selectedMessageIds.add(msgId);
    }
    this.cdr.detectChanges();
  }

  isMessageSelected(msgId: number): boolean {
    return this.selectedMessageIds.has(msgId);
  }

  clearMessageSelection(): void {
    this.isMultiSelectMode = false;
    this.selectedMessageIds.clear();
    this.cdr.detectChanges();
  }

  bulkDeleteForMe(): void {
    if (this.selectedMessageIds.size === 0) return;
    this.chatMessages = this.chatMessages.filter(m => !this.selectedMessageIds.has(m.id));
    this.clearMessageSelection();
  }

  bulkDeleteForEveryone(): void {
    if (this.selectedMessageIds.size === 0) return;
    const ids = Array.from(this.selectedMessageIds);
    this.chatService.bulkDeleteMessagesForEveryone(ids).subscribe({
      next: (res) => {
        ids.forEach(id => {
          const msg = this.chatMessages.find(m => m.id === id);
          if (msg) {
            msg.isDeleted = true;
            msg.deletedByName = res.deletedByName || this.user?.name || 'User';
          }
        });
        this.clearMessageSelection();
      },
      error: (err) => {
        console.error('Failed to bulk delete messages:', err);
      }
    });
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.selectedMsgForDelete) {
      this.selectedMsgForDelete = null;
      this.cdr.detectChanges();
    }
    if (this.isMessMealDropdownOpen) {
      this.isMessMealDropdownOpen = false;
      this.cdr.detectChanges();
    }
  }

  openDeleteOptions(msg: any): void {
    if (this.selectedMsgForDelete && this.selectedMsgForDelete.id === msg.id) {
      this.selectedMsgForDelete = null;
    } else {
      this.selectedMsgForDelete = msg;
    }
    this.cdr.detectChanges();
  }

  closeDeleteOptions(): void {
    this.selectedMsgForDelete = null;
    this.showDeleteOptionsModal = false;
    this.cdr.detectChanges();
  }

  confirmDeleteForMe(): void {
    if (!this.selectedMsgForDelete) return;
    const targetId = this.selectedMsgForDelete.id;
    this.chatMessages = this.chatMessages.filter(m => m.id !== targetId);
    this.closeDeleteOptions();
  }

  confirmDeleteForEveryone(): void {
    if (!this.selectedMsgForDelete) return;
    const targetMsg = this.selectedMsgForDelete;
    this.closeDeleteOptions();

    if (targetMsg.id < 0) {
      // Temp message not yet on server
      this.chatMessages = this.chatMessages.filter(m => m.id !== targetMsg.id);
      this.cdr.detectChanges();
      return;
    }

    this.chatService.deleteMessageForEveryone(targetMsg.id).subscribe({
      next: (res) => {
        targetMsg.isDeleted = true;
        targetMsg.deletedByName = res.deletedByName || this.user?.name || 'User';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to delete message for everyone:', err);
      }
    });
  }

  async selectPhoto(type: 'complaint' | 'profile' | 'chat') {
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
          } else if (type === 'chat') {
            this.selectedChatFile = file;
            this.chatFilePreviewUrl = reader.result as string;
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
      } else if (type === 'chat') {
        const el = document.getElementById('chatFileInput') as HTMLInputElement;
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




