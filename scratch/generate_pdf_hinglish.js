const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlContent = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>HostelHub - Complete Technical Documentation (Hinglish Version)</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap');

    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
      @bottom-right {
        content: counter(page);
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Inter', sans-serif;
      color: #1e293b;
      line-height: 1.65;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 11.5pt;
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: 'Outfit', sans-serif;
      color: #0f172a;
      margin-top: 1.4em;
      margin-bottom: 0.5em;
      font-weight: 700;
      page-break-after: avoid;
    }

    h1 { font-size: 26pt; color: #b31031; border-bottom: 3px solid #b31031; padding-bottom: 6px; }
    h2 { font-size: 18pt; color: #8a0d24; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 4px; margin-top: 28px; }
    h3 { font-size: 14pt; color: #1e293b; margin-top: 20px; }
    h4 { font-size: 12pt; color: #334155; }

    /* Cover Page */
    .cover-page {
      height: 98vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 40px 20px;
      page-break-after: always;
      background: linear-gradient(135deg, #4c0615 0%, #b31031 50%, #8a0d24 100%);
      color: white;
      border-radius: 20px;
      margin-bottom: 30px;
    }

    .cover-header {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .cover-logo {
      width: 64px;
      height: 64px;
      background: white;
      color: #b31031;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 900;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    }

    .cover-title-group h1 {
      color: white;
      border: none;
      font-size: 34pt;
      margin: 0;
      line-height: 1.15;
      font-weight: 900;
      letter-spacing: -0.5px;
    }

    .cover-subtitle {
      font-size: 16pt;
      opacity: 0.92;
      margin-top: 12px;
      font-weight: 400;
    }

    .cover-meta {
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(10px);
      padding: 24px;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .cover-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      font-size: 11pt;
    }

    .cover-meta-item strong {
      display: block;
      font-size: 9pt;
      text-transform: uppercase;
      opacity: 0.75;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }

    /* Badges & Tables */
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 9pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge-get { background: #e0f2fe; color: #0369a1; }
    .badge-post { background: #dcfce7; color: #15803d; }
    .badge-put { background: #fef3c7; color: #b45309; }
    .badge-delete { background: #fee2e2; color: #b91c1c; }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 10pt;
      page-break-inside: avoid;
    }

    th, td {
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }

    th {
      background: #f8fafc;
      font-weight: 700;
      color: #334155;
      border-top: 1px solid #cbd5e1;
      border-bottom: 2px solid #cbd5e1;
      font-family: 'Outfit', sans-serif;
      text-transform: uppercase;
      font-size: 8.5pt;
      letter-spacing: 0.5px;
    }

    tr:nth-child(even) td {
      background: #f8fafc;
    }

    code, pre {
      font-family: 'Fira Code', monospace;
      font-size: 9.5pt;
    }

    code {
      background: #f1f5f9;
      color: #0f172a;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }

    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 16px;
      border-radius: 12px;
      overflow-x: auto;
      line-height: 1.45;
      border: 1px solid #1e293b;
      page-break-inside: avoid;
    }

    .endpoint-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 16px;
      margin: 16px 0;
      page-break-inside: avoid;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    }

    .endpoint-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }

    .endpoint-path {
      font-family: 'Fira Code', monospace;
      font-weight: 600;
      font-size: 11pt;
      color: #0f172a;
    }

    .callout {
      padding: 14px 18px;
      border-radius: 10px;
      margin: 16px 0;
      font-size: 10.5pt;
      page-break-inside: avoid;
    }

    .callout-info { background: #eff6ff; border-left: 4px solid #3b82f6; color: #1e3a8a; }
    .callout-warning { background: #fffbeb; border-left: 4px solid #f59e0b; color: #78350f; }
    .callout-success { background: #f0fdf4; border-left: 4px solid #22c55e; color: #14532d; }

    .toc {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 24px;
      margin-bottom: 30px;
    }

    .toc-title {
      font-size: 16pt;
      font-weight: 800;
      color: #8a0d24;
      margin-top: 0;
      margin-bottom: 16px;
      border-bottom: 2px solid #b31031;
      padding-bottom: 6px;
    }

    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .toc-list li {
      margin-bottom: 10px;
      font-weight: 600;
    }

    .toc-list li a {
      color: #0f172a;
      text-decoration: none;
      display: flex;
      justify-content: space-between;
    }

    .toc-list ul {
      list-style: none;
      padding-left: 20px;
      margin-top: 6px;
      font-weight: 400;
    }

    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover-page">
    <div>
      <div class="cover-header">
        <div class="cover-logo">H</div>
        <div style="font-size: 20pt; font-weight: 800; font-family: 'Outfit';">HostelHub</div>
      </div>

      <div style="margin-top: 80px;">
        <div class="cover-title-group">
          <h1>Complete Technical Guide & API Specs</h1>
        </div>
        <div class="cover-subtitle">Frontend, Backend, Database Schema, REST APIs & WebSockets Ka Pura Detailed Explanation (Hinglish Version)</div>
      </div>
    </div>

    <div class="cover-meta">
      <div class="cover-meta-grid">
        <div class="cover-meta-item">
          <strong>Project Name</strong>
          HostelHub Management System
        </div>
        <div class="cover-meta-item">
          <strong>Document Language</strong>
          Hinglish (Hindi + English)
        </div>
        <div class="cover-meta-item">
          <strong>Backend Architecture</strong>
          Node.js, Express, Sequelize, PostgreSQL, Socket.io
        </div>
        <div class="cover-meta-item">
          <strong>Frontend Architecture</strong>
          Angular Standalone, TypeScript, Capacitor Android
        </div>
        <div class="cover-meta-item">
          <strong>Lead Developer</strong>
          Abhinav Kumar & HostelHub Engineering Team
        </div>
        <div class="cover-meta-item">
          <strong>Date Generated</strong>
          August 2026
        </div>
      </div>
    </div>
  </div>

  <!-- TABLE OF CONTENTS -->
  <div class="toc">
    <div class="toc-title">📖 Table of Contents (Hinglish)</div>
    <ul class="toc-list">
      <li>1. System Intro & Architecture Overview (App Kaise Kam Karta Hai)</li>
      <li>2. Tech Stack & Dependencies (Kaun Sa Tech Use Hua Hai)</li>
      <li>3. Database Models & Schema Specifications (Database Tables Ka Structure)
        <ul>
          <li>3.1 Users & Authentication Tables (User, PasswordResetOTP)</li>
          <li>3.2 Maintenance & Ticket Tables (Complaint)</li>
          <li>3.3 Mess Management Tables (MessMenu, MessSkip, MessFeedback)</li>
          <li>3.4 Attendance & Roll Call Tables (Attendance)</li>
          <li>3.5 Announcements & Chat Tables (Announcement, GroupChat, ChatMessage)</li>
          <li>3.6 System Settings & Notifications (Setting, Notification)</li>
        </ul>
      </li>
      <li>4. Complete REST API Endpoints Reference (Saare APIs Request & Response)
        <ul>
          <li>4.1 Auth & User Profile APIs (/api/auth)</li>
          <li>4.2 User Management & Warden Approvals (/api/users)</li>
          <li>4.3 Maintenance Complaint Lifecycle APIs (/api/complaints)</li>
          <li>4.4 Mess Menu, Meal Skipping & Feedback APIs (/api/mess)</li>
          <li>4.5 Attendance Roll Call APIs (/api/attendance)</li>
          <li>4.6 Official Announcements APIs (/api/announcements)</li>
          <li>4.7 Group Chat APIs (/api/chat)</li>
          <li>4.8 Public Settings & Footer APIs (/api/settings)</li>
          <li>4.9 Live Notifications APIs (/api/notifications)</li>
        </ul>
      </li>
      <li>5. Socket.io WebSockets Guide (Real-time Live Events)</li>
      <li>6. Special Business Rules & Security Guards (Re-approval, Back-Button, Image Fixes)</li>
    </ul>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 1: SYSTEM OVERVIEW -->
  <h2>1. System Intro & Architecture Overview</h2>
  <p>
    <strong>HostelHub</strong> ek multi-portal digital hostel management app hai jo student complaints, daily roll call attendance, mess menu regulation, meal skipping, announcements, aur batch group chats ko streamline karta hai.
  </p>

  <div class="callout callout-info">
    <strong>System Architecture:</strong> App me Decoupled Client-Server model implement hai. Frontend single-page application <strong>Angular (Standalone Components)</strong> me bana hai aur <strong>Capacitor Bridge</strong> ke dwara native Android APK me compile hota hai. Backend server <strong>Node.js / Express.js</strong> par chal raha hai jo <strong>Sequelize ORM</strong> ke through <strong>PostgreSQL Database</strong> se connect hota hai. Real-time updates ke liye <strong>Socket.io WebSockets</strong> ka upyog kiya gaya hai.
  </div>

  <table style="margin-top: 20px;">
    <thead>
      <tr>
        <th>Role / User Type</th>
        <th>Portal Access</th>
        <th>Main Features & Permissions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Student</strong></td>
        <td>Student Portal</td>
        <td>Ticket raise karna (with photo), complaint status check karna, mess menu & snacks dekhna, meal skip karna, attendance metrics dekhna, hostel/batch group chat me message karna.</td>
      </tr>
      <tr>
        <td><strong>Warden</strong></td>
        <td>Warden Portal</td>
        <td>Naye students aur critical edit requests ko approve/reject karna, staff ko ticket assign karna, daily roll call attendance mark karna, announcements post karna.</td>
      </tr>
      <tr>
        <td><strong>Staff</strong></td>
        <td>Staff Portal</td>
        <td>Assigned jobs dekhna, work progress Update karna ("In Progress"), aur work completion photo proof submit karke job resolve karna.</td>
      </tr>
      <tr>
        <td><strong>Admin</strong></td>
        <td>Admin Portal</td>
        <td>Warden/Staff accounts create karna, full user database audit karna, system settings aur footer/developer info manage karna.</td>
      </tr>
    </tbody>
  </table>

  <!-- SECTION 2: TECH STACK -->
  <h2>2. Tech Stack & Dependencies</h2>
  <table>
    <thead>
      <tr>
        <th>Layer</th>
        <th>Technology Used</th>
        <th>Kyu Use Kiya Gaya Hai (Purpose)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Frontend</strong></td>
        <td>Angular v19</td>
        <td>Standalone Components, TypeScript, RxJS Observables for high speed SPA.</td>
      </tr>
      <tr>
        <td><strong>Mobile App Bridge</strong></td>
        <td>Capacitor v8</td>
        <td>Android Native Build, Camera Plugin, App Preferences, Native Back Button Listener.</td>
      </tr>
      <tr>
        <td><strong>Styling & Design</strong></td>
        <td>Vanilla CSS Tokens</td>
        <td>Modern Dark/Light Themes, Glassmorphism, Smooth Micro-animations, Vibrant Aesthetics.</td>
      </tr>
      <tr>
        <td><strong>Backend Runtime</strong></td>
        <td>Node.js & Express.js</td>
        <td>High-performance REST API routing, Async Middleware stack.</td>
      </tr>
      <tr>
        <td><strong>Database & ORM</strong></td>
        <td>PostgreSQL & Sequelize</td>
        <td>Structured Relational Tables, Foreign Key Relationships, Auto-indexing.</td>
      </tr>
      <tr>
        <td><strong>Real-Time Server</strong></td>
        <td>Socket.io</td>
        <td>Live Bidirectional WebSockets for Chat, Notifications, Roll Call & Announcements.</td>
      </tr>
      <tr>
        <td><strong>Storage Service</strong></td>
        <td>Supabase / Local Disk Fallback</td>
        <td>Cloud Bucket Image Storage with Base64 & Local Path fallback support.</td>
      </tr>
      <tr>
        <td><strong>Security & Auth</strong></td>
        <td>JWT & bcryptjs</td>
        <td>JSON Web Token Auth Headers, Password Hashing, Role Guards.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- SECTION 3: DATABASE MODELS -->
  <h2>3. Database Models & Schema Specifications</h2>

  <h3>3.1 User Model (users table)</h3>
  <p>Student, Warden, Staff aur Admin ke saare account details is table me save hote hain.</p>
  <pre><code>User {
  id: INTEGER (PK, AutoIncrement)
  name: STRING (Full Name)
  email: STRING (Unique Email)
  password: STRING (Hashed Password)
  role: ENUM('student', 'warden', 'staff', 'admin') (Default: 'student')
  hostelBlock: STRING ('Boys Hostel 1', 'Boys Hostel 2', 'Girls Hostel 1', 'Girls Hostel 2')
  roomNumber: STRING (e.g. 'Room 222')
  rollNumber: STRING
  batch: STRING (e.g. 'Batch 2025')
  gender: STRING ('Male', 'Female', 'Other')
  phone: STRING
  bio: TEXT
  profilePicUrl: STRING
  status: ENUM('pending', 'active', 'rejected') (Default: 'pending')
  reApprovalStatus: BOOLEAN (Default: false)  -- Gender/Batch edit hone par True hota hai
  googleId: STRING (Nullable)
}</code></pre>

  <h3>3.2 Complaint Model (complaints table)</h3>
  <p>Maintenance tickets aur unka complete workflow lifecycle.</p>
  <pre><code>Complaint {
  id: INTEGER (PK, AutoIncrement)
  studentId: INTEGER (FK -> users.id)
  staffId: INTEGER (FK -> users.id, Nullable)
  title: STRING (Ticket Title)
  description: TEXT (Full Detail)
  category: ENUM('electrical', 'plumbing', 'carpentry', 'cleaning', 'other')
  priority: ENUM('low', 'medium', 'high', 'urgent') (Default: 'medium')
  status: ENUM('pending', 'assigned', 'in_progress', 'resolved')
  photoUrl: TEXT (Student Issue Image Attachment)
  completionPhotoUrl: TEXT (Staff Resolution Proof Image)
  feedbackRating: INTEGER (1 to 5 Stars)
  feedbackComment: TEXT
}</code></pre>

  <h3>3.3 Mess Management Models</h3>
  <pre><code>MessMenu {
  id: INTEGER (PK, AutoIncrement)
  dayOfWeek: ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')
  breakfast: TEXT
  lunch: TEXT
  snacks: TEXT  -- Evening Snacks Added
  dinner: TEXT
  isSpecial: BOOLEAN
}

MessSkip {
  id: INTEGER (PK, AutoIncrement)
  studentId: INTEGER (FK -> users.id)
  date: DATEONLY
  mealType: ENUM('breakfast', 'lunch', 'snacks', 'dinner')
}

MessFeedback {
  id: INTEGER (PK, AutoIncrement)
  studentId: INTEGER (FK -> users.id)
  rating: INTEGER (1-5)
  category: STRING ('Quality', 'Hygiene', 'Quantity', 'Behavior')
  comment: TEXT
}</code></pre>

  <h3>3.4 Attendance Model (attendances table)</h3>
  <pre><code>Attendance {
  id: INTEGER (PK, AutoIncrement)
  studentId: INTEGER (FK -> users.id)
  date: DATEONLY
  status: ENUM('present', 'absent') -- Strictly Binary Statuses (Present & Absent)
  markedBy: INTEGER (FK -> users.id)
  remarks: TEXT (Nullable)
}</code></pre>

  <div class="page-break"></div>

  <!-- SECTION 4: REST APIS IN HINGLISH -->
  <h2>4. Complete REST API Endpoints Reference</h2>

  <h3>4.1 Authentication & Profile APIs (/api/auth)</h3>

  <div class="endpoint-card">
    <div class="endpoint-header">
      <span class="badge badge-post">POST</span>
      <span class="endpoint-path">/api/auth/register</span>
    </div>
    <p><strong>Description:</strong> Naya Student ya Warden account create karne ke liye API.</p>
    <p><strong>Request Body (JSON):</strong> <code>{ name, email, password, role, hostelBlock, roomNumber, rollNumber, batch, gender, phone }</code></p>
    <p><strong>Response (201 Created):</strong> <code>{ message: "Registration successful! Pending Warden approval.", user: {...} }</code></p>
  </div>

  <div class="endpoint-card">
    <div class="endpoint-header">
      <span class="badge badge-post">POST</span>
      <span class="endpoint-path">/api/auth/login</span>
    </div>
    <p><strong>Description:</strong> Credentials verify karke JWT Token return karta hai.</p>
    <p><strong>Request Body (JSON):</strong> <code>{ email, password }</code></p>
    <p><strong>Response (200 OK):</strong> <code>{ token: "eyJhbG...", user: { id, name, email, role, status } }</code></p>
  </div>

  <div class="endpoint-card">
    <div class="endpoint-header">
      <span class="badge badge-put">PUT</span>
      <span class="endpoint-path">/api/auth/profile</span>
    </div>
    <p><strong>Description:</strong> Profile update API. Agar Student <strong>Gender</strong> ya <strong>Batch</strong> change karega, to automatic warning milne ke sath Warden re-approval flag (<code>reApprovalStatus = true</code>) activate ho jayega.</p>
  </div>

  <h3>4.2 User Approvals APIs (/api/users)</h3>
  <div class="endpoint-card">
    <div class="endpoint-header">
      <span class="badge badge-get">GET</span>
      <span class="endpoint-path">/api/users/pending</span>
    </div>
    <p><strong>Role:</strong> Warden, Admin</p>
    <p><strong>Description:</strong> Unapproved new registrations aur re-approval profile edits ki list deta hai.</p>
  </div>

  <div class="endpoint-card">
    <div class="endpoint-header">
      <span class="badge badge-put">PUT</span>
      <span class="endpoint-path">/api/users/approve/:userId</span>
    </div>
    <p><strong>Role:</strong> Warden, Admin</p>
    <p><strong>Description:</strong> Pending student account ko active karta hai.</p>
  </div>

  <h3>4.3 Maintenance Complaints APIs (/api/complaints)</h3>
  <div class="endpoint-card">
    <div class="endpoint-header">
      <span class="badge badge-post">POST</span>
      <span class="endpoint-path">/api/complaints/raise</span>
    </div>
    <p><strong>Role:</strong> Student</p>
    <p><strong>Payload:</strong> multipart/form-data (title, description, category, priority, photo)</p>
  </div>

  <div class="endpoint-card">
    <div class="endpoint-header">
      <span class="badge badge-put">PUT</span>
      <span class="endpoint-path">/api/complaints/assign/:complaintId</span>
    </div>
    <p><strong>Role:</strong> Warden</p>
    <p><strong>Body:</strong> <code>{ staffId: 3 }</code></p>
    <p><strong>Description:</strong> Warden staff member assign karta hai.</p>
  </div>

  <div class="endpoint-card">
    <div class="endpoint-header">
      <span class="badge badge-put">PUT</span>
      <span class="endpoint-path">/api/complaints/update-status/:complaintId</span>
    </div>
    <p><strong>Role:</strong> Staff</p>
    <p><strong>Payload:</strong> multipart/form-data with status ('in_progress' or 'resolved') and completionPhoto.</p>
  </div>

  <h3>4.4 Attendance APIs (/api/attendance)</h3>
  <div class="endpoint-card">
    <div class="endpoint-header">
      <span class="badge badge-post">POST</span>
      <span class="endpoint-path">/api/attendance/mark</span>
    </div>
    <p><strong>Role:</strong> Warden, Admin</p>
    <p><strong>Body:</strong> <code>{ date: "2026-08-05", attendances: [{ studentId: 1, status: "present" }, { studentId: 2, status: "absent" }] }</code></p>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 5: WEBSOCKETS IN HINGLISH -->
  <h2>5. Socket.io WebSockets Guide (Real-time Live Events)</h2>
  <table>
    <thead>
      <tr>
        <th>Event Name</th>
        <th>Kaun Bhejta Hai</th>
        <th>Payload Data</th>
        <th>Kyu Use Hota Hai (Purpose)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>join_room</code></td>
        <td>Client &rarr; Server</td>
        <td><code>"group_2"</code> ya <code>"user_10"</code></td>
        <td>Client specific group/user socket room join karta hai.</td>
      </tr>
      <tr>
        <td><code>send_message</code></td>
        <td>Client &rarr; Server</td>
        <td><code>{ groupId, senderId, message, attachmentUrl }</code></td>
        <td>Group me live chat message publish karta hai.</td>
      </tr>
      <tr>
        <td><code>new_message</code></td>
        <td>Server &rarr; Client</td>
        <td><code>{ id, groupId, message, sender: {...} }</code></td>
        <td>Sabhi group members ke screen par instant message show karta hai.</td>
      </tr>
      <tr>
        <td><code>notification</code></td>
        <td>Server &rarr; Client</td>
        <td><code>{ message, type, createdAt }</code></td>
        <td>Live push/toast notification trigger karta hai.</td>
      </tr>
    </tbody>
  </table>

  <!-- SECTION 6: SPECIAL BUSINESS RULES -->
  <h2>6. Special Business Rules & Enforcements</h2>
  
  <div class="callout callout-warning">
    <strong>1. Profile Re-approval Guard Rule:</strong> Student profile edit karte waqt Name, Phone, Bio, Room Number ya Profile Picture bina kisi warden approval ke instantly save ho jate hain. Par agar student <strong>Gender</strong> ya <strong>Batch</strong> change karta hai, to system warning popup show karta hai aur Warden Approval alert generate karta hai.
  </div>

  <div class="callout callout-success">
    <strong>2. Roll Call Attendance Rule:</strong> Daily Attendance Roll Call se <strong>Outing status remove</strong> kar diya gaya hai. Ab Roll call strictly <strong>Present</strong> aur <strong>Absent</strong> me filter hoti hai, jise Warden Hostel Block wise ("Boys Hostel 1", "Girls Hostel 1", etc.) real-time track aur mark kar sakta hai.
  </div>

  <div class="callout callout-info">
    <strong>3. Back-Button App Exit Modal:</strong> Android App par jab user back button press karta hai, to app sudden close hone ki jagah <strong>Home tab par navigation</strong> karti hai. Agar user dubara Back press karta hai to clean <strong>Exit Confirmation Modal ("Yes, Exit / No, Cancel")</strong> open hota hai.
  </div>

  <footer style="margin-top: 50px; text-align: center; border-top: 1px solid #cbd5e1; padding-top: 20px; font-size: 9.5pt; color: #64748b;">
    HostelHub End-to-End Technical Documentation (Hinglish Edition) &bull; Generated August 2026 &bull; Confidential & Developer Reference
  </footer>

</body>
</html>
`;

const htmlPath = path.join(__dirname, '../HostelHub_Documentation_Hinglish.html');
const pdfPath = path.join('C:\\Users\\abhin\\Desktop\\HostelHub', 'HostelHub_Documentation_Hinglish.pdf');

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('Hinglish HTML documentation written to:', htmlPath);

try {
  const cmd = `& "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu --print-to-pdf="${pdfPath}" "${htmlPath}"`;
  execSync(cmd, { shell: 'powershell.exe' });
  console.log('Hinglish PDF generated successfully at:', pdfPath);

  // Copy PDF file directly to Windows Clipboard
  execSync(`powershell -command "Set-Clipboard -Path '${pdfPath}'"`, { shell: 'powershell.exe' });
  console.log('Hinglish PDF file copied to Windows Clipboard for Ctrl+V!');
} catch (err) {
  console.error('Error generating Hinglish PDF via Edge:', err);
}
