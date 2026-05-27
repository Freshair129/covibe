import json
import os
import re

# Load parallel results
with open("G:/covibe/benchmark_results_parallel.json", "r", encoding="utf-8") as f:
    results = json.load(f)

base_dir = "G:/covibe/benchmark"

def sanitize_name(name):
    return re.sub(r'[:/]', '-', name).lower()

for ctx_key, round_results in results.items():
    task_id = f"TASK-{ctx_key}"
    
    for res in round_results:
        if not res or res.get("status") != "success":
            continue
            
        model_name = sanitize_name(res["model"])
        target_dir = os.path.join(base_dir, model_name, task_id)
        os.makedirs(os.path.join(target_dir, "artifacts"), exist_ok=True)
        
        # 1. metadata.json (Environment Info)
        metadata = {
            "benchmark_id": f"bench_{datetime.now().strftime('%Y%m%d_%H%M')}",
            "model": { "name": res["model"], "context": ctx_key },
            "runtime": { "runtime": "ollama", "version": "0.24.0" }
        }
        with open(os.path.join(target_dir, "metadata.json"), "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=4)

        # 2. metrics.json (Summary)
        metrics = {
            "status": "completed",
            "throughput": { "avg_tps": res.get("tps") },
            "duration_seconds": res.get("time")
        }
        with open(os.path.join(target_dir, "metrics.json"), "w", encoding="utf-8") as f:
            json.dump(metrics, f, indent=4)
            
        # 3. Save Artifacts
        if "content_preview" in res:
            with open(os.path.join(target_dir, "artifacts", "response_preview.txt"), "w", encoding="utf-8") as f:
                f.write(res["content_preview"])

        print(f"Enterprise Organized: {model_name}/{task_id}")

print("\n🏆 Result Organization Complete!")
