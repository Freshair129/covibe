import json
import os
from datetime import datetime, timedelta

hml_path = "G:/covibe/HardwareMonitoring.hml"
base_benchmark_dir = "G:/covibe/benchmark"

# ฟังก์ชันแปลงเวลาจาก HML (26-05-2026 14:03:22) เป็น datetime object
def parse_hml_time(time_str):
    try:
        return datetime.strptime(time_str.strip(), "%d-%m-%Y %H:%M:%S")
    except:
        return None

def slice_logs():
    if not os.path.exists(hml_path):
        print("Error: HardwareMonitoring.hml not found!")
        return

    # อ่านข้อมูล HML ทั้งหมดเก็บไว้ก่อน
    print("Reading HML Log...")
    log_lines = []
    header = ""
    with open(hml_path, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            line = line.strip()
            if line.startswith("02,"): # Header row
                header = line + "\n"
            if line.startswith("80,"): # Data row
                log_lines.append(line + "\n")

    print(f"Loaded {len(log_lines)} data points.")

    # วนลูปตามโฟลเดอร์โมเดลและ Task
    for model_folder in os.listdir(base_benchmark_dir):
        model_path = os.path.join(base_benchmark_dir, model_folder)
        if not os.path.isdir(model_path): continue
        
        for task_folder in os.listdir(model_path):
            task_path = os.path.join(model_path, task_folder)
            metrics_path = os.path.join(task_path, "metrics.json")
            
            if os.path.exists(metrics_path):
                # ใช้เวลาแก้ไขไฟล์ล่าสุดเป็นเวลาจบงาน
                end_time = datetime.fromtimestamp(os.path.getmtime(metrics_path))
                with open(metrics_path, "r") as f:
                    m_data = json.load(f)
                    duration = m_data.get("time", 0)
                
                start_time = end_time - timedelta(seconds=duration)
                
                # สกัด Log เฉพาะช่วงเวลา
                extracted_data = [header] if header else []
                for line in log_lines:
                    parts = line.split(",")
                    timestamp_str = parts[1]
                    log_time = parse_hml_time(timestamp_str)
                    
                    if log_time and start_time <= log_time <= end_time:
                        extracted_data.append(line)
                
                if len(extracted_data) > 1:
                    csv_out = os.path.join(task_path, "hardware_telemetry.csv")
                    with open(csv_out, "w", encoding="utf-8") as f:
                        f.writelines(extracted_data)
                    print(f"Saved: {model_folder}/{task_folder} ({len(extracted_data)-1} points)")

slice_logs()
print("\n🏆 Log Slicing Complete!")
