$logFile = Join-Path $PSScriptRoot "../benchmark/telemetry_logs/full_system_telemetry.csv"
# Header ใหม่แบบอลังการ
$header = "Timestamp,GPU_Temp,GPU_Fan,VRAM_Used,GPU_Power,GPU_Core_Clock,GPU_Mem_Clock,CPU_Total_Usage,CPU_Core1,CPU_Core2,CPU_Core3,CPU_Core4,CPU_Core5,CPU_Core6,RAM_Used,Commit_Charge,Disk_Read_MB,Disk_Write_MB"
$header | Out-File $logFile -Encoding utf8

Write-Host "--- CoVibe ULTRA-TELEMETRY MONITOR STARTED ---" -ForegroundColor Cyan
Write-Host "Monitoring 18+ Metrics... Press Ctrl+C to Stop." -ForegroundColor Yellow

while($true) {
    # 1. GPU Data (Detailed)
    $gpu = nvidia-smi --query-gpu=temperature.gpu,fan.speed,memory.used,power.draw,clocks.current.graphics,clocks.current.memory --format=csv,noheader,nounits
    
    # 2. CPU Total & Per-Core Usage (First 6 Cores)
    $cpuCounters = (Get-Counter '\Processor(*)\% Processor Time' -ErrorAction SilentlyContinue).CounterSamples
    $cpuTotal = [math]::Round(($cpuCounters | Where-Object {$_.InstanceName -eq "_total"}).CookedValue, 2)
    $c1 = [math]::Round(($cpuCounters | Where-Object {$_.InstanceName -eq "0"}).CookedValue, 2)
    $c2 = [math]::Round(($cpuCounters | Where-Object {$_.InstanceName -eq "1"}).CookedValue, 2)
    $c3 = [math]::Round(($cpuCounters | Where-Object {$_.InstanceName -eq "2"}).CookedValue, 2)
    $c4 = [math]::Round(($cpuCounters | Where-Object {$_.InstanceName -eq "3"}).CookedValue, 2)
    $c5 = [math]::Round(($cpuCounters | Where-Object {$_.InstanceName -eq "4"}).CookedValue, 2)
    $c6 = [math]::Round(($cpuCounters | Where-Object {$_.InstanceName -eq "5"}).CookedValue, 2)

    # 3. RAM & Commit Charge
    $os = Get-CimInstance Win32_OperatingSystem
    $ramUsed = [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / 1024 / 1024, 2)
    $commit = [math]::Round(($os.TotalRealsizeInBytes - $os.FreeVirtualMemory * 1024) / 1024 / 1024 / 1024, 2) # ในหน่วย GB

    # 4. Disk I/O (MB/s)
    $disk = (Get-Counter '\PhysicalDisk(_Total)\Disk Read Bytes/sec','\PhysicalDisk(_Total)\Disk Write Bytes/sec').CounterSamples
    $dr = [math]::Round($disk[0].CookedValue / 1MB, 2)
    $dw = [math]::Round($disk[1].CookedValue / 1MB, 2)

    $timestamp = Get-Date -Format "HH:mm:ss"
    
    # บันทึก Wide Row ลง CSV
    "$timestamp,$gpu,$cpuTotal,$c1,$c2,$c3,$c4,$c5,$c6,$ramUsed,$commit,$dr,$dw" | Out-File $logFile -Append
    
    Start-Sleep -s 1
}
