const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlPath = path.join(__dirname, '../HostelHub_Management_Implementation_Plan_Hinglish.html');
const pdfPath = 'C:\\Users\\abhin\\Desktop\\HostelHub\\HostelHub_Management_Implementation_Plan_Hinglish.pdf';

console.log('Reading HTML file from:', htmlPath);

try {
  const cmd = `& "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu --print-to-pdf="${pdfPath}" "${htmlPath}"`;
  execSync(cmd, { shell: 'powershell.exe' });
  console.log('PDF generated successfully at:', pdfPath);

  // Copy PDF file directly to Windows Clipboard
  execSync(`powershell -command "Set-Clipboard -Path '${pdfPath}'"`, { shell: 'powershell.exe' });
  console.log('PDF file copied to Windows Clipboard for Ctrl+V!');
} catch (err) {
  console.error('Error generating PDF via Edge:', err);
}
