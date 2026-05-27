import json
import os
from datetime import datetime, timedelta

hml_path = "G:/covibe/HardwareMonitoring.hml"
base_benchmark_dir = "G:/covibe/benchmark"

def parse_hml_time(time_str):
    try:
        return datetime.strptime(time_str.strip(), "%d-%m-%Y %H:%M:%S")
    except:
        return None

def slice_logs():
    if not os.path.exists(hml_path):
        print("Error: HardwareMonitoring.hml not found!")
        return

    print("Reading HML Log...")
    log_lines = []
    header = ""
    # Use utf-8 for Afterburner HML (based on previous hex check)
    with open(hml_path, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            line = line.strip()
            if line.startswith("02,"): header = line + "\n"
            if line.startswith("80,"): log_lines.append(line + "\n")

    print(f"Loaded {len(log_lines)} data points.")

    for model_folder in os.listdir(base_benchmark_dir):
        model_path = os.path.join(base_benchmark_dir, model_folder)
        if not os.path.isdir(model_path) or model_folder in ["template", "example", "manifests", "ammunition", "tasks", "results"]: 
            continue
        
        for task_folder in os.listdir(model_path):
            task_path = os.path.join(model_path, task_folder)
            metrics_path = os.path.join(task_path, "metrics.json")
            
            if os.path.exists(metrics_path):
                # Using folder mtime as end time proxy
                end_time = datetime.fromtimestamp(os.path.getmtime(metrics_path))
                with open(metrics_path, "r") as f:
                    m_data = json.load(f)
                    duration = m_data.get("duration_seconds", m_data.get("time", 0))
                
                start_time = end_time - timedelta(seconds=duration)
                
                # Synthesis into samples.jsonl (EABS-01 requirement)
                samples = []
                for line in log_lines:
                    parts = line.split(",")
                    if len(parts) < 13: continue
                    log_time = parse_hml_time(parts[1])
                    
                    if log_time and start_time <= log_time <= end_time:
                        # Map to JSONL format
                        try:
                            sample = {
                                "ts": log_time.isoformat() + "Z",
                                "gpu_temp": float(parts[2]),
                                "vram_mb": float(parts[7]),
                                "gpu_power": float(parts[11]),
                                "fan_speed": float(parts[12]),
                                "cpu_usage": float(parts[32]) # CPU1 usage
                            }
                            samples.append(json.dumps(sample) + "\n")
                        except: continue
                
                if samples:
                    samples_out = os.path.join(task_path, "samples.jsonl")
                    with open(samples_out, "w", encoding="utf-8") as f:
                        f.writelines(samples)
                    
                    # Also save raw CSV for traces/
                    os.makedirs(os.path.join(task_path, "traces"), exist_ok=True)
                    with open(os.path.join(task_path, "traces", "hardware.csv"), "w", encoding="utf-8") as f:
                        f.write(header)
                        f.writelines([l for l in log_lines if start_time <= parse_hml_time(l.split(",")[1]) <= end_time])
                        
                    print(f"Slicing Done: {model_folder}/{task_folder} ({len(samples)} points)")

if __name__ == "__main__":
    slice_logs()
    print("\n🏆 Log Slicing Complete!")
