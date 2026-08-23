const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlPath = path.join(__dirname, '../HostelHub_Current_System_Architecture_And_Access_Levels_Hinglish.html');
const pdfPath = 'C:\\Users\\abhin\\Desktop\\HostelHub\\HostelHub_Current_System_Architecture_And_Access_Levels_Hinglish.pdf';

console.log('Reading Current System Architecture HTML file from:', htmlPath);

try {
  const cmd = `& "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu --print-to-pdf="${pdfPath}" "${htmlPath}"`;
  execSync(cmd, { shell: 'powershell.exe' });
  console.log('Current System Architecture PDF generated successfully at:', pdfPath);

  // Copy PDF file directly to Windows Clipboard
  execSync(`powershell -command "Set-Clipboard -Path '${pdfPath}'"`, { shell: 'powershell.exe' });
  console.log('Current System Architecture PDF file copied to Windows Clipboard for Ctrl+V!');
} catch (err) {
  console.error('Error generating Current System Architecture PDF via Edge:', err);
}
