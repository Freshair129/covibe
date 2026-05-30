import subprocess
import time
import csv
import datetime
import sys
import os
import threading

# SOP 3.2: Automated Telemetry Logger (Agent-Driven)
# This script eliminates the need for manual MSI Afterburner/HWiNFO interaction.

def get_gpu_metrics():
    """Queries NVIDIA-SMI for real-time GPU stats."""
    try:
        cmd = ["nvidia-smi", "--query-gpu=temperature.gpu,power.draw,memory.used", "--format=csv,noheader,nounits"]
        res = subprocess.check_output(cmd).decode().strip()
        # Handle multiple GPUs if present, but we assume single RTX 3060 per EABS-01
        parts = res.split("\n")[0].split(",")
        return float(parts[0]), float(parts[1]), float(parts[2])
    except Exception:
        return None, None, None

def get_cpu_metrics():
    """Queries Windows Performance Counters for CPU Usage."""
    try:
        # Using typeperf for faster sampling than Get-Counter in a loop
        cmd = ["typeperf", "\\Processor(_Total)\\% Processor Time", "-sc", "1"]
        res = subprocess.check_output(cmd).decode().strip()
        lines = res.split("\n")
        if len(lines) > 2:
            val = lines[2].split(",")[1].replace('"', '')
            return float(val)
    except Exception:
        return None
    return None

def logger_loop(output_file, stop_event):
    print(f"📡 [TELEMETRY] Starting auto-logger -> {output_file}")
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["ts", "gpu_temp", "gpu_power", "gpu_vram", "cpu_usage"])
        
        while not stop_event.is_set():
            ts = datetime.datetime.now(datetime.timezone.utc).isoformat()
            gt, gp, gv = get_gpu_metrics()
            cpu = get_cpu_metrics()
            
            if gt is not None:
                writer.writerow([ts, gt, gp, gv, cpu])
                f.flush()
            
            time.sleep(1)
    print("🛑 [TELEMETRY] Auto-logger stopped.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python auto_logger.py <output_csv>")
        sys.exit(1)
        
    out_file = sys.argv[1]
    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    
    stop_evt = threading.Event()
    logger_thread = threading.Thread(target=logger_loop, args=(out_file, stop_evt))
    logger_thread.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        stop_evt.set()
        logger_thread.join()
