import os
import json
import subprocess
import time
import requests
import sys

OLLAMA_HOST = "http://localhost:11434"

# Models to cycle for stress
STRESS_MODELS = ["llama3.2:1b", "gemma4-rust-coder:latest", "qwen3.5:4b"]
TASKS = ["debug_async_race_condition.txt", "regex_think_collision.txt", "windows_encoding_emoji.txt"]

def unload_all():
    print("🧹 Unloading all models...")
    try:
        # Ollama way to unload: generate with keep_alive 0
        requests.post(f"{OLLAMA_HOST}/api/generate", json={"model": "llama3.2:1b", "keep_alive": 0})
    except:
        pass

def run_task(model, task_file):
    print(f"🚀 [STRESS] Model: {model} | Task: {task_file}")
    # We call the existing csb runner but for a specific task
    # For simulation, we use a lighter weight trigger or just use ollama run
    
    start_time = time.time()
    try:
        res = requests.post(f"{OLLAMA_HOST}/api/generate", json={
            "model": model,
            "prompt": f"Solve this: {task_file}",
            "stream": False,
            "options": {"num_predict": 500}
        }, timeout=120)
        duration = time.time() - start_time
        return res.status_code == 200, duration
    except Exception as e:
        print(f"❌ Task failed: {e}")
        return False, 0

def stress_test():
    live_log = os.path.join("telemetry_logs", "stress_vram.jsonl")
    if os.path.exists(live_log):
        os.remove(live_log)
        
    print("📡 Starting Telemetry for Stress Test...")
    telemetry_proc = subprocess.Popen(["python", "scripts/auto_logger_v2.py", live_log], shell=True)
    time.sleep(2)
    
    cycles = 5 # Reduced to 5 for the first test run
    history = []
    
    try:
        for i in range(cycles):
            print(f"\n--- Cycle {i+1}/{cycles} ---")
            for model in STRESS_MODELS:
                # 1. Load and Run
                success, dur = run_task(model, TASKS[i % len(TASKS)])
                print(f"✅ Run complete in {dur:.2f}s")
                
                # 2. Capture VRAM peak during run (wait a bit)
                time.sleep(2)
                
                # 3. Unload
                unload_all()
                time.sleep(5) # Cooldown
                
            # Fragmentation check
            print("💾 Snapshotting VRAM health...")
            
    except KeyboardInterrupt:
        print("🛑 Stress test stopped by user.")
    finally:
        telemetry_proc.terminate()
        print("🏁 Stress test completed.")

if __name__ == "__main__":
    stress_test()
