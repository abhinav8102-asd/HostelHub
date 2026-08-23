[Reflection.Assembly]::LoadWithPartialName("System.Drawing") | Out-Null

$srcPath = "C:\Users\abhin\.gemini\antigravity-ide\brain\a135e2ae-3ec5-4446-a8af-46a5537b2c14\media__1785945518321.png"

if (-not (Test-Path $srcPath)) {
    Write-Error "Source image not found at $srcPath"
    exit 1
}

$bmp = New-Object System.Drawing.Bitmap($srcPath)
Write-Host "Source Logo Dimensions: $($bmp.Width)x$($bmp.Height)"

# Function to resize bitmap into a target PNG file
function Resize-Image {
    param(
        [System.Drawing.Bitmap]$sourceBmp,
        [int]$width,
        [int]$height,
        [string]$outputPath
    )
    $targetBmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($targetBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $g.DrawImage($sourceBmp, 0, 0, $width, $height)
    $g.Dispose()

    $parentDir = Split-Path -Path $outputPath
    if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }

    $targetBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $targetBmp.Dispose()
    Write-Host "Updated: $outputPath ($width`x$height)"
}

# Web Assets Paths for Admin and User Apps
$adminPublic = "C:\Users\abhin\Desktop\HostelHub\frontend-admin\public\icon.png"
$adminAssets = "C:\Users\abhin\Desktop\HostelHub\frontend-admin\assets\icon.png"
$userPublic = "C:\Users\abhin\Desktop\HostelHub\frontend-user\public\icon.png"
$userAssets = "C:\Users\abhin\Desktop\HostelHub\frontend-user\assets\icon.png"

Resize-Image $bmp 512 512 $adminPublic
Resize-Image $bmp 512 512 $adminAssets
Resize-Image $bmp 512 512 $userPublic
Resize-Image $bmp 512 512 $userAssets

# Mipmap Sizes for Android Apps
$sizes = @{
    "mipmap-mdpi"    = 48
    "mipmap-hdpi"    = 72
    "mipmap-xhdpi"   = 96
    "mipmap-xxhdpi"  = 144
    "mipmap-xxxhdpi" = 192
}

$androidResPaths = @(
    "C:\Users\abhin\Desktop\HostelHub\frontend-admin\android\app\src\main\res",
    "C:\Users\abhin\Desktop\HostelHub\frontend-user\android\app\src\main\res"
)

foreach ($resBase in $androidResPaths) {
    if (Test-Path $resBase) {
        foreach ($folder in $sizes.Keys) {
            $sz = $sizes[$folder]
            $folderPath = Join-Path $resBase $folder
            
            $launcherPng = Join-Path $folderPath "ic_launcher.png"
            $launcherRoundPng = Join-Path $folderPath "ic_launcher_round.png"
            $launcherFgPng = Join-Path $folderPath "ic_launcher_foreground.png"

            Resize-Image $bmp $sz $sz $launcherPng
            Resize-Image $bmp $sz $sz $launcherRoundPng
            Resize-Image $bmp $sz $sz $launcherFgPng
        }
    }
}

$bmp.Dispose()
Write-Host "All Admin & App Icons updated successfully with the red-purple gradient roof logo!"
