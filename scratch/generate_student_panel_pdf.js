const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlPath = path.join(__dirname, '../HostelHub_Student_Panel_Master_Blueprint_Hinglish.html');
const pdfPath = 'C:\\Users\\abhin\\Desktop\\HostelHub\\HostelHub_Student_Panel_Master_Blueprint_Hinglish.pdf';

console.log('Reading Student Panel Master Blueprint HTML file from:', htmlPath);

try {
  const cmd = `& "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu --print-to-pdf="${pdfPath}" "${htmlPath}"`;
  execSync(cmd, { shell: 'powershell.exe' });
  console.log('Student Panel Master Blueprint PDF generated successfully at:', pdfPath);

  // Copy PDF file directly to Windows Clipboard
  execSync(`powershell -command "Set-Clipboard -Path '${pdfPath}'"`, { shell: 'powershell.exe' });
  console.log('Student Panel Master Blueprint PDF file copied to Windows Clipboard for Ctrl+V!');
} catch (err) {
  console.error('Error generating Student Panel Master Blueprint PDF via Edge:', err);
}
