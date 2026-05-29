import os
import json
import subprocess
import requests
import time
import sys
import codecs

# Force UTF-8 for Windows Console (SOP 9.1)
if sys.platform == "win32":
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())

OLLAMA_HOST = "http://localhost:11434"

# CSB-01 Mission Matrix (Ref: BENCHMARK--Coding-Standard-Baselines.md)
CSB_01_MATRIX = [
    {"level": "L1_BASE", "task": "utility_deep_merge.txt", "payload": "payload_8k.txt"},
    {"level": "L2_LOGIC", "task": "algorithm_priority_queue.txt", "payload": "payload_8k.txt"},
    {"level": "L3_DOMAIN", "task": "covibe_yt_sync_logic.txt", "payload": "payload_8k.txt"},
    {"level": "L4_STRESS", "task": "refactor_large_component.txt", "payload": "payload_32k.txt"},
    {"level": "L5_INCIDENTS", "task": "debug_async_race_condition.txt", "payload": "payload_16k.txt"},
]

def unload_models():
    """SOP 5.4: Explicitly unload all models from VRAM."""
    print("🧹 [SAFETY] Unloading all models from VRAM...")
    try:
        tags_res = requests.get(f"{OLLAMA_HOST}/api/tags")
        if tags_res.status_code == 200:
            models = [m['name'] for m in tags_res.json().get('models', [])]
            for model in models:
                requests.post(f"{OLLAMA_HOST}/api/generate", json={"model": model, "keep_alive": 0})
        print("✅ VRAM Cleared.")
    except Exception as e:
        print(f"⚠️ Unload failed: {e}")

def run_cmd_capture(cmd_list, stdout_path, stderr_path):
    print(f"▶️ Executing: {' '.join(cmd_list)}")
    with open(stdout_path, "w", encoding="utf-8") as f_out, \
         open(stderr_path, "w", encoding="utf-8") as f_err:
        process = subprocess.Popen(
            cmd_list, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE, 
            text=True, 
            encoding="utf-8",
            bufsize=1
        )
        
        # Stream stdout to console and file
        for line in process.stdout:
            print(line, end="")
            f_out.write(line)
        
        # Capture stderr
        stderr_data = process.stderr.read()
        f_err.write(stderr_data)
        
        process.wait()
    return process.returncode

def execute_csb_01(model_name):
    print(f"\n{'='*60}")
    print(f"🚀 STARTING CSB-01 CAMPAIGN: {model_name}")
    print(f"{'='*60}\n")
    
    unload_models()
    
    model_safe_name = model_name.replace(":", "-").replace("/", "-")

    for entry in CSB_01_MATRIX:
        level = entry["level"]
        task_file = entry["task"]
        payload_file = entry["payload"]
        task_id = task_file.replace(".txt", "")
        
        # Target Run Directory (EABS-01 Standard)
        run_dir_name = f"{model_safe_name}-{task_id}"
        run_dir = os.path.join("benchmark-run", run_dir_name)
        artifacts_dir = os.path.join(run_dir, "artifacts")
        traces_dir = os.path.join(run_dir, "traces")
        
        os.makedirs(artifacts_dir, exist_ok=True)
        os.makedirs(traces_dir, exist_ok=True)

        task_path = os.path.join("benchmark-kits", "tasks", level, task_file)
        payload_path = os.path.join("benchmark-kits", "ammunition", "STRESS_TEST", payload_file)
        
        print(f"\n--- [ {level} ] Task: {task_id} ---")
        
        if not os.path.exists(task_path) or not os.path.exists(payload_path):
            print(f"⚠️ Missing files for {level}. Skipping.")
            continue

        # Paths for captured logs
        stdout_log = os.path.join(artifacts_dir, "runtime_stdout.log")
        stderr_log = os.path.join(artifacts_dir, "stderr.log")

        # Execute via great_orchestrator
        run_cmd_capture(["python", "scripts/great_orchestrator.py", model_name, task_path, payload_path], stdout_log, stderr_log)
        
        # Move generated files from 'results/' to 'benchmark-run/'
        # great_orchestrator default: results/<model_safe>/<task_id>/run1/
        model_results_key = model_name.replace(":", "_")
        source_dir = os.path.join("results", model_results_key, task_id, "run1")
        
        if os.path.exists(source_dir):
            import shutil
            # Move root files
            for f in ["metadata.json", "metrics.json", "samples.jsonl"]:
                src = os.path.join(source_dir, f)
                if os.path.exists(src):
                    shutil.move(src, os.path.join(run_dir, f))
            
            # Move artifacts
            src_artifacts = os.path.join(source_dir, "artifacts")
            if os.path.exists(src_artifacts):
                for f in os.listdir(src_artifacts):
                    shutil.move(os.path.join(src_artifacts, f), os.path.join(artifacts_dir, f))
            
            # Move traces
            src_traces = os.path.join(source_dir, "traces")
            if os.path.exists(src_traces):
                for f in os.listdir(src_traces):
                    shutil.move(os.path.join(src_traces, f), os.path.join(traces_dir, f))
            
            # Create additional stubs for EABS-01 compliance (Placeholder for monitoring session)
            open(os.path.join(artifacts_dir, "logs.txt"), 'a').close()
            open(os.path.join(artifacts_dir, "raw_hardware.hml"), 'a').close()
            if not os.path.exists(os.path.join(run_dir, "samples.jsonl")):
                open(os.path.join(run_dir, "samples.jsonl"), 'a').close()
            if not os.path.exists(os.path.join(traces_dir, "samples.jsonl")):
                open(os.path.join(traces_dir, "samples.jsonl"), 'a').close()
            
            print(f"📂 Structure finalized at: {run_dir}")
            shutil.rmtree(os.path.join("results", model_results_key))
        else:
            print(f"❌ Orchestrator failed for {task_id}")

        # SOP 7.3: Thermal Cooldown (Optimized to 60s)
        print("💤 [SAFETY] Thermal cooldown (60s)...")
        time.sleep(60)

    print(f"\n🏁 CSB-01 CAMPAIGN FINISHED: {model_name}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/run_csb_01.py <model_name>")
        sys.exit(1)
    execute_csb_01(sys.argv[1])
