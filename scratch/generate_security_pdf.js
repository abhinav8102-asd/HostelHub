const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const engHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HostelHub - Security, Data Protection & Infrastructure Whitepaper</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap');

    @page {
      size: A4;
      margin: 18mm 15mm 18mm 15mm;
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
      line-height: 1.6;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 11pt;
    }

    h1, h2, h3, h4 {
      font-family: 'Outfit', sans-serif;
      color: #0f172a;
      margin-top: 1.3em;
      margin-bottom: 0.4em;
      font-weight: 700;
      page-break-after: avoid;
    }

    h1 { font-size: 24pt; color: #b31031; border-bottom: 3px solid #b31031; padding-bottom: 6px; }
    h2 { font-size: 16pt; color: #8a0d24; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 4px; margin-top: 24px; }
    h3 { font-size: 13pt; color: #0f172a; margin-top: 18px; }

    .cover-page {
      height: 96vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 40px 24px;
      page-break-after: always;
      background: linear-gradient(135deg, #4c0615 0%, #b31031 50%, #8a0d24 100%);
      color: white;
      border-radius: 18px;
    }

    .cover-logo {
      width: 60px;
      height: 60px;
      background: white;
      color: #b31031;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
      font-weight: 900;
      font-family: 'Outfit';
    }

    .cover-title-group h1 {
      color: white;
      border: none;
      font-size: 32pt;
      margin: 0;
      line-height: 1.15;
    }

    .cover-meta {
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(10px);
      padding: 20px 24px;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .cover-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      font-size: 10.5pt;
    }

    .cover-meta-item strong {
      display: block;
      font-size: 8.5pt;
      text-transform: uppercase;
      opacity: 0.75;
      letter-spacing: 1px;
      margin-bottom: 3px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 9.5pt;
      page-break-inside: avoid;
    }

    th, td {
      padding: 9px 11px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }

    th {
      background: #f8fafc;
      font-weight: 700;
      color: #334155;
      border-top: 1px solid #cbd5e1;
      border-bottom: 2px solid #cbd5e1;
      font-family: 'Outfit';
      text-transform: uppercase;
      font-size: 8pt;
      letter-spacing: 0.5px;
    }

    tr:nth-child(even) td { background: #f8fafc; }

    code, pre { font-family: 'Fira Code', monospace; font-size: 9pt; }

    code {
      background: #f1f5f9;
      color: #0f172a;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }

    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 14px;
      border-radius: 10px;
      overflow-x: auto;
      line-height: 1.45;
      border: 1px solid #1e293b;
      page-break-inside: avoid;
    }

    .callout {
      padding: 12px 16px;
      border-radius: 10px;
      margin: 14px 0;
      font-size: 10pt;
      page-break-inside: avoid;
    }

    .callout-info { background: #eff6ff; border-left: 4px solid #3b82f6; color: #1e3a8a; }
    .callout-success { background: #f0fdf4; border-left: 4px solid #22c55e; color: #14532d; }
    .callout-warning { background: #fffbeb; border-left: 4px solid #f59e0b; color: #78350f; }

    .page-break { page-break-after: always; }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover-page">
    <div>
      <div style="display: flex; align-items: center; gap: 14px;">
        <div class="cover-logo">H</div>
        <div style="font-size: 18pt; font-weight: 800; font-family: 'Outfit';">HostelHub</div>
      </div>

      <div style="margin-top: 70px;">
        <div class="cover-title-group">
          <h1>Security, Data Protection & Infrastructure Whitepaper</h1>
        </div>
        <div style="font-size: 15pt; opacity: 0.92; margin-top: 10px;">Comprehensive Guide to Encryption, Cloud Servers, Database Hosting & Web-to-Mobile App Architecture</div>
      </div>
    </div>

    <div class="cover-meta">
      <div class="cover-meta-grid">
        <div class="cover-meta-item">
          <strong>Document Scope</strong>
          Data Security, Encryption & Cloud Hosting Architecture
        </div>
        <div class="cover-meta-item">
          <strong>Database Cloud Host</strong>
          Supabase Managed PostgreSQL (AWS Infra)
        </div>
        <div class="cover-meta-item">
          <strong>API Application Server</strong>
          Render Cloud Platform (HTTPS Node.js Instance)
        </div>
        <div class="cover-meta-item">
          <strong>Mobile Native Conversion</strong>
          Capacitor v8 Android Bridge (WebView Runtime)
        </div>
        <div class="cover-meta-item">
          <strong>Encryption Standard</strong>
          bcryptjs (Salt 10) + JWT RSA/HS256 Bearer Tokens
        </div>
        <div class="cover-meta-item">
          <strong>Author Engineering Team</strong>
          Abhinav Kumar (Lead Full-Stack Developer)
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 1: HOW DATA IS PROTECTED -->
  <h2>1. Data Protection & Security Architecture</h2>
  <p>
    HostelHub enforces multi-layered defense-in-depth security policies to ensure that student, warden, and staff data remains 100% confidential, tamper-proof, and safe from unauthorized access.
  </p>

  <div class="callout callout-success">
    <strong>🔒 Zero Plaintext Storage:</strong> All user passwords are encrypted using <strong>bcryptjs hashing with 10 salt rounds</strong> before hitting the database. Even database administrators cannot view original plaintext passwords.
  </div>

  <h3>1.1 Security Mechanisms Overview</h3>
  <table>
    <thead>
      <tr>
        <th>Security Layer</th>
        <th>Technology Used</th>
        <th>How It Protects Your Data</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Password Security</strong></td>
        <td><code>bcryptjs (10 Salt Rounds)</code></td>
        <td>One-way cryptographic hashing protects credentials against database leak attacks.</td>
      </tr>
      <tr>
        <td><strong>API Authentication</strong></td>
        <td><code>JSON Web Tokens (JWT)</code></td>
        <td>Stateless bearer tokens verify every incoming HTTP API call with role payload verification.</td>
      </tr>
      <tr>
        <td><strong>Data in Transit</strong></td>
        <td><code>HTTPS / TLS 1.3 Encryption</code></td>
        <td>All communication between mobile app and server is encrypted using SSL/TLS encryption.</td>
      </tr>
      <tr>
        <td><strong>Database Safety</strong></td>
        <td><code>Sequelize ORM Parameterization</code></td>
        <td>Prevents SQL Injection attacks by automatically parameterizing and escaping raw database queries.</td>
      </tr>
      <tr>
        <td><strong>HTTP Headers Guard</strong></td>
        <td><code>Helmet.js Middleware</code></td>
        <td>Secures Express backend by setting XSS Filter, Strict-Transport-Security, and MIME sniffing guards.</td>
      </tr>
      <tr>
        <td><strong>Native App Storage</strong></td>
        <td><code>Capacitor Preferences API</code></td>
        <td>Tokens & session state stored in Android native SharedPreferences, protected from WebView clearing.</td>
      </tr>
    </tbody>
  </table>

  <!-- SECTION 2: WHERE DATA IS STORED -->
  <h2>2. Database Hosting & Cloud Infrastructure</h2>
  <p>
    HostelHub relies on enterprise-grade cloud hosting providers to deliver 99.9% uptime and reliable automated data persistence.
  </p>

  <div class="callout callout-info">
    <strong>🌐 Cloud Server Breakdown:</strong>
    <ul>
      <li><strong>Database Server:</strong> Hosted on <strong>Supabase Cloud Managed PostgreSQL</strong>. Supabase runs on top of secure Amazon Web Services (AWS) data centers with automatic daily backups and encrypted disk storage.</li>
      <li><strong>Backend REST API Server:</strong> Hosted on <strong>Render.com Cloud Application Platform</strong> (<code>https://hostelhub-0cyi.onrender.com</code>). Render handles HTTP/HTTPS routing, Node.js process management, and SSL certificate renewals.</li>
      <li><strong>Media & Attachment Storage:</strong> Complaint issue photos, work completion proofs, and profile pictures are uploaded to cloud buckets with fallback local path mapping.</li>
    </ul>
  </div>

  <pre><code>[ Mobile Android App / Browser ]
               │  (Encrypted HTTPS / WebSockets)
               ▼
   [ Render.com Cloud API Server ]  <-- Node.js / Express Middleware
               │  (TLS Encrypted Connection)
               ▼
[ Supabase PostgreSQL Cloud Database ]  <-- AWS Secured Infrastructure</code></pre>

  <div class="page-break"></div>

  <!-- SECTION 3: WEB TO MOBILE APP CONVERSION -->
  <h2>3. Web-to-Native Mobile App Conversion (Capacitor Architecture)</h2>
  <p>
    HostelHub was built as an Angular Progressive Single Page Application and converted into a <strong>Native Android APK</strong> using <strong>Capacitor v8</strong> (developed by the Ionic engineering team).
  </p>

  <h3>3.1 How Web Code Runs in Native APK</h3>
  <ol>
    <li><strong>Production Build Compilation:</strong> The Angular source code ('TypeScript', 'HTML', 'CSS') is compiled into optimized JavaScript bundles inside 'dist/frontend-user'.</li>
    <li><strong>Native Asset Syncing:</strong> Capacitor ('npx cap sync') copies the web build directly into the Android native project assets folder ('android/app/src/main/assets/public').</li>
    <li><strong>WebView Execution:</strong> Android's high-performance native WebView engine loads the app locally inside the native APK wrapper, rendering at 60 FPS without needing external browser navigation bars.</li>
    <li><strong>Native Bridge Hardware APIs:</strong>
      <ul>
        <li><code>@capacitor/camera</code>: Direct access to phone camera hardware for taking complaint attachment photos.</li>
        <li><code>@capacitor/preferences</code>: Access to Android native SharedPreferences for persistent authentication tokens.</li>
        <li><code>@capacitor/app</code>: Hardware back-button event listener enforcing the 2-step exit modal guard.</li>
      </ul>
    </li>
  </ol>

  <!-- SECTION 4: SPECIAL SECURITY RULES -->
  <h2>4. Critical Business & Security Rules</h2>

  <div class="callout callout-warning">
    <strong>🛡️ Profile Re-Approval Security Guard:</strong> Standard profile fields (Name, Phone, Bio, Room Number, Profile Picture) save instantly. However, if a student attempts to edit <strong>Gender</strong> or <strong>Academic Batch</strong>, the system triggers a critical warning popup and requires Warden Re-approval (<code>reApprovalStatus = true</code>) before the changes take effect.
  </div>

  <div class="callout callout-info">
    <strong>📱 Dual-Press Back Exit Guard:</strong> Pressing the Android hardware back button inside the app navigates back to the Home tab first. Pressing back a second time opens a clean confirmation modal asking *"Are you sure you want to exit HostelHub?"* with Yes/No options.
  </div>

  <footer style="margin-top: 40px; text-align: center; border-top: 1px solid #cbd5e1; padding-top: 16px; font-size: 9pt; color: #64748b;">
    HostelHub System Security & Infrastructure Whitepaper &bull; Generated August 2026 &bull; Developer & Security Reference
  </footer>

</body>
</html>
`;

const hinglishHtmlContent = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>HostelHub - Security & Data Safety Document (Hinglish)</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap');

    @page {
      size: A4;
      margin: 18mm 15mm 18mm 15mm;
      @bottom-right { content: counter(page); }
    }

    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.65; background: #ffffff; margin: 0; padding: 0; font-size: 11pt; }
    h1, h2, h3 { font-family: 'Outfit', sans-serif; color: #0f172a; margin-top: 1.3em; margin-bottom: 0.4em; font-weight: 700; page-break-after: avoid; }
    h1 { font-size: 24pt; color: #b31031; border-bottom: 3px solid #b31031; padding-bottom: 6px; }
    h2 { font-size: 16pt; color: #8a0d24; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 4px; margin-top: 24px; }

    .cover-page {
      height: 96vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 40px 24px;
      page-break-after: always;
      background: linear-gradient(135deg, #4c0615 0%, #b31031 50%, #8a0d24 100%);
      color: white;
      border-radius: 18px;
    }

    .cover-logo {
      width: 60px; height: 60px; background: white; color: #b31031; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 30px; font-weight: 900; font-family: 'Outfit';
    }

    .cover-meta {
      background: rgba(255, 255, 255, 0.12); backdrop-filter: blur(10px); padding: 20px 24px; border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .cover-meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; font-size: 10.5pt; }
    .cover-meta-item strong { display: block; font-size: 8.5pt; text-transform: uppercase; opacity: 0.75; letter-spacing: 1px; margin-bottom: 3px; }

    table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 9.5pt; page-break-inside: avoid; }
    th, td { padding: 9px 11px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; font-weight: 700; color: #334155; border-top: 1px solid #cbd5e1; border-bottom: 2px solid #cbd5e1; font-family: 'Outfit'; text-transform: uppercase; font-size: 8pt; letter-spacing: 0.5px; }
    tr:nth-child(even) td { background: #f8fafc; }

    .callout { padding: 12px 16px; border-radius: 10px; margin: 14px 0; font-size: 10pt; page-break-inside: avoid; }
    .callout-info { background: #eff6ff; border-left: 4px solid #3b82f6; color: #1e3a8a; }
    .callout-success { background: #f0fdf4; border-left: 4px solid #22c55e; color: #14532d; }
    .callout-warning { background: #fffbeb; border-left: 4px solid #f59e0b; color: #78350f; }
    .page-break { page-break-after: always; }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover-page">
    <div>
      <div style="display: flex; align-items: center; gap: 14px;">
        <div class="cover-logo">H</div>
        <div style="font-size: 18pt; font-weight: 800; font-family: 'Outfit';">HostelHub</div>
      </div>

      <div style="margin-top: 70px;">
        <h1 style="color: white; border: none; font-size: 32pt; margin: 0;">Security & Data Protection Document</h1>
        <div style="font-size: 15pt; opacity: 0.92; margin-top: 10px;">Aapka Data Kaise Safe Hai, Server Kahan Hai, Aur Web App Kaise Mobile APK me Convert Hua (Hinglish Guide)</div>
      </div>
    </div>

    <div class="cover-meta">
      <div class="cover-meta-grid">
        <div class="cover-meta-item">
          <strong>Document Type</strong>
          Security & Infrastructure Guide (Hinglish)
        </div>
        <div class="cover-meta-item">
          <strong>Database Host Server</strong>
          Supabase PostgreSQL (AWS Data Center)
        </div>
        <div class="cover-meta-item">
          <strong>API Application Server</strong>
          Render Cloud Platform (HTTPS Cloud Instance)
        </div>
        <div class="cover-meta-item">
          <strong>Web to App Conversion</strong>
          Capacitor v8 Android Native Bridge
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 1 -->
  <h2>1. Data Kaise Safe Ho Raha Hai (Encryption & Security)</h2>
  <p>
    HostelHub me student, warden aur staff ke data ki privacy aur security ke liye 5-layer encryption aur security guards lagaye gaye hain.
  </p>

  <div class="callout callout-success">
    <strong>🔒 Password Hashing (Zero Plaintext Storage):</strong> Aapka login password database me kabhi bhi real text me save nahi hota. Password ko <strong>bcryptjs algorithm (10 salt rounds)</strong> ke dwara highly secure hash string me convert karke save kiya jata hai. Isko decode karna impossible hai.
  </div>

  <table>
    <thead>
      <tr>
        <th>Security Mechanism</th>
        <th>Kaun Sa Tech Use Hua</th>
        <th>Aapka Data Kaise Secure Hota Hai</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Password Protection</strong></td>
        <td><code>bcryptjs (10 Salt Rounds)</code></td>
        <td>One-way hashing ke dwara passwords ko unreadable hash string me store karta hai.</td>
      </tr>
      <tr>
        <td><strong>API Authentication</strong></td>
        <td><code>JWT Bearer Tokens</code></td>
        <td>Har API request ke sath encrypted token verify hota hai jisse unauthorized log access na kar sakein.</td>
      </tr>
      <tr>
        <td><strong>Data in Transit</strong></td>
        <td><code>HTTPS / SSL Encryption</code></td>
        <td>Mobile app aur server ke bich hone wala saara data HTTPS SSL encryption se lock rehta hai.</td>
      </tr>
      <tr>
        <td><strong>Database Safety</strong></td>
        <td><code>Sequelize ORM Safe Queries</code></td>
        <td>SQL Injection attacks ko fully block karta hai. Raw SQL injection harmful code run nahi ho sakta.</td>
      </tr>
      <tr>
        <td><strong>Security Headers</strong></td>
        <td><code>Helmet.js Security Guard</code></td>
        <td>XSS attacks, MIME sniffing aur unauthorized cross-origin requests ko express server par reject karta hai.</td>
      </tr>
    </tbody>
  </table>

  <!-- SECTION 2 -->
  <h2>2. Data Kahan Aur Kis Server Par Store Ho Raha Hai?</h2>
  
  <div class="callout callout-info">
    <strong>🌐 Cloud Server Details:</strong>
    <ul>
      <li><strong>Database Server:</strong> System ka saara database (Users, Complaints, Mess Menu, Attendance, Group Chats) <strong>Supabase Cloud Managed PostgreSQL Server</strong> par store ho raha hai. Supabase world's most secure <strong>Amazon Web Services (AWS) Data Centers</strong> par run hota hai.</li>
      <li><strong>Backend REST API Server:</strong> Server logic aur controllers <strong>Render.com Cloud App Hosting Platform</strong> (<code>https://hostelhub-0cyi.onrender.com</code>) par hosted hain.</li>
      <li><strong>Photo & File Uploads:</strong> Complaint issue images, work completion proofs, aur profile pictures Cloud Storage Buckets par base64 / encrypted storage paths ke dwara fully secure rehte hain.</li>
    </ul>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 3 -->
  <h2>3. Ye Website Kisne Aur Kaise App me Convert Kiya?</h2>
  <p>
    HostelHub web application ko <strong>Capacitor v8 (Native Android Bridge Framework)</strong> ki madad se high-performance Android APK me convert kiya gaya hai.
  </p>

  <h3>3.1 Conversion Process Kaise Work Karta Hai:</h3>
  <ol>
    <li><strong>Angular Single-Page App Build:</strong> Pehle Angular framework ke through code (HTML/CSS/TypeScript) ko fast web application bundle me build kiya jata hai.</li>
    <li><strong>Capacitor Native Sync:</strong> Capacitor bridge tool (<code>npx cap sync</code>) web build folder ko Android native project directory (<code>android/app/src/main/assets/public</code>) me insert karta hai.</li>
    <li><strong>Android Native WebView Engine:</strong> Android OS ke andar pre-built native Chrome WebView container web application ko 60 FPS full screen mobile app ki tarah execute karta hai. Isme browser ka address bar, URL, ya controls bilkul hide ho jate hain.</li>
    <li><strong>Native Mobile Hardware Integrations:</strong>
      <ul>
        <li><code>@capacitor/camera</code>: Direct mobile camera hardware se issue picture clicked photo upload karne me madad karta hai.</li>
        <li><code>@capacitor/preferences</code>: Android SharedPreferences me login token save rakhta hai jisse app restart hone par bhi login lost na ho.</li>
        <li><code>@capacitor/app</code>: Android Hardware Back Button click event capture karta hai aur exit confirmation modal trigger karta hai.</li>
      </ul>
    </li>
  </ol>

  <!-- SECTION 4 -->
  <h2>4. Special Profile Security Rule</h2>
  
  <div class="callout callout-warning">
    <strong>🛡️ Gender & Batch Critical Edit Warning:</strong> Student jab profile edit karta hai to Name, Room Number, Phone, Bio, ya Profile Picture bina kisi extra approval ke instantly save ho jata hai. Par agar koi student <strong>Gender</strong> ya <strong>Academic Batch</strong> change karega, to system usko critical data warning alert deta hai aur Warden Re-approval (<code>reApprovalStatus = true</code>) compulsory kar deta hai.
  </div>

  <footer style="margin-top: 40px; text-align: center; border-top: 1px solid #cbd5e1; padding-top: 16px; font-size: 9pt; color: #64748b;">
    HostelHub Security & Infrastructure Whitepaper (Hinglish) &bull; Generated August 2026 &bull; Developer & Security Reference
  </footer>

</body>
</html>
`;

const engHtmlPath = path.join(__dirname, '../HostelHub_Security_Data_Protection.html');
const engPdfPath = path.join('C:\\Users\\abhin\\Desktop\\HostelHub', 'HostelHub_Security_Data_Protection.pdf');

const hinHtmlPath = path.join(__dirname, '../HostelHub_Security_Data_Protection_Hinglish.html');
const hinPdfPath = path.join('C:\\Users\\abhin\\Desktop\\HostelHub', 'HostelHub_Security_Data_Protection_Hinglish.pdf');

fs.writeFileSync(engHtmlPath, engHtmlContent, 'utf8');
fs.writeFileSync(hinHtmlPath, hinglishHtmlContent, 'utf8');

try {
  // Generate English PDF
  const cmdEng = `& "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu --print-to-pdf="${engPdfPath}" "${engHtmlPath}"`;
  execSync(cmdEng, { shell: 'powershell.exe' });
  console.log('English Security PDF generated at:', engPdfPath);

  // Generate Hinglish PDF
  const cmdHin = `& "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu --print-to-pdf="${hinPdfPath}" "${hinHtmlPath}"`;
  execSync(cmdHin, { shell: 'powershell.exe' });
  console.log('Hinglish Security PDF generated at:', hinPdfPath);

  // Copy English PDF to Windows Clipboard
  execSync(`powershell -command "Set-Clipboard -Path '${engPdfPath}'"`, { shell: 'powershell.exe' });
  console.log('English Security PDF copied to Windows Clipboard for Ctrl+V!');
} catch (err) {
  console.error('Error generating Security PDFs:', err);
}
