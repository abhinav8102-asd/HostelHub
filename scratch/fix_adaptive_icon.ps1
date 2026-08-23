[Reflection.Assembly]::LoadWithPartialName("System.Drawing") | Out-Null

$srcPath = "C:\Users\abhin\.gemini\antigravity-ide\brain\a135e2ae-3ec5-4446-a8af-46a5537b2c14\media__1785989991670.png"

if (-not (Test-Path $srcPath)) {
    # Fallback to alternative uploaded image
    $srcPath = "C:\Users\abhin\.gemini\antigravity-ide\brain\a135e2ae-3ec5-4446-a8af-46a5537b2c14\media__1785989906124.png"
}

$bmp = New-Object System.Drawing.Bitmap($srcPath)
Write-Host "Source Image Dimensions: $($bmp.Width)x$($bmp.Height)"

# Create a 512x512 master canvas with 68% safe-zone scaling to eliminate Android launcher zooming
function Create-PaddedIcon {
    param(
        [System.Drawing.Bitmap]$sourceBmp,
        [int]$canvasSize,
        [float]$scaleRatio = 0.68
    )

    $canvas = New-Object System.Drawing.Bitmap($canvasSize, $canvasSize)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Draw smooth gradient background matching top-to-bottom of original icon
    $topColor = $sourceBmp.GetPixel(10, 10)
    $bottomColor = $sourceBmp.GetPixel(10, $sourceBmp.Height - 10)

    $rect = New-Object System.Drawing.Rectangle(0, 0, $canvasSize, $canvasSize)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect, $topColor, $bottomColor, [System.Drawing.Drawing2D.LinearGradientMode]::Vertical
    )
    $g.FillRectangle($brush, $rect)

    # Scale logo mark to 68% of canvas size to fit Android Adaptive Icon Safe Zone
    $targetSize = [int]($canvasSize * $scaleRatio)
    $offset = [int](($canvasSize - $targetSize) / 2)

    $g.DrawImage($sourceBmp, $offset, $offset, $targetSize, $targetSize)

    $g.Dispose()
    $brush.Dispose()
    return $canvas
}

# Create 512x512 Master Padded Icon
$masterPaddedIcon = Create-PaddedIcon $bmp 512 0.70

# Save master web assets
$adminPublic = "C:\Users\abhin\Desktop\HostelHub\frontend-admin\public\icon.png"
$adminAssets = "C:\Users\abhin\Desktop\HostelHub\frontend-admin\assets\icon.png"
$userPublic = "C:\Users\abhin\Desktop\HostelHub\frontend-user\public\icon.png"
$userAssets = "C:\Users\abhin\Desktop\HostelHub\frontend-user\assets\icon.png"

$masterPaddedIcon.Save($adminPublic, [System.Drawing.Imaging.ImageFormat]::Png)
$masterPaddedIcon.Save($adminAssets, [System.Drawing.Imaging.ImageFormat]::Png)
$masterPaddedIcon.Save($userPublic, [System.Drawing.Imaging.ImageFormat]::Png)
$masterPaddedIcon.Save($userAssets, [System.Drawing.Imaging.ImageFormat]::Png)

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

            $resized = Create-PaddedIcon $bmp $sz 0.70

            $launcherPng = Join-Path $folderPath "ic_launcher.png"
            $launcherRoundPng = Join-Path $folderPath "ic_launcher_round.png"
            $launcherFgPng = Join-Path $folderPath "ic_launcher_foreground.png"

            $resized.Save($launcherPng, [System.Drawing.Imaging.ImageFormat]::Png)
            $resized.Save($launcherRoundPng, [System.Drawing.Imaging.ImageFormat]::Png)
            $resized.Save($launcherFgPng, [System.Drawing.Imaging.ImageFormat]::Png)
            $resized.Dispose()
        }
    }
}

$bmp.Dispose()
$masterPaddedIcon.Dispose()

Write-Host "Success! Adaptive Launcher Icons regenerated with 70% safe zone padding for perfect un-zoomed Android display!"
