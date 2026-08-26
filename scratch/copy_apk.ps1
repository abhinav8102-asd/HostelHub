Add-Type -AssemblyName System.Windows.Forms
$fileCollection = New-Object System.Collections.Specialized.StringCollection
$fileCollection.Add("C:\Users\abhin\Desktop\HostelHub\HostelHub-User-App.apk")
[System.Windows.Forms.Clipboard]::SetFileDropList($fileCollection)
Write-Host "USER APP APK File successfully copied to Windows Clipboard!"
