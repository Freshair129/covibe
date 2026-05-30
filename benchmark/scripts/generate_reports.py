import os
import json
import sys
import codecs

# Force UTF-8 for Windows Console (SOP 3.2)
if sys.platform == "win32":
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())

REPORT_TEMPLATE = """# 📊 Task Report: {model_name}
**Task ID:** {task_id} | **Date:** {date}

### 1. Performance Overview
- **Throughput:** {avg_tps} tokens/sec (Avg)
- **Latency (Duration):** {duration} seconds
- **Total Tokens:** {input_tokens} (In) / {output_tokens} (Out) / {total_tokens} (Total)

### 2. Hardware Sustainability (RTX 3060)
- **Max Temperature:** {max_temp}°C (Limit: 71°C)
- **Avg Power Draw:** {avg_power} W
- **Max VRAM Usage:** {max_vram} MB / 12288 MB
- **Thermal Throttle:** {thermal_throttle}

### 3. Quality & Reasoning Analysis
- **Reasoning Tags Stripped:** {reasoning_stripped}
- **Status:** {status}

### 4. Raw Artifact Links
- [View Raw Response](./artifacts/response.txt)
- [View Purified Logic](./artifacts/purified_response.txt)
- [Detailed Telemetry](./traces/samples.jsonl)
"""

def generate_report(output_dir):
    metrics_path = os.path.join(output_dir, "metrics.json")
    metadata_path = os.path.join(output_dir, "metadata.json")
    
    if not os.path.exists(metrics_path) or not os.path.exists(metadata_path):
        return

    with open(metrics_path, 'r', encoding='utf-8') as f:
        metrics = json.load(f)
    with open(metadata_path, 'r', encoding='utf-8') as f:
        meta = json.load(f)

    gpu = metrics.get("gpu", {})
    
    report_content = REPORT_TEMPLATE.format(
        model_name=meta.get("model", "Unknown"),
        task_id=meta.get("task", "Unknown"),
        date=meta.get("started_at", "")[:10],
        avg_tps=metrics.get("avg_tps", 0),
        duration=metrics.get("duration", 0),
        input_tokens=meta.get("tokens_input", 0),
        output_tokens=meta.get("tokens_output", 0),
        total_tokens=metrics.get("total_tokens", 0),
        max_temp=gpu.get("max_temp_c", "N/A"),
        avg_power=gpu.get("avg_power_w", "N/A"),
        max_vram=gpu.get("max_vram_mb", "N/A"),
        thermal_throttle="YES 🔴" if metrics.get("thermal_throttle") else "NO 🟢",
        reasoning_stripped="Yes (RL Model)" if "<think>" in open(os.path.join(output_dir, "artifacts", "response.txt"), "r", encoding="utf-8").read() else "No",
        status="Completed ✅"
    )

    with open(os.path.join(output_dir, "REPORT.md"), "w", encoding="utf-8") as f:
        f.write(report_content)
    
    print(f"📄 Generated report for {meta.get('model')} in {output_dir}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        # Auto-discover results
        results_root = "results"
        for root, dirs, files in os.walk(results_root):
            if "metrics.json" in files and "metadata.json" in files:
                generate_report(root)
    else:
        generate_report(sys.argv[1])
