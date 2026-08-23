Add-Type -AssemblyName System.Windows.Forms
$fileCollection = New-Object System.Collections.Specialized.StringCollection
$fileCollection.Add("C:\Users\abhin\Desktop\HostelHub\HostelHub-Admin-Latest.apk")
[System.Windows.Forms.Clipboard]::SetFileDropList($fileCollection)
Write-Host "APK File successfully copied to Windows Clipboard!"
