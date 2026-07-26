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
            <p class="user-meta">Full System Control</p>
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

        <!-- Tab Navigation -->
        <div class="admin-tab-nav">
          <button (click)="activeTab = 'stats'" [class.active]="activeTab === 'stats'">
            📊 Analytics
          </button>
          <button (click)="activeTab = 'users'" [class.active]="activeTab === 'users'">
            👥 Users
          </button>
          <button (click)="activeTab = 'create'" [class.active]="activeTab === 'create'">
            ➕ Create Staff
          </button>
          <button (click)="activeTab = 'settings'" [class.active]="activeTab === 'settings'">
            ⚙️ Settings
          </button>
          <button (click)="activeTab = 'my-profile'; initProfileEdit()" [class.active]="activeTab === 'my-profile'">
            👤 Profile
          </button>
        </div>

        <!-- TAB 0: ANALYTICS -->
        <div *ngIf="activeTab === 'stats'" class="tab-panel animate-fade">
          <h4 class="page-title">📊 Complaint Analytics</h4>

          <div class="stats-grid" *ngIf="analytics">
            <div class="stat-box blue">
              <span class="stat-icon">📋</span>
              <span class="stat-val">{{ analytics.summary.total }}</span>
              <span class="stat-lbl">Total Raised</span>
            </div>
            <div class="stat-box yellow">
              <span class="stat-icon">⏳</span>
              <span class="stat-val">{{ analytics.summary.pending }}</span>
              <span class="stat-lbl">Pending</span>
            </div>
            <div class="stat-box indigo">
              <span class="stat-icon">🔧</span>
              <span class="stat-val">{{ analytics.summary.inProgress + analytics.summary.assigned }}</span>
              <span class="stat-lbl">Active Works</span>
            </div>
            <div class="stat-box green">
              <span class="stat-icon">✅</span>
              <span class="stat-val">{{ analytics.summary.resolved }}</span>
              <span class="stat-lbl">Resolved</span>
            </div>
          </div>

          <div class="stat-skeleton" *ngIf="!analytics">
            <div class="skeleton" style="height:80px; border-radius: 16px;"></div>
            <div class="skeleton" style="height:80px; border-radius: 16px;"></div>
            <div class="skeleton" style="height:80px; border-radius: 16px;"></div>
            <div class="skeleton" style="height:80px; border-radius: 16px;"></div>
          </div>

          <div class="category-breakdown-card" *ngIf="analytics">
            <h5>Category Breakdown</h5>
            <div class="cat-list">
              <div class="cat-item" *ngFor="let cat of getCategories()">
                <div class="cat-meta-row">
                  <span class="cat-label">
                    <span class="cat-icon-inline">{{ getCategoryIcon(cat) }}</span>
                    <span class="cat-text">{{ cat | titlecase }}</span>
                  </span>
                  <span class="cat-val">{{ analytics.categories[cat] }}</span>
                </div>
                <div class="bar-container">
                  <div class="bar" [class]="cat" [style.width.%]="getBarWidth(analytics.categories[cat])"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 1: USERS LIST -->
        <div *ngIf="activeTab === 'users'" class="tab-panel animate-fade">
          <h4 class="page-title">👥 System Users</h4>

          <div class="users-list" *ngIf="users.length > 0; else noUsers">
            <div class="card user-card" *ngFor="let u of users">
              <div class="user-main">
                <div class="user-details">
                  <div class="user-icon-circle">
                    <span>{{ getRoleIcon(u.role) }}</span>
                  </div>
                  <div>
                    <h4 class="user-name">{{ u.name }}</h4>
                    <p class="user-email-lbl">{{ u.email }}</p>
                    <div class="user-meta-badges">
                      <span class="user-role-badge" [class]="u.role">{{ u.role | uppercase }}</span>
                      <span class="user-phone-lbl" *ngIf="u.phone">📞 {{ u.phone }}</span>
                    </div>
                  </div>
                </div>
                <div class="status-box">
                  <span class="status-indicator" [class.active]="u.status === 'active'"></span>
                  <span class="status-text">{{ u.status | titlecase }}</span>
                </div>
              </div>
              <div class="user-actions">
                <button
                  class="btn btn-toggle-status"
                  [class.deactivate]="u.status === 'active'"
                  (click)="toggleUserStatus(u.id, u.status)"
                >
                  <span>{{ u.status === 'active' ? '🚫 Deactivate' : '🔓 Activate' }}</span>
                </button>
                <button class="btn btn-delete-user" (click)="deleteUser(u.id, u.name)">
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
          <ng-template #noUsers>
            <div class="empty-state">
              <span class="empty-icon">👥</span>
              <p>No other users registered yet.</p>
            </div>
          </ng-template>
        </div>

        <!-- TAB 2: CREATE STAFF / WARDEN -->
        <div *ngIf="activeTab === 'create'" class="tab-panel animate-fade">
          <h4 class="page-title">➕ Add Warden / Staff</h4>

          <div class="form-container">
            <form (ngSubmit)="onCreateSubmit()" #createForm="ngForm">
              <div *ngIf="createError" class="alert alert-danger">{{ createError }}</div>
              <div *ngIf="createSuccess" class="alert alert-success">{{ createSuccess }}</div>

              <div class="form-group">
                <label class="form-label" for="staffName">Full Name</label>
                <input type="text" id="staffName" name="staffName" class="form-input" placeholder="e.g. Ramesh Electrician" [(ngModel)]="newStaff.name" required/>
              </div>

              <div class="form-group">
                <label class="form-label" for="staffEmail">Email Address</label>
                <input type="email" id="staffEmail" name="staffEmail" class="form-input" placeholder="e.g. ramesh@hostelhub.com" [(ngModel)]="newStaff.email" required email/>
              </div>

              <div class="form-group">
                <label class="form-label" for="staffRole">Role</label>
                <select id="staffRole" name="staffRole" class="form-input select-role" [(ngModel)]="newStaff.role" required>
                  <option value="" disabled selected>Select Role</option>
                  <option value="warden">Warden</option>
                  <option value="staff">Maintenance Staff</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="staffPhone">Phone Number</label>
                <input type="tel" id="staffPhone" name="staffPhone" class="form-input" placeholder="e.g. 9876543210" [(ngModel)]="newStaff.phone" required/>
              </div>

              <div class="form-group">
                <label class="form-label" for="staffPassword">Password</label>
                <input type="password" id="staffPassword" name="staffPassword" class="form-input" placeholder="Min 6 characters" [(ngModel)]="newStaff.password" required minlength="6"/>
              </div>

              <button type="submit" class="btn btn-primary btn-submit" [disabled]="!createForm.form.valid || creating">
                <span *ngIf="!creating">Create Account</span>
                <span *ngIf="creating">Creating...</span>
              </button>
            </form>
          </div>
        </div>

        <!-- TAB 3: Platform Settings -->
        <div *ngIf="activeTab === 'settings'" class="tab-panel animate-fade">
          <h4 class="page-title">⚙️ Platform Configurations</h4>
          
          <div *ngIf="settingsError" class="alert alert-danger">{{ settingsError }}</div>
          <div *ngIf="settingsSuccess" class="alert alert-success">{{ settingsSuccess }}</div>

          <!-- Section 1: Footer Settings -->
          <div class="card" style="margin-bottom: 24px;">
            <h5 style="margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; font-weight: 700; color: var(--primary);">📢 Footer Settings</h5>
            <form (ngSubmit)="onSaveSettingsSubmit()" #settingsForm="ngForm">
              <div class="form-group">
                <label class="form-label" for="footerText">Footer Subtext / Title</label>
                <input type="text" id="footerText" name="footerText" class="form-input" placeholder="e.g. Hostel Maintenance & Support Portal" [(ngModel)]="footerSettings.footer_text" required/>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="footerEmail">Support Email</label>
                  <input type="email" id="footerEmail" name="footerEmail" class="form-input" placeholder="e.g. support@hostelhub.com" [(ngModel)]="footerSettings.footer_email" required email/>
                </div>
                <div class="form-group">
                  <label class="form-label" for="footerPhone">Support Contact Number</label>
                  <input type="text" id="footerPhone" name="footerPhone" class="form-input" placeholder="e.g. +91 98765 43210" [(ngModel)]="footerSettings.footer_phone" required/>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" for="footerCopyright">Copyright Notice</label>
                <input type="text" id="footerCopyright" name="footerCopyright" class="form-input" placeholder="e.g. © 2026 HostelHub. All rights reserved." [(ngModel)]="footerSettings.footer_copyright" required/>
              </div>
              <button type="submit" class="btn btn-primary" style="max-width: 200px;" [disabled]="!settingsForm.form.valid || savingSettings">
                <span *ngIf="!savingSettings">Save Footer Config</span>
                <span *ngIf="savingSettings">Saving...</span>
              </button>
            </form>
          </div>

          <!-- Section 2: App Information -->
          <div class="card" style="margin-bottom: 24px;">
            <h5 style="margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; font-weight: 700; color: var(--primary);">ℹ️ App Description & About</h5>
            <form (ngSubmit)="onSavePublicSettingsSubmit()" #publicSettingsForm="ngForm">
              <div class="form-group">
                <label class="form-label" for="appAbout">About the App</label>
                <textarea id="appAbout" name="appAbout" class="form-input" rows="4" placeholder="Briefly describe what HostelHub is..." [(ngModel)]="publicSettings.app_about" required></textarea>
              </div>
              <div class="form-group">
                <label class="form-label" for="appHowItWorks">How it Works (One line per step)</label>
                <textarea id="appHowItWorks" name="appHowItWorks" class="form-input" rows="5" placeholder="Step-by-step procedure..." [(ngModel)]="publicSettings.app_how_it_works" required></textarea>
              </div>

              <!-- Section 3: Developer Team -->
              <h5 style="margin-top: 24px; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; font-weight: 700; color: var(--primary);">🚀 Manage Developer Team</h5>
              <div class="developer-settings-list" style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 16px;">
                <div class="card" *ngFor="let dev of publicSettings.developer_team; let idx = index" style="background-color: var(--bg-muted); margin-bottom: 0; padding: 18px; border: 1px solid var(--border-color);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong style="font-size: 13.5px; color: var(--primary);">Developer #{{ idx + 1 }}</strong>
                    <button type="button" class="btn-remove-file" style="color: var(--danger); border: none; background: none; font-weight: 700; cursor: pointer;" (click)="removeDeveloper(idx)">✕ Remove</button>
                  </div>
                  <div class="form-row" style="margin-bottom: 10px;">
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label">Full Name</label>
                      <input type="text" name="devName_{{idx}}" class="form-input" placeholder="e.g. Abhinav Kumar" [(ngModel)]="dev.name" required/>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label">Role</label>
                      <input type="text" name="devRole_{{idx}}" class="form-input" placeholder="e.g. Lead Full-Stack Developer" [(ngModel)]="dev.role" required/>
                    </div>
                  </div>
                  <div class="form-row" style="align-items: center; gap: 20px;">
                    <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                      <div style="width: 48px; height: 48px; border-radius: 50%; overflow: hidden; background: var(--bg-muted); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <img *ngIf="dev.pic" [src]="getImageUrl(dev.pic)" style="width: 100%; height: 100%; object-fit: cover;" />
                        <span *ngIf="!dev.pic" style="font-size: 20px;">🚀</span>
                      </div>
                      <div class="form-group" style="margin-bottom: 0; flex: 1;">
                        <label class="form-label" style="margin-bottom: 4px;">Avatar Photo</label>
                        <div style="display: flex; gap: 8px;">
                          <input type="text" name="devPic_{{idx}}" class="form-input" placeholder="Upload photo or paste link..." [(ngModel)]="dev.pic" required style="font-size: 12px;"/>
                          <button type="button" class="btn btn-secondary" style="padding: 0 12px; font-size: 12px; width: auto; white-space: nowrap;" (click)="devFileInput.click()">
                            📁 Upload
                          </button>
                          <input #devFileInput type="file" style="display: none;" (change)="onDevPhotoSelected($event, idx)" accept="image/*" />
                        </div>
                      </div>
                    </div>
                    <div class="form-group" style="margin-bottom: 0; flex: 1;">
                      <label class="form-label">Description / Bio</label>
                      <input type="text" name="devDesc_{{idx}}" class="form-input" placeholder="e.g. Expert in Angular architecture" [(ngModel)]="dev.description" required/>
                    </div>
                  </div>
                </div>
              </div>

              <button type="button" class="btn btn-secondary" style="margin-bottom: 20px; max-width: 200px;" (click)="addDeveloper()">
                ➕ Add Developer
              </button>

              <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
                <button type="submit" class="btn btn-primary" style="max-width: 250px;" [disabled]="!publicSettingsForm.form.valid || savingPublicSettings">
                  <span *ngIf="!savingPublicSettings">Save App & Team Config</span>
                  <span *ngIf="savingPublicSettings">Saving...</span>
                </button>
              </div>
            </form>
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
                  <span *ngIf="!profilePreviewUrl" style="font-size: 40px; color: #94a3b8;">👨‍💻</span>
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

      </div>

      <!-- Footer -->
      <footer class="footer animate-fade" *ngIf="footerSettings">
        <div class="footer-content">
          <p class="footer-title">{{ footerSettings.footer_text }}</p>
          <div class="footer-meta">
            <span *ngIf="footerSettings.footer_email">📧 {{ footerSettings.footer_email }}</span>
            <span *ngIf="footerSettings.footer_phone">📞 {{ footerSettings.footer_phone }}</span>
          </div>
          <p class="footer-copyright">{{ footerSettings.footer_copyright }}</p>
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
    .user-info { display: flex; align-items: center; gap: 12px; }
    .avatar-ring {
      width: 42px; height: 42px;
      background: rgba(99, 102, 241, 0.2);
      border: 1.5px solid rgba(99,102,241,0.6);
      border-radius: 50%;
      display: flex; justify-content: center; align-items: center;
      box-shadow: 0 0 14px rgba(99,102,241,0.25);
    }
    .avatar { font-size: 20px; }
    h3 { font-size: 15px; font-weight: 700; color: #f8fafc; }
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

    .tab-content-area {
      flex: 1;
      padding: 24px 20px;
      max-width: 900px;
      width: 100%;
      margin: 0 auto;
      background-color: var(--bg-body);
    }

    /* Admin Tab Nav */
    .admin-tab-nav {
      display: flex;
      background-color: var(--bg-card);
      padding: 4px;
      border-radius: var(--radius-md);
      margin-bottom: 24px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
      gap: 4px;
    }
    .admin-tab-nav button {
      flex: 1;
      background: none;
      border: none;
      padding: 10px;
      font-family: var(--font-sans);
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .admin-tab-nav button:hover { color: var(--primary); background: var(--primary-light); }
    .admin-tab-nav button.active {
      background: var(--primary);
      color: white;
      box-shadow: 0 4px 10px var(--primary-glow);
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 24px;
    }
    .stat-skeleton {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 24px;
    }
    .stat-box {
      padding: 20px;
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      color: white;
      position: relative;
      overflow: hidden;
      box-shadow: var(--shadow-md);
    }
    .stat-box::before {
      content: '';
      position: absolute;
      width: 80px;
      height: 80px;
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
      top: -20px;
      right: -20px;
    }
    .stat-icon { font-size: 28px; position: absolute; top: 14px; right: 16px; opacity: 0.4; }
    .stat-box.blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
    .stat-box.yellow { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .stat-box.indigo { background: linear-gradient(135deg, #6366f1, #4f46e5); }
    .stat-box.green { background: linear-gradient(135deg, #10b981, #047857); }
    .stat-val { font-size: 32px; font-weight: 800; line-height: 1; margin-top: 8px; }
    .stat-lbl { font-size: 10px; font-weight: 700; opacity: 0.85; text-transform: uppercase; margin-top: 6px; letter-spacing: 0.5px; }

    /* Category Breakdown */
    .category-breakdown-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: 20px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
    }
    .category-breakdown-card h5 {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-color);
    }
    .cat-list { display: flex; flex-direction: column; gap: 14px; }
    .cat-item { display: flex; flex-direction: column; gap: 6px; }
    .cat-meta-row { display: flex; justify-content: space-between; align-items: center; }
    .cat-label { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .cat-icon-inline { font-size: 17px; }
    .cat-val { font-size: 12.5px; font-weight: 700; color: var(--text-muted); }
    .bar-container {
      height: 8px;
      background: var(--bg-muted);
      border-radius: var(--radius-full);
      overflow: hidden;
      border: 1px solid var(--border-color);
    }
    .bar { height: 100%; border-radius: var(--radius-full); transition: width 0.5s ease-out; background: var(--primary); }
    .bar.electrical { background: linear-gradient(90deg, #fcd34d, #fbbf24); }
    .bar.plumbing { background: linear-gradient(90deg, #60a5fa, #3b82f6); }
    .bar.carpentry { background: linear-gradient(90deg, #fca5a5, #f87171); }
    .bar.cleaning { background: linear-gradient(90deg, #34d399, #10b981); }
    .bar.wifi { background: linear-gradient(90deg, #a78bfa, #8b5cf6); }
    .bar.others { background: linear-gradient(90deg, #94a3b8, #64748b); }

    /* User Cards */
    .user-card { display: flex; flex-direction: column; gap: 14px; }
    .user-main { display: flex; justify-content: space-between; align-items: flex-start; }
    .user-details { display: flex; gap: 12px; align-items: center; }
    .user-icon-circle {
      width: 42px; height: 42px;
      border-radius: 50%;
      background: var(--bg-muted);
      border: 1px solid var(--border-color);
      display: flex; justify-content: center; align-items: center;
      font-size: 20px;
    }
    .user-name { font-size: 14px; font-weight: 700; color: var(--text-primary); }
    .user-email-lbl { font-size: 11.5px; color: var(--text-muted); margin-top: 2px; }
    .user-meta-badges { display: flex; gap: 8px; align-items: center; margin-top: 5px; }
    .user-role-badge {
      font-size: 9px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      color: white;
      letter-spacing: 0.5px;
    }
    .user-role-badge.warden { background: #6366f1; }
    .user-role-badge.staff { background: #ec4899; }
    .user-role-badge.student { background: #10b981; }
    .user-phone-lbl { font-size: 10.5px; font-weight: 600; color: var(--text-secondary); }
    .status-box { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .status-indicator { width: 9px; height: 9px; border-radius: 50%; background: var(--neutral-400); box-shadow: 0 0 4px var(--neutral-400); }
    .status-indicator.active { background: var(--success); box-shadow: 0 0 8px var(--success); }
    .status-text { font-size: 10px; font-weight: 700; color: var(--text-muted); }
    .user-actions { border-top: 1px dashed var(--border-color); padding-top: 10px; display: flex; gap: 10px; flex-wrap: wrap; }
    .btn-toggle-status {
      background: rgba(16,185,129,0.12);
      border: 1px solid rgba(16,185,129,0.3);
      color: var(--success);
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 700;
      border-radius: var(--radius-sm);
      cursor: pointer;
      width: auto;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-family: var(--font-sans);
      transition: all var(--transition-fast);
    }
    .btn-toggle-status:hover { background: var(--success); color: white; }
    .btn-toggle-status.deactivate { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); color: var(--danger); }
    .btn-toggle-status.deactivate:hover { background: var(--danger); color: white; }
    .btn-delete-user {
      background: rgba(239,68,68,0.12);
      border: 1px solid rgba(239,68,68,0.35);
      color: #f87171;
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 700;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-family: var(--font-sans);
      transition: all var(--transition-fast);
    }
    .btn-delete-user:hover { background: #ef4444; color: white; }

    .select-role { background-color: var(--bg-input); }

    .form-container {
      background: var(--bg-card);
      border-radius: var(--radius-xl);
      padding: 24px;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
    }
    .btn-submit { margin-top: 12px; }

    /* Footer Styling */
    .footer {
      order: 4;
      background-color: var(--bg-card);
      border-top: 1px solid var(--border-color);
      padding: 24px 20px;
      margin-top: auto;
      text-align: center;
      width: 100%;
      box-shadow: 0 -4px 12px rgba(0,0,0,0.05);
    }
    .footer-content {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .footer-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .footer-meta {
      display: flex;
      justify-content: center;
      gap: 16px;
      font-size: 11.5px;
      color: var(--text-muted);
    }
    .footer-copyright {
      font-size: 10.5px;
      color: var(--text-muted);
      margin-top: 4px;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  user: User | null = null;
  activeTab: string = 'stats';
  
  editUser = { name: '', phone: '', bio: '' };
  profilePreviewUrl: string | null = null;
  selectedProfilePic: File | null = null;
  updatingProfile = false;
  profileError = '';
  profileSuccess = '';
  analytics: any = null;
  users: any[] = [];
  isDarkMode = false;

  newStaff = { name: '', email: '', role: '', phone: '', password: '' };
  creating = false;
  createError = '';
  createSuccess = '';

  footerSettings = {
    footer_text: '',
    footer_email: '',
    footer_phone: '',
    footer_copyright: ''
  };
  savingSettings = false;
  settingsError = '';
  settingsSuccess = '';

  publicSettings = {
    app_about: '',
    app_how_it_works: '',
    developer_team: [] as any[]
  };
  savingPublicSettings = false;

  constructor(
    private authService: AuthService,
    private complaintService: ComplaintService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    this.loadAnalytics();
    this.loadUsers();
    this.loadFooterSettings();
    this.loadPublicSettings();

    const saved = localStorage.getItem('hh_dark_mode');
    if (saved === 'true') {
      this.isDarkMode = true;
      document.body.classList.add('dark-mode');
    }
  }

  loadPublicSettings(): void {
    this.complaintService.getPublicSettings().subscribe({
      next: (res) => {
        this.publicSettings = res;
        if (!this.publicSettings.developer_team) {
          this.publicSettings.developer_team = [];
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load public settings:', err)
    });
  }

  onSavePublicSettingsSubmit(): void {
    this.savingPublicSettings = true;
    this.settingsError = '';
    this.settingsSuccess = '';
    this.complaintService.updatePublicSettings(this.publicSettings).subscribe({
      next: () => {
        this.savingPublicSettings = false;
        this.settingsSuccess = 'Application & Team configurations saved successfully!';
        setTimeout(() => this.settingsSuccess = '', 3000);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.savingPublicSettings = false;
        this.settingsError = err.error?.message || 'Error updating configurations.';
        this.cdr.detectChanges();
      }
    });
  }

  addDeveloper(): void {
    this.publicSettings.developer_team.push({
      name: '',
      role: '',
      description: '',
      pic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
    });
    this.cdr.detectChanges();
  }

  removeDeveloper(idx: number): void {
    this.publicSettings.developer_team.splice(idx, 1);
    this.cdr.detectChanges();
  }

  onDevPhotoSelected(event: any, idx: number): void {
    const file = event.target.files?.[0];
    if (file) {
      this.complaintService.uploadDeveloperPicture(file).subscribe({
        next: (res) => {
          if (res && res.url) {
            this.publicSettings.developer_team[idx].pic = res.url;
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          this.settingsError = err.error?.message || 'Failed to upload developer picture.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  getImageUrl(url: string | null | undefined): string {
    if (!url) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `https://hostelhub-0cyi.onrender.com/${url}`;
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

  loadAnalytics(): void {
    this.complaintService.getAnalytics().subscribe({
      next: (res) => { this.analytics = res; this.cdr.detectChanges(); },
      error: (err) => console.error(err)
    });
  }

  loadUsers(): void {
    this.complaintService.getAllUsers().subscribe({
      next: (res) => { this.users = res.filter((u: any) => u.id !== this.user?.id); this.cdr.detectChanges(); },
      error: (err) => console.error(err)
    });
  }

  loadFooterSettings(): void {
    this.complaintService.getFooterSettings().subscribe({
      next: (res) => { this.footerSettings = res; this.cdr.detectChanges(); },
      error: (err) => console.error(err)
    });
  }

  onSaveSettingsSubmit(): void {
    this.savingSettings = true;
    this.settingsError = '';
    this.settingsSuccess = '';
    this.complaintService.updateFooterSettings(this.footerSettings).subscribe({
      next: () => {
        this.savingSettings = false;
        this.settingsSuccess = 'Footer settings saved successfully!';
        setTimeout(() => this.settingsSuccess = '', 3000);
      },
      error: (err) => {
        this.savingSettings = false;
        this.settingsError = err.error?.message || 'Error updating footer settings.';
      }
    });
  }

  toggleUserStatus(userId: number, currentStatus: string): void {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    this.complaintService.updateUserStatus(userId, nextStatus).subscribe({
      next: () => { this.loadUsers(); this.loadAnalytics(); },
      error: (err) => console.error(err)
    });
  }

  deleteUser(userId: number, name: string): void {
    if (!confirm(`Are you sure you want to permanently delete user "${name}"? All their complaints, announcements and notifications will also be deleted.`)) return;
    this.users = this.users.filter(u => u.id !== userId);
    this.cdr.detectChanges();
    this.complaintService.deleteUser(userId).subscribe({
      next: () => { this.loadAnalytics(); },
      error: (err) => { this.loadUsers(); console.error(err); }
    });
  }

  onCreateSubmit(): void {
    this.creating = true;
    this.createError = '';
    this.createSuccess = '';
    this.cdr.detectChanges();
    this.complaintService.createStaffOrWarden(this.newStaff).subscribe({
      next: () => {
        this.creating = false;
        this.createSuccess = 'Account created successfully!';
        this.newStaff = { name: '', email: '', role: '', phone: '', password: '' };
        this.loadUsers();
        setTimeout(() => { this.activeTab = 'users'; this.createSuccess = ''; this.cdr.detectChanges(); }, 1000);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.creating = false;
        this.createError = err.error?.message || 'Error creating account.';
        this.cdr.detectChanges();
      }
    });
  }

  getCategories(): string[] { return Object.keys(this.analytics?.categories || {}); }
  getBarWidth(val: number): number { return (val / (this.analytics?.summary.total || 1)) * 100; }

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

  getRoleIcon(role: string): string {
    switch (role) {
      case 'admin': return '👨‍💻';
      case 'warden': return '👨‍💼';
      case 'staff': return '🛠️';
      default: return '👨‍🎓';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
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
}

