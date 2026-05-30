import os
import json
import datetime
import csv
import sys
import codecs
import re
import io

# Force UTF-8 for Windows Console (SOP 3.2)
if sys.platform == "win32":
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())

def parse_iso(ts):
    """Parses ISO timestamp into timezone-aware UTC datetime."""
    if ts.endswith('Z'):
        ts = ts[:-1] + '+00:00'
    return datetime.datetime.fromisoformat(ts.strip())

def parse_hwinfo_separate(date_str, time_str):
    """Parses separate HWiNFO local Date and Time columns into timezone-aware UTC datetime."""
    time_str = time_str.replace(',', '.')
    try:
        time_parts = time_str.split('.')
        base_time = time_parts[0]
        frac = time_parts[1] if len(time_parts) > 1 else '0'
        frac = (frac[:6]).ljust(6, '0')
        date_parts = re.split(r'[-./]', date_str.strip())
        d, m, y = int(date_parts[0]), int(date_parts[1]), int(date_parts[2])
        h_parts = base_time.split(':')
        hr, mn, sc = int(h_parts[0]), int(h_parts[1]), int(h_parts[2])
        naive_dt = datetime.datetime(y, m, d, hr, mn, sc, int(frac))
        # Convert local naive to UTC timezone-aware
        return naive_dt.astimezone().astimezone(datetime.timezone.utc)
    except Exception as e:
        return None

def slice_hwinfo(hwinfo_dir, start_iso, end_iso):
    """Parses HWiNFO CSV logs, slices by time, and returns (samples, raw_csv_content)."""
    start_dt = parse_iso(start_iso)
    end_dt = parse_iso(end_iso)
    
    samples = []
    raw_csv_content = ""
    
    if not os.path.exists(hwinfo_dir):
        return [], ""
        
    csv_files = [os.path.join(hwinfo_dir, f) for f in os.listdir(hwinfo_dir) if f.lower().endswith('.csv')]
    if not csv_files:
        return [], ""
        
    # Sort files by modification time (newest first)
    csv_files.sort(key=os.path.getmtime, reverse=True)
    
    for csv_path in csv_files:
        try:
            with open(csv_path, 'r', encoding='utf-8', errors='ignore') as f:
                reader = csv.reader(f)
                try:
                    headers = next(reader)
                except StopIteration:
                    continue
                
                # Check for separate Date and Time columns vs combined Date/Time
                idx_date = -1
                idx_time = -1
                idx_combined = -1
                
                idx_gpu_temp = -1
                idx_gpu_power = -1
                idx_gpu_vram = -1
                idx_cpu_usage = -1
                
                for i, h in enumerate(headers):
                    h_clean = h.lower().strip()
                    if h_clean == "date/time":
                        idx_combined = i
                    elif h_clean == "date":
                        idx_date = i
                    elif h_clean == "time":
                        idx_time = i
                    elif "gpu temperature" in h_clean or "gpu temp" in h_clean:
                        idx_gpu_temp = i
                    elif "gpu power" in h_clean:
                        idx_gpu_power = i
                    elif "gpu memory allocated" in h_clean or "memory allocated" in h_clean:
                        idx_gpu_vram = i
                    elif "total cpu usage" in h_clean or "cpu usage" in h_clean:
                        idx_cpu_usage = i
                
                # Fuzzy fallback mapping
                if idx_gpu_temp == -1 or idx_gpu_power == -1:
                    for i, h in enumerate(headers):
                        h_clean = h.lower().strip()
                        if idx_gpu_temp == -1 and "gpu temperature" in h_clean:
                            idx_gpu_temp = i
                        if idx_gpu_power == -1 and "gpu power" in h_clean:
                            idx_gpu_power = i
                            
                time_mapped = (idx_combined != -1) or (idx_date != -1 and idx_time != -1)
                if not time_mapped or idx_gpu_temp == -1 or idx_gpu_power == -1:
                    print(f"⚠️ Column mapping failed for {csv_path}. Headers: Combined={idx_combined}, Date={idx_date}, Time={idx_time}, GPU_Temp={idx_gpu_temp}, GPU_Power={idx_gpu_power}")
                    continue
                    
                print(f"ℹ️ Mapped headers for {os.path.basename(csv_path)}: Combined={idx_combined}, Date={idx_date}, Time={idx_time}, GPU_Temp={idx_gpu_temp}, GPU_Power={idx_gpu_power}, VRAM={idx_gpu_vram}, CPU={idx_cpu_usage}")
                
                max_mapped_idx = max(idx_combined, idx_date, idx_time, idx_gpu_temp, idx_gpu_power, idx_gpu_vram, idx_cpu_usage)
                
                matched_rows = [headers]
                file_samples = []
                
                for row in reader:
                    if not row or len(row) <= max_mapped_idx:
                        continue
                    
                    try:
                        if idx_combined != -1:
                            ts_str = row[idx_combined].strip()
                            log_dt = parse_iso(ts_str)
                        else:
                            date_str = row[idx_date].strip()
                            time_str = row[idx_time].strip()
                            log_dt = parse_hwinfo_separate(date_str, time_str)
                            
                        if not log_dt:
                            continue
                            
                        if start_dt <= log_dt <= end_dt:
                            sample = {
                                "ts": log_dt.isoformat(),
                                "gpu_temp": float(row[idx_gpu_temp]),
                                "gpu_power": float(row[idx_gpu_power]),
                                "gpu_util": 0, # HWiNFO mapping might need core util
                                "vram_mb": float(row[idx_gpu_vram]) if idx_gpu_vram != -1 else 0,
                                "cpu_usage": float(row[idx_cpu_usage]) if idx_cpu_usage != -1 else 0
                            }
                                
                            file_samples.append(sample)
                            matched_rows.append(row)
                    except:
                        continue
                        
                if file_samples:
                    samples.extend(file_samples)
                    # Reconstruct matching CSV rows
                    output = io.StringIO()
                    writer = csv.writer(output, lineterminator='\n')
                    writer.writerows(matched_rows)
                    raw_csv_content = output.getvalue()
                    break # Processed the active/newest log file with matches
                    
        except Exception as e:
            print(f"❌ Failed to parse HWiNFO CSV {csv_path}: {e}")
            continue
            
    # Sort and remove duplicate timestamps
    samples.sort(key=lambda s: s["ts"])
    unique_samples = []
    seen_ts = set()
    for s in samples:
        if s["ts"] not in seen_ts:
            unique_samples.append(s)
            seen_ts.add(s["ts"])
            
    return unique_samples, raw_csv_content

def slice_hml(hml_path, start_iso, end_iso):
    """Parses MSI Afterburner HML, slices by time, and returns (samples, raw_hml_content)."""
    start_dt = parse_iso(start_iso)
    end_dt = parse_iso(end_iso)
    
    samples = []
    raw_hml_content = ""
    
    if not os.path.exists(hml_path):
        print(f"⚠️ HML Log not found at {hml_path}")
        return samples, ""

    lines = []
    for enc in ['utf-16', 'utf-8-sig', 'latin-1']:
        try:
            with open(hml_path, 'r', encoding=enc) as f:
                lines = f.readlines()
            if lines: break
        except:
            continue
            
    if not lines:
        print(f"❌ Could not read HML file with any supported encoding.")
        return samples, ""

    data_start = -1
    hml_header_lines = []
    for i, line in enumerate(lines):
        hml_header_lines.append(line)
        if "[Data]" in line:
            data_start = i + 1
            if i > 0:
                header_line = lines[i-1].strip()
                header = [h.strip() for h in header_line.split(',')]
            break
            
    if data_start == -1 or not header:
        print("❌ Could not parse HML data structure.")
        return samples, ""

    try:
        gpu_temp_idx = header.index("GPU temperature")
        gpu_power_idx = header.index("GPU power")
        gpu_vram_idx = header.index("GPU memory usage")
    except ValueError:
        print("⚠️ Missing some hardware tags in HML. Check Afterburner settings.")
        return samples, ""

    matched_raw_lines = []
    for line in lines[data_start:]:
        cols = [c.strip() for c in line.split(',')]
        if len(cols) < len(header): continue
        
        try:
            log_dt_str = f"{cols[0]} {cols[1]}"
            log_dt = datetime.datetime.strptime(log_dt_str, "%d-%m-%Y %H:%M:%S").replace(tzinfo=datetime.timezone.utc)
            
            if start_dt <= log_dt <= end_dt:
                sample = {
                    "ts": log_dt.isoformat(),
                    "gpu_temp": float(cols[gpu_temp_idx]),
                    "gpu_power": float(cols[gpu_power_idx]),
                    "gpu_util": 0,
                    "vram_mb": float(cols[gpu_vram_idx]),
                    "cpu_usage": 0
                }
                samples.append(sample)
                matched_raw_lines.append(line)
        except:
            continue
            
    if samples:
        raw_hml_content = "".join(hml_header_lines) + "".join(matched_raw_lines)
        
    return samples, raw_hml_content

def update_metrics(out_dir, samples):
    """SOP 2.2: Aggregate telemetry into metrics.json summary (Genesis Match)."""
    metrics_path = os.path.join(out_dir, "metrics.json")
    if not os.path.exists(metrics_path) or not samples:
        return

    gpu_temps = [s["gpu_temp"] for s in samples if "gpu_temp" in s]
    gpu_powers = [s["gpu_power"] for s in samples if "gpu_power" in s]
    vrams = [s["vram_mb"] for s in samples if "vram_mb" in s]
    
    with open(metrics_path, 'r', encoding='utf-8') as f:
        metrics = json.load(f)
        
    metrics["gpu"] = {
        "max_temp_c": max(gpu_temps) if gpu_temps else 0,
        "avg_temp_c": round(sum(gpu_temps)/len(gpu_temps), 1) if gpu_temps else 0.0,
        "max_power_w": max(gpu_powers) if gpu_powers else 0,
        "avg_power_w": round(sum(gpu_powers)/len(gpu_powers), 1) if gpu_powers else 0.0,
        "max_vram_mb": max(vrams) if vrams else 0,
        "avg_vram_mb": round(sum(vrams)/len(vrams), 1) if vrams else 0.0
    }
    
    # Calculate efficiency
    tokens_out = metrics.get("tokens", {}).get("output", 0)
    avg_power = metrics["gpu"]["avg_power_w"]
    duration = metrics.get("duration_seconds", 1)
    
    if tokens_out > 0 and avg_power > 0:
        total_joules = avg_power * duration
        metrics["efficiency"] = {
            "tokens_per_watt": round(tokens_out / avg_power, 2),
            "joules_per_token": round(total_joules / tokens_out, 2)
        }

    if any(t >= 88 for t in gpu_temps):
        print("🔥 WARNING: GPU reached 88°C during this run!")

    with open(metrics_path, 'w', encoding='utf-8') as f:
        json.dump(metrics, f, indent=2)

def slice_live_jsonl(jsonl_path, start_iso, end_iso):
    """Parses the auto_logger_v2.py JSONL output and maps to Genesis schema."""
    start_dt = parse_iso(start_iso)
    end_dt = parse_iso(end_iso)
    samples = []
    raw_content = ""
    
    if not os.path.exists(jsonl_path):
        return [], ""
        
    try:
        with open(jsonl_path, 'r', encoding='utf-8') as f:
            for line in f:
                raw_content += line
                try:
                    row = json.loads(line)
                    log_dt = parse_iso(row["ts"])
                    if start_dt <= log_dt <= end_dt:
                        # Map to Genesis/EABS Schema
                        samples.append({
                            "ts": row["ts"],
                            "gpu_temp": row.get("gpu_temp", 0),
                            "gpu_power": row.get("gpu_power_w", 0),
                            "gpu_util": row.get("gpu_util", 0),
                            "vram_mb": row.get("gpu_vram_mb", 0),
                            "cpu_usage": row.get("cpu_util", 0),
                            # Keep high-fidelity for raw but Genesis schema for samples.jsonl
                            "cpu_pkg_w": row.get("cpu_pkg_w", 0),
                            "cpu_pkg_v": row.get("cpu_pkg_v", 0)
                        })
                except:
                    continue
    except Exception as e:
        print(f"❌ Failed to parse live JSONL: {e}")
        
    return samples, raw_content

def slice_live_csv(csv_path, start_iso, end_iso):
    """Parses the auto_logger.py CSV output."""
    start_dt = parse_iso(start_iso)
    end_dt = parse_iso(end_iso)
    samples = []
    raw_content = ""
    
    if not os.path.exists(csv_path):
        return [], ""
        
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            raw_content = f.read()
            f.seek(0)
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    log_dt = parse_iso(row["ts"])
                    if start_dt <= log_dt <= end_dt:
                        samples.append({
                            "ts": log_dt.isoformat(),
                            "gpu_temp": float(row["gpu_temp"]),
                            "gpu_power": float(row["gpu_power"]),
                            "gpu_util": 0,
                            "vram_mb": float(row["gpu_vram"]),
                            "cpu_usage": float(row["cpu_usage"]) if row["cpu_usage"] else 0.0
                        })
                except:
                    continue
    except Exception as e:
        print(f"❌ Failed to parse live CSV: {e}")
        
    return samples, raw_content

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python slice_hw_logs.py <output_dir>")
        sys.exit(1)
        
    out_dir = sys.argv[1]
    meta_path = os.path.join(out_dir, "metadata.json")
    
    if not os.path.exists(meta_path):
        print(f"❌ Metadata not found in {out_dir}")
        sys.exit(1)
        
    with open(meta_path, 'r', encoding='utf-8') as f:
        meta = json.load(f)
    
    started_at = meta.get("started_at", meta.get("created_at"))
    ended_at = meta.get("ended_at", datetime.datetime.now(datetime.timezone.utc).isoformat())
    
    # Check metrics.json for ends_at
    metrics_path = os.path.join(out_dir, "metrics.json")
    if os.path.exists(metrics_path):
        with open(metrics_path, 'r', encoding='utf-8') as f:
            m_data = json.load(f)
            started_at = m_data.get("started_at", started_at)
            ended_at = m_data.get("ended_at", ended_at)

    samples = []
    raw_hw_content = ""
    source_type = "none"

    # Priority 1: Live Hardware Log (v2 JSONL)
    live_log = os.path.join("telemetry_logs", "live_hardware.jsonl")
    if os.path.exists(live_log):
        print(f"🔍 Checking Live Hardware JSONL: {live_log}...")
        samples, raw_hw_content = slice_live_jsonl(live_log, started_at, ended_at)
        if samples:
            source_type = "jsonl"

    # Priority 2: Old Live CSV
    if not samples:
        live_log_csv = os.path.join("telemetry_logs", "live_hardware.csv")
        if os.path.exists(live_log_csv):
            samples, raw_hw_content = slice_live_csv(live_log_csv, started_at, ended_at)
            if samples: source_type = "live_csv"

    # Priority 3: HWiNFO
    if not samples:
        hwinfo_dir = os.path.join("telemetry_logs", "HWiNFO")
        if os.path.exists(hwinfo_dir):
            print(f"🔍 Checking HWiNFO CSV logs in {hwinfo_dir}...")
            samples, raw_hw_content = slice_hwinfo(hwinfo_dir, started_at, ended_at)
            if samples:
                source_type = "hwinfo"
        
    # Priority 4: MSI Afterburner
    if not samples:
        print("ℹ️ Falling back to MSI Afterburner HML...")
        hml_log = os.path.join("telemetry_logs", "MSI Afterburner", "HardwareMonitoring.hml")
        samples, raw_hw_content = slice_hml(hml_log, started_at, ended_at)
        if samples:
            source_type = "hml"
        
    if samples:
        traces_dir = os.path.join(out_dir, "traces")
        os.makedirs(traces_dir, exist_ok=True)
        
        samples_out_root = os.path.join(out_dir, "samples.jsonl")
        samples_out_traces = os.path.join(traces_dir, "samples.jsonl")
        
        for path in [samples_out_root, samples_out_traces]:
            with open(path, 'w', encoding='utf-8') as f:
                for s in samples:
                    f.write(json.dumps(s) + "\n")
                    
        # Archive raw hardware telemetry to artifacts
        artifacts_dir = os.path.join(out_dir, "artifacts")
        os.makedirs(artifacts_dir, exist_ok=True)
        
        if source_type == "jsonl":
            raw_out_path = os.path.join(artifacts_dir, "raw_hardware.jsonl")
        elif source_type == "live_csv" or source_type == "hwinfo":
            raw_out_path = os.path.join(artifacts_dir, "raw_hardware.csv")
        else:
            raw_out_path = os.path.join(artifacts_dir, "raw_hardware.hml")
            
        if raw_hw_content:
            with open(raw_out_path, 'w', encoding='utf-8') as f:
                f.write(raw_hw_content)
            print(f"📁 Archived sliced raw hardware log to {raw_out_path}")
                    
        update_metrics(out_dir, samples)
        print(f"📊 Sliced {len(samples)} hardware samples ({source_type}) into samples.jsonl")
    else:
        print("⚠️ No telemetry samples were found/sliced.")
