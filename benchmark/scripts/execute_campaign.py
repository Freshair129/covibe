import os
import json
import subprocess
import requests
import time
import sys
import codecs

# Force UTF-8 for Windows Console
if sys.platform == "win32":
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())

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
    print(f"🏆 STARTING CAMPAIGN: {model_name}")
    print(f"{'='*60}\n")
    
    unload_models()
    
    for entry in MISSION_MATRIX:
        task_path = os.path.join("tasks", entry["level"], entry["task"])
        payload_path = os.path.join("ammunition", "STRESS_TEST", entry["payload"])
        task_id = entry["task"].replace(".txt", "")
        
        print(f"\n--- Round: {entry['level']} | Task: {task_id} ---")
        
        if not os.path.exists(task_path) or not os.path.exists(payload_path):
            print(f"⚠️ Missing file: {task_path} or {payload_path}")
            continue

        # 1. Execute Benchmark
        run_cmd(["scripts/great_orchestrator.py", model_name, task_path, payload_path])
        
        # 2. Slice Telemetry
        output_dir = os.path.join("results", model_name.replace(":", "_"), task_id, "run1")
        if os.path.exists(output_dir):
            run_cmd(["scripts/slice_hw_logs.py", output_dir])
            
            # 3. Generate Report
            run_cmd(["scripts/generate_reports.py", output_dir])
        else:
            print(f"❌ Output directory not found: {output_dir}")

    print(f"\n🏁 CAMPAIGN FINISHED: {model_name}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python execute_campaign.py <model_name>")
        sys.exit(1)
    
    target_model = sys.argv[1]
    run_campaign(target_model)
