import os
import json
import glob
import numpy as np
from datetime import datetime

def generate_summary():
    base_dir = "benchmark-run/sushirl-latest"
    output_path = "ui/data/sushirl_summary.json"
    
    # Levels to track
    levels = ["L1_BASE", "L2_LOGIC", "L3_DOMAIN", "L4_STRESS", "L5_INCIDENTS"]
    summary = {
        "model_name": "sushirl:latest",
        "campaign_id": "RUN-260530-SUSHI-SKILL-01",
        "timestamp": datetime.now().isoformat(),
        "overall_status": "PENDING",
        "stats": {}
    }
    
    all_metrics_files = glob.glob(os.path.join(base_dir, "**", "metrics.json"), recursive=True)
    
    # Group by level based on directory names or metadata
    level_data = {l: [] for l in levels}
    
    for metrics_path in all_metrics_files:
        with open(metrics_path, 'r', encoding='utf-8') as f:
            m = json.load(f)
            # Infer level from path
            path_parts = metrics_path.split(os.sep)
            # Find which level this run belongs to
            found_level = "UNKNOWN"
            if "async" in metrics_path: found_level = "L1_BASE"
            elif "circu" in metrics_path: found_level = "L2_LOGIC"
            elif "vites" in metrics_path: found_level = "L3_DOMAIN"
            elif "reaso" in metrics_path: found_level = "L4_STRESS"
            elif "regex" in metrics_path or "csp" in metrics_path or "windo" in metrics_path: found_level = "L5_INCIDENTS"
            
            if found_level in level_data:
                level_data[found_level].append({
                    "tps": m.get("throughput", {}).get("avg_tps", 0),
                    "passed": m.get("quality", {}).get("passed", False),
                    "temp": m.get("gpu", {}).get("max_temp_c", 0)
                })

    # Calculate statistics per level
    passed_count = 0
    for level in levels:
        data = level_data[level]
        if not data:
            summary["stats"][level] = {"status": "SKIPPED", "mean_tps": 0, "variance": 0}
            continue
            
        tps_list = [d["tps"] for d in data]
        mean_tps = np.mean(tps_list)
        std_tps = np.std(tps_list)
        cv = (std_tps / mean_tps) if mean_tps > 0 else 0
        
        all_passed = all([d["passed"] for d in data])
        if all_passed: passed_count += 1
        
        summary["stats"][level] = {
            "status": "PASS" if all_passed else "FAIL",
            "runs": len(data),
            "mean_tps": round(float(mean_tps), 2),
            "cv": round(float(cv), 4),
            "max_temp": int(max([d["temp"] for d in data]))
        }

    summary["overall_status"] = "APPROVED" if passed_count == len(levels) else "REVIEW_REQUIRED"
    summary["completion_pct"] = round((passed_count / len(levels)) * 100, 0)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2)
    
    print(f"✅ Campaign Summary generated: {output_path}")

if __name__ == "__main__":
    generate_summary()
