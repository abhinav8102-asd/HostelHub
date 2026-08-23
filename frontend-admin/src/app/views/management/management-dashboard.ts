import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { ManagementService } from '../../services/management.service';

@Component({
  selector: 'app-management-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="management-container animate-fade">
      <!-- Top Executive Header -->
      <div class="header">
        <div class="user-info">
          <div class="avatar-ring">
            <span class="avatar">👑</span>
          </div>
          <div>
            <h3>Executive Management Control Room</h3>
            <p class="user-meta">Live Institution Performance & Governance • 100% Real Database</p>
          </div>
        </div>

        <div class="header-actions">
          <button class="btn btn-export-pdf" (click)="exportCompliancePDF()" [disabled]="exportingPDF">
            <span>{{ exportingPDF ? 'Generating...' : '📄 1-Click NAAC/NIRF Audit Report' }}</span>
          </button>
          <button class="logout-btn" (click)="logout()">
            <span>Logout</span>
            <span>🚪</span>
          </button>
        </div>
      </div>

      <!-- Main Content Dashboard -->
      <div class="content-area">
        
        <!-- ROW 1: KPI STAT CARDS -->
        <div class="kpi-grid" *ngIf="stats">
          <div class="kpi-card crimson">
            <span class="kpi-icon">🏢</span>
            <div class="kpi-val">{{ stats.occupancyPercentage }}%</div>
            <div class="kpi-lbl">Hostel Occupancy Rate</div>
            <div class="kpi-sub">{{ stats.occupiedBeds }} / {{ stats.totalCapacity }} Beds Occupied</div>
          </div>

          <div class="kpi-card green">
            <span class="kpi-icon">📅</span>
            <div class="kpi-val">{{ stats.todayAttendance.attendancePercentage }}%</div>
            <div class="kpi-lbl">Today's Attendance Rate</div>
            <div class="kpi-sub">{{ stats.todayAttendance.present }} Present • {{ stats.todayAttendance.absent }} Absent</div>
          </div>

          <div class="kpi-card red" [class.pulse]="stats.complaintsMetric.overdueComplaints > 0">
            <span class="kpi-icon">🚨</span>
            <div class="kpi-val">{{ stats.complaintsMetric.overdueComplaints }}</div>
            <div class="kpi-lbl">Overdue Complaints (>48h)</div>
            <div class="kpi-sub">Requires Executive Escalation</div>
          </div>

          <div class="kpi-card blue">
            <span class="kpi-icon">👥</span>
            <div class="kpi-val">{{ stats.totalStudents }}</div>
            <div class="kpi-lbl">Active Enrolled Residents</div>
            <div class="kpi-sub">{{ stats.totalWardens }} Wardens • {{ stats.totalStaff }} Technicians</div>
          </div>
        </div>

        <!-- ROW 1.5: GRAPHICAL ANALYTICS WITH DAY / WEEK / MONTH FILTERS -->
        <div class="dashboard-card" style="border-color: #b31031;">
          <div class="card-header">
            <h4>📊 Executive Graphical Analytics Trends</h4>
            <div style="display: flex; gap: 6px;">
              <button 
                type="button" 
                (click)="switchPeriod('day')" 
                [style.background]="period === 'day' ? '#b31031' : '#1e293b'"
                style="color: white; border: 1px solid #475569; padding: 6px 14px; border-radius: 16px; font-size: 11.5px; font-weight: 700; cursor: pointer;"
              >
                Day
              </button>
              <button 
                type="button" 
                (click)="switchPeriod('week')" 
                [style.background]="period === 'week' ? '#b31031' : '#1e293b'"
                style="color: white; border: 1px solid #475569; padding: 6px 14px; border-radius: 16px; font-size: 11.5px; font-weight: 700; cursor: pointer;"
              >
                Weekly
              </button>
              <button 
                type="button" 
                (click)="switchPeriod('month')" 
                [style.background]="period === 'month' ? '#b31031' : '#1e293b'"
                style="color: white; border: 1px solid #475569; padding: 6px 14px; border-radius: 16px; font-size: 11.5px; font-weight: 700; cursor: pointer;"
              >
                Monthly
              </button>
            </div>
          </div>

          <div *ngIf="mgmtTrendData" style="display: flex; flex-direction: column; gap: 16px;">
            <!-- Trend Bar Charts -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(60px, 1fr)); gap: 8px; align-items: flex-end; height: 160px; padding: 12px 0; border-bottom: 1px solid #334155;">
              <div *ngFor="let item of mgmtTrendData.timeSeries" style="display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end;">
                <span style="font-size: 10px; font-weight: 700; color: #fecdd3;">{{ item.complaints }}</span>
                <div [style.height.%]="getBarHeight(item.complaints)" style="width: 24px; background: linear-gradient(180deg, #ef4444 0%, #b31031 100%); border-radius: 4px 4px 0 0; min-height: 10px;" [title]="item.date + ': ' + item.complaints + ' Complaints'"></div>
                <span style="font-size: 9px; color: #94a3b8; white-space: nowrap;">{{ item.label }}</span>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8;">
              <span>📈 Showing {{ period | uppercase }} Resolution & Activity Analytics</span>
              <span style="color: #10b981; font-weight: 700;">● Active Tracking System</span>
            </div>
          </div>
        </div>

        <!-- ROW 1.6: EXCEL SHEET BULK BATCH IMPORT -->
        <div class="dashboard-card" style="border-color: #3b82f6;">
          <div class="card-header">
            <h4>📂 Bulk Student Batch Creation (Upload Excel / CSV)</h4>
            <span class="badge-live" style="background: #3b82f6;">Excel / CSV Import</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
              <input type="text" class="form-input" placeholder="Enter Batch Name (e.g. Batch 2025)..." [(ngModel)]="bulkBatchName" style="max-width: 280px;" />
              <input type="file" #excelInput (change)="onExcelFileSelected($event)" accept=".csv, .txt, .json" style="display: none;" />
              <button class="btn btn-primary" (click)="excelInput.click()" style="background: #3b82f6;">
                📁 Pick CSV / Excel / JSON File
              </button>
            </div>

            <div *ngIf="excelParsedStudents.length > 0" style="background: #1e293b; border-radius: 8px; padding: 14px; border: 1px solid #475569;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 10px;">
                <span style="font-size: 12.5px; font-weight: 800; color: #10b981;">
                  ✅ Ready to import {{ excelParsedStudents.length }} student records into {{ bulkBatchName || 'Batch 2025' }}
                </span>
                <button class="btn btn-primary" (click)="uploadParsedBatch()" [disabled]="importingBatch">
                  {{ importingBatch ? 'Importing Batch...' : '🚀 Submit Batch Creation' }}
                </button>
              </div>

              <div style="max-height: 180px; overflow-y: auto;">
                <table style="width: 100%; font-size: 11px; text-align: left; border-collapse: collapse;">
                  <thead>
                    <tr style="color: #94a3b8; border-bottom: 1px solid #334155;">
                      <th style="padding: 4px 8px;">Name</th>
                      <th style="padding: 4px 8px;">Email</th>
                      <th style="padding: 4px 8px;">Roll No</th>
                      <th style="padding: 4px 8px;">Block/Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let s of excelParsedStudents.slice(0, 10)" style="border-bottom: 1px solid #1e293b;">
                      <td style="padding: 4px 8px; font-weight: 700;">{{ s.name }}</td>
                      <td style="padding: 4px 8px;">{{ s.email }}</td>
                      <td style="padding: 4px 8px;">{{ s.rollNumber || 'N/A' }}</td>
                      <td style="padding: 4px 8px;">{{ s.hostelBlock || 'A' }} - {{ s.roomNumber || '101' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div *ngIf="batchImportSuccess" style="color: #10b981; font-weight: 700; font-size: 12px;">{{ batchImportSuccess }}</div>
            <div *ngIf="batchImportError" style="color: #ef4444; font-weight: 700; font-size: 12px;">{{ batchImportError }}</div>
          </div>
        </div>

        <!-- ROW 1.7: TERMINATION CONTROL CENTER -->
        <div class="dashboard-card" style="border-color: #ef4444;">
          <div class="card-header">
            <h4>🛑 Termination Control Center (Single User & Full Batch)</h4>
            <span class="badge-live" style="background: #ef4444;">Executive Action</span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <!-- Single User Termination -->
            <div style="background: #1e293b; border-radius: 8px; padding: 14px; border: 1px solid #475569;">
              <h5 style="margin: 0 0 8px 0; color: #fca5a5; font-size: 13px;">🚫 Terminate / Block Single User ID</h5>
              <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                <input type="number" class="form-input" placeholder="Enter User ID to Terminate..." [(ngModel)]="terminateUserIdInput" />
                <button class="btn" style="background: #ef4444; color: white; font-weight: 700; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer;" (click)="executeSingleUserTermination()">
                  Terminate ID
                </button>
              </div>
              <p style="font-size: 10px; color: #94a3b8; margin: 0;">Deactivates access immediately for Warden, Student, or Staff.</p>
            </div>

            <!-- Bulk Batch Termination -->
            <div style="background: #1e293b; border-radius: 8px; padding: 14px; border: 1px solid #ef4444;">
              <h5 style="margin: 0 0 8px 0; color: #f87171; font-size: 13px;">💥 Terminate Entire Batch</h5>
              <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                <input type="text" class="form-input" placeholder="Enter Batch Name (e.g. Batch 2021)..." [(ngModel)]="terminateBatchNameInput" />
                <button class="btn" style="background: #dc2626; color: white; font-weight: 800; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer;" (click)="executeBatchTermination()">
                  1-Click Terminate Batch
                </button>
              </div>
              <p style="font-size: 10px; color: #fca5a5; margin: 0;">WARNING: Blocks all student IDs associated with this batch at once.</p>
            </div>
          </div>
        </div>

        <!-- ROW 2: INTERACTIVE COMPLAINT FLOWCHART -->
        <div class="dashboard-card" *ngIf="analytics">
          <div class="card-header">
            <h4>🔄 Complaint Lifecycle Resolution Flowchart</h4>
            <span class="badge-live">Live Database Sync</span>
          </div>

          <div class="flowchart-grid">
            <div class="flow-step">
              <span class="flow-icon">📝</span>
              <div class="flow-num">{{ analytics.flowchart.raised }}</div>
              <div class="flow-title">1. Student Raised</div>
            </div>
            <div class="flow-arrow">&rarr;</div>

            <div class="flow-step">
              <span class="flow-icon">📥</span>
              <div class="flow-num">{{ analytics.flowchart.received }}</div>
              <div class="flow-title">2. Warden Received</div>
            </div>
            <div class="flow-arrow">&rarr;</div>

            <div class="flow-step">
              <span class="flow-icon">🔧</span>
              <div class="flow-num">{{ analytics.flowchart.assigned }}</div>
              <div class="flow-title">3. Staff Assigned</div>
            </div>
            <div class="flow-arrow">&rarr;</div>

            <div class="flow-step warning">
              <span class="flow-icon">⚡</span>
              <div class="flow-num">{{ analytics.flowchart.inProgress }}</div>
              <div class="flow-title">4. Work In-Progress</div>
            </div>
            <div class="flow-arrow">&rarr;</div>

            <div class="flow-step success">
              <span class="flow-icon">✅</span>
              <div class="flow-num">{{ analytics.flowchart.resolved }}</div>
              <div class="flow-title">5. Fully Resolved</div>
            </div>
          </div>
        </div>

        <!-- ROW 3: FLOOR CAPACITY HEATMAP GRID -->
        <div class="dashboard-card" *ngIf="heatmap">
          <div class="card-header">
            <h4>🗺️ Hostel Floor Capacity & Room Occupancy Heatmap</h4>
            <div class="heatmap-legend">
              <span class="legend-item occupied"><span class="dot"></span> Occupied</span>
              <span class="legend-item vacant"><span class="dot"></span> Vacant</span>
              <span class="legend-item maintenance"><span class="dot"></span> Maintenance</span>
            </div>
          </div>

          <div class="heatmap-blocks-grid">
            <div class="block-heatmap-card" *ngFor="let block of heatmap">
              <h5>{{ block.blockName }}</h5>
              <div class="floor-row" *ngFor="let floor of block.floors">
                <span class="floor-lbl">Floor {{ floor.floorNumber }}</span>
                <div class="rooms-grid">
                  <div 
                    class="room-pill" 
                    *ngFor="let room of floor.rooms"
                    [class]="room.status"
                    [title]="room.roomNumber + ' - ' + (room.resident ? room.resident.name : room.status)"
                  >
                    {{ room.roomNumber }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ROW 4: SLA SPEED BAR GRAPH & CATEGORY PIE -->
        <div class="two-col-grid" *ngIf="analytics">
          <div class="dashboard-card">
            <div class="card-header">
              <h4>⏱️ SLA Resolution Speed (Avg Hours to Resolve)</h4>
            </div>
            <div class="sla-bar-list">
              <div class="sla-bar-item" *ngFor="let sla of analytics.slaSpeed">
                <div class="sla-meta">
                  <span>{{ sla.block }}</span>
                  <strong>{{ sla.avgResolutionHours }} hrs avg</strong>
                </div>
                <div class="bar-bg">
                  <div class="bar-fill" [style.width.%]="(sla.avgResolutionHours / 12) * 100"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="dashboard-card">
            <div class="card-header">
              <h4>📊 Complaint Category Breakdown</h4>
            </div>
            <div class="cat-grid">
              <div class="cat-box" *ngFor="let cat of analytics.categoryStats">
                <span class="cat-name">{{ cat.category }}</span>
                <span class="cat-count">{{ cat.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ROW 5: STUDENT 360° LOOKUP & MESS SCORECARD -->
        <div class="two-col-grid">
          <div class="dashboard-card">
            <div class="card-header">
              <h4>🔎 Student 360° Profile Lookup</h4>
            </div>
            <div class="search-box">
              <input 
                type="text" 
                class="form-input" 
                placeholder="Enter Student Name or Roll Number..." 
                [(ngModel)]="searchQuery" 
                (keyup.enter)="searchStudent360()" 
              />
              <button class="btn btn-primary" (click)="searchStudent360()" [disabled]="searchingStudent">Search</button>
            </div>

            <div class="student-360-card" *ngIf="student360">
              <div class="student-head">
                <span class="student-avatar">👤</span>
                <div>
                  <h5>{{ student360.student.name }}</h5>
                  <p>{{ student360.student.rollNumber || 'No Roll No' }} • {{ student360.student.hostelBlock }}, Room {{ student360.student.roomNumber }}</p>
                </div>
              </div>
              <div class="student-stats">
                <div class="s-stat">
                  <span>Attendance</span>
                  <strong>{{ student360.attendanceSummary.attendancePercentage }}%</strong>
                </div>
                <div class="s-stat">
                  <span>Complaints Filed</span>
                  <strong>{{ student360.complaintsHistory.length }}</strong>
                </div>
              </div>
            </div>
          </div>

          <div class="dashboard-card" *ngIf="messScorecard">
            <div class="card-header">
              <h4>🍽️ Mess Meal Scorecard & Rating Feedback</h4>
            </div>
            <div class="mess-ratings-grid">
              <div class="meal-rating-card" *ngFor="let meal of messScorecard.scorecard">
                <span class="meal-title">{{ meal.mealType | uppercase }}</span>
                <div class="rating-stars">
                  ⭐ {{ meal.avgRating }} / 5.0
                </div>
                <span class="feedback-count">{{ meal.totalFeedbacks }} Reviews</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ROW 6: REAL-TIME AUDIT TRAIL FEED -->
        <div class="dashboard-card" *ngIf="auditLogs">
          <div class="card-header">
            <h4>🛡️ System-Wide Real-Time Activity Audit Trail</h4>
            <span class="badge-live">Live Log Feed</span>
          </div>

          <div class="audit-feed-list">
            <div class="audit-item" *ngFor="let log of auditLogs">
              <span class="audit-badge" [class]="log.type">{{ log.type }}</span>
              <div class="audit-body">
                <strong>{{ log.title }}</strong>
                <p>{{ log.description }}</p>
              </div>
              <span class="audit-time">{{ log.timestamp | date:'shortTime' }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .management-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: #0f172a;
      color: #ffffff;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .header {
      background: linear-gradient(135deg, #2c080f 0%, #4c0615 50%, #0f172a 100%);
      color: #ffffff;
      padding: 16px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #b31031;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    .user-info { display: flex; align-items: center; gap: 14px; }
    .avatar-ring {
      width: 46px; height: 46px;
      background: #b31031;
      border-radius: 50%;
      display: flex; justify-content: center; align-items: center;
      box-shadow: 0 0 14px rgba(179,16,49,0.5);
    }
    .avatar { font-size: 22px; }
    h3 { font-size: 18px; font-weight: 800; color: #ffffff; margin: 0; }
    .user-meta { font-size: 11.5px; color: #fecdd3; margin-top: 2px; }
    .header-actions { display: flex; align-items: center; gap: 12px; }
    
    .btn-export-pdf {
      background: #b31031;
      color: white;
      border: 1px solid #fecdd3;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(179, 16, 49, 0.4);
      transition: all 0.2s ease;
    }
    .btn-export-pdf:hover { background: #991b1b; }

    .logout-btn {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid #ef4444;
      color: #fca5a5;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 20px;
      cursor: pointer;
    }

    .content-area {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    /* KPI Cards */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .kpi-card {
      background: rgba(15, 23, 42, 0.8);
      border-radius: 12px;
      padding: 18px;
      border: 1px solid #334155;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .kpi-card.crimson { border-color: #b31031; background: linear-gradient(135deg, #2c080f 0%, #1e293b 100%); }
    .kpi-card.green { border-color: #10b981; }
    .kpi-card.red { border-color: #ef4444; }
    .kpi-card.blue { border-color: #3b82f6; }
    .kpi-card.pulse { animation: pulseAlert 1.5s infinite; }

    @keyframes pulseAlert {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }

    .kpi-icon { font-size: 26px; position: absolute; top: 16px; right: 16px; opacity: 0.5; }
    .kpi-val { font-size: 32px; font-weight: 900; line-height: 1; color: #ffffff; }
    .kpi-lbl { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin-top: 6px; }
    .kpi-sub { font-size: 10.5px; color: #cbd5e1; margin-top: 4px; }

    /* Dashboard Cards */
    .dashboard-card {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      border-bottom: 1px solid #334155;
      padding-bottom: 10px;
    }
    .card-header h4 { margin: 0; color: #fecdd3; font-size: 15px; font-weight: 700; }
    .badge-live { background: #b31031; color: white; padding: 3px 9px; border-radius: 10px; font-size: 9.5px; font-weight: 800; text-transform: uppercase; }

    /* Flowchart */
    .flowchart-grid {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }
    .flow-step {
      flex: 1;
      background: #1e293b;
      border: 1px solid #475569;
      border-radius: 10px;
      padding: 14px;
      text-align: center;
    }
    .flow-step.warning { border-color: #f59e0b; }
    .flow-step.success { border-color: #10b981; }
    .flow-icon { font-size: 24px; display: block; margin-bottom: 4px; }
    .flow-num { font-size: 24px; font-weight: 800; color: #ffffff; }
    .flow-title { font-size: 11px; color: #94a3b8; font-weight: 600; margin-top: 2px; }
    .flow-arrow { font-size: 20px; color: #b31031; font-weight: 900; }

    /* Heatmap */
    .heatmap-legend { display: flex; gap: 14px; font-size: 11px; }
    .legend-item { display: flex; align-items: center; gap: 4px; color: #cbd5e1; }
    .legend-item .dot { width: 10px; height: 10px; border-radius: 3px; }
    .legend-item.occupied .dot { background: #10b981; }
    .legend-item.vacant .dot { background: #3b82f6; }
    .legend-item.maintenance .dot { background: #f59e0b; }

    .heatmap-blocks-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .block-heatmap-card {
      background: #1e293b;
      border-radius: 8px;
      padding: 12px;
      border: 1px solid #475569;
    }
    .block-heatmap-card h5 { margin: 0 0 10px 0; color: #fecdd3; font-size: 13px; }
    .floor-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .floor-lbl { font-size: 10px; font-weight: 700; color: #94a3b8; width: 50px; }
    .rooms-grid { display: flex; gap: 4px; flex-wrap: wrap; flex: 1; }
    .room-pill {
      font-size: 9px;
      font-weight: 800;
      padding: 3px 6px;
      border-radius: 4px;
      color: white;
      cursor: pointer;
    }
    .room-pill.occupied { background: #10b981; }
    .room-pill.vacant { background: #3b82f6; }
    .room-pill.maintenance { background: #f59e0b; }

    /* Grid Layouts */
    .two-col-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    /* SLA Bar Chart */
    .sla-bar-list { display: flex; flex-direction: column; gap: 12px; }
    .sla-meta { display: flex; justify-content: space-between; font-size: 11.5px; color: #cbd5e1; margin-bottom: 4px; }
    .bar-bg { height: 10px; background: #334155; border-radius: 5px; overflow: hidden; }
    .bar-fill { height: 100%; background: linear-gradient(90deg, #b31031, #ef4444); border-radius: 5px; }

    /* Category breakdown */
    .cat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .cat-box { background: #1e293b; padding: 10px; border-radius: 8px; border: 1px solid #475569; display: flex; flex-direction: column; align-items: center; }
    .cat-name { font-size: 10.5px; color: #94a3b8; text-align: center; }
    .cat-count { font-size: 18px; font-weight: 800; color: #ffffff; margin-top: 4px; }

    /* Search & Student 360 */
    .search-box { display: flex; gap: 8px; margin-bottom: 12px; }
    .form-input { flex: 1; background: #1e293b; border: 1px solid #475569; border-radius: 8px; padding: 8px 12px; color: white; }
    .btn-primary { background: #b31031; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; }
    
    .student-360-card { background: #1e293b; border-radius: 8px; padding: 12px; border: 1px solid #b31031; }
    .student-head { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; }
    .student-avatar { font-size: 24px; }
    .student-head h5 { margin: 0; color: white; font-size: 13px; }
    .student-head p { margin: 2px 0 0 0; font-size: 10.5px; color: #94a3b8; }
    .student-stats { display: flex; gap: 20px; }
    .s-stat span { display: block; font-size: 10px; color: #94a3b8; }
    .s-stat strong { font-size: 14px; color: #10b981; }

    /* Mess Scorecard */
    .mess-ratings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .meal-rating-card { background: #1e293b; padding: 12px; border-radius: 8px; border: 1px solid #475569; text-align: center; }
    .meal-title { font-size: 10.5px; font-weight: 800; color: #fecdd3; }
    .rating-stars { font-size: 14px; font-weight: 800; color: #f59e0b; margin: 4px 0; }
    .feedback-count { font-size: 9.5px; color: #94a3b8; }

    /* Audit Trail Feed */
    .audit-feed-list { display: flex; flex-direction: column; gap: 10px; max-height: 250px; overflow-y: auto; }
    .audit-item { display: flex; align-items: center; gap: 12px; background: #1e293b; padding: 10px 14px; border-radius: 8px; border: 1px solid #334155; }
    .audit-badge { font-size: 8.5px; font-weight: 800; padding: 3px 6px; border-radius: 4px; background: #b31031; color: white; }
    .audit-body { flex: 1; }
    .audit-body strong { font-size: 11px; color: white; display: block; }
    .audit-body p { font-size: 10px; color: #94a3b8; margin: 2px 0 0 0; }
    .audit-time { font-size: 9.5px; color: #64748b; }
  `]
})
export class ManagementDashboardComponent implements OnInit {
  user: User | null = null;
  stats: any = null;
  heatmap: any = null;
  analytics: any = null;
  messScorecard: any = null;
  auditLogs: any = null;

  searchQuery = '';
  searchingStudent = false;
  student360: any = null;

  exportingPDF = false;

  constructor(
    private authService: AuthService,
    private managementService: ManagementService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    this.loadData();
  }

  loadData(): void {
    this.loadGraphicalAnalytics();
    this.managementService.getExecutiveStats().subscribe({
      next: (res) => { this.stats = res; this.cdr.detectChanges(); },
      error: (err) => console.error('Error stats:', err)
    });

    this.managementService.getOccupancyHeatmap().subscribe({
      next: (res) => { this.heatmap = res; this.cdr.detectChanges(); },
      error: (err) => console.error('Error heatmap:', err)
    });

    this.managementService.getComplaintsAnalytics().subscribe({
      next: (res) => { this.analytics = res; this.cdr.detectChanges(); },
      error: (err) => console.error('Error analytics:', err)
    });

    this.managementService.getMessScorecard().subscribe({
      next: (res) => { this.messScorecard = res; this.cdr.detectChanges(); },
      error: (err) => console.error('Error mess:', err)
    });

    this.managementService.getAuditLogs().subscribe({
      next: (res) => { this.auditLogs = res; this.cdr.detectChanges(); },
      error: (err) => console.error('Error audit:', err)
    });
  }

  searchStudent360(): void {
    if (!this.searchQuery.trim()) return;
    this.searchingStudent = true;
    this.managementService.getStudent360(this.searchQuery).subscribe({
      next: (res) => {
        this.student360 = res;
        this.searchingStudent = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert('Student not found.');
        this.searchingStudent = false;
        this.cdr.detectChanges();
      }
    });
  }

  exportCompliancePDF(): void {
    this.exportingPDF = true;
    this.managementService.exportCompliancePDF().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'HostelHub_NAAC_NIRF_Compliance_Report.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
        this.exportingPDF = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert('Failed to export PDF.');
        this.exportingPDF = false;
        this.cdr.detectChanges();
      }
    });
  }

  period = 'week';
  mgmtTrendData: any = null;
  bulkBatchName = 'Batch 2025';
  excelParsedStudents: any[] = [];
  importingBatch = false;
  batchImportSuccess = '';
  batchImportError = '';
  terminateUserIdInput: number | null = null;
  terminateBatchNameInput = '';

  switchPeriod(newPeriod: string): void {
    this.period = newPeriod;
    this.loadGraphicalAnalytics();
  }

  loadGraphicalAnalytics(): void {
    this.managementService.getManagementAnalytics(this.period).subscribe({
      next: (res) => {
        this.mgmtTrendData = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching analytics trend:', err)
    });
  }

  getBarHeight(val: number): number {
    if (!this.mgmtTrendData || !this.mgmtTrendData.timeSeries) return 10;
    const maxVal = Math.max(...this.mgmtTrendData.timeSeries.map((t: any) => t.complaints), 1);
    return Math.max(Math.round((val / maxVal) * 100), 10);
  }

  onExcelFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const text = e.target.result as string;
        // Parse CSV or JSON lines
        if (file.name.endsWith('.json')) {
          this.excelParsedStudents = JSON.parse(text);
        } else {
          // Parse CSV
          const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          if (lines.length <= 1) return;
          const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
          const parsed = [];
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            if (cols.length >= 2) {
              const obj: any = {};
              headers.forEach((h, idx) => {
                obj[h] = cols[idx] || '';
              });
              if (!obj.name && cols[0]) obj.name = cols[0];
              if (!obj.email && cols[1]) obj.email = cols[1];
              parsed.push(obj);
            }
          }
          this.excelParsedStudents = parsed;
        }
        this.cdr.detectChanges();
      } catch (err) {
        alert('Failed to parse file. Please ensure it is a valid CSV or JSON file.');
      }
    };
    reader.readAsText(file);
  }

  uploadParsedBatch(): void {
    if (this.excelParsedStudents.length === 0) return;
    this.importingBatch = true;
    this.batchImportSuccess = '';
    this.batchImportError = '';
    this.cdr.detectChanges();

    this.managementService.bulkImportStudents(this.excelParsedStudents, this.bulkBatchName).subscribe({
      next: (res) => {
        this.importingBatch = false;
        this.batchImportSuccess = `✅ ${res.message || 'Batch created successfully!'}`;
        this.excelParsedStudents = [];
        this.loadData();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.importingBatch = false;
        this.batchImportError = err.error?.message || 'Failed to import batch.';
        this.cdr.detectChanges();
      }
    });
  }

  executeSingleUserTermination(): void {
    if (!this.terminateUserIdInput) {
      alert('Please enter a valid User ID.');
      return;
    }
    if (!confirm(`Are you sure you want to terminate User ID #${this.terminateUserIdInput}?`)) return;

    this.managementService.terminateUser(this.terminateUserIdInput).subscribe({
      next: (res) => {
        alert(`✅ ${res.message}`);
        this.terminateUserIdInput = null;
        this.loadData();
      },
      error: (err) => alert(err.error?.message || 'Failed to terminate user.')
    });
  }

  executeBatchTermination(): void {
    if (!this.terminateBatchNameInput.trim()) {
      alert('Please enter a Batch Name to terminate.');
      return;
    }
    if (!confirm(`⚠️ DANGER: Are you sure you want to block and terminate ALL students in "${this.terminateBatchNameInput}"?`)) return;

    this.managementService.terminateBatch(this.terminateBatchNameInput.trim()).subscribe({
      next: (res) => {
        alert(`✅ ${res.message}`);
        this.terminateBatchNameInput = '';
        this.loadData();
      },
      error: (err) => alert(err.error?.message || 'Failed to terminate batch.')
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
