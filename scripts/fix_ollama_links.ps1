$sourceDir = "C:\Users\freshair\AppData\Local\Ollama\models\blobs"
# ตรวจสอบพาธอีกรอบเพื่อความชัวร์ (บางเครื่องอยู่ใน User Profile บางเครื่องอยู่ใน AppData)
if (-not (Test-Path $sourceDir)) {
    $sourceDir = "C:\Users\freshair\.ollama\models\blobs"
}
$destDir = "G:\.ollama_blobs"

$blobs = @(
    "sha256-74701a8c35f6c8d9a4b91f3f3497643001d63e0c7a84e085bed452548fa88d45",
    "sha256-81fb60c7daa80fc1123380b98970b320ae233409f0f71a72ed7b9b0d62f40490",
    "sha256-a5db3381f2e514d3490a3a31fe70eb1a65e95016c85c6c2c23223b810806594f"
)

Write-Host "--- Ollama Storage Optimizer ---" -ForegroundColor Cyan

foreach ($b in $blobs) {
    $s = Join-Path $sourceDir $b
    $d = Join-Path $destDir $b
    
    if (Test-Path $s -PathType Leaf) {
        Write-Host "Moving $b to G:..."
        Move-Item -Path $s -Destination $d -Force
    }
    
    Write-Host "Creating Symlink for $b..."
    New-Item -ItemType SymbolicLink -Path $s -Target $d -Force
}

Write-Host "--- Operation Complete! ---" -ForegroundColor Green
