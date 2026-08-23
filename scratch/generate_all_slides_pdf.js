const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlPath = path.join(__dirname, '../HostelHub_All_UI_Screens_Visual_Slide_Deck_Hinglish.html');
const pdfPath = 'C:\\Users\\abhin\\Desktop\\HostelHub\\HostelHub_All_UI_Screens_Visual_Slide_Deck_Hinglish.pdf';

console.log('Reading 12-Slide Master Visual Slide Deck HTML file from:', htmlPath);

try {
  const cmd = `& "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu --print-to-pdf="${pdfPath}" "${htmlPath}"`;
  execSync(cmd, { shell: 'powershell.exe' });
  console.log('12-Slide Master Visual Slide Deck PDF generated successfully at:', pdfPath);

  // Copy PDF file directly to Windows Clipboard
  execSync(`powershell -command "Set-Clipboard -Path '${pdfPath}'"`, { shell: 'powershell.exe' });
  console.log('12-Slide Master Visual Slide Deck PDF file copied to Windows Clipboard for Ctrl+V!');
} catch (err) {
  console.error('Error generating 12-Slide Master Visual Slide Deck PDF via Edge:', err);
}
