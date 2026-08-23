const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlPath = path.join(__dirname, '../HostelHub_Management_Warden_Future_Roadmap_Hinglish.html');
const pdfPath = 'C:\\Users\\abhin\\Desktop\\HostelHub\\HostelHub_Management_Warden_Future_Roadmap_Hinglish.pdf';

console.log('Reading Future Roadmap HTML file from:', htmlPath);

try {
  const cmd = `& "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu --print-to-pdf="${pdfPath}" "${htmlPath}"`;
  execSync(cmd, { shell: 'powershell.exe' });
  console.log('Future Roadmap PDF generated successfully at:', pdfPath);

  // Copy PDF file directly to Windows Clipboard
  execSync(`powershell -command "Set-Clipboard -Path '${pdfPath}'"`, { shell: 'powershell.exe' });
  console.log('Future Roadmap PDF file copied to Windows Clipboard for Ctrl+V!');
} catch (err) {
  console.error('Error generating Future Roadmap PDF via Edge:', err);
}
