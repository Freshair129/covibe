# MSI Afterburner / Ollama Link Repair Script (FULL VERSION)

บอสครับ คัดลอกโค้ดชุดใหม่นี้ไปวางใน **PowerShell (Admin)** ได้เลยครับ ผมรวบรวมรหัส Blobs ทั้งหมดที่จำเป็น (รวมถึงไฟล์ Config และ License) มาให้ครบถ้วนแล้วครับ

```powershell
# 🛑 ลบ Link เดิมที่อาจจะค้างอยู่ (ถ้ามี) เพื่อความสะอาด
$oldBlobs = @(
    "sha256-31ea3e7b79889810fe53bd592aa395f43a0e37dc6c424bd1d8893d6f00f59b6d",
    "sha256-424fc810c3b53ae57cabd25d06b6111ade3db8bbc31e33b107d1ae929cbf6918",
    "sha256-4b4c3c807d092e41ccd2bcd9738b8a6478ecf6b4452ae67d42daca7c03f26439",
    "sha256-4f659a1e86d7f5a33c389f7991e7224b7ee6ad0358b53437d54c02d2e1b1118d",
    "sha256-559e43668ae5331cb8e6767e702eb71ba20834a5b88698ae71f216cc507bae21",
    "sha256-7339fa418c9ad3e8e12e74ad0fd26a9cc4be8703f9c110728a992b193be85cb2",
    "sha256-8e904df6dfe0c789a1aa634765a992996a67e32ec44141adc6dbbba89ceb072a",
    "sha256-9371364b27a52acac9d87f88bd93c9db1174d8d6ec57f6888925cdc1788871ff",
    "sha256-966de95ca8a62200913e3f8bfbf84c8494536f1b94b49166851e76644e966396",
    "sha256-a70ff7e570d97baaf4e62ac6e6ad9975e04caa6d900d3742d37698494479e0cd",
    "sha256-de9fed2251b37295b763727a59ca35cf5cfe5c7379bc3e2104b2ce3c145aa887",
    "sha256-df196aea23788e838825f54deaf088d326edaee6c1b3b81f28a0677b05b55167",
    "sha256-f2c299c8384c3e1b1b2a84a08b98ac1e67a90aac0b4a30e614501f345f968a68",
    "sha256-fcc5a6bec9daf9b561a68827b67ab6088e1dba9d1fa2a50d7bbcc8384e0a265d",
    "sha256-74701a8c35f6c8d9a4b91f3f3497643001d63e0c7a84e085bed452548fa88d45",
    "sha256-81fb60c7daa80fc1123380b98970b320ae233409f0f71a72ed7b9b0d62f40490",
    "sha256-a5db3381f2e514d3490a3a31fe70eb1a65e95016c85c6c2c23223b810806594f"
)

foreach ($blob in $oldBlobs) {
    $path = "C:\Users\freshair\.ollama\models\blobs\$blob"
    if (Test-Path $path) { Remove-Item $path -Force }
}

# 1. เชื่อมต่อ Blobs จาก G:\.ollama_blobs_root (Chinda, Gemma4, Llama Config, etc.)
$blobsRoot = @(
    "sha256-31ea3e7b79889810fe53bd592aa395f43a0e37dc6c424bd1d8893d6f00f59b6d",
    "sha256-424fc810c3b53ae57cabd25d06b6111ade3db8bbc31e33b107d1ae929cbf6918",
    "sha256-4b4c3c807d092e41ccd2bcd9738b8a6478ecf6b4452ae67d42daca7c03f26439",
    "sha256-4f659a1e86d7f5a33c389f7991e7224b7ee6ad0358b53437d54c02d2e1b1118d",
    "sha256-559e43668ae5331cb8e6767e702eb71ba20834a5b88698ae71f216cc507bae21",
    "sha256-7339fa418c9ad3e8e12e74ad0fd26a9cc4be8703f9c110728a992b193be85cb2",
    "sha256-8e904df6dfe0c789a1aa634765a992996a67e32ec44141adc6dbbba89ceb072a",
    "sha256-9371364b27a52acac9d87f88bd93c9db1174d8d6ec57f6888925cdc1788871ff",
    "sha256-966de95ca8a62200913e3f8bfbf84c8494536f1b94b49166851e76644e966396",
    "sha256-a70ff7e570d97baaf4e62ac6e6ad9975e04caa6d900d3742d37698494479e0cd",
    "sha256-de9fed2251b37295b763727a59ca35cf5cfe5c7379bc3e2104b2ce3c145aa887",
    "sha256-df196aea23788e838825f54deaf088d326edaee6c1b3b81f28a0677b05b55167",
    "sha256-f2c299c8384c3e1b1b2a84a08b98ac1e67a90aac0b4a30e614501f345f968a68",
    "sha256-fcc5a6bec9daf9b561a68827b67ab6088e1dba9d1fa2a50d7bbcc8384e0a265d"
)
foreach ($blob in $blobsRoot) {
    New-Item -ItemType SymbolicLink -Path "C:\Users\freshair\.ollama\models\blobs\$blob" -Target "G:\.ollama_blobs_root\$blob" -Force
}

# 2. เชื่อมต่อ Blobs จาก G:\.ollama_blobs (Llama Model, Qwen3.5 Model, Nomic Model)
$blobsG = @(
    "sha256-74701a8c35f6c8d9a4b91f3f3497643001d63e0c7a84e085bed452548fa88d45",
    "sha256-81fb60c7daa80fc1123380b98970b320ae233409f0f71a72ed7b9b0d62f40490",
    "sha256-a5db3381f2e514d3490a3a31fe70eb1a65e95016c85c6c2c23223b810806594f"
)
foreach ($blob in $blobsG) {
    New-Item -ItemType SymbolicLink -Path "C:\Users\freshair\.ollama\models\blobs\$blob" -Target "G:\.ollama_blobs\$blob" -Force
}

# ตรวจสอบผลลัพธ์
Write-Host "`n--- REPAIRED OLLAMA MODELS ---" -ForegroundColor Cyan
ollama list
```
