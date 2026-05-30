import os
import subprocess
import time

MODELS = [
    "llama3.2:1b",
    "sushirl:latest",
    "qwen3.5:4b"
]

TASK = "tasks/L1_BASE/async_retry_ts.txt"
PAYLOAD = "ammunition/STRESS_TEST/payload_8k.txt"

def run_cmd(cmd):
    print(f"Executing: {cmd}")
    result = subprocess.run(["python"] + cmd.split(), capture_output=True, text=True, encoding="utf-8")
    print(result.stdout)
    if result.stderr:
        print(f"Error: {result.stderr}")
    return result

for model in MODELS:
    print(f"\n=== BATTLE ARENA: {model} ===")
    
    # 1. Run Orchestrator
    run_cmd(f"scripts/great_orchestrator.py {model} {TASK} {PAYLOAD}")
    
    # Find the output directory (results/model_name/task_id/run1)
    task_id = os.path.basename(TASK).replace(".txt", "")
    output_dir = os.path.join("results", model.replace(":", "_"), task_id, "run1")
    
    # 2. Slice HW Logs
    if os.path.exists(output_dir):
        run_cmd(f"scripts/slice_hw_logs.py {output_dir}")
        
        # 3. Generate Report
        run_cmd(f"scripts/generate_reports.py {output_dir}")

print("\n🏁 Battle Arena Demo Completed.")
