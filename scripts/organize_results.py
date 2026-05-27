import json
import os
import re
import sys
from datetime import datetime

def sanitize_name(name):
    return re.sub(r'[:/]', '-', name).lower()

def organize(file_path):
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    with open(file_path, "r", encoding="utf-8") as f:
        results = json.load(f)

    base_dir = "G:/covibe/benchmark"
    
    # Determine default model from filename if possible
    default_model = "unknown"
    if "llama" in file_path.lower(): default_model = "llama3.2-1b"

    for ctx_key, round_results in results.items():
        for res in round_results:
            if not res or res.get("status") != "success":
                continue
            
            # Smart metadata extraction
            model_raw = res.get("model", default_model)
            model_name = sanitize_name(model_raw)
            level = res.get("level", "UNKNOWN")
            
            task_id = f"TASK-{ctx_key}-{level}"
            target_dir = os.path.join(base_dir, model_name, task_id)
            os.makedirs(os.path.join(target_dir, "artifacts"), exist_ok=True)
            
            # 1. metadata.json
            metadata = {
                "benchmark_id": f"bench_{datetime.now().strftime('%Y%m%d_%H%M')}",
                "model": { 
                    "name": model_raw, 
                    "context": ctx_key,
                    "task_level": level,
                    "task_path": res.get("task_path")
                },
                "runtime": { "runtime": "ollama", "version": "0.24.0" }
            }
            with open(os.path.join(target_dir, "metadata.json"), "w", encoding="utf-8") as f:
                json.dump(metadata, f, indent=4)

            # 2. metrics.json
            metrics = {
                "status": "completed",
                "throughput": { "avg_tps": res.get("tps") },
                "duration_seconds": res.get("time")
            }
            with open(os.path.join(target_dir, "metrics.json"), "w", encoding="utf-8") as f:
                json.dump(metrics, f, indent=4)
            
            # 3. Artifacts
            response = res.get("response", res.get("content_preview", ""))
            if response:
                with open(os.path.join(target_dir, "artifacts", "response.txt"), "w", encoding="utf-8") as f:
                    f.write(response)
                
                # Create purified response (EABS-01 requirement)
                purified = re.sub(r"<think>.*?</think>", "", response, flags=re.DOTALL).strip()
                with open(os.path.join(target_dir, "artifacts", "purified_response.txt"), "w", encoding="utf-8") as f:
                    f.write(purified)

            print(f"Enterprise Organized: {model_name}/{task_id}")

if __name__ == "__main__":
    target_file = sys.argv[1] if len(sys.argv) > 1 else "G:/covibe/benchmark_results_parallel.json"
    organize(target_file)
    print("\n🏆 Result Organization Complete!")
