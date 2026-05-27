import json
import os
import csv
import re
from datetime import datetime, timedelta

# CONFIG
HWINFO_PATH = "G:/HWiNFO64/DESKTOP-8UR61U8.csv"
BASE_BENCHMARK_DIR = "G:/covibe/benchmark"

def parse_hwinfo_time(date_str, time_str):
    try:
        parts = re.split(r'[:.]', time_str)
        if len(parts) < 3: return None
        h = parts[0].zfill(2)
        m = parts[1].zfill(2)
        s = parts[2].zfill(2)
        ms = parts[3][:3].ljust(3, '0') if len(parts) > 3 else "000"
        normalized_time = f"{h}:{m}:{s}.{ms}"
        full_str = f"{date_str} {normalized_time}"
        return datetime.strptime(full_str, "%d.%m.%Y %H:%M:%S.%f")
    except: return None

def slice_hwinfo():
    if not os.path.exists(HWINFO_PATH):
        print(f"Error: {HWINFO_PATH} not found!")
        return

    print("Reading HWiNFO Log...")
    target_tasks = []
    for root, dirs, files in os.walk(BASE_BENCHMARK_DIR):
        if "metrics.json" in files:
            metrics_path = os.path.join(root, "metrics.json")
            mtime = os.path.getmtime(metrics_path)
            end_time = datetime.fromtimestamp(mtime)
            try:
                with open(metrics_path, "r") as f:
                    m_data = json.load(f)
                duration = m_data.get("duration_seconds", m_data.get("time", 0))
                start_time = end_time - timedelta(seconds=duration + 10)
                target_tasks.append({
                    "start": start_time,
                    "end": end_time + timedelta(seconds=5),
                    "path": root,
                    "id": root.replace(BASE_BENCHMARK_DIR, ""),
                    "samples": []
                })
            except: continue

    if not target_tasks:
        print("No tasks found.")
        return

    with open(HWINFO_PATH, "r", encoding="utf-8", errors="ignore") as f:
        reader = csv.reader(f)
        # Find indices from combined headers
        h1 = next(reader)
        h2 = next(reader)
        headers = [f"{a} {b}".strip() for a, b in zip(h1, h2)]
        
        idx_cpu = -1
        idx_gpu_temp = -1
        idx_gpu_pwr = -1
        idx_vram = -1
        
        for i, h in enumerate(headers):
            h_clean = h.replace('  ', ' ').strip()
            if "Total CPU Usage [%]" in h_clean: idx_cpu = i
            if "GPU Temperature [°C]" in h_clean: idx_gpu_temp = i
            if "GPU Power [W]" in h_clean: idx_gpu_pwr = i
            if "GPU Memory Allocated [MB]" in h_clean: idx_vram = i
        
        # Fallback for exact strings seen in raw dump if fuzzy fails
        if idx_gpu_temp == -1:
            for i, h in enumerate(headers):
                if "GPU Temperature" in h: idx_gpu_temp = i; break
        if idx_gpu_pwr == -1:
            for i, h in enumerate(headers):
                if "GPU Power" in h and "[W]" in h: idx_gpu_pwr = i; break
            
        print(f"Indices Found: CPU={idx_cpu}, GPU_T={idx_gpu_temp}, GPU_P={idx_gpu_pwr}, VRAM={idx_vram}")

        if -1 in [idx_cpu, idx_gpu_temp, idx_gpu_pwr, idx_vram]:
            print("Error: Could not find all required sensor columns in HWiNFO CSV.")
            return

        for row in reader:
            if not row or len(row) < max(idx_cpu, idx_gpu_temp, idx_gpu_pwr, idx_vram): continue
            log_time = parse_hwinfo_time(row[0], row[1])
            if not log_time: continue
            
            for task in target_tasks:
                if task["start"] <= log_time <= task["end"]:
                    try:
                        sample = {
                            "ts": log_time.isoformat() + "Z",
                            "gpu_temp": float(row[idx_gpu_temp]),
                            "gpu_power": float(row[idx_gpu_pwr]),
                            "vram_mb": float(row[idx_vram]),
                            "cpu_usage": float(row[idx_cpu])
                        }
                        task["samples"].append(sample)
                    except: continue

    for task in target_tasks:
        if task["samples"]:
            samples_path = os.path.join(task["path"], "samples.jsonl")
            with open(samples_path, "w", encoding="utf-8") as f:
                for s in task["samples"]:
                    f.write(json.dumps(s) + "\n")
            
            metrics_path = os.path.join(task["path"], "metrics.json")
            with open(metrics_path, "r") as f:
                m_data = json.load(f)
            
            m_data["hardware"] = {
                "gpu": {
                    "max_temp_c": max(s["gpu_temp"] for s in task["samples"]),
                    "max_power_w": max(s["gpu_power"] for s in task["samples"]),
                    "avg_power_w": sum(s["gpu_power"] for s in task["samples"]) / len(task["samples"])
                },
                "cpu": {
                    "max_usage_percent": max(s["cpu_usage"] for s in task["samples"])
                }
            }
            with open(metrics_path, "w") as f:
                json.dump(m_data, f, indent=4)
            print(f"Synced: {task['id']} ({len(task['samples'])} pts)")

if __name__ == "__main__":
    slice_hwinfo()
