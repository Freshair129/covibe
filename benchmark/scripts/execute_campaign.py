import os
import json
import subprocess
import requests
import time
import sys
import codecs
from datetime import datetime

OLLAMA_HOST = "http://localhost:11434"

# Mission Matrix Mapping (SOP & Battle Arena Spec)
MISSION_MATRIX = [
    {"level": "L1_BASE", "task": "async_retry_ts.txt", "payload": "payload_8k.txt"},
    {"level": "L2_LOGIC", "task": "circuit_breaker_ts.txt", "payload": "payload_16k.txt"},
    {"level": "L3_DOMAIN", "task": "vitest_unit_test_gen.txt", "payload": "payload_16k.txt"},
    {"level": "L4_STRESS", "task": "reasoning_stress_test.txt", "payload": "payload_32k.txt"},
    {"level": "L5_INCIDENTS", "task": "csp_eval_block.txt", "payload": "payload_8k.txt"},
    {"level": "L5_INCIDENTS", "task": "regex_think_collision.txt", "payload": "payload_8k.txt"},
    {"level": "L5_INCIDENTS", "task": "windows_encoding_emoji.txt", "payload": "payload_8k.txt"},
]

def unload_models():
    """Explicitly unload all models from VRAM by setting keep_alive to 0."""
    print("🧹 Unloading all models from VRAM...")
    try:
        # Get list of running models
        tags_res = requests.get(f"{OLLAMA_HOST}/api/tags")
        if tags_res.status_code == 200:
            models = [m['name'] for m in tags_res.json().get('models', [])]
            for model in models:
                # Sending a request with keep_alive: 0 unloads the model
                requests.post(f"{OLLAMA_HOST}/api/generate", 
                             json={"model": model, "keep_alive": 0})
        print("✅ VRAM Cleared.")
    except Exception as e:
        print(f"⚠️ Unload failed: {e}")

def run_cmd(cmd_list):
    print(f"▶️ Executing: {' '.join(cmd_list)}")
    # Use Popen to stream output in real-time
    process = subprocess.Popen(
        ["python", "-u"] + cmd_list, 
        stdout=subprocess.PIPE, 
        stderr=subprocess.STDOUT, 
        text=True, 
        encoding="utf-8",
        bufsize=1
    )
    
    output = []
    for line in process.stdout:
        print(line, end="")
        output.append(line)
    
    process.wait()
    return "".join(output)

def run_campaign(model_name):
    print(f"\n{'='*60}")
    print(f"🏆 [EABS-01] STARTING CAMPAIGN: {model_name}")
    print(f"{'='*60}\n")
    
    unload_models()
    
    plan_path = "benchmark-run/sushirl-latest/RUN-260530-sushi-001/documents/RUN-260530-sushi-001-PLAN-SKILL_LIST.md"

    for entry in MISSION_MATRIX:
        task_path = os.path.join("benchmark-kits", "tasks", entry["level"], entry["task"])
        payload_path = os.path.join("benchmark-kits", "ammunition", "STRESS_TEST", entry["payload"])
        task_id = entry["task"].replace(".txt", "")
        
        # EABS-01 Section 17: Multi-run Execution (N=3 for L1-L3)
        num_runs = 3 if entry["level"] in ["L1_BASE", "L2_LOGIC", "L3_DOMAIN"] else 1
        
        print(f"\n--- Round: {entry['level']} | Task: {task_id} | Runs: {num_runs} ---")
        
        for i in range(1, num_runs + 1):
            run_id = f"RUN-{datetime.now().strftime('%y%m%d')}-{task_id[:5]}-{i:03d}"
            print(f"▶️ Sub-run {i}/{num_runs}: {run_id}")
            
            # 1. Execute Benchmark
            run_dir = run_benchmark(model_name, task_path, payload_path, run_id=run_id, plan_path=plan_path)
            
            if run_dir:
                # 2. Slice Telemetry (Legacy scripts expect this, but great_orchestrator handles samples.jsonl now)
                # run_cmd(["scripts/slice_hw_logs.py", run_dir])
                
                # 3. Verify Compliance (MANDATORY)
                print(f"🧪 Verifying Compliance for {run_id}...")
                verify_res = subprocess.run(["python", "scripts/verify_eabs_structure.py", run_dir], capture_output=True, text=True, encoding="utf-8")
                print(verify_res.stdout)
                
                # 4. Generate Report
                run_cmd(["scripts/generate_reports.py", run_dir])
            else:
                print(f"❌ Run {run_id} failed.")

    print(f"\n🏁 CAMPAIGN FINISHED: {model_name}")

# Import run_benchmark from great_orchestrator
import great_orchestrator
from great_orchestrator import run_benchmark, unload_models

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python execute_campaign.py <model_name>")
        sys.exit(1)
    
    target_model = sys.argv[1]
    run_campaign(target_model)
